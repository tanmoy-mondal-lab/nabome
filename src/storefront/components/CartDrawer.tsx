import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { useUIStore } from "../stores/ui-store";
import { SafeImage } from "../../components/SafeImage";
import { formatPrice } from "../../lib/utils/format";
import { cn } from "../../lib/utils/cn";

export function CartDrawer() {
  const navigate = useNavigate();
  const { isCartOpen, closeCart } = useUIStore();
  const { items, removeItem, updateQuantity, subtotal, total } = useCart();

  function handleCheckout() {
    closeCart();
    navigate("/checkout");
  }

  function handleViewCart() {
    closeCart();
    navigate("/cart");
  }

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={closeCart}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-[480px] bg-white z-50 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-neutral-900" />
                <h2 className="text-sm font-medium tracking-[0.15em] uppercase text-neutral-900">
                  Shopping Bag ({items.length})
                </h2>
              </div>
              <button onClick={closeCart} className="p-2 -mr-2 text-neutral-400 hover:text-neutral-600 transition-colors" aria-label="Close cart">
                <X className="w-5 h-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6">
                <div className="w-20 h-20 bg-luxe-ivory rounded-full flex items-center justify-center mb-6">
                  <ShoppingBag className="w-8 h-8 text-brand-400" />
                </div>
                <p className="text-neutral-900 font-display text-xl mb-2">Your bag is empty</p>
                <p className="text-neutral-500 text-sm mb-6">Discover something you love.</p>
                <button onClick={handleViewCart} className="btn-primary">
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.variantId} className="flex gap-4 py-4 border-b border-neutral-50">
                        <div className="w-20 h-28 shrink-0 bg-luxe-ivory overflow-hidden">
                          <SafeImage src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-neutral-900 truncate">{item.name}</p>
                              <div className="flex gap-2 mt-1">
                                {item.size && (
                                  <span className="text-[10px] tracking-[0.1em] uppercase text-neutral-400">
                                    Size: {item.size}
                                  </span>
                                )}
                                {item.color && (
                                  <span className="text-[10px] tracking-[0.1em] uppercase text-neutral-400">
                                    Color: {item.color}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => removeItem(item.variantId)}
                              className="p-1 text-neutral-300 hover:text-red-500 transition-colors shrink-0"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <div className="flex items-center border border-neutral-200">
                              <button
                                onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                className="min-w-[32px] h-8 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-3 text-sm font-medium min-w-[2rem] text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.variantId, Math.min(item.quantity + 1, item.maxQuantity))}
                                className="min-w-[32px] h-8 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <p className="text-sm font-medium text-neutral-900">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-neutral-100 px-6 py-5 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Subtotal</span>
                    <span className="font-medium text-neutral-900">{formatPrice(subtotal)}</span>
                  </div>
                  <p className="text-[10px] text-neutral-400">Taxes and shipping calculated at checkout</p>
                  <button onClick={handleCheckout} className="w-full btn-primary justify-center">
                    Proceed to Checkout
                  </button>
                  <button onClick={handleViewCart} className="w-full btn-ghost justify-center text-neutral-500">
                    View Full Bag
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
