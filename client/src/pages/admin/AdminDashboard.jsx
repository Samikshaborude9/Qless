import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, TrendingUp, Users, Clock, LogOut } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  // Mock data
  const stats = [
    { title: "Total Orders Today", value: "47", icon: ShoppingBag, color: "text-primary" },
    { title: "Revenue Today", value: "₹2,340", icon: TrendingUp, color: "text-accent" },
    { title: "Active Users", value: "12", icon: Users, color: "text-blue-500" },
    { title: "Avg. Wait Time", value: "8 min", icon: Clock, color: "text-orange-500" },
  ];

  const activeOrders = [
    { id: "Q7X9KL", items: "Vada Pav x2, Tea", status: "preparing", time: "2 min ago" },
    { id: "Q3M8PQ", items: "Masala Dosa, Samosa x2", status: "preparing", time: "5 min ago" },
    { id: "Q1K4RT", items: "Poha x3", status: "ready", time: "8 min ago" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">Q</span>
              </div>
              <span className="font-bold text-xl">Qless Admin</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/admin/analytics">
                <Button variant="ghost" size="sm">Analytics</Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Monitor orders and performance</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Orders in Progress</CardTitle>
              <CardDescription>Currently being prepared</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">#{order.id}</p>
                        <Badge
                          variant={order.status === "ready" ? "default" : "secondary"}
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{order.items}</p>
                      <p className="text-xs text-muted-foreground mt-1">{order.time}</p>
                    </div>
                    {order.status === "preparing" && (
                      <Button size="sm">Mark Ready</Button>
                    )}
                  </div>
                ))}
              </div>
              <Link to="/admin/orders">
                <Button variant="outline" className="w-full mt-4">
                  View All Orders
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Popular Items Today</CardTitle>
              <CardDescription>Most ordered items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Vada Pav", orders: 15, percentage: 32 },
                  { name: "Masala Dosa", orders: 12, percentage: 26 },
                  { name: "Samosa", orders: 10, percentage: 21 },
                  { name: "Poha", orders: 8, percentage: 17 },
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-muted-foreground">{item.orders} orders</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${item.percentage}%` }}
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

export default AdminDashboard;
