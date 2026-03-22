// src/pages/server/ServerDashboard.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import useSocket from "../../hooks/useSocket";
import { getReadyOrdersAPI, markPickedUpAPI } from "../../api/serverAPI";
import { formatDate } from "../../lib/utils";
import {
  ShoppingBag,
  CheckCircle,
  LogOut,
  Bell,
  Package,
  Loader2,
  User,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const ServerDashboard = () => {
  const { user, logout } = useAuth();
  const { on, off } = useSocket();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(null);
  const [pickedUpCount, setPickedUpCount] = useState(0);

  useEffect(() => {
    fetchReadyOrders();
  }, []);

  const fetchReadyOrders = async () => {
    try {
      setLoading(true);
      const data = await getReadyOrdersAPI();
      setOrders(data.orders);
    } catch (error) {
      toast.error("Failed to load ready orders");
    } finally {
      setLoading(false);
    }
  };

  // Real-time socket events
  useEffect(() => {
    on("order:nowReady", (order) => {
      setOrders((prev) => {
        const exists = prev.find((o) => o._id === order._id);
        if (exists) return prev;
        return [...prev, order];
      });
      toast.info("🔔 New order ready for pickup!");
    });

    on("order:pickedUp", (data) => {
      setOrders((prev) =>
        prev.filter((order) => order._id !== data.orderId)
      );
    });

    return () => {
      off("order:nowReady");
      off("order:pickedUp");
    };
  }, [on, off]);

  const handleConfirmPickup = async (orderId) => {
    setConfirming(orderId);
    try {
      await markPickedUpAPI(orderId);
      setOrders((prev) => prev.filter((order) => order._id !== orderId));
      setPickedUpCount((prev) => prev + 1);
      setShowConfirmModal(null);
      toast.success("✅ Order marked as picked up!");
    } catch (error) {
      toast.error("Failed to confirm pickup");
    } finally {
      setConfirming(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">Q</span>
            </div>
            <div>
              <span className="font-bold text-lg">Qless</span>
              <span className="text-xs text-muted-foreground ml-2">
                Staff Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User size={14} />
              {user?.name}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 transition-colors"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Ready for Pickup
              </span>
              <Bell size={16} className="text-primary" />
            </div>
            <p className="text-3xl font-bold text-primary">{orders.length}</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Delivered Today
              </span>
              <CheckCircle size={16} className="text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">
              {pickedUpCount}
            </p>
          </div>
        </div>

        {/* Orders List */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <ShoppingBag size={20} />
            Ready Orders
          </h2>
          <button
            onClick={fetchReadyOrders}
            className="text-sm text-primary hover:underline"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-muted rounded-2xl h-36 animate-pulse"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Package
              size={48}
              className="mx-auto text-muted-foreground mb-4"
            />
            <p className="font-medium text-muted-foreground">
              No orders ready for pickup
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              New orders will appear here automatically
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {orders.map((order, i) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border-2 border-green-200 rounded-2xl p-5"
                >
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-xs px-2.5 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                          Ready
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Clock size={11} />
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Student Info */}
                  <div className="flex items-center gap-2 mb-3 p-3 bg-muted rounded-xl">
                    <User size={14} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {order.student?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.student?.email}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-1.5 mb-4">
                    {order.items.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {item.name}
                        </span>
                        <span className="font-medium">× {item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Confirm Button */}
                  <button
                    onClick={() => setShowConfirmModal(order)}
                    disabled={confirming === order._id}
                    className="w-full py-3 bg-green-600 text-white rounded-xl font-medium text-sm hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {confirming === order._id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    {confirming === order._id
                      ? "Confirming..."
                      : "Confirm Delivery"}
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Confirm Pickup Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmModal(null)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 text-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={28} className="text-green-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Confirm Delivery?</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Order #{showConfirmModal._id.slice(-6).toUpperCase()}
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  For{" "}
                  <span className="font-medium text-foreground">
                    {showConfirmModal.student?.name}
                  </span>
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmModal(null)}
                    className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() =>
                      handleConfirmPickup(showConfirmModal._id)
                    }
                    disabled={confirming === showConfirmModal._id}
                    className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {confirming === showConfirmModal._id && (
                      <Loader2 size={14} className="animate-spin" />
                    )}
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServerDashboard;
