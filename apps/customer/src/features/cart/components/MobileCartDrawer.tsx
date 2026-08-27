import { useCart, useCartDrawer } from '../hooks';
import type { CartItemWithProduct } from '../types';

export function MobileCartDrawer() {
  const { cart, totals, isLoading, updateItem, removeItem, clearCart } =
    useCart();
  const { isOpen, close } = useCartDrawer();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={close} />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Your Cart</h2>
          <button
            onClick={close}
            className="p-2 hover:bg-gray-100 rounded-lg"
            aria-label="Close cart"
          >
            <svg
              className="w-6 h-6"
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

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {!cart || cart.items.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600 mb-4">Your cart is empty</p>
              <button
                onClick={close}
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item: CartItemWithProduct) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                      {item.media && item.media.length > 0 && item.media[0] ? (
                        <img
                          src={item.media[0].url}
                          alt={item.media[0].altText || item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">
                        {item.variant.name}
                      </p>
                      <p className="font-semibold mt-1">
                        ₹{item.unitPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
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
                      <span className="px-3 py-1 border-x">
                        {item.quantity}
                      </span>
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
            </div>
          )}
        </div>

        {/* Footer */}
        {cart && cart.items.length > 0 && (
          <div className="border-t p-4 space-y-4">
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
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading}
            >
              Proceed to Checkout
            </button>

            <button
              onClick={clearCart}
              className="w-full text-red-600 text-sm hover:underline"
              disabled={isLoading}
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
