import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import SEO from "../components/SEO";
import { supabase } from "../lib/supabase";
import { getOrdersByEmail } from "../lib/db";

export default function OrderTracking() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      if (data.session?.user?.email) {
        setEmail(data.session.user.email);
        const ords = await getOrdersByEmail(data.session.user.email);
        setOrders(ords as Record<string, unknown>[]);
        setSearched(true);
      }
    };
    checkSession();
  }, []);

  const handleSearch = async () => {
    if (!email) return;
    setLoading(true);
    const ords = await getOrdersByEmail(email);
    setOrders(ords);
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
            <input className="field" placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="premium-button" onClick={handleSearch} disabled={loading}>
              {loading ? "Searching..." : "Find My Orders"}
            </button>
          </div>

          {searched && (
            <div className="container" style={{ marginTop: 40 }}>
              {orders.length === 0 && (
                <p style={{ color: "var(--muted)", textAlign: "center", padding: 40 }}>
                  No orders found for this email.
                </p>
              )}
              {orders.map((o) => (
                <div key={o.id as string} style={{ border: "1px solid var(--line)", padding: 24, background: "var(--surface)", marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <strong style={{ color: "var(--gold)" }}>#{o.bill_no as string}</strong>
                      <p style={{ color: "var(--muted)", fontSize: ".85rem", marginTop: 4 }}>
                        ₹{(o.total as number) || 0} · {o.payment_method as string}
                      </p>
                    </div>
                    <div>
                      <span style={{
                        display: "inline-block",
                        padding: "4px 12px",
                        border: `1px solid ${
                          (o.order_status as string) === "delivered" ? "#27ae60" :
                          (o.order_status as string) === "shipped" ? "#2ecc71" :
                          (o.order_status as string) === "cancelled" ? "#e74c3c" :
                          (o.order_status as string) === "processing" ? "#9b59b6" :
                          (o.order_status as string) === "confirmed" ? "#3498db" : "#f39c12"
                        }`,
                        color: "var(--text)",
                        fontSize: ".8rem",
                        textTransform: "uppercase",
                      }}>
                        {o.order_status as string || "pending"}
                      </span>
                    </div>
                  </div>
                  <div style={{ marginTop: 12, borderTop: "1px solid var(--line)", paddingTop: 12 }}>
                    {(o.items as Array<Record<string, unknown>>)?.map((item, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: ".85rem", color: "var(--muted)", padding: "4px 0" }}>
                        <span>{item.name as string} x{item.quantity as number}</span>
                        <span>₹{(item.price as number) * (item.quantity as number)}</span>
                      </div>
                    ))}
                  </div>
                  <p style={{ marginTop: 8, fontSize: ".8rem", color: "var(--muted)" }}>
                    {new Date(o.created_at as string).toLocaleDateString("en-IN", { dateStyle: "long" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
