// src/pages/student/MenuPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getMenuAPI } from "../../api/menuAPI";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../lib/utils";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icon from "../../components/common/Icon";
import {
  Search,
  Plus,
  Minus,
  X,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&q=80";

const MenuPage = () => {
  const navigate = useNavigate();
  const { cart, addToCart, updateQty, removeItem, cartCount, cartTotal } = useCart();

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCartDrawer, setShowCartDrawer] = useState(false);

  const CATEGORIES = ["all", "breakfast", "lunch", "dinner", "snacks", "beverages"];

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const filters = { available: true };
        if (search) filters.search = search;
        if (selectedCategory !== "all") filters.category = selectedCategory;
        const data = await getMenuAPI(filters);
        setMenuItems(data.menuItems || []);
      } catch (error) {
        toast.error("Failed to load menu");
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [search, selectedCategory]);

  const getCartQty = (itemId) => {
    const found = cart.find((c) => (c._id || c.id) === itemId);
    return found?.qty || found?.quantity || 0;
  };

  if (loading && menuItems.length === 0) {
    return (
      <div className="flex bg-brand-bg min-h-[calc(100vh-58px)]">
        <div className="flex-1 p-8">
          <p className="text-brand-text-faint text-center pt-16">
            Loading menu...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-brand-bg min-h-[calc(100vh-58px)]">
      {/* MAIN CONTENT */}
      <div className="flex-1 p-8 pr-4 min-w-0">
        <h1 className="font-serif-display text-[32px] text-brand-text mb-1">
          Menu
        </h1>
        <p className="text-[13px] text-brand-text-faint mb-6">
          Browse and order your favourite food from our curated campus kitchen.
        </p>

        {/* Search + Categories */}
        <div className="flex gap-3 items-center mb-5 flex-wrap">
          <div className="relative max-w-[340px] w-full">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-faint"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for food..."
              className="pl-9 bg-white border-brand-border rounded-xl text-[13px] h-10 font-sans-display"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors capitalize ${
                  selectedCategory === cat
                    ? "bg-brand-green text-white"
                    : "bg-brand-green-light text-brand-green border border-brand-green-border hover:bg-brand-green-border"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {menuItems.map((item, i) => {
            const isAvail = item.available !== undefined ? item.available : item.isAvailable;
            const unavailable = !isAvail || item.stock === 0;
            const qty = getCartQty(item._id);

            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`bg-white border border-brand-border rounded-[14px] overflow-hidden flex flex-col transition-shadow hover:shadow-lg group ${
                  unavailable ? "opacity-50 pointer-events-none grayscale-[40%]" : ""
                }`}
              >
                {/* Image */}
                <div className="w-full aspect-[4/3] overflow-hidden relative">
                  <img
                    src={item.image || FALLBACK_IMG}
                    alt={item.name}
                    className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                      unavailable ? "opacity-45" : ""
                    }`}
                  />
                  {unavailable && (
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[11px] font-bold tracking-wide px-2.5 py-0.5 rounded-full whitespace-nowrap">
                      Currently Unavailable
                    </span>
                  )}
                  {!unavailable && item.stock <= 5 && (
                    <Badge className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold border-0 rounded-full">
                      🔥 High Demand
                    </Badge>
                  )}
                </div>

                {/* Body */}
                <div className="p-3.5 flex-1 flex flex-col">
                  <p
                    className={`font-serif-display text-[15px] text-brand-text mb-1 ${
                      unavailable ? "opacity-50" : ""
                    }`}
                  >
                    {item.name}
                  </p>
                  {unavailable && (
                    <p className="text-[11px] text-brand-text-faint italic mb-1.5">
                      Check back later
                    </p>
                  )}
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-[11px] text-brand-text-faint capitalize">
                      {item.category}
                    </span>
                    {item.prepTime && (
                      <span className="text-[11px] text-brand-text-faint ml-auto">
                        ~{item.prepTime}m
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-auto pt-2.5">
                    <span
                      className={`font-bold text-[17px] text-brand-green ${
                        unavailable ? "opacity-50" : ""
                      }`}
                    >
                      {formatPrice(item.price)}
                    </span>

                    {qty === 0 ? (
                      <button
                        onClick={() => addToCart(item)}
                        disabled={unavailable}
                        className="bg-brand-green border-0 rounded-full w-[34px] h-[34px] flex items-center justify-center cursor-pointer hover:bg-brand-green-dark transition-colors disabled:opacity-35 disabled:cursor-not-allowed flex-shrink-0"
                      >
                        <Plus size={14} className="text-white" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(item._id, -1)}
                          className="p-1 bg-brand-green-light border border-brand-green-border rounded-lg hover:bg-brand-green-border transition-colors"
                        >
                          <Minus size={12} className="text-brand-green" />
                        </button>
                        <span className="text-sm font-bold text-brand-text w-4 text-center">
                          {qty}
                        </span>
                        <button
                          onClick={() => addToCart(item)}
                          disabled={item.stock && qty >= item.stock}
                          className="p-1 bg-brand-green rounded-lg hover:bg-brand-green-dark transition-colors disabled:opacity-50"
                        >
                          <Plus size={12} className="text-white" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {menuItems.length === 0 && !loading && (
            <div className="col-span-full text-center py-16 text-brand-text-faint text-sm">
              No items found
            </div>
          )}
        </div>
      </div>

      {/* DESKTOP CART SIDEBAR */}
      <aside className="w-72 flex-shrink-0 bg-white border-l border-brand-border p-5 sticky top-[58px] h-[calc(100vh-58px)] overflow-y-auto hidden lg:flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-serif-display text-lg text-brand-text">
            Your Cart
          </h3>
          <span className="bg-brand-green text-white rounded-full w-[22px] h-[22px] text-[11px] font-bold flex items-center justify-center flex-shrink-0">
            {cartCount}
          </span>
        </div>

        {cart.length === 0 ? (
          <p className="text-[13px] text-brand-text-faint text-center pt-10">
            Your cart is empty
          </p>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto mb-3 flex flex-col">
              {cart.map((item) => {
                const itemId = item._id || item.id;
                const qty = item.qty || item.quantity || 1;
                return (
                  <div
                    key={itemId}
                    className="flex items-center justify-between py-2 border-b border-brand-border gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-brand-text truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-brand-text-faint mt-0.5">
                        {qty}× {formatPrice(item.price)}
                      </p>
                    </div>
                    <p className="text-[13px] text-brand-green font-bold flex-shrink-0">
                      {formatPrice(item.price * qty)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between text-[15px] font-bold text-brand-text border-t-2 border-brand-border pt-3 mb-3.5">
              <span>Total</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>

            <Button
              onClick={() => navigate("/student/cart")}
              className="w-full bg-brand-green hover:bg-brand-green-dark text-white rounded-xl font-bold text-[13px] py-3 h-auto font-sans-display"
            >
              View Cart
            </Button>
          </>
        )}
      </aside>

      {/* MOBILE CART FAB */}
      <button
        onClick={() => setShowCartDrawer(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-brand-green text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-brand-green-dark transition-colors"
      >
        <ShoppingCart size={20} />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </button>

      {/* MOBILE CART DRAWER */}
      <AnimatePresence>
        {showCartDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCartDrawer(false)}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white border-l border-brand-border z-50 flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-brand-border">
                <h2 className="font-serif-display text-lg text-brand-text">
                  Your Cart ({cartCount})
                </h2>
                <button
                  onClick={() => setShowCartDrawer(false)}
                  className="p-2 hover:bg-brand-green-light rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart
                      size={40}
                      className="mx-auto text-brand-text-faint mb-3"
                    />
                    <p className="text-brand-text-faint text-sm">
                      Your cart is empty
                    </p>
                  </div>
                ) : (
                  cart.map((item) => {
                    const itemId = item._id || item.id;
                    const qty = item.qty || item.quantity || 1;
                    return (
                      <div
                        key={itemId}
                        className="flex items-center gap-3 bg-brand-green-light/50 rounded-xl p-3"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-brand-text-faint mt-0.5">
                            {formatPrice(item.price)} each
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQty(itemId, -1)}
                            className="p-1 bg-white rounded-lg border border-brand-border"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">
                            {qty}
                          </span>
                          <button
                            onClick={() => addToCart(item)}
                            className="p-1 bg-white rounded-lg border border-brand-border"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <p className="text-sm font-bold text-brand-green w-16 text-right">
                          {formatPrice(item.price * qty)}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-brand-border">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium">Total</span>
                    <span className="font-bold text-lg text-brand-green">
                      {formatPrice(cartTotal)}
                    </span>
                  </div>
                  <Button
                    onClick={() => {
                      setShowCartDrawer(false);
                      navigate("/student/cart");
                    }}
                    className="w-full bg-brand-green hover:bg-brand-green-dark text-white rounded-xl font-medium py-3 h-auto"
                  >
                    View Cart →
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MenuPage;
