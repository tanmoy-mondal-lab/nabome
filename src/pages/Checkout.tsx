import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "../components/Navbar";
import SEO from "../components/SEO";
import { useCart } from "../context/CartContext";
import { createOrder } from "../lib/db";
import type { CustomerData } from "../lib/db";
import { supabase } from "../lib/supabase";
import { loadProfile, saveProfileLocally, saveProfileToSupabase } from "../lib/db";

const MERCHANT_UPI = "mondaltanmoy230@oksbi";
const MERCHANT_NAME = "নবME";
const PHONE = 919163854706;

function buildBill(customer: CustomerData, items: import("../lib/db").CartItem[], total: number, paymentMethod: string) {
  return {
    billNo: `NAB-${Date.now()}`,
    date: new Date().toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }),
    customer,
    items,
    shipping: 0,
    taxLabel: "Included",
    total,
    paymentMethod,
  };
}

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const paidRef = useRef(false);

  const [form, setForm] = useState(() => {
    const saved = loadProfile();
    return {
      name: saved.name,
      phone: saved.phone,
      email: saved.email,
      address: saved.address,
      city: saved.city,
      state: saved.state,
      pincode: saved.pincode,
      customerUpi: saved.customerUpi,
    };
  });
  const [paymentMethod, setPaymentMethod] = useState<"whatsapp" | "upi">("whatsapp");
  const [upiStep, setUpiStep] = useState<"idle" | "paying" | "confirming" | "done">("idle");
  const [qrView, setQrView] = useState(false);
  const [utr, setUtr] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const update = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name?.trim()) e.name = "Required";
    if (!form.phone?.trim() || !/^[0-9]{10,15}$/.test(form.phone.trim())) e.phone = "Valid 10-digit phone required";
    if (!form.address?.trim()) e.address = "Required";
    if (!form.city?.trim()) e.city = "Required";
    if (!form.state?.trim()) e.state = "Required";
    if (!form.pincode?.trim() || !/^[0-9]{6}$/.test(form.pincode.trim())) e.pincode = "6-digit pincode required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email format";
    if (!cart.length) e.cart = "Cart is empty";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const customer: CustomerData = {
    name: form.name,
    phone: form.phone,
    email: form.email || "Not Provided",
    address: form.address,
    city: form.city,
    state: form.state,
    pincode: form.pincode,
    customerUpi: form.customerUpi || undefined,
  };

  const upiLink = `upi://pay?pa=${MERCHANT_UPI}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${total}&cu=INR&tn=${encodeURIComponent(`নবME Order ${form.name}`)}`;

  function saveProfileOnce() {
    const data = {
      name: form.name,
      phone: form.phone,
      email: form.email,
      address: form.address,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      customerUpi: form.customerUpi,
      role: "customer",
    };
    saveProfileLocally(data);
    saveProfileToSupabase(data);
  }

  async function saveOrder(paymentMethod: string) {
    const session = supabase ? await supabase.auth.getSession() : null;
    const userEmail = session?.data?.session?.user?.email;

    const bill = buildBill(customer, cart, total, paymentMethod === "upi" ? "UPI / QR" : "WhatsApp");

    const billWithMeta = {
      ...bill,
      paymentStatus: "paid" as const,
      orderStatus: "confirmed" as const,
      userEmail,
      utr: utr || undefined,
    };

    createOrder(billWithMeta);

    localStorage.setItem("nabome-last-bill", JSON.stringify(bill));
    localStorage.removeItem("nabome-cart");
    clearCart();
  }

  const handlePayNow = () => {
    if (!validate()) return;
    setUpiStep("paying");
    setQrView(false);
    saveProfileOnce();
    window.open(upiLink, "_blank");
  };

  useEffect(() => {
    if (upiStep !== "paying") return;
    const onFocus = () => {
      if (!paidRef.current) {
        paidRef.current = true;
        setUpiStep("confirming");
        saveOrder("upi");
        setTimeout(() => {
          setUpiStep("done");
          navigate("/order-success");
        }, 1000);
      }
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upiStep]);

  const sendToWhatsapp = () => {
    if (!validate()) return;

    const bill = buildBill(customer, cart, total, "whatsapp");
    localStorage.setItem("nabome-last-bill", JSON.stringify(bill));
    saveProfileOnce();
    saveOrder("whatsapp");

    const productList = cart
      .map((item) => `
${item.name}

Qty: ${item.quantity}

Size: ${item.selectedSize || "N/A"}

Color: ${item.selectedColor || "N/A"}

Subtotal: ₹${item.price * item.quantity}
`)
      .join("\n");

    const message = `
🛍️ নবME ORDER

━━━━━━━━━━━━━━

CUSTOMER DETAILS

Name:
${form.name}

Phone:
${form.phone}

Email:
${form.email || "Not Provided"}

UPI:
${form.customerUpi || "Not Provided"}

Address:
${form.address}

City:
${form.city}

State:
${form.state}

Pincode:
${form.pincode}

━━━━━━━━━━━━━━

PRODUCTS

${productList}

━━━━━━━━━━━━━━

TOTAL: ₹${total}
`;

    window.open(
      `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`,
      "_blank"
    );

    setTimeout(() => {
      navigate("/order-success");
    }, 1000);
  };

  const fieldMsg = (key: string) =>
    errors[key] ? <span style={{ color: "#e74c3c", fontSize: ".8rem", marginTop: 2 }}>{errors[key]}</span> : null;

  return (
    <>
      <Navbar />
      <SEO title="Checkout | নবME" description="Complete your order at নবME — secure checkout with UPI and WhatsApp." path="/checkout" />

      <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>
        <section style={{ padding: "80px 6% 50px", borderBottom: "1px solid var(--line)" }}>
          <p style={{ textTransform: "uppercase", letterSpacing: "3px", color: "var(--muted)", fontSize: ".85rem" }}>
            Checkout
          </p>
          <h1 style={{ fontSize: "clamp(3rem,7vw,5rem)", fontWeight: 300, marginTop: "15px" }}>
            Secure Checkout
          </h1>
        </section>

        <section style={{ padding: "60px 6%" }}>
          {errors.cart && (
            <div style={{ padding: 16, border: "1px solid #e74c3c", marginBottom: 24, color: "#e74c3c", background: "var(--surface)" }}>
              {errors.cart}
            </div>
          )}

          <div className="checkout-grid">
            {/* FORM */}
            <div>
              <h2 style={{ marginBottom: "30px", fontWeight: 500 }}>Contact Information</h2>
              <div style={{ display: "grid", gap: "18px" }}>
                <div>
                  <input placeholder="Full Name" value={form.name} onChange={(e) => update("name", e.target.value)} style={inputStyle} />
                  {fieldMsg("name")}
                </div>
                <div>
                  <input placeholder="Phone Number" value={form.phone} onChange={(e) => update("phone", e.target.value)} style={inputStyle} />
                  {fieldMsg("phone")}
                </div>
                <div>
                  <input placeholder="Email Address (Optional)" value={form.email} onChange={(e) => update("email", e.target.value)} style={inputStyle} />
                  {fieldMsg("email")}
                </div>
              </div>

              <h2 style={{ marginTop: "60px", marginBottom: "30px", fontWeight: 500 }}>Shipping Address</h2>
              <div style={{ display: "grid", gap: "18px" }}>
                <div>
                  <textarea rows={5} placeholder="Street Address" value={form.address} onChange={(e) => update("address", e.target.value)} style={{ ...inputStyle, resize: "none" }} />
                  {fieldMsg("address")}
                </div>
                <div>
                  <input placeholder="City" value={form.city} onChange={(e) => update("city", e.target.value)} style={inputStyle} />
                  {fieldMsg("city")}
                </div>
                <div>
                  <input placeholder="State" value={form.state} onChange={(e) => update("state", e.target.value)} style={inputStyle} />
                  {fieldMsg("state")}
                </div>
                <div>
                  <input placeholder="Pincode" value={form.pincode} onChange={(e) => update("pincode", e.target.value)} style={inputStyle} />
                  {fieldMsg("pincode")}
                </div>
              </div>

              {paymentMethod === "upi" && (
                <>
                  <h2 style={{ marginTop: "60px", marginBottom: "30px", fontWeight: 500 }}>UPI Payment Details</h2>
                  <div style={{ display: "grid", gap: "18px" }}>
                    <input placeholder="Your UPI ID (e.g. name@upi) or phone number" value={form.customerUpi} onChange={(e) => update("customerUpi", e.target.value)} style={inputStyle} />
                    <input placeholder="UPI Transaction Reference (UTR) — optional" value={utr} onChange={(e) => setUtr(e.target.value)} style={inputStyle} />
                    <div style={{ padding: "16px", border: "1px solid var(--gold)", background: "var(--gold-soft)", fontSize: ".9rem", lineHeight: 1.7 }}>
                      <strong style={{ color: "var(--gold)" }}>Payment Request</strong>
                      <p style={{ color: "var(--muted)", marginTop: 8 }}>
                        Pay to: <strong style={{ color: "var(--text)" }}>{MERCHANT_UPI}</strong>
                      </p>
                      <p style={{ color: "var(--muted)" }}>
                        Amount: <strong style={{ color: "var(--text)" }}>₹{total}</strong>
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ORDER SUMMARY */}
            <div className="checkout-sidebar">
              <h2 style={{ marginBottom: "30px", fontWeight: 500 }}>Order Summary</h2>

              {cart.map((item) => (
                <div key={`${item.id}-${item.selectedSize || ""}-${item.selectedColor || ""}`} style={{ paddingBottom: "20px", marginBottom: "20px", borderBottom: "1px solid var(--line)" }}>
                  <h4 style={{ marginBottom: "10px", fontWeight: 600 }}>{item.name}</h4>
                  <div style={{ color: "var(--muted)", fontSize: ".95rem", lineHeight: 1.8 }}>
                    <p>Quantity: {item.quantity}</p>
                    <p>Size: {item.selectedSize || "N/A"}</p>
                    <p>Colour: {item.selectedColor || "N/A"}</p>
                  </div>
                  <p style={{ marginTop: "10px", fontWeight: 600 }}>₹{item.price * item.quantity}</p>
                </div>
              ))}

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", color: "var(--muted)" }}>
                <span>Shipping</span><span>Free</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "25px", color: "var(--muted)" }}>
                <span>Taxes</span><span>Included</span>
              </div>
              <div style={{ borderTop: "1px solid var(--line)", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>Total</strong><h2>₹{total}</h2>
              </div>

              <div style={{ marginTop: "40px", paddingTop: "30px", borderTop: "1px solid var(--line)" }}>
                <h3 style={{ marginBottom: "20px" }}>Payment Method</h3>
                <div style={{ display: "grid", gap: "12px" }}>
                  <button onClick={() => { setPaymentMethod("whatsapp"); setUpiStep("idle"); }} style={{ display: "flex", alignItems: "center", gap: 12, border: paymentMethod === "whatsapp" ? "1px solid var(--gold)" : "1px solid var(--line)", background: paymentMethod === "whatsapp" ? "var(--gold-soft)" : "transparent", color: "var(--text)", padding: "14px", cursor: "pointer", textAlign: "left", fontSize: ".95rem" }}>
                    <span style={{ fontSize: "1.2rem" }}>{paymentMethod === "whatsapp" ? "●" : "○"}</span>
                    <div>
                      <strong>WhatsApp Order</strong>
                      <p style={{ color: "var(--muted)", fontSize: ".85rem", marginTop: 2 }}>Manual order via WhatsApp</p>
                    </div>
                  </button>

                  <button onClick={() => { setPaymentMethod("upi"); setUpiStep("idle"); setQrView(false); }} style={{ display: "flex", alignItems: "center", gap: 12, border: paymentMethod === "upi" ? "1px solid var(--gold)" : "1px solid var(--line)", background: paymentMethod === "upi" ? "var(--gold-soft)" : "transparent", color: "var(--text)", padding: "14px", cursor: "pointer", textAlign: "left", fontSize: ".95rem" }}>
                    <span style={{ fontSize: "1.2rem" }}>{paymentMethod === "upi" ? "●" : "○"}</span>
                    <div>
                      <strong>UPI AutoPay → mondaltanmoy230@oksbi</strong>
                      <p style={{ color: "var(--muted)", fontSize: ".85rem", marginTop: 2 }}>Pay via GPay, PhonePe, Paytm — auto billing</p>
                    </div>
                  </button>
                </div>
              </div>

              {paymentMethod === "upi" && total > 0 && (
                <div style={{ marginTop: "30px" }}>
                  {upiStep === "idle" && !qrView && (
                    <div style={{ display: "grid", gap: 12 }}>
                      <div style={{ padding: "16px", border: "1px solid var(--line)", textAlign: "center", fontSize: ".9rem", lineHeight: 1.7 }}>
                        <p style={{ color: "var(--muted)" }}>Payment request will be sent to</p>
                        <strong style={{ fontSize: "1.2rem", color: "var(--gold)", letterSpacing: "0.03em" }}>{form.customerUpi || "your UPI app"}</strong>
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
                          <p style={{ color: "var(--muted)", fontSize: ".85rem" }}>Paying to</p>
                          <strong style={{ fontSize: "1rem" }}>{MERCHANT_UPI}</strong>
                        </div>
                      </div>
                      <button onClick={handlePayNow} disabled={Object.keys(errors).length > 0} style={{ width: "100%", padding: "20px", border: "none", background: "var(--gold)", color: "#050505", cursor: "pointer", fontWeight: 800, fontSize: "1.1rem", letterSpacing: "0.05em" }}>
                        Pay ₹{total} via UPI
                      </button>
                      <button onClick={() => setQrView(true)} style={{ width: "100%", padding: "14px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", fontWeight: 600, fontSize: ".9rem" }}>
                        Show QR Code to scan
                      </button>
                      <p style={{ fontSize: ".8rem", color: "var(--muted)", textAlign: "center", lineHeight: 1.6 }}>
                        Opens your UPI app. Complete the payment, then return here — bill auto-generates.
                      </p>
                    </div>
                  )}

                  {upiStep === "idle" && qrView && (
                    <div style={{ padding: "24px", border: "1px solid var(--line)", textAlign: "center" }}>
                      <p className="eyebrow" style={{ marginBottom: 16 }}>Scan to Pay</p>
                      <div style={{ display: "grid", placeItems: "center", gap: 16 }}>
                        <a href={upiLink} target="_blank" rel="noreferrer">
                          <QRCodeSVG value={upiLink} size={180} bgColor="#ffffff" fgColor="#050505" level="M" />
                        </a>
                        <p style={{ fontSize: ".85rem", color: "var(--muted)" }}>
                          Scan with any UPI app to pay <strong style={{ color: "var(--text)" }}>{MERCHANT_UPI}</strong>
                        </p>
                        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16, width: "100%" }}>
                          <p style={{ fontSize: ".85rem", color: "var(--muted)", marginBottom: 6 }}>Amount</p>
                          <strong style={{ fontSize: "1.5rem" }}>₹{total}</strong>
                        </div>
                        <button onClick={handlePayNow} style={{ width: "100%", padding: "16px", border: "1px solid var(--gold)", background: "transparent", color: "var(--gold)", cursor: "pointer", fontWeight: 700, fontSize: ".95rem" }}>
                          Open UPI App Instead
                        </button>
                        <button onClick={() => setQrView(false)} style={{ fontSize: ".85rem", color: "var(--muted)", cursor: "pointer", background: "none", border: "none", textDecoration: "underline" }}>
                          Back to auto-pay
                        </button>
                      </div>
                    </div>
                  )}

                  {upiStep === "paying" && (
                    <div style={{ padding: "32px", border: "1px solid var(--gold)", textAlign: "center", background: "var(--gold-soft)" }}>
                      <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>⏳</div>
                      <h3 style={{ marginBottom: 12 }}>Payment request sent</h3>
                      <p className="lede" style={{ fontSize: ".95rem" }}>
                        Complete the payment in your UPI app to <strong>{MERCHANT_UPI}</strong>
                      </p>
                      <p className="lede" style={{ fontSize: ".85rem", marginTop: 12 }}>
                        Bill will auto-generate when you return to this page.
                      </p>
                    </div>
                  )}

                  {upiStep === "confirming" && (
                    <div style={{ padding: "32px", border: "1px solid var(--gold)", textAlign: "center" }}>
                      <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>✓</div>
                      <h3 style={{ marginBottom: 12, color: "var(--gold)" }}>Payment successful!</h3>
                      <p className="lede">Generating your bill...</p>
                    </div>
                  )}

                  {upiStep === "done" && (
                    <div style={{ padding: "32px", border: "1px solid var(--gold)", textAlign: "center", background: "var(--gold-soft)" }}>
                      <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>🎉</div>
                      <h3 style={{ marginBottom: 12, color: "var(--gold)" }}>Order placed!</h3>
                      <p className="lede">Redirecting to your bill...</p>
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginTop: "40px", paddingTop: "30px", borderTop: "1px solid var(--line)", color: "var(--muted)", lineHeight: 2 }}>
                <p>✓ Automated Billing</p>
                <p>✓ Easy Returns</p>
                <p>✓ Free Shipping Above ₹999</p>
                <p>✓ Customer Support</p>
              </div>

              {paymentMethod === "whatsapp" && (
                <>
                  <button onClick={sendToWhatsapp} style={{ width: "100%", marginTop: "35px", padding: "18px", border: "none", background: "var(--gold)", color: "#050505", cursor: "pointer", fontWeight: 600, fontSize: "1rem" }}>
                    Review & Send Order
                  </button>
                  <p style={{ marginTop: "15px", color: "var(--muted)", textAlign: "center", fontSize: ".85rem", lineHeight: 1.6 }}>
                    Your order will open in WhatsApp for final review before submission.
                  </p>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

const inputStyle = {
  width: "100%",
  padding: "16px",
  border: "1px solid var(--line)",
  background: "rgba(255,255,255,0.06)",
  outline: "none",
  fontSize: "1rem",
  color: "var(--text)",
} as const;
