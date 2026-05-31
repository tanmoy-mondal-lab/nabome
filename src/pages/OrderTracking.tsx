import { useState } from "react";
import Navbar from "../components/Navbar";
import SEO from "../components/SEO";
import { useToast } from "../components/Toast";

export default function OrderTracking() {
  const [orderId, setOrderId] = useState("");
  const { showToast } = useToast();

  return (
    <>
      <SEO title="Track Order | নবME" description="Track নবME WhatsApp orders and get customer care support for Bengali streetwear purchases." path="/order-tracking" />
      <Navbar />
      <main className="page">
        <section className="section">
          <div className="container split-intro">
            <div>
              <p className="eyebrow">Order Tracking</p>
              <h1 className="display">Track your drop</h1>
            </div>
            <p className="lede">Enter your WhatsApp order reference. Full courier automation is admin-ready for a future backend integration.</p>
          </div>
          <div className="container glass" style={{ display: "grid", gap: 16, maxWidth: 760, padding: 28 }}>
            <input className="field" placeholder="Example: নবME-2026-001" value={orderId} onChange={(event) => setOrderId(event.target.value)} />
            <button className="premium-button" onClick={() => showToast(orderId ? "Your order is being prepared. WhatsApp support will confirm tracking." : "Enter an order reference")}>
              Check Status
            </button>
            <a className="ghost-button quick-link" href="https://wa.me/919163854706" target="_blank" rel="noreferrer">
              Ask on WhatsApp
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
