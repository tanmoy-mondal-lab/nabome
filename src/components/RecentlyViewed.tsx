import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, X, Trash2 } from "lucide-react";
import { getRecentlyViewed, removeFromRecentlyViewed, clearRecentlyViewed } from "../lib/mockProductData";
import type { AdvancedProduct } from "../types/product";

export default function RecentlyViewed() {
  const [items, setItems] = useState<AdvancedProduct[]>([]);

  const refresh = () => setItems(getRecentlyViewed());

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("storage", handler);
    window.addEventListener("rv-updated", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("rv-updated", handler);
    };
  }, []);

  const handleRemove = (id: string) => {
    removeFromRecentlyViewed(id);
    refresh();
    window.dispatchEvent(new Event("rv-updated"));
  };

  const handleClear = () => {
    clearRecentlyViewed();
    refresh();
    window.dispatchEvent(new Event("rv-updated"));
  };

  if (items.length === 0) return null;

  return (
    <section className="section">
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Clock size={20} style={{ color: "var(--gold)" }} />
            <div>
              <p className="eyebrow" style={{ margin: 0 }}>Continue Browsing</p>
              <h2 className="heading" style={{ marginTop: 2 }}>Recently Viewed</h2>
            </div>
          </div>
          <button onClick={handleClear}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".78rem" }}>
            <Trash2 size={14} /> Clear
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              style={{ position: "relative" }}
            >
              <Link to={`/product/${item.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{
                  borderRadius: "var(--radius-lg)", overflow: "hidden",
                  background: "var(--surface-strong)", aspectRatio: "3/4",
                }}>
                  <img
                    src={item.images[0]?.url || ""}
                    alt={item.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    loading="lazy"
                  />
                </div>
                <p style={{ fontSize: ".82rem", fontWeight: 500, marginTop: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.name}
                </p>
                <p style={{ fontSize: ".85rem", fontWeight: 600, color: "var(--gold)", marginTop: 2 }}>
                  ₹{item.defaultPrice.toLocaleString("en-IN")}
                </p>
              </Link>
              <button
                onClick={() => handleRemove(item.id)}
                style={{
                  position: "absolute", top: 6, right: 6,
                  width: 28, height: 28, borderRadius: "50%",
                  border: "none", background: "rgba(0,0,0,0.5)",
                  color: "#fff", cursor: "pointer", display: "grid",
                  placeItems: "center", backdropFilter: "blur(4px)",
                  opacity: 0, transition: "opacity 0.2s",
                }}
                className="rv-remove"
              >
                <X size={12} />
              </button>
              <style>{`
                .rv-remove { opacity: 0; }
                .${item.id.replace(/[^a-zA-Z0-9]/g, "")}:hover .rv-remove { opacity: 1; }
              `}</style>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
