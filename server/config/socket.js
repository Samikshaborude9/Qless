// config/socket.js
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Middleware — authenticate socket connection via JWT
  // config/socket.js — update the auth middleware only
io.use(async (socket, next) => {
  try {
    // Check auth object first, then headers as fallback
    let token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization ||
      socket.handshake.headers?.auth;

    if (!token) {
      return next(new Error("Authentication error, no token"));
    }

    // Remove "Bearer " prefix if present
    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new Error("Authentication error, user not found"));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Authentication error, invalid token"));
  }
});

  io.on("connection", (socket) => {
    const user = socket.user;
    console.log(`🔌 Connected: ${user.name} (${user.role}) — ${socket.id}`);

    if (user.role === "admin") {
      socket.join("adminRoom");
      console.log(`${user.name} joined adminRoom`);
    }

    if (user.role === "server") {
      socket.join("serverRoom");
      console.log(`${user.name} joined serverRoom`);
    }

    if (user.role === "student") {
      socket.join(`student:${user._id}`);
      console.log(`${user.name} joined student:${user._id}`);
    }

    socket.on("join:occupancy", () => {
      socket.join("occupancyRoom");
    });

    //  disconnect is INSIDE io.on("connection")
    socket.on("disconnect", () => {
      console.log(`Disconnected: ${user.name} — ${socket.id}`);
    });
  }); // ← closing io.on("connection")

  return io;
};