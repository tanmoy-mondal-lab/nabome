import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Grid3X3, List, SlidersHorizontal, X, RefreshCw } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api/client";
import { ProductGrid } from "../components/ProductGrid";
import { QuickViewModal } from "../components/QuickViewModal";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { cn } from "../../lib/utils/cn";
import type { Product } from "../../types/product";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "best_selling", label: "Best Selling" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  subcategories?: { id: string; name: string; slug: string; categoryId: string }[];
}

function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white">
      <div className="aspect-[3/4] bg-luxe-ivory animate-pulse" />
      <div className="space-y-2 p-2.5">
        <div className="h-2 w-16 rounded-full bg-luxe-ivory animate-pulse" />
        <div className="h-3.5 w-4/5 rounded bg-luxe-ivory animate-pulse" />
        <div className="h-3.5 w-20 rounded bg-luxe-ivory animate-pulse" />
      </div>
    </div>
  );
}

export default function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: searchParams.get("minPrice") || "", max: searchParams.get("maxPrice") || "" });
  const queryClient = useQueryClient();

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    function update(e: MediaQueryListEvent | MediaQueryList) {
      setShowFilters(e.matches);
    }
    update(mql);
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  // Pull-to-refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling.current) return;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (dy > 0 && window.scrollY === 0) {
      setPullDistance(Math.min(dy * 0.5, 120));
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance > 80 && !isRefreshing) {
      setIsRefreshing(true);
      void queryClient.invalidateQueries({ queryKey: ["products"] }).then(() => {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 800);
      });
    } else {
      setPullDistance(0);
    }
    isPulling.current = false;
  }, [pullDistance, isRefreshing, queryClient]);

  const page = parseInt(searchParams.get("page") || "1");
  const sort = searchParams.get("sort") || "newest";
  const category = searchParams.get("category") || "";
  const subcategory = searchParams.get("subcategory") || "";
  const collection = searchParams.get("collection") || "";
  const gender = searchParams.get("gender") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const size = searchParams.get("size") || "";
  const color = searchParams.get("color") || "";
  const material = searchParams.get("material") || "";
  const q = searchParams.get("q") || "";
  const brand = searchParams.get("brand") || "";

  const params: Record<string, string | number | undefined> = {
    page, limit: 12, sort, category, subcategory, collection, gender,
    size, color, material, brand, q: q || undefined,
  };
  if (minPrice) params.minPrice = minPrice;
  if (maxPrice) params.maxPrice = maxPrice;

  const apiUrl = q ? "/api/products/search" : "/api/products";

  const { data: res, isLoading: loading, error: queryError } = useQuery({
    queryKey: ["products", apiUrl, params],
    queryFn: () => api.get<{ products: Product[]; pagination?: { total: number; totalPages: number }; total?: number; totalPages?: number }>(apiUrl, { params }),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const products = res?.products ?? [];
  const total = res?.pagination?.total ?? res?.total ?? 0;
  const totalPages = res?.pagination?.totalPages ?? res?.totalPages ?? 1;

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<{ categories: CategoryOption[] }>("/api/categories", { params: { action: "list" } }),
    staleTime: 1000 * 60 * 10,
  });

  const { data: collectionsData } = useQuery({
    queryKey: ["collections"],
    queryFn: () => api.get<{ collections: { id: string; name: string; slug: string }[] }>("/api/collections", { params: { action: "list" } }),
    staleTime: 1000 * 60 * 10,
  });

  const { data: brandsData } = useQuery({
    queryKey: ["brands"],
    queryFn: () => api.get<{ brands: { id: string; name: string; slug: string }[] }>("/api/brands"),
    staleTime: 1000 * 60 * 10,
  });

  const categories = categoriesData?.categories ?? [];
  const collections = collectionsData?.collections ?? [];
  const brands = brandsData?.brands ?? [];
  const commonSizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
  const commonColors = [
    { hex: "#000000", name: "Black" },
    { hex: "#FFFFFF", name: "White" },
    { hex: "#808080", name: "Grey" },
    { hex: "#8B4513", name: "Brown" },
    { hex: "#0000FF", name: "Blue" },
    { hex: "#FF0000", name: "Red" },
    { hex: "#008000", name: "Green" },
    { hex: "#FFC0CB", name: "Pink" },
    { hex: "#FFA500", name: "Orange" },
    { hex: "#800080", name: "Purple" },
    { hex: "#FFD700", name: "Gold" },
    { hex: "#C0C0C0", name: "Silver" },
    { hex: "#FFFF00", name: "Yellow" },
    { hex: "#00FFFF", name: "Teal" },
    { hex: "#000080", name: "Navy" },
  ];

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set("page", "1");
    setSearchParams(next);
  }

  function updateParams(...updates: [string, string][]) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of updates) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    next.set("page", "1");
    setSearchParams(next);
  }

  function applyPriceRange() {
    const next = new URLSearchParams(searchParams);
    if (priceRange.min) next.set("minPrice", priceRange.min);
    else next.delete("minPrice");
    if (priceRange.max) next.set("maxPrice", priceRange.max);
    else next.delete("maxPrice");
    next.set("page", "1");
    setSearchParams(next);
  }

  return (
    <>
      <Helmet>
        <title>{q ? `Search: "${q}" — নবME` : "Collections — নবME"}</title>
        <meta name="description" content={q ? `Search results for "${q}" on নবME.` : "Browse our curated collections at নবME."} />
      </Helmet>

      <div
        ref={containerRef}
        className="container-page py-8 md:py-12"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {(pullDistance > 0 || isRefreshing) && (
          <div className="flex justify-center py-2 overflow-hidden" style={{ height: isRefreshing ? 40 : pullDistance * 0.4 }}>
            <motion.div
              animate={isRefreshing ? { rotate: 360 } : { rotate: pullDistance * 3 }}
              transition={isRefreshing ? { repeat: Infinity, duration: 0.8, ease: "linear" } : { duration: 0 }}
            >
              <RefreshCw className="w-5 h-5 text-brand-500" />
            </motion.div>
          </div>
        )}
        <Breadcrumbs items={[
          { label: "Home", href: "/" },
          { label: q ? `Search: ${q}` : "Products" },
        ]} className="mb-8" />

        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-4">
          <div>
            <h1 className="text-display-1 md:text-display-2 font-display text-neutral-900">
              {q ? `Results for "${q}"` : "Collections"}
            </h1>
            <p className="text-sm text-neutral-500 mt-2">{total} {total === 1 ? "product" : "products"} found</p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex gap-2">
              <button onClick={() => setShowFilters(!showFilters)}
                className={cn("flex flex-1 md:flex-none items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium border transition-all duration-300",
                  showFilters ? "bg-neutral-900 text-white border-neutral-900 shadow-subtle" : "border-neutral-200 hover:border-neutral-400 hover:shadow-subtle"
                )}>
                <SlidersHorizontal size={15} /> Filters
                {(gender || category || subcategory || collection) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                )}
              </button>
              <select value={sort} onChange={(e) => updateParam("sort", e.target.value)}
                className="select-field flex-1 md:flex-none md:min-w-[220px] px-4 py-3 text-sm rounded-2xl border border-neutral-200">
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="hidden md:flex border border-neutral-200 rounded-2xl overflow-hidden">
              <button onClick={() => setView("grid")}
                className={cn("p-2.5 transition-colors", view === "grid" ? "bg-neutral-900 text-white" : "text-neutral-400 hover:text-neutral-600")}>
                <Grid3X3 size={16} />
              </button>
              <button onClick={() => setView("list")}
                className={cn("p-2.5 transition-colors", view === "list" ? "bg-neutral-900 text-white" : "text-neutral-400 hover:text-neutral-600")}>
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 md:mb-8 overflow-x-auto pb-1 hide-scrollbar relative after:pointer-events-none after:absolute after:right-0 after:top-0 after:bottom-0 after:w-8 after:bg-gradient-to-l after:from-white after:to-transparent">
          {gender && (
            <button onClick={() => updateParam("gender", "")}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-medium bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors whitespace-nowrap shrink-0">
              {gender} <X size={11} />
            </button>
          )}
          {category && (
            <button onClick={() => updateParams(["category", ""], ["subcategory", ""])}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-medium bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors whitespace-nowrap shrink-0">
              {category} <X size={11} />
            </button>
          )}
          {subcategory && (
            <button onClick={() => updateParam("subcategory", "")}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-medium bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors whitespace-nowrap shrink-0">
              {subcategory} <X size={11} />
            </button>
          )}
          {collection && (
            <button onClick={() => updateParam("collection", "")}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-medium bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors whitespace-nowrap shrink-0">
              {collection} <X size={11} />
            </button>
          )}
          {size && (
            <button onClick={() => updateParam("size", "")}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-medium bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors whitespace-nowrap shrink-0">
              Size: {size} <X size={11} />
            </button>
          )}
          {color && (
            <button onClick={() => updateParam("color", "")}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-medium bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors whitespace-nowrap shrink-0">
              Color: {color} <X size={11} />
            </button>
          )}
          {brand && (
            <button onClick={() => updateParam("brand", "")}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-medium bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors whitespace-nowrap shrink-0">
              Brand: {brand} <X size={11} />
            </button>
          )}
          {minPrice && (
            <button onClick={() => updateParams(["minPrice", ""], ["maxPrice", ""])}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-medium bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors whitespace-nowrap shrink-0">
              {minPrice}{maxPrice ? ` — ₹${maxPrice}` : "+"} <X size={11} />
            </button>
          )}
          {q && (
            <button onClick={() => updateParam("q", "")}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-medium bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors whitespace-nowrap shrink-0">
              "{q}" <X size={11} />
            </button>
          )}
        </div>

        <div className="flex gap-10">
          {showFilters && (
            <div className="hidden md:block w-72 shrink-0">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-medium tracking-[0.15em] uppercase text-neutral-900">Filters</h3>
                  <button onClick={() => setShowFilters(false)} className="text-neutral-400 hover:text-neutral-600">
                    <X size={14} />
                  </button>
                </div>
                {categories && categories.length > 0 && (
                  <div>
                    <label className="text-[10px] font-medium tracking-[0.15em] uppercase text-neutral-500 mb-2 block">Category</label>
                    <select value={category} onChange={(e) => updateParams(["category", e.target.value], ["subcategory", ""])}
                      className="select-field text-sm">
                      <option value="">All</option>
                      {categories.map((c: CategoryOption) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                    </select>
                  </div>
                )}
                {category && categories && (() => {
                  const selectedCat = categories.find((c: CategoryOption) => c.slug === category);
                  const subs = selectedCat?.subcategories ?? [];
                  if (subs.length === 0) return null;
                  return (
                    <div>
                      <label className="text-[10px] font-medium tracking-[0.15em] uppercase text-neutral-500 mb-2 block">Subcategory</label>
                      <select value={subcategory} onChange={(e) => updateParam("subcategory", e.target.value)}
                        className="select-field text-sm">
                        <option value="">All</option>
                        {subs.map((s: { id: string; name: string; slug: string }) => <option key={s.id} value={s.slug}>{s.name}</option>)}
                      </select>
                    </div>
                  );
                })()}
                {collections && collections.length > 0 && (
                  <div>
                    <label className="text-[10px] font-medium tracking-[0.15em] uppercase text-neutral-500 mb-2 block">Collection</label>
                    <select value={collection} onChange={(e) => updateParam("collection", e.target.value)}
                      className="select-field text-sm">
                      <option value="">All</option>
                      {collections.map((c: { id: string; name: string; slug: string }) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                    </select>
                  </div>
                )}
                {brands && brands.length > 0 && (
                  <div>
                    <label className="text-[10px] font-medium tracking-[0.15em] uppercase text-neutral-500 mb-2 block">Brand</label>
                    <select value={searchParams.get("brand") || ""} onChange={(e) => updateParam("brand", e.target.value)}
                      className="select-field text-sm">
                      <option value="">All</option>
                      {brands.map((b: { id: string; name: string; slug: string }) => <option key={b.id} value={b.slug}>{b.name}</option>)}
                    </select>
                  </div>
                )}
                {commonSizes.length > 0 && (
                  <div>
                    <label className="text-[10px] font-medium tracking-[0.15em] uppercase text-neutral-500 mb-2 block">Size</label>
                    <select value={size} onChange={(e) => updateParam("size", e.target.value)}
                      className="select-field text-sm">
                      <option value="">All</option>
                      {commonSizes.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}
                {commonColors.length > 0 && (
                  <div>
                    <label className="text-[10px] font-medium tracking-[0.15em] uppercase text-neutral-500 mb-2 block">Color</label>
                    <select value={color} onChange={(e) => updateParam("color", e.target.value)}
                      className="select-field text-sm">
                      <option value="">All</option>
                      {commonColors.map((c) => <option key={c.hex} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-medium tracking-[0.15em] uppercase text-neutral-500 mb-2 block">Price Range</label>
                  <div className="flex items-center gap-2">
                    <input type="number" placeholder="Min" value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="select-field text-sm w-full" min="0" />
                    <span className="text-neutral-300">—</span>
                    <input type="number" placeholder="Max" value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="select-field text-sm w-full" min="0" />
                  </div>
                  <button onClick={applyPriceRange}
                    className="mt-2 w-full py-1.5 text-[10px] uppercase tracking-wider bg-neutral-100 hover:bg-neutral-200 transition-colors rounded">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Filter Bottom Sheet */}
          <AnimatePresence>
            {showFilters && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
                  onClick={() => setShowFilters(false)}
                />
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  className="fixed bottom-0 left-0 right-0 z-[60] md:hidden bg-white rounded-t-3xl max-h-[85vh] flex flex-col"
                >
                  <div className="flex justify-center pt-3 pb-2">
                    <div className="w-10 h-1 rounded-full bg-neutral-300" />
                  </div>
                  <div className="flex items-center justify-between px-5 pb-4 border-b border-neutral-100">
                    <h3 className="text-sm font-semibold tracking-[0.05em] uppercase text-neutral-900">Filters</h3>
                    <button onClick={() => setShowFilters(false)} className="p-2 -mr-2 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-100 transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
                    {categories && categories.length > 0 && (
                      <div>
                        <label className="text-[10px] font-medium tracking-[0.15em] uppercase text-neutral-500 mb-2 block">Category</label>
                        <select value={category} onChange={(e) => updateParams(["category", e.target.value], ["subcategory", ""])}
                          className="select-field text-sm">
                          <option value="">All</option>
                          {categories.map((c: CategoryOption) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                        </select>
                      </div>
                    )}
                    {category && categories && (() => {
                      const selectedCat = categories.find((c: CategoryOption) => c.slug === category);
                      const subs = selectedCat?.subcategories ?? [];
                      if (subs.length === 0) return null;
                      return (
                        <div>
                          <label className="text-[10px] font-medium tracking-[0.15em] uppercase text-neutral-500 mb-2 block">Subcategory</label>
                          <select value={subcategory} onChange={(e) => updateParam("subcategory", e.target.value)}
                            className="select-field text-sm">
                            <option value="">All</option>
                            {subs.map((s: { id: string; name: string; slug: string }) => <option key={s.id} value={s.slug}>{s.name}</option>)}
                          </select>
                        </div>
                      );
                    })()}
                    {collections && collections.length > 0 && (
                      <div>
                        <label className="text-[10px] font-medium tracking-[0.15em] uppercase text-neutral-500 mb-2 block">Collection</label>
                        <select value={collection} onChange={(e) => updateParam("collection", e.target.value)}
                          className="select-field text-sm">
                          <option value="">All</option>
                          {collections.map((c: { id: string; name: string; slug: string }) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                        </select>
                      </div>
                    )}
                    {brands && brands.length > 0 && (
                      <div>
                        <label className="text-[10px] font-medium tracking-[0.15em] uppercase text-neutral-500 mb-2 block">Brand</label>
                        <select value={searchParams.get("brand") || ""} onChange={(e) => updateParam("brand", e.target.value)}
                          className="select-field text-sm">
                          <option value="">All</option>
                          {brands.map((b: { id: string; name: string; slug: string }) => <option key={b.id} value={b.slug}>{b.name}</option>)}
                        </select>
                      </div>
                    )}
                    {commonSizes.length > 0 && (
                      <div>
                        <label className="text-[10px] font-medium tracking-[0.15em] uppercase text-neutral-500 mb-2 block">Size</label>
                        <select value={size} onChange={(e) => updateParam("size", e.target.value)}
                          className="select-field text-sm">
                          <option value="">All</option>
                          {commonSizes.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    )}
                    {commonColors.length > 0 && (
                      <div>
                        <label className="text-[10px] font-medium tracking-[0.15em] uppercase text-neutral-500 mb-2 block">Color</label>
                        <select value={color} onChange={(e) => updateParam("color", e.target.value)}
                          className="select-field text-sm">
                          <option value="">All</option>
                          {commonColors.map((c) => <option key={c.hex} value={c.name}>{c.name}</option>)}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="text-[10px] font-medium tracking-[0.15em] uppercase text-neutral-500 mb-2 block">Price Range</label>
                      <div className="flex items-center gap-2">
                        <input type="number" placeholder="Min" value={priceRange.min}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                          className="select-field text-sm w-full" min="0" />
                        <span className="text-neutral-300">—</span>
                        <input type="number" placeholder="Max" value={priceRange.max}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                          className="select-field text-sm w-full" min="0" />
                      </div>
                      <button onClick={applyPriceRange}
                        className="mt-2 w-full py-1.5 text-[10px] uppercase tracking-wider bg-neutral-100 hover:bg-neutral-200 transition-colors rounded">
                        Apply
                      </button>
                    </div>
                  </div>
                  <div className="px-5 py-4 border-t border-neutral-100">
                    <button onClick={() => setShowFilters(false)}
                      className="w-full py-3 bg-neutral-900 text-white text-sm font-medium rounded-2xl hover:bg-neutral-800 transition-colors">
                      Show Results
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <div className="flex-1 min-w-0">
            {queryError ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-red-400" />
                </div>
                <p className="text-neutral-500 text-lg mb-2">Failed to load products.</p>
                <p className="text-neutral-400 text-sm mb-4">Please try again or refresh the page.</p>
                <button onClick={() => queryClient.invalidateQueries({ queryKey: ["products"] })} className="btn-primary">
                  Retry
                </button>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <ProductGrid products={products} view={view} onQuickView={(product) => setQuickViewProduct(product)} />
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
                  <SlidersHorizontal className="w-6 h-6 text-neutral-400" />
                </div>
                <p className="text-neutral-500 text-lg mb-2">No products found matching your criteria.</p>
                <p className="text-neutral-400 text-sm mb-4">Try adjusting your filters or search terms.</p>
                <button onClick={() => setSearchParams({})} className="btn-primary">
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
        </div>
      </div>

      {quickViewProduct && (
        <QuickViewModal isOpen product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </>
  );
}
