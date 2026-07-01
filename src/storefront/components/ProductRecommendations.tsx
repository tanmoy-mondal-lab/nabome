import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../../lib/api/client";
import { ProductCard } from "./ProductCard";

interface ProductRecommendationsProps {
  title?: string;
  type: "featured" | "newArrivals" | "similar";
  currentSlug?: string;
  categoryId?: string;
  productId?: string;
}

export function ProductRecommendations({ title, type, currentSlug }: ProductRecommendationsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["recommendations", type, currentSlug],
    queryFn: async () => {
      if (type === "featured") return api.get<{ products: Record<string, unknown>[] }>("/api/products/featured");
      if (type === "newArrivals") return api.get<{ products: Record<string, unknown>[] }>("/api/products/new");
      if (type === "similar" && currentSlug) return api.get<{ products: Record<string, unknown>[] }>(`/api/products/${currentSlug}/similar`);
      return { products: [] };
    },
    staleTime: 1000 * 60 * 5,
  });

  const products = (data?.products ?? []).filter((p) => p.slug !== currentSlug);

  if (!products.length && !isLoading) return null;

  return (
    <section className="space-y-6">
      {title && <h2 className="text-xl md:text-2xl font-display text-neutral-900">{title}</h2>}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[3/4] bg-neutral-100 animate-pulse rounded" />
              <div className="h-3 bg-neutral-100 animate-pulse rounded w-1/3" />
              <div className="h-4 bg-neutral-100 animate-pulse rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id as string} product={product} />
          ))}
        </div>
      )}
      <div className="text-center">
        <Link to="/products" className="text-sm uppercase tracking-widest text-neutral-900 border-b-2 border-neutral-900 pb-1 hover:text-brand-500 hover:border-brand-500 transition-colors">
          View All
        </Link>
      </div>
    </section>
  );
}
