// models/Order.js
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem",
    required: true,
  },
  name: String,      // snapshot at time of order
  price: Number,     // snapshot at time of order
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const orderSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "ready", "picked_up", "cancelled"],
      default: "pending",
    },

    // Payment
    paymentId: {
      type: String,
      default: "",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    // Coupon
    couponCode: {
      type: String,
      default: "",
    },
    discount: {
      type: Number,
      default: 0,
    },

    // Pickup
    pickedUpAt: {
      type: Date,
    },
    pickedUpBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // server role user
    },

    // Estimated ready time
    estimatedTime: {
      type: Number, // in minutes
      default: 15,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
