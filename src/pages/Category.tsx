import { useMemo, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import QuickViewModal from "../components/QuickViewModal";
import SEO from "../components/SEO";
import { useToast } from "../components/Toast";
import { useCart } from "../context/CartContext";
import { products, type Product } from "../data/products";
import { generateCategoryMetadata } from "../lib/seo";
import { breadcrumbSchema, collectionSchema } from "../lib/structured-data";
import { useAnalytics } from "../context/AnalyticsContext";

const categories = ["All", "Men", "Women", "Unisex", "Accessories"];
const sortOptions = ["Featured", "Price Low", "Price High", "Newest", "Best Rated"];
const priceRange = { min: 700, max: 2600, step: 100 };

const materials = [...new Set(products.map((p) => p.material).filter(Boolean))] as string[];

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const chipStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 14px",
  borderRadius: 20,
  border: "1px solid var(--gold)",
  background: "var(--gold-soft)",
  color: "var(--gold)",
  fontSize: ".82rem",
  fontWeight: 500,
  cursor: "pointer",
};

const activeFilterRow: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginBottom: 24,
};

export default function Category() {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { trackCategoryView } = useAnalytics();
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const initialSearch = params.get("search") || "";
  const initialCategory = params.get("category") || "All";
  const initialSort = params.get("sort") || "Featured";
  const initialPrice = Number(params.get("maxPrice")) || priceRange.max;
  const initialMaterial = params.get("material") || "";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [rawSearch, setRawSearch] = useState(initialSearch);
  const search = useDebounce(rawSearch, 300);
  const [sort, setSort] = useState(initialSort);
  const [maxPrice, setMaxPrice] = useState(initialPrice);
  const [selectedMaterial, setSelectedMaterial] = useState(initialMaterial);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const initialised = useRef(false);

  useEffect(() => {
    if (!initialised.current) { initialised.current = true; return; }
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (selectedCategory !== "All") p.set("category", selectedCategory);
    if (sort !== "Featured") p.set("sort", sort);
    if (maxPrice !== priceRange.max) p.set("maxPrice", String(maxPrice));
    if (selectedMaterial) p.set("material", selectedMaterial);
    const qs = p.toString();
    navigate(qs ? `/category?${qs}` : "/category", { replace: true });
  }, [search, selectedCategory, sort, maxPrice, selectedMaterial, navigate]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const searchText = `${product.name} ${product.category} ${product.tags.join(" ")} ${product.description} ${product.material} ${product.fit}`.toLowerCase();
        const matchesSearch = searchText.includes(search.toLowerCase());
        const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
        const matchesBadge = true; // kept for future use
        const matchesMaterial = !selectedMaterial || product.material.toLowerCase().includes(selectedMaterial.toLowerCase());
        return matchesSearch && matchesCategory && matchesBadge && matchesMaterial && product.price <= maxPrice;
      })
      .sort((a, b) => {
        if (sort === "Price Low") return a.price - b.price;
        if (sort === "Price High") return b.price - a.price;
        if (sort === "Newest") return Number(Boolean(b.isNew)) - Number(Boolean(a.isNew));
        if (sort === "Best Rated") return b.rating - a.rating;
        return Number(Boolean(b.isBestSeller)) - Number(Boolean(a.isBestSeller));
      });
  }, [maxPrice, search, selectedCategory, selectedMaterial, sort]);

  const quickAdd = (product: Product) => {
    addToCart({ ...product, selectedSize: product.sizes[0], selectedColor: product.colors[0] });
    showToast(`${product.name} added to bag`);
  };

  useEffect(() => {
    trackCategoryView(selectedCategory);
  }, [selectedCategory]);

  const hasActiveFilters = selectedCategory !== "All" || search !== "" || maxPrice !== priceRange.max || selectedMaterial !== "";

  const clearFilters = () => {
    setSelectedCategory("All");
    setRawSearch("");
    setMaxPrice(priceRange.max);
    setSelectedMaterial("");
    navigate("/category", { replace: true });
  };

  const removeFilter = (type: string) => {
    if (type === "category") setSelectedCategory("All");
    if (type === "search") { setRawSearch(""); }
    if (type === "price") setMaxPrice(priceRange.max);
    if (type === "material") setSelectedMaterial("");
  };

  return (
    <>
      <SEO
        {...generateCategoryMetadata(selectedCategory === "All" ? "All" : selectedCategory, `Browse ${selectedCategory.toLowerCase()} collection on নবME. Premium Bengali streetwear.`, selectedCategory.toLowerCase())}
        structuredData={{
          ...collectionSchema({
            name: `${selectedCategory === "All" ? "All" : selectedCategory} Collection`,
            description: `Browse our ${selectedCategory.toLowerCase()} collection. Premium Bengali streetwear and fashion.`,
            products: filteredProducts.slice(0, 20).map((p) => ({ name: p.name, url: `/product/${p.id}` })),
          }),
          ...breadcrumbSchema([
            { label: "Home", href: "/" },
            { label: selectedCategory === "All" ? "Shop All" : selectedCategory },
          ]),
        }}
      />
      <Navbar />
      <main className="page">
        <section className="section">
          <div className="container split-intro">
            <div>
              <p className="eyebrow">Collection</p>
              <h1 className="display">Shop all</h1>
            </div>
            <p className="lede">
              Search, filter and sort premium নবME pieces by category, price, material and rating.
            </p>
          </div>

          <div className="container glass catalogue-controls">
            <input className="field" type="search" placeholder="Search products, tags, category" value={rawSearch} onChange={(event) => setRawSearch(event.target.value)} />
            <select className="field" value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products">
              {sortOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <label className="range-control">
              <span>Max ₹{maxPrice}</span>
              <input type="range" min={priceRange.min} max={priceRange.max} step={priceRange.step} value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} />
            </label>
          </div>

          <div className="container filter-row">
            {categories.map((category) => (
              <button className={selectedCategory === category ? "premium-button" : "ghost-button"} key={category} onClick={() => setSelectedCategory(category)}>
                {category}
              </button>
            ))}
            <span>{filteredProducts.length} products</span>
          </div>

          {/* Material filter chips */}
          <div className="container" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {materials.map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMaterial(selectedMaterial === m ? "" : m)}
                  style={{
                    ...chipStyle,
                    borderColor: selectedMaterial === m ? "var(--gold)" : "var(--line)",
                    background: selectedMaterial === m ? "var(--gold-soft)" : "transparent",
                    color: selectedMaterial === m ? "var(--gold)" : "var(--muted)",
                  }}
                >
                  {m}{selectedMaterial === m ? " ✕" : ""}
                </button>
              ))}
            </div>
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="container" style={activeFilterRow}>
              {search && (
                <span style={chipStyle} onClick={() => removeFilter("search")}>
                  Search: "{search}" ✕
                </span>
              )}
              {selectedCategory !== "All" && (
                <span style={chipStyle} onClick={() => removeFilter("category")}>
                  {selectedCategory} ✕
                </span>
              )}
              {maxPrice < priceRange.max && (
                <span style={chipStyle} onClick={() => removeFilter("price")}>
                  Under ₹{maxPrice} ✕
                </span>
              )}
              {selectedMaterial && (
                <span style={chipStyle} onClick={() => removeFilter("material")}>
                  {selectedMaterial} ✕
                </span>
              )}
              <button
                onClick={clearFilters}
                style={{ ...chipStyle, borderColor: "var(--line)", color: "var(--muted)", background: "transparent" }}
              >
                Clear All
              </button>
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="container glass empty-state">
              <h2>No pieces found</h2>
              <p className="lede">Try a wider price range, different material, or a different search term.</p>
              {hasActiveFilters && (
                <button className="ghost-button" onClick={clearFilters} style={{ marginTop: 16 }}>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="container product-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onQuickView={setQuickView} onQuickAdd={quickAdd} />
              ))}
            </div>
          )}
        </section>
      </main>
      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} onAdd={quickAdd} />
    </>
  );
}
