// src/pages/admin/AnalyticsPage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  getOverviewAPI,
  getPopularDishesAPI,
  getPeakHoursAPI,
  getRevenueAPI,
} from "../../api/analyticsAPI";
import { formatPrice } from "../../lib/utils";
import {
  ArrowLeft,
  TrendingUp,
  ShoppingBag,
  Users,
  IndianRupee,
  BarChart2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";

const AnalyticsPage = () => {
  const [overview, setOverview] = useState(null);
  const [popularDishes, setPopularDishes] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [overviewData, dishesData, hoursData, revenueData] =
          await Promise.all([
            getOverviewAPI(),
            getPopularDishesAPI(),
            getPeakHoursAPI(),
            getRevenueAPI(),
          ]);
        setOverview(overviewData.overview);
        setPopularDishes(dishesData.popularDishes.slice(0, 5));
        setPeakHours(hoursData.peakHours);
        setRevenue(revenueData.revenue);
      } catch (error) {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const STAT_CARDS = [
    {
      label: "Total Orders",
      value: overview?.totalOrders ?? 0,
      icon: <ShoppingBag size={20} />,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total Revenue",
      value: formatPrice(overview?.totalRevenue ?? 0),
      icon: <IndianRupee size={20} />,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Total Students",
      value: overview?.totalStudents ?? 0,
      icon: <Users size={20} />,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Menu Items",
      value: overview?.totalMenuItems ?? 0,
      icon: <BarChart2 size={20} />,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link
            to="/admin/dashboard"
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-bold text-xl">Analytics</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-5"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}
              >
                {card.icon}
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{card.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h2 className="font-semibold mb-1 flex items-center gap-2">
            <TrendingUp size={18} />
            Revenue — Last 7 Days
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Daily revenue trend
          </p>

          {revenue.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              No revenue data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="_id"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(val) =>
                    new Date(val).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })
                  }
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  formatter={(val) => [`₹${val}`, "Revenue"]}
                  labelFormatter={(label) =>
                    new Date(label).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                    })
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalRevenue"
                  name="Revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Peak Hours */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <h2 className="font-semibold mb-1 flex items-center gap-2">
              <Clock size={18} />
              Peak Hours
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Orders by hour of day
            </p>

            {peakHours.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={peakHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val) => [val, "Orders"]}
                  />
                  <Bar
                    dataKey="orderCount"
                    name="Orders"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Popular Dishes */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <h2 className="font-semibold mb-1 flex items-center gap-2">
              <ShoppingBag size={18} />
              Popular Dishes
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Top 5 most ordered items
            </p>

            {popularDishes.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                No orders yet
              </div>
            ) : (
              <div className="space-y-4">
                {popularDishes.map((dish, i) => (
                  <div key={dish._id} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium truncate">
                          {dish.name}
                        </p>
                        <p className="text-xs text-muted-foreground ml-2 shrink-0">
                          {dish.totalQuantity} sold
                        </p>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${
                              (dish.totalQuantity /
                                popularDishes[0].totalQuantity) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <p className="text-xs font-bold text-primary shrink-0">
                      {formatPrice(dish.totalRevenue)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
