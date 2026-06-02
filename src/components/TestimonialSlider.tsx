import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { staggerContainer, staggerItem, sectionProps } from "../lib/animations";

const testimonials = [
  { name: "Rohit S.", location: "Kolkata", rating: 5, text: "The quality of the fabric is unmatched. I've been wearing my নবME tee for months and it still feels new. The oversized fit is perfect.", avatar: "R", color: "#3498db" },
  { name: "Ananya D.", location: "Bangalore", rating: 5, text: "Finally a brand that understands modern Indian streetwear. The gold accents on black are so elegant. Got compliments the first day I wore it.", avatar: "A", color: "#e84393" },
  { name: "Arjun K.", location: "Mumbai", rating: 5, text: "WhatsApp ordering made it so easy. I sent my size and the order was confirmed in minutes. The delivery was faster than expected too.", avatar: "A", color: "#6c5ce7" },
  { name: "Priya M.", location: "Delhi", rating: 4, text: "Love the cultural touch in every piece. The Bengali typography on the tees is a conversation starter. More colors please!", avatar: "P", color: "#00b894" },
  { name: "Sneha R.", location: "Hyderabad", rating: 5, text: "The fabric quality is incredible for the price. It's rare to find streetwear that feels both premium and comfortable. My new favorite brand.", avatar: "S", color: "#e17055" },
];

export default function TestimonialSlider() {
  const [active, setActive] = useState(0);

  const prev = () => setActive((a) => (a === 0 ? testimonials.length - 1 : a - 1));
  const next = () => setActive((a) => (a === testimonials.length - 1 ? 0 : a + 1));

  return (
    <motion.section className="section" style={{ padding: "clamp(48px, 8vw, 80px) 0" }} {...sectionProps} variants={staggerContainer}>
      <div className="container split-intro">
        <div>
          <p className="eyebrow">Testimonials</p>
          <h2 className="heading">What our customers say.</h2>
        </div>
        <p className="lede">Real reviews from the নবME community — no filters, just honest feedback.</p>
      </div>
      <motion.div className="container" variants={staggerContainer} style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}>
        <motion.div variants={staggerItem} style={{ position: "relative", minHeight: 280 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              style={{
                padding: "40px 36px",
                border: "1px solid var(--line)",
                borderRadius: 20,
                background: "linear-gradient(160deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
                textAlign: "center",
              }}
            >
              <Quote size={32} style={{ color: "var(--gold)", opacity: 0.3, marginBottom: 16 }} />
              <p style={{ fontSize: "1.05rem", lineHeight: 1.8, color: "var(--text)", marginBottom: 20, fontStyle: "italic" }}>
                "{testimonials[active].text}"
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 16 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} style={{ color: "var(--gold)", fill: i < testimonials[active].rating ? "var(--gold)" : "none" }} />
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${testimonials[active].color}, ${testimonials[active].color}88)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: "1rem", color: "#fff",
                }}>
                  {testimonials[active].avatar}
                </div>
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontWeight: 700, fontSize: ".9rem" }}>{testimonials[active].name}</p>
                  <p style={{ color: "var(--muted)", fontSize: ".78rem" }}>{testimonials[active].location}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24 }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={prev}
              style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChevronLeft size={20} />
            </motion.button>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setActive(i)}
                  style={{
                    width: i === active ? 24 : 8, height: 8, borderRadius: 4,
                    border: "none", background: i === active ? "var(--gold)" : "var(--line)",
                    cursor: "pointer", transition: "all 0.3s",
                  }}
                />
              ))}
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={next}
              style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChevronRight size={20} />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
