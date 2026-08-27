import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { useCart } from '@/features/cart/hooks';
import { WishlistButton } from '@/features/wishlist/WishlistButton';

import { setDocumentMeta } from '@/lib/seo';

import { useWishlistStore } from '@/stores/wishlist-store';

export default function WishlistPage() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const {
    items,
    guestItems,
    isGuest,
    isLoading,
    error,
    loadGuestItems,
    removeGuestItem,
    clearAll,
  } = useWishlistStore();

  useEffect(() => {
    setDocumentMeta({ title: 'My Wishlist — নবME' });
  }, []);

  useEffect(() => {
    if (isGuest) {
      loadGuestItems();
    }
  }, [isGuest, loadGuestItems]);

  const currentItems = isGuest ? guestItems : items;

  const handleAddToCart = async (
    productId: string,
    variantId: string | null,
  ) => {
    if (variantId) {
      try {
        await addItem(variantId, 1);
      } catch (err) {
        console.error('Failed to add to cart:', err);
      }
    }
  };

  const handleRemove = (productId: string, variantId: string | null) => {
    if (isGuest) {
      removeGuestItem(productId, variantId);
    }
  };

  if (isLoading) {
    return (
      <div
        className="container mx-auto px-4 py-8"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => navigate('/')}
            className="text-indigo-600 hover:text-indigo-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">
            {currentItems.length === 0
              ? 'Your wishlist is empty'
              : `${currentItems.length} item${currentItems.length !== 1 ? 's' : ''} saved`}
          </p>
        </div>

        {/* Empty State */}
        {currentItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Save items you love to your wishlist
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Wishlist Items Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentItems.map((item: any) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-100 relative">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                    {/* Wishlist Button */}
                    <div className="absolute top-2 right-2">
                      <WishlistButton
                        productId={item.productId}
                        variantId={item.variantId}
                      />
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                      {item.productName}
                    </h3>
                    {item.variantName && (
                      <p className="text-sm text-gray-600 mb-2">
                        {item.variantName}
                      </p>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold text-gray-900">
                        {item.price
                          ? `₹${parseFloat(item.price).toFixed(2)}`
                          : 'Price not available'}
                      </p>
                      {item.inStock !== false && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          In Stock
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleAddToCart(item.productId, item.variantId)
                        }
                        disabled={!item.variantId || item.inStock === false}
                        className="flex-1 bg-indigo-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() =>
                          handleRemove(item.productId, item.variantId)
                        }
                        className="p-2 text-gray-400 hover:text-red-600 transition"
                        title="Remove from wishlist"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Clear All Button */}
            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  if (
                    confirm('Are you sure you want to clear your wishlist?')
                  ) {
                    clearAll();
                  }
                }}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Clear All Items
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
