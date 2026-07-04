import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { PriceDisplay } from "./PriceDisplay";
import { cn } from "../../lib/utils/cn";
import { SafeImage } from "../../components/SafeImage";
import { useWishlist } from "../hooks/useWishlist";
import { useCartStore } from "../stores/cart-store";
import { useAuthStore } from "../../stores/auth-store";
import { hapticMedium } from "../../lib/utils/haptic";
import type { Product } from "../../types/product";

interface ProductCardProps {
  product: Product;
  onQuickView?: () => void;
  view?: "grid" | "list";
}

export function ProductCard({ product, onQuickView, view = "grid" }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const { add: addToWishlist, remove: removeFromWishlist, isInWishlist } = useWishlist();
  const addItem = useCartStore((s) => s.addItem);
  const justAdded = useCartStore((s) => s.justAdded);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const name = product.name;
  const slug = product.slug;
  const basePrice = Number(product.basePrice ?? 0);
  const salePrice = product.salePrice ? Number(product.salePrice) : null;
  const price = salePrice && salePrice > 0 ? salePrice : basePrice;
  const compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const images = product.images ?? [];
  const primaryImage = images.find((img) => img.isPrimary)?.url ?? images[0]?.url;
  const hoverImage = images[1]?.url;
  const labels = product.productLabels ?? [];
  const gender = product.gender;
  const isNew = product.isNew;
  const variants = product.variants ?? [];
  const colors = [...new Set(variants.map((v) => v.colorHex).filter(Boolean))];
  const discount = compareAtPrice && compareAtPrice > price ? Math.round((1 - price / compareAtPrice) * 100) : 0;

  const defaultVariant = variants[0];
  const inWishlist = defaultVariant ? isInWishlist(defaultVariant.id) : false;

  function handleToggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!defaultVariant) return;
    hapticMedium();
    if (inWishlist) {
      removeFromWishlist(defaultVariant.id);
    } else {
      addToWishlist(defaultVariant.id);
    }
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!defaultVariant) return;
    hapticMedium();
    addItem({
      productId: product.id,
      variantId: defaultVariant.id,
      name: product.name,
      slug: product.slug,
      sku: defaultVariant.sku || "",
      size: defaultVariant.size || "One Size",
      color: defaultVariant.color || "",
      colorHex: defaultVariant.colorHex || "",
      image: primaryImage || "",
      price: price + Number(defaultVariant.priceAdjustment ?? 0),
      compareAtPrice: compareAtPrice,
      quantity: 1,
      maxQuantity: defaultVariant.stock || 99,
    });
  }

  if (view === "list") {
    return (
      <div className="premium-card product-card flex gap-6 p-4 group">
        <Link to={`/products/${slug}`} className="w-32 h-44 shrink-0 bg-neutral-50 overflow-hidden">
          <SafeImage src={primaryImage || "/placeholder.svg"} alt={name} className="w-full h-full object-cover transition-transform duration-700 ease-luxe-out group-hover:scale-105" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              {gender && <p className="text-caption tracking-fashion text-neutral-400 mb-1">{gender}</p>}
              <Link to={`/products/${slug}`} className="text-body-sm font-medium text-neutral-900 hover:text-brand-500 transition-colors line-clamp-1">{name}</Link>
            </div>
            <button onClick={handleToggleWishlist} className={cn("p-1.5 shrink-0 transition-colors", inWishlist ? "text-red-500" : "text-neutral-300 hover:text-red-400")} aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}>
              <Heart className="w-4 h-4" fill={inWishlist ? "currentColor" : "none"} />
            </button>
          </div>
          <PriceDisplay price={price} compareAtPrice={compareAtPrice} />
          <p className="text-body-xs text-neutral-500 mt-1 line-clamp-2">{product.shortDescription}</p>
          <div className="flex items-center gap-3 mt-3">
            <button onClick={handleAddToCart} className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 text-caption uppercase tracking-fashion hover:bg-neutral-800 transition-colors" aria-label={`Add ${name} to cart`}>
              <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
            </button>
            <button onClick={(e) => { e.preventDefault(); onQuickView?.(); }} className="flex items-center gap-1 text-caption tracking-fashion uppercase text-neutral-500 hover:text-neutral-900 transition-colors" aria-label={`Quick view ${name}`}>
              <Eye className="w-3.5 h-3.5" /> Quick View
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0 }} animate={{ opacity: 1 }}
      viewport={{ once: true }}
      className="product-card group relative"
    >
      <Link to={`/products/${slug}`} className="block md:aspect-[3/4] aspect-[3/4] bg-neutral-50 overflow-hidden relative">
        {!imageLoaded && <div className="absolute inset-0 bg-neutral-100 animate-pulse" />}
        <SafeImage
          src={primaryImage} alt={name}
          onLoad={() => setImageLoaded(true)}
          className={cn("w-full h-full object-cover transition-all duration-700 ease-luxe-out", !prefersReducedMotion && "md:group-hover:scale-[1.03]", imageLoaded ? "opacity-100" : "opacity-0")}
        />
        {hoverImage && !prefersReducedMotion && (
          <SafeImage src={hoverImage} alt={`${name} - alternate view`} className="absolute inset-0 w-full h-full object-cover opacity-0 md:group-hover:opacity-100 transition-opacity duration-700 ease-luxe-out" />
        )}

        {/* Badges — unified style for mobile and desktop */}
        {discount > 0 && (
          <span className="absolute top-3 left-3 md:top-4 md:left-4 text-[10px] tracking-[0.15em] uppercase text-neutral-700 font-medium bg-white/80 backdrop-blur-sm px-2 py-1">
            {discount}% OFF
          </span>
        )}
        {isNew && !discount && (
          <span className="absolute top-3 left-3 md:top-4 md:left-4 text-[10px] tracking-[0.15em] uppercase text-neutral-700 font-medium bg-white/80 backdrop-blur-sm px-2 py-1">
            New
          </span>
        )}
        {labels.length > 0 && !discount && !isNew && (
          <span className="absolute top-3 left-3 md:top-4 md:left-4 text-[10px] tracking-[0.15em] uppercase text-neutral-700 font-medium bg-white/80 backdrop-blur-sm px-2 py-1">
            {labels[0].label.name}
          </span>
        )}

        {/* Desktop: wishlist heart on hover — no circle bg */}
        <div className="hidden md:flex absolute top-4 right-4 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300">
          <button onClick={handleToggleWishlist} className={cn("p-1 transition-colors duration-200", inWishlist ? "text-brand-600" : "text-neutral-500 hover:text-brand-600")} aria-label="Toggle wishlist">
            <AnimatePresence mode="wait">
              {inWishlist ? (
                prefersReducedMotion ? (
                  <span className="flex items-center justify-center"><Heart className="w-4 h-4" fill="currentColor" /></span>
                ) : (
                  <motion.span key="filled" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center justify-center">
                    <Heart className="w-4 h-4" fill="currentColor" />
                  </motion.span>
                )
              ) : (
                prefersReducedMotion ? (
                  <span><Heart className="w-4 h-4" fill="none" /></span>
                ) : (
                  <motion.span key="outline" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Heart className="w-4 h-4" fill="none" />
                  </motion.span>
                )
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Mobile: wishlist heart only — clean minimal overlay */}
        <div className="md:hidden absolute top-3 right-3">
          <button onClick={handleToggleWishlist} className={cn("w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white hover:shadow-subtle transition-all duration-200", inWishlist ? "text-red-500" : "text-neutral-600")} aria-label="Toggle wishlist">
            <AnimatePresence mode="wait">
              {inWishlist ? (
                prefersReducedMotion ? (
                  <span className="flex items-center justify-center"><Heart className="w-4 h-4" fill="currentColor" /></span>
                ) : (
                  <motion.span key="filled" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center justify-center">
                    <Heart className="w-4 h-4" fill="currentColor" />
                  </motion.span>
                )
              ) : (
                prefersReducedMotion ? (
                  <span><Heart className="w-4 h-4" fill="none" /></span>
                ) : (
                  <motion.span key="outline" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Heart className="w-4 h-4" fill="none" />
                  </motion.span>
                )
              )}
            </AnimatePresence>
          </button>
        </div>
      </Link>

      {/* Desktop: clean product info — no card padding */}
      <div className="md:pt-4 md:pb-0 pt-3 pb-1 px-3 md:px-0">
        {/* Desktop: gender label above name */}
        {gender && <p className="hidden md:block text-[10px] tracking-[0.15em] uppercase text-neutral-400 mb-1">{gender}</p>}
        <Link to={`/products/${slug}`} className="block md:text-[13px] text-body-sm md:font-normal font-medium text-neutral-900 hover:text-brand-600 transition-colors truncate md:tracking-wide">{name}</Link>
        <PriceDisplay price={price} compareAtPrice={compareAtPrice} size="sm" className="mt-1" />

        {/* Desktop: color swatches below name */}
        {colors.length > 1 && (
          <div className="hidden md:flex gap-1.5 mt-2">
            {colors.slice(0, 5).map((hex, i) => (
              <span key={i} className="w-2.5 h-2.5 rounded-full ring-1 ring-neutral-200" style={{ backgroundColor: hex }} aria-label={`Color option ${i + 1}`} />
            ))}
            {colors.length > 5 && <span className="text-[10px] text-neutral-400 ml-0.5">+{colors.length - 5}</span>}
          </div>
        )}
      </div>

      {/* Desktop: add to bag — subtle button style */}
      <div className="hidden md:block px-0 pt-2 pb-6">
        <button
          onClick={handleAddToCart}
          disabled={!defaultVariant}
          className={cn(
            "text-[11px] tracking-[0.15em] uppercase transition-all duration-300 ease-luxe-out cursor-pointer",
            justAdded === defaultVariant?.id
              ? "text-green-700 opacity-100"
              : "text-neutral-500 hover:text-neutral-900 border-b border-neutral-300 hover:border-neutral-900 pb-0.5",
            !defaultVariant && "hidden"
          )}
        >
          {justAdded === defaultVariant?.id ? (
            <>
              <svg className="w-3 h-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Added
            </>
          ) : (
            "Add to bag"
          )}
        </button>
      </div>

      {/* Mobile: keep existing add to cart button */}
      <div className="md:hidden px-3 pb-4 pt-2">
        <button
          onClick={handleAddToCart}
          disabled={!defaultVariant}
          className={cn(
            "w-full py-3 text-caption uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ease-luxe-out",
            justAdded === defaultVariant?.id
              ? "bg-green-600 text-white opacity-100 translate-y-0"
              : "bg-neutral-900 text-white hover:bg-neutral-800",
            !defaultVariant && "hidden"
          )}
        >
          {justAdded === defaultVariant?.id ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Added
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
