// routes/orderRoutes.js
import express from "express";
import {
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getReadyOrders,
  markPickedUp,
  getLiveOccupancy,
} from "../controllers/orderController.js";
import {
  protect,
  adminOnly,
  staffOnly,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public
router.get("/occupancy", getLiveOccupancy);

// Student
router.post("/", protect, placeOrder);
router.get("/my-orders", protect, getMyOrders);

// Admin
router.get("/", protect, adminOnly, getAllOrders);
router.patch("/:id/status", protect, adminOnly, updateOrderStatus);

// Server staff
router.get("/ready", protect, staffOnly, getReadyOrders);
router.patch("/:id/pickup", protect, staffOnly, markPickedUp);

export default router;
