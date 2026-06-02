import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import SEO from "../components/SEO";
import OrderTimeline from "../components/OrderTimeline";
import { supabase } from "../lib/supabase";
import { getOrdersByUser, getOrderByNumber } from "../lib/api/orders";
import type { OrderWithItems } from "../lib/api/orders";
import { Search, Truck, ChevronRight } from "lucide-react";

export default function OrderTracking() {
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user?.id) {
        setEmail(data.session.user.email || "");
        setLoading(true);
        const userOrders = await getOrdersByUser(data.session.user.id);
        if (userOrders.length > 0) {
          setOrders(userOrders);
          setSearched(true);
        }
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const handleSearch = async () => {
    if (!orderNumber.trim()) return;
    setLoading(true);
    try {
      const order = await getOrderByNumber(orderNumber.trim());
      if (order) {
        setOrders([order]);
      } else {
        setOrders([]);
      }
    } catch {
      setOrders([]);
    }
    setSearched(true);
    setLoading(false);
  };

  return (
    <>
      <SEO title="Track Order | নবME" description="View your নবME order history and tracking status." path="/order-tracking" />
      <Navbar />
      <main className="page">
        <section className="section">
          <div className="container split-intro">
            <div>
              <p className="eyebrow">Order Tracking</p>
              <h1 className="display">Your Orders</h1>
            </div>
            <p className="lede">View all your নবME orders and their current status.</p>
          </div>

          <div className="container glass" style={{ display: "grid", gap: 16, maxWidth: 760, padding: 28 }}>
            <input className="field" placeholder="Enter order number (e.g. NB-1234567890-ABCD)" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
            <button className="premium-button" onClick={handleSearch} disabled={loading}>
              {loading ? "Searching..." : <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Search size={16} />Track My Order</span>}
            </button>
            {email && (
              <p style={{ color: "var(--muted)", fontSize: ".82rem", textAlign: "center" }}>
                Logged in as {email}. <Link to="/account?tab=orders" style={{ color: "var(--gold)" }}>View all orders</Link>
              </p>
            )}
          </div>

          {searched && (
            <div className="container" style={{ marginTop: 40 }}>
              {orders.length === 0 && (
                <p style={{ color: "var(--muted)", textAlign: "center", padding: 40 }}>
                  No order found with that number.
                </p>
              )}
              {orders.map((order) => {
                const timelineSteps = order.timeline?.map((t) => ({
                  status: t.status,
                  label: t.label,
                  date: t.date || null,
                  completed: t.completed || false,
                  note: t.note,
                })) || [];

                return (
                  <div key={order.id} style={{ border: "1px solid var(--line)", padding: 24, background: "var(--surface)", marginBottom: 24, borderRadius: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                      <div>
                        <strong style={{ color: "var(--gold)", fontSize: "1.1rem" }}>#{order.orderNumber}</strong>
                        <p style={{ color: "var(--muted)", fontSize: ".85rem", marginTop: 4 }}>
                          ₹{order.grandTotal.toLocaleString("en-IN")} · {order.paymentMethod === "upi" ? "UPI" : "WhatsApp"} · {new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "long" })}
                        </p>
                      </div>
                      <div>
                        <span style={{
                          display: "inline-block",
                          padding: "4px 14px",
                          border: `1px solid ${
                            order.orderStatus === "delivered" ? "#27ae60" :
                            order.orderStatus === "shipped" || order.orderStatus === "out_for_delivery" ? "#2ecc71" :
                            order.orderStatus === "cancelled" ? "#e74c3c" :
                            order.orderStatus === "processing" || order.orderStatus === "packed" ? "#9b59b6" :
                            order.orderStatus === "confirmed" ? "#3498db" : "#f39c12"
                          }`,
                          color: "var(--text)",
                          fontSize: ".8rem",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                        }}>
                          {order.orderStatus?.replace(/_/g, " ") || "Pending"}
                        </span>
                      </div>
                    </div>

                    <div style={{ marginTop: 16 }}>
                      <OrderTimeline steps={timelineSteps} cancelled={order.orderStatus === "cancelled"} />
                    </div>

                    <div style={{ marginTop: 16, borderTop: "1px solid var(--line)", paddingTop: 16 }}>
                      {order.items.map((item, i) => (
                        <div key={item.id || i} style={{ display: "flex", justifyContent: "space-between", fontSize: ".85rem", color: "var(--muted)", padding: "4px 0" }}>
                          <span>{item.productName} x{item.quantity} {item.size && `(${item.size})`}</span>
                          <span>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <Link to={`/account?tab=orders&order=${order.id}`}>
                        <button style={{ padding: "8px 16px", border: "1px solid var(--gold)", background: "transparent", color: "var(--gold)", cursor: "pointer", fontSize: ".8rem", display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <Truck size={14} />View Details <ChevronRight size={12} />
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
