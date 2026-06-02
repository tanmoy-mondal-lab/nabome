import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Search, ChevronRight, Loader2 } from "lucide-react";
import { useToast } from "../../components/Toast";
import { getAllOrders, updateOrderStatus } from "../../lib/api/orders";
import type { OrderWithItems } from "../../lib/api/orders";
import type { OrderStatus } from "../../types/order";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "#f39c12", bg: "#f39c1218" },
  confirmed: { label: "Confirmed", color: "#3498db", bg: "#3498db18" },
  processing: { label: "Processing", color: "#9b59b6", bg: "#9b59b618" },
  packed: { label: "Packed", color: "#9b59b6", bg: "#9b59b618" },
  shipped: { label: "Shipped", color: "#2ecc71", bg: "#2ecc7118" },
  out_for_delivery: { label: "Out for Delivery", color: "#1abc9c", bg: "#1abc9c18" },
  delivered: { label: "Delivered", color: "#27ae60", bg: "#27ae6018" },
  cancelled: { label: "Cancelled", color: "#e74c3c", bg: "#e74c3c18" },
  returned: { label: "Returned", color: "#e67e22", bg: "#e67e2218" },
  refunded: { label: "Refunded", color: "#95a5a6", bg: "#95a5a618" },
};

export default function AdminOrders() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<OrderWithItems | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const data = await getAllOrders();
      setOrders(data);
      setLoading(false);
    })();
  }, []);

  const handleOverride = async (id: string, newStatus: OrderStatus) => {
    setActionLoading(id);
    try {
      await updateOrderStatus(id, newStatus, `Status overridden to ${newStatus} by admin`);
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, orderStatus: newStatus } : o));
      if (selected?.id === id) setSelected({ ...selected, orderStatus: newStatus });
      showToast(`Order status overridden to ${newStatus}!`);
    } catch {
      showToast("Failed to update order status");
    }
    setActionLoading(null);
  };

  const filtered = orders.filter((o) => {
    if (filter !== "all" && o.orderStatus !== filter) return false;
    if (search && !o.orderNumber.toLowerCase().includes(search.toLowerCase()) && !o.customerName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filters = ["all", "pending", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "returned", "refunded"];
  const allStatuses: OrderStatus[] = ["pending", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "returned", "refunded"];

  const chipS = (active: boolean): React.CSSProperties => ({
    padding: "8px 16px", border: `1px solid ${active ? "var(--gold)" : "var(--line)"}`, background: active ? "var(--gold-soft)" : "transparent", color: active ? "var(--gold)" : "var(--muted)", cursor: "pointer", borderRadius: 20, fontSize: ".78rem", fontWeight: active ? 700 : 500, whiteSpace: "nowrap", transition: "all var(--transition-fast)",
  });

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 40, textAlign: "center" }}>
        <div className="skeleton" style={{ width: 48, height: 48, borderRadius: "50%", margin: "0 auto 16px" }} />
        <p style={{ color: "var(--muted)" }}>Loading orders...</p>
      </motion.div>
    );
  }

  if (selected) {
    const config = statusConfig[selected.orderStatus] || { label: selected.orderStatus, color: "var(--muted)", bg: "transparent" };
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <button onClick={() => setSelected(null)} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: ".85rem" }}>
          <ChevronRight size={16} style={{ transform: "rotate(180deg)" }} /> Back to Orders
        </button>
        <div className="glass" style={{ padding: 28, borderRadius: "var(--radius-xl)", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div>
              <p style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 4 }}>Order ID</p>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 600 }}>{selected.orderNumber}</h2>
              <p style={{ color: "var(--muted)", fontSize: ".82rem", marginTop: 4 }}>{new Date(selected.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
            </div>
            <span style={{ padding: "6px 14px", borderRadius: 12, fontSize: ".78rem", fontWeight: 600, background: config.bg, color: config.color, border: `1px solid ${config.color}30` }}>{config.label}</span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-lg)" }}>
            <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 12 }}>Customer</h3>
            <p style={{ fontSize: ".9rem", marginBottom: 2 }}>{selected.customerName}</p>
            <p style={{ color: "var(--muted)", fontSize: ".82rem" }}>{selected.customerPhone} · {selected.customerEmail}</p>
          </div>
          <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-lg)" }}>
            <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 12 }}>Shipping</h3>
            <p style={{ color: "var(--muted)", fontSize: ".82rem" }}>{selected.shippingAddress.address}, {selected.shippingAddress.city}, {selected.shippingAddress.state} — {selected.shippingAddress.pincode}</p>
            <p style={{ color: "var(--muted)", fontSize: ".82rem", marginTop: 8 }}>Payment: {selected.paymentMethod === "upi" ? "UPI" : selected.paymentMethod}</p>
          </div>
        </div>
        <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-lg)", marginBottom: 20 }}>
          <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 16 }}>Items</h3>
          {selected.items.map((item, i) => (
            <div key={item.id || i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < selected.items.length - 1 ? "1px solid var(--line)" : "none" }}>
              <span style={{ fontSize: ".85rem" }}>{item.productName} × {item.quantity}</span>
              <span style={{ fontWeight: 600, fontSize: ".85rem" }}>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid var(--line)", marginTop: 8 }}>
            <span style={{ fontWeight: 600 }}>Total</span>
            <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--gold)" }}>₹{selected.grandTotal.toLocaleString("en-IN")}</span>
          </div>
        </div>
        {selected.notes && (
          <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-lg)", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 8 }}>Note</h3>
            <p style={{ color: "var(--muted)", fontSize: ".85rem" }}>{selected.notes}</p>
          </div>
        )}
        <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 12 }}>Override Status</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {allStatuses.map((s) => {
            const cfg = statusConfig[s];
            return (
              <button key={s} onClick={() => handleOverride(selected.id, s)} disabled={actionLoading === selected.id || s === selected.orderStatus}
                style={{
                  padding: "8px 16px", border: `1px solid ${s === selected.orderStatus ? cfg.color : "var(--line)"}`,
                  background: s === selected.orderStatus ? cfg.bg : "transparent",
                  color: s === selected.orderStatus ? cfg.color : "var(--muted)", cursor: s === selected.orderStatus ? "default" : "pointer",
                  borderRadius: "var(--radius)", fontSize: ".78rem", fontWeight: s === selected.orderStatus ? 700 : 500,
                  display: "flex", alignItems: "center", gap: 6, opacity: s === selected.orderStatus ? 0.6 : 1,
                }}
              >
                {actionLoading === selected.id && s !== selected.orderStatus ? <Loader2 size={12} className="spin" /> : null}
                {cfg.label}
              </button>
            );
          })}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h1 style={{ fontSize: "1.4rem", fontWeight: 400, display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <ShoppingBag size={22} style={{ color: "var(--gold)" }} /> Order Management ({orders.length})
      </h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {filters.map((f) => <button key={f} onClick={() => setFilter(f)} style={chipS(filter === f)}>{f.charAt(0).toUpperCase() + f.slice(1).replace(/_/g, " ")}</button>)}
      </div>
      <div style={{ position: "relative", marginBottom: 24, maxWidth: 400 }}>
        <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
        <input type="search" placeholder="Search by order ID or customer..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "12px 14px 12px 42px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", borderRadius: "var(--radius)", fontSize: ".9rem", outline: "none" }}
        />
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--line)", color: "var(--muted)", fontSize: ".75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <th style={{ padding: "12px 14px", textAlign: "left" }}>Order</th>
              <th style={{ padding: "12px 14px", textAlign: "left" }}>Customer</th>
              <th style={{ padding: "12px 14px", textAlign: "right" }}>Total</th>
              <th style={{ padding: "12px 14px", textAlign: "center" }}>Status</th>
              <th style={{ padding: "12px 14px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o, i) => {
              const cfg = statusConfig[o.orderStatus] || { label: o.orderStatus, color: "var(--muted)", bg: "transparent" };
              return (
                <motion.tr key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  style={{ borderBottom: "1px solid var(--line)", verticalAlign: "middle", cursor: "pointer" }}
                  onClick={() => setSelected(o)}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-strong)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "12px 14px" }}>
                    <p style={{ fontWeight: 600, fontSize: ".85rem" }}>{o.orderNumber}</p>
                    <p style={{ color: "var(--muted)", fontSize: ".75rem" }}>{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: ".82rem" }}>{o.customerName}</td>
                  <td style={{ padding: "12px 14px", textAlign: "right", fontSize: ".85rem", fontWeight: 600, color: "var(--gold)" }}>₹{o.grandTotal.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "12px 14px", textAlign: "center" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 10, fontSize: ".72rem", fontWeight: 600, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>{cfg.label}</span>
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
    </motion.div>
  );
}
