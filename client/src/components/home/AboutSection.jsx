import { motion } from "framer-motion";
import { Target, Lightbulb, Users } from "lucide-react";

const AboutSection = () => {
  const features = [
    {
      icon: Target,
      title: "The Problem",
      description: "Long queues, waiting times, and inefficient ordering processes plague university canteens.",
    },
    {
      icon: Lightbulb,
      title: "Our Solution",
      description: "AI-driven ordering system that eliminates queues with smart digital tokens and real-time tracking.",
    },
    {
      icon: Users,
      title: "For Everyone",
      description: "Students get faster service, staff get better workflow, and universities get satisfied communities.",
    },
  ];

  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-50 rounded-3xl">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">About Qless</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transforming university dining with intelligent technology
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-2xl p-8 border border-border hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
