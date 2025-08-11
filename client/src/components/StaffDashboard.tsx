import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { OrderWithItems } from "@shared/schema";

const statusConfig = {
  pending: { color: "status-pending", label: "Pending", nextStatus: "preparing", action: "Start Preparing" },
  preparing: { color: "status-preparing", label: "Preparing", nextStatus: "ready", action: "Mark Ready" },
  ready: { color: "status-ready", label: "Ready", nextStatus: "served", action: "Mark Served" },
  served: { color: "status-served", label: "Served", nextStatus: null, action: null },
};

export default function StaffDashboard() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/staff/orders", selectedStatus === "all" ? "" : selectedStatus].filter(Boolean),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      return await apiRequest("PATCH", `/api/staff/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff/orders"] });
      toast({
        title: "Status Updated",
        description: "Order status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredOrders = selectedStatus === "all" 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

  const getOrderCounts = () => {
    const counts = {
      pending: orders.filter(o => o.status === 'pending').length,
      preparing: orders.filter(o => o.status === 'preparing').length,
      ready: orders.filter(o => o.status === 'ready').length,
      served: orders.filter(o => o.status === 'served').length,
    };
    const total = orders.length;
    return { ...counts, total };
  };

  const counts = getOrderCounts();

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
          <p className="text-warm-white mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal py-20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="font-cinzel text-4xl font-bold text-gold mb-2" data-testid="staff-title">
              Staff Dashboard
            </h1>
            <p className="text-xl text-warm-white">Kitchen Management & Order Processing</p>
          </div>
        </div>
        
        {/* Live Stats */}
        <div className="grid md:grid-cols-5 gap-6 mb-12">
          <Card className="premium-card text-center" data-testid="stat-pending">
            <CardContent className="p-6">
              <i className="fas fa-clock text-4xl text-yellow-400 mb-3"></i>
              <h3 className="text-2xl font-bold text-warm-white mb-1">{counts.pending}</h3>
              <p className="text-amber">Pending</p>
            </CardContent>
          </Card>
          
          <Card className="premium-card text-center" data-testid="stat-preparing">
            <CardContent className="p-6">
              <i className="fas fa-fire text-4xl text-blue-400 mb-3"></i>
              <h3 className="text-2xl font-bold text-warm-white mb-1">{counts.preparing}</h3>
              <p className="text-amber">Preparing</p>
            </CardContent>
          </Card>
          
          <Card className="premium-card text-center" data-testid="stat-ready">
            <CardContent className="p-6">
              <i className="fas fa-bell text-4xl text-green-400 mb-3"></i>
              <h3 className="text-2xl font-bold text-warm-white mb-1">{counts.ready}</h3>
              <p className="text-amber">Ready</p>
            </CardContent>
          </Card>
          
          <Card className="premium-card text-center" data-testid="stat-served">
            <CardContent className="p-6">
              <i className="fas fa-check-double text-4xl text-orange-400 mb-3"></i>
              <h3 className="text-2xl font-bold text-warm-white mb-1">{counts.served}</h3>
              <p className="text-amber">Served</p>
            </CardContent>
          </Card>
          
          <Card className="premium-card text-center" data-testid="stat-total">
            <CardContent className="p-6">
              <i className="fas fa-chart-line text-4xl text-gold mb-3"></i>
              <h3 className="text-2xl font-bold text-warm-white mb-1">{counts.total}</h3>
              <p className="text-amber">Total Orders</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Status Filter */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button
            variant={selectedStatus === "all" ? "default" : "outline"}
            onClick={() => setSelectedStatus("all")}
            className={selectedStatus === "all" ? "gold-gradient text-navy" : "border-gold text-gold hover:bg-gold hover:text-navy"}
            data-testid="filter-all"
          >
            All Orders ({counts.total})
          </Button>
          {Object.entries(statusConfig).map(([status, config]) => (
            <Button
              key={status}
              variant={selectedStatus === status ? "default" : "outline"}
              onClick={() => setSelectedStatus(status)}
              className={selectedStatus === status ? "gold-gradient text-navy" : "border-gold text-gold hover:bg-gold hover:text-navy"}
              data-testid={`filter-${status}`}
            >
              {config.label} ({counts[status as keyof typeof counts]})
            </Button>
          ))}
        </div>
        
        {/* Orders Grid */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-warm-white text-xl">No orders found for the selected status.</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const config = statusConfig[order.status as keyof typeof statusConfig];
              
              return (
                <Card key={order.id} className="premium-card" data-testid={`order-${order.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-gold font-cinzel text-lg" data-testid={`order-number-${order.id}`}>
                          #{order.orderNumber}
                        </CardTitle>
                        {order.table && (
                          <p className="text-warm-white text-sm">Table {order.table.number}</p>
                        )}
                        <p className="text-muted-foreground text-xs">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge className={config.color} data-testid={`order-status-${order.id}`}>
                        {config.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {order.orderItems?.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-warm-white" data-testid={`order-item-${order.id}-${index}`}>
                            {item.quantity}x {item.menuItem?.name || 'Unknown Item'}
                          </span>
                          <span className="text-amber">
                            {parseFloat(item.subtotal).toFixed(2)} MAD
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center mb-4 pt-2 border-t border-gold border-opacity-30">
                      <span className="text-warm-white font-semibold">Total:</span>
                      <span className="text-gold font-bold" data-testid={`order-total-${order.id}`}>
                        {parseFloat(order.totalAmount).toFixed(2)} MAD
                      </span>
                    </div>
                    
                    {config.nextStatus && config.action && (
                      <Button
                        onClick={() => handleStatusUpdate(order.id, config.nextStatus!)}
                        disabled={updateStatusMutation.isPending}
                        className="w-full gold-gradient text-navy hover:opacity-90"
                        data-testid={`button-update-${order.id}`}
                      >
                        {updateStatusMutation.isPending ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Updating...
                          </>
                        ) : (
                          config.action
                        )}
                      </Button>
                    )}
                    
                    {order.notes && (
                      <div className="mt-3 p-2 bg-midnight rounded text-sm">
                        <i className="fas fa-sticky-note text-amber mr-2"></i>
                        <span className="text-warm-white">{order.notes}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
