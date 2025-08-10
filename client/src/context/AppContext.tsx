import { createContext, useContext, useState, ReactNode } from "react";
import { useCart } from "@/hooks/useCart";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { OrderWithItems, MenuItem } from "@shared/schema";

interface AppContextType {
  // Cart state
  cart: CartItem[];
  addToCart: (item: MenuItem, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItem: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  
  // UI state
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  
  // Table and order state
  currentTable: number | null;
  setCurrentTable: (table: number | null) => void;
  currentOrder: OrderWithItems | null;
  setCurrentOrder: (order: OrderWithItems | null) => void;
  
  // WebSocket connection
  wsConnected: boolean;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentTable, setCurrentTable] = useState<number | null>(null);
  const [currentOrder, setCurrentOrder] = useState<OrderWithItems | null>(null);
  
  const {
    cart,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    cartTotal,
    cartCount,
  } = useCart();
  
  const { connected: wsConnected } = useWebSocket();

  const value: AppContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    cartTotal,
    cartCount,
    isCartOpen,
    setIsCartOpen,
    currentTable,
    setCurrentTable,
    currentOrder,
    setCurrentOrder,
    wsConnected,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
}
