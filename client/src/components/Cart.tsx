import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Cart() {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { 
    cart, 
    cartTotal, 
    cartCount, 
    isCartOpen, 
    setIsCartOpen, 
    updateCartItem, 
    removeFromCart, 
    clearCart,
    currentTable,
    setCurrentOrder 
  } = useAppContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const checkoutMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return await apiRequest("POST", "/api/orders", orderData);
    },
    onSuccess: async (response) => {
      const order = await response.json();
      setCurrentOrder(order);
      clearCart();
      setIsCartOpen(false);
      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${order.orderNumber} has been submitted to the kitchen.`,
      });
      
      // Scroll to order tracking section
      setTimeout(() => {
        const trackingElement = document.getElementById('order-tracking');
        if (trackingElement) {
          trackingElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    },
    onError: (error) => {
      console.error("Checkout error:", error);
      toast({
        title: "Order Failed",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsCheckingOut(false);
    },
  });

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    if (!currentTable) {
      toast({
        title: "Table Required",
        description: "Please scan your table QR code before placing an order.",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingOut(true);

    const orderItems = cart.map(item => ({
      menuItemId: item.id,
      quantity: item.quantity,
      unitPrice: item.price.toString(),
      subtotal: (item.price * item.quantity).toString(),
    }));

    const orderData = {
      tableId: currentTable.toString(), // In production, this would be the actual table ID
      totalAmount: cartTotal.toString(),
      items: orderItems,
    };

    checkoutMutation.mutate(orderData);
  };

  const handleClose = () => {
    setIsCartOpen(false);
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Cart Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40" 
        onClick={handleClose}
        data-testid="cart-overlay"
      />

      {/* Cart Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 max-w-full glass-morphism z-50 overflow-y-auto" data-testid="cart-sidebar">
        <Card className="h-full bg-transparent border-none shadow-none">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="font-cinzel text-2xl font-bold text-gold" data-testid="cart-title">
                Your Order
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-gold hover:text-amber"
                data-testid="button-close-cart"
              >
                <i className="fas fa-times text-xl"></i>
              </Button>
            </div>
            
            {currentTable && (
              <Badge variant="secondary" className="w-fit" data-testid="cart-table-info">
                <i className="fas fa-table mr-2"></i>
                Table {currentTable}
              </Badge>
            )}
          </CardHeader>
          
          <CardContent className="flex-1 pb-6">
            {cart.length === 0 ? (
              <div className="text-center py-12" data-testid="cart-empty">
                <i className="fas fa-shopping-cart text-4xl text-muted-foreground mb-4"></i>
                <p className="text-warm-white text-lg">Your cart is empty</p>
                <p className="text-muted-foreground">Add some delicious items from our menu!</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <Card key={item.id} className="bg-navy border-gold border-opacity-30" data-testid={`cart-item-${item.id}`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-warm-white font-medium" data-testid={`cart-item-name-${item.id}`}>
                            {item.name}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-400 hover:text-red-300 h-auto p-1"
                            data-testid={`button-remove-${item.id}`}
                          >
                            <i className="fas fa-trash text-sm"></i>
                          </Button>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <p className="text-amber" data-testid={`cart-item-price-${item.id}`}>
                            {item.price.toFixed(2)} MAD each
                          </p>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCartItem(item.id, item.quantity - 1)}
                              className="h-8 w-8 p-0 border-gold text-gold hover:bg-gold hover:text-navy"
                              data-testid={`button-decrease-${item.id}`}
                            >
                              <i className="fas fa-minus text-xs"></i>
                            </Button>
                            
                            <span className="text-warm-white font-medium w-8 text-center" data-testid={`cart-item-quantity-${item.id}`}>
                              {item.quantity}
                            </span>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCartItem(item.id, item.quantity + 1)}
                              className="h-8 w-8 p-0 border-gold text-gold hover:bg-gold hover:text-navy"
                              data-testid={`button-increase-${item.id}`}
                            >
                              <i className="fas fa-plus text-xs"></i>
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-right mt-2">
                          <span className="text-warm-white font-semibold" data-testid={`cart-item-subtotal-${item.id}`}>
                            Subtotal: {(item.price * item.quantity).toFixed(2)} MAD
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="border-t border-gold border-opacity-30 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-warm-white">Total:</span>
                    <span className="text-2xl font-bold text-gold" data-testid="cart-total">
                      {cartTotal.toFixed(2)} MAD
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4 text-sm text-muted-foreground">
                    <span>Items: {cartCount}</span>
                    <span>Est. time: 25-30 min</span>
                  </div>
                  
                  <Button
                    onClick={handleCheckout}
                    disabled={cart.length === 0 || isCheckingOut}
                    className="w-full gold-gradient text-navy py-3 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity duration-300 disabled:opacity-50"
                    data-testid="button-checkout"
                  >
                    {isCheckingOut ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-credit-card mr-2"></i>
                        Place Order
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
