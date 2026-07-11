import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Heart, ShoppingBag, X, ArrowLeft } from "lucide-react";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { useAuthStore } from "../../stores/auth-store";
import { useCartStore } from "../stores/cart-store";
import { useWishlist } from "../hooks/useWishlist";
import { SafeImage } from "../../components/SafeImage";
import { formatPrice } from "../../lib/utils/format";
import { cn } from "../../lib/utils/cn";
import { Helmet } from "react-helmet-async";

export default function WishlistPage() {
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();
  const { items, remove, error: wishlistError } = useWishlist();
  const prefersReducedMotion = useReducedMotion();
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
        <Helmet>
          <title>My Wishlist — নবME</title>
          <meta name="description" content="View your wishlist on নবME." />
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <Breadcrumbs items={[{ label: "My Wishlist" }]} className="mb-10" />
        <motion.div initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }} animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }} className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-10 bg-luxe-ivory rounded-full flex items-center justify-center">
            <Heart className="w-10 h-10 text-brand-400" />
          </div>
          <h1 className="font-display text-display-1 text-neutral-900 mb-5 text-balance">Login to View Your Wishlist</h1>
          <p className="text-body-base text-neutral-500 mb-12 leading-relaxed font-editorial">
            Save your favorite pieces and come back to them anytime.
          </p>
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-2 bg-neutral-900 text-white px-12 py-4 text-[11px] font-body font-medium tracking-[0.2em] uppercase hover:bg-neutral-800 transition-all duration-300"
          >
            Sign In
          </Link>
        </motion.div>
      </div>
    );
  }

  if (wishlistError && !loading) {
    return (
      <div className="container-page section-padding">
        <Helmet>
          <title>My Wishlist — নবME</title>
          <meta name="description" content="View your wishlist on নবME." />
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <Breadcrumbs items={[{ label: "My Wishlist" }]} className="mb-10" />
        <div className="text-center py-16">
          <p className="text-sm text-neutral-500 mb-4">Failed to load wishlist.</p>
          <button onClick={() => { if (typeof window !== 'undefined') window.location.reload(); }} className="text-xs text-brand-500 hover:underline uppercase tracking-widest">Retry</button>
        </div>
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <div className="container-page section-padding">
        <Helmet>
          <title>My Wishlist — নবME</title>
          <meta name="description" content="View your wishlist on নবME." />
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <Breadcrumbs items={[{ label: "My Wishlist" }]} className="mb-10" />
        <motion.div initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }} animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }} className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-10 bg-luxe-ivory rounded-full flex items-center justify-center">
            <Heart className="w-10 h-10 text-brand-400" />
          </div>
          <h1 className="font-display text-display-1 text-neutral-900 mb-5 text-balance">Your Wishlist is Empty</h1>
          <p className="text-body-base text-neutral-500 mb-12 leading-relaxed font-editorial">
            Start saving your favorite pieces.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-neutral-900 text-white px-12 py-4 text-[11px] font-body font-medium tracking-[0.2em] uppercase hover:bg-neutral-800 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" /> Explore Collection
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <Helmet>
        <title>My Wishlist — নবME</title>
        <meta name="description" content="View your wishlist on নবME." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="container-page pt-10 pb-28">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "My Wishlist" }]} className="mb-10" />

        <div className="mb-12">
          <h1 className="font-display text-display-1 md:text-display-2 text-neutral-900 text-balance">
            My Wishlist
          </h1>
          <p className="text-body-sm text-neutral-500 mt-2 font-editorial">
            {items.length} {items.length === 1 ? "piece" : "pieces"} saved
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          <AnimatePresence mode="popLayout">
            {items.map((wishlistItem) => {
              const variant = wishlistItem.variant;
              const product = variant?.product;
              const variantImages = variant?.images ?? [];
              const images = variantImages.length > 0 ? variantImages : (product?.images ?? []);
              const price = Number(product?.basePrice ?? 0);
              const compareAtPrice = product?.compareAtPrice ? Number(product.compareAtPrice) : null;
              const slug = product?.slug ?? "";
              const name = product?.name ?? "Product";

              return (
                <motion.div
                  key={wishlistItem.id}
                  layout
                  initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9, height: 0 }}
                  transition={prefersReducedMotion ? undefined : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative bg-white"
                >
                  <div className="relative aspect-[3/4] bg-neutral-50 overflow-hidden">
                    {slug ? (
                      <Link to={`/products/${slug}`} className="block w-full h-full">
                        <SafeImage
                          src={images[0]?.url}
                          alt={name}
                          responsive
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-luxe-out"
                        />
                        {images[1]?.url && (
                          <SafeImage
                            src={images[1].url}
                            alt={`${name} - alternate view`}
                            responsive
                            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-luxe-out"
                          />
                        )}
                      </Link>
                    ) : (
                      <SafeImage
                        src={images[0]?.url}
                        alt={name}
                        responsive
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
                        if (!variant?.id || !product?.id) return;
                        addItem({
                          productId: product.id,
                          variantId: variant.id,
                          name: name || "",
                          slug: slug || "",
                          sku: variant.sku || "",
                          size: variant.size || "One Size",
                          color: variant.color || "",
                          colorHex: variant.colorHex || "",
                          image: images[0]?.url || "",
                          price: price + Number(variant.priceAdjustment ?? 0),
                          compareAtPrice: compareAtPrice,
                          quantity: 1,
                          maxQuantity: variant.stock || 99,
                        });
                      }}
                      disabled={!variant?.id}
                      className={cn(
                        "w-full py-3 text-[10px] font-body font-medium tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all duration-300",
                        justAdded === variant?.id
                          ? "bg-green-600 text-white"
                          : "bg-neutral-900 text-white hover:bg-neutral-800",
                        !variant?.id && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      {justAdded === variant?.id ? (
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
