import { useRef } from "react";
import { Download } from "lucide-react";
import { useToast } from "./Toast";
import type { InvoiceData } from "../types/order";

type Props = { invoice: InvoiceData };

export default function Invoice({ invoice }: Props) {
  const { showToast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    showToast("Invoice download initiated. Use Print → Save as PDF.");
    window.print();
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: ".75rem", textTransform: "uppercase", letterSpacing: "2px",
    color: "var(--muted)", marginBottom: 12,
  };

  const cellStyle: React.CSSProperties = {
    padding: "12px", color: "var(--text)", verticalAlign: "top", fontSize: ".85rem",
  };

  const headStyle: React.CSSProperties = {
    padding: "12px", borderBottom: "1px solid var(--gold)",
    color: "var(--muted)", fontSize: ".78rem", textAlign: "left",
    textTransform: "uppercase", letterSpacing: "1px",
  };

  return (
    <div ref={printRef} className="nabome-invoice" style={{ background: "var(--bg-elevated)", border: "1px solid var(--line)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 24, padding: "36px 36px 24px", borderBottom: "1px solid var(--line)", flexWrap: "wrap" }}>
        <div>
          <p style={{ textTransform: "uppercase", letterSpacing: "3px", color: "var(--muted)", fontSize: ".78rem", marginBottom: 10 }}>
            Tax Invoice
          </p>
          <h2 style={{ margin: 0, fontSize: "2rem", fontWeight: 500, color: "var(--gold)" }}>নবME</h2>
          <p style={{ color: "var(--muted)", marginTop: 8 }}>Premium Fashion Marketplace</p>
        </div>
        <div style={{ minWidth: 220, lineHeight: 1.8 }}>
          <p><strong>Invoice No:</strong> {invoice.invoiceNo}</p>
          <p><strong>Order No:</strong> {invoice.orderNo}</p>
          <p><strong>Invoice Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
          <p><strong>Order Date:</strong> {new Date(invoice.orderDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
        </div>
      </div>

      {/* Addresses */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, padding: "28px 36px", borderBottom: "1px solid var(--line)" }}>
        <div>
          <h3 style={sectionTitle}>Bill To</h3>
          <p style={{ fontWeight: 600 }}>{invoice.customer.name}</p>
          <p style={{ color: "var(--muted)" }}>{invoice.customer.phone}</p>
          {invoice.customer.email && <p style={{ color: "var(--muted)" }}>{invoice.customer.email}</p>}
          <p style={{ color: "var(--muted)", marginTop: 4 }}>
            {invoice.customer.address}<br />
            {invoice.customer.city}, {invoice.customer.state} — {invoice.customer.pincode}
          </p>
        </div>
        <div>
          <h3 style={sectionTitle}>Sold By</h3>
          <p style={{ fontWeight: 600 }}>{invoice.vendor.shop}</p>
          <p style={{ color: "var(--muted)" }}>{invoice.vendor.name}</p>
          <p style={{ color: "var(--muted)" }}>{invoice.vendor.address}</p>
          <p style={{ color: "var(--muted)" }}>{invoice.vendor.phone}</p>
          <p style={{ color: "var(--muted)" }}>{invoice.vendor.email}</p>
        </div>
      </div>

      {/* Items Table */}
      <div style={{ padding: "24px 36px", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
          <thead>
            <tr>
              {["Item", "SKU", "Size", "Color", "Qty", "Price", "Total"].map((h) => (
                <th key={h} style={headStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} style={{ borderBottom: "1px solid var(--line)" }}>
                <td style={cellStyle}>
                  <p style={{ fontWeight: 600 }}>{item.productName}</p>
                  <p style={{ color: "var(--muted)", fontSize: ".78rem" }}>{item.vendorShop}</p>
                </td>
                <td style={cellStyle}>{item.sku}</td>
                <td style={cellStyle}>{item.size}</td>
                <td style={cellStyle}>{item.color}</td>
                <td style={cellStyle}>{item.quantity}</td>
                <td style={cellStyle}>₹{item.price.toLocaleString("en-IN")}</td>
                <td style={cellStyle}><strong>₹{(item.price * item.quantity).toLocaleString("en-IN")}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 36px 24px" }}>
        <div style={{ width: "min(100%, 320px)", borderTop: "1px solid var(--line)", paddingTop: 16, lineHeight: 2.2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)", fontSize: ".9rem" }}>
            <span>Subtotal</span><span>₹{invoice.subtotal.toLocaleString("en-IN")}</span>
          </div>
          {invoice.discount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", color: "#e74c3c", fontSize: ".9rem" }}>
              <span>Discount</span><span>-₹{invoice.discount.toLocaleString("en-IN")}</span>
            </div>
          )}
          {invoice.couponDiscount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", color: "#e74c3c", fontSize: ".9rem" }}>
              <span>Coupon Discount</span><span>-₹{invoice.couponDiscount.toLocaleString("en-IN")}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)", fontSize: ".9rem" }}>
            <span>Shipping</span><span>{invoice.shipping === 0 ? "Free" : `₹${invoice.shipping}`}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)", fontSize: ".9rem" }}>
            <span>Tax ({invoice.taxRate}%)</span><span>₹{invoice.tax.toLocaleString("en-IN")}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--gold)", marginTop: 8, paddingTop: 12, fontSize: "1.2rem", fontWeight: 700 }}>
            <span>Total</span><span style={{ color: "var(--gold)" }}>₹{invoice.total.toLocaleString("en-IN")}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".82rem", color: "var(--muted)", marginTop: 4 }}>
            <span>Payment</span><span>{invoice.paymentMethod} · {invoice.paymentStatus}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "16px 36px", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <p style={{ color: "var(--muted)", fontSize: ".82rem", fontStyle: "italic" }}>{invoice.notes}</p>
        <div style={{ display: "flex", gap: 8 }}>
          <p style={{ color: "var(--muted)", fontSize: ".75rem" }}>Est. Delivery: {new Date(invoice.estimatedDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
          <button onClick={handleDownload} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "1px solid var(--gold)", background: "transparent", color: "var(--gold)", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".78rem" }}>
            <Download size={14} /> Download
          </button>
        </div>
      </div>
    </div>
  );
}
