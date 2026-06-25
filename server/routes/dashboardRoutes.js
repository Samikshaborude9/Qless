import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/stats", protect, adminOnly, getDashboardStats);

export default router;
