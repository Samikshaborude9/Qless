// src/pages/student/Dashboard.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import useSocket from "../../hooks/useSocket";
import { getLiveOccupancyAPI, getMyOrdersAPI } from "../../api/orderAPI";
import { getMenuAPI } from "../../api/menuAPI";
import { formatPrice } from "../../lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "../../components/common/Icon";
import { Plus, Flame, Clock } from "lucide-react";
import { toast } from "sonner";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&q=80";

const Dashboard = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { on, off } = useSocket();
  const navigate = useNavigate();

  const [occupancy, setOccupancy] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [occupancyData, menuData, ordersData] = await Promise.all([
          getLiveOccupancyAPI(),
          getMenuAPI({ available: true }),
          getMyOrdersAPI(),
        ]);
        setOccupancy(occupancyData.occupancy);
        setFeaturedItems(menuData.menuItems?.slice(0, 8) || []);
        setRecentOrders(ordersData.orders || []);
      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Real-time socket listeners
  useEffect(() => {
    on("occupancy:update", (data) => setOccupancy(data));
    on("order:statusUpdate", (data) => {
      toast.info(`Order status updated to: ${data.status.replace("_", " ")}`);
      setRecentOrders((prev) =>
        prev.map((order) =>
          order._id === data.orderId
            ? { ...order, status: data.status }
            : order
        )
      );
    });
    return () => {
      off("occupancy:update");
      off("order:statusUpdate");
    };
  }, [on, off]);

  // Computed stats
  const totalOrders = recentOrders.length;
  const totalSpending = recentOrders.reduce(
    (sum, o) => sum + (o.totalAmount || 0),
    0
  );

  // Find most-ordered item
  const itemCounts = {};
  recentOrders.forEach((order) =>
    order.items?.forEach((item) => {
      itemCounts[item.name] = (itemCounts[item.name] || 0) + (item.quantity || 1);
    })
  );
  const favItem = Object.entries(itemCounts).sort(([, a], [, b]) => b - a)[0];

  const trending = featuredItems.slice(0, 3);
  const daily = featuredItems.slice(3, 7);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-58px)] bg-brand-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green" />
      </div>
    );
  }

  return (
    <div className="bg-brand-bg min-h-[calc(100vh-58px)] p-8">
      <div className="max-w-[1000px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-start mb-7"
        >
          <div>
            <h1 className="font-serif-display text-[32px] text-brand-text mb-1">
              Hi {user?.name?.split(" ")[0] ?? "there"} 👋
            </h1>
            <p className="text-[13px] text-brand-text-muted">
              {getGreeting()} — {getTimeSlot()}
            </p>
          </div>
          <Badge
            variant="outline"
            className="bg-brand-green-light text-brand-green border-brand-green-border rounded-full px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
            Inside Campus
          </Badge>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-9"
        >
          {/* Total Spending */}
          <Card className="py-5 shadow-none">
            <CardContent className="px-5 py-0">
              <p className="text-[10px] font-bold text-brand-text-faint tracking-wider mb-2">
                TOTAL SPENDING
              </p>
              {totalSpending > 0 ? (
                <>
                  <p className="font-serif-display text-[26px] text-brand-green leading-none">
                    {formatPrice(totalSpending)}
                  </p>
                  <p className="text-xs text-brand-text-muted mt-1">
                    Across {totalOrders} orders
                  </p>
                </>
              ) : (
                <p className="text-sm text-brand-text-faint">
                  No data available yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Total Orders */}
          <Card className="py-5 shadow-none">
            <CardContent className="px-5 py-0">
              <p className="text-[10px] font-bold text-brand-text-faint tracking-wider mb-2">
                TOTAL ORDERS
              </p>
              <p className="font-serif-display text-[26px] text-brand-green leading-none">
                {totalOrders}
              </p>
              <p className="text-xs text-brand-text-muted mt-1">
                Meals delivered
              </p>
            </CardContent>
          </Card>

          {/* Canteen Occupancy */}
          <Card className="py-5 shadow-none">
            <CardContent className="px-5 py-0">
              <p className="text-[10px] font-bold text-brand-text-faint tracking-wider mb-2">
                CANTEEN OCCUPANCY
              </p>
              {occupancy ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <p className="font-serif-display text-[26px] text-brand-green leading-none">
                      {occupancy.occupancyPercentage ?? 0}%
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold border-0 capitalize ${
                        occupancy.occupancyLevel === "low"
                          ? "bg-green-100 text-green-700"
                          : occupancy.occupancyLevel === "moderate"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {occupancy.occupancyLevel}
                    </Badge>
                  </div>
                  <div className="mt-2 h-1.5 bg-brand-green-light rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        occupancy.occupancyLevel === "low"
                          ? "bg-green-500"
                          : occupancy.occupancyLevel === "moderate"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${occupancy.occupancyPercentage ?? 0}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-brand-text-muted mt-1">
                    {occupancy.activeOrders} active orders
                  </p>
                </>
              ) : (
                <p className="text-sm text-brand-text-faint">
                  No data available yet
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Trending Now */}
        {trending.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-9"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-serif-display text-xl text-brand-text flex items-center gap-2">
                <Flame size={18} className="text-orange-500" /> Trending Now
              </h2>
              <Link
                to="/student/menu"
                className="text-[13px] font-semibold text-brand-green hover:underline"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {trending.map((item, i) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * i }}
                  className="bg-white border border-brand-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={item.image || FALLBACK_IMG}
                      alt={item.name}
                      className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-red-500 text-white rounded-full px-2 py-0.5 text-[10px] font-bold">
                      HOT
                    </span>
                  </div>
                  <div className="p-3.5">
                    <p className="font-serif-display text-[15px] text-brand-text mb-1">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-brand-text-faint mb-3 line-clamp-2">
                      {item.description || item.category || "Delicious campus food"}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[17px] text-brand-green">
                        {formatPrice(item.price)}
                      </span>
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-brand-green border-0 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-brand-green-dark transition-colors"
                      >
                        <Plus size={14} className="text-white" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Daily Curations */}
        {daily.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-9"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-serif-display text-xl text-brand-text">
                Daily Curations
              </h2>
              <div className="flex gap-2">
                {["ALL", "SNACKS", "BEVERAGES"].map((t, i) => (
                  <span
                    key={t}
                    className={`rounded-full px-3 py-1 text-[11px] font-bold cursor-pointer transition-colors ${
                      i === 0
                        ? "bg-brand-green text-white"
                        : "bg-brand-green-light text-brand-green border border-brand-green-border"
                    }`}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {daily.map((item, i) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * i }}
                  className="bg-white border border-brand-border rounded-xl overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={item.image || FALLBACK_IMG}
                      alt={item.name}
                      className="w-full h-28 object-cover"
                    />
                    <span className="absolute top-1.5 left-1.5 bg-brand-green text-white rounded-full px-2 py-0.5 text-[9px] font-bold">
                      {item.category?.toUpperCase() || "FRESH"}
                    </span>
                  </div>
                  <div className="p-2.5 px-3">
                    <p className="text-xs font-semibold text-brand-text mb-2">
                      {item.name}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[17px] text-brand-green">
                        {formatPrice(item.price)}
                      </span>
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-brand-green text-white border-0 rounded-full px-2.5 py-1 text-[11px] font-bold cursor-pointer hover:bg-brand-green-dark transition-colors"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* No items message */}
        {featuredItems.length === 0 && !loading && (
          <div className="text-center py-20 text-brand-text-faint">
            <p className="text-lg mb-4">No menu items available yet</p>
            <Link
              to="/student/menu"
              className="text-brand-green font-semibold hover:underline"
            >
              Browse Full Menu →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const getTimeSlot = () => {
  const hour = new Date().getHours();
  if (hour < 11) return "Breakfast Slot (8–11 AM)";
  if (hour < 15) return "Lunch Slot (12–2 PM)";
  if (hour < 18) return "Snacks Time (3–5 PM)";
  return "Dinner Slot (7–9 PM)";
};

export default Dashboard;
