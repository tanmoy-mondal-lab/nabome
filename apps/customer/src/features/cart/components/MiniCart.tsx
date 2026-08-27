import { useCart, useCartDrawer } from '../hooks';
import type { CartItemWithProduct } from '../types';

export function MiniCart() {
  const { cart, getTotalItems, getTotalPrice } = useCart();
  const { isOpen, close, toggle } = useCartDrawer();
  const itemCount = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-full transition-colors relative group"
        aria-label="Open cart"
      >
        <svg
          className="w-6 h-6 text-gray-700 group-hover:text-indigo-600 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-lg">
            {itemCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl z-50 border border-gray-100 animate-fade-in-up">
          <div className="p-5 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">
                Your Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
              </h3>
              <button
                onClick={close}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-all"
                aria-label="Close cart"
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

          <div className="max-h-96 overflow-y-auto p-5">
            {!cart || cart.items.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🛒</div>
                <p className="text-gray-600 font-medium">Your cart is empty</p>
                <p className="text-gray-400 text-sm mt-2">
                  Add some items to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.items.slice(0, 3).map((item: CartItemWithProduct) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <span className="text-2xl">📦</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4
                        className="font-medium text-sm text-gray-900 truncate"
                        title={item.product.name}
                      >
                        {item.product.name}
                      </h4>
                      <p
                        className="text-xs text-gray-500 truncate mt-1"
                        title={item.variant.name}
                      >
                        {item.variant.name}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm font-bold text-indigo-600">
                          ₹{item.unitPrice.toFixed(2)}
                        </span>
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
                          x{item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {cart.items.length > 3 && (
                  <div className="text-center py-2">
                    <p className="text-sm text-indigo-600 font-medium">
                      +{cart.items.length - 3} more items
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {cart && cart.items.length > 0 && (
            <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-gray-900">Subtotal</span>
                <span className="font-bold text-xl text-indigo-600">
                  ₹{totalPrice.toFixed(2)}
                </span>
              </div>
              <a
                href="/cart"
                onClick={close}
                className="block w-full bg-indigo-600 text-white text-center py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
              >
                View Cart
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
