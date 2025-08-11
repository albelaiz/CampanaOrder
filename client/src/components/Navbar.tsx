import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAppContext } from "@/context/AppContext";
import logoImage from "@assets/WhatsApp Image 2025-08-09 at 14.06.26_5064a253_1754854384884.jpg";

export default function Navbar() {
  const { isAuthenticated, user } = useAuth();
  const { currentTable } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-morphism" data-testid="navbar">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src={logoImage} 
              alt="La Campana Restaurant Logo" 
              className="h-12 w-auto animate-shimmer"
              data-testid="logo"
            />
            <div className="hidden md:block">
              <h1 className="font-cinzel text-xl font-bold text-gold">La Campana</h1>
              <p className="text-xs text-amber">Chef Hicham</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('menu')}
              className="text-gold hover:text-amber transition-colors duration-300 font-medium"
              data-testid="nav-menu"
            >
              Menu
            </button>
            <button 
              onClick={() => scrollToSection('about')}
              className="text-gold hover:text-amber transition-colors duration-300 font-medium"
              data-testid="nav-about"
            >
              About
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="text-gold hover:text-amber transition-colors duration-300 font-medium"
              data-testid="nav-contact"
            >
              Contact
            </button>

            {currentTable && (
              <div className="text-warm-white border-l border-gold border-opacity-30 pl-4">
                <span className="text-sm">Table</span>
                <div className="text-gold font-bold text-lg">{currentTable}</div>
              </div>
            )}
            
            {isAuthenticated && (
              <div className="flex items-center space-x-4">
                {(user?.role === 'staff' || user?.role === 'admin') && (
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = user.role === 'admin' ? '/admin' : '/staff'}
                    className="border-gold text-gold hover:bg-gold hover:text-navy"
                    data-testid="button-dashboard"
                  >
                    Dashboard
                  </Button>
                )}
              </div>
            )}
          </div>
          
          <button 
            className="md:hidden text-gold"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            <i className="fas fa-bars text-xl"></i>
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gold border-opacity-30">
            <div className="flex flex-col space-y-4">
              <button 
                onClick={() => scrollToSection('menu')}
                className="text-gold hover:text-amber transition-colors duration-300 font-medium text-left"
                data-testid="nav-menu-mobile"
              >
                Menu
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className="text-gold hover:text-amber transition-colors duration-300 font-medium text-left"
                data-testid="nav-about-mobile"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-gold hover:text-amber transition-colors duration-300 font-medium text-left"
                data-testid="nav-contact-mobile"
              >
                Contact
              </button>
              
              {isAuthenticated && (
                <div className="flex flex-col space-y-2 pt-2">
                  {(user?.role === 'staff' || user?.role === 'admin') && (
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = user.role === 'admin' ? '/admin' : '/staff'}
                      className="border-gold text-gold hover:bg-gold hover:text-navy justify-start"
                      data-testid="button-dashboard-mobile"
                    >
                      Dashboard
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
