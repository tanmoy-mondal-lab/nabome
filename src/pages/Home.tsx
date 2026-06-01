import { Link } from "react-router-dom";
import BrandWordmark from "../components/BrandWordmark";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import QuickViewModal from "../components/QuickViewModal";
import SEO from "../components/SEO";
import BengaliQuoteRotator from "../components/BengaliQuoteRotator";
import { useToast } from "../components/Toast";
import { useCart } from "../context/CartContext";
import { products, type Product } from "../data/products";
import { useState } from "react";

const categoryEmoji: Record<string, string> = {
  Men: "👔",
  Women: "👗",
  Unisex: "🔄",
  Accessories: "👜",
};

const perkIcon: Record<string, string> = {
  "Premium GSM": "🧵",
  "WhatsApp Checkout": "📱",
  "Bengal Story": "🌾",
  "Open Roadmap": "📋",
};

export default function Home() {
  const [quickView, setQuickView] = useState<Product | null>(null);
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const newArrivals = products.filter((p) => p.isNew).slice(0, 4);
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);
  const categories = [...new Set(products.map((p) => p.category))];

  const quickAdd = (product: Product) => {
    addToCart({ ...product, selectedSize: product.sizes[0], selectedColor: product.colors[0] });
    showToast(`${product.name} added to bag`);
  };

  const sectionStyle: React.CSSProperties = {
    padding: "clamp(48px, 8vw, 80px) 0",
  };

  const categoryCard: React.CSSProperties = {
    padding: "32px 24px",
    textAlign: "center",
    textDecoration: "none",
    color: "var(--text)",
    border: "1px solid var(--line)",
    background: "var(--surface)",
    cursor: "pointer",
    transition: "border-color 0.3s, background 0.3s",
  };

  return (
    <>
      <SEO
        title="নবME | Premium Bengali Streetwear"
        description="Shop নবME premium Bengali streetwear: oversized tees, hoodies, accessories and everyday luxury pieces crafted for modern India."
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "নবME",
          url: "https://www.nabome.online",
          sameAs: ["https://instagram.com/nabome.online", "https://www.facebook.com/share/1DbpYKWoZ1/"],
        }}
      />
      <Navbar />
      <main className="page">
        {/* ── HERO ── */}
        <section className="hero-premium">
          <img src="/images/hero/hero-banner.webp" alt="নবME Bengali streetwear editorial" />
          <div className="hero-overlay" />
          <div className="container hero-content">
            <p className="eyebrow">Spring Summer 2026</p>
            <h1 className="display brand-hero-heading">
              <BrandWordmark size="hero" />
            </h1>
            <p className="lede" style={{ maxWidth: 560 }}>
              Bengali streetwear shaped by culture, quiet confidence and premium everyday craft.
            </p>
            <div className="hero-actions">
              <Link className="premium-button" to="/category">
                Shop Collection
              </Link>
              <Link className="ghost-button" to="/about">
                Brand Journey
              </Link>
            </div>
          </div>
        </section>

        {/* ── NEW ARRIVALS ── */}
        <section className="section" style={sectionStyle}>
          <div className="container split-intro">
            <div>
              <p className="eyebrow">New Arrivals</p>
              <h2 className="heading">Latest drops for the city, the adda, the after-hours.</h2>
            </div>
            <p className="lede">
              Premium cotton, controlled silhouettes and gold-on-black restraint give নবME the feel of a luxury label without losing its Bengali pulse.
            </p>
          </div>
          <div className="container product-grid">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} onQuickView={setQuickView} onQuickAdd={quickAdd} />
            ))}
          </div>
        </section>

        {/* ── BEST SELLERS ── */}
        {bestSellers.length > 0 && (
          <section className="section" style={{ ...sectionStyle, paddingTop: 0 }}>
            <div className="container split-intro">
              <div>
                <p className="eyebrow">Best Sellers</p>
                <h2 className="heading">Crowd favourites that define the নবME wardrobe.</h2>
              </div>
              <Link className="ghost-button" to="/category">View All →</Link>
            </div>
            <div className="container product-grid">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} onQuickView={setQuickView} onQuickAdd={quickAdd} />
              ))}
            </div>
          </section>
        )}

        {/* ── SHOP BY CATEGORY ── */}
        <section className="section" style={{ ...sectionStyle, paddingTop: 0 }}>
          <div className="container split-intro">
            <div>
              <p className="eyebrow">Categories</p>
              <h2 className="heading">Shop by collection.</h2>
            </div>
          </div>
          <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {categories.map((cat) => (
              <Link key={cat} to={`/category?category=${cat}`} style={categoryCard}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.background = "var(--gold-soft)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.background = "var(--surface)"; }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>{categoryEmoji[cat] || "✦"}</div>
                <h3 style={{ fontWeight: 600 }}>{cat}</h3>
              </Link>
            ))}
          </div>
        </section>

        {/* ── EDITORIAL ── */}
        <section className="section editorial-band" style={sectionStyle}>
          <div className="container editorial-grid">
            <div className="glass editorial-copy">
              <p className="eyebrow">Bengali Culture</p>
              <h2 className="heading">A wardrobe built from memory and movement.</h2>
              <p className="lede">
                From hand-pulled typography to relaxed silhouettes, নবME translates Bengal's creative energy into refined streetwear that travels everywhere.
              </p>
            </div>
            <img src="/images/community/community.jpeg" alt="নবME community showcase" loading="lazy" />
          </div>
        </section>

        {/* ── CULTURAL QUOTE ROTATOR ── */}
        <section className="section" style={{ padding: "60px 0" }}>
          <div className="container" style={{ textAlign: "center", maxWidth: 900 }}>
            <p className="eyebrow">বাংলা সংস্কৃতি</p>
            <div className="cultural-ornament">◈</div>
            <BengaliQuoteRotator />
          </div>
        </section>

        {/* ── VALUE PROPOSITION ── */}
        <section className="section" style={sectionStyle}>
          <div className="container card-grid">
            {[
              ["Premium GSM", "Heavyweight fabrics selected for structure, comfort and long wear."],
              ["WhatsApp Checkout", "Fast assisted ordering with product, size and color details pre-filled."],
              ["Bengal Story", "Culture-led graphics, restrained branding and community-first drops."],
              ["Open Roadmap", "Ready for inventory, coupons, admin dashboards and payment gateways."],
            ].map(([title, text]) => (
              <article className="glass" key={title} style={{ padding: 28 }}>
                <div style={{ fontSize: "1.8rem", marginBottom: 12 }}>{perkIcon[title] || "✦"}</div>
                <h3>{title}</h3>
                <p className="lede" style={{ marginTop: 12, fontSize: ".98rem" }}>
                  {text}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ── COMMUNITY / INSTAGRAM ── */}
        <section className="section instagram-strip" style={sectionStyle}>
          <div className="container split-intro">
            <div>
              <p className="eyebrow">Community</p>
              <h2 className="heading">Styled by the নবME circle.</h2>
            </div>
            <a className="ghost-button" href="https://instagram.com/nabome.online" target="_blank" rel="noreferrer">
              Instagram
            </a>
          </div>
          <div className="container instagram-grid" aria-label="Instagram preview">
            {products.slice(0, 6).map((product) => (
              <img key={product.id} src={product.image} alt={`${product.name} social preview`} loading="lazy" />
            ))}
          </div>
        </section>
      </main>
      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} onAdd={quickAdd} />
    </>
  );
}
