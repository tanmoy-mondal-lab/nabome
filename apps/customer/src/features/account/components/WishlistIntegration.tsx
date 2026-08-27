import { Heart, ShoppingBag, Eye, Package } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@nabome/ui';

import type { WishlistItem } from '@/features/wishlist/types';

import { useWishlistStore } from '@/stores/wishlist-store';

interface RecentlyViewedItem {
  id: string;
  productId: string;
  productName: string;
  sellerName?: string;
  price: number;
}

interface WishlistIntegrationProps {
  userId: string;
}

export function WishlistIntegration({
  userId: _userId,
}: WishlistIntegrationProps) {
  void _userId;
  const items = useWishlistStore((s) => s.items);
  const isLoading = useWishlistStore((s) => s.isLoading);
  const error = useWishlistStore((s) => s.error);

  const [recentlyViewed] = useState<RecentlyViewedItem[]>([]);
  const loading = isLoading;
  void error;

  const [activeTab, setActiveTab] = useState<'wishlist' | 'recently-viewed'>(
    'wishlist',
  );

  const handleRemove = (_itemId: string) => {
    void _itemId;
  };

  const handleMoveToCart = async (_itemId: string) => {
    void _itemId;
  };

  const handleAddToWishlist = async (_productId: string) => {
    void _productId;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Wishlist</h2>

      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'wishlist'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Saved Items ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('recently-viewed')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'recently-viewed'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Recently Viewed ({recentlyViewed.length})
        </button>
      </div>

      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
              <Heart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">Your wishlist is empty</p>
              <Button variant="outline">Browse Products</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item: WishlistItem) => (
                <div
                  key={item.id}
                  className="border rounded-lg overflow-hidden hover:shadow-sm transition-shadow"
                >
                  <div className="relative aspect-square bg-gray-100">
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-gray-50 transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    </button>
                    {item.stockStatus?.outOfStock && (
                      <div className="absolute bottom-2 left-2 right-2">
                        <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {item.product.slug}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(item.product.basePrice)}
                      </p>
                      {item.stockStatus?.inStock !== false && (
                        <Button
                          size="sm"
                          onClick={() => handleMoveToCart(item.id)}
                          className="flex items-center gap-1"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          Add
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'recently-viewed' && (
        <div className="space-y-4">
          {recentlyViewed.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
              <Eye className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No recently viewed items</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recentlyViewed.map((item: RecentlyViewedItem) => (
                <div
                  key={item.id}
                  className="border rounded-lg overflow-hidden hover:shadow-sm transition-shadow"
                >
                  <div className="relative aspect-square bg-gray-100">
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                    <button
                      onClick={() => handleAddToWishlist(item.productId)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-gray-50 transition-colors"
                      aria-label="Add to wishlist"
                    >
                      <Heart className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                      {item.productName}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {item.sellerName}
                    </p>
                    <p className="font-semibold text-gray-900">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
