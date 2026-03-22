// src/pages/student/Dashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import useSocket from "../../hooks/useSocket";
import { getLiveOccupancyAPI } from "../../api/orderAPI";
import { getMenuAPI } from "../../api/menuAPI";
import { getMyOrdersAPI } from "../../api/orderAPI";
import { formatPrice, getStatusColor, getOccupancyColor } from "../../lib/utils";
import {
  ShoppingBag,
  UtensilsCrossed,
  Users,
  ClipboardList,
  TrendingUp,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const { user } = useAuth();
  const { on, off } = useSocket();

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
        setFeaturedItems(menuData.menuItems.slice(0, 4));
        setRecentOrders(ordersData.orders.slice(0, 3));
      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Listen for real-time occupancy updates
  useEffect(() => {
    on("occupancy:update", (data) => {
      setOccupancy(data);
    });

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">Q</span>
            </div>
            <span className="font-bold text-xl">Qless</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/student/my-orders"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              My Orders
            </Link>
            <Link
              to="/student/menu"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Order Now
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold">
            Good {getGreeting()}, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            What would you like to eat today?
          </p>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Occupancy Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">
                Canteen Occupancy
              </span>
              <Users size={18} className="text-muted-foreground" />
            </div>
            <div
              className={`text-3xl font-bold ${getOccupancyColor(
                occupancy?.occupancyLevel
              )}`}
            >
              {occupancy?.occupancyPercentage ?? 0}%
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  occupancy?.occupancyLevel === "low"
                    ? "bg-green-500"
                    : occupancy?.occupancyLevel === "moderate"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${occupancy?.occupancyPercentage ?? 0}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 capitalize">
              {occupancy?.occupancyLevel} — {occupancy?.activeOrders} active
              orders
            </p>
          </motion.div>

          {/* Quick Order Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-primary text-primary-foreground rounded-2xl p-5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm opacity-80">Quick Order</span>
              <ShoppingBag size={18} className="opacity-80" />
            </div>
            <p className="text-sm opacity-80 mb-4">
              Browse menu and place your order in seconds
            </p>
            <Link
              to="/student/menu"
              className="bg-white text-primary rounded-lg px-4 py-2 text-sm font-medium text-center hover:bg-white/90 transition-colors"
            >
              Browse Menu →
            </Link>
          </motion.div>

          {/* Orders Count */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">
                Total Orders
              </span>
              <ClipboardList size={18} className="text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold">{recentOrders.length}</div>
            <Link
              to="/student/my-orders"
              className="text-xs text-primary hover:underline mt-2 inline-block"
            >
              View all orders →
            </Link>
          </motion.div>
        </div>

        {/* Featured Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <UtensilsCrossed size={20} />
              Featured Items
            </h2>
            <Link
              to="/student/menu"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {featuredItems.map((item, i) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i }}
                className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 bg-muted flex items-center justify-center">
                    <UtensilsCrossed
                      size={32}
                      className="text-muted-foreground"
                    />
                  </div>
                )}
                <div className="p-3">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <p className="text-primary font-bold text-sm mt-1">
                    {formatPrice(item.price)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {item.prepTime} mins
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp size={20} />
                Recent Orders
              </h2>
              <Link
                to="/student/my-orders"
                className="text-sm text-primary hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {order.items.map((i) => i.name).join(", ")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.items.length} item
                      {order.items.length > 1 ? "s" : ""} •{" "}
                      {formatPrice(order.totalAmount)}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
};

export default Dashboard;
