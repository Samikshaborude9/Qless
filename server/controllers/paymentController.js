// controllers/paymentController.js
import crypto from "crypto";
import Razorpay from "razorpay";
import Order from "../models/Order.js";
import { createCoupon } from "../services/couponService.js";
import { generateCouponWithQR } from "../utils/generateCoupon.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private/Student
export const createOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to pay for this order",
      });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalAmount * 100), // in paise
      currency: "INR",
      receipt: `receipt_${orderId}`,
      notes: {
        orderId: orderId,
        studentId: req.user._id.toString(),
      },
    });

    res.status(200).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payments/verify
// @access  Private/Student
export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } =
      req.body;

    // Verify signature
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .toString("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed, invalid signature",
      });
    }

    // Update order payment status
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentId: razorpayPaymentId,
        paymentStatus: "paid",
        status: "confirmed",
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Generate coupon for next order (5% discount)
    const coupon = await createCoupon(orderId, req.user._id, 5, "percentage");
    const couponWithQR = await generateCouponWithQR(coupon);

    // Notify admin via Socket.IO
    const io = req.app.locals.io;
    if (io) {
      io.to("adminRoom").emit("order:new", order);
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      order,
      coupon: couponWithQR,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Razorpay webhook handler
// @route   POST /api/payments/webhook
// @access  Public (Razorpay server)
export const webhookHandler = async (req, res, next) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(req.body))
      .toString("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = req.body.event;

    if (event === "payment.failed") {
      const paymentEntity = req.body.payload.payment.entity;
      const orderId = paymentEntity.notes.orderId;

      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: "failed",
        status: "cancelled",
      });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};