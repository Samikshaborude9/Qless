import Order from "../models/Order.js";
import MenuItem from "../models/MenuItem.js";

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      todayOrdersList,
      unavailableItems,
      recentOrders
    ] = await Promise.all([
      // 1. All orders from today to calculate revenue and top items
      Order.find({ createdAt: { $gte: today } }).populate("student", "name email"),
      // 2. Unavailable menu items
      MenuItem.find({ isAvailable: false }).limit(3).select("name category isAvailable"),
      // 3. Recent 5 orders
      Order.find().sort({ createdAt: -1 }).limit(5).populate("student", "name email"),
    ]);

    let todayRevenue = 0;
    const dishCount = {};

    todayOrdersList.forEach(o => {
      // Calculate revenue
      const t = Number(o.totalAmount || o.total || 0);
      if (!isNaN(t) && t > 0) {
        todayRevenue += t;
      } else {
        const itemSum = (o.items || []).reduce((acc, i) => acc + Number(i.price || 0) * Number(i.quantity || i.qty || 1), 0);
        todayRevenue += itemSum;
      }

      // Calculate dish demand
      (o.items || []).forEach(i => {
        if (i.name) {
          const qty = Number(i.quantity || i.qty || 1);
          dishCount[i.name] = (dishCount[i.name] || 0) + qty;
        }
      });
    });

    // Top item and high demand
    const sortedDishes = Object.entries(dishCount).sort((a, b) => b[1] - a[1]);
    const topItem = sortedDishes.length > 0 ? sortedDishes[0] : null;
    const highDemand = sortedDishes.slice(0, 2).map(([name, count]) => ({
      name,
      pct: Math.min(99, Math.round((count / (topItem ? topItem[1] : 1)) * 100))
    }));

    const formattedRecentOrders = recentOrders.map(o => {
      const orderObj = o.toObject();
      orderObj.user = orderObj.student;
      return orderObj;
    });

    res.status(200).json({
      success: true,
      stats: {
        totalOrders: todayOrdersList.length,
        todayRevenue,
        topItem,
        highDemand,
        unavailableItems,
        recentOrders: formattedRecentOrders
      }
    });
  } catch (error) {
    next(error);
  }
};
