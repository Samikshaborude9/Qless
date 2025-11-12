import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Target, Rocket, Heart } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-center">
              About Qless
            </h1>
            <p className="text-xl text-muted-foreground mb-12 text-center">
              Revolutionizing university dining through intelligent technology
            </p>

            <div className="prose prose-lg max-w-none mb-16">
              <div className="bg-card rounded-2xl p-8 border border-border mb-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Our Mission</h2>
                    <p className="text-muted-foreground">
                      To eliminate waiting queues in university canteens through AI-powered ordering systems,
                      creating a seamless dining experience for students and staff alike.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-2xl p-8 border border-border mb-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Rocket className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">The Problem</h2>
                    <p className="text-muted-foreground mb-4">
                      University canteens face significant challenges:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Long waiting queues during peak hours</li>
                      <li>• Inefficient order processing systems</li>
                      <li>• Limited time for students between classes</li>
                      <li>• Difficulty in managing inventory and demand</li>
                      <li>• Poor visibility into order status</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-2xl p-8 border border-border">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Our Solution</h2>
                    <p className="text-muted-foreground mb-4">
                      Qless addresses these challenges with cutting-edge technology:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• <strong>AI-Powered Ordering:</strong> Natural language processing for voice and text orders</li>
                      <li>• <strong>Smart Tokens:</strong> Digital tokens with real-time status tracking</li>
                      <li>• <strong>Predictive Analytics:</strong> Anticipate demand and optimize kitchen workflow</li>
                      <li>• <strong>Real-Time Dashboards:</strong> Live updates for students and staff</li>
                      <li>• <strong>Contactless Experience:</strong> Complete ordering from mobile devices</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center bg-secondary rounded-2xl p-12">
              <h2 className="text-3xl font-bold mb-4">Built for Universities</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Qless is designed specifically for the unique needs of university dining,
                combining speed, efficiency, and intelligence to create the best possible experience.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
