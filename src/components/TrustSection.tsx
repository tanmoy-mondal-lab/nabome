import { motion } from "framer-motion";
import { Shield, Truck, RotateCcw, MessageCircle, BadgeCheck, CreditCard } from "lucide-react";
import { staggerContainer, staggerItem, sectionProps } from "../lib/animations";

const trustItems = [
  { icon: <BadgeCheck size={28} />, title: "Verified Vendors", description: "Every creator is curated and verified for quality and authenticity." },
  { icon: <Shield size={28} />, title: "Secure Shopping", description: "Protected checkout with encrypted payments and data privacy." },
  { icon: <RotateCcw size={28} />, title: "Easy Returns", description: "Hassle-free returns within 7 days of delivery." },
  { icon: <MessageCircle size={28} />, title: "Customer Support", description: "Reach us via WhatsApp or email — we respond within hours." },
  { icon: <Truck size={28} />, title: "Fast Delivery", description: "Pan-India shipping with tracking. Free above ₹999." },
  { icon: <CreditCard size={28} />, title: "Flexible Payments", description: "UPI, WhatsApp orders — pay your way." },
];

export default function TrustSection() {
  return (
    <motion.section className="section" style={{ padding: "clamp(48px, 8vw, 80px) 0", background: "linear-gradient(180deg, transparent, rgba(212,175,55,0.03), transparent)" }} {...sectionProps} variants={staggerContainer}>
      <div className="container split-intro">
        <div>
          <p className="eyebrow">Why nabome</p>
          <h2 className="heading">Trusted by thousands.</h2>
        </div>
        <p className="lede">Every aspect of the নবME experience is designed for confidence, convenience, and care.</p>
      </div>
      <motion.div className="container" variants={staggerContainer} style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 16,
      }}>
        {trustItems.map((item) => (
          <motion.div key={item.title} variants={staggerItem}>
            <motion.div
              whileHover={{ y: -2 }}
              style={{
                padding: 24,
                border: "1px solid var(--line)",
                borderRadius: 12,
                background: "var(--surface)",
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
              }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 12,
                background: "var(--gold-soft)",
                color: "var(--gold)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                {item.icon}
              </div>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: ".9rem", marginBottom: 4 }}>{item.title}</h3>
                <p style={{ color: "var(--muted)", fontSize: ".82rem", lineHeight: 1.6 }}>{item.description}</p>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
