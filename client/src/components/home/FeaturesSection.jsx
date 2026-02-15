import { motion } from "framer-motion";
import { MessageSquare, Ticket, BarChart3, Smartphone, Clock } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "Conversational AI Ordering",
      description: "Natural voice and text-based ordering that understands your preferences.",
    },
    {
      icon: Ticket,
      title: "Smart Digital Tokens",
      description: "Get unique tokens with estimated wait times for seamless tracking.",
    },
    {
      icon: BarChart3,
      title: "Real-Time Dashboards",
      description: "Staff and students get live updates on order status and queue length.",
    },
    {
      icon: Clock,
      title: "Predictive Analytics",
      description: "AI predicts peak hours and optimizes kitchen workflow automatically.",
    },
    {
      icon: Smartphone,
      title: "Contactless Experience",
      description: "Complete ordering and payment flow from your mobile device.",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-semibold mb-4">Powerful Features</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need for a seamless dining experience
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <feature.icon className="w-6 h-6 text-blue-500 group-hover:text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
