import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shirt, Sparkles, Baby, Footprints, Backpack, Gem, Dumbbell, Palmtree } from "lucide-react";
import { staggerContainer, staggerItem, sectionProps } from "../lib/animations";

type Category = { name: string; icon: React.ReactNode; slug: string; description: string; color: string };

const categories: Category[] = [
  { name: "Men", icon: <Shirt size={28} />, slug: "Men", description: "Premium streetwear & essentials", color: "#3498db" },
  { name: "Women", icon: <Sparkles size={28} />, slug: "Women", description: "Contemporary fashion & style", color: "#e84393" },
  { name: "Kids", icon: <Baby size={28} />, slug: "Kids", description: "Trendy & comfortable wear", color: "#00b894" },
  { name: "Footwear", icon: <Footprints size={28} />, slug: "Footwear", description: "Sneakers, slides & more", color: "#6c5ce7" },
  { name: "Accessories", icon: <Backpack size={28} />, slug: "Accessories", description: "Bags, belts & extras", color: "#fdcb6e" },
  { name: "Jewelry", icon: <Gem size={28} />, slug: "Jewelry", description: "Modern & traditional pieces", color: "#e17055" },
  { name: "Sportswear", icon: <Dumbbell size={28} />, slug: "Sportswear", description: "Activewear & athleisure", color: "#00cec9" },
  { name: "Ethnic Wear", icon: <Palmtree size={28} />, slug: "Ethnic", description: "Festive & cultural attire", color: "#d63031" },
];

export default function CategoryShowcase() {
  return (
    <motion.section className="section" style={{ padding: "clamp(48px, 8vw, 80px) 0" }} {...sectionProps} variants={staggerContainer}>
      <div className="container split-intro">
        <div>
          <p className="eyebrow">Collections</p>
          <h2 className="heading">Shop by category.</h2>
        </div>
        <p className="lede">
          Explore premium fashion across every category — from everyday streetwear to festive elegance.
        </p>
      </div>
      <motion.div className="container" variants={staggerContainer} style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 16,
      }}>
        {categories.map((cat) => (
          <motion.div key={cat.name} variants={staggerItem}>
            <Link
              to={`/category?category=${cat.slug}`}
              style={{ textDecoration: "none", display: "block" }}
            >
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  padding: "28px 24px",
                  border: "1px solid var(--line)",
                  borderRadius: 16,
                  background: "var(--surface)",
                  cursor: "pointer",
                  transition: "border-color 0.3s, background 0.3s",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--gold)";
                  e.currentTarget.style.background = "var(--gold-soft)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--line)";
                  e.currentTarget.style.background = "var(--surface)";
                }}
              >
                <motion.div
                  style={{
                    width: 56, height: 56,
                    borderRadius: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                    background: `linear-gradient(135deg, ${cat.color}22, ${cat.color}11)`,
                    color: cat.color,
                  }}
                  whileHover={{ rotate: 5, scale: 1.05 }}
                >
                  {cat.icon}
                </motion.div>
                <h3 style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: 6 }}>{cat.name}</h3>
                <p style={{ color: "var(--muted)", fontSize: ".82rem", lineHeight: 1.5 }}>{cat.description}</p>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  style={{
                    position: "absolute",
                    bottom: 20, right: 20,
                    width: 32, height: 32,
                    borderRadius: "50%",
                    background: "var(--gold)",
                    color: "#050505",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: ".8rem",
                    fontWeight: 700,
                    opacity: 0,
                    transition: "opacity 0.3s",
                  }}
                >
                  →
                </motion.div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
