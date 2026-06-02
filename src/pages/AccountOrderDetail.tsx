import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Package, MapPin, CreditCard, Download, FileText, Truck, CheckCircle, Clock, XCircle } from "lucide-react";
import { generateMockOrders, ORDER_TIMELINE_MAP, type AccountOrder } from "../lib/mockAccountData";

type Props = { orderId: string | null; onBack: () => void };

const statusColor: Record<string, string> = {
  pending: "#f39c12", confirmed: "#3498db", packed: "#9b59b6",
  shipped: "#2ecc71", delivered: "#27ae60", cancelled: "#e74c3c",
};

const statusIcon: Record<string, React.ReactNode> = {
  pending: <Clock size={18} />,
  confirmed: <CheckCircle size={18} />,
  packed: <Package size={18} />,
  shipped: <Truck size={18} />,
  delivered: <CheckCircle size={18} />,
  cancelled: <XCircle size={18} />,
};

const statusLabel: Record<string, string> = {
  pending: "Pending", confirmed: "Confirmed", packed: "Packed",
  shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled",
};

export default function AccountOrderDetail({ orderId, onBack }: Props) {
  const [order, setOrder] = useState<AccountOrder | null>(null);

  useEffect(() => {
    if (!orderId) return;
    // TODO: fetch from DB
    const orders = generateMockOrders(5);
    const found = orders.find((o) => o.id === orderId);
    setOrder(found || null);
  }, [orderId]);

  if (!order) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 40, textAlign: "center" }}>
        <div className="skeleton" style={{ width: 48, height: 48, borderRadius: "50%", margin: "0 auto 16px" }} />
        <p style={{ color: "var(--muted)" }}>Loading order...</p>
      </motion.div>
    );
  }

  const timeline = ORDER_TIMELINE_MAP[order.status] || ORDER_TIMELINE_MAP.pending;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--muted)", background: "none", border: "none", cursor: "pointer", fontSize: ".85rem", marginBottom: 20 }}>
        <ArrowLeft size={16} /> Back to Orders
      </button>

      {/* Header */}
      <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-xl)", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ color: "var(--muted)", fontSize: ".78rem", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Order</p>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 400 }}>{order.billNo}</h1>
            <p style={{ color: "var(--muted)", fontSize: ".85rem", marginTop: 4 }}>
              Placed on {new Date(order.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <span className="status-chip" style={{ background: `${statusColor[order.status]}18`, color: statusColor[order.status], border: `1px solid ${statusColor[order.status]}40`, fontSize: ".85rem", padding: "8px 18px" }}>
            {statusIcon[order.status]} {statusLabel[order.status]}
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Timeline */}
        <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-lg)" }}>
          <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <Truck size={16} style={{ color: "var(--gold)" }} /> Order Timeline
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {timeline.map((step, i) => (
              <div key={step.status} style={{ display: "flex", gap: 12, position: "relative", paddingBottom: i < timeline.length - 1 ? 20 : 0 }}>
                {/* Line */}
                {i < timeline.length - 1 && (
                  <div style={{ position: "absolute", left: 11, top: 28, width: 2, height: "calc(100% - 8px)", background: step.completed ? "var(--gold)" : "var(--surface-strong)" }} />
                )}
                {/* Dot */}
                <div style={{
                  width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                  background: step.completed ? "var(--gold)" : "var(--surface-strong)",
                  border: `2px solid ${step.completed ? "var(--gold)" : "var(--line)"}`,
                  display: "grid", placeItems: "center", zIndex: 1,
                }}>
                  {step.completed && <CheckCircle size={12} style={{ color: "#050505" }} />}
                </div>
                <div>
                  <p style={{ fontWeight: step.completed ? 600 : 400, fontSize: ".9rem", color: step.completed ? "var(--text)" : "var(--muted)" }}>{step.label}</p>
                  {step.completed && step.date && <p style={{ fontSize: ".78rem", color: "var(--muted)" }}>{step.date}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping + Payment */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="glass" style={{ padding: 20, borderRadius: "var(--radius-lg)" }}>
            <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <MapPin size={16} style={{ color: "var(--gold)" }} /> Shipping Address
            </h3>
            <p style={{ fontSize: ".9rem", fontWeight: 600 }}>{order.shippingAddress.name}</p>
            <p style={{ color: "var(--muted)", fontSize: ".82rem", lineHeight: 1.6 }}>
              {order.shippingAddress.address}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}<br />
              {order.shippingAddress.phone}
            </p>
          </div>
          <div className="glass" style={{ padding: 20, borderRadius: "var(--radius-lg)" }}>
            <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <CreditCard size={16} style={{ color: "var(--gold)" }} /> Payment
            </h3>
            <p style={{ fontSize: ".9rem" }}>{order.paymentMethod}</p>
            <p style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--gold)", marginTop: 8 }}>
              ₹{order.total.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-xl)", marginBottom: 20 }}>
        <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Package size={16} style={{ color: "var(--gold)" }} /> Items ({order.items.length})
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: i < order.items.length - 1 ? "1px solid var(--line)" : "none" }}>
              <div style={{ width: 64, height: 64, borderRadius: "var(--radius)", overflow: "hidden", flexShrink: 0, background: "var(--surface-strong)" }}>
                <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: ".9rem" }}>{item.name}</p>
                <p style={{ color: "var(--muted)", fontSize: ".78rem", marginTop: 2 }}>Vendor: {item.vendor}</p>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ color: "var(--muted)", fontSize: ".85rem" }}>Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}</span>
                  <span style={{ fontWeight: 600, color: "var(--gold)" }}>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--line)", marginTop: 16, paddingTop: 16 }}>
          <span style={{ fontWeight: 600 }}>Total</span>
          <span style={{ fontWeight: 700, color: "var(--gold)", fontSize: "1.2rem" }}>₹{order.total.toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button className="premium-button" style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 24px" }}>
          <Download size={16} /> Download Invoice
        </button>
        <button className="ghost-button" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FileText size={16} /> View Invoice
        </button>
      </div>
    </motion.div>
  );
}
