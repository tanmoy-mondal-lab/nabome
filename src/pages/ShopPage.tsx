import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, MapPin, Package, ShoppingBag, Phone, Mail } from "lucide-react";
import SEO from "../components/SEO";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { generateShopMetadata } from "../lib/seo";
import { organizationSchema } from "../lib/structured-data";
import { getMockShop, generateMockProducts, generateMockReviews } from "../lib/mockVendorData";
import type { VendorProduct } from "../types/vendor";

export default function ShopPage() {
  const { slug } = useParams<{ slug: string }>();
  const shop = getMockShop();
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"default" | "price-low" | "price-high" | "newest">("default");

  const reviews = generateMockReviews();
  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  useEffect(() => {
    setProducts(generateMockProducts(shop.vendorId).filter((p) => p.status === "published"));
  }, [shop.vendorId]);

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ["all", ...Array.from(cats)];
  }, [products]);

  const filtered = useMemo(() => {
    let result = categoryFilter === "all" ? products : products.filter((p) => p.category === categoryFilter);
    if (sortBy === "price-low") result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") result = [...result].sort((a, b) => b.price - a.price);
    if (sortBy === "newest") result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  }, [products, categoryFilter, sortBy]);

  if (!shop) {
    return (
      <>
        <SEO title="Shop Not Found | নবME" description="The requested shop could not be found." />
        <Navbar />
        <main className="page" style={{ display: "grid", placeItems: "center", minHeight: "60vh" }}>
          <p style={{ color: "var(--muted)" }}>Shop not found.</p>
          <Link to="/" className="premium-button" style={{ marginTop: 16, padding: "0 24px" }}>Go Home</Link>
        </main>
      </>
    );
  }

  return (
    <>
      <SEO
        {...generateShopMetadata(shop.shopName, shop.shopDescription, slug || "")}
        structuredData={{
          ...organizationSchema(),
        }}
      />
      <Navbar />
      <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>
        {/* Banner */}
        <div style={{ height: 300, position: "relative", overflow: "hidden" }}>
          <img src={shop.shopBanner} alt={shop.shopName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)" }} />
        </div>

        {/* Shop Info */}
        <section style={{ padding: "0 6%", marginTop: -80, position: "relative", zIndex: 2 }}>
          <div className="glass" style={{ padding: 32, borderRadius: "var(--radius-xl)", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <div style={{ width: 100, height: 100, borderRadius: "var(--radius-lg)", overflow: "hidden", border: "3px solid var(--bg)", flexShrink: 0, background: "var(--surface-strong)" }}>
              <img src={shop.shopLogo} alt={shop.shopName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <h1 style={{ fontSize: "1.8rem", fontWeight: 600 }}>{shop.shopName}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginTop: 8 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--gold)", fontSize: ".9rem" }}>
                  <Star size={16} fill="var(--gold)" /> {avgRating.toFixed(1)} ({reviews.length} reviews)
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--muted)", fontSize: ".85rem" }}>
                  <Package size={14} /> {products.length} products
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--muted)", fontSize: ".85rem" }}>
                  <MapPin size={14} /> {shop.shopCategory}
                </span>
              </div>
              <p style={{ color: "var(--muted)", marginTop: 12, lineHeight: 1.6, maxWidth: 600 }}>{shop.shopDescription}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <a href={`tel:${shop.phone}`} style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--muted)", textDecoration: "none", fontSize: ".85rem" }}>
                <Phone size={14} /> {shop.phone}
              </a>
              <a href={`mailto:${shop.email}`} style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--muted)", textDecoration: "none", fontSize: ".85rem" }}>
                <Mail size={14} /> {shop.email}
              </a>
            </div>
          </div>
        </section>

        {/* Products */}
        <section style={{ padding: "40px 6%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 400, display: "flex", alignItems: "center", gap: 8 }}>
              <ShoppingBag size={20} style={{ color: "var(--gold)" }} /> Products ({filtered.length})
            </h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                style={{ padding: "8px 14px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", borderRadius: "var(--radius)", fontSize: ".82rem", outline: "none" }}>
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>

          {/* Category filters */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap", overflowX: "auto" }}>
            {categories.map((cat) => (
              <button key={cat} onClick={() => setCategoryFilter(cat)}
                style={{
                  padding: "8px 18px", border: `1px solid ${categoryFilter === cat ? "var(--gold)" : "var(--line)"}`,
                  background: categoryFilter === cat ? "var(--gold-soft)" : "transparent",
                  color: categoryFilter === cat ? "var(--gold)" : "var(--muted)", cursor: "pointer",
                  borderRadius: 20, fontSize: ".78rem", fontWeight: categoryFilter === cat ? 700 : 500,
                  whiteSpace: "nowrap", transition: "all var(--transition-fast)",
                }}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>

          {/* Product grid */}
          {filtered.length === 0 ? (
            <div className="glass" style={{ padding: 48, textAlign: "center", borderRadius: "var(--radius-xl)" }}>
              <Package size={40} style={{ color: "var(--muted)", marginBottom: 12 }} />
              <p style={{ color: "var(--muted)" }}>No products found in this category.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
              {filtered.map((product, i) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="glass" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden" }}
                >
                  <Link to={`/product/${product.id}`} style={{ textDecoration: "none", color: "var(--text)" }}>
                    <div style={{ aspectRatio: "3/4", overflow: "hidden", position: "relative" }}>
                      <img src={product.mainImage} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                      {product.discountPrice > 0 && (
                        <span style={{ position: "absolute", top: 10, left: 10, background: "var(--gold)", color: "#050505", fontSize: ".7rem", fontWeight: 700, padding: "3px 8px", borderRadius: 4 }}>
                          -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                        </span>
                      )}
                    </div>
                    <div style={{ padding: 16 }}>
                      <p style={{ color: "var(--muted)", fontSize: ".7rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>{product.category}</p>
                      <p style={{ fontWeight: 600, fontSize: ".85rem", marginBottom: 6 }}>{product.name}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 700, color: "var(--gold)", fontSize: "1rem" }}>
                          ₹{product.discountPrice > 0 ? product.discountPrice : product.price}
                        </span>
                        {product.discountPrice > 0 && (
                          <span style={{ color: "var(--muted)", fontSize: ".78rem", textDecoration: "line-through" }}>₹{product.price}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Reviews */}
        <section style={{ padding: "40px 6% 80px" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 400, display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <Star size={20} style={{ color: "var(--gold)" }} /> Reviews ({reviews.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {reviews.slice(0, 4).map((review, i) => (
              <motion.div key={review.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass" style={{ padding: 20, borderRadius: "var(--radius-lg)" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <div style={{ display: "flex", gap: 2 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} fill={s <= review.rating ? "var(--gold)" : "none"} color={s <= review.rating ? "var(--gold)" : "var(--line)"} />
                    ))}
                  </div>
                  <p style={{ fontWeight: 600, fontSize: ".82rem" }}>{review.customerName}</p>
                  <p style={{ color: "var(--muted)", fontSize: ".72rem" }}>{new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                </div>
                <p style={{ fontSize: ".85rem", color: "var(--text)" }}>{review.comment}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
