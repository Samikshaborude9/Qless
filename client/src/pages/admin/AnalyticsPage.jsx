import { useState, useEffect } from "react";
import {
  getOverviewAPI,
  getPopularDishesAPI,
  getPeakHoursAPI,
  getRevenueAPI,
} from "../../api/analyticsAPI";
import { formatPrice } from "../../lib/utils";
import {
  TrendingUp,
  BarChart3,
  Activity,
  IndianRupee,
  Users,
  ShoppingBag,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { toast } from "sonner";

export default function AnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [popularDishes, setPopularDishes] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [overviewData, dishesData, hoursData, revenueData] =
          await Promise.all([
            getOverviewAPI(),
            getPopularDishesAPI(),
            getPeakHoursAPI(),
            getRevenueAPI(),
          ]);
        setOverview(overviewData.overview);
        setPopularDishes(dishesData.popularDishes.slice(0, 5));
        setPeakHours(hoursData.peakHours);
        
        // Ensure revenue is formatted nicely for the chart
        const revData = (revenueData.revenue || []).map(r => ({
          d: new Date(r._id).toLocaleDateString("en-IN", { weekday: "short" }),
          fullDate: new Date(r._id).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
          rev: r.totalRevenue,
          orders: r.orderCount || 0
        })).reverse(); // Assuming api returns newest first or we want chronological
        
        setRevenue(revData);
      } catch (error) {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-gray-500 flex justify-center mt-20">
        Loading analytics...
      </div>
    );
  }

  // Map peak hours to the custom 7AM-8PM scale
  const HOUR_SLOTS = [
    "7AM", "8AM", "9AM", "10AM", "11AM", "12PM",
    "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM", "8PM",
  ];
  
  const hourMap = {};
  peakHours.forEach((ph) => {
    // Assuming ph.hour is 0-23
    let h = ph.hour;
    let label = "";
    if (h === 0) label = "12AM";
    else if (h < 12) label = `${h}AM`;
    else if (h === 12) label = "12PM";
    else label = `${h - 12}PM`;
    hourMap[label] = ph.orderCount;
  });

  const PEAK = HOUR_SLOTS.map((t) => ({ t, v: hourMap[t] ?? 0 }));
  const maxPeak = Math.max(...PEAK.map((p) => p.v), 1);
  const PEAK_SCALED = PEAK.map((p) => ({
    ...p,
    h: Math.round((p.v / maxPeak) * 100),
  }));

  const todayOrdersCount = PEAK.reduce((s, p) => s + p.v, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-serif">
          Analytics
        </h1>
        <p className="text-gray-500 mt-1 font-sans text-sm max-w-2xl">
          Revenue, order trends, and campus dining insights — live from your data.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            l: "Today's Revenue",
            v: formatPrice(overview?.todayRevenue ?? 0),
            icon: IndianRupee,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-100",
          },
          {
            l: "Today's Orders",
            v: overview?.todayOrders?.toLocaleString() ?? "0",
            icon: BarChart3,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-100",
          },
          {
            l: "Total Students",
            v: overview?.totalStudents?.toLocaleString() ?? "0",
            icon: Users,
            color: "text-purple-600",
            bg: "bg-purple-50",
            border: "border-purple-100",
          },
          {
            l: "Menu Items",
            v: overview?.totalMenuItems?.toString() ?? "0",
            icon: Activity,
            color: "text-amber-600",
            bg: "bg-amber-50",
            border: "border-amber-100",
          },
        ].map((k, i) => {
          const Icon = k.icon;
          return (
            <Card
              key={i}
              className={`border-none shadow-sm ${k.bg} hover:shadow-md transition`}
            >
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`w-10 h-10 rounded-full bg-white flex items-center justify-center ${k.color} shadow-sm border ${k.border}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border ${k.border} ${k.color} shadow-sm flex items-center space-x-1`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${k.color.replace(
                        "text-",
                        "bg-"
                      )} animate-pulse`}
                    ></span>
                    <span>Live</span>
                  </span>
                </div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {k.l}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{k.v}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Revenue Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm shadow-green-100/50">
          <CardHeader className="pb-2 border-b border-gray-50">
            <CardTitle className="text-lg font-bold text-gray-800 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-700" />
              <span>Revenue Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 pl-0">
            {revenue.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                No revenue data yet
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={revenue}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f3f4f6"
                    />
                    <XAxis
                      dataKey="d"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9ca3af", fontSize: 12, fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9ca3af", fontSize: 12, fontWeight: 600 }}
                      tickFormatter={(val) =>
                        val >= 1000 ? `₹${(val / 1000).toFixed(1)}k` : `₹${val}`
                      }
                      dx={-10}
                    />
                    <RechartsTooltip
                      cursor={{ fill: "#f3f4f6" }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
                              <p className="font-bold text-gray-900 mb-1">
                                {payload[0].payload.fullDate}
                              </p>
                              <p className="text-emerald-600 font-semibold text-sm">
                                Revenue: ₹
                                {payload[0].value.toLocaleString("en-IN")}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="rev" radius={[4, 4, 0, 0]}>
                      {revenue.map((entry, index) => (
                        <Cell
                          key={`cell-\${index}`}
                          fill={entry.rev > 0 ? "#10b981" : "#e5e7eb"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popular Dishes */}
        <Card className="border-none shadow-sm shadow-gray-200">
          <CardHeader className="pb-2 border-b border-gray-50">
            <CardTitle className="text-lg font-bold text-gray-800 flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-blue-500" />
              <span>Popular Dishes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {popularDishes.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-10">
                No order data yet.
              </p>
            ) : (
              <div className="space-y-6">
                {popularDishes.map((dish, i) => (
                  <div key={dish._id}>
                    <div className="flex justify-between items-end mb-2">
                      <span className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-blue-50 text-blue-600 text-xs flex items-center justify-center font-bold">
                          {i + 1}
                        </span>
                        {dish.name}
                      </span>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-sm">
                          {dish.totalQuantity} sold
                        </p>
                        <p className="text-xs text-gray-500 font-semibold">
                          {formatPrice(dish.totalRevenue)}
                        </p>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out bg-blue-500"
                        style={{
                          width: `${
                            (dish.totalQuantity /
                              popularDishes[0].totalQuantity) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Peak Hours */}
      <Card className="border-none shadow-sm shadow-gray-200">
        <CardHeader className="pb-2 border-b border-gray-50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <CardTitle className="text-lg font-bold text-gray-800 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-amber-500" />
              <span>Peak Hours (Historical)</span>
            </CardTitle>
            <p className="text-xs font-semibold text-gray-500 mt-2 md:mt-0 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
              Aggregated from all orders
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-8 overflow-x-auto pb-4">
          <div className="flex items-end justify-between min-w-[700px] h-[160px] mb-6">
            {PEAK_SCALED.map((p) => {
              const isPeak = p.h > 80;
              const isBusy = p.h > 50;
              const hasOrders = p.v > 0;
              let barColor = "bg-gray-200";
              if (isPeak) barColor = "bg-red-500";
              else if (isBusy) barColor = "bg-amber-500";
              else if (hasOrders) barColor = "bg-emerald-500";

              return (
                <div key={p.t} className="flex flex-col items-center flex-1 group">
                  <div className="relative w-full flex justify-center">
                    {/* Tooltip */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
                      {p.v} orders
                    </div>
                    {/* Bar */}
                    <div
                      className={`w-8 rounded-t-sm transition-all duration-500 ${barColor} group-hover:opacity-80`}
                      style={{ height: `${Math.max(p.h, p.v > 0 ? 6 : 0)}px` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 mt-3 uppercase tracking-wider">
                    {p.t}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center space-x-6 text-xs font-bold text-gray-500 uppercase tracking-wider border-t border-gray-50 pt-6">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Peak</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Busy</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Normal</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-200" />
              <span>No orders</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
