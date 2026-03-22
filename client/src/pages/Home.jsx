// src/pages/Home.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Zap,
  ShoppingBag,
  BarChart2,
  Users,
  Clock,
  CheckCircle,
} from "lucide-react";

const FEATURES = [
  {
    icon: <Zap size={24} className="text-blue-600" />,
    title: "Skip the Queue",
    description:
      "Pre-order your food and pick it up when it's ready. No more waiting in long lines.",
    bg: "bg-blue-50",
  },
  {
    icon: <Clock size={24} className="text-orange-600" />,
    title: "Real-time Tracking",
    description:
      "Track your order status live — from preparation to ready for pickup.",
    bg: "bg-orange-50",
  },
  {
    icon: <BarChart2 size={24} className="text-purple-600" />,
    title: "Smart Analytics",
    description:
      "Canteen admins get powerful insights on orders, revenue and peak hours.",
    bg: "bg-purple-50",
  },
  {
    icon: <Users size={24} className="text-green-600" />,
    title: "Live Occupancy",
    description:
      "See how crowded the canteen is before you go. Plan your visit smartly.",
    bg: "bg-green-50",
  },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                Q
              </span>
            </div>
            <span className="font-bold text-xl">Qless</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              <Zap size={14} />
              AI-Powered Canteen System
            </span>

            <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6">
              Skip the Queue,{" "}
              <span className="text-primary">Enjoy the Food</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Qless is a smart canteen pre-order system that eliminates queues,
              tracks orders in real-time, and helps canteen admins manage
              everything effortlessly.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/register"
                className="px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                Get Started Free →
              </Link>
              <Link
                to="/login"
                className="px-8 py-3.5 border border-border rounded-xl font-medium hover:bg-muted transition-colors"
              >
                Sign In
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-3 gap-6 mt-16 max-w-lg mx-auto"
          >
            {[
              { value: "0 min", label: "Queue Time" },
              { value: "3 Roles", label: "Student, Admin, Staff" },
              { value: "Live", label: "Real-time Updates" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">
              Everything you need
            </h2>
            <p className="text-muted-foreground">
              Built for students, admins and canteen staff
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.bg}`}
                >
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">How it works</h2>
          <div className="space-y-6">
            {[
              { step: "01", title: "Browse Menu", desc: "Explore today's menu and add items to your cart" },
              { step: "02", title: "Pay Online", desc: "Secure payment via Razorpay — UPI, cards, wallets" },
              { step: "03", title: "Track Order", desc: "Get live updates as your order is prepared" },
              { step: "04", title: "Pick Up", desc: "Collect your order when it's ready — no waiting!" },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 text-left bg-card border border-border rounded-2xl p-5"
              >
                <span className="text-3xl font-bold text-primary/20 shrink-0">
                  {item.step}
                </span>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                <CheckCircle
                  size={20}
                  className="text-green-500 shrink-0 mt-0.5 ml-auto"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-primary">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Ready to go queue-free?
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            Join Qless today and experience a smarter canteen.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-primary rounded-xl font-medium hover:bg-white/90 transition-colors"
          >
            <ShoppingBag size={18} />
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">
                Q
              </span>
            </div>
            <span className="font-bold">Qless</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Qless. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
