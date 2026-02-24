// utils/occupancyCalc.js
import Order from "../models/Order.js";

// Calculate live canteen occupancy based on active orders
export const calculateOccupancy = async () => {
  try {
    const capacity = parseInt(process.env.CANTEEN_CAPACITY) || 100;

    // Count orders that are active (not picked up or cancelled)
    const activeOrders = await Order.countDocuments({
      status: { $in: ["confirmed", "preparing", "ready"] },
    });

    // Each order represents one student in canteen
    const occupancyPercentage = Math.min(
      Math.round((activeOrders / capacity) * 100),
      100
    );

    let occupancyLevel;
    if (occupancyPercentage < 40) {
      occupancyLevel = "low";
    } else if (occupancyPercentage < 75) {
      occupancyLevel = "moderate";
    } else {
      occupancyLevel = "high";
    }

    return {
      activeOrders,
      capacity,
      occupancyPercentage,
      occupancyLevel,  // "low" | "moderate" | "high"
    };
  } catch (error) {
    throw new Error(`Occupancy calculation failed: ${error.message}`);
  }
};
