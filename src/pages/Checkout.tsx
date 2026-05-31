import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

const UPI_ID = "nabome@upi";
const UPI_NAME = "নবME";
const PHONE = 919163854706;

function buildBill(customer: Record<string, string>, items: unknown[], total: number, paymentMethod: string) {
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

  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    address: "", city: "", state: "", pincode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"whatsapp" | "upi">("whatsapp");
  const [paid, setPaid] = useState(false);

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const update = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const isFormValid = form.name && form.phone && form.address && form.city && form.state && form.pincode;

  const customer = {
    name: form.name,
    phone: form.phone,
    email: form.email || "Not Provided",
    address: form.address,
    city: form.city,
    state: form.state,
    pincode: form.pincode,
  };

  const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${total}&cu=INR&tn=${encodeURIComponent(`নবME Order ${customer.name}`)}`;

  const confirmUpiPayment = () => {
    if (!isFormValid) {
      alert("Please complete all checkout details.");
      return;
    }
    const bill = buildBill(customer, cart, total, "upi");
    localStorage.setItem("nabome-last-bill", JSON.stringify(bill));
    localStorage.removeItem("nabome-cart");
    clearCart();
    navigate("/order-success");
  };

  const sendToWhatsapp = () => {
    if (!isFormValid) {
      alert("Please complete all checkout details.");
      return;
    }

    const bill = buildBill(customer, cart, total, "whatsapp");
    localStorage.setItem("nabome-last-bill", JSON.stringify(bill));

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

  return (
    <>
      <Navbar />

      <div
        style={{
          background: "var(--bg)",
          color: "var(--text)",
          minHeight: "100vh",
        }}
      >
        <section
          style={{
            padding: "80px 6% 50px",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <p
            style={{
              textTransform: "uppercase",
              letterSpacing: "3px",
              color: "var(--muted)",
              fontSize: ".85rem",
            }}
          >
            Checkout
          </p>
          <h1
            style={{
              fontSize: "clamp(3rem,7vw,5rem)",
              fontWeight: 300,
              marginTop: "15px",
            }}
          >
            Secure Checkout
          </h1>
        </section>

        <section style={{ padding: "60px 6%" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "50px",
              alignItems: "start",
            }}
          >
            {/* FORM */}
            <div>
              <h2 style={{ marginBottom: "30px", fontWeight: 500 }}>
                Contact Information
              </h2>
              <div style={{ display: "grid", gap: "18px" }}>
                <input
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  style={inputStyle}
                />
                <input
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  style={inputStyle}
                />
                <input
                  placeholder="Email Address (Optional)"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  style={inputStyle}
                />
              </div>

              <h2 style={{ marginTop: "60px", marginBottom: "30px", fontWeight: 500 }}>
                Shipping Address
              </h2>
              <div style={{ display: "grid", gap: "18px" }}>
                <textarea
                  rows={5}
                  placeholder="Street Address"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  style={{ ...inputStyle, resize: "none" }}
                />
                <input
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  style={inputStyle}
                />
                <input
                  placeholder="State"
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                  style={inputStyle}
                />
                <input
                  placeholder="Pincode"
                  value={form.pincode}
                  onChange={(e) => update("pincode", e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* ORDER SUMMARY */}
            <div
              style={{
                position: "sticky",
                top: "120px",
                border: "1px solid var(--line)",
                padding: "35px",
                background: "var(--surface)",
              }}
            >
              <h2 style={{ marginBottom: "30px", fontWeight: 500 }}>
                Order Summary
              </h2>

              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.selectedSize || ""}-${item.selectedColor || ""}`}
                  style={{
                    paddingBottom: "20px",
                    marginBottom: "20px",
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  <h4 style={{ marginBottom: "10px", fontWeight: 600 }}>
                    {item.name}
                  </h4>
                  <div style={{ color: "var(--muted)", fontSize: ".95rem", lineHeight: 1.8 }}>
                    <p>Quantity: {item.quantity}</p>
                    <p>Size: {item.selectedSize || "N/A"}</p>
                    <p>Colour: {item.selectedColor || "N/A"}</p>
                  </div>
                  <p style={{ marginTop: "10px", fontWeight: 600 }}>
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              ))}

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", color: "var(--muted)" }}>
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "25px", color: "var(--muted)" }}>
                <span>Taxes</span>
                <span>Included</span>
              </div>
              <div style={{ borderTop: "1px solid var(--line)", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>Total</strong>
                <h2>₹{total}</h2>
              </div>

              {/* PAYMENT METHODS */}
              <div style={{ marginTop: "40px", paddingTop: "30px", borderTop: "1px solid var(--line)" }}>
                <h3 style={{ marginBottom: "20px" }}>Payment Method</h3>
                <div style={{ display: "grid", gap: "12px" }}>
                  <button
                    onClick={() => { setPaymentMethod("whatsapp"); setPaid(false); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      border: paymentMethod === "whatsapp" ? "1px solid var(--gold)" : "1px solid var(--line)",
                      background: paymentMethod === "whatsapp" ? "var(--gold-soft)" : "transparent",
                      color: "var(--text)",
                      padding: "14px",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: ".95rem",
                    }}
                  >
                    <span style={{ fontSize: "1.2rem" }}>{paymentMethod === "whatsapp" ? "●" : "○"}</span>
                    <div>
                      <strong>WhatsApp Order</strong>
                      <p style={{ color: "var(--muted)", fontSize: ".85rem", marginTop: 2 }}>
                        Review & confirm via WhatsApp
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => { setPaymentMethod("upi"); setPaid(false); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      border: paymentMethod === "upi" ? "1px solid var(--gold)" : "1px solid var(--line)",
                      background: paymentMethod === "upi" ? "var(--gold-soft)" : "transparent",
                      color: "var(--text)",
                      padding: "14px",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: ".95rem",
                    }}
                  >
                    <span style={{ fontSize: "1.2rem" }}>{paymentMethod === "upi" ? "●" : "○"}</span>
                    <div>
                      <strong>UPI / QR</strong>
                      <p style={{ color: "var(--muted)", fontSize: ".85rem", marginTop: 2 }}>
                        Pay via GPay, PhonePe, Paytm
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* UPI SECTION */}
              {paymentMethod === "upi" && total > 0 && (
                <div style={{ marginTop: "30px", padding: "24px", border: "1px solid var(--line)", textAlign: "center" }}>
                  <p className="eyebrow" style={{ marginBottom: 16 }}>Scan & Pay</p>
                  <div style={{ display: "grid", placeItems: "center", gap: 16 }}>
                    <a href={upiLink} target="_blank" rel="noreferrer">
                      <QRCodeSVG
                        value={upiLink}
                        size={180}
                        bgColor="#ffffff"
                        fgColor="#050505"
                        level="M"
                      />
                    </a>
                    <p style={{ fontSize: ".85rem", color: "var(--muted)" }}>
                      Scan with any UPI app
                    </p>
                    <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16, width: "100%" }}>
                      <p style={{ fontSize: ".85rem", color: "var(--muted)", marginBottom: 6 }}>Or pay to UPI ID</p>
                      <strong style={{ fontSize: "1.1rem", color: "var(--gold)", letterSpacing: "0.05em" }}>{UPI_ID}</strong>
                    </div>
                    <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16, width: "100%" }}>
                      <p style={{ fontSize: ".85rem", color: "var(--muted)", marginBottom: 6 }}>Amount to pay</p>
                      <strong style={{ fontSize: "1.5rem" }}>₹{total}</strong>
                    </div>

                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginTop: 8,
                        cursor: "pointer",
                        fontSize: ".9rem",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={paid}
                        onChange={(e) => setPaid(e.target.checked)}
                        style={{ accentColor: "var(--gold)", width: 18, height: 18 }}
                      />
                      <span>I have completed the payment</span>
                    </label>

                    <button
                      onClick={confirmUpiPayment}
                      disabled={!paid}
                      style={{
                        width: "100%",
                        marginTop: 12,
                        padding: "18px",
                        border: "none",
                        background: paid ? "var(--gold)" : "var(--surface-strong)",
                        color: paid ? "#050505" : "var(--muted)",
                        cursor: paid ? "pointer" : "not-allowed",
                        fontWeight: 600,
                        fontSize: "1rem",
                        transition: "background 0.2s",
                      }}
                    >
                      {paid ? "Confirm & Generate Bill" : "Check the box after payment"}
                    </button>
                  </div>
                </div>
              )}

              {/* TRUST */}
              <div style={{ marginTop: "40px", paddingTop: "30px", borderTop: "1px solid var(--line)", color: "var(--muted)", lineHeight: 2 }}>
                <p>✓ Secure Checkout</p>
                <p>✓ Easy Returns</p>
                <p>✓ Free Shipping Above ₹999</p>
                <p>✓ Customer Support</p>
              </div>

              {/* WHATSAPP BUTTON */}
              {paymentMethod === "whatsapp" && (
                <>
                  <button
                    onClick={sendToWhatsapp}
                    style={{
                      width: "100%",
                      marginTop: "35px",
                      padding: "18px",
                      border: "none",
                      background: "var(--gold)",
                      color: "#050505",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "1rem",
                    }}
                  >
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
