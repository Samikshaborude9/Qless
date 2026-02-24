// routes/menuRoutes.js
import express from "express";
import {
  getMenu,
  getMenuItem,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateStock,
} from "../controllers/menuController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getMenu);
router.get("/:id", getMenuItem);

// Admin only routes
router.post("/", protect, adminOnly, addMenuItem);
router.put("/:id", protect, adminOnly, updateMenuItem);
router.delete("/:id", protect, adminOnly, deleteMenuItem);
router.patch("/:id/stock", protect, adminOnly, updateStock);

export default router;
