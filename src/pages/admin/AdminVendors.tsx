import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Store, Search, CheckCircle, XCircle, AlertTriangle, RefreshCw, Trash2, ChevronRight, Loader2, User, Mail, Phone, MapPin, Package, ShoppingBag, Star } from "lucide-react";
import { useToast } from "../../components/Toast";
import { getVendors, updateVendor } from "../../lib/api/vendors";
import { neon, isNeonConnected } from "../../lib/neon";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/Pagination";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "#f39c12", bg: "#f39c1218" },
  approved: { label: "Approved", color: "#2ecc71", bg: "#2ecc7118" },
  rejected: { label: "Rejected", color: "#e74c3c", bg: "#e74c3c18" },
  suspended: { label: "Suspended", color: "#e74c3c", bg: "#e74c3c18" },
};

type AdminVendorItem = {
  id: string;
  user_id: string;
  shop_name: string;
  shop_slug: string;
  shop_email: string;
  shop_phone: string;
  shop_address: string;
  shop_logo: string | null;
  approval_status: string;
  total_products: number;
  total_orders: number;
  rating: number;
  created_at: string;
  owner_name: string;
  category: string;
};

export default function AdminVendors() {
  const { showToast } = useToast();
  const [vendors, setVendors] = useState<AdminVendorItem[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<AdminVendorItem | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      if (!await isNeonConnected()) { setLoading(false); return; }
      const rows = await getVendors(false) as any[];
      const enriched = await Promise.all((rows || []).map(async (v: any) => {
        let owner_name = v.shop_name;
        let category = v.shop_description || "";
        const { data: user } = await neon.select("users", { id: v.user_id }, { single: true });
        if (user) owner_name = user.name || v.shop_name;
        return {
          id: v.id,
          user_id: v.user_id,
          shop_name: v.shop_name,
          shop_slug: v.shop_slug,
          shop_email: v.shop_email || "",
          shop_phone: v.shop_phone || "",
          shop_address: v.shop_address || "",
          shop_logo: v.shop_logo || null,
          approval_status: v.approval_status,
          total_products: v.total_products || 0,
          total_orders: v.total_orders || 0,
          rating: v.rating || 0,
          created_at: v.created_at,
          owner_name,
          category,
        };
      }));
      setVendors(enriched);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      await updateVendor(id, { approval_status: newStatus } as any);
      setVendors((prev) => prev.map((v) => v.id === id ? { ...v, approval_status: newStatus } : v));
      if (selected?.id === id) setSelected((prev) => prev ? { ...prev, approval_status: newStatus } : null);
      showToast(`Vendor ${newStatus} successfully!`);
    } catch { showToast("Failed to update vendor status."); }
    setActionLoading(null);
  };

  const handleDelete = async (id: string) => {
    setActionLoading(id);
    try {
      if (!await isNeonConnected()) return;
      await neon.delete("vendors", { id });
      setVendors((prev) => prev.filter((v) => v.id !== id));
      if (selected?.id === id) setSelected(null);
      showToast("Vendor deleted.");
    } catch { showToast("Failed to delete vendor."); }
    setActionLoading(null);
  };

  const filtered = vendors.filter((v) => {
    if (filter !== "all" && v.approval_status !== filter) return false;
    if (search && !v.shop_name.toLowerCase().includes(search.toLowerCase()) && !v.owner_name.toLowerCase().includes(search.toLowerCase()) && !v.shop_email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const pag = usePagination(filtered, 12);

  const filters = ["all", "pending", "approved", "rejected", "suspended"];

  const chipS = (active: boolean): React.CSSProperties => ({
    padding: "8px 16px", border: `1px solid ${active ? "var(--gold)" : "var(--line)"}`,
    background: active ? "var(--gold-soft)" : "transparent",
    color: active ? "var(--gold)" : "var(--muted)", cursor: "pointer", borderRadius: 20,
    fontSize: ".78rem", fontWeight: active ? 700 : 500, whiteSpace: "nowrap",
    transition: "all var(--transition-fast)",
  });

  if (selected) {
    const config = statusConfig[selected.approval_status] || statusConfig.pending;
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <button onClick={() => setSelected(null)}
          style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: ".85rem" }}>
          <ChevronRight size={16} style={{ transform: "rotate(180deg)" }} /> Back to Vendors
        </button>

        <div className="glass" style={{ padding: 28, borderRadius: "var(--radius-xl)", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: "var(--radius-lg)", overflow: "hidden", background: "var(--surface-strong)" }}>
                {selected.shop_logo ? <img src={selected.shop_logo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center" }}><Store size={24} style={{ color: "var(--muted)" }} /></div>}
              </div>
              <div>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 600 }}>{selected.shop_name}</h2>
                <p style={{ color: "var(--muted)", fontSize: ".82rem" }}>{selected.category} · Registered {new Date(selected.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
            </div>
            <span style={{ padding: "6px 14px", borderRadius: 12, fontSize: ".78rem", fontWeight: 600, background: config.bg, color: config.color, border: `1px solid ${config.bg}` }}>{config.label}</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-lg)" }}>
            <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 16 }}>Business Details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <DetailRow icon={<User size={14} />} label="Owner" value={selected.owner_name} />
              <DetailRow icon={<Store size={14} />} label="Shop" value={selected.shop_name} />
              <DetailRow icon={<TagIcon />} label="Category" value={selected.category || "—"} />
              <DetailRow icon={<Mail size={14} />} label="Email" value={selected.shop_email} />
              <DetailRow icon={<Phone size={14} />} label="Phone" value={selected.shop_phone} />
              <DetailRow icon={<MapPin size={14} />} label="Address" value={selected.shop_address} />
            </div>
          </div>
          <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-lg)" }}>
            <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 16 }}>Performance</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <PerfCard icon={<Package size={16} />} label="Products" value={String(selected.total_products)} color="#9b59b6" />
              <PerfCard icon={<ShoppingBag size={16} />} label="Orders" value={String(selected.total_orders)} color="#3498db" />
              <PerfCard icon={<Star size={16} />} label="Rating" value={String(selected.rating || "—")} color="#2ecc71" />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {selected.approval_status !== "approved" && (
            <button onClick={() => handleAction(selected.id, "approved")} disabled={actionLoading === selected.id}
              className="premium-button" style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 20px", fontSize: ".85rem" }}>
              {actionLoading === selected.id ? <Loader2 size={14} className="spin" /> : <CheckCircle size={14} />} Approve
            </button>
          )}
          {selected.approval_status !== "rejected" && selected.approval_status !== "suspended" && (
            <button onClick={() => handleAction(selected.id, "rejected")} disabled={actionLoading === selected.id}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 20px", border: "1px solid #e74c3c", background: "transparent", color: "#e74c3c", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".85rem", fontWeight: 500 }}>
              <XCircle size={14} /> Reject
            </button>
          )}
          {selected.approval_status === "suspended" && (
            <button onClick={() => handleAction(selected.id, "approved")} disabled={actionLoading === selected.id}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 20px", border: "1px solid #2ecc71", background: "transparent", color: "#2ecc71", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".85rem", fontWeight: 500 }}>
              <RefreshCw size={14} /> Reactivate
            </button>
          )}
          {selected.approval_status !== "suspended" && selected.approval_status !== "pending" && (
            <button onClick={() => handleAction(selected.id, "suspended")} disabled={actionLoading === selected.id}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 20px", border: "1px solid #e74c3c", background: "transparent", color: "#e74c3c", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".85rem", fontWeight: 500 }}>
              <AlertTriangle size={14} /> Suspend
            </button>
          )}
          <button onClick={() => handleDelete(selected.id)} disabled={actionLoading === selected.id}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 20px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".85rem", fontWeight: 500 }}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h1 style={{ fontSize: "1.4rem", fontWeight: 400, display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <Store size={22} style={{ color: "var(--gold)" }} /> Vendor Management ({vendors.length})
      </h1>

      {loading ? (
        <div style={{ display: "grid", gap: 12, padding: 20 }}>
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton" style={{ height: 48, borderRadius: "var(--radius)" }} />)}
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {filters.map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={chipS(filter === f)}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
            ))}
          </div>

          <div style={{ position: "relative", marginBottom: 24, maxWidth: 400 }}>
            <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
            <input type="search" placeholder="Search by shop name, owner or email..." value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "12px 14px 12px 42px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", borderRadius: "var(--radius)", fontSize: ".9rem", outline: "none" }}
            />
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--line)", color: "var(--muted)", fontSize: ".75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "12px 14px", textAlign: "left" }}>Shop</th>
                  <th style={{ padding: "12px 14px", textAlign: "left" }}>Owner</th>
                  <th style={{ padding: "12px 14px", textAlign: "left" }}>Category</th>
                  <th style={{ padding: "12px 14px", textAlign: "center" }}>Products</th>
                  <th style={{ padding: "12px 14px", textAlign: "center" }}>Orders</th>
                  <th style={{ padding: "12px 14px", textAlign: "center" }}>Rating</th>
                  <th style={{ padding: "12px 14px", textAlign: "center" }}>Status</th>
                  <th style={{ padding: "12px 14px", textAlign: "right" }}></th>
                </tr>
              </thead>
              <tbody>
                {pag.data.map((v, i) => {
                  const config = statusConfig[v.approval_status] || statusConfig.pending;
                  return (
                    <motion.tr key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      style={{ borderBottom: "1px solid var(--line)", verticalAlign: "middle", cursor: "pointer" }}
                      onClick={() => setSelected(v)}
                      onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-strong)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: "var(--radius)", overflow: "hidden", background: "var(--surface-strong)", flexShrink: 0 }}>
                            {v.shop_logo ? <img src={v.shop_logo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center" }}><Store size={16} style={{ color: "var(--muted)" }} /></div>}
                          </div>
                          <span style={{ fontWeight: 500, fontSize: ".85rem" }}>{v.shop_name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: ".82rem" }}>{v.owner_name}</td>
                      <td style={{ padding: "12px 14px", fontSize: ".82rem", color: "var(--muted)" }}>{v.category || "—"}</td>
                      <td style={{ padding: "12px 14px", textAlign: "center", fontSize: ".85rem" }}>{v.total_products}</td>
                      <td style={{ padding: "12px 14px", textAlign: "center", fontSize: ".85rem" }}>{v.total_orders}</td>
                      <td style={{ padding: "12px 14px", textAlign: "center", fontSize: ".85rem" }}>{v.rating || "—"}</td>
                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        <span style={{ padding: "3px 10px", borderRadius: 10, fontSize: ".72rem", fontWeight: 600, background: config.bg, color: config.color, border: `1px solid ${config.color}30` }}>{config.label}</span>
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right" }}>
                        <ChevronRight size={14} style={{ color: "var(--muted)" }} />
                      </td>
                    </motion.tr>
                  );
                })}
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
        </>
      )}
    </motion.div>
  );
}

function TagIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2z"/><path d="M7 7h.01"/></svg>;
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ color: "var(--muted)", display: "flex", width: 16 }}>{icon}</span>
      <span style={{ color: "var(--muted)", fontSize: ".82rem", minWidth: 70 }}>{label}</span>
      <span style={{ fontSize: ".85rem", fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function PerfCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div style={{ textAlign: "center", padding: 12, background: "var(--surface)", borderRadius: "var(--radius)" }}>
      <div style={{ color, marginBottom: 4, display: "flex", justifyContent: "center" }}>{icon}</div>
      <p style={{ fontSize: "1rem", fontWeight: 600 }}>{value}</p>
      <p style={{ color: "var(--muted)", fontSize: ".72rem" }}>{label}</p>
    </div>
  );
}
