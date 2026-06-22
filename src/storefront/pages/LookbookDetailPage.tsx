import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../../lib/api/client";
import { ProductCard } from "../components/ProductCard";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { PriceDisplay } from "../components/PriceDisplay";
import { ShoppingBag } from "lucide-react";
import { SafeImage } from "../../components/SafeImage";
import { useCartStore } from "../stores/cart-store";
import { useAuthStore } from "../../stores/auth-store";

export default function LookbookDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [lookbook, setLookbook] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!slug) return;
    api.get("/api/lookbooks", { params: { action: "detail", slug } })
      .then((res) => setLookbook((res as Record<string, unknown>).lookbook as Record<string, unknown>))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="container-page py-8"><div className="aspect-[2/1] bg-neutral-100 animate-pulse rounded" /></div>;
  }

  if (!lookbook) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-xl font-display text-neutral-900 mb-4">Lookbook not found</h1>
        <Link to="/lookbooks" className="text-brand-600 hover:underline">Browse all lookbooks</Link>
      </div>
    );
  }

  const items = (lookbook.items as Record<string, unknown>[]) ?? [];
  const story = lookbook.story as string;

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[
        { label: "Lookbooks", href: "/lookbooks" },
        { label: lookbook.title as string },
      ]} className="mb-6" />

      <div className="max-w-3xl mx-auto text-center mb-12">
        <p className="text-accent-gold text-xs tracking-[0.2em] uppercase mb-3">
          {lookbook.season as string}{lookbook.year ? ` ${lookbook.year}` : ""}
        </p>
        <h1 className="text-3xl md:text-5xl font-display text-neutral-900">{lookbook.title as string}</h1>
        {story && <p className="text-neutral-600 text-base mt-4 leading-relaxed max-w-xl mx-auto">{story}</p>}
      </div>

      <div className="space-y-16">
        {items.map((item, i) => {
          const type = item.type as string;
          const products = (item.products as Record<string, unknown>[]) ?? [];

          if (type === "image" || type === "video") {
            return (
              <motion.div key={item.id as string} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}>
                {type === "video" ? (
                  <video src={item.videoUrl as string} controls autoPlay muted loop className="w-full rounded" />
                ) : (
                  <SafeImage src={item.imageUrl as string} alt={item.caption as string || ""} className="w-full rounded" />
                )}
                {!!item.caption && <p className="text-sm text-neutral-500 mt-3 text-center italic">{item.caption as string}</p>}
              </motion.div>
            );
          }

          if (type === "shop_the_look" && products.length > 0) {
            const image = item.imageUrl as string;
            return (
              <div key={item.id as string}>
                {image && <SafeImage src={image} alt="" className="w-full rounded mb-6" />}
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
