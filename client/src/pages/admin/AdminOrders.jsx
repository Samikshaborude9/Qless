import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, LogOut } from "lucide-react";

const AdminOrders = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  const orders = [
    { id: "Q7X9KL", customer: "Student A", items: "Vada Pav x2, Tea", total: 44, status: "preparing", time: "2 min ago" },
    { id: "Q3M8PQ", customer: "Student B", items: "Masala Dosa, Samosa x2", total: 74, status: "preparing", time: "5 min ago" },
    { id: "Q1K4RT", customer: "Student C", items: "Poha x3", total: 75, status: "ready", time: "8 min ago" },
    { id: "Q9P2WX", customer: "Student D", items: "Uttappa x2", total: 80, status: "completed", time: "15 min ago" },
    { id: "Q5N7LM", customer: "Student E", items: "Samosa Chaat, Tea x2", total: 50, status: "completed", time: "20 min ago" },
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
            <h1 className="text-4xl font-bold">All Orders</h1>
            <p className="text-muted-foreground">Manage all orders</p>
          </div>
        </div>

        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      #{order.id}
                      <Badge
                        variant={
                          order.status === "completed"
                            ? "default"
                            : order.status === "ready"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {order.status}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {order.customer} • {order.time}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-primary">₹{order.total}</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <p className="text-muted-foreground">{order.items}</p>
                  {order.status === "preparing" && (
                    <Button size="sm">Mark Ready</Button>
                  )}
                  {order.status === "ready" && (
                    <Button size="sm" variant="secondary">Mark Completed</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminOrders;
