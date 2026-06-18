import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, X, ArrowLeft } from "lucide-react";
import { api } from "../../lib/api/client";
import { ProductCard } from "../components/ProductCard";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { useAuthStore } from "../../stores/auth-store";
import { useCartStore } from "../stores/cart-store";
import { img } from "../../lib/seo";

export default function WishlistPage() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (!isAuthenticated) { setItems([]); setLoading(false); return; }
    api.get("/api/wishlist", { params: { action: "list" } })
      .then((res) => setItems((res as Record<string, unknown>).items as Record<string, unknown>[] ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  async function handleRemove(variantId: string) {
    await api.delete("/api/wishlist", { params: { variantId } });
    setItems((prev) => prev.filter((i) => (i.variantId as string) !== variantId));
  }

  if (!isAuthenticated) {
    return (
      <div className="container-page py-20 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
          <Heart className="w-7 h-7 text-neutral-400" />
        </div>
        <h1 className="text-xl font-display text-neutral-900 mb-3">Login to View Your Wishlist</h1>
        <p className="text-sm text-neutral-500 mb-6">Save your favorite items and come back to them anytime.</p>
        <Link to="/auth/login" className="bg-neutral-900 text-white px-8 py-3 text-sm uppercase tracking-widest hover:bg-neutral-800">
          Sign In
        </Link>
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
          <Heart className="w-7 h-7 text-neutral-400" />
        </div>
        <h1 className="text-xl font-display text-neutral-900 mb-3">Your Wishlist is Empty</h1>
        <p className="text-sm text-neutral-500 mb-6">Start saving your favorite pieces.</p>
        <Link to="/products" className="inline-flex items-center gap-2 bg-neutral-900 text-white px-8 py-3 text-sm uppercase tracking-widest hover:bg-neutral-800">
          <ArrowLeft className="w-4 h-4" /> Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: "My Wishlist" }]} className="mb-6" />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-display text-neutral-900">My Wishlist</h1>
          <p className="text-sm text-neutral-500 mt-1">{items.length} {items.length === 1 ? "item" : "items"}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {items.map((wishlistItem) => {
          const product = wishlistItem.product as Record<string, unknown> ?? {};
          const variant = wishlistItem.variant as Record<string, unknown> ?? {};
          const images = (product.images as { url: string }[]) ?? [];
          const variants = (product.variants as Record<string, unknown>[]) ?? [];
          const colorHexes = [...new Set(variants.map((v) => v.colorHex as string).filter(Boolean))];
          return (
            <motion.div key={wishlistItem.id as string} layout className="group relative premium-card premium-card-lift overflow-hidden">
              <Link to={`/products/${product.slug}`} className="block aspect-[3/4] bg-neutral-50 overflow-hidden">
                <img src={img(images[0]?.url, { width: 400 })} alt={product.name as string} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-luxe-out" />
                {images[1]?.url && (
                  <img src={img(images[1].url, { width: 400 })} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-luxe-out" />
                )}
              </Link>
              <button onClick={() => handleRemove(wishlistItem.variantId as string)} className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-sm">
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="px-3 pt-3 pb-4">
                <Link to={`/products/${product.slug}`} className="text-sm font-medium text-neutral-900 hover:text-brand-500 transition-colors truncate block">{product.name as string}</Link>
                <p className="text-sm text-brand-600 mt-1 font-medium">₹{Number(product.basePrice ?? 0).toLocaleString("en-IN")}</p>
                {colorHexes.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {colorHexes.slice(0, 4).map((hex, i) => (
                      <span key={i} className="w-2.5 h-2.5 rounded-full ring-1 ring-white shadow-sm" style={{ backgroundColor: hex }} />
                    ))}
                    {colorHexes.length > 4 && <span className="text-2xs text-neutral-400 ml-0.5">+{colorHexes.length - 4}</span>}
                  </div>
                )}
                <button onClick={() => {
                  const v = variant as Record<string, unknown>;
                  addItem({
                    productId: product.id as string,
                    variantId: v.id as string,
                    name: product.name as string,
                    slug: product.slug as string,
                    sku: v.sku as string || "",
                    size: v.size as string || "One Size",
                    color: v.color as string || "",
                    colorHex: v.colorHex as string || "",
                    image: images[0]?.url || "",
                    price: Number(product.basePrice ?? 0) + Number((v.priceAdjustment as number) ?? 0),
                    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
                    quantity: 1,
                    maxQuantity: (v.stock as number) || 99,
                  });
                }} className="w-full mt-3 flex items-center justify-center gap-1.5 bg-neutral-900 text-white py-2.5 text-[10px] uppercase tracking-wider hover:bg-neutral-800 transition-all duration-300">
                  <ShoppingBag className="w-3 h-3" /> Add to Cart
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
