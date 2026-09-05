import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { setDocumentMeta } from '@/lib/seo';

import { useCart } from '../hooks';
import type { CartItemWithProduct } from '../types';

export default function CartPage() {
  const navigate = useNavigate();
  const {
    cart,
    totals,
    isLoading,
    error,
    fetchCart,
    updateItem,
    removeItem,
    clearCart,
  } = useCart();

  useEffect(() => {
    setDocumentMeta({ title: 'Cart — নবME' });
    fetchCart();
  }, [fetchCart]);

  if (isLoading) {
    return (
      <div
        className="container mx-auto px-4 py-8"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <h3 className="font-semibold mb-2">Unable to load your cart</h3>
          <p className="mb-2">{error}</p>
          <p className="text-sm mb-3">
            This might be due to a network issue or server problem. Please try
            again.
          </p>
          <button
            onClick={() => fetchCart()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        <div className="text-center py-16">
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <a
            href="/shop"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        Your Cart ({cart.itemCount} items)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item: CartItemWithProduct) => (
            <div key={item.id} className="border rounded-lg p-4 flex gap-4">
              {/* Product Image */}
              <div className="w-24 h-24 bg-gray-100 rounded flex-shrink-0">
                {item.media && item.media.length > 0 && item.media[0] ? (
                  <img
                    src={item.media[0].url}
                    alt={item.product.name}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1">
                <h3 className="font-semibold">{item.product.name}</h3>
                <p className="text-sm text-gray-600">{item.variant.name}</p>
                <p className="text-lg font-bold mt-2">
                  ₹{item.unitPrice.toFixed(2)}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center border rounded">
                  <button
                    onClick={() =>
                      updateItem(item.id, Math.max(1, item.quantity - 1))
                    }
                    className="px-3 py-1 hover:bg-gray-100"
                    disabled={isLoading}
                  >
                    -
                  </button>
                  <span className="px-3 py-1 border-x">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateItem(item.id, Math.min(10, item.quantity + 1))
                    }
                    className="px-3 py-1 hover:bg-gray-100"
                    disabled={isLoading}
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-600 text-sm hover:underline"
                  disabled={isLoading}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-red-600 text-sm hover:underline mt-4"
            disabled={isLoading}
          >
            Clear Cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            {totals && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{totals.itemsSubtotal.toFixed(2)}</span>
                </div>
                {totals.discountTotal > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{totals.discountTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>₹{totals.taxTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {totals.shippingTotal === 0
                      ? 'Free'
                      : `₹${totals.shippingTotal.toFixed(2)}`}
                  </span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{totals.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                if (cart.items.length > 0) {
                  navigate('/checkout');
                }
              }}
              className="w-full bg-blue-600 text-white py-3 rounded-lg mt-6 hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading || cart.items.length === 0}
            >
              Proceed to Checkout
            </button>

            <a
              href="/shop"
              className="block text-center text-blue-600 mt-4 hover:underline"
            >
              Continue Shopping
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
