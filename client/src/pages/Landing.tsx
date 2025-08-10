import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Menu from "@/components/Menu";
import Cart from "@/components/Cart";
import OrderTracking from "@/components/OrderTracking";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";

export default function Landing() {
  const { isCartOpen, currentOrder } = useAppContext();

  useEffect(() => {
    document.title = "La Campana Restaurant - Premium Maritime Dining";
  }, []);

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
