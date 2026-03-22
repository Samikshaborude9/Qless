// src/pages/student/OrderSummary.jsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { placeOrderAPI } from "../../api/orderAPI";
import { createPaymentOrderAPI, verifyPaymentAPI } from "../../api/paymentAPI";
import { formatPrice } from "../../lib/utils";
import { ArrowLeft, Tag, Loader2, CheckCircle, QrCode } from "lucide-react";
import { toast } from "sonner";

const OrderSummary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const cart = location.state?.cart || [];

  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [couponData, setCouponData] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(null);

  if (cart.length === 0) {
    navigate("/student/menu");
    return null;
  }

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Step 1 — Place order in DB
      const orderItems = cart.map((item) => ({
        menuItem: item._id,
        quantity: item.quantity,
      }));

      const orderData = await placeOrderAPI(orderItems, couponCode);
      const order = orderData.order;

      // Step 2 — Create Razorpay order
      const paymentData = await createPaymentOrderAPI(order._id);

      // Step 3 — Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: "Qless Canteen",
        description: `Order #${order._id.slice(-6)}`,
        order_id: paymentData.razorpayOrderId,
        handler: async (response) => {
          try {
            // Step 4 — Verify payment
            const verifyData = await verifyPaymentAPI(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              order._id
            );
            setOrderPlaced(verifyData);
            setCouponData(verifyData.coupon);
            toast.success("Payment successful! 🎉");
          } catch (err) {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: "Student",
          email: "student@university.edu",
        },
        theme: { color: "#3b82f6" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  // Load Razorpay script
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleProceed = async () => {
    const loaded = await loadRazorpay();
    if (!loaded) {
      toast.error("Failed to load payment gateway");
      return;
    }
    await handlePayment();
  };

  // Success Screen
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-card border border-border rounded-2xl p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Your order is being prepared. Estimated time:{" "}
              <span className="font-medium text-foreground">
                {orderPlaced.order?.estimatedTime} mins
              </span>
            </p>

            {/* Coupon QR */}
            {couponData && (
              <div className="bg-muted rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-3 justify-center">
                  <QrCode size={16} />
                  <p className="text-sm font-medium">
                    Your Discount Coupon for Next Order
                  </p>
                </div>
                <img
                  src={couponData.qrCode}
                  alt="Coupon QR"
                  className="w-32 h-32 mx-auto rounded-lg"
                />
                <p className="text-sm font-bold mt-2 tracking-widest">
                  {couponData.code}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {couponData.discountValue}% off on next order • Valid 24hrs
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/student/my-orders")}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
              >
                Track Order
              </button>
              <button
                onClick={() => navigate("/student/menu")}
                className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Order More
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4 sticky top-0 z-40">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate("/student/menu")}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-xl">Order Summary</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-6 space-y-4">
        {/* Order Items */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-semibold mb-4">Items</h2>
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-xs font-bold">
                    {item.quantity}
                  </span>
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <span className="text-sm font-medium">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Coupon */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Tag size={16} />
            Apply Coupon
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary uppercase"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Coupon will be applied automatically at checkout
          </p>
        </div>

        {/* Price Breakdown */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-semibold mb-4">Price Details</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-green-600">Applied at checkout</span>
            </div>
            <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary">{formatPrice(subtotal)}</span>
            </div>
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={handleProceed}
          disabled={loading}
          className="w-full py-3.5 bg-primary text-primary-foreground rounded-2xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? "Processing..." : `Pay ${formatPrice(subtotal)}`}
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;
