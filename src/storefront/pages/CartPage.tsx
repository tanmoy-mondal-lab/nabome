import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Shield, Truck, RotateCcw, X, ShoppingBag } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { QuantitySelector } from "../components/QuantitySelector";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { formatPrice } from "../../lib/utils/format";
import { SafeImage } from "../../components/SafeImage";
import { cn } from "../../lib/utils/cn";
import { useSettings } from "../hooks/useSettings";
import { api } from "../../lib/api/client";
import { Helmet } from "react-helmet-async";
import { canonical } from "../../lib/seo";

export default function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, subtotal, discountAmount, total, couponCode, applyCoupon, removeCoupon, clearCart } = useCart();
  const { data: settings } = useSettings();
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  const siteSettings = {
    freeShippingThreshold: Number(settings?.preferences && typeof settings.preferences === 'object' ? (settings.preferences as Record<string, unknown>).freeShippingThreshold ?? 500 : 500),
    shippingCost: Number(settings?.preferences && typeof settings.preferences === 'object' ? (settings.preferences as Record<string, unknown>).shippingCost ?? 99 : 99),
    taxRate: Number(settings?.preferences && typeof settings.preferences === 'object' ? (settings.preferences as Record<string, unknown>).taxRate ?? 5 : 5),
  };

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setCouponError("");
    try {
      const data = await api.post<{
        valid: boolean;
        discount?: number;
        discountType?: "percentage" | "fixed";
        message?: string;
        coupon?: { discountAmount?: number; discountType?: "percentage" | "fixed" };
      }>("/coupons/validate", { code: couponInput.trim(), subtotal });
      if (data.valid) {
        const discount = data.discount ?? data.coupon?.discountAmount ?? 0;
        const discountType = data.discountType ?? data.coupon?.discountType ?? "fixed";
        applyCoupon(couponInput.trim(), discount, discountType);
        setCouponInput("");
      } else {
        setCouponError(data.message || "Invalid coupon code");
      }
    } catch {
      setCouponError("Failed to validate coupon");
    }
  }

  function handleRemove(variantId: string) {
    setRemovingId(variantId);
    setTimeout(() => {
      removeItem(variantId);
      setRemovingId(null);
    }, 300);
  }

  const shipping = subtotal >= siteSettings.freeShippingThreshold ? 0 : siteSettings.shippingCost;
  const tax = Math.round(subtotal * siteSettings.taxRate) / 100;
  const finalTotal = total + shipping + tax;
  const freeShippingProgress = Math.min((subtotal / siteSettings.freeShippingThreshold) * 100, 100);

  if (items.length === 0) {
    return (
      <div className="container-page section-padding">
        <Helmet>
          <title>Shopping Cart — নবME</title>
          <meta name="description" content="View your shopping cart on নবME." />
          <link rel="canonical" href={canonical("/cart")} />
          <meta property="og:title" content="Shopping Cart — নবME" />
          <meta property="og:description" content="View your shopping cart on নবME." />
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <Breadcrumbs items={[{ label: "Shopping Cart" }]} className="mb-6" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-8 bg-luxe-ivory rounded-full flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-brand-400" />
          </div>
          <h1 className="font-display text-display-3 text-neutral-900 mb-4 text-balance">Your Cart is Empty</h1>
          <p className="text-body-base text-neutral-500 mb-10 leading-relaxed font-editorial">
            Looks like you haven't added anything yet. Let's change that.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-neutral-900 text-white px-10 py-4 text-[11px] font-body font-medium tracking-[0.2em] uppercase hover:bg-neutral-800 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" /> Explore Collection
          </Link>
          <div className="grid grid-cols-3 gap-6 mt-16 pt-10 border-t border-neutral-100">
            {[
              { icon: Truck, label: "Free Shipping", desc: `On orders above ${formatPrice(siteSettings.freeShippingThreshold)}` },
              { icon: RotateCcw, label: "Easy Returns", desc: "30-day return policy" },
              { icon: Shield, label: "Secure Checkout", desc: "Protected payment" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <item.icon className="w-5 h-5 mx-auto text-brand-400 mb-3" />
                <p className="text-[10px] font-body font-semibold tracking-[0.15em] uppercase text-neutral-800 mb-1">{item.label}</p>
                <p className="text-[10px] font-body text-neutral-400 tracking-wide">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <Helmet>
        <title>Shopping Cart — নবME</title>
        <meta name="description" content="View your shopping cart on নবME." />
        <link rel="canonical" href={canonical("/cart")} />
        <meta property="og:title" content="Shopping Cart — নবME" />
        <meta property="og:description" content="View your shopping cart on নবME." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="container-page pt-8 pb-24">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shopping Cart" }]} className="mb-8" />

        <div className="flex items-end justify-between mb-10">
          <div>
            <h1 className="font-display text-heading-1 md:text-display-3 text-neutral-900 text-balance">
              Shopping Cart
            </h1>
            <p className="text-body-sm text-neutral-500 mt-2 font-editorial">
              {items.length} {items.length === 1 ? "item" : "items"} in your cart
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-[10px] font-body font-medium tracking-[0.15em] uppercase text-neutral-400 hover:text-red-500 transition-colors duration-300"
          >
            Clear All
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-10 lg:gap-14">
          <div className="lg:col-span-2">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item.variantId}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    "flex gap-6 py-8 border-b border-neutral-100 group transition-opacity duration-300",
                    removingId === item.variantId && "opacity-0"
                  )}
                >
                  <Link
                    to={`/products/${item.slug}`}
                    className="w-28 h-36 shrink-0 bg-luxe-ivory overflow-hidden relative"
                  >
                    <SafeImage
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-luxe-out"
                    />
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/products/${item.slug}`}
                          className="text-body-sm font-body font-medium text-neutral-900 hover:text-brand-500 transition-colors duration-300 block truncate"
                        >
                          {item.name}
                        </Link>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                          {item.size && (
                            <span className="text-[10px] font-body tracking-[0.15em] uppercase text-neutral-400">
                              Size: <span className="text-neutral-600">{item.size}</span>
                            </span>
                          )}
                          {item.color && (
                            <span className="text-[10px] font-body tracking-[0.15em] uppercase text-neutral-400">
                              Color: <span className="text-neutral-600">{item.color}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(item.variantId)}
                        className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-neutral-300 hover:text-red-500 transition-colors duration-300 shrink-0"
                        aria-label="Remove item"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-auto flex items-end justify-between pt-4">
                      <QuantitySelector
                        value={item.quantity}
                        onChange={(q) => updateQuantity(item.variantId, q)}
                        max={item.maxQuantity}
                      />
                      <div className="text-right">
                        <p className="text-body-sm font-body font-medium text-neutral-900">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-[10px] font-body text-neutral-400 mt-0.5">
                            {formatPrice(item.price)} each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="flex items-center justify-between pt-6">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-[10px] font-body font-medium tracking-[0.15em] uppercase text-neutral-500 hover:text-neutral-900 transition-colors duration-300"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Continue Shopping
              </Link>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-neutral-50 p-8 sticky top-24">
              <h3 className="text-[11px] font-body font-semibold tracking-[0.2em] uppercase text-neutral-900 mb-6">
                Order Summary
              </h3>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span className="font-body">Subtotal</span>
                  <span className="font-body font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span className="font-body">Shipping</span>
                  <span className="font-body font-medium">
                    {shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="font-body">
                      Discount {couponCode && <span className="text-xs opacity-70">({couponCode})</span>}
                    </span>
                    <span className="font-body font-medium">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-600">
                  <span className="font-body">Tax ({siteSettings.taxRate}%)</span>
                  <span className="font-body font-medium">{formatPrice(tax)}</span>
                </div>
                <div className="border-t border-neutral-200 pt-4 flex justify-between">
                  <span className="text-[11px] font-body font-semibold tracking-[0.15em] uppercase text-neutral-900">
                    Total
                  </span>
                  <span className="text-body-base font-body font-semibold text-neutral-900">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                {subtotal < siteSettings.freeShippingThreshold ? (
                  <div className="space-y-3">
                    <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${freeShippingProgress}%` }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full bg-gradient-to-r from-brand-400 to-brand-500 rounded-full"
                      />
                    </div>
                    <p className="text-[10px] font-body text-neutral-500">
                      Add <span className="font-semibold text-brand-600">{formatPrice(siteSettings.freeShippingThreshold - subtotal)}</span> more for free shipping
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[10px] font-body font-medium text-green-600">
                    <Truck className="w-3.5 h-3.5" />
                    Free shipping unlocked
                  </div>
                )}
              </div>

              <div className="mt-6">
                {!couponCode ? (
                  <div className="space-y-2">
                    <div className="flex border border-neutral-200 bg-white">
                      <input
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Coupon code"
                        onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                        className="flex-1 px-4 py-3 text-sm font-body text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="px-5 py-3 text-[10px] font-body font-medium tracking-[0.15em] uppercase text-neutral-600 hover:text-neutral-900 transition-colors border-l border-neutral-200"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[10px] font-body text-red-500">{couponError}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-green-50 border border-green-100 px-4 py-3">
                    <span className="text-xs font-body font-medium text-green-700">{couponCode} applied</span>
                    <button
                      onClick={removeCoupon}
                      className="text-[10px] font-body font-medium tracking-[0.1em] uppercase text-green-600 hover:text-green-800 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full mt-8 bg-brand-500 text-white py-4 text-[11px] font-body font-medium tracking-[0.2em] uppercase hover:bg-brand-600 active:bg-brand-700 transition-all duration-300 flex items-center justify-center gap-2.5"
              >
                Proceed to Checkout
              </button>

              <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-neutral-200">
                {[
                  { icon: Shield, label: "Secure" },
                  { icon: Truck, label: "Free Shipping" },
                  { icon: RotateCcw, label: "Easy Returns" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <item.icon className="w-3 h-3 text-neutral-400" />
                    <span className="text-[10px] font-body font-medium tracking-[0.1em] uppercase text-neutral-400">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
