// src/pages/student/MyOrders.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getMyOrdersAPI } from "../../api/orderAPI";
import { formatPrice, formatDate, getStatusColor } from "../../lib/utils";
import useSocket from "../../hooks/useSocket";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ChefHat,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";

const STATUS_ICONS = {
  pending: <Clock size={14} />,
  confirmed: <CheckCircle size={14} />,
  preparing: <ChefHat size={14} />,
  ready: <ShoppingBag size={14} />,
  picked_up: <CheckCircle size={14} />,
  cancelled: <XCircle size={14} />,
};

const STATUS_STEPS = ["confirmed", "preparing", "ready", "picked_up"];

const MyOrders = () => {
  const navigate = useNavigate();
  const { on, off } = useSocket();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getMyOrdersAPI();
        setOrders(data.orders);
      } catch (error) {
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Real-time order status updates
  useEffect(() => {
    on("order:statusUpdate", (data) => {
      setOrders((prev) =>
        prev.map((order) =>
          order._id === data.orderId
            ? { ...order, status: data.status }
            : order
        )
      );
      toast.info(
        `Order status: ${data.status.replace("_", " ").toUpperCase()}`
      );
    });

    return () => off("order:statusUpdate");
  }, [on, off]);

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((order) => order.status === filter);

  const FILTERS = [
    { label: "All", value: "all" },
    { label: "Active", value: "preparing" },
    { label: "Ready", value: "ready" },
    { label: "Completed", value: "picked_up" },
    { label: "Cancelled", value: "cancelled" },
  ];

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
      <div className="bg-card border-b border-border px-6 py-4 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate("/student/dashboard")}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-xl">My Orders</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6">
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

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <Package
              size={48}
              className="mx-auto text-muted-foreground mb-4"
            />
            <p className="text-muted-foreground">No orders found</p>
            <button
              onClick={() => navigate("/student/menu")}
              className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Order Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, i) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-2xl p-5"
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium capitalize ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {STATUS_ICONS[order.status]}
                    {order.status.replace("_", " ")}
                  </span>
                </div>

                {/* Progress Bar for active orders */}
                {["confirmed", "preparing", "ready"].includes(
                  order.status
                ) && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      {STATUS_STEPS.map((step, idx) => (
                        <div
                          key={step}
                          className="flex flex-col items-center gap-1"
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                              STATUS_STEPS.indexOf(order.status) >= idx
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <span className="text-xs text-muted-foreground capitalize hidden sm:block">
                            {step.replace("_", " ")}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            ((STATUS_STEPS.indexOf(order.status) + 1) /
                              STATUS_STEPS.length) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="space-y-2 mb-4">
                  {order.items.map((item) => (
                    <div
                      key={item._id}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-muted-foreground">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="border-t border-border pt-3 flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    {order.estimatedTime && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        Est. {order.estimatedTime} mins
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    {order.discount > 0 && (
                      <p className="text-xs text-green-600">
                        Saved {formatPrice(order.discount)}
                      </p>
                    )}
                    <p className="font-bold text-primary">
                      {formatPrice(order.totalAmount)}
                    </p>
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

export default MyOrders;
