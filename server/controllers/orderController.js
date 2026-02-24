// controllers/orderController.js
import Order from "../models/Order.js";
import MenuItem from "../models/MenuItem.js";
import { validateCoupon, markCouponUsed } from "../services/couponService.js";
import { calculateOccupancy } from "../utils/occupancyCalc.js";

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private/Student
export const placeOrder = async (req, res, next) => {
  try {
    const { items, couponCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No items in order",
      });
    }

    // Validate items and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: `Menu item not found: ${item.menuItem}`,
        });
      }

      if (!menuItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${menuItem.name} is currently unavailable`,
        });
      }

      if (menuItem.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${menuItem.name}`,
        });
      }

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
      });

      totalAmount += menuItem.price * item.quantity;
    }

    // Apply coupon if provided
    let discount = 0;
    if (couponCode) {
      const { valid, coupon, message } = await validateCoupon(
        couponCode,
        req.user._id
      );

      if (!valid) {
        return res.status(400).json({ success: false, message });
      }

      discount =
        coupon.discountType === "percentage"
          ? Math.round((totalAmount * coupon.discountValue) / 100)
          : coupon.discountValue;

      await markCouponUsed(couponCode);
    }

    const finalAmount = Math.max(totalAmount - discount, 0);

    // Calculate estimated prep time (max prepTime among items)
    const estimatedTime = await MenuItem.find({
      _id: { $in: orderItems.map((i) => i.menuItem) },
    }).then((items) => Math.max(...items.map((i) => i.prepTime)));

    // Create order
    const order = await Order.create({
      student: req.user._id,
      items: orderItems,
      totalAmount: finalAmount,
      discount,
      couponCode: couponCode || "",
      estimatedTime,
      status: "pending",
    });

    // Deduct stock
    for (const item of orderItems) {
      await MenuItem.findByIdAndUpdate(item.menuItem, {
        $inc: { stock: -item.quantity },
      });
    }

    // Emit new order to admin room via Socket.IO
    const io = req.app.locals.io;
    if (io) {
      io.to("adminRoom").emit("order:new", order);
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my orders (student)
// @route   GET /api/orders/my-orders
// @access  Private/Student
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ student: req.user._id })
      .populate("items.menuItem", "name image category")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    let filter = {};
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate("student", "name email")
      .populate("items.menuItem", "name image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (admin)
// @route   PATCH /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("student", "name email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const io = req.app.locals.io;
    if (io) {
      // Notify the specific student
      io.to(`student:${order.student._id}`).emit("order:statusUpdate", {
        orderId: order._id,
        status: order.status,
      });

      // If ready, notify server room
      if (status === "ready") {
        io.to("serverRoom").emit("order:nowReady", order);
      }
    }

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ready orders (server staff)
// @route   GET /api/orders/ready
// @access  Private/Staff
export const getReadyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ status: "ready" })
      .populate("student", "name email")
      .populate("items.menuItem", "name image")
      .sort({ createdAt: 1 }); // oldest first

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark order as picked up (server staff)
// @route   PATCH /api/orders/:id/pickup
// @access  Private/Staff
export const markPickedUp = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: "picked_up",
        pickedUpAt: new Date(),
        pickedUpBy: req.user._id,
      },
      { new: true }
    ).populate("student", "name email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Notify student
    const io = req.app.locals.io;
    if (io) {
      io.to(`student:${order.student._id}`).emit("order:statusUpdate", {
        orderId: order._id,
        status: "picked_up",
      });

      // Update occupancy for all students
      const occupancy = await calculateOccupancy();
      io.emit("occupancy:update", occupancy);
    }

    res.status(200).json({
      success: true,
      message: "Order marked as picked up",
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get live canteen occupancy
// @route   GET /api/orders/occupancy
// @access  Public
export const getLiveOccupancy = async (req, res, next) => {
  try {
    const occupancy = await calculateOccupancy();
    res.status(200).json({
      success: true,
      occupancy,
    });
  } catch (error) {
    next(error);
  }
};
