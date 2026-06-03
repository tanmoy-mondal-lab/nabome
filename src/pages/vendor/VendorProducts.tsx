import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit2, Trash2, Copy, Package, AlertCircle, XCircle, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import { getVendorProductsList, softDeleteVendorProduct, duplicateVendorProduct } from "../../lib/api/products";
import { isNeonConnected } from "../../lib/neon";
import type { VendorProductListItem } from "../../lib/api/products";
import type { VendorTab } from "../../types/vendor";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/Pagination";

type Props = { onTab: (tab: VendorTab) => void; onEditProduct: (id: string) => void };

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "#95a5a6", bg: "#95a5a618" },
  pending_approval: { label: "Pending", color: "#f39c12", bg: "#f39c1218" },
  published: { label: "Published", color: "#2ecc71", bg: "#2ecc7118" },
  rejected: { label: "Rejected", color: "#e74c3c", bg: "#e74c3c18" },
  archived: { label: "Trash", color: "#e74c3c", bg: "#e74c3c18" },
};

const statusIcon: Record<string, React.ReactNode> = {
  draft: <Clock size={14} />,
  pending_approval: <AlertCircle size={14} />,
  published: <CheckCircle size={14} />,
  rejected: <XCircle size={14} />,
  archived: <Trash2 size={14} />,
};

export default function VendorProducts({ onTab, onEditProduct }: Props) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState<VendorProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const loadProducts = async () => {
    if (!user) return;
    if (!await isNeonConnected()) { setLoading(false); return; }
    try {
      const list = await getVendorProductsList(user.id);
      setProducts(list);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, [user]);

  const filtered = products.filter((p) => {
    if (filter !== "all" && p.status !== filter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const pag = usePagination(filtered, 12);

  const statusFilters: { key: string; label: string }[] = [
    { key: "all", label: "All" },
    { key: "published", label: "Published" },
    { key: "draft", label: "Drafts" },
    { key: "pending_approval", label: "Pending" },
    { key: "rejected", label: "Rejected" },
    { key: "archived", label: "Trash" },
  ];

  const handleDuplicate = async (product: VendorProductListItem) => {
    if (!user || !await isNeonConnected()) return;
    try {
      const newId = await duplicateVendorProduct(product.id, user.id);
      if (newId) {
        await loadProducts();
        showToast("Product duplicated!");
      }
    } catch {
      showToast("Failed to duplicate product");
    }
  };

  const handleSoftDelete = async (id: string) => {
    if (!await isNeonConnected()) return;
    try {
      await softDeleteVendorProduct(id);
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, status: "archived" } : p));
      showToast("Product moved to trash.");
    } catch {
      showToast("Failed to move product to trash");
    }
  };

  const chipS = (active: boolean): React.CSSProperties => ({
    padding: "8px 16px", border: `1px solid ${active ? "var(--gold)" : "var(--line)"}`,
    background: active ? "var(--gold-soft)" : "transparent",
    color: active ? "var(--gold)" : "var(--muted)", cursor: "pointer", borderRadius: 20,
    fontSize: ".78rem", fontWeight: active ? 700 : 500, whiteSpace: "nowrap",
    transition: "all var(--transition-fast)", display: "flex", alignItems: "center", gap: 6,
  });

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div style={{ display: "grid", gap: 12 }}>
          {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 60, borderRadius: "var(--radius)" }} />)}
        </div>
    </motion.div>
  );
}

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 400, display: "flex", alignItems: "center", gap: 10 }}>
          <Package size={22} style={{ color: "var(--gold)" }} /> Products ({products.filter((p) => p.status !== "archived").length})
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
        <input type="search" placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "12px 14px 12px 42px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", borderRadius: "var(--radius)", fontSize: ".9rem", outline: "none" }}
        />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--line)", color: "var(--muted)", fontSize: ".78rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <th style={{ padding: "12px 16px", textAlign: "left" }}>Product</th>
              <th style={{ padding: "12px 16px", textAlign: "left" }}>Price</th>
              <th style={{ padding: "12px 16px", textAlign: "left" }}>Stock</th>
              <th style={{ padding: "12px 16px", textAlign: "left" }}>Status</th>
              <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}>No products found.</td>
              </tr>
            )}
            {pag.data.map((product, i) => (
              <motion.tr key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                style={{ borderBottom: "1px solid var(--line)", verticalAlign: "middle" }}
              >
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: "var(--radius)", overflow: "hidden", flexShrink: 0, background: "var(--surface-strong)" }}>
                      <img src={product.images?.[0]?.url || ""} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 500, fontSize: ".85rem", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.name}</p>
                      <p style={{ color: "var(--muted)", fontSize: ".75rem" }}>{product.category_name}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <p style={{ fontWeight: 600, fontSize: ".9rem" }}>₹{product.price.toLocaleString("en-IN")}</p>
                  {product.discount_price > 0 && <p style={{ color: "var(--muted)", fontSize: ".78rem", textDecoration: "line-through" }}>₹{product.discount_price.toLocaleString("en-IN")}</p>}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ color: product.stock === 0 ? "#e74c3c" : product.stock < 15 ? "#f39c12" : "var(--text)", fontWeight: 500, fontSize: ".85rem" }}>
                    {product.stock}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px",
                    borderRadius: 12, fontSize: ".75rem", fontWeight: 600,
                    background: STATUS_MAP[product.status]?.bg || "#95a5a618",
                    color: STATUS_MAP[product.status]?.color || "#95a5a6",
                    border: `1px solid ${(STATUS_MAP[product.status]?.color || "#95a5a6")}30`,
                  }}>
                    {statusIcon[product.status] || <Clock size={14} />}
                    {STATUS_MAP[product.status]?.label || product.status}
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
                    {product.status !== "archived" && (
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

      <Pagination
        page={pag.page}
        totalPages={pag.totalPages}
        total={pag.total}
        from={pag.from}
        to={pag.to}
        onPageChange={pag.goToPage}
      />
    </motion.div>
  );
}
