import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Package, MapPin, CreditCard, Download, Truck, RotateCcw } from "lucide-react";
import { getOrderById } from "../lib/api/orders";
import type { OrderWithItems } from "../lib/api/orders";
import OrderTimeline from "../components/OrderTimeline";
import Invoice from "../components/Invoice";
import ReturnForm from "../components/ReturnForm";

type Props = { orderId: string | null; onBack: () => void };

const statusColor: Record<string, string> = {
  pending: "#f39c12", confirmed: "#3498db", processing: "#9b59b6", packed: "#9b59b6",
  shipped: "#2ecc71", out_for_delivery: "#2ecc71", delivered: "#27ae60", cancelled: "#e74c3c",
};

const statusLabel: Record<string, string> = {
  pending: "Pending", confirmed: "Confirmed", processing: "Processing", packed: "Packed",
  shipped: "Shipped", out_for_delivery: "Out for Delivery", delivered: "Delivered", cancelled: "Cancelled",
};

export default function AccountOrderDetail({ orderId, onBack }: Props) {
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showReturn, setShowReturn] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    getOrderById(orderId).then((data) => {
      setOrder(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 40, textAlign: "center" }}>
        <div className="skeleton" style={{ width: 48, height: 48, borderRadius: "50%", margin: "0 auto 16px" }} />
        <p style={{ color: "var(--muted)" }}>Loading order...</p>
      </motion.div>
    );
  }

  if (!order) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 40, textAlign: "center" }}>
        <p style={{ color: "var(--muted)" }}>Order not found.</p>
        <button onClick={onBack} style={{ marginTop: 16, color: "var(--gold)", background: "none", border: "1px solid var(--gold)", padding: "8px 20px", cursor: "pointer" }}>
          Back to Orders
        </button>
      </motion.div>
    );
  }

  const timelineSteps = order.timeline?.map((t) => ({
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
            <h1 style={{ fontSize: "1.4rem", fontWeight: 400 }}>#{order.orderNumber}</h1>
            <p style={{ color: "var(--muted)", fontSize: ".85rem", marginTop: 4 }}>
              Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <span className="status-chip" style={{ background: `${statusColor[order.orderStatus] || "#999"}18`, color: statusColor[order.orderStatus] || "#999", border: `1px solid ${statusColor[order.orderStatus] || "#999"}40`, fontSize: ".85rem", padding: "8px 18px" }}>
            {statusLabel[order.orderStatus] || order.orderStatus?.replace(/_/g, " ") || "Pending"}
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Timeline */}
        <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-lg)" }}>
          <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <Truck size={16} style={{ color: "var(--gold)" }} /> Order Timeline
          </h3>
          <OrderTimeline steps={timelineSteps} cancelled={order.orderStatus === "cancelled"} />
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
              Phone: {order.shippingAddress.phone}
            </p>
          </div>
          <div className="glass" style={{ padding: 20, borderRadius: "var(--radius-lg)" }}>
            <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <CreditCard size={16} style={{ color: "var(--gold)" }} /> Payment
            </h3>
            <p style={{ fontSize: ".9rem" }}>{order.paymentMethod === "upi" ? "UPI" : order.paymentMethod === "whatsapp" ? "WhatsApp" : order.paymentMethod}</p>
            {order.utr && <p style={{ color: "var(--muted)", fontSize: ".82rem" }}>UTR: {order.utr}</p>}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ color: "var(--muted)", fontSize: ".85rem" }}>Subtotal</span>
              <span>₹{order.subtotal.toLocaleString("en-IN")}</span>
            </div>
            {order.discountAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ color: "var(--muted)", fontSize: ".85rem" }}>Discount</span>
                <span style={{ color: "#22c55e" }}>-₹{order.discountAmount.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ color: "var(--muted)", fontSize: ".85rem" }}>Shipping</span>
              <span>{order.shippingCost === 0 ? "Free" : `₹${order.shippingCost}`}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, borderTop: "1px solid var(--line)", paddingTop: 8 }}>
              <span style={{ fontWeight: 600 }}>Total</span>
              <span style={{ fontWeight: 700, color: "var(--gold)", fontSize: "1.2rem" }}>₹{order.grandTotal.toLocaleString("en-IN")}</span>
            </div>
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
            <div key={item.id || i} style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: i < order.items.length - 1 ? "1px solid var(--line)" : "none" }}>
              {item.productImage && (
                <div style={{ width: 64, height: 64, borderRadius: "var(--radius)", overflow: "hidden", flexShrink: 0, background: "var(--surface-strong)" }}>
                  <img src={item.productImage} alt={item.productName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: ".9rem" }}>{item.productName}</p>
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
        {(order.orderStatus === "delivered" || order.orderStatus === "shipped" || order.orderStatus === "out_for_delivery") && (
          <button onClick={() => setShowReturn(!showReturn)} className="ghost-button" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <RotateCcw size={16} /> {showReturn ? "Hide Return Form" : "Request Return"}
          </button>
        )}
      </div>

      {showInvoice && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ marginTop: 20 }}>
          <Invoice invoice={{
            invoiceNo: `INV-${order.orderNumber}`,
            orderNo: order.orderNumber,
            orderDate: new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "long" }),
            invoiceDate: new Date().toLocaleDateString("en-IN", { dateStyle: "long" }),
            customer: order.shippingAddress,
            vendor: { name: "নবME", shop: "নবME", address: "", phone: "", email: "" },
            items: order.items,
            subtotal: order.subtotal,
            discount: order.discountAmount,
            couponDiscount: order.discountAmount,
            shipping: order.shippingCost,
            tax: order.taxAmount,
            taxRate: 5,
            total: order.grandTotal,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            estimatedDelivery: "",
            notes: order.notes || "",
          }} />
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
