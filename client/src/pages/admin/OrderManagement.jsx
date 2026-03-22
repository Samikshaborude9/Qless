// src/pages/admin/OrderManagement.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getAllOrdersAPI, updateOrderStatusAPI } from "../../api/orderAPI";
import { formatPrice, formatDate, getStatusColor } from "../../lib/utils";
import useSocket from "../../hooks/useSocket";
import {
  ArrowLeft,
  ClipboardList,
  ChefHat,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

const STATUS_FLOW = {
  pending: { next: "confirmed", label: "Confirm", color: "bg-blue-600" },
  confirmed: { next: "preparing", label: "Start Preparing", color: "bg-orange-500" },
  preparing: { next: "ready", label: "Mark Ready", color: "bg-green-600" },
  ready: null,
  picked_up: null,
  cancelled: null,
};

const OrderManagement = () => {
  const { on, off } = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const status = filter === "all" ? "" : filter;
      const data = await getAllOrdersAPI(status);
      setOrders(data.orders);
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  // Real-time new orders
  useEffect(() => {
    on("order:new", (order) => {
      setOrders((prev) => [order, ...prev]);
      toast.info("🛒 New order received!");
    });

    return () => off("order:new");
  }, [on, off]);

  const handleStatusUpdate = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await updateOrderStatusAPI(orderId, status);
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status } : order
        )
      );
      toast.success(`Order marked as ${status.replace("_", " ")}`);
    } catch (error) {
      toast.error("Failed to update order status");
    } finally {
      setUpdating(null);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    await handleStatusUpdate(orderId, "cancelled");
  };

  const FILTERS = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Preparing", value: "preparing" },
    { label: "Ready", value: "ready" },
    { label: "Picked Up", value: "picked_up" },
    { label: "Cancelled", value: "cancelled" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/dashboard"
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-bold text-xl">Order Management</h1>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2 bg-muted rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Orders */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-muted rounded-2xl h-32 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <ClipboardList
              size={48}
              className="mx-auto text-muted-foreground mb-4"
            />
            <p className="text-muted-foreground">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card border border-border rounded-2xl p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold">
                        #{order._id.slice(-6).toUpperCase()}
                      </p>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status.replace("_", " ")}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-1">
                      👤 {order.student?.name} • {order.student?.email}
                    </p>

                    <p className="text-sm text-muted-foreground mb-2">
                      🕐 {formatDate(order.createdAt)}
                    </p>

                    {/* Items */}
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item) => (
                        <span
                          key={item._id}
                          className="text-xs bg-muted px-2.5 py-1 rounded-full"
                        >
                          {item.name} × {item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-3">
                    <p className="font-bold text-lg text-primary">
                      {formatPrice(order.totalAmount)}
                    </p>

                    <div className="flex gap-2">
                      {/* Next status button */}
                      {STATUS_FLOW[order.status] && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(
                              order._id,
                              STATUS_FLOW[order.status].next
                            )
                          }
                          disabled={updating === order._id}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-medium transition-opacity disabled:opacity-60 ${STATUS_FLOW[order.status].color}`}
                        >
                          {updating === order._id ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : (
                            <ChefHat size={14} />
                          )}
                          {STATUS_FLOW[order.status].label}
                        </button>
                      )}

                      {/* Cancel button */}
                      {!["cancelled", "picked_up"].includes(
                        order.status
                      ) && (
                        <button
                          onClick={() => handleCancel(order._id)}
                          disabled={updating === order._id}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-60"
                        >
                          <XCircle size={14} />
                          Cancel
                        </button>
                      )}

                      {/* Completed badge */}
                      {order.status === "picked_up" && (
                        <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-50 text-green-600 text-sm font-medium">
                          <CheckCircle size={14} />
                          Completed
                        </span>
                      )}
                    </div>

                    {/* Estimated time */}
                    {order.estimatedTime &&
                      !["picked_up", "cancelled"].includes(order.status) && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock size={12} />
                          Est. {order.estimatedTime} mins
                        </p>
                      )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
