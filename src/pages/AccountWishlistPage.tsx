import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api/client";
import { formatPrice } from "../lib/utils/format";

interface WishlistItem {
  id: string;
  variant: {
    id: string;
    size: string;
    color: string;
    product: {
      id: string;
      name: string;
      slug: string;
      basePrice: string;
      compareAtPrice: string | null;
    };
    images: { url: string; altText: string | null }[];
  };
  createdAt: string;
}

export default function AccountWishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get<{ items: WishlistItem[] }>("/wishlist")
      .then((res) => setItems(res.items))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const removeItem = async (variantId: string) => {
    try {
      await api.delete(`/wishlist/${variantId}`);
      setItems((prev) => prev.filter((i) => i.variant.id !== variantId));
    } catch {
      // Ignore
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="font-display text-xl text-neutral-500">Your wishlist is empty</p>
        <p className="text-sm text-neutral-400 mt-2">Save items you love for later</p>
        <Link to="/collections" className="btn-primary inline-block mt-6">
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.id} className="premium-card overflow-hidden group">
          <Link to={`/products/${item.variant.product.slug}`} className="block aspect-[3/4] bg-neutral-100 relative overflow-hidden">
            {item.variant.images[0] ? (
              <img src={item.variant.images[0].url} alt={item.variant.images[0].altText ?? item.variant.product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="flex items-center justify-center h-full text-neutral-300 text-sm">No image</div>
            )}
          </Link>
          <div className="p-4">
            <Link to={`/products/${item.variant.product.slug}`} className="font-display text-sm text-neutral-900 line-clamp-1 hover:text-brand-500">
              {item.variant.product.name}
            </Link>
            <p className="text-xs text-neutral-400 mt-1">
              {item.variant.color} / {item.variant.size}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="font-body text-sm font-semibold text-neutral-900">
                {formatPrice(item.variant.product.basePrice)}
              </span>
              <button
                onClick={() => removeItem(item.variant.id)}
                className="text-xs text-red-500 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
