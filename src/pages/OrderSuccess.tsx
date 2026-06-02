import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Package, ChevronRight } from "lucide-react";
import { getOrderByNumber, getOrderById } from "../lib/api/orders";
import type { OrderWithItems } from "../lib/api/orders";
import type { CartItem } from "../context/CartContext";

interface Bill {
  billNo: string;
  date: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    customerUpi?: string;
  };
  items: CartItem[];
  shipping: number;
  taxLabel: string;
  total: number;
  paymentMethod: string;
}

function formatBillMessage(bill: Bill): string {
  const items = bill.items
    .map(
      (item) => `
• ${item.name}
  Qty: ${item.quantity} | Size: ${item.selectedSize || "N/A"} | Colour: ${item.selectedColor || "N/A"}
  ₹${item.price} x ${item.quantity} = ₹${item.price * item.quantity}
`
    )
    .join("");

  const upiLine = bill.customer.customerUpi && bill.customer.customerUpi !== "Not Provided"
    ? `\nUPI: ${bill.customer.customerUpi}` : "";

  return `
🛍️ *নবME - Order Confirmed*

━━━━━━━━━━━━━━━━━━

*Bill No:* ${bill.billNo}
*Date:* ${bill.date}
*Payment:* UPI

━━━━━━━━━━━━━━━━━━

*ITEMS*
${items}

━━━━━━━━━━━━━━━━━━

*Shipping:* Free
*Total:* ₹${bill.total}

━━━━━━━━━━━━━━━━━━

*Shipping To:*
${bill.customer.name}
${bill.customer.address}
${bill.customer.city}, ${bill.customer.state}
PIN: ${bill.customer.pincode}${upiLine}

━━━━━━━━━━━━━━━━━━

Thank you for shopping with নবME 💛
`;
}

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderParam = searchParams.get("order");
  const [liveOrder, setLiveOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(!!orderParam);
  const [sentStatus, setSentStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => {
    if (orderParam) {
      (async () => {
        let order = await getOrderByNumber(orderParam);
        if (!order) order = await getOrderById(orderParam);
        if (order) setLiveOrder(order);
        setLoading(false);
      })();
    }
  }, [orderParam]);

  const bill = useMemo<Bill | null>(() => {
    if (liveOrder) {
      return {
        billNo: liveOrder.orderNumber,
        date: new Date(liveOrder.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
        customer: {
          name: liveOrder.customerName,
          phone: liveOrder.customerPhone,
          email: liveOrder.customerEmail || "",
          address: liveOrder.shippingAddress.address,
          city: liveOrder.shippingAddress.city,
          state: liveOrder.shippingAddress.state,
          pincode: liveOrder.shippingAddress.pincode,
        },
        items: liveOrder.items.map(i => ({
          id: parseInt(i.productId) || 0,
          name: i.productName,
          price: i.price,
          image: i.productImage,
          quantity: i.quantity,
          selectedSize: i.size,
          selectedColor: i.color,
        })),
        shipping: liveOrder.shippingCost,
        taxLabel: liveOrder.taxLabel,
        total: liveOrder.grandTotal,
        paymentMethod: liveOrder.paymentMethod,
      };
    }
    const saved = localStorage.getItem("nabome-last-bill");
    if (!saved) return null;
    try {
      return JSON.parse(saved) as Bill;
    } catch {
      return null;
    }
  }, [liveOrder]);

  useEffect(() => {
    localStorage.removeItem("nabome-cart");
  }, []);

  const sendWhatsApp = () => {
    if (!bill) return;
    const message = formatBillMessage(bill);
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${bill.customer.phone.replace(/[^0-9]/g, "")}?text=${encoded}`, "_blank");
    setSentStatus("sent");
  };

  const sendEmail = () => {
    if (!bill) return;
    const subject = encodeURIComponent(`নবME Order Confirmed - ${bill.billNo}`);
    const body = encodeURIComponent(formatBillMessage(bill).replace(/\*/g, ""));
    window.open(`mailto:${bill.customer.email}?subject=${subject}&body=${body}`, "_blank");
    setSentStatus("sent");
  };

  useEffect(() => {
    if (!bill) return;
    const timer = setTimeout(() => {
      const message = formatBillMessage(bill);
      const encoded = encodeURIComponent(message);
      window.open(`https://wa.me/${bill.customer.phone.replace(/[^0-9]/g, "")}?text=${encoded}`, "_blank");
      setSentStatus("sent");
    }, 800);
    return () => clearTimeout(timer);
  }, [bill]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", padding: "56px 6%", textAlign: "center" }}>
        <div className="skeleton" style={{ width: 48, height: 48, borderRadius: "50%", margin: "0 auto 16px" }} />
        <p style={{ color: "var(--muted)" }}>Loading order details...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", padding: "56px 6%" }}>
      <div className="order-success-actions" style={{ maxWidth: "980px", margin: "0 auto 40px", textAlign: "center" }}>
        <div style={{ width: "80px", height: "80px", margin: "0 auto 28px", border: "2px solid var(--gold)", color: "var(--gold)", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "2rem", fontWeight: 600 }}>
          ✓
        </div>

        <p style={{ textTransform: "uppercase", letterSpacing: "4px", color: "var(--muted)", fontSize: ".85rem" }}>
          Order Received
        </p>

        <h1 style={{ fontSize: "clamp(2.8rem,7vw,5rem)", fontWeight: 300, marginTop: "20px", lineHeight: 1 }}>
          Thank You
          <br />
          For Your Order
        </h1>

        <p style={{ color: "var(--muted)", lineHeight: 1.9, marginTop: "26px", maxWidth: "560px", marginLeft: "auto", marginRight: "auto" }}>
          Your order has been confirmed. You can send the bill to yourself via WhatsApp or Email below.
        </p>

        {bill && (
          <div style={{ marginTop: "24px", display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            <button onClick={() => sendWhatsApp()} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 24px", border: "1px solid var(--gold)", background: "var(--gold-soft)", color: "var(--gold)", cursor: "pointer", fontWeight: 700, letterSpacing: "0.05em", fontSize: ".9rem" }}>
              Send via WhatsApp
            </button>
            <button onClick={sendEmail} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 24px", border: "1px solid var(--line)", background: "transparent", color: "var(--text)", cursor: "pointer", fontWeight: 700, letterSpacing: "0.05em", fontSize: ".9rem" }}>
              Send via Email
            </button>
          </div>
        )}

        {sentStatus === "sent" && (
          <p style={{ color: "var(--gold)", marginTop: 16, fontSize: ".9rem" }}>
            ✓ Bill sent successfully
          </p>
        )}

        <div style={{ marginTop: "28px", display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}>
          {bill && (
            <button onClick={() => window.print()} style={{ padding: "16px 30px", border: "none", background: "var(--gold)", color: "#050505", cursor: "pointer", fontWeight: 600 }}>
              Print / Save PDF
            </button>
          )}
          <Link to="/order-tracking">
            <button style={{ padding: "16px 30px", border: "1px solid var(--gold)", background: "transparent", color: "var(--gold)", cursor: "pointer", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Package size={16} />Track Order <ChevronRight size={14} />
            </button>
          </Link>
          <Link to="/">
            <button style={{ padding: "16px 30px", border: "1px solid var(--gold)", background: "transparent", color: "var(--gold)", cursor: "pointer", fontWeight: 600 }}>
              Continue Shopping
            </button>
          </Link>
          <Link to="/category">
            <button style={{ padding: "16px 30px", border: "1px solid var(--gold)", background: "transparent", color: "var(--gold)", cursor: "pointer", fontWeight: 600 }}>
              Browse Collection
            </button>
          </Link>
        </div>
      </div>

      {bill ? (
        <BillPreview bill={bill} orderNumber={liveOrder?.orderNumber} />
      ) : (
        <div className="order-success-actions" style={{ maxWidth: "720px", margin: "0 auto", border: "1px solid var(--line)", padding: "32px", textAlign: "center", color: "var(--muted)", lineHeight: 1.7 }}>
          Bill details are not available for this session. Please place a new order to generate a bill.
        </div>
      )}
    </div>
  );
}

function BillPreview({ bill, orderNumber }: { bill: Bill; orderNumber?: string }) {
  return (
    <section className="nabome-bill" style={{ maxWidth: "980px", margin: "0 auto", border: "1px solid var(--line)", background: "var(--bg-elevated)", textAlign: "left" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "24px", padding: "36px", borderBottom: "1px solid var(--line)", flexWrap: "wrap" }}>
        <div>
          <p style={{ textTransform: "uppercase", letterSpacing: "3px", color: "var(--muted)", fontSize: ".78rem", marginBottom: "10px" }}>
            Tax Invoice
          </p>
          <h2 style={{ margin: 0, fontSize: "2rem", fontWeight: 500, color: "var(--gold)" }}>
            নবME
          </h2>
          <p style={{ color: "var(--muted)", marginTop: "8px" }}>
            Fashion and lifestyle order
          </p>
        </div>
        <div style={{ minWidth: "220px", lineHeight: 1.8 }}>
          <p><strong>Bill No:</strong> {bill.billNo}</p>
          <p><strong>Date:</strong> {bill.date}</p>
          <p><strong>Payment:</strong> {bill.paymentMethod === "upi" ? "UPI / QR" : "WhatsApp Order"}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "28px", padding: "32px 36px", borderBottom: "1px solid var(--line)" }}>
        <div>
          <h3 style={{ margin: "0 0 12px", fontSize: ".85rem", textTransform: "uppercase", letterSpacing: "2px", color: "var(--muted)" }}>Bill To</h3>
          <p style={{ color: "var(--text)", lineHeight: 1.8 }}>{bill.customer.name}</p>
          <p style={{ color: "var(--text)", lineHeight: 1.8 }}>{bill.customer.phone}</p>
          <p style={{ color: "var(--text)", lineHeight: 1.8 }}>{bill.customer.email}</p>
        </div>
        <div>
          <h3 style={{ margin: "0 0 12px", fontSize: ".85rem", textTransform: "uppercase", letterSpacing: "2px", color: "var(--muted)" }}>Shipping Address</h3>
          <p style={{ color: "var(--text)", lineHeight: 1.8 }}>{bill.customer.address}</p>
          <p style={{ color: "var(--text)", lineHeight: 1.8 }}>{bill.customer.city}, {bill.customer.state}</p>
          <p style={{ color: "var(--text)", lineHeight: 1.8 }}>PIN: {bill.customer.pincode}</p>
        </div>
      </div>

      <div style={{ padding: "32px 36px", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "680px" }}>
          <thead>
            <tr>
              {["Item", "Size", "Colour", "Qty", "Price", "Subtotal"].map((heading) => (
                <th key={heading} style={{ padding: "12px", borderBottom: "1px solid var(--gold)", color: "var(--muted)", fontSize: ".82rem", textAlign: "left", textTransform: "uppercase", letterSpacing: "1px" }}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item, index) => (
              <tr key={`${item.id}-${index}`} style={{ borderBottom: "1px solid var(--line)" }}>
                <td style={{ padding: "14px 12px", color: "var(--text)", verticalAlign: "top" }}>{item.name}</td>
                <td style={{ padding: "14px 12px", color: "var(--text)", verticalAlign: "top" }}>{item.selectedSize || "N/A"}</td>
                <td style={{ padding: "14px 12px", color: "var(--text)", verticalAlign: "top" }}>{item.selectedColor || "N/A"}</td>
                <td style={{ padding: "14px 12px", color: "var(--text)", verticalAlign: "top" }}>{item.quantity}</td>
                <td style={{ padding: "14px 12px", color: "var(--text)", verticalAlign: "top" }}>₹{item.price}</td>
                <td style={{ padding: "14px 12px", color: "var(--text)", verticalAlign: "top" }}>₹{item.price * item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 36px 36px" }}>
        <div style={{ width: "min(100%, 360px)", borderTop: "1px solid var(--line)", paddingTop: "18px", lineHeight: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", color: "var(--muted)" }}>
            <span>Shipping</span>
            <span>{bill.shipping === 0 ? "Free" : `₹${bill.shipping}`}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", color: "var(--muted)" }}>
            <span>Taxes</span>
            <span>{bill.taxLabel}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", color: "var(--muted)", borderTop: "1px solid var(--line)", marginTop: "10px", paddingTop: "14px", fontSize: "1.25rem", fontWeight: 700 }}>
            <span>Total</span>
            <span>₹{bill.total}</span>
          </div>
        </div>
      </div>

      {orderNumber && (
        <div style={{ padding: "16px 36px 36px", textAlign: "center" }}>
          <Link to={`/account?tab=orders`} style={{ color: "var(--gold)", fontSize: ".9rem", textDecoration: "underline" }}>
            View in My Orders
          </Link>
        </div>
      )}
    </section>
  );
}
