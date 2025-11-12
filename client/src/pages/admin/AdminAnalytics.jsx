import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, LogOut, TrendingUp, DollarSign, Clock, Star } from "lucide-react";

const AdminAnalytics = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  const metrics = [
    { title: "Total Orders Today", value: "47", change: "+12%", icon: TrendingUp },
    { title: "Revenue Today", value: "₹2,340", change: "+8%", icon: DollarSign },
    { title: "Avg. Wait Time", value: "8 min", change: "-15%", icon: Clock },
    { title: "Customer Rating", value: "4.8", change: "+0.2", icon: Star },
  ];

  const popularItems = [
    { name: "Vada Pav", orders: 15, revenue: 255 },
    { name: "Masala Dosa", orders: 12, revenue: 480 },
    { name: "Samosa", orders: 10, revenue: 170 },
    { name: "Poha", orders: 8, revenue: 200 },
    { name: "Uttappa", orders: 6, revenue: 240 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/admin/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">Q</span>
              </div>
              <span className="font-bold text-xl">Qless Admin</span>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex items-center gap-4">
          <Link to="/admin/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Performance insights and metrics</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metrics.map((metric, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <metric.icon className="w-5 h-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold mb-1">{metric.value}</p>
                <p className="text-sm text-accent">{metric.change} from yesterday</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Items</CardTitle>
              <CardDescription>Most popular items today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {popularItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.orders} orders</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">₹{item.revenue}</p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Peak Hours</CardTitle>
              <CardDescription>Busiest times of the day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { time: "08:00 - 09:00", orders: 12, percentage: 80 },
                  { time: "09:00 - 10:00", orders: 15, percentage: 100 },
                  { time: "10:00 - 11:00", orders: 10, percentage: 67 },
                  { time: "13:00 - 14:00", orders: 8, percentage: 53 },
                  { time: "17:00 - 18:00", orders: 2, percentage: 13 },
                ].map((slot, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{slot.time}</span>
                      <span className="text-muted-foreground">{slot.orders} orders</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent"
                        style={{ width: `${slot.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminAnalytics;
