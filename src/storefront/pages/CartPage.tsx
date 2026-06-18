import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ArrowLeft, Tag, Shield, Truck, RotateCcw, Clock } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { useCartStore } from "../stores/cart-store";
import { QuantitySelector } from "../components/QuantitySelector";
import { PriceDisplay } from "../components/PriceDisplay";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { formatPrice } from "../../lib/utils/format";
import { img } from "../../lib/seo";

export default function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, subtotal, discountAmount, total, couponCode, applyCoupon, removeCoupon, clearCart } = useCart();
  const [savedForLater, setSavedForLater] = useState<Record<string, unknown>[]>([]);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setCouponError("");
    try {
      const res = await fetch("/api/coupons?action=validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        applyCoupon(couponInput.trim(), data.discount, data.discountType);
        setCouponInput("");
      } else {
        setCouponError(data.error || "Invalid coupon code");
      }
    } catch {
      setCouponError("Failed to validate coupon");
    }
  }

  const shipping = subtotal >= 999 ? 0 : 99;
  const finalTotal = total + shipping;

  if (items.length === 0) {
    return (
      <div className="container-page section-padding">
        <Breadcrumbs items={[{ label: "Shopping Cart" }]} className="mb-6" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 bg-luxe-ivory rounded-full flex items-center justify-center">
            <Tag className="w-8 h-8 text-brand-500" />
          </div>
          <h1 className="font-display text-display-1 text-neutral-900 mb-3 text-balance">Your Cart is Empty</h1>
          <p className="text-neutral-500 mb-8 leading-relaxed">Looks like you haven't added anything yet. Let's change that.</p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-sm uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>
          <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-neutral-100">
            {[
              { icon: Truck, label: "Free shipping", desc: "On orders ₹999+" },
              { icon: RotateCcw, label: "Easy returns", desc: "30-day policy" },
              { icon: Shield, label: "Secure", desc: "Protected checkout" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <item.icon className="w-5 h-5 mx-auto text-brand-500 mb-2" />
                <p className="text-[10px] font-medium text-neutral-700">{item.label}</p>
                <p className="text-[9px] text-neutral-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container-page section-padding">
      <Breadcrumbs items={[{ label: "Shopping Cart" }]} className="mb-6" />

      <h1 className="font-display text-display-2 md:text-display-1 text-neutral-900 mb-8 text-balance">Shopping Cart ({items.length})</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.variantId}
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="premium-card flex gap-4 p-4 shadow-subtle"
              >
                <Link to={`/products/${item.slug}`} className="w-24 h-32 shrink-0 bg-luxe-ivory overflow-hidden rounded">
                  <img src={img(item.image, { width: 200 })} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <Link to={`/products/${item.slug}`} className="text-sm font-display font-medium text-neutral-900 hover:text-brand-500 transition-all duration-300">{item.name}</Link>
                      {item.size && <p className="text-xs text-neutral-400 mt-0.5">Size: {item.size}</p>}
                      {item.color && <p className="text-xs text-neutral-400">Color: {item.color}</p>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { removeItem(item.variantId); setSavedForLater((prev) => [...prev, item as unknown as Record<string, unknown>]); }} className="p-1 text-neutral-300 hover:text-accent-gold transition-all duration-300" title="Save for later">
                        <Clock className="w-4 h-4" />
                      </button>
                      <button onClick={() => removeItem(item.variantId)} className="p-1 text-neutral-300 hover:text-red-500 transition-all duration-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <PriceDisplay price={item.price} size="sm" className="mt-2" />
                  <div className="flex items-center justify-between mt-3">
                    <QuantitySelector value={item.quantity} onChange={(q) => updateQuantity(item.variantId, q)} max={item.maxQuantity} />
                    <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="flex items-center justify-between pt-4">
            <button onClick={clearCart} className="text-xs text-neutral-400 hover:text-red-500 transition-all duration-300 underline">Clear Cart</button>
            <Link to="/products" className="btn-ghost text-xs">Continue Shopping</Link>
          </div>

          {savedForLater.length > 0 && (
            <div className="space-y-3 pt-8">
              <h3 className="text-sm font-display text-neutral-900">Saved for Later ({savedForLater.length})</h3>
              {savedForLater.map((item: Record<string, unknown>) => (
                <div key={item.variantId as string} className="premium-card-lift flex gap-4 p-4 shadow-subtle">
                  <Link to={`/products/${item.slug}`} className="w-20 h-26 shrink-0 bg-luxe-ivory overflow-hidden rounded">
                    <img src={img(item.image as string, { width: 200 })} alt={item.name as string} loading="lazy" className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.slug}`} className="text-sm font-body font-medium text-neutral-900 hover:text-brand-500 transition-all duration-300">{item.name as string}</Link>
                    <p className="text-sm text-accent-gold mt-1">{formatPrice(item.price as number)}</p>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => { useCartStore.getState().addItem(item as any); setSavedForLater((prev) => prev.filter((i) => i.variantId !== item.variantId)); }} className="btn-secondary text-xs uppercase tracking-wider px-4 py-1.5">
                        Move to Cart
                      </button>
                      <button onClick={() => setSavedForLater((prev) => prev.filter((i) => i.variantId !== item.variantId))} className="text-xs text-neutral-400 hover:text-red-500 transition-all duration-300 underline">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="premium-card space-y-4 sticky top-24 shadow-card">
            <h3 className="text-sm uppercase tracking-fashion font-display text-neutral-900">Order Summary</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-600">Free</span> : formatPrice(shipping)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount {couponCode && <span className="text-xs">({couponCode})</span>}</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="border-t border-neutral-200 pt-3 flex justify-between font-medium text-neutral-900 text-base">
                <span>Total</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {subtotal < 999 ? (
              <div className="space-y-2">
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((subtotal / 999) * 100, 99)}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-brand-500 rounded-full"
                  />
                </div>
                <p className="text-xs text-amber-600 trust-badge">{formatPrice(999 - subtotal)} away from free shipping</p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-green-600 trust-badge">
                <Truck className="w-3.5 h-3.5" />
                You've unlocked free shipping!
              </div>
            )}

            {!couponCode ? (
              <div className="space-y-2">
                <div className="flex border border-neutral-200">
                  <input value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="Coupon code" onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()} className="input-field flex-1 px-3 py-2 text-sm" />
                  <button onClick={handleApplyCoupon} className="btn-ghost px-4 py-2 text-xs uppercase tracking-wider">Apply</button>
                </div>
                {couponError && <p className="text-xs text-red-500">{couponError}</p>}
              </div>
            ) : (
              <div className="flex items-center justify-between bg-green-50 px-3 py-2 rounded text-sm">
                <span className="text-green-700">{couponCode} applied</span>
                <button onClick={removeCoupon} className="text-xs text-green-600 underline">Remove</button>
              </div>
            )}

            <button onClick={() => navigate("/checkout")} className="btn-primary w-full py-3 text-sm uppercase tracking-widest">
              Proceed to Checkout
            </button>

            <div className="flex items-center justify-center gap-4 text-[10px] text-neutral-400 pt-2">
              <span className="trust-badge flex items-center gap-1"><Shield className="w-3 h-3" /> Secure</span>
              <span className="trust-badge flex items-center gap-1"><Truck className="w-3 h-3" /> Free ship</span>
              <span className="trust-badge flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Easy returns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
