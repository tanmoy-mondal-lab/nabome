import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Grid3X3, List, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api/client";
import { ProductGrid } from "../components/ProductGrid";
import { QuickViewModal } from "../components/QuickViewModal";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { PriceDisplay } from "../components/PriceDisplay";
import { cn } from "../../lib/utils/cn";
import { canonical } from "../../lib/seo";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "best_selling", label: "Best Selling" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

interface Aggregation {
  sizes?: string[];
  colors?: { hex: string; name: string }[];
  materials?: string[];
  brands?: { id: string; name: string }[];
  categories?: { id: string; name: string; slug: string }[];
  collections?: { id: string; name: string; slug: string }[];
  minPrice?: number;
  maxPrice?: number;
}

export default function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Record<string, unknown> | null>(null);
  const [aggregations, setAggregations] = useState<Aggregation>({});

  const page = parseInt(searchParams.get("page") || "1");
  const sort = searchParams.get("sort") || "newest";
  const category = searchParams.get("category") || "";
  const collection = searchParams.get("collection") || "";
  const gender = searchParams.get("gender") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const size = searchParams.get("size") || "";
  const color = searchParams.get("color") || "";
  const material = searchParams.get("material") || "";
  const q = searchParams.get("q") || "";

  const params: Record<string, string | number | undefined> = {
    action: q ? "search" : "list",
    page, limit: 12, sort, category, collection, gender,
    size, color, material, q: q || undefined,
  };
  if (minPrice) params.minPrice = minPrice;
  if (maxPrice) params.maxPrice = maxPrice;

  const { data: res, isLoading: loading } = useQuery({
    queryKey: ["products", params],
    queryFn: () => api.get<{ products: Record<string, unknown>[]; total: number; totalPages: number }>("/api/products", { params }),
    staleTime: 1000 * 60 * 5,
  });

  const products = res?.products ?? [];
  const total = res?.total ?? 0;
  const totalPages = res?.totalPages ?? 1;

  useEffect(() => {
    Promise.all([
      api.get<{ categories: { id: string; name: string; slug: string }[] }>("/api/categories", { params: { action: "list" } }).catch(() => null),
      api.get<{ collections: { id: string; name: string; slug: string }[] }>("/api/collections", { params: { action: "list" } }).catch(() => null),
    ]).then(([catRes, colRes]) => {
      setAggregations((prev) => ({
        ...prev,
        categories: (catRes as Record<string, unknown>)?.categories as { id: string; name: string; slug: string }[] ?? [],
        collections: (colRes as Record<string, unknown>)?.collections as { id: string; name: string; slug: string }[] ?? [],
      }));
    }).catch(() => {});
  }, []);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set("page", "1");
    setSearchParams(next);
  }

  return (
    <>
      <Helmet>
        <title>{q ? `Search: "${q}" — নবME` : "All Products — নবME"}</title>
        <meta name="description" content={q ? `Search results for "${q}" on নবME.` : "Browse all products on নবME."} />
        <link rel="canonical" href={canonical("/products")} />
      </Helmet>

      <div className="container-page py-8">
        <Breadcrumbs items={[
          { label: "Home", href: "/" },
          { label: q ? `Search: ${q}` : "Products" },
        ]} className="mb-6" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display text-neutral-900">
              {q ? `Results for "${q}"` : "All Products"}
            </h1>
            <p className="text-sm text-neutral-500 mt-1">{total} {total === 1 ? "product" : "products"} found</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowFilters(!showFilters)}
              className={cn("flex items-center gap-2 px-4 py-2 rounded text-sm border transition-colors",
                showFilters ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-200 hover:border-neutral-300"
              )}>
              <SlidersHorizontal size={16} /> Filters
            </button>
            <div className="flex border border-neutral-200 rounded overflow-hidden">
              <button onClick={() => setView("grid")}
                className={cn("p-2", view === "grid" ? "bg-neutral-900 text-white" : "text-neutral-400")}>
                <Grid3X3 size={16} />
              </button>
              <button onClick={() => setView("list")}
                className={cn("p-2", view === "list" ? "bg-neutral-900 text-white" : "text-neutral-400")}>
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          <select value={sort} onChange={(e) => updateParam("sort", e.target.value)}
            className="px-3 py-2 text-sm border border-neutral-200 rounded">
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {gender && (
            <button onClick={() => updateParam("gender", "")}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-neutral-100 rounded-full hover:bg-neutral-200">
              {gender} <X size={12} />
            </button>
          )}
          {category && (
            <button onClick={() => updateParam("category", "")}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-neutral-100 rounded-full hover:bg-neutral-200">
              {category} <X size={12} />
            </button>
          )}
        </div>

        {showFilters && (
          <div className="bg-white border border-neutral-200 rounded p-4 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {aggregations.categories && aggregations.categories.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-neutral-500 mb-2 block">Category</label>
                  <select value={category} onChange={(e) => updateParam("category", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded">
                    <option value="">All</option>
                    {aggregations.categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                  </select>
                </div>
              )}
              {aggregations.collections && aggregations.collections.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-neutral-500 mb-2 block">Collection</label>
                  <select value={collection} onChange={(e) => updateParam("collection", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded">
                    <option value="">All</option>
                    {aggregations.collections.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-[3/4] bg-neutral-100 animate-pulse rounded" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="text-center py-20">
            <p className="text-neutral-500 text-lg">No products found matching your criteria.</p>
            <button onClick={() => setSearchParams({})} className="text-brand-500 hover:underline text-sm mt-2">
              Clear all filters
            </button>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => { const next = new URLSearchParams(searchParams); next.set("page", String(p)); setSearchParams(next); }}
                className={cn("w-10 h-10 rounded text-sm transition-colors",
                  p === page ? "bg-neutral-900 text-white" : "border border-neutral-200 hover:border-neutral-300"
                )}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {quickViewProduct && (
        <QuickViewModal isOpen={true} product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </>
  );
}
