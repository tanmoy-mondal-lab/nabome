import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { X, Scale, Trash2, Star, Check } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import { getCompareList, removeFromCompare, clearCompare } from "../lib/mockProductData";
import type { CompareProduct } from "../types/product";

const rowLabels: { key: keyof CompareProduct; label: string }[] = [
  { key: "price", label: "Price" },
  { key: "rating", label: "Rating" },
  { key: "reviewCount", label: "Reviews" },
  { key: "brand", label: "Brand" },
  { key: "material", label: "Material" },
  { key: "vendor", label: "Vendor" },
  { key: "category", label: "Category" },
  { key: "sizes", label: "Sizes" },
  { key: "colors", label: "Colors" },
  { key: "availability", label: "Availability" },
];

function CompareValue({ item, field }: { item: CompareProduct; field: keyof CompareProduct }) {
  const val = item[field];
  if (field === "price") {
    const originalPrice = item.originalPrice;
    const discount = Math.round(((originalPrice - (val as number)) / originalPrice) * 100);
    return (
      <div>
        <strong style={{ color: "var(--gold)", fontSize: "1.1rem" }}>₹{(val as number).toLocaleString("en-IN")}</strong>
        {originalPrice > (val as number) && (
          <div style={{ fontSize: ".78rem", color: "var(--muted)", textDecoration: "line-through" }}>
            ₹{originalPrice.toLocaleString("en-IN")}
          </div>
        )}
        {discount > 0 && <span style={{ fontSize: ".72rem", color: "#e74c3c" }}>-{discount}%</span>}
      </div>
    );
  }

  if (field === "rating") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <Star size={14} fill="var(--gold)" color="var(--gold)" />
        <span style={{ fontWeight: 600 }}>{(val as number).toFixed(1)}</span>
      </div>
    );
  }

  if (field === "sizes") return <span style={{ fontSize: ".82rem" }}>{(val as string[]).join(", ")}</span>;
  if (field === "colors") return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {(val as string[]).map((c, i) => (
        <span key={i} style={{
          display: "inline-block", width: 20, height: 20, borderRadius: "50%",
          background: c.toLowerCase(), border: "1px solid var(--line)",
        }} title={c} />
      ))}
    </div>
  );

  if (field === "availability") {
    return val ? (
      <span style={{ color: "#2ecc71", display: "flex", alignItems: "center", gap: 4, fontSize: ".85rem" }}>
        <Check size={14} /> In Stock
      </span>
    ) : (
      <span style={{ color: "#e74c3c", display: "flex", alignItems: "center", gap: 4, fontSize: ".85rem" }}>
        <X size={14} /> Out of Stock
      </span>
    );
  }

  return <span style={{ fontSize: ".85rem" }}>{String(val)}</span>;
}

export default function ComparePage() {
  const [items, setItems] = useState<CompareProduct[]>([]);

  const refresh = () => setItems(getCompareList());

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("compare-updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("compare-updated", handler);
      window.removeEventListener("storage", handler);
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
      <SEO title="Compare Products | নবME" description="Compare your favorite products side by side." />
      <Navbar />
      <main className="page">
        <div className="container" style={{ paddingTop: 40 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Scale size={28} style={{ color: "var(--gold)" }} />
              <div>
                <p className="eyebrow" style={{ margin: 0 }}>Product Comparison</p>
                <h1 style={{ fontSize: "1.6rem", fontWeight: 300, marginTop: 2 }}>Compare Products</h1>
              </div>
            </div>
            {items.length > 0 && (
              <button onClick={handleClear}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".82rem" }}>
                <Trash2 size={14} /> Clear All
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="glass" style={{ padding: 60, textAlign: "center", borderRadius: "var(--radius-xl)" }}>
              <Scale size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
              <h2 style={{ fontSize: "1.2rem", fontWeight: 400, marginBottom: 8 }}>No products to compare</h2>
              <p style={{ color: "var(--muted)", marginBottom: 20 }}>Add up to 4 products to compare them side by side.</p>
              <Link to="/category" className="premium-button" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", textDecoration: "none" }}>
                Browse Products
              </Link>
            </div>
          ) : (
            <div style={{ overflowX: "auto", paddingBottom: 40 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: items.length * 220 + 160 }}>
                <thead>
                  <tr>
                    <th style={{ width: 140, padding: 12, textAlign: "left", borderBottom: "1px solid var(--line)", color: "var(--muted)", fontSize: ".82rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Feature
                    </th>
                    {items.map((item) => (
                      <th key={item.id} style={{ padding: 12, textAlign: "center", borderBottom: "1px solid var(--line)", minWidth: 200 }}>
                        <div style={{ position: "relative" }}>
                          <Link to={`/product/${item.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                            <div style={{ width: "100%", aspectRatio: "3/4", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "var(--surface-strong)", marginBottom: 8 }}>
                              <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                            <p style={{ fontWeight: 600, fontSize: ".85rem" }}>{item.name}</p>
                          </Link>
                          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 8 }}>
                            <Link to={`/product/${item.id}`} className="premium-button" style={{ fontSize: ".72rem", padding: "6px 12px", textDecoration: "none" }}>
                              View Details
                            </Link>
                            <button onClick={() => handleRemove(item.id)}
                              style={{ padding: "6px 10px", border: "1px solid var(--line)", background: "transparent", color: "#e74c3c", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".72rem" }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rowLabels.map((row, ri) => (
                    <motion.tr
                      key={row.key}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: ri * 0.03 }}
                      style={{ borderBottom: "1px solid var(--line)" }}
                    >
                      <td style={{ padding: "14px 12px", fontWeight: 600, fontSize: ".82rem", color: "var(--muted)" }}>
                        {row.label}
                      </td>
                      {items.map((item, ci) => {
                        const values = items.map((it) => {
                          const v = it[row.key];
                          if (row.key === "sizes") return (v as string[]).length;
                          if (row.key === "colors") return (v as string[]).length;
                          if (row.key === "availability") return v ? 1 : 0;
                          return typeof v === "number" ? v : 0;
                        });
                        const best = Math.max(...values);
                        const isBest = row.key === "price"
                          ? values[ci] === Math.min(...values)
                          : row.key === "rating" || row.key === "reviewCount" || row.key === "availability"
                            ? values[ci] === best
                            : false;

                        return (
                          <td key={item.id} style={{
                            padding: "14px 12px", textAlign: "center",
                            background: isBest ? "rgba(212,175,55,0.05)" : "transparent",
                          }}>
                            {isBest && row.key !== "sizes" && row.key !== "colors" && row.key !== "brand" && row.key !== "material" && row.key !== "vendor" && row.key !== "category" && (
                              <div style={{ fontSize: ".7rem", color: "var(--gold)", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Best</div>
                            )}
                            <CompareValue item={item} field={row.key as keyof CompareProduct} />
                          </td>
                        );
                      })}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
