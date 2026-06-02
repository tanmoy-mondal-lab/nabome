import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Send, ShoppingBag, Heart, User, HelpCircle, Truck, RefreshCw, RotateCcw, XCircle, FileText, Shield, Sparkles, MapPin, Package, Camera, ExternalLink } from "lucide-react";
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
    <footer className="footer">
      <section className="container footer-newsletter">
        <p className="eyebrow">Newsletter</p>
        <h2 className="heading">First access to drops.</h2>
        <div className="newsletter-form">
          <input className="field" type="email" placeholder="Email address" value={email} onChange={(event) => setEmail(event.target.value)} />
          <button className="premium-button" onClick={subscribe} style={{ gap: 8 }}>
            <Send size={16} /> Subscribe
          </button>
        </div>
      </section>

      <div className="container footer-grid">
        <div>
          <h2>
            <BrandWordmark size="footer" />
          </h2>
          <p className="lede">Premium Bengali streetwear crafted for modern everyday expression.</p>
          <div className="social-row">
            <a href="https://instagram.com/nabome.online" target="_blank" rel="noreferrer" aria-label="Instagram"><Camera size={18} /></a>
            <a href="https://www.facebook.com/share/1DbpYKWoZ1/" target="_blank" rel="noreferrer" aria-label="Facebook"><ExternalLink size={18} /></a>
            <a href="https://wa.me/919163854706" target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={18} /></a>
          </div>
        </div>
        <FooterColumn title="Shop" links={[["All Products", "/category"], ["New Arrivals", "/category?badge=new"], ["Wishlist", "/wishlist"], ["Cart", "/cart"]]} />
        <FooterColumn title="Company" links={[["About", "/about"], ["Contact", "/contact"], ["Track Order", "/order-tracking"], ["Profile", "/profile"]]} />
        <FooterColumn title="Help" links={[["FAQ", "/faq"], ["Shipping Policy", "/shipping-policy"], ["Return Policy", "/return-policy"], ["Refund Policy", "/refund-policy"], ["Cancellation Policy", "/cancellation-policy"]]} />
        <FooterColumn title="Legal" links={[["Privacy Policy", "/privacy-policy"], ["Terms & Conditions", "/terms"]]} />
      </div>

      <div className="container footer-bottom">
        <span>© 2026 নবME. All rights reserved.</span>
        <span className="bengali-footer-date">{bengaliDate}</span>
        <span>Premium Bengali streetwear for the modern everyday.</span>
      </div>
    </footer>
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
