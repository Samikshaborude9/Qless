// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!req.user.isActive) {
      return res.status(401).json({ message: "Account is deactivated" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

// Admin only
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied, admin only" });
  }
};

// Server (delivery staff) only
export const serverOnly = (req, res, next) => {
  if (req.user && req.user.role === "server") {
    next();
  } else {
    res.status(403).json({ message: "Access denied, server staff only" });
  }
};

// Admin or Server (staff)
export const staffOnly = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "server")) {
    next();
  } else {
    res.status(403).json({ message: "Access denied, staff only" });
  }
};
