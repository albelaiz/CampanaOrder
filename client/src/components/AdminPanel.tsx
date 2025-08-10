import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { MenuItem, MenuCategory, Table, MenuItemWithCategory } from "@shared/schema";

interface AdminPanelProps {}

interface AnalyticsData {
  todaysRevenue: number;
  todaysOrderCount: number;
  popularItems: { item: MenuItem; count: number }[];
}

export default function AdminPanel({}: AdminPanelProps) {
  const [activeSection, setActiveSection] = useState<string>("menu");
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isAddTableDialogOpen, setIsAddTableDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: menuItems = [], isLoading: menuLoading } = useQuery<MenuItemWithCategory[]>({
    queryKey: ["/api/menu"],
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        handleUnauthorized();
      }
    },
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<MenuCategory[]>({
    queryKey: ["/api/categories"],
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        handleUnauthorized();
      }
    },
  });

  const { data: tables = [], isLoading: tablesLoading } = useQuery<Table[]>({
    queryKey: ["/api/admin/tables"],
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        handleUnauthorized();
      }
    },
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/analytics"],
    enabled: activeSection === "analytics",
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        handleUnauthorized();
      }
    },
  });

  // Mutations
  const createMenuItemMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/admin/menu-items", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu"] });
      setIsAddItemDialogOpen(false);
      toast({
        title: "Menu Item Created",
        description: "The menu item has been created successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        handleUnauthorized();
        return;
      }
      toast({
        title: "Creation Failed",
        description: "Failed to create menu item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMenuItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/admin/menu-items/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu"] });
      setEditingItem(null);
      toast({
        title: "Menu Item Updated",
        description: "The menu item has been updated successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        handleUnauthorized();
        return;
      }
      toast({
        title: "Update Failed",
        description: "Failed to update menu item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/menu-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu"] });
      toast({
        title: "Menu Item Deleted",
        description: "The menu item has been deleted successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        handleUnauthorized();
        return;
      }
      toast({
        title: "Deletion Failed",
        description: "Failed to delete menu item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createTableMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/admin/tables", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tables"] });
      setIsAddTableDialogOpen(false);
      toast({
        title: "Table Created",
        description: "The table has been created successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        handleUnauthorized();
        return;
      }
      toast({
        title: "Creation Failed",
        description: "Failed to create table. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUnauthorized = () => {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleMenuItemSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: formData.get("price") as string,
      categoryId: formData.get("categoryId") as string,
      imageUrl: formData.get("imageUrl") as string,
      preparationTime: parseInt(formData.get("preparationTime") as string) || undefined,
      isAvailable: formData.get("isAvailable") === "on",
    };

    if (editingItem) {
      updateMenuItemMutation.mutate({ id: editingItem.id, data });
    } else {
      createMenuItemMutation.mutate(data);
    }
  };

  const handleTableSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tableNumber = parseInt(formData.get("number") as string);
    const qrCode = `https://${window.location.host}?table=${tableNumber}`;
    
    const data = {
      number: tableNumber,
      qrCode,
    };

    createTableMutation.mutate(data);
  };

  const renderMenuManagement = () => (
    <Card className="premium-card rounded-xl">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="font-cinzel text-2xl font-bold text-gold">Menu Items</CardTitle>
          <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gold-gradient text-navy" data-testid="button-add-menu-item">
                <i className="fas fa-plus mr-2"></i>Add New Item
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-morphism border-gold">
              <DialogHeader>
                <DialogTitle className="text-gold">Add Menu Item</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleMenuItemSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-warm-white">Name</Label>
                  <Input id="name" name="name" required className="bg-navy border-gold text-warm-white" />
                </div>
                <div>
                  <Label htmlFor="description" className="text-warm-white">Description</Label>
                  <Textarea id="description" name="description" className="bg-navy border-gold text-warm-white" />
                </div>
                <div>
                  <Label htmlFor="price" className="text-warm-white">Price (MAD)</Label>
                  <Input id="price" name="price" type="number" step="0.01" required className="bg-navy border-gold text-warm-white" />
                </div>
                <div>
                  <Label htmlFor="categoryId" className="text-warm-white">Category</Label>
                  <Select name="categoryId" required>
                    <SelectTrigger className="bg-navy border-gold text-warm-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="imageUrl" className="text-warm-white">Image URL</Label>
                  <Input id="imageUrl" name="imageUrl" className="bg-navy border-gold text-warm-white" />
                </div>
                <div>
                  <Label htmlFor="preparationTime" className="text-warm-white">Preparation Time (minutes)</Label>
                  <Input id="preparationTime" name="preparationTime" type="number" className="bg-navy border-gold text-warm-white" />
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="isAvailable" name="isAvailable" defaultChecked />
                  <Label htmlFor="isAvailable" className="text-warm-white">Available</Label>
                </div>
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddItemDialogOpen(false)} className="flex-1 border-gold text-gold">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 gold-gradient text-navy" data-testid="button-save-menu-item">
                    Save Item
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gold">
                <th className="pb-3 text-gold font-semibold">Item</th>
                <th className="pb-3 text-gold font-semibold">Category</th>
                <th className="pb-3 text-gold font-semibold">Price</th>
                <th className="pb-3 text-gold font-semibold">Status</th>
                <th className="pb-3 text-gold font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="text-warm-white">
              {menuItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-600" data-testid={`menu-item-row-${item.id}`}>
                  <td className="py-3">
                    <div>
                      <div className="font-medium" data-testid={`menu-item-name-${item.id}`}>{item.name}</div>
                      {item.description && (
                        <div className="text-sm text-muted-foreground">{item.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="py-3" data-testid={`menu-item-category-${item.id}`}>
                    {item.category?.name || 'No Category'}
                  </td>
                  <td className="py-3" data-testid={`menu-item-price-${item.id}`}>
                    {parseFloat(item.price).toFixed(2)} MAD
                  </td>
                  <td className="py-3">
                    <Badge className={item.isAvailable ? "bg-green-500 text-green-100" : "bg-red-500 text-red-100"}>
                      {item.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingItem(item)}
                        className="text-amber hover:text-gold"
                        data-testid={`button-edit-${item.id}`}
                      >
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMenuItemMutation.mutate(item.id)}
                        className="text-red-400 hover:text-red-300"
                        data-testid={`button-delete-${item.id}`}
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  const renderTableManagement = () => (
    <Card className="premium-card rounded-xl">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="font-cinzel text-2xl font-bold text-gold">Table Management</CardTitle>
          <Dialog open={isAddTableDialogOpen} onOpenChange={setIsAddTableDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gold-gradient text-navy" data-testid="button-add-table">
                <i className="fas fa-plus mr-2"></i>Add New Table
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-morphism border-gold">
              <DialogHeader>
                <DialogTitle className="text-gold">Add Table</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleTableSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="number" className="text-warm-white">Table Number</Label>
                  <Input id="number" name="number" type="number" required className="bg-navy border-gold text-warm-white" />
                </div>
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddTableDialogOpen(false)} className="flex-1 border-gold text-gold">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 gold-gradient text-navy" data-testid="button-save-table">
                    Create Table
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((table) => (
            <Card key={table.id} className="bg-navy border-gold border-opacity-30" data-testid={`table-card-${table.id}`}>
              <CardContent className="p-6 text-center">
                <i className="fas fa-table text-4xl text-gold mb-4"></i>
                <h3 className="text-2xl font-bold text-warm-white mb-2" data-testid={`table-number-${table.id}`}>
                  Table {table.number}
                </h3>
                <Badge className={table.isActive ? "bg-green-500 text-green-100" : "bg-red-500 text-red-100"}>
                  {table.isActive ? "Active" : "Inactive"}
                </Badge>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gold text-gold hover:bg-gold hover:text-navy"
                    onClick={() => {
                      // Generate QR code URL - in production this would show a proper QR code
                      const qrUrl = `${window.location.origin}?table=${table.number}`;
                      navigator.clipboard.writeText(qrUrl);
                      toast({
                        title: "QR URL Copied",
                        description: "Table QR URL copied to clipboard",
                      });
                    }}
                    data-testid={`button-qr-${table.id}`}
                  >
                    <i className="fas fa-qrcode mr-2"></i>QR Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderAnalytics = () => (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="premium-card text-center">
          <CardContent className="p-6">
            <i className="fas fa-dollar-sign text-4xl text-gold mb-3"></i>
            <h3 className="text-2xl font-bold text-warm-white mb-1" data-testid="analytics-revenue">
              {analytics?.todaysRevenue?.toFixed(2) || '0.00'} MAD
            </h3>
            <p className="text-amber">Today's Revenue</p>
          </CardContent>
        </Card>
        
        <Card className="premium-card text-center">
          <CardContent className="p-6">
            <i className="fas fa-shopping-cart text-4xl text-amber mb-3"></i>
            <h3 className="text-2xl font-bold text-warm-white mb-1" data-testid="analytics-orders">
              {analytics?.todaysOrderCount || 0}
            </h3>
            <p className="text-amber">Orders Today</p>
          </CardContent>
        </Card>
        
        <Card className="premium-card text-center">
          <CardContent className="p-6">
            <i className="fas fa-star text-4xl text-gold mb-3"></i>
            <h3 className="text-2xl font-bold text-warm-white mb-1" data-testid="analytics-bestseller">
              {analytics?.popularItems?.[0]?.item?.name || 'N/A'}
            </h3>
            <p className="text-amber">Best Seller</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="premium-card rounded-xl">
        <CardHeader>
          <CardTitle className="font-cinzel text-2xl font-bold text-gold">Popular Items</CardTitle>
        </CardHeader>
        <CardContent>
          {analyticsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gold mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {analytics?.popularItems?.length ? (
                analytics.popularItems.map((item, index) => (
                  <div key={item.item.id} className="flex justify-between items-center p-4 bg-navy rounded-lg">
                    <div>
                      <span className="text-warm-white font-medium">{item.item.name}</span>
                      <span className="text-muted-foreground ml-2">({item.item.category?.name})</span>
                    </div>
                    <div className="text-right">
                      <div className="text-gold font-bold">{item.count} orders</div>
                      <div className="text-amber">{parseFloat(item.item.price).toFixed(2)} MAD</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No popular items data available</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderStaffManagement = () => (
    <Card className="premium-card rounded-xl">
      <CardHeader>
        <CardTitle className="font-cinzel text-2xl font-bold text-gold">Staff Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <i className="fas fa-users text-6xl text-muted-foreground mb-4"></i>
          <p className="text-warm-white text-xl mb-2">Staff Management</p>
          <p className="text-muted-foreground">
            Staff management is handled through the authentication system. 
            Users with staff or admin roles can access their respective dashboards.
          </p>
        </div>
      </CardContent>
    </Card>
  );

  if (menuLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold"></div>
          <p className="text-warm-white mt-4">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy py-20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="font-cinzel text-4xl font-bold text-gold mb-2" data-testid="admin-title">
              Admin Panel
            </h1>
            <p className="text-xl text-warm-white">Restaurant Management & Analytics</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-gold text-gold hover:bg-gold hover:text-navy"
            data-testid="button-logout"
          >
            <i className="fas fa-sign-out-alt mr-2"></i>Logout
          </Button>
        </div>
        
        {/* Admin Navigation */}
        <div className="flex flex-wrap gap-4 mb-8">
          {[
            { id: "menu", label: "Menu Management", icon: "fas fa-utensils" },
            { id: "tables", label: "Table Management", icon: "fas fa-table" },
            { id: "analytics", label: "Analytics", icon: "fas fa-chart-bar" },
            { id: "staff", label: "Staff Management", icon: "fas fa-users" },
          ].map((section) => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "default" : "outline"}
              onClick={() => setActiveSection(section.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors duration-300 ${
                activeSection === section.id
                  ? "gold-gradient text-navy"
                  : "border-gold text-gold hover:bg-gold hover:text-navy"
              }`}
              data-testid={`tab-${section.id}`}
            >
              <i className={`${section.icon} mr-2`}></i>
              {section.label}
            </Button>
          ))}
        </div>
        
        {/* Section Content */}
        <div data-testid={`section-${activeSection}`}>
          {activeSection === "menu" && renderMenuManagement()}
          {activeSection === "tables" && renderTableManagement()}
          {activeSection === "analytics" && renderAnalytics()}
          {activeSection === "staff" && renderStaffManagement()}
        </div>

        {/* Edit Item Dialog */}
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="glass-morphism border-gold">
            <DialogHeader>
              <DialogTitle className="text-gold">Edit Menu Item</DialogTitle>
            </DialogHeader>
            {editingItem && (
              <form onSubmit={handleMenuItemSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="edit-name" className="text-warm-white">Name</Label>
                  <Input 
                    id="edit-name" 
                    name="name" 
                    defaultValue={editingItem.name}
                    required 
                    className="bg-navy border-gold text-warm-white" 
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description" className="text-warm-white">Description</Label>
                  <Textarea 
                    id="edit-description" 
                    name="description" 
                    defaultValue={editingItem.description || ''}
                    className="bg-navy border-gold text-warm-white" 
                  />
                </div>
                <div>
                  <Label htmlFor="edit-price" className="text-warm-white">Price (MAD)</Label>
                  <Input 
                    id="edit-price" 
                    name="price" 
                    type="number" 
                    step="0.01" 
                    defaultValue={editingItem.price}
                    required 
                    className="bg-navy border-gold text-warm-white" 
                  />
                </div>
                <div>
                  <Label htmlFor="edit-categoryId" className="text-warm-white">Category</Label>
                  <Select name="categoryId" defaultValue={editingItem.categoryId || ''} required>
                    <SelectTrigger className="bg-navy border-gold text-warm-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-imageUrl" className="text-warm-white">Image URL</Label>
                  <Input 
                    id="edit-imageUrl" 
                    name="imageUrl" 
                    defaultValue={editingItem.imageUrl || ''}
                    className="bg-navy border-gold text-warm-white" 
                  />
                </div>
                <div>
                  <Label htmlFor="edit-preparationTime" className="text-warm-white">Preparation Time (minutes)</Label>
                  <Input 
                    id="edit-preparationTime" 
                    name="preparationTime" 
                    type="number" 
                    defaultValue={editingItem.preparationTime || ''}
                    className="bg-navy border-gold text-warm-white" 
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="edit-isAvailable" 
                    name="isAvailable" 
                    defaultChecked={editingItem.isAvailable} 
                  />
                  <Label htmlFor="edit-isAvailable" className="text-warm-white">Available</Label>
                </div>
                <div className="flex gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setEditingItem(null)} 
                    className="flex-1 border-gold text-gold"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 gold-gradient text-navy" 
                    data-testid="button-update-menu-item"
                  >
                    Update Item
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
