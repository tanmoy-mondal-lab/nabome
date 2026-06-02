import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Store, Star, Package, ChevronRight } from "lucide-react";
import { staggerContainer, staggerItem, sectionProps } from "../lib/animations";

const vendors = [
  { name: "Bengal Streetwear", slug: "bengal-streetwear", rating: 4.8, products: 24, logo: "BS", color: "#3498db", tag: "Urban Essentials" },
  { name: "Kolkata Collective", slug: "kolkata-collective", rating: 4.7, products: 18, logo: "KC", color: "#e84393", tag: "Handcrafted" },
  { name: "Heritage Threads", slug: "heritage-threads", rating: 4.9, products: 31, logo: "HT", color: "#6c5ce7", tag: "Premium" },
  { name: "Urban Ethnik", slug: "urban-ethnik", rating: 4.6, products: 15, logo: "UE", color: "#00b894", tag: "Contemporary" },
];

export default function VendorSpotlight() {
  return (
    <motion.section className="section" style={{ padding: "clamp(48px, 8vw, 80px) 0", background: "linear-gradient(180deg, transparent, rgba(212,175,55,0.04), transparent)" }} {...sectionProps} variants={staggerContainer}>
      <div className="container split-intro">
        <div>
          <p className="eyebrow"><Store size={14} style={{ display: "inline" }} /> Vendor Spotlight</p>
          <h2 className="heading">Our top creators.</h2>
        </div>
        <p className="lede">Discover premium collections from our most trusted independent vendors and designers.</p>
      </div>
      <motion.div className="container" variants={staggerContainer} style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 20,
      }}>
        {vendors.map((vendor) => (
          <motion.div key={vendor.slug} variants={staggerItem}>
            <Link to={`/shop/${vendor.slug}`} style={{ textDecoration: "none", display: "block" }}>
              <motion.div
                whileHover={{ y: -4 }}
                style={{
                  padding: 24,
                  border: "1px solid var(--line)",
                  borderRadius: 16,
                  background: "var(--surface)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Decorative top bar */}
                <div style={{ height: 4, background: `linear-gradient(90deg, ${vendor.color}, var(--gold))`, borderRadius: "4px 4px 0 0", margin: -24, marginBottom: 20 }} />

                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: `linear-gradient(135deg, ${vendor.color}22, ${vendor.color}11)`,
                    border: `1px solid ${vendor.color}33`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: "1.1rem", color: vendor.color,
                  }}>
                    {vendor.logo}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: ".95rem" }}>{vendor.name}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                      <Star size={12} style={{ color: "var(--gold)", fill: "var(--gold)" }} />
                      <span style={{ color: "var(--muted)", fontSize: ".78rem" }}>{vendor.rating}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--muted)", fontSize: ".78rem" }}>
                    <Package size={12} /> {vendor.products} products
                  </div>
                  <span style={{
                    padding: "2px 8px", borderRadius: 6,
                    background: "var(--gold-soft)", color: "var(--gold)",
                    fontSize: ".7rem", fontWeight: 700, letterSpacing: "0.05em",
                  }}>
                    {vendor.tag}
                  </span>
                </div>

                <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6, color: "var(--gold)", fontSize: ".82rem", fontWeight: 600 }}>
                  Visit Shop <ChevronRight size={14} />
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
