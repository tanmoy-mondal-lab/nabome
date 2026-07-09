import { Package, Search, Heart, ShoppingBag } from "lucide-react";
import { cn } from "../../lib/utils/cn";

interface EmptyStateProps {
  type?: "products" | "search" | "wishlist" | "cart";
  title?: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ 
  type = "products", 
  title, 
  message, 
  action,
  className 
}: EmptyStateProps) {
  const icons = {
    products: Package,
    search: Search,
    wishlist: Heart,
    cart: ShoppingBag,
  };

  const defaultTitles = {
    products: "No products found",
    search: "No results found",
    wishlist: "Your wishlist is empty",
    cart: "Your cart is empty",
  };

  const defaultMessages = {
    products: "Check back later for new arrivals",
    search: "Try adjusting your search or filters",
    wishlist: "Save items you love by clicking the heart icon",
    cart: "Add some items to get started",
  };

  const Icon = icons[type];

  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center", className)}>
      <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-neutral-400" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
        {title || defaultTitles[type]}
      </h3>
      <p className="text-sm text-neutral-600 mb-6 max-w-sm">
        {message || defaultMessages[type]}
      </p>
      {action}
    </div>
  );
}
