// controllers/authController.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// @desc    Register student or admin
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    let { name, email, password, role } = req.body;
    if (email) email = email.toLowerCase();

    // Only student and admin can self-register
    if (role === "server") {
      return res.status(403).json({
        success: false,
        message: "Server accounts can only be created by admin",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const user = await User.create({ name, email, password, role });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login all roles
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    let { email, password } = req.body;
    if (email) email = email.toLowerCase();

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated, contact admin",
      });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/update-profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, avatar },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create server/staff account (admin only)
// @route   POST /api/auth/create-staff
// @access  Private/Admin
export const createStaffAccount = async (req, res, next) => {
  try {
    let { name, email, password } = req.body;
    if (email) email = email.toLowerCase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "server",
    });

    res.status(201).json({
      success: true,
      message: "Staff account created successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with their order stats
// @route   GET /api/auth/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const students = await User.aggregate([
      { $match: { role: "student" } },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "student",
          as: "ordersList",
        },
      },
      {
        $project: {
          id: "$_id",
          name: 1,
          email: 1,
          orders: { $size: "$ordersList" },
          spent: {
            $reduce: {
              input: "$ordersList",
              initialValue: 0,
              in: {
                $add: ["$$value", { $ifNull: ["$$this.totalAmount", 0] }]
              },
            },
          },
          joined: "$createdAt",
          lastOrder: { $max: "$ordersList.createdAt" },
        },
      },
    ]);

    const now = new Date();
    const result = students.map((s) => ({
      ...s,
      active: s.lastOrder
        ? now.getTime() - new Date(s.lastOrder).getTime() < 30 * 24 * 60 * 60 * 1000
        : false,
    }));

    res.status(200).json({
      success: true,
      users: result,
    });
  } catch (error) {
    next(error);
  }
};
