import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 p-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">Q</span>
            </div>
            <span className="font-bold text-xl text-foreground ">Qless</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/features" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Features
            </Link>
            {/* <Link to="/how-it-works" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              How It Works
            </Link> */}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-blue-600 text-white hover:bg-blue-700" >Get Started</Button>
            </Link>
          </div>  

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 animate-fade-in">
            <Link
              to="/"
              className="block text-sm font-medium text-foreground hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="block text-sm font-medium text-foreground hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/features"
              className="block text-sm font-medium text-foreground hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            {/* <Link
              to="/how-it-works"
              className="block text-sm font-medium text-foreground hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link> */}
            <div className="flex flex-col space-y-2 pt-4">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full">Login</Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">Get Started</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
