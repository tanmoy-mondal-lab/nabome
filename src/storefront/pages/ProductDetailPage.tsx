import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Shield, Truck, RotateCcw, Star, X } from "lucide-react";
import { useProduct } from "../hooks/useProducts";
import { ImageGallery } from "../components/ImageGallery";
import { SizeSelector } from "../components/SizeSelector";
import { ColorSelector } from "../components/ColorSelector";
import { QuantitySelector } from "../components/QuantitySelector";
import { PriceDisplay } from "../components/PriceDisplay";
import { StarRating } from "../components/StarRating";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { ProductRecommendations } from "../components/ProductRecommendations";
import { ProductCard } from "../components/ProductCard";
import { Reviews } from "../components/Reviews";
import { FrequentlyBoughtTogether } from "../components/FrequentlyBoughtTogether";
import { RecentlyViewed } from "../components/RecentlyViewed";
import { useCartStore } from "../stores/cart-store";
import { useWishlist } from "../hooks/useWishlist";
import { useAuthStore } from "../../stores/auth-store";
import { addRecentlyViewed } from "../lib/recommendations";
import { cn } from "../../lib/utils/cn";
import { canonical, productSchema, breadcrumbSchema } from "../../lib/seo";
import { img } from "../../lib/seo";
import { useSettings } from "../hooks/useSettings";
import { formatPrice } from "../../lib/utils/format";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: productData, isLoading: loading, error: queryError } = useProduct(slug);
  const { data: settingsData } = useSettings();
  const product = (productData as { product?: Record<string, unknown> })?.product;
  const related = (product?.relatedProducts as Record<string, unknown>[]) ?? [];
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "features" | "specs">("description");
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const justAdded = useCartStore((s) => s.justAdded);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { add: addToWishlist, remove: removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    if (product?.slug) addRecentlyViewed(product.slug as string);
  }, [product?.slug]);

  useEffect(() => {
    if (!product?.name) return;
    document.title = `${product.name as string} — নবME`;
  }, [product?.name]);

  const error = queryError ? "Failed to load product." : null;

  if (loading) {
    return (
      <div className="container-page section-padding">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          <div className="aspect-[3/4] bg-luxe-ivory animate-pulse" />
          <div className="space-y-6">
            <div className="h-3 bg-luxe-ivory animate-pulse rounded w-1/4" />
            <div className="h-10 bg-luxe-ivory animate-pulse rounded w-3/4" />
            <div className="h-6 bg-luxe-ivory animate-pulse rounded w-1/3" />
            <div className="h-32 bg-luxe-ivory animate-pulse rounded" />
            <div className="h-12 bg-luxe-ivory animate-pulse rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-page section-padding text-center">
        <h1 className="font-display text-display-1 text-neutral-900 mb-4 text-balance">{error}</h1>
        <button onClick={() => window.location.reload()} className="text-brand-500 hover:underline text-sm">
          Retry
        </button>
        <div className="mt-4">
          <Link to="/products" className="text-brand-500 hover:underline">Browse all products</Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-page section-padding text-center">
        <h1 className="font-display text-display-1 text-neutral-900 mb-4 text-balance">Product Not Found</h1>
        <Link to="/products" className="text-brand-500 hover:underline">Browse all products</Link>
      </div>
    );
  }

  const allImages = (product.images as { url: string; altText?: string }[]) ?? [];
  const variants = (product.variants as Record<string, unknown>[]) ?? [];
  const sizes = [...new Set(variants.map((v) => v.size as string).filter(Boolean))];
  const colors = [...new Map(variants.filter((v) => v.colorHex).map((v) => [v.colorHex as string, { hex: v.colorHex as string, name: v.color as string }])).values()];
  const brand = product.brand as Record<string, unknown>;
  const category = product.category as Record<string, unknown>;
  const labels = (product.productLabels as { label: Record<string, unknown> }[]) ?? [];
  const basePrice = Number(product.basePrice ?? 0);
  const salePrice = product.salePrice ? Number(product.salePrice) : null;
  const price = salePrice && salePrice > 0 ? salePrice : basePrice;
  const compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;

  const filteredVariants = variants.filter((v) => !selectedColor || v.colorHex === selectedColor);
  const sizeStock: Record<string, number> = {};
  filteredVariants.forEach((v) => { sizeStock[v.size as string] = (v.stock as number) ?? 0; });

  const matchedVariant = variants.find((v) => v.size === selectedSize && v.colorHex === selectedColor)
    ?? variants.find((v) => v.size === selectedSize)
    ?? variants.find((v) => v.colorHex === selectedColor)
    ?? variants[0];

  const variantPrice = price + (Number(matchedVariant?.priceAdjustment ?? 0));

  const variantImages = ((matchedVariant as Record<string, unknown>)?.images as { url: string; altText?: string }[]) ?? [];
  const images = variantImages.length > 0 ? [...variantImages, ...allImages.filter((ai) => !variantImages.some((vi) => vi.url === ai.url))] : allImages;

  function handleAddToCart() {
    if (!matchedVariant || !product) return;
    if (!isAuthenticated) {
      navigate("/auth/login", { state: { from: window.location.pathname } });
      return;
    }
    addItem({
      productId: product.id as string,
      variantId: matchedVariant.id as string,
      name: product.name as string,
      slug: product.slug as string,
      sku: matchedVariant.sku as string,
      size: matchedVariant.size as string || "One Size",
      color: matchedVariant.color as string || "",
      colorHex: matchedVariant.colorHex as string || "",
      image: images[0]?.url || "",
      price: variantPrice,
      compareAtPrice: compareAtPrice,
      quantity,
      maxQuantity: (matchedVariant.stock as number) || 99,
    });
  }

  function handleWishlistToggle() {
    if (!matchedVariant) return;
    if (!isAuthenticated) {
      navigate("/auth/login", { state: { from: window.location.pathname } });
      return;
    }
    if (isInWishlist(matchedVariant.id as string)) {
      removeFromWishlist(matchedVariant.id as string);
    } else {
      addToWishlist(matchedVariant.id as string);
    }
  }

  const reviewCount = Number((product._count as Record<string, unknown>)?.reviews ?? 0);
  const reviews = product.reviews as { average?: number; distribution?: number[]; items?: Record<string, unknown>[] } | undefined;
  const averageRating = reviews?.average ?? 0;

  const freeShippingThreshold = Number((settingsData?.preferences as Record<string, unknown>)?.freeShippingThreshold ?? 500);
  const locale = (settingsData?.preferences as Record<string, unknown>)?.locale as string || "en_IN";
  const sizeGuideData = product.sizeGuide as { measurements?: { size: string; chest?: string; waist?: string; length?: string }[] } | undefined;

  return (
    <div className="bg-white">
      <Helmet>
        <meta name="description" content={(product.description as string)?.slice(0, 160)} />
        <link rel="canonical" href={canonical(`/products/${slug}`)} />
        <meta name="robots" content="index, follow" />

        <meta property="og:title" content={`${product.name as string} — নবME`} />
        <meta property="og:description" content={(product.description as string)?.slice(0, 200)} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={canonical(`/products/${slug}`)} />
        <meta property="og:site_name" content="নবME" />
        <meta property="og:locale" content={locale} />
        {(product.images as { url: string }[])?.[0] && (
          <meta property="og:image" content={img((product.images as { url: string }[])[0].url, { width: 1200, height: 630 })} />
        )}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${product.name as string} — নবME`} />
        <meta name="twitter:description" content={(product.description as string)?.slice(0, 160)} />
        {(product.images as { url: string }[])?.[0] && (
          <meta name="twitter:image" content={img((product.images as { url: string }[])[0].url, { width: 1200, height: 630 })} />
        )}

        <script type="application/ld+json">{JSON.stringify(productSchema(product))}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema([
          ...(category ? [{ label: category.name as string, url: `/products?category=${(category.slug as string) || ""}` }] : []),
          { label: product.name as string },
        ]))}</script>
      </Helmet>

      <div className="container-page pt-6 pb-20">
        <Breadcrumbs items={[
          { label: "Home", href: "/" },
          ...(category ? [{ label: category.name as string, href: `/products?category=${(category.slug as string) || ""}` }] : []),
          { label: product.name as string },
        ]} className="mb-8" />

        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <ImageGallery images={images} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            {brand && (
              <Link
                to={`/products?brand=${brand.slug}`}
                className="inline-block text-[10px] font-body font-medium tracking-[0.2em] uppercase text-brand-500 hover:text-brand-600 transition-colors"
              >
                {brand.name as string}
              </Link>
            )}

            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {labels.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {labels.map((l, i) => (
                        <span
                          key={i}
                          className="label-badge text-[10px] px-2.5 py-1"
                          style={{
                            backgroundColor: (l.label as Record<string, unknown>).color as string || "#c9a84c",
                            color: "#fff",
                          }}
                        >
                          {(l.label as Record<string, unknown>).name as string}
                        </span>
                      ))}
                    </div>
                  )}
                  <h1 className="font-display text-heading-1 md:text-display-3 text-neutral-900 text-balance leading-tight">
                    {product.name as string}
                  </h1>
                </div>
                <button
                  onClick={handleWishlistToggle}
                  className={cn(
                    "p-3 shrink-0 rounded-full border transition-all duration-300",
                    isInWishlist(matchedVariant?.id as string)
                      ? "border-red-200 bg-red-50 text-red-500 scale-110"
                      : "border-neutral-200 text-neutral-400 hover:border-red-200 hover:text-red-400"
                  )}
                >
                  <Heart
                    className="w-5 h-5 transition-transform duration-300"
                    fill={isInWishlist(matchedVariant?.id as string) ? "currentColor" : "none"}
                  />
                </button>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <PriceDisplay price={variantPrice} compareAtPrice={compareAtPrice} size="lg" />
                {reviewCount > 0 && (
                  <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                    <StarRating rating={averageRating} size={14} />
                    <span className="text-xs">({reviewCount})</span>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />

            <p className="font-editorial text-body-base leading-relaxed text-neutral-600">
              {product.shortDescription as string || product.description as string}
            </p>

            {matchedVariant && (matchedVariant.stock as number) > 0 && (matchedVariant.stock as number) <= 5 && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-100">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <p className="text-xs font-medium text-amber-700">
                  Only {(matchedVariant.stock as number)} left in stock — order soon
                </p>
              </div>
            )}
            {matchedVariant && (matchedVariant.stock as number) === 0 && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-100">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <p className="text-xs font-medium text-red-600">Currently out of stock</p>
              </div>
            )}

            {colors.length > 0 && (
              <div>
                <p className="text-[10px] font-body font-medium tracking-[0.2em] uppercase text-neutral-500 mb-3">
                  Color{colors.length > 1 ? "s" : ""}
                </p>
                <ColorSelector colors={colors} selected={selectedColor} onChange={setSelectedColor} />
              </div>
            )}

            {sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-body font-medium tracking-[0.2em] uppercase text-neutral-500">
                    Size
                  </p>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="text-[10px] font-body text-brand-500 hover:text-brand-600 underline underline-offset-2 transition-colors"
                  >
                    Size Guide
                  </button>
                </div>
                <SizeSelector sizes={sizes} selected={selectedSize} onChange={setSelectedSize} stock={sizeStock} />
              </div>
            )}

            <div className="flex items-center gap-4">
              <QuantitySelector value={quantity} onChange={setQuantity} max={(matchedVariant?.stock as number) || 99} />
              <button
                onClick={handleAddToCart}
                disabled={!matchedVariant || (matchedVariant.stock as number) === 0}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2.5 py-3.5 font-body text-xs font-medium tracking-widest uppercase transition-all duration-300",
                  justAdded === matchedVariant?.id
                    ? "bg-green-600 text-white"
                    : "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700",
                  (!matchedVariant || (matchedVariant.stock as number) === 0) && "opacity-40 cursor-not-allowed"
                )}
              >
                {justAdded === matchedVariant?.id ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-px bg-neutral-100 overflow-hidden">
              {[
                { icon: Truck, label: "Free Shipping", desc: `Orders above ${formatPrice(freeShippingThreshold)}` },
                { icon: RotateCcw, label: "Easy Returns", desc: "30-day policy" },
                { icon: Shield, label: "Secure", desc: "Checkout" },
              ].map((item) => (
                <div key={item.label} className="bg-white px-4 py-5 text-center group">
                  <item.icon className="w-5 h-5 mx-auto text-brand-400 mb-2 group-hover:scale-110 transition-transform duration-300" />
                  <p className="text-[10px] font-body font-semibold tracking-[0.15em] uppercase text-neutral-800 mb-0.5">
                    {item.label}
                  </p>
                  <p className="text-[10px] font-body text-neutral-400 tracking-wide">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="mt-16 lg:mt-24">
          <div className="border-b border-neutral-200">
            <div className="flex gap-0">
              {(["description", "features", "specs"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "relative px-8 py-4 text-[11px] font-body font-medium tracking-[0.2em] uppercase transition-all duration-300",
                    activeTab === tab
                      ? "text-neutral-900"
                      : "text-neutral-400 hover:text-neutral-600"
                  )}
                >
                  {tab === "description" ? "Description" : tab === "features" ? "Features" : "Specifications"}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-px bg-neutral-900"
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="py-10"
          >
            {activeTab === "description" && (
              <div className="max-w-3xl">
                <div className="editorial-lead text-neutral-700 whitespace-pre-line">
                  {product.description as string || "No description available."}
                </div>
              </div>
            )}
            {activeTab === "features" && (
              <div className="max-w-3xl">
                {(product.features as string[] || []).length > 0 ? (
                  <ul className="space-y-3">
                    {(product.features as string[]).map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-neutral-700">
                        <span className="w-1 h-1 rounded-full bg-brand-400 mt-2 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-neutral-500 italic">No features listed.</p>
                )}
              </div>
            )}
            {activeTab === "specs" && (
              <div className="max-w-2xl">
                <div className="divide-y divide-neutral-100">
                  {!!product.material && (
                    <div className="flex py-4">
                      <span className="w-36 text-[10px] font-body font-medium tracking-[0.2em] uppercase text-neutral-400 shrink-0">Material</span>
                      <span className="text-sm text-neutral-800">{product.material as string}</span>
                    </div>
                  )}
                  {!!product.gender && (
                    <div className="flex py-4">
                      <span className="w-36 text-[10px] font-body font-medium tracking-[0.2em] uppercase text-neutral-400 shrink-0">Gender</span>
                      <span className="text-sm text-neutral-800 capitalize">{(product.gender as string)}</span>
                    </div>
                  )}
                  {!!brand && (
                    <div className="flex py-4">
                      <span className="w-36 text-[10px] font-body font-medium tracking-[0.2em] uppercase text-neutral-400 shrink-0">Brand</span>
                      <span className="text-sm text-neutral-800">{brand.name as string}</span>
                    </div>
                  )}
                  {!!product.careInstructions && (
                    <div className="flex py-4">
                      <span className="w-36 text-[10px] font-body font-medium tracking-[0.2em] uppercase text-neutral-400 shrink-0">Care</span>
                      <span className="text-sm text-neutral-800">{product.careInstructions as string}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="bg-luxe-ivory py-16 md:py-24">
          <div className="container-page">
            <div className="text-center mb-10">
              <h2 className="font-display text-heading-1 text-neutral-900 mb-2">Complete the Look</h2>
              <div className="w-12 h-px bg-accent-gold mx-auto" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.slice(0, 4).map((r) => (
                <ProductCard key={r.id as string} product={r} />
              ))}
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container-page">
            <FrequentlyBoughtTogether products={related.slice(0, 3)} mainProduct={product} />
          </div>
        </section>
      )}

      <section className="py-16 md:py-24">
        <div className="container-page">
          <ProductRecommendations title="You May Also Like" type="featured" currentSlug={slug} />
        </div>
      </section>

      <section className="py-16 md:py-24 bg-luxe-ivory">
        <div className="container-page max-w-4xl text-center">
          <h2 className="font-display text-heading-1 text-neutral-900 mb-6">About This Piece</h2>
          <div className="w-12 h-px bg-accent-gold mx-auto mb-8" />
          <div className="editorial-lead text-neutral-700 leading-loose">
            {product.description as string}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-page">
          <Reviews productId={product.id as string} slug={slug!} />
        </div>
      </section>

      <section className="py-16 md:py-24 bg-luxe-ivory">
        <div className="container-page">
          <RecentlyViewed />
        </div>
      </section>

      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowSizeGuide(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSizeGuide(false)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600"
              aria-label="Close size guide"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-display text-2xl text-neutral-900 mb-6">Size Guide</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 text-[10px] uppercase tracking-[0.15em] text-neutral-500 font-medium">Size</th>
                    <th className="text-left py-3 text-[10px] uppercase tracking-[0.15em] text-neutral-500 font-medium">Chest (in)</th>
                    <th className="text-left py-3 text-[10px] uppercase tracking-[0.15em] text-neutral-500 font-medium">Length (in)</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeGuideData?.measurements && sizeGuideData.measurements.length > 0 ? (
                    sizeGuideData.measurements.map((row) => (
                      <tr key={row.size} className="border-b border-neutral-50">
                        <td className="py-3 font-medium text-neutral-900">{row.size}</td>
                        <td className="py-3 text-neutral-600">{row.chest || "-"}</td>
                        <td className="py-3 text-neutral-600">{row.length || row.waist || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    [
                      { size: "XS", chest: "34-36", length: "26" },
                      { size: "S", chest: "36-38", length: "27" },
                      { size: "M", chest: "38-40", length: "28" },
                      { size: "L", chest: "40-42", length: "29" },
                      { size: "XL", chest: "42-44", length: "30" },
                      { size: "XXL", chest: "44-46", length: "31" },
                    ].map((row) => (
                      <tr key={row.size} className="border-b border-neutral-50">
                        <td className="py-3 font-medium text-neutral-900">{row.size}</td>
                        <td className="py-3 text-neutral-600">{row.chest}</td>
                        <td className="py-3 text-neutral-600">{row.length}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-neutral-400 mt-4">
              Measurements are approximate. For the best fit, we recommend checking the specific size chart for each product.
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
