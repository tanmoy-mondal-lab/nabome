import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Grid3X3, List, SlidersHorizontal, X, ChevronDown } from "lucide-react";
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
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string | number | undefined> = {
      action: q ? "search" : "list",
      page, limit: 12, sort, category, collection, gender,
      size, color, material, q: q || undefined,
    };
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;

    const endpoint = q ? "/api/products" : "/api/products";

    api.get(endpoint, { params }).then((res) => {
      const data = res as { products: Record<string, unknown>[]; total: number; totalPages: number };
      setProducts(data.products ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [page, sort, category, collection, gender, minPrice, maxPrice, size, color, material, q]);

  useEffect(() => {
    api.get("/api/categories", { params: { action: "list" } }).then((res) => {
      const cats = (res as Record<string, unknown>).categories as { id: string; name: string; slug: string }[] ?? [];
      setAggregations((prev) => ({ ...prev, categories: cats }));
    }).catch(() => {});
    api.get("/api/collections", { params: { action: "list" } }).then((res) => {
      const cols = (res as Record<string, unknown>).collections as { id: string; name: string; slug: string }[] ?? [];
      setAggregations((prev) => ({ ...prev, collections: cols }));
    }).catch(() => {});
  }, []);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.set("page", "1");
    setSearchParams(next);
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams());
  }

  const hasFilters = !!category || !!collection || !!gender || !!minPrice || !!size || !!color || !!material || !!q;

  const activeFilters: { label: string; key: string; value: string }[] = [];
  if (category) activeFilters.push({ label: aggregations.categories?.find((c) => c.slug === category)?.name || category, key: "category", value: category });
  if (collection) activeFilters.push({ label: aggregations.collections?.find((c) => c.slug === collection)?.name || collection, key: "collection", value: collection });
  if (gender) activeFilters.push({ label: gender.charAt(0).toUpperCase() + gender.slice(1), key: "gender", value: gender });
  if (size) activeFilters.push({ label: `Size: ${size}`, key: "size", value: size });
  if (color) activeFilters.push({ label: `Color: ${color}`, key: "color", value: color });
  if (minPrice || maxPrice) activeFilters.push({ label: `Price: ₹${minPrice || "0"} - ₹${maxPrice || "∞"}`, key: "minPrice", value: minPrice });

  const pageTitle = q
    ? `Search: "${q}" — নবME`
    : `${gender ? `${gender.charAt(0).toUpperCase() + gender.slice(1)}'s ` : ""}${category ? aggregations.categories?.find((c) => c.slug === category)?.name || category : "Products"} — নবME`;

  const pageDesc = q
    ? `Search results for "${q}" on নবME`
    : `Browse ${gender || ""} ${category ? aggregations.categories?.find((c) => c.slug === category)?.name || category : "all products"} — premium fashion curated for you.`;

  return (
    <div className="container-page py-8">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={canonical(window.location.pathname + window.location.search)} />
        {!q && <meta name="robots" content="index, follow" />}
        {q && <meta name="robots" content="noindex, follow" />}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical(window.location.pathname + window.location.search)} />
        <meta property="og:site_name" content="নবME" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
      </Helmet>
      <Breadcrumbs items={q ? [{ label: `Search: "${q}"` }] : [{ label: category ? aggregations.categories?.find((c) => c.slug === category)?.name || category : "Products" }]} className="mb-6" />

      <div className="flex items-start justify-between mb-6">
        <div>
          {q ? (
            <h1 className="text-2xl md:text-3xl font-display text-neutral-900">Search: "{q}"</h1>
          ) : (
            <h1 className="text-2xl md:text-3xl font-display text-neutral-900">
              {gender ? `${gender.charAt(0).toUpperCase() + gender.slice(1)}'s ` : ""}
              {category ? aggregations.categories?.find((c) => c.slug === category)?.name || "Category" : "All Products"}
            </h1>
          )}
          <p className="text-sm text-neutral-500 mt-1">{total} {total === 1 ? "product" : "products"}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowFilters(!showFilters)} className={cn("flex items-center gap-2 px-4 py-2 text-sm border rounded lg:hidden", showFilters ? "border-neutral-900" : "border-neutral-200")}>
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
          <div className="hidden lg:flex items-center gap-2 border border-neutral-200 rounded p-1">
            <button onClick={() => setView("grid")} className={cn("p-1.5 rounded", view === "grid" ? "bg-neutral-900 text-white" : "text-neutral-400 hover:text-neutral-600")}><Grid3X3 className="w-4 h-4" /></button>
            <button onClick={() => setView("list")} className={cn("p-1.5 rounded", view === "list" ? "bg-neutral-900 text-white" : "text-neutral-400 hover:text-neutral-600")}><List className="w-4 h-4" /></button>
          </div>
          <select value={sort} onChange={(e) => updateParam("sort", e.target.value)} className="px-3 py-2 text-sm border border-neutral-200 rounded bg-white">
            {SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      </div>

      {hasFilters && activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {activeFilters.map((f) => (
            <span key={f.key} className="flex items-center gap-1.5 bg-neutral-100 text-xs px-3 py-1.5 rounded-full">
              {f.label}
              <button onClick={() => updateParam(f.key, "")}><X className="w-3 h-3" /></button>
            </span>
          ))}
          <button onClick={clearFilters} className="text-xs text-neutral-500 hover:text-neutral-900 underline">Clear all</button>
        </div>
      )}

      <div className="flex gap-8">
        <aside className={cn("w-64 shrink-0 space-y-6", showFilters ? "block" : "hidden lg:block")}>
          <div>
            <h4 className="text-xs uppercase tracking-widest text-neutral-900 font-medium mb-3">Category</h4>
            <div className="space-y-2">
              {(aggregations.categories ?? []).map((cat) => (
                <button key={cat.id} onClick={() => updateParam("category", cat.slug === category ? "" : cat.slug)}
                  className={cn("block text-sm w-full text-left py-1 transition-colors", cat.slug === category ? "text-brand-600 font-medium" : "text-neutral-600 hover:text-neutral-900")}>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest text-neutral-900 font-medium mb-3">Gender</h4>
            <div className="space-y-2">
              {["men", "women", "unisex"].map((g) => (
                <button key={g} onClick={() => updateParam("gender", g === gender ? "" : g)}
                  className={cn("block text-sm w-full text-left py-1 capitalize transition-colors", g === gender ? "text-brand-600 font-medium" : "text-neutral-600 hover:text-neutral-900")}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest text-neutral-900 font-medium mb-3">Price Range</h4>
            <div className="flex gap-2 items-center">
              <input type="number" placeholder="Min" value={minPrice} onChange={(e) => updateParam("minPrice", e.target.value)} className="w-full px-3 py-2 text-sm border rounded" />
              <span className="text-neutral-400">-</span>
              <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => updateParam("maxPrice", e.target.value)} className="w-full px-3 py-2 text-sm border rounded" />
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest text-neutral-900 font-medium mb-3">Size</h4>
            <div className="flex flex-wrap gap-2">
              {["XS", "S", "M", "L", "XL", "XXL", "3XL"].map((s) => (
                <button key={s} onClick={() => updateParam("size", s === size ? "" : s)}
                  className={cn("px-3 py-1.5 text-xs border transition-all", s === size ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 text-neutral-600 hover:border-neutral-900")}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <AnimatePresence>
          {showFilters && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowFilters(false)}
                className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              />
              <motion.aside
                initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed left-0 top-0 h-full w-72 z-50 bg-white shadow-2xl overflow-y-auto p-6 space-y-6 lg:hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm uppercase tracking-widest font-medium text-neutral-900">Filters</h3>
                  <button onClick={() => setShowFilters(false)} className="w-8 h-8 flex items-center justify-center">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-neutral-900 font-medium mb-3">Category</h4>
                  <div className="space-y-2">
                    {(aggregations.categories ?? []).map((cat) => (
                      <button key={cat.id} onClick={() => { updateParam("category", cat.slug === category ? "" : cat.slug); setShowFilters(false); }}
                        className={cn("block text-sm w-full text-left py-1 transition-colors", cat.slug === category ? "text-brand-600 font-medium" : "text-neutral-600 hover:text-neutral-900")}>
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-neutral-900 font-medium mb-3">Gender</h4>
                  <div className="space-y-2">
                    {["men", "women", "unisex"].map((g) => (
                      <button key={g} onClick={() => { updateParam("gender", g === gender ? "" : g); setShowFilters(false); }}
                        className={cn("block text-sm w-full text-left py-1 capitalize transition-colors", g === gender ? "text-brand-600 font-medium" : "text-neutral-600 hover:text-neutral-900")}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-neutral-900 font-medium mb-3">Price Range</h4>
                  <div className="flex gap-2 items-center">
                    <input type="number" placeholder="Min" value={minPrice} onChange={(e) => updateParam("minPrice", e.target.value)} className="w-full px-3 py-2 text-sm border rounded" />
                    <span className="text-neutral-400">-</span>
                    <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => updateParam("maxPrice", e.target.value)} className="w-full px-3 py-2 text-sm border rounded" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-neutral-900 font-medium mb-3">Size</h4>
                  <div className="flex flex-wrap gap-2">
                    {["XS", "S", "M", "L", "XL", "XXL", "3XL"].map((s) => (
                      <button key={s} onClick={() => { updateParam("size", s === size ? "" : s); setShowFilters(false); }}
                        className={cn("px-3 py-1.5 text-xs border transition-all", s === size ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 text-neutral-600 hover:border-neutral-900")}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => { clearFilters(); setShowFilters(false); }} className="w-full py-2.5 text-sm border border-neutral-900 text-neutral-900 uppercase tracking-wider hover:bg-neutral-900 hover:text-white transition-all">
                  Clear All Filters
                </button>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <div className="flex-1 min-w-0">
          <ProductGrid
            products={products}
            isLoading={loading}
            view={view}
            columns={3}
            onQuickView={(product) => setQuickViewProduct(product)}
          />

          <QuickViewModal
            isOpen={!!quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
            product={quickViewProduct}
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => updateParam("page", String(i + 1))}
                  className={cn("w-10 h-10 text-sm border", page === i + 1 ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 text-neutral-600 hover:border-neutral-900")}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
