import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Package, ChevronRight, Search } from "lucide-react";
import { generateMockOrders, type AccountOrder } from "../lib/mockAccountData";
import { useCustomer } from "../context/CustomerContext";

type Props = { onViewOrder: (orderId: string) => void };

const statusColor: Record<string, string> = {
  pending: "#f39c12", confirmed: "#3498db", packed: "#9b59b6",
  shipped: "#2ecc71", delivered: "#27ae60", cancelled: "#e74c3c",
};

export default function AccountOrders({ onViewOrder }: Props) {
  const { customer } = useCustomer();
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    // TODO: fetch from DB via getOrdersByCustomer(customer.id)
    setOrders(generateMockOrders(5));
  }, [customer]);

  const filtered = orders.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (search && !o.billNo.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statusFilters = ["all", "pending", "confirmed", "packed", "shipped", "delivered", "cancelled"];

  const chipS = (active: boolean): React.CSSProperties => ({
    padding: "8px 16px", border: `1px solid ${active ? "var(--gold)" : "var(--line)"}`,
    background: active ? "var(--gold-soft)" : "transparent",
    color: active ? "var(--gold)" : "var(--muted)",
    cursor: "pointer", borderRadius: 20, fontSize: ".78rem", fontWeight: active ? 700 : 500,
    textTransform: "capitalize", transition: "all var(--transition-fast)", whiteSpace: "nowrap",
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 400, display: "flex", alignItems: "center", gap: 10 }}>
          <ShoppingBag size={22} style={{ color: "var(--gold)" }} /> My Orders
        </h1>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", overflowX: "auto" }}>
        {statusFilters.map((s) => (
          <button key={s} onClick={() => setFilter(s)} style={chipS(filter === s)}>{s === "all" ? "All" : s}</button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 24, maxWidth: 400 }}>
        <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
        <input type="search" placeholder="Search by order number..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "12px 14px 12px 42px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", borderRadius: "var(--radius)", fontSize: ".9rem", outline: "none" }}
        />
      </div>

      {filtered.length === 0 && (
        <div className="glass" style={{ padding: 48, textAlign: "center", borderRadius: "var(--radius-xl)" }}>
          <Package size={40} style={{ color: "var(--muted)", marginBottom: 12 }} />
          <p style={{ color: "var(--muted)" }}>No orders found.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {filtered.map((order, i) => (
          <motion.div key={order.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass" style={{ padding: 20, borderRadius: "var(--radius-lg)", cursor: "pointer" }}
            onClick={() => onViewOrder(order.id)}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--gold)"}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--line)"}
          >
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {/* First item image */}
              <div style={{ width: 80, height: 80, borderRadius: "var(--radius)", overflow: "hidden", flexShrink: 0, background: "var(--surface-strong)" }}>
                <img src={order.items[0]?.image} alt={order.items[0]?.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <p style={{ fontWeight: 600, marginBottom: 2 }}>{order.billNo}</p>
                    <p style={{ color: "var(--muted)", fontSize: ".82rem" }}>
                      {new Date(order.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span className="status-chip"
                    style={{
                      background: `${statusColor[order.status]}18`,
                      color: statusColor[order.status],
                      border: `1px solid ${statusColor[order.status]}40`,
                    }}
                  >
                    {order.status.toUpperCase()}
                  </span>
                </div>
                <p style={{ color: "var(--muted)", fontSize: ".82rem", marginTop: 6 }}>
                  {order.items.length} item{order.items.length > 1 ? "s" : ""} · {order.paymentMethod}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                  <span style={{ fontWeight: 700, color: "var(--gold)", fontSize: "1.1rem" }}>
                    ₹{order.total.toLocaleString("en-IN")}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--muted)", fontSize: ".82rem" }}>
                    View Details <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
