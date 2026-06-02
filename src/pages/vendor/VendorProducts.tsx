import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit2, Trash2, Copy, Package, AlertCircle, XCircle, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import { generateMockProducts } from "../../lib/mockVendorData";
import type { VendorProduct, VendorTab, ProductStatus } from "../../types/vendor";

type Props = { onTab: (tab: VendorTab) => void; onEditProduct: (id: string) => void };

const statusConfig: Record<ProductStatus, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "#95a5a6", bg: "#95a5a618" },
  pending_approval: { label: "Pending", color: "#f39c12", bg: "#f39c1218" },
  published: { label: "Published", color: "#2ecc71", bg: "#2ecc7118" },
  rejected: { label: "Rejected", color: "#e74c3c", bg: "#e74c3c18" },
  soft_deleted: { label: "Trash", color: "#e74c3c", bg: "#e74c3c18" },
};

const statusIcon: Record<ProductStatus, React.ReactNode> = {
  draft: <Clock size={14} />,
  pending_approval: <AlertCircle size={14} />,
  published: <CheckCircle size={14} />,
  rejected: <XCircle size={14} />,
  soft_deleted: <Trash2 size={14} />,
};

export default function VendorProducts({ onTab, onEditProduct }: Props) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ProductStatus | "all">("all");

  useEffect(() => {
    if (user) setProducts(generateMockProducts(user.id));
  }, [user]);

  const filtered = products.filter((p) => {
    if (filter !== "all" && p.status !== filter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statusFilters: { key: ProductStatus | "all"; label: string }[] = [
    { key: "all", label: "All" },
    { key: "published", label: "Published" },
    { key: "draft", label: "Drafts" },
    { key: "pending_approval", label: "Pending" },
    { key: "rejected", label: "Rejected" },
    { key: "soft_deleted", label: "Trash" },
  ];

  const handleDuplicate = (product: VendorProduct) => {
    const newProd: VendorProduct = { ...product, id: `vp_dup_${Date.now()}`, name: `${product.name} (Copy)`, sku: `${product.sku}-CP`, status: "draft", createdAt: new Date().toISOString() };
    setProducts((prev) => [newProd, ...prev]);
    showToast("Product duplicated!");
  };

  const handleSoftDelete = (id: string) => {
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, status: "soft_deleted" as ProductStatus } : p));
    showToast("Product moved to trash. You can restore it from Trash.");
  };

  const chipS = (active: boolean): React.CSSProperties => ({
    padding: "8px 16px", border: `1px solid ${active ? "var(--gold)" : "var(--line)"}`,
    background: active ? "var(--gold-soft)" : "transparent",
    color: active ? "var(--gold)" : "var(--muted)", cursor: "pointer", borderRadius: 20,
    fontSize: ".78rem", fontWeight: active ? 700 : 500, whiteSpace: "nowrap",
    transition: "all var(--transition-fast)", display: "flex", alignItems: "center", gap: 6,
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 400, display: "flex", alignItems: "center", gap: 10 }}>
          <Package size={22} style={{ color: "var(--gold)" }} /> Products ({products.filter((p) => p.status !== "soft_deleted").length})
        </h1>
        <button onClick={() => onTab("products")} className="premium-button" style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 20px", fontSize: ".82rem" }}>
          <Plus size={14} /> Add Product
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {statusFilters.map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)} style={chipS(filter === key)}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ position: "relative", marginBottom: 24, maxWidth: 400 }}>
        <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
        <input type="search" placeholder="Search by name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "12px 14px 12px 42px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", borderRadius: "var(--radius)", fontSize: ".9rem", outline: "none" }}
        />
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--line)", color: "var(--muted)", fontSize: ".78rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <th style={{ padding: "12px 16px", textAlign: "left" }}>Product</th>
              <th style={{ padding: "12px 16px", textAlign: "left" }}>SKU</th>
              <th style={{ padding: "12px 16px", textAlign: "left" }}>Price</th>
              <th style={{ padding: "12px 16px", textAlign: "left" }}>Stock</th>
              <th style={{ padding: "12px 16px", textAlign: "left" }}>Status</th>
              <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}>No products found.</td>
              </tr>
            )}
            {filtered.map((product, i) => (
              <motion.tr key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                style={{ borderBottom: "1px solid var(--line)", verticalAlign: "middle" }}
              >
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: "var(--radius)", overflow: "hidden", flexShrink: 0, background: "var(--surface-strong)" }}>
                      <img src={product.mainImage} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 500, fontSize: ".85rem", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.name}</p>
                      <p style={{ color: "var(--muted)", fontSize: ".75rem" }}>{product.category}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "12px 16px", fontSize: ".82rem", color: "var(--muted)" }}>{product.sku}</td>
                <td style={{ padding: "12px 16px" }}>
                  <p style={{ fontWeight: 600, fontSize: ".9rem" }}>₹{product.price.toLocaleString("en-IN")}</p>
                  {product.discountPrice > 0 && <p style={{ color: "var(--muted)", fontSize: ".78rem", textDecoration: "line-through" }}>₹{product.discountPrice.toLocaleString("en-IN")}</p>}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ color: product.stockQuantity === 0 ? "#e74c3c" : product.stockQuantity < 15 ? "#f39c12" : "var(--text)", fontWeight: 500, fontSize: ".85rem" }}>
                    {product.stockQuantity}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px",
                    borderRadius: 12, fontSize: ".75rem", fontWeight: 600,
                    background: statusConfig[product.status].bg,
                    color: statusConfig[product.status].color,
                    border: `1px solid ${statusConfig[product.status].color}30`,
                  }}>
                    {statusIcon[product.status]}
                    {statusConfig[product.status].label}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    <button onClick={() => onEditProduct(product.id)} title="Edit"
                      style={{ width: 32, height: 32, border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", display: "grid", placeItems: "center" }}>
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDuplicate(product)} title="Duplicate"
                      style={{ width: 32, height: 32, border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", display: "grid", placeItems: "center" }}>
                      <Copy size={14} />
                    </button>
                    {product.status !== "soft_deleted" && (
                      <button onClick={() => handleSoftDelete(product.id)} title="Move to Trash"
                        style={{ width: 32, height: 32, border: "1px solid var(--line)", background: "transparent", color: "#e74c3c", cursor: "pointer", borderRadius: "var(--radius)", display: "grid", placeItems: "center" }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
