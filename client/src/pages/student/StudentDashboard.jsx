import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Clock, Ticket, LogOut } from "lucide-react";
// Food Images
import AlooParatha from "@/assets/Aloo Paratha.jpg";
import BhindiMasala from "@/assets/Bhindi Masala.jpg";
import DalKhichdi from "@/assets/Dal Khichdi.jpg";
import DalTadka from "@/assets/dal_tadka.jpg";
import Dhokla from "@/assets/Dhokla.jpg";
import HakkaNoodles from "@/assets/hakka noddles.jpg";
import ManchurianRice from "@/assets/manchurian rice.jpg";
import ManchurianNoodles from "@/assets/manchurian-noodles.png";
import MasalaDosa from "@/assets/masala dosa.jpg";
import MatarPaneer from "@/assets/Matar Paneer.jpg";
import MeduVada from "@/assets/Medu Vada.jpg";
import Misal from "@/assets/Misal.jpg";
import MushroomMasala from "@/assets/Mushroom masala.png";
import PaneerBiryani from "@/assets/Paneer Biryani.jpg";
import PavBhaji from "@/assets/pav bhaji.jpg";
import Poha from "@/assets/Poha.jpg";
import SabudanaVada from "@/assets/Sabudana Vada.jpg";
import SamosaChaat from "@/assets/Samosa Chaat.jpg";
import Samosa from "@/assets/Samosa.jpg";
import ShezwanRice from "@/assets/sehezwan rice.png";
import Tea from "@/assets/tea.png";
import Uttappa from "@/assets/Uttappa.jpg";
import VadaPav from "@/assets/Vada Pav.jpeg";
import VegBiryani from "@/assets/Veg Biryani.png";
import VegFriedRice from "@/assets/veg fried rice.png";
import VegPulav from "@/assets/veg pulav.jpg";


const StudentDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-muted-foreground">Ready to order your meal?</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                Quick Order
              </CardTitle>
              <CardDescription>Place a new order</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/how-it-works">
                <Button className="w-full">Order Now</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-black" />
                Active Orders
              </CardTitle>
              <CardDescription>Track your current orders</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">No active orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                Order History
              </CardTitle>
              <CardDescription>View past orders</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/student/orders">
                <Button variant="outline" className="w-full">View History</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div>
  <h2 className="text-2xl font-bold mb-6">Popular Items</h2>

  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {[
      { name: "Aloo Paratha", price: 30, image: AlooParatha },
      { name: "Bhindi Masala", price: 45, image: BhindiMasala },
      { name: "Dal Khichdi", price: 35, image: DalKhichdi },
      { name: "Dal Tadka", price: 40, image: DalTadka },
      { name: "Dhokla", price: 25, image: Dhokla },
      { name: "Hakka Noodles", price: 50, image: HakkaNoodles },
      { name: "Manchurian Rice", price: 55, image: ManchurianRice },
      { name: "Manchurian Noodles", price: 55, image: ManchurianNoodles },
      { name: "Masala Dosa", price: 40, image: MasalaDosa },
      { name: "Matar Paneer", price: 60, image: MatarPaneer },
      { name: "Medu Vada", price: 35, image: MeduVada },
      { name: "Misal", price: 30, image: Misal },
      { name: "Mushroom Masala", price: 65, image: MushroomMasala },
      { name: "Paneer Biryani", price: 70, image: PaneerBiryani },
      { name: "Pav Bhaji", price: 45, image: PavBhaji },
      { name: "Poha", price: 25, image: Poha },
      { name: "Sabudana Vada", price: 30, image: SabudanaVada },
      { name: "Samosa Chaat", price: 35, image: SamosaChaat },
      { name: "Samosa", price: 17, image: Samosa },
      { name: "Shezwan Rice", price: 50, image: ShezwanRice },
      { name: "Tea", price: 15, image: Tea },
      { name: "Uttappa", price: 40, image: Uttappa },
      { name: "Vada Pav", price: 17, image: VadaPav },
      { name: "Veg Biryani", price: 60, image: VegBiryani },
      { name: "Veg Fried Rice", price: 50, image: VegFriedRice },
      { name: "Veg Pulav", price: 45, image: VegPulav },
    ].map((item, index) => (
      <Card
  key={index}
  className="group rounded-2xl border-gray-600 
             bg-card hover:shadow-xl 
             transition-all duration-300 hover:-translate-y-1"
>
  <CardContent className="p-4">
    
    {/* Image Wrapper with Padding */}
    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden">
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Soft overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-60" />
    </div>

    {/* Content */}
    <div className="mt-4 flex justify-between items-center">
      <h3 className="font-semibold text-base tracking-tight">
        {item.name}
      </h3>

      <span className="text-lg font-bold text-primary">
        ₹{item.price}
      </span>
    </div>

  </CardContent>
</Card>


    ))}
  </div>
</div>

      </main>
    </div>
  );
};

export default StudentDashboard;
