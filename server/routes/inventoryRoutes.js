// routes/inventoryRoutes.js
import express from "express";
import {
  getInventory,
  getLowStockItems,
  addIngredient,
  updateStock,
  deleteIngredient,
  updateThreshold,
} from "../controllers/inventoryController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, adminOnly, getInventory);
router.get("/low-stock", protect, adminOnly, getLowStockItems);
router.post("/", protect, adminOnly, addIngredient);
router.put("/:id", protect, adminOnly, updateStock);
router.delete("/:id", protect, adminOnly, deleteIngredient);
router.patch("/:id/threshold", protect, adminOnly, updateThreshold);

export default router;