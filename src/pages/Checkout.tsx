import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Store } from "lucide-react";
import Navbar from "../components/Navbar";
import SEO from "../components/SEO";
import { useCart } from "../context/CartContext";
import { useCustomer } from "../context/CustomerContext";
import { useAuth } from "../context/AuthContext";
import { useAnalytics } from "../context/AnalyticsContext";
import { placeOrder } from "../lib/api/orders";
import type { CustomerData } from "../lib/db";
import CouponInput from "../components/CouponInput";
import type { CouponRedemption } from "../types/order";
import AddressManager from "../components/AddressManager";

const MERCHANT_UPI = "mondaltanmoy230@oksbi";
const MERCHANT_NAME = "নবME";
const PHONE = 919163854706;

function buildBill(customer: CustomerData, items: import("../lib/db").CartItem[], total: number, paymentMethod: string) {
  return {
    billNo: `NAB-${Date.now()}`,
    date: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
    customer,
    items,
    shipping: 0,
    taxLabel: "Included",
    total,
    paymentMethod,
  };
}

const emptyDelivery = {
  name: "",
  phone: "",
  email: "",
  address: "",
  district: "",
  city: "",
  state: "",
  pincode: "",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "16px",
  border: "1px solid var(--line)",
  background: "rgba(255,255,255,0.06)",
  outline: "none",
  fontSize: "1rem",
  color: "var(--text)",
};

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { customer } = useCustomer();
  const { user } = useAuth();
  const { trackBeginCheckout, trackPurchase } = useAnalytics();
  const paidRef = useRef(false);

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [delivery, setDelivery] = useState(emptyDelivery);
  const [paymentMethod, setPaymentMethod] = useState<"whatsapp" | "upi">("whatsapp");
  const [upiStep, setUpiStep] = useState<"idle" | "paying" | "confirming" | "done">("idle");
  const [qrView, setQrView] = useState(false);
  const [utr, setUtr] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const [coupon, setCoupon] = useState<CouponRedemption | null>(null);

  const vendorShops = ["নবME Originals", "Bengal Streetwear", "Kolkata Collective", "Urban Ethnik", "Heritage Threads"];
  const vendorNames = ["Rahul Sharma", "Ananya Das", "Arjun Roy", "Priya Banerjee", "Sayan Mukherjee"];

  const groupedByVendor = useMemo(() => {
    const map = new Map<string, { vendorName: string; vendorShop: string; items: typeof cart }>();
    cart.forEach((item, i) => {
      const vi = i % vendorShops.length;
      const key = vendorShops[vi];
      if (!map.has(key)) map.set(key, { vendorName: vendorNames[vi], vendorShop: key, items: [] });
      map.get(key)!.items.push(item);
    });
    return Array.from(map.values());
  }, [cart]);

  const subtotal = total;
  const couponDiscount = coupon?.discount || 0;
  const shipping = subtotal > 999 ? 0 : 99;
  const tax = Math.round((subtotal - couponDiscount) * 0.05);
  const grandTotal = subtotal - couponDiscount + shipping + tax;

  useEffect(() => {
    trackBeginCheckout(total, cart.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })));
  }, []);

  const handleAddressSelect = useCallback((addr: import("../lib/db").Address) => {
    setSelectedAddressId(addr.id);
    setDelivery({
      name: addr.name,
      phone: addr.phone,
      email: addr.email || "",
      address: addr.address,
      district: addr.district,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    });
  }, []);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!delivery.name?.trim()) e.name = "Required";
    if (!delivery.phone?.trim() || !/^[0-9]{10,15}$/.test(delivery.phone.trim())) e.phone = "Valid 10-digit phone required";
    if (!delivery.address?.trim()) e.address = "Required";
    if (!delivery.city?.trim()) e.city = "Required";
    if (!delivery.state?.trim()) e.state = "Required";
    if (!delivery.pincode?.trim() || !/^[0-9]{6}$/.test(delivery.pincode.trim())) e.pincode = "6-digit pincode required";
    if (delivery.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(delivery.email)) e.email = "Invalid email format";
    if (!cart.length) e.cart = "Cart is empty";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function saveOrder(method: string) {
    const customerData: CustomerData = {
      name: customer?.name || delivery.name,
      phone: customer?.phone || delivery.phone,
      email: customer?.email || delivery.email || "Not Provided",
      address: delivery.address,
      city: delivery.city,
      state: delivery.state,
      pincode: delivery.pincode,
      gender: customer?.gender || undefined,
    };

    const result = await placeOrder({
      userId: user?.id || customer?.id,
      shipping: {
        name: delivery.name,
        phone: delivery.phone,
        email: delivery.email || undefined,
        address: delivery.address,
        district: delivery.district,
        city: delivery.city,
        state: delivery.state,
        pincode: delivery.pincode,
      },
      items: cart.map(item => ({
        productId: String(item.id),
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        variantId: item.variantId,
      })),
      paymentMethod: method === "upi" ? "upi" : "whatsapp",
      paymentStatus: method === "upi" ? "paid" : "pending",
      utr: method === "upi" ? (utr || undefined) : undefined,
      couponCode: coupon?.code,
      couponDiscount: coupon?.discount,
      shippingCost: shipping,
      taxAmount: tax,
    });

    const bill = buildBill(customerData, cart, total, method === "upi" ? "UPI / QR" : "WhatsApp");

    // Email notifications not configured - Brevo removed
    console.log("[checkout] Order placed - email notifications disabled");

    trackPurchase(result?.orderNumber || bill.billNo, grandTotal, cart.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })));

    clearCart();
    return result?.orderNumber;
  }

  const updateDelivery = (key: keyof typeof emptyDelivery, val: string) =>
    setDelivery((d) => ({ ...d, [key]: val }));

  const upiLink = `upi://pay?pa=${MERCHANT_UPI}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${total}&cu=INR&tn=${encodeURIComponent(`নবME Order ${delivery.name}`)}`;

  const handlePayNow = () => {
    if (!validate()) return;
    setUpiStep("paying");
    setQrView(false);
    window.open(upiLink, "_blank");
  };

  useEffect(() => {
    if (upiStep !== "paying") return;
    const onFocus = async () => {
      if (!paidRef.current) {
        paidRef.current = true;
        setUpiStep("confirming");
        const orderNumber = await saveOrder("upi");
        setTimeout(() => {
          setUpiStep("done");
          navigate(orderNumber ? `/order-success?order=${orderNumber}` : "/order-success");
        }, 1000);
      }
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [upiStep]);

  const sendToWhatsapp = async () => {
    if (!validate()) return;
    setPlacing(true);

    const orderNumber = await saveOrder("whatsapp");

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

DELIVERY DETAILS

Name:
${delivery.name}

Phone:
${delivery.phone}

Email:
${delivery.email || "Not Provided"}

Address:
${delivery.address}

District:
${delivery.district}

City:
${delivery.city}

State:
${delivery.state}

Pincode:
${delivery.pincode}

━━━━━━━━━━━━━━

PRODUCTS

${productList}

━━━━━━━━━━━━━━

TOTAL: ₹${grandTotal}
`;

    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`, "_blank");

    setTimeout(() => {
      navigate(orderNumber ? `/order-success?order=${orderNumber}` : "/order-success");
    }, 1500);
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

          {!customer && (
            <div style={{ padding: "20px", border: "1px solid var(--gold)", background: "var(--gold-soft)", marginBottom: 32, textAlign: "center" }}>
              <p style={{ marginBottom: 8, color: "var(--text)" }}>
                Already have an account? Sign in to use your saved addresses.
              </p>
              <Link to="/login" style={{ color: "var(--gold)", fontWeight: 600, textDecoration: "underline" }}>
                Sign In
              </Link>
            </div>
          )}

          <div className="checkout-grid">
            {/* LEFT COLUMN */}
            <div>
              {/* DELIVERY ADDRESS */}
              <h2 style={{ marginBottom: "24px", fontWeight: 500 }}>Delivery Address</h2>

              {customer ? (
                <div style={{ marginBottom: 32 }}>
                  <AddressManager mode="select" onSelect={handleAddressSelect} selectedId={selectedAddressId} />
                </div>
              ) : (
                <div style={{ display: "grid", gap: "18px", marginBottom: 24 }}>
                  <div>
                    <input placeholder="Receiver Full Name" value={delivery.name} onChange={(e) => updateDelivery("name", e.target.value)} style={inputStyle} />
                    {fieldMsg("name")}
                  </div>
                  <div>
                    <input placeholder="Receiver Phone" value={delivery.phone} onChange={(e) => updateDelivery("phone", e.target.value)} style={inputStyle} />
                    {fieldMsg("phone")}
                  </div>
                  <div>
                    <input placeholder="Receiver Email (Optional)" value={delivery.email} onChange={(e) => updateDelivery("email", e.target.value)} style={inputStyle} />
                    {fieldMsg("email")}
                  </div>
                  <div>
                    <textarea rows={3} placeholder="Street / Area / Landmark" value={delivery.address} onChange={(e) => updateDelivery("address", e.target.value)} style={{ ...inputStyle, resize: "none" } as React.CSSProperties} />
                    {fieldMsg("address")}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <input placeholder="District" value={delivery.district} onChange={(e) => updateDelivery("district", e.target.value)} style={inputStyle} />
                    <div>
                      <input placeholder="City" value={delivery.city} onChange={(e) => updateDelivery("city", e.target.value)} style={inputStyle} />
                      {fieldMsg("city")}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <input placeholder="State" value={delivery.state} onChange={(e) => updateDelivery("state", e.target.value)} style={inputStyle} />
                    <div>
                      <input placeholder="Pincode" value={delivery.pincode} onChange={(e) => updateDelivery("pincode", e.target.value)} style={inputStyle} />
                      {fieldMsg("pincode")}
                    </div>
                  </div>
                </div>
              )}

              {/* UPI DETAILS */}
              {paymentMethod === "upi" && (
                <>
                  <h2 style={{ marginTop: "40px", marginBottom: "24px", fontWeight: 500 }}>UPI Payment Details</h2>
                  <div style={{ display: "grid", gap: "18px" }}>
                    <input placeholder="Your UPI ID (e.g. name@upi)" value={delivery.email} onChange={(e) => updateDelivery("email", e.target.value)} style={inputStyle} />
                    <input placeholder="UPI Transaction Reference (UTR) — optional" value={utr} onChange={(e) => setUtr(e.target.value)} style={inputStyle} />
                    <div style={{ padding: "16px", border: "1px solid var(--gold)", background: "var(--gold-soft)", fontSize: ".9rem", lineHeight: 1.7 }}>
                      <strong style={{ color: "var(--gold)" }}>Payment Request</strong>
                      <p style={{ color: "var(--muted)", marginTop: 8 }}>
                        Pay to: <strong style={{ color: "var(--text)" }}>{MERCHANT_UPI}</strong>
                      </p>
                      <p style={{ color: "var(--muted)" }}>
                        Amount: <strong style={{ color: "var(--text)" }}>₹{grandTotal}</strong>
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* RIGHT COLUMN — ORDER SUMMARY */}
            <div className="checkout-sidebar">
              <h2 style={{ marginBottom: "30px", fontWeight: 500 }}>Order Summary</h2>

              {groupedByVendor.map((group) => (
                <div key={group.vendorShop} style={{ marginBottom: "24px", padding: "16px", border: "1px solid var(--line)", borderRadius: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <Store size={16} style={{ color: "var(--gold)" }} />
                    <span style={{ fontWeight: 600, fontSize: ".9rem" }}>{group.vendorShop}</span>
                  </div>
                  {group.items.map((item) => (
                    <div key={`${item.id}-${item.selectedSize || ""}-${item.selectedColor || ""}`} style={{ paddingBottom: "12px", marginBottom: "12px", borderBottom: "1px solid var(--line)" }}>
                      <h4 style={{ marginBottom: "6px", fontWeight: 600, fontSize: ".9rem" }}>{item.name}</h4>
                      <div style={{ color: "var(--muted)", fontSize: ".85rem", lineHeight: 1.8 }}>
                        <p>Qty: {item.quantity} | Size: {item.selectedSize || "N/A"} | Colour: {item.selectedColor || "N/A"}</p>
                      </div>
                      <p style={{ marginTop: "6px", fontWeight: 600, fontSize: ".9rem" }}>₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
              ))}

              <div style={{ padding: "16px", background: "var(--card)", borderRadius: 8, marginBottom: 20 }}>
                <CouponInput subtotal={subtotal} onApply={(c) => setCoupon(c)} onRemove={() => setCoupon(null)} applied={coupon} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", color: "var(--muted)", fontSize: ".9rem" }}>
                <span>Subtotal</span><span>₹{subtotal}</span>
              </div>
              {coupon && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", color: "#22c55e", fontSize: ".9rem" }}>
                  <span>Discount ({coupon.code})</span><span>-₹{couponDiscount}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", color: "var(--muted)", fontSize: ".9rem" }}>
                <span>Shipping</span><span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", color: "var(--muted)", fontSize: ".9rem" }}>
                <span>Tax (GST 5%)</span><span>₹{tax}</span>
              </div>
              <div style={{ borderTop: "1px solid var(--line)", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>Total</strong><h2>₹{grandTotal}</h2>
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

              {paymentMethod === "upi" && grandTotal > 0 && (
                <div style={{ marginTop: "30px" }}>
                  {upiStep === "idle" && !qrView && (
                    <div style={{ display: "grid", gap: 12 }}>
                      <div style={{ padding: "16px", border: "1px solid var(--line)", textAlign: "center", fontSize: ".9rem", lineHeight: 1.7 }}>
                        <p style={{ color: "var(--muted)" }}>Pay to</p>
                        <strong style={{ fontSize: "1.1rem", color: "var(--gold)" }}>{MERCHANT_UPI}</strong>
                      </div>
                      <button onClick={handlePayNow} disabled={Object.keys(errors).length > 0} style={{ width: "100%", padding: "20px", border: "none", background: "var(--gold)", color: "#050505", cursor: "pointer", fontWeight: 800, fontSize: "1.1rem", letterSpacing: "0.05em" }}>
                        Pay ₹{grandTotal} via UPI
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
                          <strong style={{ fontSize: "1.5rem" }}>₹{grandTotal}</strong>
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
                  <button
                    onClick={sendToWhatsapp}
                    disabled={placing}
                    style={{
                      width: "100%", marginTop: "35px", padding: "18px", border: "none",
                      background: placing ? "var(--muted)" : "var(--gold)", color: "#050505",
                      cursor: placing ? "not-allowed" : "pointer", fontWeight: 600, fontSize: "1rem",
                    }}
                  >
                    {placing ? "Placing Order..." : "Review & Send Order"}
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
