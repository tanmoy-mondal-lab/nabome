import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import BrandWordmark from "../components/BrandWordmark";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import QuickViewModal from "../components/QuickViewModal";
import SEO from "../components/SEO";
import BengaliQuoteRotator from "../components/BengaliQuoteRotator";
import { useToast } from "../components/Toast";
import { useCart } from "../context/CartContext";
import { ShoppingBag, Sparkles, BarChart3, Eye, MessageCircle, MapPin } from "lucide-react";
import { products, type Product } from "../data/products";
import { useState } from "react";

const categoryEmoji: Record<string, string> = {
  Men: "👔",
  Women: "👗",
  Unisex: "🔄",
  Accessories: "👜",
};

const perkIcon: Record<string, React.ReactNode> = {
  "Premium GSM": <Sparkles size={24} />,
  "WhatsApp Checkout": <MessageCircle size={24} />,
  "Bengal Story": <MapPin size={24} />,
  "Open Roadmap": <BarChart3 size={24} />,
};

const easeOut = [0.4, 0, 0.2, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, ease: easeOut },
};

const stagger = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: "-40px" },
  transition: { staggerChildren: 0.08 },
};

const staggerItem = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, ease: easeOut },
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
    borderRadius: "var(--radius-lg)",
    transition: "border-color 0.3s, background 0.3s, transform 0.3s",
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
            <motion.p
              className="eyebrow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >Spring Summer 2026</motion.p>
            <motion.h1
              className="display brand-hero-heading"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: easeOut }}
            >
              <BrandWordmark size="hero" />
            </motion.h1>
            <motion.p
              className="lede" style={{ maxWidth: 560 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
            >
              Bengali streetwear shaped by culture, quiet confidence and premium everyday craft.
            </motion.p>
            <motion.div
              className="hero-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Link className="premium-button" to="/category" style={{ gap: 8 }}>
                <ShoppingBag size={16} /> Shop Collection
              </Link>
              <Link className="ghost-button" to="/about" style={{ gap: 8 }}>
                <Eye size={16} /> Brand Journey
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── NEW ARRIVALS ── */}
        <motion.section className="section" style={sectionStyle} {...fadeUp}>
          <div className="container split-intro">
            <div>
              <p className="eyebrow">New Arrivals</p>
              <h2 className="heading">Latest drops for the city, the adda, the after-hours.</h2>
            </div>
            <p className="lede">
              Premium cotton, controlled silhouettes and gold-on-black restraint give নবME the feel of a luxury label without losing its Bengali pulse.
            </p>
          </div>
          <motion.div className="container product-grid" {...stagger}>
            {newArrivals.map((product, i) => (
              <motion.div key={product.id} {...staggerItem} transition={{ ...staggerItem.transition, delay: i * 0.05 }}>
                <ProductCard product={product} onQuickView={setQuickView} onQuickAdd={quickAdd} />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* ── BEST SELLERS ── */}
        {bestSellers.length > 0 && (
          <motion.section className="section" style={{ ...sectionStyle, paddingTop: 0 }} {...fadeUp}>
            <div className="container split-intro">
              <div>
                <p className="eyebrow">Best Sellers</p>
                <h2 className="heading">Crowd favourites that define the নবME wardrobe.</h2>
              </div>
              <Link className="ghost-button" to="/category" style={{ gap: 8 }}>
                View All <Eye size={14} />
              </Link>
            </div>
            <motion.div className="container product-grid" {...stagger}>
              {bestSellers.map((product, i) => (
                <motion.div key={product.id} {...staggerItem} transition={{ ...staggerItem.transition, delay: i * 0.05 }}>
                  <ProductCard product={product} onQuickView={setQuickView} onQuickAdd={quickAdd} />
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        )}

        {/* ── SHOP BY CATEGORY ── */}
        <motion.section className="section" style={{ ...sectionStyle, paddingTop: 0 }} {...fadeUp}>
          <div className="container split-intro">
            <div>
              <p className="eyebrow">Categories</p>
              <h2 className="heading">Shop by collection.</h2>
            </div>
          </div>
          <motion.div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }} {...stagger}>
            {categories.map((cat, i) => (
              <motion.div key={cat} {...staggerItem} transition={{ ...staggerItem.transition, delay: i * 0.06 }}>
                <Link to={`/category?category=${cat}`} style={categoryCard}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.background = "var(--gold-soft)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>{categoryEmoji[cat] || "✦"}</div>
                  <h3 style={{ fontWeight: 600 }}>{cat}</h3>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* ── EDITORIAL ── */}
        <motion.section className="section editorial-band" style={sectionStyle} {...fadeUp}>
          <div className="container editorial-grid">
            <motion.div className="glass editorial-copy"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: easeOut }}
            >
              <p className="eyebrow">Bengali Culture</p>
              <h2 className="heading">A wardrobe built from memory and movement.</h2>
              <p className="lede">
                From hand-pulled typography to relaxed silhouettes, নবME translates Bengal's creative energy into refined streetwear that travels everywhere.
              </p>
            </motion.div>
            <motion.img src="/images/community/community.jpeg" alt="নবME community showcase" loading="lazy"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: easeOut }}
            />
          </div>
        </motion.section>

        {/* ── CULTURAL QUOTE ROTATOR ── */}
        <motion.section className="section" style={{ padding: "60px 0" }} {...fadeUp}>
          <div className="container" style={{ textAlign: "center", maxWidth: 900 }}>
            <p className="eyebrow">বাংলা সংস্কৃতি</p>
            <div className="cultural-ornament">◈</div>
            <BengaliQuoteRotator />
          </div>
        </motion.section>

        {/* ── VALUE PROPOSITION ── */}
        <motion.section className="section" style={sectionStyle} {...fadeUp}>
          <motion.div className="container card-grid" {...stagger}>
            {[
              ["Premium GSM", "Heavyweight fabrics selected for structure, comfort and long wear."],
              ["WhatsApp Checkout", "Fast assisted ordering with product, size and color details pre-filled."],
              ["Bengal Story", "Culture-led graphics, restrained branding and community-first drops."],
              ["Open Roadmap", "Ready for inventory, coupons, admin dashboards and payment gateways."],
            ].map(([title, text], i) => (
              <motion.article className="glass premium-card-hover" key={title}
                {...staggerItem}
                transition={{ ...staggerItem.transition, delay: i * 0.08 }}
                style={{ padding: 28, borderRadius: "var(--radius-lg)" }}
              >
                <div style={{ color: "var(--gold)", marginBottom: 12 }}>{perkIcon[title] || "✦"}</div>
                <h3>{title}</h3>
                <p className="lede" style={{ marginTop: 12, fontSize: ".98rem" }}>
                  {text}
                </p>
              </motion.article>
            ))}
          </motion.div>
        </motion.section>

        {/* ── COMMUNITY / INSTAGRAM ── */}
        <motion.section className="section instagram-strip" style={sectionStyle} {...fadeUp}>
          <div className="container split-intro">
            <div>
              <p className="eyebrow">Community</p>
              <h2 className="heading">Styled by the নবME circle.</h2>
            </div>
            <a className="ghost-button" href="https://instagram.com/nabome.online" target="_blank" rel="noreferrer" style={{ gap: 8 }}>
              <MessageCircle size={16} /> Instagram
            </a>
          </div>
          <div className="container instagram-grid" aria-label="Instagram preview">
            {products.slice(0, 6).map((product) => (
              <img key={product.id} src={product.image} alt={`${product.name} social preview`} loading="lazy" />
            ))}
          </div>
        </motion.section>
      </main>
      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} onAdd={quickAdd} />
    </>
  );
}
