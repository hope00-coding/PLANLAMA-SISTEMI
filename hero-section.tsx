import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const scrollToPreferences = () => {
    const element = document.getElementById("preferences");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="relative bg-gradient-to-br from-blue-50 to-violet-50 py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
              Discover Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
                {" "}Perfect Match
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Get personalized recommendations tailored to your unique preferences. Our intelligent system learns what you love and suggests exactly what you're looking for.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={scrollToPreferences}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105"
              >
                Start Discovering
              </Button>
              <Button 
                variant="outline"
                className="border-2 border-slate-300 hover:border-slate-400 text-slate-700 px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </div>
          <div className="relative">
            {/* Modern recommendation interface mockup */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gradient-to-r from-blue-200 to-violet-200 rounded w-3/4"></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-20 bg-slate-100 rounded-lg"></div>
                  <div className="h-20 bg-slate-100 rounded-lg"></div>
                </div>
                <div className="h-3 bg-slate-200 rounded w-full"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
