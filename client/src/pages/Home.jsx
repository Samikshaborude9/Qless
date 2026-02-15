import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import CTASection from "@/components/home/CTASection";

const Home = () => {
  return (
    <div className="min-h-screen bg-[#f9fafb] text-slate-900">
  <Navbar />
  <main className="max-w-6xl mx-auto px-6">
    <HeroSection />
    <AboutSection />
    <FeaturesSection />
    <CTASection />
  </main>
  <Footer />
</div>

  );
};

export default Home;
