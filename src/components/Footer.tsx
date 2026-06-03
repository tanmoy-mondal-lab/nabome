import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MessageCircle, Send, ShoppingBag, Heart, User, HelpCircle, Truck, RefreshCw, RotateCcw, XCircle, FileText, Shield, Sparkles, MapPin, Package, Camera, ExternalLink, CreditCard, BadgeCheck } from "lucide-react";
import BrandWordmark from "./BrandWordmark";
import { useToast } from "./Toast";
import { subscribeNewsletter } from "../lib/db";

const iconMap: Record<string, React.ReactNode> = {
  "All Products": <ShoppingBag size={14} />,
  "New Arrivals": <Sparkles size={14} />,
  Wishlist: <Heart size={14} />,
  Cart: <ShoppingBag size={14} />,
  About: <User size={14} />,
  Contact: <MapPin size={14} />,
  "Track Order": <Package size={14} />,
  Profile: <User size={14} />,
  FAQ: <HelpCircle size={14} />,
  "Shipping Policy": <Truck size={14} />,
  "Return Policy": <RefreshCw size={14} />,
  "Refund Policy": <RotateCcw size={14} />,
  "Cancellation Policy": <XCircle size={14} />,
  "Privacy Policy": <Shield size={14} />,
  "Terms & Conditions": <FileText size={14} />,
};

function getBengaliDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const bengaliYear = year - 593;
  const months = [
    "বৈশাখ", "জ্যৈষ্ঠ", "আষাঢ়", "শ্রাবণ",
    "ভাদ্র", "আশ্বিন", "কার্তিক", "অগ্রহায়ণ",
    "পৌষ", "মাঘ", "ফাল্গুন", "চৈত্র",
  ];
  const bengaliMonth = months[now.getMonth()];
  return `${bengaliMonth} ${bengaliYear}`;
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const { showToast } = useToast();
  const bengaliDate = useMemo(() => getBengaliDate(), []);

  const subscribe = async () => {
    if (!email.includes("@")) {
      showToast("Enter a valid email for the নবME list");
      return;
    }

    const result = await subscribeNewsletter(email);

    if (result === "ok" || result === "duplicate") {
      setEmail("");
      showToast("You are on the নবME list");
    } else if (result === "local") {
      const subscribers = JSON.parse(localStorage.getItem("nabome-newsletter") || "[]") as string[];
      localStorage.setItem("nabome-newsletter", JSON.stringify([...new Set([...subscribers, email])]));
      setEmail("");
      showToast("You are on the নবME list");
    } else {
      showToast("Could not subscribe. Try later.");
    }
  };

  return (
    <motion.footer
      className="footer"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {/* Premium border accent */}
      <div style={{ height: 2, background: "linear-gradient(90deg, transparent, var(--gold), var(--gold), transparent)", opacity: 0.5 }} />

      <section className="container footer-newsletter">
        <motion.p className="eyebrow" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>Stay in the Loop</motion.p>
        <motion.h2 className="heading" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 }}>
          First access to drops.
        </motion.h2>
        <motion.div className="newsletter-form" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
          <input className="field" type="email" placeholder="Email address" value={email} onChange={(event) => setEmail(event.target.value)} />
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="premium-button" onClick={subscribe} style={{ gap: 8 }}>
            <Send size={16} /> Subscribe
          </motion.button>
        </motion.div>
      </section>

      <div className="container footer-grid">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2>
            <BrandWordmark size="footer" />
          </h2>
          <p className="lede" style={{ marginTop: 12, lineHeight: 1.7 }}>Premium Bengali streetwear crafted for modern everyday expression. Heavyweight fabrics, controlled silhouettes, gold-on-black restraint.</p>

          {/* Trust badges */}
          <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--muted)", fontSize: ".75rem" }}>
              <BadgeCheck size={14} style={{ color: "var(--gold)" }} /> Verified
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--muted)", fontSize: ".75rem" }}>
              <CreditCard size={14} style={{ color: "var(--gold)" }} /> Secure
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--muted)", fontSize: ".75rem" }}>
              <Truck size={14} style={{ color: "var(--gold)" }} /> Free shipping
            </span>
          </div>

          <div className="social-row">
            <motion.a whileHover={{ y: -2, color: "var(--gold)" }} href="https://instagram.com/nabome.online" target="_blank" rel="noreferrer" aria-label="Instagram"><Camera size={18} /></motion.a>
            <motion.a whileHover={{ y: -2, color: "var(--gold)" }} href="https://www.facebook.com/share/1DbpYKWoZ1/" target="_blank" rel="noreferrer" aria-label="Facebook"><ExternalLink size={18} /></motion.a>
            <motion.a whileHover={{ y: -2, color: "var(--gold)" }} href="https://wa.me/919163854706" target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={18} /></motion.a>
          </div>
        </motion.div>
        <FooterColumn title="Shop" links={[["All Products", "/category"], ["New Arrivals", "/category?badge=new"], ["Wishlist", "/wishlist"], ["Cart", "/cart"]]} />
        <FooterColumn title="Company" links={[["About", "/about"], ["Contact", "/contact"], ["Track Order", "/order-tracking"], ["Profile", "/account?tab=profile"]]} />
        <FooterColumn title="Help" links={[["FAQ", "/faq"], ["Shipping Policy", "/shipping-policy"], ["Return Policy", "/return-policy"], ["Refund Policy", "/refund-policy"], ["Cancellation Policy", "/cancellation-policy"]]} />
        <FooterColumn title="Legal" links={[["Privacy Policy", "/privacy-policy"], ["Terms & Conditions", "/terms"]]} />
      </div>

      <div className="container footer-bottom">
        <span>© 2026 নবME. All rights reserved.</span>
        <span className="bengali-footer-date">{bengaliDate}</span>
        <span>Premium Bengali streetwear for the modern everyday.</span>
      </div>
    </motion.footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div className="footer-column">
      <h3>{title}</h3>
      {links.map(([label, to]) => (
        <Link key={label} to={to} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {iconMap[label] || null}
          {label}
        </Link>
      ))}
    </div>
  );
}
