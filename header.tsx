import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-blue-600">PersonalRecommend</h1>
            </div>
          </div>
          
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <button 
                onClick={() => scrollToSection("home")}
                className="text-blue-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection("how-it-works")}
                className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection("recommendations")}
                className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Browse
              </button>
              <button 
                onClick={() => scrollToSection("contact")}
                className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Contact
              </button>
            </div>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => scrollToSection("preferences")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Get Started
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-slate-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-slate-200">
              <button 
                onClick={() => scrollToSection("home")}
                className="text-blue-600 hover:text-blue-700 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection("how-it-works")}
                className="text-slate-600 hover:text-slate-900 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection("recommendations")}
                className="text-slate-600 hover:text-slate-900 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
              >
                Browse
              </button>
              <button 
                onClick={() => scrollToSection("contact")}
                className="text-slate-600 hover:text-slate-900 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
              >
                Contact
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
