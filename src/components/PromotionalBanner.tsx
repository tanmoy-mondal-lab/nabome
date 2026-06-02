import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Clock, Gift, Sparkles, Zap, ArrowRight } from "lucide-react";
import { staggerContainer, staggerItem, sectionProps } from "../lib/animations";

const banners = [
  {
    title: "Flash Sale",
    subtitle: "48 Hours Only",
    description: "Up to 40% off on select streetwear essentials",
    cta: "Shop Flash Sale",
    link: "/category?sale=flash",
    gradient: "linear-gradient(135deg, #e74c3c, #c0392b)",
    icon: <Zap size={28} />,
  },
  {
    title: "Festival Special",
    subtitle: "Celebrate in Style",
    description: "Exclusive festive collection with complimentary gift wrapping",
    cta: "Explore Festive",
    link: "/category?collection=festive",
    gradient: "linear-gradient(135deg, #e84393, #6c5ce7)",
    icon: <Gift size={28} />,
  },
  {
    title: "New Collection",
    subtitle: "SS26 Launch",
    description: "Discover our latest drop — lightweight fabrics, bold silhouettes",
    cta: "View New Arrivals",
    link: "/category?badge=new",
    gradient: "linear-gradient(135deg, #0984e3, #00cec9)",
    icon: <Sparkles size={28} />,
  },
];

export default function PromotionalBanners() {
  return (
    <motion.section className="section" style={{ padding: "clamp(40px, 6vw, 60px) 0" }} {...sectionProps} variants={staggerContainer}>
      <motion.div className="container" variants={staggerContainer} style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: 16,
      }}>
        {banners.map((banner) => (
          <motion.div key={banner.title} variants={staggerItem}>
            <Link to={banner.link} style={{ textDecoration: "none", display: "block" }}>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  padding: "32px 28px",
                  borderRadius: 16,
                  background: banner.gradient,
                  position: "relative",
                  overflow: "hidden",
                  minHeight: 180,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                }}
              >
                {/* Decorative pattern */}
                <div style={{
                  position: "absolute", top: -20, right: -20,
                  width: 120, height: 120, borderRadius: "50%",
                  background: "rgba(255,255,255,0.08)",
                }} />
                <div style={{
                  position: "absolute", bottom: -30, left: -30,
                  width: 160, height: 160, borderRadius: "50%",
                  background: "rgba(255,255,255,0.05)",
                }} />

                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ color: "rgba(255,255,255,0.9)" }}>{banner.icon}</div>
                    <span style={{
                      padding: "3px 10px", borderRadius: 6,
                      background: "rgba(255,255,255,0.15)",
                      color: "rgba(255,255,255,0.95)",
                      fontSize: ".68rem", fontWeight: 700, letterSpacing: "0.08em",
                    }}>
                      <Clock size={10} style={{ display: "inline", marginRight: 4 }} />
                      {banner.subtitle}
                    </span>
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: "1.3rem", color: "#fff", marginBottom: 6 }}>{banner.title}</h3>
                  <p style={{ color: "rgba(255,255,255,0.85)", fontSize: ".85rem", lineHeight: 1.5, marginBottom: 14 }}>{banner.description}</p>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#fff", fontWeight: 700, fontSize: ".82rem" }}>
                    {banner.cta} <ArrowRight size={14} />
                  </span>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
