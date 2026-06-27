import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, X, ArrowLeft } from "lucide-react";
import { api } from "../../lib/api/client";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { useAuthStore } from "../../stores/auth-store";
import { useCartStore } from "../stores/cart-store";
import { useWishlist } from "../hooks/useWishlist";
import { SafeImage } from "../../components/SafeImage";
import { formatPrice } from "../../lib/utils/format";
import { cn } from "../../lib/utils/cn";

export default function WishlistPage() {
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();
  const { items, remove } = useWishlist();
  const addItem = useCartStore((s) => s.addItem);
  const justAdded = useCartStore((s) => s.justAdded);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    // Wait for wishlist data to load from hook
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  async function handleRemove(variantId: string) {
    setRemovingId(variantId);
    await remove(variantId);
    setRemovingId(null);
  }

  if (!isAuthenticated) {
    return (
      <div className="container-page section-padding">
        <Breadcrumbs items={[{ label: "My Wishlist" }]} className="mb-6" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-8 bg-luxe-ivory rounded-full flex items-center justify-center">
            <Heart className="w-10 h-10 text-brand-400" />
          </div>
          <h1 className="font-display text-display-3 text-neutral-900 mb-4 text-balance">Login to View Your Wishlist</h1>
          <p className="text-body-base text-neutral-500 mb-10 leading-relaxed font-editorial">
            Save your favorite pieces and come back to them anytime.
          </p>
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-2 bg-neutral-900 text-white px-10 py-4 text-[11px] font-body font-medium tracking-[0.2em] uppercase hover:bg-neutral-800 transition-all duration-300"
          >
            Sign In
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <div className="container-page section-padding">
        <Breadcrumbs items={[{ label: "My Wishlist" }]} className="mb-6" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-8 bg-luxe-ivory rounded-full flex items-center justify-center">
            <Heart className="w-10 h-10 text-brand-400" />
          </div>
          <h1 className="font-display text-display-3 text-neutral-900 mb-4 text-balance">Your Wishlist is Empty</h1>
          <p className="text-body-base text-neutral-500 mb-10 leading-relaxed font-editorial">
            Start saving your favorite pieces.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-neutral-900 text-white px-10 py-4 text-[11px] font-body font-medium tracking-[0.2em] uppercase hover:bg-neutral-800 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" /> Explore Collection
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="container-page pt-8 pb-24">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "My Wishlist" }]} className="mb-8" />

        <div className="mb-10">
          <h1 className="font-display text-heading-1 md:text-display-3 text-neutral-900 text-balance">
            My Wishlist
          </h1>
          <p className="text-body-sm text-neutral-500 mt-2 font-editorial">
            {items.length} {items.length === 1 ? "piece" : "pieces"} saved
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          <AnimatePresence mode="popLayout">
            {items.map((wishlistItem) => {
              // Data is nested: variant.product
              const variant = (wishlistItem.variant ?? {}) as Record<string, unknown>;
              const product = (variant.product ?? {}) as Record<string, unknown>;
              const variantImages = (variant.images as { url: string; isPrimary?: boolean }[]) ?? [];
              const images = variantImages.length > 0 ? variantImages : ((product.images as { url: string }[]) ?? []);
              const price = Number(product.basePrice ?? 0);
              const compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
              const slug = product.slug as string;
              const name = product.name as string;

              return (
                <motion.div
                  key={wishlistItem.id as string}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative bg-white"
                >
                  <div className="relative aspect-[3/4] bg-neutral-50 overflow-hidden">
                    {slug ? (
                      <Link to={`/products/${slug}`} className="block w-full h-full">
                        <SafeImage
                          src={images[0]?.url}
                          alt={name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-luxe-out"
                        />
                        {images[1]?.url && (
                          <SafeImage
                            src={images[1].url}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-luxe-out"
                          />
                        )}
                      </Link>
                    ) : (
                      <SafeImage
                        src={images[0]?.url}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    )}

                    <button
                      onClick={() => handleRemove(wishlistItem.variantId as string)}
                      disabled={removingId === wishlistItem.variantId}
                      className={cn(
                        "absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm transition-all duration-300",
                        "opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-110",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                      aria-label="Remove from wishlist"
                    >
                      <X className="w-4 h-4 text-neutral-600" />
                    </button>

                    {compareAtPrice && compareAtPrice > price && (
                      <span className="absolute top-3 left-3 label-sale">
                        {Math.round((1 - price / compareAtPrice) * 100)}% OFF
                      </span>
                    )}
                  </div>

                  <div className="pt-4 pb-2 px-1">
                    {slug ? (
                      <Link
                        to={`/products/${slug}`}
                        className="text-body-sm font-body font-medium text-neutral-900 hover:text-brand-500 transition-colors duration-300 block truncate"
                      >
                        {name}
                      </Link>
                    ) : (
                      <span className="text-body-sm font-body font-medium text-neutral-900 block truncate">
                        {name}
                      </span>
                    )}
                    <div className="flex items-baseline gap-2 mt-1.5">
                      <span className="text-body-sm font-body font-semibold text-neutral-900">
                        {formatPrice(price)}
                      </span>
                      {compareAtPrice && compareAtPrice > price && (
                        <span className="text-xs font-body text-neutral-400 line-through">
                          {formatPrice(compareAtPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="px-1 pb-4">
                    <button
                      onClick={() => {
                        if (!variant.id) return;
                        addItem({
                          productId: (product.id as string) || "",
                          variantId: (variant.id as string) || "",
                          name: name || "",
                          slug: slug || "",
                          sku: (variant.sku as string) || "",
                          size: (variant.size as string) || "One Size",
                          color: (variant.color as string) || "",
                          colorHex: (variant.colorHex as string) || "",
                          image: images[0]?.url || "",
                          price: price + Number(variant.priceAdjustment ?? 0),
                          compareAtPrice: compareAtPrice,
                          quantity: 1,
                          maxQuantity: (variant.stock as number) || 99,
                        });
                      }}
                      disabled={!variant.id}
                      className={cn(
                        "w-full py-3 text-[10px] font-body font-medium tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all duration-300",
                        justAdded === variant.id
                          ? "bg-green-600 text-white"
                          : "bg-neutral-900 text-white hover:bg-neutral-800",
                        !variant.id && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      {justAdded === variant.id ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Added to Cart
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
