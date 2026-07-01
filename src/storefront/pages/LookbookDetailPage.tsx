import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "../../lib/api/client";
import { ProductCard } from "../components/ProductCard";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { ShoppingBag } from "lucide-react";
import { SafeImage } from "../../components/SafeImage";
import { useCartStore } from "../stores/cart-store";
import { useAuthStore } from "../../stores/auth-store";
import { Helmet } from "react-helmet-async";
import { canonical } from "../../lib/seo";

export default function LookbookDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data: res, isLoading: loading, isError } = useQuery({
    queryKey: ["lookbook", slug],
    queryFn: () => api.get<{ lookbook: Record<string, unknown> }>(`/api/lookbooks/${slug}`),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
    retry: false,
  });

  const lookbook = res?.lookbook as Record<string, unknown> | undefined;

  if (loading) {
    return <div className="container-page py-8"><Helmet><title>Loading Lookbook — নবME</title><meta name="robots" content="noindex, nofollow" /></Helmet><div className="aspect-[2/1] bg-neutral-100 animate-pulse rounded" /></div>;
  }

  if (isError && !lookbook) {
    return (
      <div className="container-page py-20 text-center">
        <Helmet><title>Lookbook Not Found — নবME</title><meta name="robots" content="noindex, nofollow" /></Helmet>
        <p className="text-sm text-neutral-500 mb-3">Failed to load lookbook.</p>
        <button onClick={() => window.location.reload()} className="text-xs text-brand-500 hover:underline uppercase tracking-widest">Retry</button>
      </div>
    );
  }

  if (!lookbook) {
    return (
      <div className="container-page py-20 text-center">
        <Helmet><title>Lookbook Not Found — নবME</title><meta name="robots" content="noindex, nofollow" /></Helmet>
        <h1 className="text-xl font-display text-neutral-900 mb-4">Lookbook not found</h1>
        <Link to="/lookbooks" className="text-brand-600 hover:underline">Browse all lookbooks</Link>
      </div>
    );
  }

  const items = (lookbook.items as Record<string, unknown>[]) ?? [];
  const storyValue = lookbook.story;
  const story = typeof storyValue === "string"
    ? storyValue
    : (storyValue as { narrative?: string } | null)?.narrative;
  const lookbookName = (lookbook.name as string | undefined) ?? "Lookbook";

  return (
    <div className="container-page py-8">
      <Helmet>
        <title>{lookbookName} — নবME</title>
        <meta name="description" content={story ? (story as string).slice(0, 160) : `View the ${lookbookName} lookbook on নবME.`} />
        <link rel="canonical" href={canonical(`/lookbooks/${slug}`)} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={`${lookbookName} — নবME`} />
        <meta property="og:description" content={story ? (story as string).slice(0, 200) : `View the ${lookbookName} lookbook on নবME.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical(`/lookbooks/${slug}`)} />
      </Helmet>
      <Breadcrumbs items={[
        { label: "Lookbooks", href: "/lookbooks" },
        { label: lookbookName },
      ]} className="mb-6" />

      <div className="max-w-3xl mx-auto text-center mb-12">
        <p className="text-accent-gold text-xs tracking-[0.2em] uppercase mb-3">
          {lookbook.season as string}{lookbook.year ? ` ${lookbook.year}` : ""}
        </p>
        <h1 className="text-3xl md:text-5xl font-display text-neutral-900">{lookbookName}</h1>
        {story && <p className="text-neutral-600 text-base mt-4 leading-relaxed max-w-xl mx-auto">{story}</p>}
      </div>

      <div className="space-y-16">
        {items.map((item, i) => {
          const type = (item.type as string | undefined) ?? "image";
          const product = item.product as Record<string, unknown> | null | undefined;
          const products = product ? [product] : ((item.products as Record<string, unknown>[] | undefined) ?? []);
          const imageUrl = (item.imageUrl as string | undefined) ?? (item.mediaUrl as string | undefined);
          const caption = (item.caption as string | undefined) ?? (item.title as string | undefined) ?? "";

          if (type === "image" || type === "video") {
            return (
              <motion.div key={item.id as string} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}>
                {type === "video" ? (
                  <video src={item.videoUrl as string} controls autoPlay muted loop className="w-full rounded" />
                ) : (
                  <SafeImage src={imageUrl || "/placeholder.svg"} alt={caption || "Lookbook image"} className="w-full rounded" />
                )}
                {!!caption && <p className="text-sm text-neutral-500 mt-3 text-center italic">{caption}</p>}
                {products.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-6">
                    {products.map((p) => (
                      <ProductCard key={p.id as string} product={p} />
                    ))}
                  </div>
                )}
              </motion.div>
            );
          }

          if (type === "shop_the_look" && products.length > 0) {
            const image = imageUrl;
            return (
              <div key={item.id as string}>
                {image && <SafeImage src={image} alt={`Lookbook image: ${item.title as string || "Shop the look"}`} className="w-full rounded mb-6" />}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {products.map((p) => (
                    <ProductCard key={p.id as string} product={p} />
                  ))}
                </div>
                <div className="text-center mt-6">
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        navigate("/auth/login", { state: { from: window.location.pathname } });
                        return;
                      }
                      products.forEach((p) => {
                        const images = (p.images as { url: string }[]) ?? [];
                        const variants = (p.variants as Record<string, unknown>[]) ?? [];
                        const v = variants[0];
                        if (!v) return;
                        addItem({
                          productId: p.id as string,
                          variantId: v.id as string,
                          name: p.name as string,
                          slug: p.slug as string,
                          sku: v.sku as string || "",
                          size: v.size as string || "One Size",
                          color: v.color as string || "",
                          colorHex: v.colorHex as string || "",
                          image: images[0]?.url || "",
                          price: Number(p.basePrice ?? 0) + Number((v.priceAdjustment as number) ?? 0),
                          compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
                          quantity: 1,
                          maxQuantity: (v.stock as number) || 99,
                        });
                      });
                    }}
                    className="inline-flex items-center gap-2 bg-neutral-900 text-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-neutral-800"
                  >
                    <ShoppingBag className="w-4 h-4" /> Add All to Cart
                  </button>
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
