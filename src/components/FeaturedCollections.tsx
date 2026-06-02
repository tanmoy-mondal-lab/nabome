import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sun, Snowflake, Gift, Heart, Dumbbell, ArrowRight, Sparkles } from "lucide-react";
import { staggerContainer, staggerItem, sectionProps } from "../lib/animations";

const collections = [
  { name: "Summer Collection", description: "Light fabrics, bold colors for the season", icon: <Sun size={32} />, slug: "summer", color: "#fdcb6e", bg: "linear-gradient(135deg, #fdcb6e22, #e1705511)", image: "/images/products/product1.jpeg" },
  { name: "Winter Collection", description: "Heavy layers, premium warmth", icon: <Snowflake size={32} />, slug: "winter", color: "#74b9ff", bg: "linear-gradient(135deg, #74b9ff22, #0984e311)", image: "/images/products/product3.jpeg" },
  { name: "Festive Collection", description: "Celebrate with exclusive festive drops", icon: <Sparkles size={32} />, slug: "festive", color: "#e84393", bg: "linear-gradient(135deg, #e8439322, #d6303111)", image: "/images/products/product2.jpeg" },
  { name: "Wedding Collection", description: "Elegant attire for your special day", icon: <Heart size={32} />, slug: "wedding", color: "#e17055", bg: "linear-gradient(135deg, #e1705522, #d6303111)", image: "/images/products/product1.jpeg" },
  { name: "Sports Collection", description: "Performance meets street style", icon: <Dumbbell size={32} />, slug: "sports", color: "#00b894", bg: "linear-gradient(135deg, #00b89422, #00cec911)", image: "/images/products/product3.jpeg" },
  { name: "Limited Edition", description: "Rare pieces, one-time drops", icon: <Gift size={32} />, slug: "limited", color: "#6c5ce7", bg: "linear-gradient(135deg, #6c5ce722, #a29bfe11)", image: "/images/products/product2.jpeg" },
];

export default function FeaturedCollections() {
  return (
    <motion.section className="section" style={{ padding: "clamp(48px, 8vw, 80px) 0" }} {...sectionProps} variants={staggerContainer}>
      <div className="container split-intro">
        <div>
          <p className="eyebrow">Collections</p>
          <h2 className="heading">Curated for every occasion.</h2>
        </div>
        <p className="lede">From seasonal staples to limited-edition drops — find the perfect look for any moment.</p>
      </div>
      <motion.div className="container" variants={staggerContainer} style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 16,
      }}>
        {collections.map((col) => (
          <motion.div key={col.name} variants={staggerItem}>
            <Link to={`/category?collection=${col.slug}`} style={{ textDecoration: "none", display: "block" }}>
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                style={{
                  padding: 28,
                  borderRadius: 16,
                  border: "1px solid var(--line)",
                  background: col.bg,
                  position: "relative",
                  overflow: "hidden",
                  minHeight: 180,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                }}
              >
                {/* Background image */}
                <div style={{
                  position: "absolute", inset: 0, opacity: 0.1,
                  backgroundImage: `url(${col.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }} />

                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 14,
                    background: `linear-gradient(135deg, ${col.color}33, ${col.color}11)`,
                    border: `1px solid ${col.color}33`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: col.color, marginBottom: 14,
                  }}>
                    {col.icon}
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 6 }}>{col.name}</h3>
                  <p style={{ color: "var(--muted)", fontSize: ".85rem", lineHeight: 1.5, marginBottom: 12 }}>{col.description}</p>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--gold)", fontWeight: 600, fontSize: ".82rem" }}>
                    Explore Collection <ArrowRight size={14} />
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
