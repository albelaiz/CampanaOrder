import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";
import logoImage from "@assets/WhatsApp Image 2025-08-09 at 14.06.26_5064a253_1754854384884.jpg";

export default function Hero() {
  const { currentTable, setCurrentTable } = useAppContext();

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

  return (
    <section className="min-h-screen maritime-bg flex items-center justify-center relative overflow-hidden pt-20" id="hero">
      {/* Floating Maritime Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 text-gold opacity-20 animate-float">
          <i className="fas fa-anchor text-4xl"></i>
        </div>
        <div className="absolute top-40 right-20 text-gold opacity-15 animate-float" style={{ animationDelay: '1s' }}>
          <i className="fas fa-ship text-3xl"></i>
        </div>
        <div className="absolute bottom-40 left-20 text-gold opacity-10 animate-float" style={{ animationDelay: '2s' }}>
          <i className="fas fa-compass text-5xl"></i>
        </div>
      </div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Large Logo Display */}
          <div className="mb-8 animate-pulse-gold rounded-lg p-8" data-testid="hero-logo">
            <img 
              src={logoImage} 
              alt="La Campana Restaurant - Chef Hicham" 
              className="h-32 md:h-48 w-auto mx-auto"
            />
          </div>
          
          <h1 className="font-cinzel text-4xl md:text-6xl font-bold text-gold mb-6" data-testid="hero-title">
            Premium Maritime Dining
          </h1>
          <p className="text-xl md:text-2xl text-warm-white mb-8 leading-relaxed" data-testid="hero-description">
            Experience Chef Hicham's exquisite seafood cuisine in our elegant Mediterranean atmosphere
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <Button
              onClick={scrollToMenu}
              className="gold-gradient text-navy px-8 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity duration-300 flex items-center space-x-2"
              data-testid="button-view-menu"
            >
              <i className="fas fa-utensils"></i>
              <span>View Our Menu</span>
            </Button>
            <Button
              variant="outline"
              onClick={simulateQRScan}
              className="border-2 border-gold text-gold px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gold hover:text-navy transition-colors duration-300 flex items-center space-x-2"
              data-testid="button-scan-qr"
            >
              <i className="fas fa-qrcode"></i>
              <span>Scan Table QR</span>
            </Button>
          </div>
          
          {/* Table Number Display (when QR scanned) */}
          {currentTable && (
            <Card className="mt-8 premium-card rounded-lg max-w-md mx-auto" data-testid="table-info">
              <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-3">
                  <i className="fas fa-table text-gold text-xl"></i>
                  <span className="text-lg text-warm-white">
                    Table <span className="font-bold text-gold" data-testid="table-number">{currentTable}</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
