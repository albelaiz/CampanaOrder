import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";
import logoImage from "@assets/WhatsApp Image 2025-08-09 at 14.06.26_5064a253_1754854384884.jpg";

export default function Footer() {
  const { setCurrentTable, setIsCartOpen } = useAppContext();

  const scrollToMenu = () => {
    const menuElement = document.getElementById('menu');
    if (menuElement) {
      menuElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const simulateQRScan = () => {
    // Simulate QR code scanning - in production this would use device camera
    const tableNumber = Math.floor(Math.random() * 20) + 1;
    setCurrentTable(tableNumber);
    
    // Auto-scroll to menu after QR scan
    setTimeout(() => {
      scrollToMenu();
    }, 1000);
  };

  const handlePhoneCall = () => {
    window.open('tel:+212616316245', '_self');
  };

  return (
    <footer id="contact" className="bg-charcoal py-12" data-testid="footer">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-4 mb-6">
              <img 
                src={logoImage} 
                alt="La Campana Logo" 
                className="h-16 w-auto"
                data-testid="footer-logo"
              />
              <div>
                <h3 className="font-cinzel text-xl font-bold text-gold">La Campana</h3>
                <p className="text-amber">Chef Hicham</p>
              </div>
            </div>
            <p className="text-warm-white leading-relaxed" data-testid="footer-description">
              Experience the finest Mediterranean cuisine in an elegant maritime atmosphere. 
              Fresh seafood, traditional recipes, and exceptional service.
            </p>
          </div>
          
          {/* Contact Information */}
          <div>
            <h3 className="font-cinzel text-xl font-bold text-gold mb-4" data-testid="contact-title">
              Contact Info
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <i className="fas fa-phone text-gold"></i>
                <button 
                  onClick={handlePhoneCall}
                  className="text-warm-white hover:text-gold transition-colors duration-300"
                  data-testid="contact-phone"
                >
                  +212 616 316 245
                </button>
              </div>
              <div className="flex items-start space-x-3">
                <i className="fas fa-map-marker-alt text-gold mt-1"></i>
                <p className="text-warm-white" data-testid="contact-address">
                  قرب شارع الحسن الثاني أمام الكليات، مرتيل 93150
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fas fa-clock text-gold"></i>
                <p className="text-warm-white" data-testid="contact-hours">
                  Daily: 12:00 PM - 11:00 PM
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <i className="fas fa-envelope text-gold"></i>
                <p className="text-warm-white" data-testid="contact-email">
                  info@lacampana-martil.com
                </p>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div>
            <h3 className="font-cinzel text-xl font-bold text-gold mb-4" data-testid="quick-order-title">
              Quick Order
            </h3>
            <div className="space-y-3">
              <Button
                onClick={simulateQRScan}
                className="w-full gold-gradient text-navy py-3 rounded-lg font-medium hover:opacity-90 transition-opacity duration-300"
                data-testid="button-scan-qr-footer"
              >
                <i className="fas fa-qrcode mr-2"></i>Scan Table QR
              </Button>
              <Button
                onClick={scrollToMenu}
                variant="outline"
                className="w-full border-2 border-gold text-gold py-3 rounded-lg font-medium hover:bg-gold hover:text-navy transition-colors duration-300"
                data-testid="button-view-menu-footer"
              >
                <i className="fas fa-utensils mr-2"></i>View Menu
              </Button>
              <Button
                onClick={() => setIsCartOpen(true)}
                variant="outline"
                className="w-full border-2 border-gold text-gold py-3 rounded-lg font-medium hover:bg-gold hover:text-navy transition-colors duration-300"
                data-testid="button-view-cart-footer"
              >
                <i className="fas fa-shopping-cart mr-2"></i>View Cart
              </Button>
            </div>
            
            {/* Social Links */}
            <div className="mt-6">
              <h4 className="font-cinzel font-bold text-gold mb-3">Follow Us</h4>
              <div className="flex space-x-4">
                <button className="text-warm-white hover:text-gold transition-colors duration-300" data-testid="social-facebook">
                  <i className="fab fa-facebook-f text-xl"></i>
                </button>
                <button className="text-warm-white hover:text-gold transition-colors duration-300" data-testid="social-instagram">
                  <i className="fab fa-instagram text-xl"></i>
                </button>
                <button className="text-warm-white hover:text-gold transition-colors duration-300" data-testid="social-whatsapp">
                  <i className="fab fa-whatsapp text-xl"></i>
                </button>
                <button className="text-warm-white hover:text-gold transition-colors duration-300" data-testid="social-tripadvisor">
                  <i className="fab fa-tripadvisor text-xl"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-gold border-opacity-30 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-warm-white text-center md:text-left" data-testid="copyright">
              © 2024 La Campana Restaurant. All rights reserved.
            </p>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>Designed for premium dining experience</span>
              <span>•</span>
              <span>Chef Hicham's Maritime Cuisine</span>
            </div>
          </div>
          
          {/* Technical Credits */}
          <div className="text-center mt-4 text-xs text-muted-foreground">
            <p>Premium restaurant ordering system with real-time updates</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
