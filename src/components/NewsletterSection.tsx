import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, CheckCircle } from "lucide-react";
import { useToast } from "./Toast";
import { staggerContainer, staggerItem, sectionProps } from "../lib/animations";

export default function NewsletterSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) { showToast("Please enter a valid email"); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubscribed(true);
    setLoading(false);
    showToast("Welcome to the নবME family!");
  };

  return (
    <motion.section className="section" style={{
      padding: "clamp(56px, 8vw, 100px) 0",
      background: "linear-gradient(180deg, transparent, rgba(212,175,55,0.06), rgba(212,175,55,0.03))",
      borderTop: "1px solid var(--line)",
      borderBottom: "1px solid var(--line)",
    }} {...sectionProps} variants={staggerContainer}>
      <motion.div className="container" variants={staggerContainer} style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
        <AnimatePresence mode="wait">
          {subscribed ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 12, delay: 0.1 }}
                style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: "var(--gold-soft)", border: "2px solid var(--gold)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <CheckCircle size={36} style={{ color: "var(--gold)" }} />
              </motion.div>
              <h2 className="heading" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", marginBottom: 12 }}>
                You're on the list!
              </h2>
              <p className="lede" style={{ margin: "0 auto" }}>
                Welcome to the নবME inner circle. You'll be the first to know about new drops, exclusive offers, and cultural stories.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <motion.div variants={staggerItem}>
                <Sparkles size={28} style={{ color: "var(--gold)", marginBottom: 16 }} />
                <p className="eyebrow">Stay Connected</p>
                <h2 className="heading" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", marginBottom: 12 }}>
                  First access to drops.
                </h2>
                <p className="lede" style={{ margin: "0 auto 28px" }}>
                  Join the নবME inner circle — get early access to new collections, limited editions, and cultural stories straight to your inbox.
                </p>
              </motion.div>
              <motion.form
                variants={staggerItem}
                onSubmit={handleSubmit}
                style={{
                  display: "flex",
                  gap: 10,
                  maxWidth: 500,
                  margin: "0 auto",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <div style={{ flex: 1, minWidth: 200, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      flex: 1, minWidth: 140,
                      padding: "14px 16px",
                      border: "1px solid var(--line)",
                      borderRadius: 8,
                      background: "var(--surface)",
                      color: "var(--text)",
                      outline: "none",
                      fontSize: ".9rem",
                    }}
                  />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      flex: 1, minWidth: 200,
                      padding: "14px 16px",
                      border: "1px solid var(--line)",
                      borderRadius: 8,
                      background: "var(--surface)",
                      color: "var(--text)",
                      outline: "none",
                      fontSize: ".9rem",
                    }}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="premium-button"
                  style={{ gap: 8, padding: "14px 24px", minHeight: 50 }}
                >
                  {loading ? "Sending..." : <><Send size={16} /> Subscribe</>}
                </motion.button>
              </motion.form>
              <motion.p variants={staggerItem} style={{ color: "var(--muted)", fontSize: ".78rem", marginTop: 16 }}>
                No spam. Unsubscribe anytime. We respect your inbox.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.section>
  );
}
