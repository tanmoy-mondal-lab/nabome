import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import QuickViewModal from "../components/QuickViewModal";
import SEO from "../components/SEO";
import { useToast } from "../components/Toast";
import { useCart } from "../context/CartContext";
import { products, type Product } from "../data/products";

const categories = ["All", "Men", "Women", "Unisex", "Accessories"];
const sortOptions = ["Featured", "Price Low", "Price High", "Newest", "Best Rated"];

export default function Category() {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialSearch = params.get("search") || "";
  const badge = params.get("badge") || "";

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState("Featured");
  const [maxPrice, setMaxPrice] = useState(2600);
  const [quickView, setQuickView] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const searchText = `${product.name} ${product.category} ${product.tags.join(" ")}`.toLowerCase();
        const matchesSearch = searchText.includes(search.toLowerCase());
        const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
        const matchesBadge = badge === "new" ? product.isNew : true;
        return matchesSearch && matchesCategory && matchesBadge && product.price <= maxPrice;
      })
      .sort((a, b) => {
        if (sort === "Price Low") return a.price - b.price;
        if (sort === "Price High") return b.price - a.price;
        if (sort === "Newest") return Number(Boolean(b.isNew)) - Number(Boolean(a.isNew));
        if (sort === "Best Rated") return b.rating - a.rating;
        return Number(Boolean(b.isBestSeller)) - Number(Boolean(a.isBestSeller));
      });
  }, [badge, maxPrice, search, selectedCategory, sort]);

  const quickAdd = (product: Product) => {
    addToCart({ ...product, selectedSize: product.sizes[0], selectedColor: product.colors[0] });
    showToast(`${product.name} added to bag`);
  };

  return (
    <>
      <SEO title="Shop NABOME | Premium Bengali Streetwear" description="Browse NABOME oversized tees, hoodies, accessories and limited Bengali streetwear drops." path="/category" />
      <Navbar />
      <main className="page">
        <section className="section">
          <div className="container split-intro">
            <div>
              <p className="eyebrow">Collection</p>
              <h1 className="display">Shop all</h1>
            </div>
            <p className="lede">
              Search, filter and sort premium NABOME pieces by category, price, newness and rating.
            </p>
          </div>

          <div className="container glass catalogue-controls">
            <input className="field" type="search" placeholder="Search products, tags, category" value={search} onChange={(event) => setSearch(event.target.value)} />
            <select className="field" value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products">
              {sortOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <label className="range-control">
              <span>Max ₹{maxPrice}</span>
              <input type="range" min="700" max="2600" step="100" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} />
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

          {filteredProducts.length === 0 ? (
            <div className="container glass empty-state">
              <h2>No pieces found</h2>
              <p className="lede">Try a wider price range or a different search term.</p>
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
