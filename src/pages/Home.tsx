import { useState } from "react";
import Navbar from "../components/Navbar";
import QuickViewModal from "../components/QuickViewModal";
import SEO from "../components/SEO";
import BengaliQuoteRotator from "../components/BengaliQuoteRotator";
import { useToast } from "../components/Toast";
import { useCart } from "../context/CartContext";
import { Sparkles, BarChart3, MessageCircle, MapPin } from "lucide-react";
import { products, type Product } from "../data/products";
import { generateHomeMetadata } from "../lib/seo";
import { organizationSchema, websiteSchema } from "../lib/structured-data";
import HeroSection from "../components/HeroSection";
import CategoryShowcase from "../components/CategoryShowcase";
import ProductShowcase from "../components/ProductShowcase";
import VendorSpotlight from "../components/VendorSpotlight";
import FeaturedCollections from "../components/FeaturedCollections";
import PromotionalBanner from "../components/PromotionalBanner";
import TrustSection from "../components/TrustSection";
import TestimonialSlider from "../components/TestimonialSlider";
import FashionGallery from "../components/FashionGallery";
import NewsletterSection from "../components/NewsletterSection";

const perkIcon: Record<string, React.ReactNode> = {
  "Premium GSM": <Sparkles size={24} />,
  "WhatsApp Checkout": <MessageCircle size={24} />,
  "Bengal Story": <MapPin size={24} />,
  "Open Roadmap": <BarChart3 size={24} />,
};

export default function Home() {
  const [quickView, setQuickView] = useState<Product | null>(null);
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const quickAdd = (product: Product) => {
    addToCart({ ...product, selectedSize: product.sizes[0], selectedColor: product.colors[0] });
    showToast(`${product.name} added to bag`);
  };

  const sectionStyle: React.CSSProperties = {
    padding: "clamp(48px, 8vw, 80px) 0",
  };

  return (
    <>
      <SEO
        {...generateHomeMetadata()}
        structuredData={{
          ...organizationSchema(),
          ...websiteSchema(),
        }}
      />
      <Navbar />
      <main className="page">
        {/* ── PREMIUM HERO ── */}
        <HeroSection />

        {/* ── PROMOTIONAL BANNERS ── */}
        <PromotionalBanner />

        {/* ── CATEGORY SHOWCASE ── */}
        <CategoryShowcase />

        {/* ── TRENDING NOW ── */}
        <ProductShowcase
          title="Trending Now"
          subtitle="Most wanted this season."
          filterFn={(p) => !!(p.isBestSeller || p.isNew)}
          limit={8}
        />

        {/* ── NEW ARRIVALS ── */}
        <ProductShowcase
          title="New Arrivals"
          subtitle="Latest drops for the city."
          filterFn={(p) => !!p.isNew}
          limit={8}
        />

        {/* ── BEST SELLERS ── */}
        {products.filter((p) => p.isBestSeller).length > 0 && (
          <ProductShowcase
            title="Best Sellers"
            subtitle="Crowd favourites."
            filterFn={(p) => !!p.isBestSeller}
            limit={8}
          />
        )}

        {/* ── VENDOR SPOTLIGHT ── */}
        <VendorSpotlight />

        {/* ── FEATURED COLLECTIONS ── */}
        <FeaturedCollections />

        {/* ── TRUST SECTION ── */}
        <TrustSection />

        {/* ── EDITORIAL ── */}
        <section className="section editorial-band" style={sectionStyle}>
          <div className="container editorial-grid">
            <div
              className="glass editorial-copy"
              style={{ opacity: 0, animation: "fade-in 0.7s ease forwards" }}
            >
              <p className="eyebrow">Bengali Culture</p>
              <h2 className="heading">A wardrobe built from memory and movement.</h2>
              <p className="lede" style={{ marginTop: 16 }}>
                From hand-pulled typography to relaxed silhouettes, নবME translates Bengal's creative energy into refined streetwear that travels everywhere.
              </p>
            </div>
            <img
              src="/images/community/community.jpeg"
              alt="নবME community showcase"
              loading="lazy"
              style={{
                width: "100%", height: 620, objectFit: "cover",
                border: "1px solid var(--line)",
                opacity: 0, animation: "fade-in 0.7s ease 0.2s forwards",
              }}
            />
          </div>
        </section>

        {/* ── CUSTOMER TESTIMONIALS ── */}
        <TestimonialSlider />

        {/* ── CULTURAL QUOTE ROTATOR ── */}
        <section className="section" style={{ padding: "60px 0", background: "linear-gradient(180deg, transparent, rgba(212,175,55,0.03), transparent)" }}>
          <div className="container" style={{ textAlign: "center", maxWidth: 900 }}>
            <p className="eyebrow">বাংলা সংস্কৃতি</p>
            <div className="cultural-ornament">◈</div>
            <BengaliQuoteRotator />
          </div>
        </section>

        {/* ── VALUE PROPOSITION ── */}
        <section className="section" style={sectionStyle}>
          <div className="container split-intro">
            <div>
              <p className="eyebrow">Why Choose Us</p>
              <h2 className="heading">Built for the modern wardrobe.</h2>
            </div>
            <p className="lede">Every detail of নবME is intentional — from fabric weight to cultural storytelling.</p>
          </div>
          <div className="container card-grid" style={{ marginTop: 0 }}>
            {[
              ["Premium GSM", "Heavyweight fabrics selected for structure, comfort and long wear."],
              ["WhatsApp Checkout", "Fast assisted ordering with product, size and color details pre-filled."],
              ["Bengal Story", "Culture-led graphics, restrained branding and community-first drops."],
              ["Open Roadmap", "Ready for inventory, coupons, admin dashboards and payment gateways."],
            ].map(([title, text], i) => (
              <article
                key={title}
                className="glass premium-card-hover"
                style={{
                  padding: 28, borderRadius: "var(--radius-lg)",
                  opacity: 0, animation: `fade-in 0.5s ease ${i * 0.1 + 0.1}s forwards`,
                }}
              >
                <div style={{ color: "var(--gold)", marginBottom: 12 }}>{perkIcon[title] || "✦"}</div>
                <h3>{title}</h3>
                <p className="lede" style={{ marginTop: 12, fontSize: ".98rem" }}>
                  {text}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ── INSTAGRAM / FASHION GALLERY ── */}
        <FashionGallery />

        {/* ── NEWSLETTER ── */}
        <NewsletterSection />
      </main>
      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} onAdd={quickAdd} />
    </>
  );
}
