import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Scale, Trash2, ArrowRight } from "lucide-react";
import { getCompareList, removeFromCompare, clearCompare } from "../lib/mockProductData";
import type { CompareProduct } from "../types/product";

export default function CompareDrawer() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CompareProduct[]>([]);

  const refresh = () => setItems(getCompareList());

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("storage", handler);
    window.addEventListener("compare-updated", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("compare-updated", handler);
    };
  }, []);

  const handleRemove = (id: string) => {
    removeFromCompare(id);
    refresh();
    window.dispatchEvent(new Event("compare-updated"));
  };

  const handleClear = () => {
    clearCompare();
    refresh();
    window.dispatchEvent(new Event("compare-updated"));
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed", right: 24, bottom: 100, zIndex: 999,
          width: 52, height: 52, borderRadius: "50%",
          background: "var(--gold)", color: "#050505",
          border: "none", cursor: "pointer", display: "grid",
          placeItems: "center", boxShadow: "0 4px 20px rgba(212,175,55,0.3)",
        }}
        title="Compare Products"
      >
        <Scale size={20} />
        {items.length > 0 && (
          <span style={{
            position: "absolute", top: -4, right: -4,
            background: "#050505", color: "var(--gold)",
            width: 22, height: 22, borderRadius: "50%",
            fontSize: ".7rem", fontWeight: 700,
            display: "grid", placeItems: "center",
            border: "2px solid var(--gold)",
          }}>
            {items.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            style={{
              position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 9999,
              width: Math.min(480, window.innerWidth - 24),
              background: "var(--surface)", borderLeft: "1px solid var(--line)",
              display: "flex", flexDirection: "column", boxShadow: "-8px 0 40px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "20px 24px", borderBottom: "1px solid var(--line)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Scale size={20} style={{ color: "var(--gold)" }} />
                <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Compare ({items.length}/4)</h2>
              </div>
              <button onClick={() => setOpen(false)}
                style={{ width: 36, height: 36, border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "50%", display: "grid", placeItems: "center" }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
              {items.length === 0 ? (
                <div style={{ textAlign: "center", padding: 48, color: "var(--muted)" }}>
                  <Scale size={40} style={{ opacity: 0.3, marginBottom: 16 }} />
                  <p>No products to compare.</p>
                  <p style={{ fontSize: ".82rem", marginTop: 4 }}>Add up to 4 products to compare side by side.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {items.map((item) => (
                    <div key={item.id} style={{
                      display: "flex", gap: 12, padding: 12,
                      borderRadius: "var(--radius)", border: "1px solid var(--line)",
                    }}>
                      <div style={{ width: 64, height: 80, borderRadius: "var(--radius)", overflow: "hidden", flexShrink: 0, background: "var(--surface-strong)" }}>
                        <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: ".85rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</p>
                        <p style={{ fontSize: ".82rem", color: "var(--gold)", fontWeight: 600, marginTop: 4 }}>₹{item.price.toLocaleString("en-IN")}</p>
                        <p style={{ fontSize: ".75rem", color: "var(--muted)", marginTop: 2 }}>{item.brand} · {item.vendor}</p>
                      </div>
                      <button onClick={() => handleRemove(item.id)}
                        style={{ width: 32, height: 32, border: "1px solid var(--line)", background: "transparent", color: "#e74c3c", cursor: "pointer", borderRadius: "var(--radius)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--line)", display: "flex", gap: 12 }}>
              {items.length > 0 && (
                <>
                  <button onClick={handleClear} style={{
                    flex: 1, padding: "12px", border: "1px solid var(--line)",
                    background: "transparent", color: "var(--muted)", cursor: "pointer",
                    borderRadius: "var(--radius)", fontSize: ".82rem",
                  }}>
                    Clear All
                  </button>
                  <Link to="/compare" onClick={() => setOpen(false)}
                    style={{
                      flex: 1, padding: "12px", border: "none",
                      background: "var(--gold)", color: "#050505", cursor: "pointer",
                      borderRadius: "var(--radius)", fontSize: ".82rem", fontWeight: 600,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      textDecoration: "none",
                    }}>
                    Compare <ArrowRight size={16} />
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
