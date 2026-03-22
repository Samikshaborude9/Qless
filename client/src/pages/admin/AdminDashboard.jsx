// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import useSocket from "../../hooks/useSocket";
import { getOverviewAPI } from "../../api/analyticsAPI";
import { getLowStockAPI } from "../../api/inventoryAPI";
import { getAllOrdersAPI } from "../../api/orderAPI";
import { formatPrice, getStatusColor } from "../../lib/utils";
import {
  ShoppingBag,
  TrendingUp,
  Users,
  UtensilsCrossed,
  Package,
  ClipboardList,
  BarChart2,
  LogOut,
  AlertTriangle,
  Bell,
} from "lucide-react";
import { toast } from "sonner";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { on, off } = useSocket();
  const navigate = useNavigate();

  const [overview, setOverview] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [liveOrders, setLiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewData, lowStockData, ordersData] = await Promise.all([
          getOverviewAPI(),
          getLowStockAPI(),
          getAllOrdersAPI("confirmed"),
        ]);
        setOverview(overviewData.overview);
        setLowStock(lowStockData.lowStockItems);
        setLiveOrders(ordersData.orders.slice(0, 5));
      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Real-time socket events
  useEffect(() => {
    on("order:new", (order) => {
      setLiveOrders((prev) => [order, ...prev].slice(0, 5));
      setOverview((prev) =>
        prev ? { ...prev, todayOrders: prev.todayOrders + 1 } : prev
      );
      setNotifications((prev) => [
        { id: Date.now(), message: "New order received!", type: "order" },
        ...prev.slice(0, 4),
      ]);
      toast.info("🛒 New order received!");
    });

    on("stock:low", (data) => {
      setNotifications((prev) => [
        {
          id: Date.now(),
          message: `Low stock: ${data.ingredientName} (${data.currentStock} ${data.unit})`,
          type: "stock",
        },
        ...prev.slice(0, 4),
      ]);
      toast.warning(`⚠️ Low stock: ${data.ingredientName}`);
    });

    return () => {
      off("order:new");
      off("stock:low");
    };
  }, [on, off]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const STAT_CARDS = [
    {
      label: "Today's Orders",
      value: overview?.todayOrders ?? 0,
      icon: <ShoppingBag size={20} />,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Today's Revenue",
      value: formatPrice(overview?.todayRevenue ?? 0),
      icon: <TrendingUp size={20} />,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Total Students",
      value: overview?.totalStudents ?? 0,
      icon: <Users size={20} />,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Active Orders",
      value: overview?.pendingOrders ?? 0,
      icon: <ClipboardList size={20} />,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  const NAV_LINKS = [
    { label: "Orders", icon: <ClipboardList size={18} />, to: "/admin/orders" },
    { label: "Menu", icon: <UtensilsCrossed size={18} />, to: "/admin/menu" },
    { label: "Inventory", icon: <Package size={18} />, to: "/admin/inventory" },
    { label: "Analytics", icon: <BarChart2 size={18} />, to: "/admin/analytics" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar + Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 min-h-screen bg-card border-r border-border p-6 fixed">
          {/* Logo */}
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">Q</span>
            </div>
            <span className="font-bold text-xl">Qless Admin</span>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>

          {/* User + Logout */}
          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground mb-3">Administrator</p>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64 p-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Welcome back, {user?.name?.split(" ")[0]}
              </p>
            </div>

            {/* Notifications */}
            {notifications.length > 0 && (
              <div className="relative">
                <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl">
                  <Bell size={16} className="text-primary" />
                  <span className="text-sm font-medium">
                    {notifications.length} new
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                <p className="text-sm text-muted-foreground mt-1">
                  {card.label}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Orders */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 bg-card border border-border rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Live Orders</h2>
                <Link
                  to="/admin/orders"
                  className="text-sm text-primary hover:underline"
                >
                  View all
                </Link>
              </div>

              {liveOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardList
                    size={32}
                    className="mx-auto text-muted-foreground mb-2"
                  />
                  <p className="text-sm text-muted-foreground">
                    No active orders
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {liveOrders.map((order) => (
                    <div
                      key={order._id}
                      className="flex items-center justify-between p-3 bg-muted rounded-xl"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          #{order._id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {order.student?.name} •{" "}
                          {order.items.length} item
                          {order.items.length > 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                        <p className="text-xs font-bold mt-1">
                          {formatPrice(order.totalAmount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Low Stock Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-card border border-border rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <AlertTriangle size={16} className="text-orange-500" />
                  Low Stock
                </h2>
                <Link
                  to="/admin/inventory"
                  className="text-sm text-primary hover:underline"
                >
                  Manage
                </Link>
              </div>

              {lowStock.length === 0 ? (
                <div className="text-center py-8">
                  <Package
                    size={32}
                    className="mx-auto text-muted-foreground mb-2"
                  />
                  <p className="text-sm text-muted-foreground">
                    All stock levels OK
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lowStock.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between p-3 bg-orange-50 rounded-xl"
                    >
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-orange-600">
                          {item.currentStock}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          min: {item.lowStockThreshold}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Notifications Feed */}
          {notifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-card border border-border rounded-2xl p-5"
            >
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Bell size={16} />
                Recent Notifications
              </h2>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-center gap-3 p-3 rounded-xl text-sm ${
                      n.type === "stock"
                        ? "bg-orange-50 text-orange-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {n.type === "stock" ? (
                      <AlertTriangle size={14} />
                    ) : (
                      <ShoppingBag size={14} />
                    )}
                    {n.message}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
