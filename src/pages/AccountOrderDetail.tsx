import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Package, MapPin, CreditCard, Download, Truck, RotateCcw } from "lucide-react";
import { generateSingleOrder } from "../lib/mockOrderData";
import OrderTimeline from "../components/OrderTimeline";
import Invoice from "../components/Invoice";
import ReturnForm from "../components/ReturnForm";

type Props = { orderId: string | null; onBack: () => void };

const statusColor: Record<string, string> = {
  pending: "#f39c12", confirmed: "#3498db", packed: "#9b59b6",
  shipped: "#2ecc71", delivered: "#27ae60", cancelled: "#e74c3c",
  out_for_delivery: "#2ecc71", processing: "#9b59b6",
};

const statusLabel: Record<string, string> = {
  pending: "Pending", confirmed: "Confirmed", packed: "Packed", processing: "Processing",
  shipped: "Shipped", out_for_delivery: "Out for Delivery", delivered: "Delivered", cancelled: "Cancelled",
};

export default function AccountOrderDetail({ orderId, onBack }: Props) {
  const [order, setOrder] = useState<any>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showReturn, setShowReturn] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    const o = { ...generateSingleOrder(), id: orderId };
    setOrder(o);
  }, [orderId]);

  if (!order) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 40, textAlign: "center" }}>
        <div className="skeleton" style={{ width: 48, height: 48, borderRadius: "50%", margin: "0 auto 16px" }} />
        <p style={{ color: "var(--muted)" }}>Loading order...</p>
      </motion.div>
    );
  }

  const timelineSteps = order.timeline?.map((t: any) => ({
    status: t.status,
    label: t.label,
    date: t.date || null,
    completed: t.completed || false,
    note: t.note,
  })) || [];

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
            <h1 style={{ fontSize: "1.4rem", fontWeight: 400 }}>#{order.id?.slice(0, 8).toUpperCase() || "NA"}</h1>
            <p style={{ color: "var(--muted)", fontSize: ".85rem", marginTop: 4 }}>
              Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <span className="status-chip" style={{ background: `${statusColor[order.status]}18`, color: statusColor[order.status], border: `1px solid ${statusColor[order.status]}40`, fontSize: ".85rem", padding: "8px 18px" }}>
            {statusLabel[order.status] || order.status?.replace(/_/g, " ") || "Pending"}
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Timeline */}
        <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-lg)" }}>
          <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <Truck size={16} style={{ color: "var(--gold)" }} /> Order Timeline
          </h3>
          <OrderTimeline steps={timelineSteps} cancelled={order.status === "cancelled"} />
        </div>

        {/* Shipping + Payment */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="glass" style={{ padding: 20, borderRadius: "var(--radius-lg)" }}>
            <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <MapPin size={16} style={{ color: "var(--gold)" }} /> Shipping Address
            </h3>
            <p style={{ fontSize: ".9rem", fontWeight: 600 }}>{order.shippingAddress?.name}</p>
            <p style={{ color: "var(--muted)", fontSize: ".82rem", lineHeight: 1.6 }}>
              {order.shippingAddress?.address}<br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}<br />
              Phone: {order.shippingAddress?.phone}
            </p>
          </div>
          <div className="glass" style={{ padding: 20, borderRadius: "var(--radius-lg)" }}>
            <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <CreditCard size={16} style={{ color: "var(--gold)" }} /> Payment
            </h3>
            <p style={{ fontSize: ".9rem" }}>{order.paymentMethod === "upi" ? "UPI" : order.paymentMethod}</p>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ color: "var(--muted)", fontSize: ".85rem" }}>Subtotal</span>
              <span>₹{(order.subtotal || 0).toLocaleString("en-IN")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ color: "var(--muted)", fontSize: ".85rem" }}>Shipping</span>
              <span>{order.shipping === 0 ? "Free" : `₹${order.shipping}`}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, borderTop: "1px solid var(--line)", paddingTop: 8 }}>
              <span style={{ fontWeight: 600 }}>Total</span>
              <span style={{ fontWeight: 700, color: "var(--gold)", fontSize: "1.2rem" }}>₹{(order.grandTotal || 0).toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-xl)", marginBottom: 20 }}>
        <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Package size={16} style={{ color: "var(--gold)" }} /> Items ({(order.items || []).length})
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {(order.items || []).map((item: any, i: number) => (
            <div key={i} style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: i < order.items.length - 1 ? "1px solid var(--line)" : "none" }}>
              {item.image && (
                <div style={{ width: 64, height: 64, borderRadius: "var(--radius)", overflow: "hidden", flexShrink: 0, background: "var(--surface-strong)" }}>
                  <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: ".9rem" }}>{item.name}</p>
                {item.vendor && <p style={{ color: "var(--muted)", fontSize: ".78rem", marginTop: 2 }}>Vendor: {item.vendor}</p>}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ color: "var(--muted)", fontSize: ".85rem" }}>Qty: {item.quantity} {item.size && `(${item.size})`} × ₹{item.price.toLocaleString("en-IN")}</span>
                  <span style={{ fontWeight: 600, color: "var(--gold)" }}>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button onClick={() => setShowInvoice(!showInvoice)} className="premium-button" style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 24px" }}>
          <Download size={16} /> {showInvoice ? "Hide Invoice" : "View Invoice"}
        </button>
        {(order.status === "delivered" || order.status === "shipped" || order.status === "out_for_delivery") && (
          <button onClick={() => setShowReturn(!showReturn)} className="ghost-button" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <RotateCcw size={16} /> {showReturn ? "Hide Return Form" : "Request Return"}
          </button>
        )}
      </div>

      {showInvoice && order.invoice && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ marginTop: 20 }}>
          <Invoice invoice={order.invoice} />
        </motion.div>
      )}

      {showReturn && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ marginTop: 20 }}>
          <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-xl)" }}>
            <ReturnForm orderItemId={order.id || "0"} onSubmit={(data) => { console.log("Return requested", data); setShowReturn(false); }} existing={null} />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
