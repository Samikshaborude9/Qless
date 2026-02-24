// services/couponService.js
import { nanoid } from "nanoid";
import Coupon from "../models/Coupon.js";

// Generate a unique coupon code
export const generateCouponCode = () => {
  return `QLESS-${nanoid(8).toUpperCase()}`;
};

// Create a coupon after successful payment
export const createCoupon = async (orderId, studentId, discountValue = 0, discountType = "flat") => {
  try {
    const code = generateCouponCode();

    // Coupon expires in 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const coupon = await Coupon.create({
      code,
      order: orderId,
      student: studentId,
      discountType,
      discountValue,
      expiresAt,
    });

    return coupon;
  } catch (error) {
    throw new Error(`Coupon creation failed: ${error.message}`);
  }
};

// Validate a coupon code
export const validateCoupon = async (code, studentId) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    return { valid: false, message: "Invalid coupon code" };
  }

  if (coupon.isUsed) {
    return { valid: false, message: "Coupon already used" };
  }

  if (new Date() > coupon.expiresAt) {
    return { valid: false, message: "Coupon has expired" };
  }

  if (coupon.student.toString() !== studentId.toString()) {
    return { valid: false, message: "Coupon does not belong to you" };
  }

  return { valid: true, coupon };
};

// Mark coupon as used
export const markCouponUsed = async (code) => {
  await Coupon.findOneAndUpdate(
    { code: code.toUpperCase() },
    { isUsed: true, usedAt: new Date() }
  );
};
