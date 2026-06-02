import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HelpCircle, MessageSquare, Package, CreditCard,
  RotateCcw, ShoppingBag, Store, ChevronRight,
  Search, Phone, Mail, MessageCircle,
  ArrowRight, ExternalLink,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import { generateMockFAQs } from "../lib/mockOrderData";
import { useToast } from "../components/Toast";

const supportOptions = [
  { icon: <Package size={22} />, title: "Track Order", desc: "Check your order status", link: "/order-tracking" },
  { icon: <RotateCcw size={22} />, title: "Returns & Exchanges", desc: "Initiate a return", link: "/return-policy" },
  { icon: <ShoppingBag size={22} />, title: "Shipping Info", desc: "Delivery policies", link: "/shipping-policy" },
  { icon: <CreditCard size={22} />, title: "Payments", desc: "Payment methods & issues", link: "/faq" },
  { icon: <Store size={22} />, title: "Vendor Support", desc: "For our sellers", link: "/faq#vendor" },
  { icon: <MessageSquare size={22} />, title: "Contact Us", desc: "Get in touch", link: "/contact" },
];

const categories = ["All", "Orders", "Shipping", "Returns", "Payments", "Products", "Vendor", "Account"];

export default function SupportCenter() {
  const { showToast } = useToast();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState({ subject: "", message: "", category: "order" as string });

  const faqs = useMemo(() => generateMockFAQs(), []);
  const filteredFaqs = faqs.filter((faq) => {
    if (activeCategory !== "All" && faq.category !== activeCategory) return false;
    if (searchQuery && !faq.question.toLowerCase().includes(searchQuery.toLowerCase()) && !faq.answer.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const categoriesWithCount = categories.map((cat) => ({
    name: cat,
    count: cat === "All" ? faqs.length : faqs.filter((f) => f.category === cat).length,
  }));

  const handleSubmitTicket = () => {
    if (!ticketForm.subject.trim() || !ticketForm.message.trim()) {
      showToast("Please fill in all fields"); return;
    }
    showToast("Support ticket submitted! We'll get back to you within 24 hours.");
    setTicketOpen(false);
    setTicketForm({ subject: "", message: "", category: "order" });
  };

  const containerS: React.CSSProperties = {
    maxWidth: 1200, margin: "0 auto", padding: "0 6%",
  };

  return (
    <>
      <SEO title="Help Center | নবME" description="Get support for your নবME orders, returns, payments and more." />
      <Navbar />
      <main>
        {/* Hero */}
        <section style={{ padding: "100px 6% 60px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
            <p className="eyebrow" style={{ margin: 0 }}>Help & Support</p>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 300, marginTop: 12, lineHeight: 1.1 }}>
              How can we help you?
            </h1>
            <div style={{ maxWidth: 560, margin: "28px auto 0", position: "relative" }}>
              <Search size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search FAQs, topics, questions..."
                style={{
                  width: "100%", padding: "16px 16px 16px 48px",
                  border: "1px solid var(--line)", background: "var(--surface)",
                  color: "var(--text)", borderRadius: "var(--radius-xl)",
                  fontSize: "1rem", outline: "none",
                }}
              />
            </div>
          </div>
        </section>

        {/* Quick Support Options */}
        <section style={{ padding: "40px 6%", borderBottom: "1px solid var(--line)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
              {supportOptions.map((opt, i) => (
                <Link key={opt.title} to={opt.link}
                  style={{ textDecoration: "none", color: "inherit" }}>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="glass"
                    style={{
                      padding: "20px 16px", borderRadius: "var(--radius-lg)", textAlign: "center",
                      cursor: "pointer", height: "100%",
                    }}>
                    <div style={{ color: "var(--gold)", marginBottom: 10 }}>{opt.icon}</div>
                    <h3 style={{ fontWeight: 600, fontSize: ".85rem" }}>{opt.title}</h3>
                    <p style={{ color: "var(--muted)", fontSize: ".75rem", marginTop: 4 }}>{opt.desc}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section style={{ padding: "60px 6%" }}>
          <div style={containerS}>
            <div className="split-intro" style={{ marginBottom: 32 }}>
              <div>
                <p className="eyebrow" style={{ margin: 0 }}>Frequently Asked Questions</p>
                <h2 className="heading" style={{ marginTop: 2 }}>Quick answers</h2>
              </div>
              <Link to="/faq" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--gold)", textDecoration: "none", fontSize: ".85rem", fontWeight: 500 }}>
                View All <ArrowRight size={16} />
              </Link>
            </div>

            {/* Category Filters */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
              {categoriesWithCount.map((cat) => (
                <button key={cat.name} onClick={() => setActiveCategory(cat.name)}
                  style={{
                    padding: "8px 16px", borderRadius: 20, fontSize: ".8rem",
                    border: `1px solid ${activeCategory === cat.name ? "var(--gold)" : "var(--line)"}`,
                    background: activeCategory === cat.name ? "var(--gold-soft)" : "transparent",
                    color: activeCategory === cat.name ? "var(--gold)" : "var(--muted)",
                    cursor: "pointer", fontWeight: activeCategory === cat.name ? 600 : 400,
                  }}>
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>

            {/* FAQ Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredFaqs.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
                  <Search size={28} style={{ opacity: 0.3, marginBottom: 12 }} />
                  <p>No FAQs found for "{searchQuery}"</p>
                </div>
              ) : (
                filteredFaqs.slice(0, 6).map((faq) => (
                  <details key={faq.id} style={{
                    border: "1px solid var(--line)", borderRadius: "var(--radius-lg)",
                    overflow: "hidden", background: "var(--surface)",
                  }}>
                    <summary style={{
                      padding: "16px 20px", cursor: "pointer", fontWeight: 600,
                      fontSize: ".9rem", display: "flex", alignItems: "center", gap: 10,
                      listStyle: "none",
                    }}>
                      <HelpCircle size={16} style={{ color: "var(--gold)", flexShrink: 0 }} />
                      {faq.question}
                      <ChevronRight size={16} style={{ marginLeft: "auto", color: "var(--muted)", transition: "transform 0.2s" }} />
                    </summary>
                    <div style={{ padding: "4px 20px 16px 46px", color: "var(--muted)", fontSize: ".88rem", lineHeight: 1.7 }}>
                      {faq.answer}
                    </div>
                  </details>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Contact Channels */}
        <section style={{ padding: "60px 6%", background: "var(--surface)" }}>
          <div style={containerS}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <p className="eyebrow" style={{ margin: 0 }}>Still Need Help?</p>
              <h2 className="heading" style={{ marginTop: 2 }}>Contact Us Directly</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
              {[
                { icon: <MessageCircle size={24} />, title: "WhatsApp", desc: "Quick support via chat", action: "Chat Now", href: "https://wa.me/919163854706" },
                { icon: <Mail size={24} />, title: "Email", desc: "We reply within 24hrs", action: "Send Email", href: "mailto:support@nabome.online" },
                { icon: <Phone size={24} />, title: "Phone", desc: "Mon-Sat, 10AM-7PM", action: "Call Us", href: "tel:+919163854706" },
              ].map((channel, i) => (
                <motion.a key={channel.title} href={channel.href} target="_blank" rel="noreferrer"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="glass"
                  style={{
                    padding: 28, borderRadius: "var(--radius-xl)", textDecoration: "none",
                    color: "inherit", textAlign: "center", display: "block",
                  }}>
                  <div style={{ color: "var(--gold)", marginBottom: 12 }}>{channel.icon}</div>
                  <h3 style={{ fontWeight: 600, fontSize: "1rem" }}>{channel.title}</h3>
                  <p style={{ color: "var(--muted)", fontSize: ".85rem", marginTop: 6 }}>{channel.desc}</p>
                  <span style={{ color: "var(--gold)", fontSize: ".85rem", fontWeight: 600, marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6 }}>
                    {channel.action} <ExternalLink size={14} />
                  </span>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* Submit Ticket */}
        <section style={{ padding: "60px 6%" }}>
          <div style={{ ...containerS, textAlign: "center" }}>
            {!ticketOpen ? (
              <div>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 400, marginBottom: 8 }}>Submit a Support Ticket</h2>
                <p style={{ color: "var(--muted)", marginBottom: 20 }}>Get personalized help from our support team</p>
                <button onClick={() => setTicketOpen(true)} className="premium-button" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px" }}>
                  <MessageSquare size={18} /> Open a Ticket
                </button>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass" style={{ padding: 32, borderRadius: "var(--radius-xl)", maxWidth: 560, margin: "0 auto", textAlign: "left" }}>
                <h3 style={{ fontWeight: 600, fontSize: "1rem", marginBottom: 20 }}>Submit a Ticket</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <select value={ticketForm.category} onChange={(e) => setTicketForm((f) => ({ ...f, category: e.target.value }))}
                    style={{ width: "100%", padding: "12px 16px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", borderRadius: "var(--radius)", fontSize: ".9rem", outline: "none" }}>
                    <option value="order">Order Issue</option>
                    <option value="payment">Payment Issue</option>
                    <option value="return">Return Issue</option>
                    <option value="product">Product Issue</option>
                    <option value="vendor">Vendor Issue</option>
                    <option value="other">Other</option>
                  </select>
                  <input type="text" value={ticketForm.subject} onChange={(e) => setTicketForm((f) => ({ ...f, subject: e.target.value }))}
                    placeholder="Subject" style={{ width: "100%", padding: "12px 16px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", borderRadius: "var(--radius)", fontSize: ".9rem", outline: "none" }} />
                  <textarea rows={4} value={ticketForm.message} onChange={(e) => setTicketForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder="Describe your issue in detail..." style={{ width: "100%", padding: "12px 16px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", borderRadius: "var(--radius)", fontSize: ".9rem", outline: "none", resize: "vertical" }} />
                  <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={handleSubmitTicket} className="premium-button" style={{ flex: 1, minHeight: 44 }}>Submit Ticket</button>
                    <button onClick={() => setTicketOpen(false)} style={{ padding: "0 20px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".85rem" }}>Cancel</button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
