import { useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Grid3X3, List, SlidersHorizontal, X, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api/client";
import { SafeImage } from "../../components/SafeImage";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { ProductGrid } from "../components/ProductGrid";
import { formatPrice } from "../../lib/utils/format";
import { cn } from "../../lib/utils/cn";
import { canonical, img } from "../../lib/seo";
import type { Product } from "../../types/product";

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  categoryId: string;
  _count?: { products: number };
}

interface CategoryDetail {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parent?: { id: string; name: string; slug: string } | null;
  children?: { id: string; name: string; slug: string }[];
  subcategories: Subcategory[];
  _count: { products: number };
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "best_selling", label: "Best Selling" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

type ProductRecord = Record<string, unknown>;

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}
function asRecord(v: unknown): ProductRecord | undefined {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as ProductRecord) : undefined;
}
function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function SubcategoryCard({ sub, index, categorySlug }: { sub: Subcategory; index: number; categorySlug: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Link
        to={`/products?category=${categorySlug}&subcategory=${sub.slug}`}
        className="group relative block aspect-[3/4] bg-neutral-100 overflow-hidden rounded-sm"
      >
        {sub.imageUrl ? (
          <SafeImage
            src={sub.imageUrl}
            alt={sub.name}
            responsive
            premium
            className="w-full h-full object-cover transition-all duration-700 ease-luxe-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
            <span className="text-4xl font-display text-neutral-300 group-hover:text-neutral-400 transition-colors duration-500">
              {sub.name.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-500 ease-luxe-out">
          <h3 className="text-sm md:text-[13px] font-medium text-white tracking-wide drop-shadow-lg uppercase">
            {sub.name}
          </h3>
          {sub._count?.products != null && sub._count.products > 0 && (
            <p className="text-[10px] text-white/60 mt-1 tracking-wider">
              {sub._count.products} {sub._count.products === 1 ? "piece" : "pieces"}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

function MobileProductCard({ product, index }: { product: ProductRecord; index: number }) {
  const name = asString(product.name) || "Product";
  const slug = asString(product.slug);
  const basePrice = Number(product.basePrice ?? 0);
  const salePrice = product.salePrice != null ? Number(product.salePrice) : null;
  const price = salePrice && salePrice > 0 ? salePrice : basePrice;
  const compareAtPrice = product.compareAtPrice != null ? Number(product.compareAtPrice) : null;
  const images = asArray<{ url: string }>(product.images);
  const primaryImage = images[0]?.url || "/placeholder.svg";
  const gender = asString(product.gender);
  const brandName = asString(asRecord(product.brand)?.name);
  const categoryName = asString(asRecord(product.category)?.name);
  const labels = asArray<{ label?: ProductRecord }>(product.productLabels);
  const labelName = asString(asRecord(labels[0]?.label)?.name);
  const promoBadge =
    compareAtPrice && compareAtPrice > price
      ? `${Math.round((1 - price / compareAtPrice) * 100)}% OFF`
      : product.isNew
        ? "New"
        : "";
  const eyebrow =
    [brandName, gender].filter(Boolean).join(" · ") ||
    labelName ||
    [categoryName].filter(Boolean).join(" · ");

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.16) }}
      className="md:hidden"
    >
      <Link to={`/products/${slug}`} className="group block overflow-hidden rounded-2xl bg-white">
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-luxe-ivory via-white to-neutral-50">
          <SafeImage
            src={primaryImage}
            alt={name}
            responsive
            premium
            priority={index < 4}
            className="h-full w-full object-cover transition-transform duration-700 ease-luxe-out group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent" />
          {promoBadge && (
            <span className="absolute top-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-semibold tracking-[0.15em] text-neutral-700 shadow-subtle">
              {promoBadge}
            </span>
          )}
        </div>
        <div className="p-2.5 space-y-1.5">
          {eyebrow && (
            <p className="text-[9px] tracking-[0.12em] text-neutral-400 line-clamp-1 uppercase">
              {eyebrow}
            </p>
          )}
          <h2 className="text-[13px] font-medium leading-4 tracking-[-0.01em] text-neutral-900 line-clamp-1">
            {name}
          </h2>
          <div className="flex items-baseline gap-x-1.5">
            <span className="text-[13px] font-medium text-neutral-900">{formatPrice(price)}</span>
            {compareAtPrice && compareAtPrice > price && (
              <span className="text-[10px] text-neutral-400 line-through">{formatPrice(compareAtPrice)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const page = parseInt(searchParams.get("page") || "1");
  const sort = searchParams.get("sort") || "newest";
  const subcategory = searchParams.get("subcategory") || "";
  const gender = searchParams.get("gender") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const size = searchParams.get("size") || "";
  const color = searchParams.get("color") || "";

  const { data: categoryRes, isLoading: catLoading, error: catError } = useQuery({
    queryKey: ["category", slug],
    queryFn: () => api.get<{ category: CategoryDetail }>(`/api/categories/${slug}`),
    staleTime: 1000 * 60 * 10,
    retry: false,
  });

  const category = categoryRes?.category;

  const productParams: Record<string, string | number | undefined> = {
    page,
    limit: 12,
    sort,
    category: slug,
    subcategory: subcategory || undefined,
    gender: gender || undefined,
    size: size || undefined,
    color: color || undefined,
  };
  if (minPrice) productParams.minPrice = minPrice;
  if (maxPrice) productParams.maxPrice = maxPrice;

  const { data: prodRes, isLoading: prodLoading, error: prodError } = useQuery({
    queryKey: ["products", "category", slug, productParams],
    queryFn: () =>
      api.get<{ products: Product[]; pagination?: { total: number; totalPages: number }; total?: number; totalPages?: number }>(
        "/api/products",
        { params: productParams }
      ),
    staleTime: 1000 * 60 * 5,
    retry: false,
    enabled: !!slug,
  });

  const products = prodRes?.products ?? [];
  const total = prodRes?.pagination?.total ?? prodRes?.total ?? 0;
  const totalPages = prodRes?.pagination?.totalPages ?? prodRes?.totalPages ?? 1;

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set("page", "1");
    setSearchParams(next);
  }

  const heroImage = category?.imageUrl;

  if (catError) {
    return (
      <div className="container-page py-20 text-center">
        <Helmet>
          <title>Category Not Found — নবME</title>
        </Helmet>
        <div className="w-16 h-16 mx-auto mb-6 bg-neutral-100 rounded-full flex items-center justify-center">
          <RefreshCw className="w-6 h-6 text-neutral-400" />
        </div>
        <p className="text-neutral-500 text-lg mb-2">Category not found.</p>
        <p className="text-neutral-400 text-sm mb-6">The category you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white text-xs uppercase tracking-[0.15em] hover:bg-neutral-800 transition-colors">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{category ? `${category.name} — নবME` : "Loading — নবME"}</title>
        <meta
          name="description"
          content={category?.description || `Explore our curated ${category?.name || ""} collection at নবME. Premium fashion for the discerning.`}
        />
        <link rel="canonical" href={canonical(`/categories/${slug}`)} />
        <meta property="og:title" content={`${category?.name || "Category"} — নবME`} />
        <meta property="og:description" content={category?.description || `Browse ${category?.name || ""} at নবME`} />
        <meta property="og:url" content={canonical(`/categories/${slug}`)} />
        {heroImage && <meta property="og:image" content={img(heroImage, { width: 1200 })} />}
      </Helmet>

      {/* ═══════════════════════════════════════════
          HERO SECTION — Full-bleed luxury banner
      ═══════════════════════════════════════════ */}
      <section className="relative w-full h-[55vh] md:h-[70vh] min-h-[300px] md:min-h-[560px] overflow-hidden bg-luxe-charcoal">
        {catLoading ? (
          <div className="absolute inset-0 bg-neutral-200 animate-pulse" />
        ) : heroImage ? (
          <motion.div
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute inset-0"
          >
            <SafeImage
              src={heroImage}
              alt={category?.name || "Category"}
              priority
              responsive
              premium
              className="w-full h-full object-cover"
            />
          </motion.div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-luxe-charcoal via-neutral-800 to-neutral-900" />
        )}

        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 lg:p-20">
          <div className="container-wide">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: category?.name || "Category" },
                ]}
                className="mb-6 !text-white/50 [&_a]:!text-white/50 [&_span]:!text-white/70"
              />
              <h1 className="font-display text-display-3 md:text-display-1 text-white mb-3 md:mb-4">
                {catLoading ? (
                  <span className="inline-block w-48 h-12 bg-white/10 animate-pulse rounded" />
                ) : (
                  category?.name
                )}
              </h1>
              {category?.description && (
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="text-sm md:text-base text-white/60 max-w-xl font-light leading-relaxed tracking-wide"
                >
                  {category.description}
                </motion.p>
              )}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="mt-4 md:mt-6"
              >
                <span className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-white/40">
                  {total > 0 ? `${total} ${total === 1 ? "piece" : "pieces"}` : ""}
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Subtle bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
      </section>

      {/* ═══════════════════════════════════════════
          SUBCATEGORY GRID — Curated editorial cards
      ═══════════════════════════════════════════ */}
      {category?.subcategories && category.subcategories.length > 0 && (
        <section className="container-wide py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 md:mb-14"
          >
            <p className="text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-accent-gold mb-3">
              Shop by
            </p>
            <h2 className="text-heading-2 md:text-heading-1 font-display text-neutral-900">
              {category.name}
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {category.subcategories.map((sub, i) => (
              <SubcategoryCard key={sub.id} sub={sub} index={i} categorySlug={category.slug} />
            ))}
          </div>
        </section>
      )}

      {/* Subtle divider */}
      {category?.subcategories && category.subcategories.length > 0 && (
        <div className="container-wide">
          <div className="h-px bg-neutral-100" />
        </div>
      )}

      {/* ═══════════════════════════════════════════
          PRODUCT GRID — With filters and sorting
      ═══════════════════════════════════════════ */}
      <section className="container-wide py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 md:mb-12 gap-4">
          <div>
            <p className="text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-neutral-400 mb-2">
              Explore
            </p>
            <h2 className="text-heading-3 md:text-heading-2 font-display text-neutral-900">
              All {category?.name || "Products"}
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              {total} {total === 1 ? "product" : "products"}
            </p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex flex-1 md:flex-none items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2",
                  showFilters
                    ? "bg-neutral-900 text-white border-neutral-900 shadow-subtle"
                    : "border-neutral-200 hover:border-neutral-400 hover:shadow-subtle"
                )}
                aria-label={showFilters ? "Close filters" : "Open filters"}
              >
                <SlidersHorizontal size={15} /> Filters
                {(subcategory || gender) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                )}
              </button>
              <select
                value={sort}
                onChange={(e) => updateParam("sort", e.target.value)}
                className="select-field flex-1 md:flex-none md:min-w-[200px] px-4 py-3 text-sm rounded-2xl border border-neutral-200"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="hidden md:flex border border-neutral-200 rounded-2xl overflow-hidden">
              <button
                onClick={() => setView("grid")}
                className={cn("p-2.5 transition-colors", view === "grid" ? "bg-neutral-900 text-white" : "text-neutral-400 hover:text-neutral-600")}
                aria-label="Grid view"
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setView("list")}
                className={cn("p-2.5 transition-colors", view === "list" ? "bg-neutral-900 text-white" : "text-neutral-400 hover:text-neutral-600")}
                aria-label="List view"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        <div className="flex gap-2 mb-6 md:mb-8 overflow-x-auto pb-1 hide-scrollbar">
          {gender && (
            <button
              onClick={() => updateParam("gender", "")}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-medium bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors whitespace-nowrap shrink-0"
              aria-label={`Remove gender filter: ${gender}`}
            >
              {gender} <X size={11} />
            </button>
          )}
          {subcategory && (
            <button
              onClick={() => updateParam("subcategory", "")}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-medium bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors whitespace-nowrap shrink-0"
              aria-label={`Remove subcategory filter: ${subcategory}`}
            >
              {subcategory} <X size={11} />
            </button>
          )}
        </div>

        <div className="flex gap-10">
          {/* Desktop sidebar filters */}
          {showFilters && (
            <div className="hidden md:block w-64 shrink-0">
              <div className="space-y-8 sticky top-28">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-medium tracking-[0.15em] uppercase text-neutral-900">Filters</h3>
                  <button onClick={() => setShowFilters(false)} className="text-neutral-400 hover:text-neutral-600" aria-label="Close filters">
                    <X size={14} />
                  </button>
                </div>
                {category?.subcategories && category.subcategories.length > 0 && (
                  <div>
                    <label className="text-[10px] font-medium tracking-[0.15em] uppercase text-neutral-500 mb-2 block">
                      Subcategory
                    </label>
                    <select
                      value={subcategory}
                      onChange={(e) => updateParam("subcategory", e.target.value)}
                      className="select-field text-sm"
                    >
                      <option value="">All</option>
                      {category.subcategories.map((s) => (
                        <option key={s.id} value={s.slug}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-medium tracking-[0.15em] uppercase text-neutral-500 mb-2 block">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => updateParam("gender", e.target.value)}
                    className="select-field text-sm"
                  >
                    <option value="">All</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Mobile filter bottom sheet */}
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
                  onKeyDown={(e) => { if (e.key === 'Escape') setShowFilters(false); }}
                  tabIndex={-1}
                />
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white rounded-t-3xl max-h-[85vh] flex flex-col"
                >
                  <div className="flex justify-center pt-3 pb-2">
                    <div className="w-10 h-1 rounded-full bg-neutral-300" />
                  </div>
                  <div className="flex items-center justify-between px-5 pb-4 border-b border-neutral-100">
                    <h3 className="text-sm font-semibold tracking-[0.05em] uppercase text-neutral-900">Filters</h3>
                    <button onClick={() => setShowFilters(false)} className="p-2 -mr-2 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-100 transition-colors" aria-label="Close filters">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
                    {category?.subcategories && category.subcategories.length > 0 && (
                      <div>
                        <label className="text-[10px] font-medium tracking-[0.15em] uppercase text-neutral-500 mb-2 block">Subcategory</label>
                        <select
                          value={subcategory}
                          onChange={(e) => updateParam("subcategory", e.target.value)}
                          className="select-field text-sm"
                        >
                          <option value="">All</option>
                          {category.subcategories.map((s) => (
                            <option key={s.id} value={s.slug}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="text-[10px] font-medium tracking-[0.15em] uppercase text-neutral-500 mb-2 block">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => updateParam("gender", e.target.value)}
                        className="select-field text-sm"
                      >
                        <option value="">All</option>
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                        <option value="Unisex">Unisex</option>
                      </select>
                    </div>
                  </div>
                  <div className="px-5 py-4 border-t border-neutral-100">
                    <button
                      onClick={() => setShowFilters(false)}
                      className="btn-primary w-full rounded-2xl"
                    >
                      Show Results
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {prodError ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-red-400" />
                </div>
                <p className="text-neutral-500 text-lg mb-2">Failed to load products.</p>
                <p className="text-neutral-400 text-sm mb-4">Please try again.</p>
                <button onClick={() => { if (typeof window !== 'undefined') window.location.reload(); }} className="btn-primary">
                  Retry
                </button>
              </div>
            ) : prodLoading ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="aspect-[3/4] bg-neutral-100 animate-pulse rounded" />
                    <div className="space-y-2">
                      <div className="h-3 bg-neutral-100 animate-pulse rounded w-1/3" />
                      <div className="h-4 bg-neutral-100 animate-pulse rounded w-2/3" />
                      <div className="h-4 bg-neutral-100 animate-pulse rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-3 md:hidden">
                  {products.map((product, index) => (
                    <MobileProductCard key={(product as Product).id} product={product as unknown as ProductRecord} index={index} />
                  ))}
                </div>
                <div className="hidden md:block">
                  <ProductGrid products={products} view={view} />
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
                  <SlidersHorizontal className="w-6 h-6 text-neutral-400" />
                </div>
                <p className="text-neutral-500 text-lg mb-2">No products found.</p>
                <p className="text-neutral-400 text-sm mb-4">Try adjusting your filters.</p>
                <button
                  onClick={() => setSearchParams({})}
                  className="btn-primary"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      const next = new URLSearchParams(searchParams);
                      next.set("page", String(p));
                      setSearchParams(next);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={cn(
                      "w-10 h-10 rounded text-sm transition-colors",
                      p === page ? "bg-neutral-900 text-white" : "border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
