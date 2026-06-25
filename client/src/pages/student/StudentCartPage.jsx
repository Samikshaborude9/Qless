// src/pages/student/StudentCartPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "../../components/common/Icon";
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=200&q=80";

const StudentCartPage = () => {
  const { cart, updateQty, removeItem, clearCart, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");

  const tax = Math.round(cartTotal * 0.05);
  const delivery = 0;
  const total = cartTotal + tax + delivery;

  const getId = (item) => item._id || item.id;

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    // Navigate to OrderSummary with cart state — this triggers the Razorpay flow
    const cartForCheckout = cart.map((item) => ({
      ...item,
      quantity: item.qty || item.quantity || 1,
    }));
    navigate("/student/order-summary", { state: { cart: cartForCheckout } });
  };

  // Empty cart
  if (cart.length === 0) {
    return (
      <div className="bg-brand-bg min-h-[calc(100vh-58px)] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-brand-border rounded-[20px] p-12 text-center max-w-[380px]"
        >
          <div className="bg-brand-green-light w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center">
            <ShoppingBag size={36} className="text-brand-green" />
          </div>
          <h2 className="font-serif-display text-[26px] text-brand-text mb-2">
            Your cart is empty
          </h2>
          <p className="text-[13px] text-brand-text-muted mb-6 leading-relaxed">
            Looks like you haven't added any items yet. Browse our menu to get
            started!
          </p>
          <Button
            onClick={() => navigate("/student/menu")}
            className="bg-brand-green hover:bg-brand-green-dark text-white rounded-full px-7 py-3 h-auto text-sm font-bold font-sans-display"
          >
            Browse Menu
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-brand-bg min-h-[calc(100vh-58px)] p-8">
      <div className="max-w-[1000px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-serif-display text-[32px] text-brand-text mb-1">
            Your Cart 🛒
          </h1>
          <p className="text-[13px] text-brand-text-faint mb-7">
            Review your order before placing
          </p>
        </motion.div>

        <div className="flex gap-7 items-start flex-col lg:flex-row">
          {/* LEFT: CART ITEMS */}
          <div className="flex-1 flex flex-col gap-3 min-w-0 w-full">
            {cart.map((item, i) => {
              const id = getId(item);
              const qty = item.qty || item.quantity || 1;

              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white border border-brand-border rounded-2xl flex items-center gap-4 p-4.5 hover:shadow-md transition-shadow"
                >
                  <img
                    src={item.image || FALLBACK_IMG}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-serif-display text-[15px] text-brand-text mb-1">
                      {item.name}
                    </p>
                    {item.description && (
                      <p className="text-[11px] text-brand-text-faint mb-2 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <button
                      onClick={() => removeItem(id)}
                      className="bg-transparent border-0 text-red-500 text-[11px] font-bold cursor-pointer p-0 font-sans-display flex items-center gap-1 hover:text-red-700"
                    >
                      <Trash2 size={11} /> REMOVE
                    </button>
                  </div>

                  {/* Qty Control */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => updateQty(id, -1)}
                      className="border-0 rounded-lg w-[30px] h-[30px] flex items-center justify-center cursor-pointer bg-brand-green-light border border-brand-green-border hover:bg-brand-green-border transition-colors"
                    >
                      <Minus size={12} className="text-brand-green" />
                    </button>
                    <span className="font-bold text-sm text-brand-text min-w-[20px] text-center">
                      {qty}
                    </span>
                    <button
                      onClick={() => updateQty(id, 1)}
                      className="border-0 rounded-lg w-[30px] h-[30px] flex items-center justify-center cursor-pointer bg-brand-green hover:bg-brand-green-dark transition-colors"
                    >
                      <Plus size={12} className="text-white" />
                    </button>
                  </div>

                  <span className="font-bold text-[17px] text-brand-green min-w-[65px] text-right flex-shrink-0">
                    {formatPrice(item.price * qty)}
                  </span>
                </motion.div>
              );
            })}

            {/* Perks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
              <div className="bg-brand-green-light border border-brand-green-border rounded-xl p-3.5 flex items-center gap-3">
                <div className="bg-brand-green rounded-full w-8 h-8 flex items-center justify-center text-white text-[13px] flex-shrink-0">
                  ✦
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-green">
                    Campus Points
                  </p>
                  <p className="text-[11px] text-brand-green opacity-80">
                    Earning {Math.floor(total / 10)} pts
                  </p>
                </div>
              </div>
              <div className="bg-brand-green-light border border-brand-green-border rounded-xl p-3.5 flex items-center gap-3">
                <div className="bg-brand-green rounded-full w-8 h-8 flex items-center justify-center text-white text-[13px] flex-shrink-0">
                  🚚
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-green">
                    Free Pickup
                  </p>
                  <p className="text-[11px] text-brand-green opacity-80">
                    No delivery fee — pick up at QLess Zone
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: SUMMARY */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full lg:w-[290px] flex-shrink-0 bg-white border border-brand-border rounded-2xl p-6 lg:sticky lg:top-20"
          >
            <h3 className="font-serif-display text-lg text-brand-text mb-3.5">
              Order Summary
            </h3>

            {/* Item Breakdown */}
            <div className="mb-3.5 pb-3 border-b border-brand-border flex flex-col gap-1.5">
              {cart.map((item) => {
                const qty = item.qty || item.quantity || 1;
                return (
                  <div
                    key={getId(item)}
                    className="flex justify-between items-center text-xs text-brand-text-muted"
                  >
                    <span className="flex-1 truncate pr-2">
                      {item.name}
                      <span className="text-brand-text-faint text-[11px]">
                        {" "}
                        ×{qty}
                      </span>
                    </span>
                    <span className="font-semibold text-brand-text flex-shrink-0">
                      {formatPrice(item.price * qty)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="mb-3">
              <div className="flex justify-between text-[13px] text-brand-text-muted mb-2">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-[13px] text-brand-text-muted mb-2">
                <span>GST (5%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between text-[13px] text-brand-text-muted mb-2">
                <span>Delivery</span>
                <span className="text-green-600 font-bold">FREE</span>
              </div>
            </div>

            <div className="flex justify-between text-[15px] font-bold text-brand-text border-t-2 border-brand-border pt-3 mb-4.5">
              <span>Total Amount</span>
              <span className="text-brand-green">{formatPrice(total)}</span>
            </div>

            {/* Promo Code */}
            <div className="flex border border-brand-border rounded-xl overflow-hidden mb-3.5">
              <Input
                placeholder="Promo code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 border-0 rounded-none text-[13px] shadow-none focus-visible:ring-0 h-9 uppercase font-sans-display"
              />
              <button className="bg-brand-green text-white border-0 px-3.5 text-xs font-bold cursor-pointer font-sans-display hover:bg-brand-green-dark transition-colors">
                APPLY
              </button>
            </div>

            {/* Place Order */}
            <Button
              onClick={handleCheckout}
              className="bg-brand-green hover:bg-brand-green-dark text-white rounded-full py-3.5 text-sm font-bold w-full flex items-center justify-center gap-2 h-auto font-sans-display mb-3 hover:-translate-y-0.5 transition-all"
            >
              Place Order
              <ArrowRight size={14} />
            </Button>

            <div className="flex justify-center gap-4">
              <span className="text-[11px] text-brand-text-faint">
                🔒 Secure
              </span>
              <span className="text-[11px] text-brand-text-faint">
                🌿 Fresh Daily
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StudentCartPage;
