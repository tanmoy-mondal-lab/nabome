import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, Grid3X3, List } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import AdvancedProductCard from "../components/AdvancedProductCard";
import FilterSidebar from "../components/FilterSidebar";
import { useAnalytics } from "../context/AnalyticsContext";
import { generateSearchMetadata } from "../lib/seo";
import { generateAdvancedProducts, filterProducts, sortOptions } from "../lib/mockProductData";
import type { ProductFilterState } from "../types/product";

const defaultFilters: ProductFilterState = {
  category: [],
  subcategory: [],
  priceRange: [0, 99999],
  brands: [],
  vendors: [],
  rating: null,
  sizes: [],
  colors: [],
  gender: [],
  material: [],
  availability: "all",
  discount: null,
  sort: "newest",
  search: "",
};

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const { trackSearch } = useAnalytics();

  const [products] = useState(() => generateAdvancedProducts(48));
  const [filters, setFilters] = useState<ProductFilterState>({ ...defaultFilters, search: q });
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    setFilters((f) => ({ ...f, search: q }));
  }, [q]);

  useEffect(() => {
    if (q) trackSearch(q, filtered.length);
  }, [q]);

  const categories = useMemo(() => [...new Set(products.map((p) => p.category))], [products]);
  const subcategories = useMemo(() => [...new Set(products.map((p) => p.subcategory))], [products]);
  const brands = useMemo(() => [...new Set(products.map((p) => p.brand))], [products]);
  const vendors = useMemo(() => [...new Set(products.map((p) => p.vendorShop))], [products]);

  const filtered = useMemo(() => filterProducts(products, filters), [products, filters]);

  const updateFilter = (patch: Partial<ProductFilterState>) => {
    setFilters((f) => ({ ...f, ...patch }));
  };

  const resetFilters = () => {
    setFilters({ ...defaultFilters, search: q });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category.length) count += filters.category.length;
    if (filters.subcategory.length) count += filters.subcategory.length;
    if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 99999) count += 1;
    if (filters.brands.length) count += filters.brands.length;
    if (filters.rating) count += 1;
    if (filters.sizes.length) count += filters.sizes.length;
    if (filters.colors.length) count += filters.colors.length;
    if (filters.gender.length) count += filters.gender.length;
    if (filters.availability !== "all") count += 1;
    if (filters.discount) count += 1;
    return count;
  }, [filters]);

  return (
    <>
      <SEO {...generateSearchMetadata(q || "all products")} />
      <Navbar />
      <main className="page">
        <div className="container" style={{ paddingTop: 40 }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
            <div>
              <p className="eyebrow" style={{ margin: 0 }}>
                {q ? `Search results for "${q}"` : "All Products"}
              </p>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 300, marginTop: 2 }}>
                {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
              </h1>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={() => setFilterOpen(!filterOpen)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "10px 16px",
                  border: "1px solid var(--line)", background: filterOpen ? "var(--gold-soft)" : "transparent",
                  color: filterOpen ? "var(--gold)" : "var(--muted)", cursor: "pointer",
                  borderRadius: "var(--radius)", fontSize: ".82rem", position: "relative",
                }}>
                <SlidersHorizontal size={16} /> Filters
                {activeFilterCount > 0 && (
                  <span style={{
                    position: "absolute", top: -6, right: -6,
                    width: 20, height: 20, borderRadius: "50%",
                    background: "var(--gold)", color: "#050505",
                    fontSize: ".65rem", fontWeight: 700,
                    display: "grid", placeItems: "center",
                  }}>
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <div style={{ display: "flex", border: "1px solid var(--line)", borderRadius: "var(--radius)", overflow: "hidden" }}>
                <button onClick={() => setViewMode("grid")}
                  style={{ padding: "10px 14px", border: "none", background: viewMode === "grid" ? "var(--surface-strong)" : "transparent", color: viewMode === "grid" ? "var(--gold)" : "var(--muted)", cursor: "pointer" }}>
                  <Grid3X3 size={16} />
                </button>
                <button onClick={() => setViewMode("list")}
                  style={{ padding: "10px 14px", border: "none", background: viewMode === "list" ? "var(--surface-strong)" : "transparent", color: viewMode === "list" ? "var(--gold)" : "var(--muted)", cursor: "pointer" }}>
                  <List size={16} />
                </button>
              </div>
              <select
                value={filters.sort}
                onChange={(e) => updateFilter({ sort: e.target.value as ProductFilterState["sort"] })}
                style={{
                  padding: "10px 14px", border: "1px solid var(--line)", background: "var(--surface)",
                  color: "var(--text)", borderRadius: "var(--radius)", fontSize: ".82rem",
                  cursor: "pointer", outline: "none", appearance: "none",
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                  backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
                  paddingRight: 36, minWidth: 160,
                }}
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: 24, position: "relative" }}>
            {/* Sidebar Filters */}
            <AnimatePresence>
              {filterOpen && (
                <motion.aside
                  initial={{ opacity: 0, x: -20, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: 280 }}
                  exit={{ opacity: 0, x: -20, width: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    flexShrink: 0, overflow: "hidden",
                    position: "sticky", top: 100, alignSelf: "flex-start", maxHeight: "calc(100vh - 120px)",
                  }}
                >
                  <div style={{ width: 280, paddingRight: 8, overflow: "auto", maxHeight: "calc(100vh - 120px)" }}>
                    <FilterSidebar
                      filters={filters}
                      onChange={updateFilter}
                      onReset={resetFilters}
                      categories={categories}
                      subcategories={subcategories}
                      brands={brands}
                      vendors={vendors}
                    />
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>

            {/* Products Grid */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {filtered.length === 0 ? (
                <div className="glass" style={{ padding: 60, textAlign: "center", borderRadius: "var(--radius-xl)" }}>
                  <Search size={40} style={{ opacity: 0.2, marginBottom: 16 }} />
                  <h2 style={{ fontSize: "1.2rem", fontWeight: 400, marginBottom: 8 }}>No products found</h2>
                  <p style={{ color: "var(--muted)", marginBottom: 20 }}>Try adjusting your filters or search terms.</p>
                  <button onClick={resetFilters} className="premium-button" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px" }}>
                    <X size={16} /> Clear Filters
                  </button>
                </div>
              ) : viewMode === "grid" ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
                  {filtered.map((product, i) => (
                    <AdvancedProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {filtered.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="glass"
                      style={{ display: "flex", gap: 16, padding: 16, borderRadius: "var(--radius-xl)", alignItems: "center" }}
                    >
                      <div style={{ width: 100, height: 130, borderRadius: "var(--radius-lg)", overflow: "hidden", flexShrink: 0, background: "var(--surface-strong)" }}>
                        <img src={product.images[0]?.url || ""} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: "var(--muted)", fontSize: ".72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{product.category}</p>
                        <h3 style={{ fontWeight: 600, fontSize: "1rem", marginTop: 2 }}>{product.name}</h3>
                        <p style={{ color: "var(--muted)", fontSize: ".82rem", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.shortDescription}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                          <span style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--gold)" }}>₹{product.defaultPrice.toLocaleString("en-IN")}</span>
                          {product.defaultOriginalPrice > product.defaultPrice && (
                            <span style={{ color: "var(--muted)", fontSize: ".82rem", textDecoration: "line-through" }}>₹{product.defaultOriginalPrice.toLocaleString("en-IN")}</span>
                          )}
                          <span style={{ fontSize: ".78rem", color: "var(--muted)" }}>★ {product.rating} ({product.reviewCount})</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <AdvancedProductCard product={product} index={i} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
