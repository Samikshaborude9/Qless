// routes/analyticsRoutes.js
import express from "express";
import {
  getOverview,
  getPopularDishes,
  getPeakHours,
  getRevenue,
  getFeedbackSummary,
} from "../controllers/analyticsController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All analytics routes are admin only
router.get("/overview", protect, adminOnly, getOverview);
router.get("/popular-dishes", protect, adminOnly, getPopularDishes);
router.get("/peak-hours", protect, adminOnly, getPeakHours);
router.get("/revenue", protect, adminOnly, getRevenue);
router.get("/feedback", protect, adminOnly, getFeedbackSummary);

export default router;
