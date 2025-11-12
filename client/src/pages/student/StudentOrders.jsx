import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, LogOut } from "lucide-react";

const StudentOrders = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  // Mock order data
  const orders = [
    {
      id: "Q7X9KL",
      date: "2025-01-15",
      items: [
        { name: "Vada Pav", quantity: 2, price: 17 },
        { name: "Tea", quantity: 1, price: 10 },
      ],
      total: 44,
      status: "completed",
    },
    {
      id: "Q3M8PQ",
      date: "2025-01-14",
      items: [
        { name: "Masala Dosa", quantity: 1, price: 40 },
        { name: "Samosa", quantity: 2, price: 17 },
      ],
      total: 74,
      status: "completed",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/student/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">Q</span>
              </div>
              <span className="font-bold text-xl">Qless Student</span>
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
          <Link to="/student/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold">Order History</h1>
            <p className="text-muted-foreground">View your past orders</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground">No orders yet</p>
              <Link to="/how-it-works">
                <Button className="mt-4">Place Your First Order</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Order #{order.id}
                        <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                          {order.status}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{order.date}</p>
                    </div>
                    <p className="text-2xl font-bold text-primary">₹{order.total}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>
                          {item.name} x{item.quantity}
                        </span>
                        <span className="text-muted-foreground">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentOrders;
