import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Search, CheckCircle, XCircle, RefreshCw, Trash2, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "../../components/Toast";
import { getAdminProducts, approveProduct, rejectProduct, restoreProduct, permanentDeleteProduct } from "../../lib/api/products";
import { isNeonConnected } from "../../lib/neon";
import type { AdminProductRow } from "../../lib/api/products";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "#95a5a6", bg: "#95a5a618" },
  pending_approval: { label: "Pending", color: "#f39c12", bg: "#f39c1218" },
  published: { label: "Published", color: "#2ecc71", bg: "#2ecc7118" },
  rejected: { label: "Rejected", color: "#e74c3c", bg: "#e74c3c18" },
  archived: { label: "Deleted", color: "#e74c3c", bg: "#e74c3c18" },
};

export default function AdminProducts() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<AdminProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    if (await isNeonConnected()) {
      try { setProducts(await getAdminProducts()); } catch { /* ignore */ }
    }
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try { await approveProduct(id); setProducts((prev) => prev.map((p) => p.id === id ? { ...p, status: "published" } : p)); showToast("Product approved and published!"); }
    catch { showToast("Failed to approve product."); }
    setActionLoading(null);
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Rejection reason:");
    if (!reason) return;
    setActionLoading(id);
    try { await rejectProduct(id, reason); setProducts((prev) => prev.map((p) => p.id === id ? { ...p, status: "rejected", rejection_note: reason } : p)); showToast("Product rejected."); }
    catch { showToast("Failed to reject product."); }
    setActionLoading(null);
  };

  const handleRestore = async (id: string) => {
    setActionLoading(id);
    try { await restoreProduct(id); setProducts((prev) => prev.map((p) => p.id === id ? { ...p, status: "draft", rejection_note: undefined } : p)); showToast("Product restored!"); }
    catch { showToast("Failed to restore product."); }
    setActionLoading(null);
  };

  const handlePermanentDelete = async (id: string) => {
    setActionLoading(id);
    try { await permanentDeleteProduct(id); setProducts((prev) => prev.filter((p) => p.id !== id)); showToast("Product permanently deleted."); }
    catch { showToast("Failed to delete product."); }
    setActionLoading(null);
    setConfirmation(null);
  };

  const filtered = products.filter((p) => {
    if (filter !== "all" && p.status !== filter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.vendor_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filters = ["all", "published", "pending_approval", "draft", "rejected", "archived"];
  const chipS = (active: boolean): React.CSSProperties => ({
    padding: "8px 16px", border: `1px solid ${active ? "var(--gold)" : "var(--line)"}`, background: active ? "var(--gold-soft)" : "transparent", color: active ? "var(--gold)" : "var(--muted)", cursor: "pointer", borderRadius: 20, fontSize: ".78rem", fontWeight: active ? 700 : 500, whiteSpace: "nowrap", transition: "all var(--transition-fast)",
  });

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 400, marginBottom: 20 }}>Product Management</h1>
        <div style={{ display: "grid", gap: 12 }}>
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton" style={{ height: 52, borderRadius: "var(--radius)" }} />)}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h1 style={{ fontSize: "1.4rem", fontWeight: 400, display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <Package size={22} style={{ color: "var(--gold)" }} /> Product Management ({products.length})
      </h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {filters.map((f) => <button key={f} onClick={() => setFilter(f)} style={chipS(filter === f)}>{f === "pending_approval" ? "Pending" : f === "archived" ? "Deleted" : f.charAt(0).toUpperCase() + f.slice(1)}</button>)}
      </div>

      <div style={{ position: "relative", marginBottom: 24, maxWidth: 400 }}>
        <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
        <input type="search" placeholder="Search by product or vendor..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "12px 14px 12px 42px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", borderRadius: "var(--radius)", fontSize: ".9rem", outline: "none" }}
        />
      </div>

      {confirmation && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "grid", placeItems: "center", padding: 20 }}>
          <div className="glass" style={{ padding: 32, borderRadius: "var(--radius-xl)", maxWidth: 420, width: "100%", textAlign: "center" }}>
            <AlertCircle size={40} style={{ color: "#e74c3c", marginBottom: 16 }} />
            <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Permanent Delete</h3>
            <p style={{ color: "var(--muted)", fontSize: ".85rem", marginBottom: 20 }}>This action permanently deletes the product, images, and all associated files. This cannot be undone.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => handlePermanentDelete(confirmation)} disabled={actionLoading === confirmation} className="premium-button" style={{ background: "#e74c3c", borderColor: "#e74c3c", padding: "0 24px", fontSize: ".85rem" }}>
                {actionLoading === confirmation ? <Loader2 size={14} className="spin" /> : null} Delete Permanently
              </button>
              <button onClick={() => setConfirmation(null)} style={{ padding: "0 24px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", fontWeight: 500 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 750 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--line)", color: "var(--muted)", fontSize: ".75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <th style={{ padding: "12px 14px", textAlign: "left" }}>Product</th>
              <th style={{ padding: "12px 14px", textAlign: "left" }}>Vendor</th>
              <th style={{ padding: "12px 14px", textAlign: "left" }}>Price</th>
              <th style={{ padding: "12px 14px", textAlign: "center" }}>Stock</th>
              <th style={{ padding: "12px 14px", textAlign: "center" }}>Status</th>
              <th style={{ padding: "12px 14px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}>No products found.</td></tr>
            )}
            {filtered.map((p, i) => {
              const config = statusConfig[p.status] || statusConfig.draft;
              return (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  style={{ borderBottom: "1px solid var(--line)", verticalAlign: "middle" }}>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: "var(--radius)", overflow: "hidden", background: "var(--surface-strong)", flexShrink: 0 }}>
                        {p.image ? <img src={p.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "var(--muted)", fontSize: ".6rem" }}>—</div>}
                      </div>
                      <div>
                        <p style={{ fontWeight: 500, fontSize: ".85rem" }}>{p.name}</p>
                        <p style={{ color: "var(--muted)", fontSize: ".75rem" }}>{p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: ".82rem", color: "var(--muted)" }}>{p.vendor_name}</td>
                  <td style={{ padding: "12px 14px", fontSize: ".85rem", fontWeight: 600 }}>₹{p.price.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "12px 14px", textAlign: "center", fontSize: ".85rem", color: p.stock === 0 ? "#e74c3c" : p.stock < 10 ? "#f39c12" : "var(--text)" }}>{p.stock}</td>
                  <td style={{ padding: "12px 14px", textAlign: "center" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 10, fontSize: ".72rem", fontWeight: 600, background: config.bg, color: config.color, border: `1px solid ${config.color}30` }}>{config.label}</span>
                    {p.status === "rejected" && p.rejection_note && (
                      <p style={{ color: "var(--muted)", fontSize: ".68rem", marginTop: 2 }} title={p.rejection_note}>Reason set</p>
                    )}
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                      {p.status === "pending_approval" && (
                        <>
                          <button onClick={() => handleApprove(p.id)} disabled={actionLoading === p.id} title="Approve"
                            style={{ width: 30, height: 30, border: "none", background: "#2ecc71", color: "#fff", cursor: "pointer", borderRadius: "var(--radius)", display: "grid", placeItems: "center" }}>
                            {actionLoading === p.id ? <Loader2 size={12} className="spin" /> : <CheckCircle size={12} />}
                          </button>
                          <button onClick={() => handleReject(p.id)} disabled={actionLoading === p.id} title="Reject"
                            style={{ width: 30, height: 30, border: "none", background: "#e74c3c", color: "#fff", cursor: "pointer", borderRadius: "var(--radius)", display: "grid", placeItems: "center" }}>
                            {actionLoading === p.id ? <Loader2 size={12} className="spin" /> : <XCircle size={12} />}
                          </button>
                        </>
                      )}
                      {p.status === "archived" && (
                        <button onClick={() => handleRestore(p.id)} disabled={actionLoading === p.id} title="Restore"
                          style={{ width: 30, height: 30, border: "1px solid var(--line)", background: "transparent", color: "#2ecc71", cursor: "pointer", borderRadius: "var(--radius)", display: "grid", placeItems: "center" }}>
                          {actionLoading === p.id ? <Loader2 size={12} className="spin" /> : <RefreshCw size={12} />}
                        </button>
                      )}
                      {(p.status === "archived" || p.status === "rejected") && (
                        <button onClick={() => setConfirmation(p.id)} title="Delete Permanently"
                          style={{ width: 30, height: 30, border: "1px solid var(--line)", background: "transparent", color: "#e74c3c", cursor: "pointer", borderRadius: "var(--radius)", display: "grid", placeItems: "center" }}>
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
