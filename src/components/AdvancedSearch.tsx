import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, TrendingUp, Clock, ArrowRight, Loader2 } from "lucide-react";
import { getSearchSuggestions, getTrendingSearches, searchAdvancedProducts } from "../lib/mockProductData";
import type { SearchSuggestion, AdvancedProduct } from "../types/product";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AdvancedSearch({ open, onClose }: Props) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [results, setResults] = useState<AdvancedProduct[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("nabome-recent-searches") || "[]"); }
    catch { return []; }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setSuggestions([]);
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setSuggestions([]); setResults([]); return; }
    setLoading(true);
    const timer = setTimeout(() => {
      setSuggestions(getSearchSuggestions(query));
      setResults(searchAdvancedProducts(query).slice(0, 6));
      setLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  const saveSearch = (q: string) => {
    const updated = [q, ...recentSearches.filter((s) => s !== q)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem("nabome-recent-searches", JSON.stringify(updated));
  };

  const removeRecent = (q: string) => {
    const updated = recentSearches.filter((s) => s !== q);
    setRecentSearches(updated);
    localStorage.setItem("nabome-recent-searches", JSON.stringify(updated));
  };

  const handleSearch = (q: string) => {
    if (!q.trim()) return;
    saveSearch(q.trim());
    onClose();
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const trending = getTrendingSearches();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
            display: "flex", justifyContent: "center",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 740, marginTop: "8vh",
              background: "var(--surface)", borderRadius: "var(--radius-xl)",
              border: "1px solid var(--line)", overflow: "hidden",
              height: "fit-content", maxHeight: "80vh", display: "flex", flexDirection: "column",
              boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--line)", gap: 12 }}>
              <Search size={20} style={{ color: "var(--muted)", flexShrink: 0 }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearch(query); }}
                placeholder="Search products, categories, vendors..."
                style={{
                  flex: 1, border: "none", background: "transparent",
                  color: "var(--text)", fontSize: "1.05rem", outline: "none",
                }}
              />
              {loading && <Loader2 size={18} className="spin" style={{ color: "var(--gold)" }} />}
              <button onClick={onClose}
                style={{ width: 36, height: 36, border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "50%", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ flex: 1, overflow: "auto", padding: "8px 0" }}>
              {!query.trim() ? (
                <div>
                  {recentSearches.length > 0 && (
                    <div style={{ padding: "12px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <Clock size={14} style={{ color: "var(--muted)" }} />
                        <span style={{ fontSize: ".78rem", color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Recent Searches</span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {recentSearches.map((s) => (
                          <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "var(--surface-strong)", borderRadius: 20, fontSize: ".82rem", cursor: "pointer" }}
                            onClick={() => handleSearch(s)}>
                            {s}
                            <button onClick={(e) => { e.stopPropagation(); removeRecent(s); }}
                              style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: 0, display: "grid", placeItems: "center" }}>
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ padding: "12px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <TrendingUp size={14} style={{ color: "var(--muted)" }} />
                      <span style={{ fontSize: ".78rem", color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Trending Searches</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {trending.map((t) => (
                        <button key={t} onClick={() => { setQuery(t); handleSearch(t); }}
                          style={{ padding: "6px 14px", border: "1px solid var(--line)", background: "transparent", color: "var(--text)", cursor: "pointer", borderRadius: 20, fontSize: ".82rem" }}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {suggestions.length > 0 && (
                    <div style={{ padding: "4px 0" }}>
                      {suggestions.map((s, i) => (
                        <button key={`${s.type}-${i}`} onClick={() => handleSearch(s.label)}
                          style={{
                            display: "flex", alignItems: "center", gap: 12, width: "100%",
                            padding: "10px 20px", border: "none", background: "transparent",
                            color: "var(--text)", cursor: "pointer", fontSize: ".88rem",
                            textAlign: "left", transition: "background 0.1s",
                          }}>
                          {s.image && (
                            <div style={{ width: 36, height: 44, borderRadius: "var(--radius)", overflow: "hidden", flexShrink: 0, background: "var(--surface-strong)" }}>
                              <img src={s.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                          )}
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                            {s.type === "product" && <Search size={14} style={{ color: "var(--muted)", flexShrink: 0 }} />}
                            {s.type === "category" && <ArrowRight size={14} style={{ color: "var(--gold)", flexShrink: 0 }} />}
                            {s.type === "vendor" && <ArrowRight size={14} style={{ color: "var(--gold)", flexShrink: 0 }} />}
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.label}</span>
                          </div>
                          <span style={{ fontSize: ".7rem", color: "var(--muted)", textTransform: "capitalize", flexShrink: 0 }}>{s.type}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {results.length > 0 && (
                    <div style={{ padding: "8px 20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <span style={{ fontSize: ".78rem", color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Products</span>
                        <button onClick={() => handleSearch(query)}
                          style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "var(--gold)", cursor: "pointer", fontSize: ".8rem" }}>
                          See all <ArrowRight size={14} />
                        </button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
                        {results.map((p) => (
                          <Link key={p.id} to={`/product/${p.id}`} onClick={onClose}
                            style={{ textDecoration: "none", color: "inherit" }}>
                            <div style={{ borderRadius: "var(--radius)", overflow: "hidden", background: "var(--surface-strong)", aspectRatio: "3/4" }}>
                              <img src={p.images[0]?.url || ""} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                            <p style={{ fontSize: ".78rem", fontWeight: 500, marginTop: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                            <p style={{ fontSize: ".78rem", color: "var(--gold)", fontWeight: 600 }}>₹{p.defaultPrice.toLocaleString("en-IN")}</p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {query.trim() && suggestions.length === 0 && results.length === 0 && !loading && (
                    <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
                      <Search size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
                      <p>No results found for "{query}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ padding: "10px 20px", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", fontSize: ".72rem", color: "var(--muted)" }}>
              <span>Press <kbd style={kbdStyle}>Esc</kbd> to close</span>
              <span>Press <kbd style={kbdStyle}>Enter</kbd> to search</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const kbdStyle: React.CSSProperties = {
  padding: "2px 6px", background: "var(--surface-strong)",
  borderRadius: 4, border: "1px solid var(--line)",
  fontSize: ".72rem", fontFamily: "inherit",
};
