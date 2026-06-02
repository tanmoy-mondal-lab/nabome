import { motion } from "framer-motion";
import { Camera, Heart, MessageCircle } from "lucide-react";
import { staggerContainer, staggerItem, sectionProps } from "../lib/animations";
import { products } from "../data/products";

export default function FashionGallery() {
  const galleryImages = products.slice(0, 8);

  return (
    <motion.section className="section" style={{ padding: "clamp(48px, 8vw, 80px) 0" }} {...sectionProps} variants={staggerContainer}>
      <div className="container split-intro">
        <div>
          <p className="eyebrow"><Camera size={14} style={{ display: "inline" }} /> Fashion Feed</p>
          <h2 className="heading">Styled by the circle.</h2>
        </div>
        <a className="ghost-button" href="https://instagram.com/nabome.online" target="_blank" rel="noreferrer" style={{ gap: 8 }}>
          <MessageCircle size={16} /> Follow @nabome.online
        </a>
      </div>
      <motion.div className="container" variants={staggerContainer} style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 10,
      }}>
        {galleryImages.map((product, i) => (
          <motion.div
            key={product.id}
            variants={staggerItem}
            style={{
              position: "relative",
              aspectRatio: i === 0 ? "1" : i === 3 ? "1/1.3" : "1",
              overflow: "hidden",
              borderRadius: 8,
              border: "1px solid var(--line)",
              gridColumn: i === 0 ? "1 / 3" : i === 3 ? "3 / 5" : "auto",
              gridRow: i === 0 ? "1 / 3" : "auto",
            }}
          >
            <motion.img
              src={product.image}
              alt=""
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.6 }}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              style={{
                position: "absolute", inset: 0,
                background: "rgba(0,0,0,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 16,
                color: "#fff", fontSize: ".82rem", fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Heart size={14} /> {Math.floor(Math.random() * 200 + 50)}</span>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
