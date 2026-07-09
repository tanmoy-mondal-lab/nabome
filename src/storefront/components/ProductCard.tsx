import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { PriceDisplay } from "./PriceDisplay";
import { cn } from "../../lib/utils/cn";
import { SafeImage } from "../../components/SafeImage";
import { useWishlist } from "../hooks/useWishlist";
import { useCartStore } from "../stores/cart-store";
import { hapticMedium } from "../../lib/utils/haptic";
import type { Product } from "../../types/product";

interface ProductCardProps {
  product: Product;
  onQuickView?: () => void;
  view?: "grid" | "list";
}

export function ProductCard({ product, onQuickView, view = "grid" }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { add: addToWishlist, remove: removeFromWishlist, isInWishlist } = useWishlist();
  const addItem = useCartStore((s) => s.addItem);
  const justAdded = useCartStore((s) => s.justAdded);
  const name = product.name;
  const slug = product.slug;
  const basePrice = Number(product.basePrice ?? 0);
  const salePrice = product.salePrice ? Number(product.salePrice) : null;
  const price = salePrice && salePrice > 0 ? salePrice : basePrice;
  const compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const images = product.images ?? [];
  const primaryMedia = images.find((img) => img.isPrimary) ?? images[0];
  const primaryImage = primaryMedia?.url;
  const isPrimaryVideo = primaryMedia?.type === "video" || /\.(mp4|webm|mov|avi)(\?|$)/.test((primaryMedia?.url ?? "").toLowerCase());
  const hoverImage = images[1]?.url;
  const labels = product.productLabels ?? [];
  const gender = product.gender;
  const isNew = product.isNew;
  const variants = product.variants ?? [];
  const colorEntries = [...new Map(variants.filter((v) => v.colorHex).map((v) => [v.colorHex, { hex: v.colorHex, name: v.color || "" }])).values()];
  const discount = compareAtPrice && compareAtPrice > price ? Math.round((1 - price / compareAtPrice) * 100) : 0;

  const defaultVariant = variants[0];
  const inWishlist = defaultVariant ? isInWishlist(defaultVariant.id) : false;

  function handleToggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!defaultVariant) return;
    hapticMedium();
    if (inWishlist) {
      void removeFromWishlist(defaultVariant.id);
    } else {
      void addToWishlist(defaultVariant.id);
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
          {isPrimaryVideo ? (
            <video src={primaryImage} muted loop playsInline className="w-full h-full object-cover transition-transform duration-700 ease-luxe-out group-hover:scale-105" />
          ) : (
            <SafeImage src={primaryImage || "/placeholder.svg"} alt={name} responsive premium className="w-full h-full object-cover transition-transform duration-700 ease-luxe-out group-hover:scale-105" />
          )}
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
            <button onClick={handleAddToCart} className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 text-caption uppercase tracking-fashion rounded-sm hover:bg-accent-gold transition-colors" aria-label={`Add ${name} to cart`}>
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
      className="product-card group relative flex flex-col h-full"
    >
      <Link to={`/products/${slug}`} className="block md:aspect-[3/4] aspect-[3/4] bg-luxe-ivory overflow-hidden relative" style={{ touchAction: 'manipulation' }}>
        {!imageLoaded && !imageError && <div className="absolute inset-0 bg-luxe-ivory animate-pulse" />}
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
            <div className="text-center">
              <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-500 font-medium">নবME</p>
              <p className="text-[9px] tracking-[0.15em] uppercase text-neutral-600 mt-1">Premium</p>
            </div>
          </div>
        ) : isPrimaryVideo ? (
          <video
            src={primaryImage}
            muted
            loop
            playsInline
            onLoadedData={() => setImageLoaded(true)}
            onError={() => { setImageLoaded(true); setImageError(true); }}
            className={cn("w-full h-full object-cover transition-all duration-700 ease-luxe-out", !prefersReducedMotion && "md:group-hover:scale-[1.05]", imageLoaded ? "opacity-100" : "opacity-0")}
          />
        ) : (
          <SafeImage
            src={primaryImage} alt={name}
            responsive
            premium
            onLoad={() => setImageLoaded(true)}
            onError={() => { setImageLoaded(true); setImageError(true); }}
            className={cn("w-full h-full object-cover transition-all duration-700 ease-luxe-out", !prefersReducedMotion && "md:group-hover:scale-[1.05]", imageLoaded ? "opacity-100" : "opacity-0")}
          />
        )}
        {hoverImage && !prefersReducedMotion && (
          <SafeImage src={hoverImage} alt={`${name} - alternate view`} responsive className="absolute inset-0 w-full h-full object-cover opacity-0 md:group-hover:opacity-100 transition-opacity duration-700 ease-luxe-out" />
        )}

        {/* Badges — premium editorial style */}
        {discount > 0 && (
          <span className="absolute top-2.5 left-2.5 md:top-4 md:left-4 text-[9px] md:text-[10px] tracking-[0.15em] uppercase font-medium bg-accent-gold/95 backdrop-blur-sm text-white px-2.5 py-1 md:px-3 md:py-1.5 shadow-gold-soft z-10">
            {discount}% OFF
          </span>
        )}
        {isNew && !discount && (
          <span className="absolute top-2.5 left-2.5 md:top-4 md:left-4 text-[9px] md:text-[10px] tracking-[0.15em] uppercase font-medium bg-neutral-900/95 backdrop-blur-sm text-white px-2.5 py-1 md:px-3 md:py-1.5 z-10">
            New
          </span>
        )}
        {labels.length > 0 && !discount && !isNew && (
          <span className="absolute top-2.5 left-2.5 md:top-4 md:left-4 text-[9px] md:text-[10px] tracking-[0.15em] uppercase font-medium bg-neutral-900/95 backdrop-blur-sm text-white px-2.5 py-1 md:px-3 md:py-1.5 z-10">
            {labels[0].label.name}
          </span>
        )}

        {/* Desktop: wishlist heart on hover — always visible on touch */}
        <div className="hidden md:flex absolute top-4 right-4 max-md:opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity duration-300">
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
        <div className="md:hidden absolute top-2.5 right-2.5 z-20">
          <button onClick={handleToggleWishlist} className={cn("w-10 h-10 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 border border-white/20", inWishlist ? "text-red-500" : "text-neutral-700")} aria-label="Toggle wishlist">
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

      {/* Desktop: clean product info — refined spacing */}
      <div className="md:pt-4 md:pb-0 pt-3.5 pb-2 px-3 md:px-0">
        {/* Desktop: gender label above name */}
        {gender && <p className="hidden md:block text-[10px] tracking-[0.15em] uppercase text-neutral-400 mb-1">{gender}</p>}
        {/* Mobile: gender label above name */}
        {gender && <p className="md:hidden text-[9px] tracking-[0.12em] uppercase text-neutral-500 mb-1">{gender}</p>}
        <Link to={`/products/${slug}`} className="block md:text-sm text-sm md:font-medium font-semibold text-neutral-900 hover:text-brand-600 transition-colors line-clamp-2 md:line-clamp-1 md:tracking-wide leading-snug">{name}</Link>
        <PriceDisplay price={price} compareAtPrice={compareAtPrice} size="sm" className="mt-1.5" />

        {/* Desktop: color swatches below name */}
        {colorEntries.length > 1 && (
          <div className="hidden md:flex gap-1.5 mt-2">
            {colorEntries.slice(0, 5).map((entry, i) => (
              <span key={i} className="w-2.5 h-2.5 rounded-full ring-1 ring-neutral-200" style={{ backgroundColor: entry.hex }} aria-label={`Color: ${entry.name || `option ${i + 1}`}`} />
            ))}
            {colorEntries.length > 5 && <span className="text-[10px] text-neutral-400 ml-0.5">+{colorEntries.length - 5}</span>}
          </div>
        )}
      </div>

      {/* Desktop: add to bag — premium gold button */}
      <div className="hidden md:block px-0 pt-3 pb-6">
        <button
          onClick={handleAddToCart}
          disabled={!defaultVariant}
          className={cn(
            "w-full py-2.5 text-[11px] tracking-[0.2em] uppercase font-medium transition-all duration-300 ease-luxe-out cursor-pointer rounded-sm",
            justAdded === defaultVariant?.id
              ? "bg-green-600 text-white opacity-100"
              : "bg-neutral-900 text-white hover:bg-accent-gold",
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

      {/* Mobile: premium add to cart button */}
      <div className="md:hidden px-3 pb-4 pt-2.5">
        <button
          onClick={handleAddToCart}
          disabled={!defaultVariant}
          className={cn(
            "w-full py-3 text-[11px] uppercase tracking-[0.18em] font-semibold flex items-center justify-center gap-2 transition-all duration-300 ease-luxe-out rounded-sm shadow-md hover:shadow-lg",
            justAdded === defaultVariant?.id
              ? "bg-green-600 text-white opacity-100 translate-y-0"
              : "bg-neutral-900 text-white hover:bg-neutral-800",
            !defaultVariant && "hidden"
          )}
        >
          {justAdded === defaultVariant?.id ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Added
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" /> Add to Cart
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
