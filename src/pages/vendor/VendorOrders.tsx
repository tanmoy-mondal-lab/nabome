import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Search, ChevronRight, Package, CheckCircle, XCircle, Truck, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import { generateMockOrders } from "../../lib/mockVendorData";
import type { VendorOrder, VendorOrderStatus } from "../../types/vendor";

const statusConfig: Record<VendorOrderStatus, { label: string; color: string; bg: string }> = {
  new: { label: "New", color: "#3498db", bg: "#3498db18" },
  processing: { label: "Processing", color: "#f39c12", bg: "#f39c1218" },
  packed: { label: "Packed", color: "#9b59b6", bg: "#9b59b618" },
  shipped: { label: "Shipped", color: "#2ecc71", bg: "#2ecc7118" },
  delivered: { label: "Delivered", color: "#27ae60", bg: "#27ae6018" },
  cancelled: { label: "Cancelled", color: "#e74c3c", bg: "#e74c3c18" },
};

const statusActions: Record<VendorOrderStatus, { label: string; next: VendorOrderStatus; icon: React.ReactNode }[]> = {
  new: [{ label: "Accept", next: "processing", icon: <CheckCircle size={14} /> }],
  processing: [{ label: "Mark Packed", next: "packed", icon: <Package size={14} /> }],
  packed: [{ label: "Mark Shipped", next: "shipped", icon: <Truck size={14} /> }],
  shipped: [{ label: "Mark Delivered", next: "delivered", icon: <CheckCircle size={14} /> }],
  delivered: [],
  cancelled: [],
};

export default function VendorOrders() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<VendorOrderStatus | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<VendorOrder | null>(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user) setOrders(generateMockOrders(user.id));
  }, [user]);

  const handleAction = (orderId: string, newStatus: VendorOrderStatus) => {
    setActionLoading(orderId);
    setTimeout(() => {
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
      showToast(`Order ${orderId} updated to ${statusConfig[newStatus].label}`);
      setActionLoading(null);
    }, 500);
  };

  const handleAddTracking = (orderId: string) => {
    if (!trackingInput.trim()) return;
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, trackingNumber: trackingInput.trim() } : o));
    showToast("Tracking number added!");
    setTrackingInput("");
  };

  const filtered = orders.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (search && !o.orderId.toLowerCase().includes(search.toLowerCase()) && !o.customerName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statusFilters: { key: VendorOrderStatus | "all"; label: string }[] = [
    { key: "all", label: "All" },
    { key: "new", label: "New" },
    { key: "processing", label: "Processing" },
    { key: "packed", label: "Packed" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
    { key: "cancelled", label: "Cancelled" },
  ];

  const chipS = (active: boolean): React.CSSProperties => ({
    padding: "8px 16px", border: `1px solid ${active ? "var(--gold)" : "var(--line)"}`,
    background: active ? "var(--gold-soft)" : "transparent",
    color: active ? "var(--gold)" : "var(--muted)", cursor: "pointer", borderRadius: 20,
    fontSize: ".78rem", fontWeight: active ? 700 : 500, whiteSpace: "nowrap",
    transition: "all var(--transition-fast)",
  });

  if (selectedOrder) {
    const order = selectedOrder;
    const config = statusConfig[order.status];
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <button onClick={() => setSelectedOrder(null)}
          style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: ".85rem" }}>
          <ChevronRight size={16} style={{ transform: "rotate(180deg)" }} /> Back to Orders
        </button>
        <div className="glass" style={{ padding: 28, borderRadius: "var(--radius-xl)", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div>
              <p style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 4 }}>Order ID</p>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 600 }}>{order.orderId}</h2>
              <p style={{ color: "var(--muted)", fontSize: ".82rem", marginTop: 4 }}>
                {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <span style={{ padding: "6px 14px", borderRadius: 12, fontSize: ".78rem", fontWeight: 600, background: config.bg, color: config.color, border: `1px solid ${config.bg}` }}>
              {config.label}
            </span>
          </div>
        </div>

        {/* Customer */}
        <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-lg)", marginBottom: 20 }}>
          <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 12 }}>Customer</h3>
          <p style={{ fontSize: ".9rem", marginBottom: 4 }}>{order.customerName}</p>
          <p style={{ color: "var(--muted)", fontSize: ".82rem" }}>{order.customerPhone} · {order.customerEmail}</p>
        </div>

        {/* Shipping */}
        <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-lg)", marginBottom: 20 }}>
          <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 12 }}>Shipping Address</h3>
          <p style={{ fontSize: ".9rem", marginBottom: 2 }}>{order.shippingAddress.name}</p>
          <p style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 2 }}>{order.shippingAddress.phone}</p>
          <p style={{ color: "var(--muted)", fontSize: ".82rem" }}>{order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</p>
        </div>

        {/* Items */}
        <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-lg)", marginBottom: 20 }}>
          <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 16 }}>Items ({order.items.length})</h3>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "8px 0", borderBottom: i < order.items.length - 1 ? "1px solid var(--line)" : "none" }}>
              <div style={{ width: 48, height: 48, borderRadius: "var(--radius)", overflow: "hidden", flexShrink: 0, background: "var(--surface-strong)" }}>
                <img src={item.productImage} alt={item.productName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 500, fontSize: ".85rem" }}>{item.productName}</p>
                <p style={{ color: "var(--muted)", fontSize: ".78rem" }}>{item.size} · {item.color} · Qty: {item.quantity}</p>
              </div>
              <p style={{ fontWeight: 600, fontSize: ".85rem" }}>₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: "1px solid var(--line)", marginTop: 8 }}>
            <span style={{ fontWeight: 600 }}>Total</span>
            <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--gold)" }}>₹{order.total.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Tracking */}
        {order.status === "shipped" || order.status === "delivered" ? (
          <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-lg)", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 8 }}>Tracking Number</h3>
            <p style={{ color: "var(--muted)", fontSize: ".85rem" }}>{order.trackingNumber || "Not set"}</p>
          </div>
        ) : order.status === "processing" || order.status === "packed" ? (
          <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-lg)", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 12 }}>Add Tracking Number</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="text" value={trackingInput} onChange={(e) => setTrackingInput(e.target.value)} placeholder="Enter tracking number..."
                style={{ flex: 1, padding: "12px 16px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", borderRadius: "var(--radius)", fontSize: ".9rem", outline: "none" }} />
              <button onClick={() => handleAddTracking(order.id)} className="premium-button" style={{ padding: "0 20px", fontSize: ".82rem" }}>Save</button>
            </div>
          </div>
        ) : null}

        {/* Actions */}
        {statusActions[order.status]?.length > 0 && (
          <div style={{ display: "flex", gap: 12 }}>
            {statusActions[order.status].map((action) => (
              <button key={action.next} onClick={() => handleAction(order.id, action.next)} disabled={actionLoading === order.id}
                className="premium-button" style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 24px", fontSize: ".85rem" }}>
                {actionLoading === order.id ? <Loader2 size={14} className="spin" /> : action.icon}
                {action.label}
              </button>
            ))}
            {order.status === "new" && (
              <button onClick={() => handleAction(order.id, "cancelled")} disabled={actionLoading === order.id}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 24px", border: "1px solid #e74c3c", background: "transparent", color: "#e74c3c", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".85rem", fontWeight: 500 }}>
                <XCircle size={14} /> Reject
              </button>
            )}
          </div>
        )}

        {order.note && (
          <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-lg)", marginTop: 20 }}>
            <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 8 }}>Customer Note</h3>
            <p style={{ color: "var(--muted)", fontSize: ".85rem" }}>{order.note}</p>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 400, display: "flex", alignItems: "center", gap: 10 }}>
          <ShoppingBag size={22} style={{ color: "var(--gold)" }} /> Orders ({orders.length})
        </h1>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", overflowX: "auto" }}>
        {statusFilters.map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)} style={chipS(filter === key)}>{label}</button>
        ))}
      </div>

      <div style={{ position: "relative", marginBottom: 24, maxWidth: 400 }}>
        <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
        <input type="search" placeholder="Search by order ID or customer..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "12px 14px 12px 42px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", borderRadius: "var(--radius)", fontSize: ".9rem", outline: "none" }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.length === 0 && (
          <div className="glass" style={{ padding: 48, textAlign: "center", borderRadius: "var(--radius-xl)" }}>
            <Package size={40} style={{ color: "var(--muted)", marginBottom: 12 }} />
            <p style={{ color: "var(--muted)" }}>No orders found.</p>
          </div>
        )}
        {filtered.map((order, i) => {
          const config = statusConfig[order.status];
          return (
            <motion.div key={order.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="glass" style={{ padding: 20, borderRadius: "var(--radius-lg)", cursor: "pointer" }}
              onClick={() => setSelectedOrder(order)}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--gold)"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--line)"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <p style={{ fontWeight: 600, marginBottom: 2 }}>{order.orderId}</p>
                  <p style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 4 }}>{order.customerName} · {order.customerPhone}</p>
                  <p style={{ color: "var(--muted)", fontSize: ".78rem" }}>{order.items.length} item(s) · {order.paymentMethod}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ padding: "4px 12px", borderRadius: 12, fontSize: ".75rem", fontWeight: 600, background: config.bg, color: config.color, border: `1px solid ${config.bg}` }}>
                    {config.label}
                  </span>
                  <p style={{ fontWeight: 700, fontSize: "1rem", color: "var(--gold)", marginTop: 8 }}>₹{order.total.toLocaleString("en-IN")}</p>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                <p style={{ color: "var(--muted)", fontSize: ".78rem" }}>
                  {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </p>
                <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--muted)", fontSize: ".78rem" }}>
                  View Details <ChevronRight size={12} />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
