// routes/authRoutes.js
import express from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
  createStaffAccount,
} from "../controllers/authController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import { loginLimiter, registerLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.get("/me", protect, getMe);
router.put("/update-profile", protect, updateProfile);
router.post("/create-staff", protect, adminOnly, createStaffAccount);

export default router;
