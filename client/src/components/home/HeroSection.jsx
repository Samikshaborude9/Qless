import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Powered Dining Experience</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-semibold 
               leading-tight md:leading-tight
               mb-6 bg-linear-to-r 
               from-foreground to-foreground/70 
               bg-clip-text text-transparent 
               tracking-tight">
              Queue-Free Dining,
              <br />
              Powered by AI
          </h1>


          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A smart, real-time dining solution for universities — order, track, and dine without queues.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/how-it-works">
              <Button size="lg" className="group bg-blue-600 text-white hover:bg-blue-700">
                Try Demo
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Learn More
            </Button>
          </div>
        </motion.div>

        {/* <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
          <div className="rounded-2xl bg-card border border-border p-4 shadow-2xl">
            <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <p className="text-muted-foreground">Interactive Demo Preview</p>
              </div>
            </div>
          </div>
        </motion.div> */}
      </div>
    </section>
  );
};

export default HeroSection;
