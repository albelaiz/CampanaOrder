import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/context/AppContext";

const statusConfig = {
  pending: { 
    color: "bg-yellow-500 text-yellow-100", 
    icon: "fas fa-clock", 
    label: "Received" 
  },
  preparing: { 
    color: "bg-blue-500 text-blue-100", 
    icon: "fas fa-utensils", 
    label: "Preparing" 
  },
  ready: { 
    color: "bg-green-500 text-green-100", 
    icon: "fas fa-bell", 
    label: "Ready" 
  },
  served: { 
    color: "bg-orange-500 text-orange-100", 
    icon: "fas fa-check-double", 
    label: "Served" 
  },
  cancelled: { 
    color: "bg-red-500 text-red-100", 
    icon: "fas fa-times", 
    label: "Cancelled" 
  },
};

export default function OrderTracking() {
  const { currentOrder } = useAppContext();

  const { data: order, isLoading } = useQuery({
    queryKey: ["/api/orders", currentOrder?.orderNumber],
    enabled: !!currentOrder?.orderNumber,
    refetchInterval: 10000, // Refetch every 10 seconds for live updates
  });

  const trackingOrder = order || currentOrder;

  if (!trackingOrder) return null;

  const getStatusIndex = (status: string) => {
    const statuses = ['pending', 'preparing', 'ready', 'served'];
    return statuses.indexOf(status);
  };

  const currentStatusIndex = getStatusIndex(trackingOrder.status);

  return (
    <section id="order-tracking" className="py-20 bg-navy">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-cinzel text-4xl font-bold text-gold mb-4" data-testid="tracking-title">
            Order Status
          </h2>
          <p className="text-xl text-warm-white" data-testid="tracking-subtitle">
            Track your order in real-time
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Card className="premium-card rounded-xl" data-testid="tracking-card">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-warm-white text-lg">
                    Order #<span className="font-bold text-gold" data-testid="tracking-order-number">
                      {trackingOrder.orderNumber}
                    </span>
                  </p>
                  {trackingOrder.table && (
                    <p className="text-warm-white">
                      Table <span className="font-bold text-gold" data-testid="tracking-table-number">
                        {trackingOrder.table.number}
                      </span>
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-warm-white text-lg">
                    Total: <span className="font-bold text-gold" data-testid="tracking-total">
                      {parseFloat(trackingOrder.totalAmount).toFixed(2)} MAD
                    </span>
                  </p>
                  <p className="text-sm text-amber">Estimated: 25-30 minutes</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Order Progress */}
              <div className="flex items-center justify-between mb-8">
                {['pending', 'preparing', 'ready', 'served'].map((status, index) => {
                  const config = statusConfig[status as keyof typeof statusConfig];
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  
                  return (
                    <div key={status} className="flex flex-col items-center relative">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors duration-300 ${
                        isCompleted 
                          ? config.color 
                          : 'bg-gray-600'
                      } ${isCurrent ? 'animate-pulse' : ''}`} data-testid={`status-${status}`}>
                        <i className={`${config.icon} text-white`}></i>
                      </div>
                      <p className="text-sm text-warm-white text-center">{config.label}</p>
                      
                      {index < 3 && (
                        <div className={`absolute top-6 left-12 w-16 md:w-24 h-1 transition-colors duration-300 ${
                          index < currentStatusIndex ? config.color : 'bg-gray-600'
                        }`}></div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Current Status Badge */}
              <div className="text-center mb-6">
                <Badge className={`${statusConfig[trackingOrder.status as keyof typeof statusConfig]?.color} px-4 py-2 text-lg font-medium`} data-testid="current-status">
                  <i className={`${statusConfig[trackingOrder.status as keyof typeof statusConfig]?.icon} mr-2`}></i>
                  {statusConfig[trackingOrder.status as keyof typeof statusConfig]?.label}
                </Badge>
              </div>
              
              {/* Order Items */}
              <div className="space-y-3">
                <h3 className="font-cinzel text-xl text-gold mb-4">Order Items</h3>
                {trackingOrder.orderItems?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center bg-midnight rounded-lg p-3" data-testid={`tracking-item-${index}`}>
                    <div>
                      <span className="text-warm-white font-medium" data-testid={`tracking-item-name-${index}`}>
                        {item.menuItem?.name || 'Unknown Item'}
                      </span>
                      <span className="text-amber ml-2" data-testid={`tracking-item-quantity-${index}`}>
                        × {item.quantity}
                      </span>
                    </div>
                    <span className="text-warm-white" data-testid={`tracking-item-subtotal-${index}`}>
                      {parseFloat(item.subtotal).toFixed(2)} MAD
                    </span>
                  </div>
                ))}
              </div>
              
              {isLoading && (
                <div className="text-center mt-4">
                  <p className="text-muted-foreground">Updating status...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
