// routes/paymentRoutes.js
import express from "express";
import {
  createOrder,
  verifyPayment,
  webhookHandler,
} from "../controllers/paymentController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Webhook must use raw body — before express.json() parses it
router.post("/webhook", express.raw({ type: "application/json" }), webhookHandler);

// Student protected routes
router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);

export default router;
