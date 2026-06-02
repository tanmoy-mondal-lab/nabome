import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Search, ChevronDown } from "lucide-react";
import Navbar from "../components/Navbar";
import SEO from "../components/SEO";
import { generateMockFAQs } from "../lib/mockOrderData";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const faqs = useMemo(() => generateMockFAQs(), []);

  const filteredFaqs = faqs.filter((faq) => {
    if (activeCategory !== "All" && faq.category !== activeCategory) return false;
    if (searchQuery && !faq.question.toLowerCase().includes(searchQuery.toLowerCase()) && !faq.answer.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const categories = useMemo(() => {
    const cats = ["All", ...new Set(faqs.map((f) => f.category))];
    return cats.map((cat) => ({
      key: cat,
      label: cat,
      count: cat === "All" ? faqs.length : faqs.filter((f) => f.category === cat).length,
    }));
  }, [faqs]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <SEO title="FAQ | নবME" description="Frequently asked questions about ordering, shipping, returns, payments and more at নবME." path="/faq" structuredData={structuredData} />
      <Navbar />
      <main className="page">
        <section className="section">
          <div className="container split-intro">
            <div>
              <p className="eyebrow">Help</p>
              <h1 className="display">Frequently Asked Questions</h1>
            </div>
            <p className="lede">
              Everything you need to know about ordering, shipping, returns, payments and more at নবME.
            </p>
          </div>

          {/* Search */}
          <div className="container" style={{ maxWidth: 760, marginBottom: 32 }}>
            <div style={{ position: "relative" }}>
              <Search size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
              <input
                type="search"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%", padding: "16px 16px 16px 48px",
                  border: "1px solid var(--line)", background: "var(--surface)",
                  color: "var(--text)", borderRadius: 12, fontSize: "1rem",
                  outline: "none", transition: "border-color 0.2s",
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--gold)"}
                onBlur={(e) => e.target.style.borderColor = "var(--line)"}
              />
            </div>
          </div>

          {/* Category filters */}
          <div className="container" style={{ maxWidth: 760, marginBottom: 28 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", overflowX: "auto" }}>
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => { setActiveCategory(cat.key); setOpenIndex(null); }}
                  style={{
                    padding: "8px 18px",
                    border: `1px solid ${activeCategory === cat.key ? "var(--gold)" : "var(--line)"}`,
                    background: activeCategory === cat.key ? "var(--gold-soft)" : "transparent",
                    color: activeCategory === cat.key ? "var(--gold)" : "var(--muted)",
                    cursor: "pointer", borderRadius: 20, fontSize: ".82rem",
                    fontWeight: activeCategory === cat.key ? 700 : 500,
                    whiteSpace: "nowrap",
                    transition: "all 0.2s",
                  }}
                >
                  {cat.label} ({cat.count})
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Items */}
          <div className="container" style={{ maxWidth: 760 }}>
            {filteredFaqs.length === 0 ? (
              <div style={{ textAlign: "center", padding: 48, color: "var(--muted)" }}>
                <HelpCircle size={48} style={{ margin: "0 auto 16px", opacity: 0.4 }} />
                <p>No FAQs found{searchQuery ? ` for "${searchQuery}"` : ""} in {activeCategory}.</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredFaqs.map((faq, i) => (
                  <motion.div
                    key={faq.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: i * 0.02 }}
                    style={{
                      marginBottom: 8,
                      borderRadius: 12,
                      border: `1px solid ${openIndex === i ? "var(--gold)" : "var(--line)"}`,
                      background: openIndex === i ? "var(--gold-soft)" : "var(--surface)",
                      overflow: "hidden",
                      transition: "border-color 0.2s, background 0.2s",
                    }}
                  >
                    <button
                      onClick={() => setOpenIndex(openIndex === i ? null : i)}
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 16,
                        padding: "18px 20px",
                        border: "none",
                        background: "transparent",
                        color: "var(--text)",
                        cursor: "pointer",
                        textAlign: "left",
                        fontSize: ".95rem",
                        fontWeight: openIndex === i ? 600 : 500,
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ color: "var(--gold)", fontSize: ".85rem" }}>{faq.category === "Orders" ? "🛍" : faq.category === "Shipping" ? "🚚" : faq.category === "Returns" ? "↩" : faq.category === "Payments" ? "💳" : faq.category === "Account" ? "👤" : faq.category === "Products" ? "👕" : faq.category === "Vendor" ? "🏪" : "❓"}</span>
                        {faq.question}
                      </span>
                      <motion.span
                        animate={{ rotate: openIndex === i ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ flexShrink: 0, color: "var(--gold)" }}
                      >
                        <ChevronDown size={18} />
                      </motion.span>
                    </button>
                    <AnimatePresence>
                      {openIndex === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ overflow: "hidden" }}
                        >
                          <div style={{
                            padding: "0 20px 18px",
                            color: "var(--muted)",
                            fontSize: ".9rem",
                            lineHeight: 1.7,
                            borderTop: "1px solid var(--line)",
                            marginTop: 0,
                            paddingTop: 16,
                          }}>
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
