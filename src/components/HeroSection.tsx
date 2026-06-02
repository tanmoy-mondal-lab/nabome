import { useMemo, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ShoppingBag, Eye, ArrowRight, Sparkles } from "lucide-react";
import BrandWordmark from "./BrandWordmark";

const heroImages = [
  "/images/products/product1.jpeg",
  "/images/products/product2.jpeg",
  "/images/products/product3.jpeg",
];

export default function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1 as any, 1.1 as any]);

  const bgImage = useMemo(() => heroImages[Math.floor(Math.random() * heroImages.length)], []);

  return (
    <section ref={ref} className="hero-premium" style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      {/* Parallax background */}
      <motion.div
        style={{ position: "absolute", inset: 0, y, scale }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.img
          src={bgImage}
          alt=""
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.8, ease: [0.4, 0, 0.2, 1] }}
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.9) contrast(1.05)" }}
        />
      </motion.div>

      {/* Gradient overlays */}
      <div className="hero-overlay" />
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 30% 50%, rgba(212,175,55,0.08) 0%, transparent 60%)",
      }} />

      {/* Animated floating particles */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: Math.random() * 100 - 50, y: Math.random() * 100 - 50 }}
          animate={{
            opacity: [0, 0.3, 0],
            x: [Math.random() * 200 - 100, Math.random() * 200 - 100],
            y: [Math.random() * 200 - 100, Math.random() * 200 - 100],
          }}
          transition={{ duration: 8 + Math.random() * 6, repeat: Infinity, delay: i * 1.2 }}
          style={{
            position: "absolute",
            width: 2, height: 2,
            borderRadius: "50%",
            background: "var(--gold)",
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            boxShadow: "0 0 6px var(--gold)",
          }}
        />
      ))}

      <div className="container hero-content">
        {/* Announcement bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px",
            border: "1px solid rgba(212,175,55,0.3)",
            borderRadius: 100,
            background: "rgba(5,5,5,0.6)",
            backdropFilter: "blur(12px)",
            fontSize: ".72rem", fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "var(--gold)",
            marginBottom: 20,
          }}
        >
          <Sparkles size={14} />
          Spring Summer 2026 Collection
        </motion.div>

        <motion.h1
          className="display brand-hero-heading"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          <BrandWordmark size="hero" />
        </motion.h1>

        <motion.p
          className="lede"
          style={{ maxWidth: 560, marginTop: 24 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          Bengali streetwear shaped by culture, quiet confidence and premium everyday craft.
          Heavyweight fabrics, controlled silhouettes, gold-on-black restraint.
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          style={{ marginTop: 34, display: "flex", flexWrap: "wrap", gap: 14 }}
        >
          <Link className="premium-button" to="/category" style={{ gap: 8, padding: "0 28px", minHeight: 52, fontSize: ".85rem" }}>
            <ShoppingBag size={16} /> Shop Collection
          </Link>
          <Link className="ghost-button" to="/about" style={{ gap: 8, padding: "0 28px", minHeight: 52, fontSize: ".85rem" }}>
            <Eye size={16} /> Brand Journey
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{ marginTop: "12vh", display: "flex", justifyContent: "center" }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ color: "var(--muted)", fontSize: ".72rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
          >
            Scroll
            <ArrowRight size={14} style={{ transform: "rotate(90deg)" }} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
