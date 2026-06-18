import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Shield, Truck, RotateCcw } from "lucide-react";
import { api } from "../../lib/api/client";
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
import { addRecentlyViewed } from "../lib/recommendations";
import { cn } from "../../lib/utils/cn";
import { canonical, productSchema, breadcrumbSchema } from "../../lib/seo";
import { img } from "../../lib/seo";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Record<string, unknown> | null>(null);
  const [related, setRelated] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "features" | "specs">("description");
  const addItem = useCartStore((s) => s.addItem);
  const { add: addToWishlist, remove: removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.get("/api/products", { params: { action: "detail", slug } })
      .then((res) => {
        const p = (res as Record<string, unknown>).product as Record<string, unknown>;
        setProduct(p);
        addRecentlyViewed(slug);
        const relatedTo = (p.relatedTo as { target: Record<string, unknown> }[]) ?? [];
        const relatedFrom = (p.relatedFrom as { source: Record<string, unknown> }[]) ?? [];
        setRelated([...relatedTo.map((r) => r.target), ...relatedFrom.map((r) => r.source)]);
      }).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="container-page section-padding">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-[3/4] bg-luxe-ivory animate-pulse" />
          <div className="space-y-4">
            <div className="h-4 bg-luxe-ivory animate-pulse rounded w-1/4" />
            <div className="h-8 bg-luxe-ivory animate-pulse rounded w-3/4" />
            <div className="h-6 bg-luxe-ivory animate-pulse rounded w-1/3" />
            <div className="h-24 bg-luxe-ivory animate-pulse rounded" />
          </div>
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

  const images = (product.images as { url: string; altText?: string }[]) ?? [];
  const variants = (product.variants as Record<string, unknown>[]) ?? [];
  const sizes = [...new Set(variants.map((v) => v.size as string).filter(Boolean))];
  const colors = [...new Map(variants.filter((v) => v.colorHex).map((v) => [v.colorHex as string, { hex: v.colorHex as string, name: v.color as string }])).values()];
  const brand = product.brand as Record<string, unknown>;
  const category = product.category as Record<string, unknown>;
  const labels = (product.productLabels as { label: Record<string, unknown> }[]) ?? [];
  const price = Number(product.basePrice ?? 0);
  const compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;

  const filteredVariants = variants.filter((v) => !selectedColor || v.colorHex === selectedColor);
  const sizeStock: Record<string, number> = {};
  filteredVariants.forEach((v) => { sizeStock[v.size as string] = (v.stock as number) ?? 0; });

  const matchedVariant = variants.find((v) => v.size === selectedSize && v.colorHex === selectedColor)
    ?? variants.find((v) => v.size === selectedSize)
    ?? variants.find((v) => v.colorHex === selectedColor)
    ?? variants[0];

  const variantPrice = price + (Number(matchedVariant?.priceAdjustment ?? 0));

  function handleAddToCart() {
    if (!matchedVariant || !product) return;
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

  return (
    <div className="container-page section-padding">
      <Helmet>
        <title>{product.name as string} — নবME</title>
        <meta name="description" content={(product.description as string)?.slice(0, 160)} />
        <link rel="canonical" href={canonical(`/products/${slug}`)} />
        <meta name="robots" content="index, follow" />

        <meta property="og:title" content={`${product.name as string} — নবME`} />
        <meta property="og:description" content={(product.description as string)?.slice(0, 200)} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={canonical(`/products/${slug}`)} />
        <meta property="og:site_name" content="নবME" />
        <meta property="og:locale" content="en_IN" />
        {(product.images as { url: string }[])?.[0] && (
          <meta property="og:image" content={img((product.images as { url: string }[])[0].url, { width: 1200, height: 630 })} />
        )}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@nabome" />
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
      <Breadcrumbs items={[
        ...(category ? [{ label: category.name as string, href: `/products?category=${(category.slug as string) || ""}` }] : []),
        { label: product.name as string },
      ]} className="mb-6" />

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <ImageGallery images={images} />

        <div className="space-y-6">
          {brand && <Link to={`/products?brand=${brand.slug}`} className="text-xs uppercase tracking-wider font-body text-brand-500 hover:underline">{brand.name as string}</Link>}

          <div>
            <div className="flex items-start justify-between">
              <div>
                {labels.length > 0 && (
                  <div className="flex gap-2 mb-2">
                    {labels.map((l, i) => (
                      <span key={i} className="label-badge text-[10px] uppercase tracking-wider px-2 py-0.5" style={{ backgroundColor: (l.label as Record<string, unknown>).color as string || "#c9a84c", color: "#fff" }}>
                        {(l.label as Record<string, unknown>).name as string}
                      </span>
                    ))}
                  </div>
                )}
                <h1 className="font-display text-display-2 md:text-display-1 text-neutral-900 text-balance">{product.name as string}</h1>
              </div>
              <button
                onClick={() => matchedVariant && (isInWishlist(matchedVariant.id as string) ? removeFromWishlist(matchedVariant.id as string) : addToWishlist(matchedVariant.id as string))}
                className={cn("p-2 shrink-0 transition-all duration-300", isInWishlist(matchedVariant?.id as string) ? "text-red-500" : "text-neutral-400 hover:text-red-400")}
              >
                <Heart className="w-5 h-5" fill={isInWishlist(matchedVariant?.id as string) ? "currentColor" : "none"} />
              </button>
            </div>
            <PriceDisplay price={variantPrice} compareAtPrice={compareAtPrice} size="lg" className="mt-3" />
          </div>

          <p className="editorial-lead text-neutral-600">{product.shortDescription as string || product.description as string}</p>

          {!!matchedVariant?.sku && (
            <p className="text-xs text-neutral-400 font-mono">SKU: {String(matchedVariant.sku)}</p>
          )}

          {matchedVariant && (matchedVariant.stock as number) > 0 && (matchedVariant.stock as number) <= 5 && (
            <p className="text-xs text-amber-600 font-medium">Only {(matchedVariant.stock as number)} left in stock</p>
          )}
          {matchedVariant && (matchedVariant.stock as number) === 0 && (
            <p className="text-xs text-red-500 font-medium">Out of stock</p>
          )}

          {colors.length > 0 && (
            <ColorSelector colors={colors} selected={selectedColor} onChange={setSelectedColor} />
          )}

          {sizes.length > 0 && (
            <SizeSelector sizes={sizes} selected={selectedSize} onChange={setSelectedSize} stock={sizeStock} />
          )}

          <div className="flex items-center gap-4">
            <QuantitySelector value={quantity} onChange={setQuantity} max={(matchedVariant?.stock as number) || 99} />
            <button
              onClick={handleAddToCart}
              disabled={!matchedVariant || (matchedVariant.stock as number) === 0}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-4 h-4" /> Add to Cart
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-200 divider">
            {[
              { icon: Truck, label: "Free Shipping", desc: "On orders above ₹999" },
              { icon: RotateCcw, label: "Easy Returns", desc: "30-day return policy" },
              { icon: Shield, label: "Secure", desc: "Protected checkout" },
            ].map((item) => (
              <div key={item.label} className="text-center trust-badge">
                <item.icon className="w-4 h-4 mx-auto text-brand-500 mb-1" />
                <p className="text-[10px] font-medium text-neutral-700">{item.label}</p>
                <p className="text-[9px] text-neutral-400">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="divider pt-6">
            <div className="flex gap-8 border-b border-neutral-200">
              {(["description", "features", "specs"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={cn("pb-3 text-xs font-body uppercase tracking-widest -mb-px border-b-2 transition-all duration-300", activeTab === tab ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400 hover:text-neutral-600")}>
                  {tab === "description" ? "Description" : tab === "features" ? "Features" : "Specifications"}
                </button>
              ))}
            </div>
            <div className="py-6 text-sm text-neutral-600 leading-relaxed editorial-lead">
              {activeTab === "description" && (product.description as string || "No description available.")}
              {activeTab === "features" && <ul className="list-disc list-inside space-y-1">{(product.features as string[] || [])?.map((f, i) => <li key={i}>{f}</li>)}</ul>}
              {activeTab === "specs" && (
                <div className="space-y-1">
                  {!!product.material && <div className="flex py-2.5 border-b border-neutral-100 last:border-0"><span className="w-28 text-neutral-500 font-body text-xs uppercase tracking-wider">Material</span><span className="text-neutral-800">{product.material as string}</span></div>}
                  {!!product.gender && <div className="flex py-2.5 border-b border-neutral-100 last:border-0"><span className="w-28 text-neutral-500 font-body text-xs uppercase tracking-wider">Gender</span><span className="capitalize text-neutral-800">{(product.gender as string)}</span></div>}
                  {!!brand && <div className="flex py-2.5 border-b border-neutral-100 last:border-0"><span className="w-28 text-neutral-500 font-body text-xs uppercase tracking-wider">Brand</span><span className="text-neutral-800">{brand.name as string}</span></div>}
                  {!!product.careInstructions && <div className="flex py-2.5 border-b border-neutral-100 last:border-0"><span className="w-28 text-neutral-500 font-body text-xs uppercase tracking-wider">Care</span><span className="text-neutral-800">{product.careInstructions as string}</span></div>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section-padding">
          <h2 className="font-display text-display-2 text-neutral-900 mb-6">Complete the Look</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.slice(0, 4).map((r) => (
              <ProductCard key={r.id as string} product={r} />
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="section-padding-sm">
          <FrequentlyBoughtTogether products={related.slice(0, 3)} mainProduct={product} />
        </section>
      )}

      <section className="section-padding">
        <ProductRecommendations title="You May Also Like" type="featured" currentSlug={slug} />
      </section>

      {!!product.description && (
        <section className="section-padding bg-luxe-ivory premium-card">
          <h2 className="font-display text-display-2 text-neutral-900 mb-4">About This Piece</h2>
          <div className="editorial-lead text-neutral-600">
            {product.description as string}
          </div>
        </section>
      )}

      <section className="section-padding">
        <Reviews productId={product.id as string} slug={slug!} />
      </section>

      <section className="section-padding">
        <RecentlyViewed />
      </section>
    </div>
  );
}
