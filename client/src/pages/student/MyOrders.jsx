// src/pages/student/MyOrders.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getMyOrdersAPI } from "../../api/orderAPI";
import { useCart } from "../../context/CartContext";
import { formatPrice, formatDate } from "../../lib/utils";
import useSocket from "../../hooks/useSocket";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, X } from "lucide-react";
import { toast } from "sonner";

const STATUS_COLOR = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-amber-100 text-amber-700",
  ready: "bg-green-100 text-green-700",
  picked_up: "bg-gray-100 text-gray-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  PREPARING: "bg-amber-100 text-amber-700",
  READY: "bg-green-100 text-green-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=200&q=80";

function calcTotal(order) {
  const t = Number(order.total ?? order.totalAmount ?? order.amount);
  if (!isNaN(t) && t > 0) return t;
  if (Array.isArray(order.items) && order.items.length > 0) {
    const sum = order.items.reduce((acc, item) => {
      const price = Number(item.price ?? item.unitPrice ?? 0);
      const qty = Number(item.qty ?? item.quantity ?? 1);
      return acc + price * qty;
    }, 0);
    if (!isNaN(sum) && sum > 0) return sum;
  }
  return 0;
}

// ── Order Detail Modal ──────────────────────────────────────────
function OrderModal({ order, onClose }) {
  const total = calcTotal(order);
  const tax = Math.round((total * 0.05) / 1.05);

  return (
    <div
      className="fixed inset-0 bg-black/35 z-[100] flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-[20px] w-full max-w-[460px] max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start px-6 pt-6 pb-3 border-b border-brand-border">
          <div>
            <p className="font-mono text-xs text-brand-text-faint mb-1.5">
              ORDER #{order._id?.slice(-6).toUpperCase()}
            </p>
            <Badge
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border-0 capitalize ${
                STATUS_COLOR[order.status] || "bg-amber-100 text-amber-700"
              }`}
            >
              {(order.status || "preparing").replace("_", " ")}
            </Badge>
          </div>
          <button
            className="text-brand-text-faint hover:text-brand-text text-lg p-1"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Time */}
        <p className="text-xs text-brand-text-faint px-6 pt-2.5">
          Placed at{" "}
          {order.createdAt
            ? new Date(order.createdAt).toLocaleString([], {
                dateStyle: "medium",
                timeStyle: "short",
              })
            : "—"}
        </p>

        {/* Items */}
        <div className="px-6 py-4">
          <p className="text-[11px] font-bold text-brand-text-faint tracking-wider mb-3">
            ITEMS ORDERED
          </p>
          {order.items?.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 py-2 border-b border-brand-border last:border-b-0"
            >
              <img
                src={item.menuItem?.image || item.image || FALLBACK_IMG}
                alt={item.name}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = FALLBACK_IMG;
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-brand-text">
                  {item.name}
                </p>
                <p className="text-xs text-brand-text-faint mt-0.5">
                  Qty: {item.qty ?? item.quantity ?? 1}
                </p>
              </div>
              <p className="text-sm font-bold text-brand-green flex-shrink-0">
                {formatPrice(
                  Number(item.price) * Number(item.qty ?? item.quantity ?? 1)
                )}
              </p>
            </div>
          ))}
        </div>

        {/* Bill */}
        <div className="mx-6 mb-6 bg-brand-bg rounded-xl p-4">
          <div className="flex justify-between text-[13px] text-brand-text-muted mb-2">
            <span>Subtotal</span>
            <span>{formatPrice(total - tax)}</span>
          </div>
          <div className="flex justify-between text-[13px] text-brand-text-muted mb-2">
            <span>GST (5%)</span>
            <span>{formatPrice(tax)}</span>
          </div>
          <div className="flex justify-between text-[13px] text-brand-text-muted mb-2">
            <span>Delivery</span>
            <span className="text-green-600 font-bold">FREE</span>
          </div>
          <div className="flex justify-between text-[15px] font-bold text-brand-text border-t border-brand-border pt-2.5 mt-1">
            <span>Total Paid</span>
            <span className="text-brand-green">{formatPrice(total)}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────
const MyOrders = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { on, off } = useSocket();

  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailOrder, setDetailOrder] = useState(null);

  useEffect(() => {
    getMyOrdersAPI()
      .then((data) => setOrders(data.orders || []))
      .catch((err) => {
        console.error("Fetch orders error:", err);
        setError("Failed to load orders.");
      })
      .finally(() => setLoading(false));
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

  const filtered =
    filter === "All"
      ? orders
      : filter === "Active"
      ? orders.filter(
          (o) =>
            o.status !== "picked_up" &&
            o.status !== "completed" &&
            o.status !== "cancelled" &&
            o.status !== "COMPLETED" &&
            o.status !== "CANCELLED"
        )
      : orders.filter(
          (o) =>
            o.status === "picked_up" ||
            o.status === "completed" ||
            o.status === "cancelled" ||
            o.status === "COMPLETED" ||
            o.status === "CANCELLED"
        );

  const activeCount = orders.filter(
    (o) =>
      o.status !== "picked_up" &&
      o.status !== "completed" &&
      o.status !== "cancelled" &&
      o.status !== "COMPLETED" &&
      o.status !== "CANCELLED"
  ).length;
  const completedCount = orders.filter(
    (o) =>
      o.status === "picked_up" ||
      o.status === "completed" ||
      o.status === "COMPLETED"
  ).length;

  const handleReorder = (order) => {
    order.items?.forEach((item) => {
      const qty = Number(item.qty ?? item.quantity ?? 1);
      for (let i = 0; i < qty; i++) {
        addToCart({
          _id: item.menuItem || item._id || item.id || String(Math.random()),
          name: item.name,
          price: Number(item.price),
          category: item.category || "",
        });
      }
    });
    navigate("/student/cart");
  };

  if (loading) {
    return (
      <div className="bg-brand-bg min-h-[calc(100vh-58px)] p-8">
        <div className="max-w-[980px] mx-auto">
          <p className="text-brand-text-faint text-center pt-16">
            Loading your orders...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-brand-bg min-h-[calc(100vh-58px)] p-8">
        <div className="max-w-[980px] mx-auto">
          <p className="text-red-500 text-center pt-16">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-bg min-h-[calc(100vh-58px)] p-8">
      <div className="max-w-[980px] mx-auto">
        <h1 className="font-serif-display text-[32px] text-brand-text mb-1">
          Your Orders
        </h1>
        <p className="text-[13px] text-brand-text-faint mb-7">
          Track and manage your recent orders across campus.
        </p>

        <div className="flex gap-6">
          {/* SIDEBAR */}
          <aside className="w-[200px] flex-shrink-0 hidden md:flex flex-col gap-3 sticky top-20 self-start">
            <Card className="py-4 shadow-none">
              <CardContent className="px-4 py-0">
                <p className="text-[10px] font-bold text-brand-text-faint tracking-wider mb-3">
                  SUMMARY
                </p>
                <div className="flex justify-between items-center py-2 border-b border-brand-border text-[13px] text-brand-text-muted">
                  <span>Active Orders</span>
                  <Badge className="bg-brand-green text-white rounded-full px-2 py-0.5 text-[11px] font-bold border-0">
                    {activeCount}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2 text-[13px] text-brand-text-muted">
                  <span>Completed</span>
                  <span className="text-[13px] text-brand-text-faint font-bold">
                    {completedCount}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="py-4 shadow-none">
              <CardContent className="px-4 py-0">
                <p className="text-[10px] font-bold text-brand-text-faint tracking-wider mb-3">
                  QUICK FILTERS
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["All", "Active", "History"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`rounded-full px-3 py-1 text-[11px] font-bold cursor-pointer transition-colors font-sans-display ${
                        filter === f
                          ? "bg-brand-green text-white"
                          : "bg-brand-green-light text-brand-green border border-brand-green-border hover:bg-brand-green-border"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* MOBILE FILTERS */}
          <div className="md:hidden flex gap-2 overflow-x-auto pb-2 mb-4 w-full">
            {["All", "Active", "History"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-3.5 py-1.5 text-[11px] font-bold whitespace-nowrap ${
                  filter === f
                    ? "bg-brand-green text-white"
                    : "bg-brand-green-light text-brand-green border border-brand-green-border"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* ORDER LIST */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-brand-text-faint">
                <Package size={48} className="mx-auto mb-4 opacity-50" />
                <p>No orders found</p>
                <Button
                  onClick={() => navigate("/student/menu")}
                  className="mt-4 bg-brand-green hover:bg-brand-green-dark text-white rounded-full"
                >
                  Order Now
                </Button>
              </div>
            ) : (
              filtered.map((order, i) => {
                const total = calcTotal(order);
                const itemNames =
                  order.items
                    ?.map((it) => it.name)
                    .filter(Boolean)
                    .join(", ") || "Order";
                const itemCount = order.items?.length ?? 0;

                return (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-white border border-brand-border rounded-2xl flex items-center gap-4 p-4.5 hover:shadow-lg transition-shadow"
                  >
                    <img
                      src={order.items?.[0]?.menuItem?.image || order.items?.[0]?.image || FALLBACK_IMG}
                      alt={order.items?.[0]?.name || "Order"}
                      className="w-[90px] h-[78px] rounded-xl object-cover flex-shrink-0"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = FALLBACK_IMG;
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[11px] text-brand-text-faint font-mono">
                          ORDER #{order._id?.slice(-6).toUpperCase()}
                        </span>
                        <Badge
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold border-0 capitalize ${
                            STATUS_COLOR[order.status] ||
                            "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {(order.status || "preparing").replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="font-serif-display text-base text-brand-text mb-0.5 truncate">
                        {itemNames}
                      </p>
                      <p className="text-xs text-brand-text-faint mb-2.5">
                        {itemCount} item{itemCount !== 1 ? "s" : ""}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleReorder(order)}
                          className="bg-brand-green hover:bg-brand-green-dark text-white rounded-lg px-3.5 py-1.5 text-xs font-bold h-auto"
                        >
                          Reorder
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDetailOrder(order)}
                          className="bg-brand-green-light text-brand-green border-brand-green-border hover:bg-brand-green-border rounded-lg px-3.5 py-1.5 text-xs font-bold h-auto"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="font-serif-display text-xl text-brand-green font-bold">
                        {formatPrice(total)}
                      </p>
                      <p className="text-[11px] text-brand-text-faint mt-1">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {detailOrder && (
          <OrderModal
            order={detailOrder}
            onClose={() => setDetailOrder(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyOrders;
