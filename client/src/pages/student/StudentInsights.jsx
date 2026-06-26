// src/pages/student/StudentInsights.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getMyOrdersAPI } from "../../api/orderAPI";
import { formatPrice } from "../../lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { toast } from "sonner";


const SPENDING_BREAKDOWN = [
  { label: "Breakfast Items", pct: 42, color: "var(--green)" },
  { label: "Lunch Dishes", pct: 35, color: "var(--green-mid)" },
  { label: "Snacks", pct: 23, color: "#86efac" },
];

const NUTRITION = [
  { label: "CALORIES", pct: 78, color: "var(--green)" },
  { label: "PROTEIN", pct: 90, color: "var(--green-mid)" },
  { label: "CARBS", pct: 100, color: "#f59e0b" },
  { label: "FAT", pct: 42, color: "#ef4444" },
];

// ── SVG Circle Chart ─────────────────────────────────────────────
function Circle({ pct, color, label }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const fill = (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width="70" height="70" viewBox="0 0 70 70">
        <circle
          cx="35"
          cy="35"
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth="6"
        />
        <circle
          cx="35"
          cy="35"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 35 35)"
        />
        <text
          x="35"
          y="40"
          textAnchor="middle"
          fill="var(--text)"
          fontSize="13"
          fontWeight="700"
        >
          {pct}%
        </text>
      </svg>
      <span className="text-[10px] font-bold text-brand-text-faint tracking-wider">
        {label}
      </span>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────
const StudentInsights = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrdersAPI()
      .then((data) => setOrders(data.orders || []))
      .catch(() => toast.error("Failed to load insights data"))
      .finally(() => setLoading(false));
  }, []);

  // Compute real stats from orders
  const totalOrders = orders.length;
  const totalSpending = orders.reduce(
    (sum, o) => sum + (o.totalAmount || 0),
    0
  );
  const avgOrder = totalOrders > 0 ? Math.round(totalSpending / totalOrders) : 0;

  // Compute Weekly Activity
  const weekDataMap = { MON: 0, TUE: 0, WED: 0, THU: 0, FRI: 0, SAT: 0, SUN: 0 };
  orders.forEach((o) => {
    if (o.createdAt) {
      const date = new Date(o.createdAt);
      const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      weekDataMap[days[date.getDay()]] += 1;
    }
  });
  const dynamicWeekData = [
    { day: "MON", orders: weekDataMap["MON"] },
    { day: "TUE", orders: weekDataMap["TUE"] },
    { day: "WED", orders: weekDataMap["WED"] },
    { day: "THU", orders: weekDataMap["THU"] },
    { day: "FRI", orders: weekDataMap["FRI"] },
    { day: "SAT", orders: weekDataMap["SAT"] },
    { day: "SUN", orders: weekDataMap["SUN"] },
  ];

  // Top favourites from order history
  const itemCounts = {};
  orders.forEach((order) =>
    order.items?.forEach((item) => {
      const name = item.name;
      if (!itemCounts[name]) {
        itemCounts[name] = { count: 0, price: item.price, image: item.image };
      }
      itemCounts[name].count += item.quantity || 1;
    })
  );
  const topFavs = Object.entries(itemCounts)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 3)
    .map(([name, data]) => ({
      name,
      sub: `Ordered ${data.count} times`,
      price: formatPrice(data.price || 0),
      image: data.image,
    }));

  if (loading) {
    return (
      <div className="bg-brand-bg min-h-[calc(100vh-58px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green" />
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
            Insights Dashboard 📊
          </h1>
          <p className="text-[13px] text-brand-text-faint mb-7">
            Track your spending, orders, and nutrition
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5"
        >
          {[
            {
              label: "TOTAL SPENDING",
              value: totalSpending > 0 ? formatPrice(totalSpending) : null,
              chip: totalSpending > 0 ? "+12%" : null,
              chipColor: "#10b981",
            },
            {
              label: "TOTAL ORDERS",
              value: String(totalOrders),
              chip: totalOrders > 0 ? `+${Math.min(totalOrders, 3)}` : null,
              chipColor: "#10b981",
            },
            {
              label: "AVG ORDER",
              value: avgOrder > 0 ? formatPrice(avgOrder) : null,
              chip: "Daily",
              chipColor: "var(--text-faint)",
            },
          ].map((s, i) => (
            <Card key={i} className="py-5 shadow-none">
              <CardContent className="px-5 py-0">
                <p className="text-[10px] font-bold text-brand-text-faint tracking-wider mb-2">
                  {s.label}
                </p>
                {s.value ? (
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif-display text-[26px] text-brand-text">
                      {s.value}
                    </span>
                    {s.chip && (
                      <Badge
                        variant="outline"
                        className="text-[11px] font-bold rounded-full px-2 py-0.5 border-0"
                        style={{
                          color: s.chipColor,
                          background: s.chipColor + "22",
                        }}
                      >
                        {s.chip}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-brand-text-faint">
                    No data available yet
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Charts Row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4.5 mb-4.5"
        >
          {/* Weekly Activity Chart */}
          <Card className="py-6 shadow-none">
            <CardContent className="px-6 py-0">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif-display text-[17px] text-brand-text">
                  Weekly Activity
                </h3>
                <Badge className="bg-brand-green text-white rounded-full px-3 py-1 text-[11px] font-bold border-0">
                  ● ORDERS
                </Badge>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={dynamicWeekData} barCategoryGap="25%" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "var(--text-faint)" }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="orders" radius={[4, 4, 0, 0]}>
                    {dynamicWeekData.map((_, idx) => (
                      <Cell
                        key={idx}
                        fill={`url(#greenGrad)`}
                      />
                    ))}
                  </Bar>
                  <defs>
                    <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4ade80" />
                      <stop offset="100%" stopColor="var(--green)" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
              <Badge
                variant="outline"
                className="mt-2 text-[10px] text-brand-text-faint border-brand-border rounded-full bg-brand-bg/50"
              >
                Based on your order history
              </Badge>
            </CardContent>
          </Card>

          {/* Right Panel */}
          <Card className="py-5 shadow-none">
            <CardContent className="px-5 py-0">
              <h3 className="font-serif-display text-[17px] text-brand-text mb-4">
                Spending Breakdown
              </h3>
              {SPENDING_BREAKDOWN.map((s) => (
                <div key={s.label} className="mb-3.5">
                  <div className="flex justify-between text-xs text-brand-text-muted font-medium mb-1.5">
                    <span>{s.label}</span>
                    <span>{s.pct}%</span>
                  </div>
                  <div className="bg-brand-green-light rounded-md h-2 overflow-hidden">
                    <div
                      className="h-full rounded-md transition-all duration-1000"
                      style={{ width: `${s.pct}%`, background: s.color }}
                    />
                  </div>
                </div>
              ))}

              <h3 className="font-serif-display text-[17px] text-brand-text mt-5 mb-3">
                Top Favorites
              </h3>
              {topFavs.length > 0 ? (
                topFavs.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 mb-2.5">
                    <img
                      src={
                        f.image ||
                        "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=60&q=80"
                      }
                      alt={f.name}
                      className="w-[34px] h-[34px] rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-brand-text truncate">
                        {f.name}
                      </p>
                      <p className="text-[11px] text-brand-text-faint">
                        {f.sub}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-brand-green">
                      {f.price}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-brand-text-faint">
                  No data available yet
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Nutrition Summary */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="py-6 shadow-none">
            <CardContent className="px-6 py-0 flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="flex-1">
                <h3 className="font-serif-display text-[17px] text-brand-text">
                  Nutrition Summary
                </h3>
                <p className="text-[13px] text-brand-text-muted mt-1 mb-2.5">
                  You are on track with your protein goals this week! Keep it
                  up.
                </p>
                <Badge
                  variant="outline"
                  className="bg-brand-green-light text-brand-green border-brand-green-border rounded-full px-3 py-1 text-[11px] font-bold"
                >
                  DAILY AVG: 1,850 KCAL
                </Badge>
                <p className="text-[10px] text-brand-text-faint mt-2">
                  Demo data — personalized insights coming soon
                </p>
              </div>
              <div className="flex gap-6 items-center">
                {NUTRITION.map((n) => (
                  <Circle
                    key={n.label}
                    pct={n.pct}
                    color={n.color}
                    label={n.label}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentInsights;
