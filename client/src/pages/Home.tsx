import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Menu from "@/components/Menu";
import Cart from "@/components/Cart";
import OrderTracking from "@/components/OrderTracking";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const { isCartOpen, currentOrder } = useAppContext();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Session Expired",
        description: "Please log in again to continue.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  useEffect(() => {
    document.title = "La Campana Restaurant - Premium Maritime Dining";
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
          <p className="text-warm-white mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy text-warm-white">
      <Navbar />
      <Hero />
      <Menu />
      {currentOrder && <OrderTracking />}
      <Footer />
      {isCartOpen && <Cart />}
    </div>
  );
}
