// controllers/analyticsController.js
import Order from "../models/Order.js";
import MenuItem from "../models/MenuItem.js";
import User from "../models/User.js";

// @desc    Get dashboard stats overview
// @route   GET /api/analytics/overview
// @access  Private/Admin
export const getOverview = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      todayOrders,
      pendingOrders,
      totalRevenue,
      todayRevenue,
      totalStudents,
      totalMenuItems,
    ] = await Promise.all([
      Order.countDocuments({ paymentStatus: "paid" }),
      Order.countDocuments({ createdAt: { $gte: today }, paymentStatus: "paid" }),
      Order.countDocuments({ status: { $in: ["confirmed", "preparing", "ready"] } }),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: "paid", createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      User.countDocuments({ role: "student" }),
      MenuItem.countDocuments({ isAvailable: true }),
    ]);

    res.status(200).json({
      success: true,
      overview: {
        totalOrders,
        todayOrders,
        pendingOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        todayRevenue: todayRevenue[0]?.total || 0,
        totalStudents,
        totalMenuItems,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get popular dishes
// @route   GET /api/analytics/popular-dishes
// @access  Private/Admin
export const getPopularDishes = async (req, res, next) => {
  try {
    const popularDishes = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.menuItem",
          name: { $first: "$items.name" },
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      success: true,
      popularDishes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get peak hours
// @route   GET /api/analytics/peak-hours
// @access  Private/Admin
export const getPeakHours = async (req, res, next) => {
  try {
    const peakHours = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          orderCount: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format hours for frontend chart
    const formatted = peakHours.map((h) => ({
      hour: `${h._id}:00`,
      orderCount: h.orderCount,
      revenue: h.revenue,
    }));

    res.status(200).json({
      success: true,
      peakHours: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get revenue by day (last 7 days)
// @route   GET /api/analytics/revenue
// @access  Private/Admin
export const getRevenue = async (req, res, next) => {
  try {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const revenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: last7Days },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          totalRevenue: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      revenue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get feedback summary
// @route   GET /api/analytics/feedback
// @access  Private/Admin
export const getFeedbackSummary = async (req, res, next) => {
  try {
    const feedbackSummary = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "order",
          as: "reviews",
        },
      },
      { $unwind: { path: "$reviews", preserveNullAndEmpty: true } },
      {
        $group: {
          _id: "$items.menuItem",
          name: { $first: "$items.name" },
          avgRating: { $avg: "$reviews.rating" },
          reviewCount: { $sum: 1 },
        },
      },
      { $sort: { avgRating: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      success: true,
      feedbackSummary,
    });
  } catch (error) {
    next(error);
  }
};
