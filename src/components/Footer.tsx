import { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "./Toast";

export default function Footer() {
  const [email, setEmail] = useState("");
  const { showToast } = useToast();

  const subscribe = () => {
    if (!email.includes("@")) {
      showToast("Enter a valid email for the NABOME list");
      return;
    }
    const subscribers = JSON.parse(localStorage.getItem("nabome-newsletter") || "[]") as string[];
    localStorage.setItem("nabome-newsletter", JSON.stringify([...new Set([...subscribers, email])]));
    setEmail("");
    showToast("You are on the NABOME list");
  };

  return (
    <footer className="footer">
      <section className="container footer-newsletter">
        <p className="eyebrow">Newsletter</p>
        <h2 className="heading">First access to drops.</h2>
        <div className="newsletter-form">
          <input className="field" type="email" placeholder="Email address" value={email} onChange={(event) => setEmail(event.target.value)} />
          <button className="premium-button" onClick={subscribe}>
            Subscribe
          </button>
        </div>
      </section>

      <div className="container footer-grid">
        <div>
          <h2>NABOME</h2>
          <p className="lede">Premium Bengali streetwear crafted for modern everyday expression.</p>
          <div className="social-row">
            <a href="https://instagram.com/nabome.online" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://wa.me/919163854706" target="_blank" rel="noreferrer">WhatsApp</a>
          </div>
        </div>
        <FooterColumn title="Shop" links={[["All Products", "/category"], ["New Arrivals", "/category?badge=new"], ["Wishlist", "/wishlist"], ["Cart", "/cart"]]} />
        <FooterColumn title="Company" links={[["About", "/about"], ["Contact", "/contact"], ["Track Order", "/order-tracking"], ["Profile", "/profile"]]} />
        <FooterColumn title="Policies" links={[["Shipping Policy", "/shipping-policy"], ["Return Policy", "/return-policy"], ["Privacy Policy", "/privacy-policy"], ["Terms", "/terms"]]} />
      </div>

      <div className="container footer-bottom">
        <span>© 2026 NABOME. All rights reserved.</span>
        <span>Deployment ready for www.nabome.online</span>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div className="footer-column">
      <h3>{title}</h3>
      {links.map(([label, to]) => (
        <Link key={label} to={to}>
          {label}
        </Link>
      ))}
    </div>
  );
}
