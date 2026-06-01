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

export default function Home() {
  const [quickView, setQuickView] = useState<Product | null>(null);
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const newArrivals = products.filter((product) => product.isNew).slice(0, 4);

  const quickAdd = (product: Product) => {
    addToCart({ ...product, selectedSize: product.sizes[0], selectedColor: product.colors[0] });
    showToast(`${product.name} added to bag`);
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
          sameAs: ["https://instagram.com/nabome.online"],
        }}
      />
      <Navbar />
      <main className="page">
        <section className="hero-premium">
          <img src="/images/hero/hero-banner.webp" alt="নবME Bengali streetwear editorial" />
          <div className="hero-overlay" />
          <div className="container hero-content">
            <p className="eyebrow">Spring Summer 2026</p>
            <h1 className="display brand-hero-heading">
              <BrandWordmark size="hero" />
            </h1>
            <p className="lede">
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

        <section className="section">
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

        <section className="section editorial-band">
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

        <section className="section" style={{ padding: "60px 0" }}>
          <div className="container" style={{ textAlign: "center", maxWidth: 900 }}>
            <p className="eyebrow">বাংলা সংস্কৃতি</p>
            <div className="cultural-ornament">◈</div>
            <BengaliQuoteRotator />
          </div>
        </section>

        <section className="section">
          <div className="container card-grid">
            {[
              ["Premium GSM", "Heavyweight fabrics selected for structure, comfort and long wear."],
              ["WhatsApp Checkout", "Fast assisted ordering with product, size and color details pre-filled."],
              ["Bengal Story", "Culture-led graphics, restrained branding and community-first drops."],
              ["Open Roadmap", "Ready for inventory, coupons, admin dashboards and payment gateways."],
            ].map(([title, text]) => (
              <article className="glass" key={title} style={{ padding: 28 }}>
                <h3>{title}</h3>
                <p className="lede" style={{ marginTop: 12, fontSize: ".98rem" }}>
                  {text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="section instagram-strip">
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
