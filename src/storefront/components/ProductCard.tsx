import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { PriceDisplay } from "./PriceDisplay";
import { cn } from "../../lib/utils/cn";
import { SafeImage } from "../../components/SafeImage";
import { useWishlist } from "../hooks/useWishlist";
import { useCartStore } from "../stores/cart-store";
import { useAuthStore } from "../../stores/auth-store";
import { hapticMedium } from "../../lib/utils/haptic";

interface ProductCardProps {
  product: Record<string, unknown>;
  onQuickView?: () => void;
  view?: "grid" | "list";
}

export function ProductCard({ product, onQuickView, view = "grid" }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const navigate = useNavigate();
  const { add: addToWishlist, remove: removeFromWishlist, isInWishlist } = useWishlist();
  const addItem = useCartStore((s) => s.addItem);
  const justAdded = useCartStore((s) => s.justAdded);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const name = product.name as string;
  const slug = product.slug as string;
  const basePrice = Number(product.basePrice ?? 0);
  const salePrice = product.salePrice ? Number(product.salePrice) : null;
  const price = salePrice && salePrice > 0 ? salePrice : basePrice;
  const compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const images = (product.images as { url: string }[]) ?? [];
  const primaryImage = images[0]?.url;
  const hoverImage = images[1]?.url;
  const labels = (product.productLabels as { label: Record<string, unknown> }[]) ?? [];
  const gender = product.gender as string;
  const isNew = product.isNew as boolean;
  const variants = (product.variants as Record<string, unknown>[]) ?? [];
  const colors = [...new Set(variants.map((v) => v.colorHex as string).filter(Boolean))];
  const discount = compareAtPrice && compareAtPrice > price ? Math.round((1 - price / compareAtPrice) * 100) : 0;

  const defaultVariant = variants[0];
  const inWishlist = defaultVariant ? isInWishlist(defaultVariant.id as string) : false;

  function handleToggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!defaultVariant) return;
    if (!isAuthenticated) {
      navigate("/auth/login", { state: { from: window.location.pathname } });
      return;
    }
    hapticMedium();
    if (inWishlist) {
      removeFromWishlist(defaultVariant.id as string);
    } else {
      addToWishlist(defaultVariant.id as string);
    }
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!defaultVariant) return;
    if (!isAuthenticated) {
      navigate("/auth/login", { state: { from: window.location.pathname } });
      return;
    }
    addItem({
      productId: product.id as string,
      variantId: defaultVariant.id as string,
      name: product.name as string,
      slug: product.slug as string,
      sku: (defaultVariant.sku as string) || "",
      size: (defaultVariant.size as string) || "One Size",
      color: (defaultVariant.color as string) || "",
      colorHex: (defaultVariant.colorHex as string) || "",
      image: primaryImage || "",
      price: price + Number(defaultVariant.priceAdjustment ?? 0),
      compareAtPrice: compareAtPrice,
      quantity: 1,
      maxQuantity: (defaultVariant.stock as number) || 99,
    });
  }

  if (view === "list") {
    return (
      <div className="premium-card flex gap-6 p-4 group">
        <Link to={`/products/${slug}`} className="w-32 h-44 shrink-0 bg-neutral-50 overflow-hidden">
          <SafeImage src={primaryImage || "/placeholder.svg"} alt={name} className="w-full h-full object-cover transition-transform duration-700 ease-luxe-out group-hover:scale-105" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              {gender && <p className="text-caption tracking-fashion text-neutral-400 mb-1">{gender}</p>}
              <Link to={`/products/${slug}`} className="text-body-sm font-medium text-neutral-900 hover:text-brand-500 transition-colors line-clamp-1">{name}</Link>
            </div>
            <button onClick={handleToggleWishlist} className={cn("p-1.5 shrink-0 transition-colors", inWishlist ? "text-red-500" : "text-neutral-300 hover:text-red-400")}>
              <Heart className="w-4 h-4" fill={inWishlist ? "currentColor" : "none"} />
            </button>
          </div>
          <PriceDisplay price={price} compareAtPrice={compareAtPrice} />
          <p className="text-body-xs text-neutral-500 mt-1 line-clamp-2">{product.shortDescription as string}</p>
          <div className="flex items-center gap-3 mt-3">
            <button onClick={handleAddToCart} className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 text-caption uppercase tracking-fashion hover:bg-neutral-800 transition-colors">
              <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
            </button>
            <button onClick={(e) => { e.preventDefault(); onQuickView?.(); }} className="flex items-center gap-1 text-caption tracking-fashion uppercase text-neutral-500 hover:text-neutral-900 transition-colors">
              <Eye className="w-3.5 h-3.5" /> Quick View
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="premium-card premium-card-lift group relative bg-white"
    >
        <Link to={`/products/${slug}`} className="block aspect-[3/4] bg-neutral-50 overflow-hidden relative">
          {!imageLoaded && <div className="absolute inset-0 bg-neutral-100 animate-pulse" />}
          <SafeImage
            src={primaryImage} alt={name}
            onLoad={() => setImageLoaded(true)}
            className={cn("w-full h-full object-cover transition-all duration-700 ease-luxe-out group-hover:scale-105", imageLoaded ? "opacity-100" : "opacity-0")}
          />
          {hoverImage && (
            <SafeImage src={hoverImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-luxe-out" />
          )}

        {discount > 0 && (
          <span className="absolute top-3 left-3 label-sale">{discount}% OFF</span>
        )}
        {isNew && !discount && (
          <span className="absolute top-3 left-3 label-new">New</span>
        )}
        {labels.length > 0 && !discount && !isNew && (
          <span className="absolute top-3 left-3 label-exclusive">{(labels[0].label as Record<string, unknown>).name as string}</span>
        )}

        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView?.(); }} className="w-11 h-11 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white hover:shadow-subtle transition-all duration-200 text-neutral-600" aria-label="Quick view">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={handleToggleWishlist} className={cn("w-11 h-11 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white hover:shadow-subtle transition-all duration-200", inWishlist ? "text-red-500" : "text-neutral-600")} aria-label="Toggle wishlist">
            <AnimatePresence mode="wait">
              {inWishlist ? (
                <motion.span key="filled" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center justify-center">
                  <Heart className="w-4 h-4" fill="currentColor" />
                </motion.span>
              ) : (
                <motion.span key="outline" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Heart className="w-4 h-4" fill="none" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-mono text-neutral-600 shadow-subtle opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {images.length} photos
          </div>
        )}

        {colors.length > 1 && (
          <div className="absolute bottom-3 left-3 flex gap-1.5">
            {colors.slice(0, 4).map((hex, i) => (
              <span key={i} className="w-3 h-3 rounded-full ring-1 ring-white shadow-sm" style={{ backgroundColor: hex }} />
            ))}
            {colors.length > 4 && <span className="text-2xs text-neutral-500">+{colors.length - 4}</span>}
          </div>
        )}
      </Link>

      <div className="pt-3 pb-1 px-3">
        {gender && <p className="text-caption tracking-fashion text-neutral-400 mb-0.5">{gender}</p>}
        <Link to={`/products/${slug}`} className="block text-body-sm font-medium text-neutral-900 hover:text-brand-500 transition-colors truncate">{name}</Link>
        <PriceDisplay price={price} compareAtPrice={compareAtPrice} size="sm" className="mt-0.5" />
      </div>

      <div className="px-3 pb-3 pt-2">
        <button
          onClick={handleAddToCart}
          disabled={!defaultVariant}
          className={cn(
            "w-full py-2.5 text-caption uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ease-luxe-out",
            justAdded === defaultVariant?.id
              ? "bg-green-600 text-white opacity-100 translate-y-0"
              : "bg-neutral-900 text-white opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 hover:bg-neutral-800",
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
