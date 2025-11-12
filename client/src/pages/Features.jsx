import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { MessageSquare, Ticket, BarChart3, Smartphone, Clock, Shield, Zap, Users } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "Conversational AI Ordering",
      description: "Our advanced AI understands natural language, making ordering as simple as having a conversation. Voice or text - order your way.",
      benefits: ["Natural language processing", "Voice command support", "Multi-language support"],
    },
    {
      icon: Ticket,
      title: "Smart Digital Tokens",
      description: "Receive unique digital tokens with estimated wait times. Track your order in real-time from preparation to pickup.",
      benefits: ["Unique token generation", "Real-time status updates", "Estimated wait times"],
    },
    {
      icon: BarChart3,
      title: "Real-Time Dashboards",
      description: "Live dashboards provide instant visibility for both students and staff on order status, queue length, and wait times.",
      benefits: ["Live order tracking", "Queue visualization", "Performance metrics"],
    },
    {
      icon: Clock,
      title: "Predictive Analytics",
      description: "AI-powered analytics predict peak hours, popular items, and optimize kitchen workflow automatically.",
      benefits: ["Peak hour prediction", "Demand forecasting", "Automated optimization"],
    },
    {
      icon: Smartphone,
      title: "Contactless Experience",
      description: "Complete the entire ordering process from your mobile device. Order, pay, and track - all without touching a terminal.",
      benefits: ["Mobile-first design", "Secure payments", "QR code integration"],
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Enterprise-grade security protects your data and transactions with end-to-end encryption.",
      benefits: ["Data encryption", "Secure payments", "Privacy-focused"],
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized performance ensures orders are processed instantly, reducing overall wait times significantly.",
      benefits: ["Instant order processing", "Quick load times", "Efficient workflow"],
    },
    {
      icon: Users,
      title: "Role-Based Access",
      description: "Different interfaces for students and staff, each optimized for their specific needs and workflows.",
      benefits: ["Student dashboard", "Admin controls", "Staff management"],
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Powerful Features
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to transform your university dining experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-2xl p-8 border border-border hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-2">{feature.title}</h3>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                <div className="space-y-2">
                  {feature.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Features;
