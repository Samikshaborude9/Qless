import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Ticket, CheckCircle2, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const HowItWorks = () => {
  const { toast } = useToast();
  const [cart, setCart] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [tokenId, setTokenId] = useState("");
  const [estimatedTime, setEstimatedTime] = useState(0);

  const menuItems = [
    { id: "1", name: "Vada Pav", price: 17, category: "Breakfast", available: true },
    { id: "2", name: "Samosa", price: 17, category: "Breakfast", available: true },
    { id: "3", name: "Masala Dosa", price: 40, category: "Breakfast", available: true },
    { id: "4", name: "Uttappa", price: 40, category: "Breakfast", available: true },
    { id: "5", name: "Poha", price: 25, category: "Breakfast", available: true },
    { id: "6", name: "Samosa Chaat", price: 30, category: "Breakfast", available: true },
    { id: "7", name: "Aloo Paratha", price: 30, category: "Breakfast", available: true },
    { id: "8", name: "Tea", price: 10, category: "Beverages", available: true },
  ];

  const addToCart = (item) => {
    const existing = cart.find((c) => c.item.id === item.id);
    if (existing) {
      setCart(cart.map((c) => (c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)));
    } else {
      setCart([...cart, { item, quantity: 1 }]);
    }
    toast({ title: "Added to cart", description: `${item.name} added` });
  };

  const updateQuantity = (itemId, delta) => {
    setCart(
      cart
        .map((c) => (c.item.id === itemId ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0)
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);
  };

  const placeOrder = () => {
    if (cart.length === 0) {
      toast({ title: "Cart is empty", description: "Please add items to cart", variant: "destructive" });
      return;
    }

    const token = "Q" + Math.random().toString(36).substr(2, 6).toUpperCase();
    const time = Math.floor(Math.random() * 10) + 5;

    setTokenId(token);
    setEstimatedTime(time);
    setOrderPlaced(true);

    toast({
      title: "Order Placed! ✅",
      description: `Your token: ${token}. Estimated time: ${time} minutes`,
    });

    setTimeout(() => {
      toast({ title: "Order Ready! 🎉", description: "Your order is ready for pickup" });
    }, 3000);
  };

  const resetDemo = () => {
    setCart([]);
    setOrderPlaced(false);
    setTokenId("");
    setEstimatedTime(0);
  };

  return (
    <div className="min-h-screen">
      <main className="pt-15 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight mb-4">Explore your Menu</h1>
            <p className="text-xl text-muted-foreground tracking-tight">
              Experience the Qless ordering flow with this interactive demo
            </p>
          </motion.div>

          {!orderPlaced ? (
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h2 className="text-2xl font-bold mb-6">Menu</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{item.name}</CardTitle>
                              <CardDescription>{item.category}</CardDescription>
                            </div>
                            <Badge variant={item.available ? "default" : "secondary"}>
                              {item.available ? "Available" : "Out"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center">
                            <span className="text-2xl font-bold text-primary">₹{item.price}</span>
                            <Button
                              onClick={() => addToCart(item)}
                              disabled={!item.available}
                              size="sm"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div>
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      Your Cart
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {cart.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">Cart is empty</p>
                    ) : (
                      <>
                        <div className="space-y-4 mb-6">
                          {cart.map((c) => (
                            <div key={c.item.id} className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium">{c.item.name}</p>
                                <p className="text-sm text-muted-foreground">₹{c.item.price}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(c.item.id, -1)}
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-8 text-center font-medium">{c.quantity}</span>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(c.item.id, 1)}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="border-t pt-4 mb-4">
                          <div className="flex justify-between items-center text-lg font-bold">
                            <span>Total</span>
                            <span className="text-primary">₹{getTotalPrice()}</span>
                          </div>
                        </div>

                        <Button onClick={placeOrder} className="w-full" size="lg">
                          Place Order
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-10 h-10 text-blue-700" />
                  </div>
                  <CardTitle className="text-3xl">Order Accepted!</CardTitle>
                  <CardDescription>Your order has been placed successfully</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-primary/5 rounded-xl p-6">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <Ticket className="w-6 h-6 text-primary" />
                      <span className="text-sm text-muted-foreground">Your Token</span>
                    </div>
                    <p className="text-4xl font-bold text-primary">{tokenId}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground mb-2">Estimated Wait Time</p>
                    <p className="text-3xl font-bold">{estimatedTime} minutes</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-accent">
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      <span className="font-medium">Preparing your order...</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <p className="text-sm text-muted-foreground mb-4">Order Summary</p>
                    <div className="space-y-2 text-left max-w-sm mx-auto">
                      {cart.map((c) => (
                        <div key={c.item.id} className="flex justify-between text-sm">
                          <span>
                            {c.item.name} x{c.quantity}
                          </span>
                          <span>₹{c.item.price * c.quantity}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 flex justify-between font-bold">
                        <span>Total</span>
                        <span className="text-primary">₹{getTotalPrice()}</span>
                      </div>
                    </div>
                  </div>

                  <Button onClick={resetDemo} variant="outline" className="w-full">
                    Try Another Order
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
      {/* <Footer /> */}
    </div>
  );
};

export default HowItWorks;
