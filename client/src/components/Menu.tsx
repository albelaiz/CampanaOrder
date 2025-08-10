import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import type { MenuItemWithCategory, MenuCategory } from "@shared/schema";

export default function Menu() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { addToCart, setIsCartOpen } = useAppContext();
  const { toast } = useToast();

  const { data: menuItems = [], isLoading: menuLoading } = useQuery<MenuItemWithCategory[]>({
    queryKey: ["/api/menu"],
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<MenuCategory[]>({
    queryKey: ["/api/categories"],
  });

  const filteredItems = selectedCategory === "all" 
    ? menuItems 
    : menuItems.filter(item => item.categoryId === selectedCategory);

  const handleAddToCart = (item: MenuItemWithCategory) => {
    addToCart(item);
    toast({
      title: "Added to Cart",
      description: `${item.name} has been added to your cart.`,
    });
  };

  const handleViewCart = () => {
    setIsCartOpen(true);
  };

  if (menuLoading || categoriesLoading) {
    return (
      <section className="py-20 bg-charcoal">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold mx-auto"></div>
            <p className="text-warm-white mt-4">Loading menu...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="menu" className="py-20 bg-charcoal">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-cinzel text-4xl md:text-5xl font-bold text-gold mb-4" data-testid="menu-title">
            Chef's Selection
          </h2>
          <p className="text-xl text-warm-white max-w-2xl mx-auto" data-testid="menu-description">
            Discover our curated collection of Mediterranean delicacies and fresh seafood specialties
          </p>
        </div>
        
        {/* Menu Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            onClick={() => setSelectedCategory("all")}
            className={`px-6 py-3 rounded-full font-medium transition-colors duration-300 ${
              selectedCategory === "all" 
                ? "gold-gradient text-navy" 
                : "border-gold text-gold hover:bg-gold hover:text-navy"
            }`}
            data-testid="category-all"
          >
            All Items
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium transition-colors duration-300 ${
                selectedCategory === category.id 
                  ? "gold-gradient text-navy" 
                  : "border-gold text-gold hover:bg-gold hover:text-navy"
              }`}
              data-testid={`category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {category.name}
            </Button>
          ))}
        </div>
        
        {/* Menu Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-warm-white text-xl">No menu items available in this category.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <Card key={item.id} className="premium-card rounded-xl overflow-hidden" data-testid={`menu-item-${item.id}`}>
                {item.imageUrl && (
                  <img 
                    src={item.imageUrl} 
                    alt={item.name}
                    className="w-full h-48 object-cover"
                    data-testid={`menu-item-image-${item.id}`}
                  />
                )}
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-cinzel text-xl font-bold text-gold" data-testid={`menu-item-name-${item.id}`}>
                      {item.name}
                    </h3>
                    {item.category && (
                      <Badge variant="secondary" className="ml-2" data-testid={`menu-item-category-${item.id}`}>
                        {item.category.name}
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-warm-white mb-4" data-testid={`menu-item-description-${item.id}`}>
                      {item.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-amber" data-testid={`menu-item-price-${item.id}`}>
                      {parseFloat(item.price).toFixed(2)} MAD
                    </span>
                    <Button
                      onClick={() => handleAddToCart(item)}
                      className="gold-gradient text-navy px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity duration-300"
                      data-testid={`button-add-cart-${item.id}`}
                    >
                      <i className="fas fa-plus mr-2"></i>Add to Cart
                    </Button>
                  </div>
                  {item.preparationTime && (
                    <p className="text-sm text-muted-foreground mt-2">
                      <i className="fas fa-clock mr-1"></i>
                      Prep time: {item.preparationTime} minutes
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* View Cart Button */}
        <div className="text-center mt-12">
          <Button
            onClick={handleViewCart}
            variant="outline"
            className="border-gold text-gold hover:bg-gold hover:text-navy px-8 py-3 text-lg font-medium"
            data-testid="button-view-cart"
          >
            <i className="fas fa-shopping-cart mr-2"></i>
            View Cart
          </Button>
        </div>
      </div>
    </section>
  );
}
