import { useState } from "react";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

export default function Checkout() {
  const { cart } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const sendToWhatsapp = () => {
    if (
      !name ||
      !phone ||
      !address ||
      !pincode
    ) {
      alert(
        "Please complete all checkout details."
      );
      return;
    }

    const productList = cart
      .map(
        (item) =>
          `${item.name}
Qty: ${item.quantity}
Size: ${(item as any).selectedSize || "N/A"}
Color: ${(item as any).selectedColor || "N/A"}
Subtotal: ₹${item.price * item.quantity}`
      )
      .join("\n\n");

    const message = `
🛍️ NABOME ORDER

Customer Name:
${name}

Phone:
${phone}

Address:
${address}

Pincode:
${pincode}

━━━━━━━━━━━━━━

PRODUCTS

${productList}

━━━━━━━━━━━━━━

TOTAL: ₹${total}
`;

    const encoded =
      encodeURIComponent(message);

    window.open(
      `https://wa.me/919163854706?text=${encoded}`,
      "_blank"
    );

    localStorage.removeItem(
      "nabome-cart"
    );

    setTimeout(() => {
      window.location.href =
        "/order-success";
    }, 1000);
  };

  return (
    <>
      <Navbar />

      <div
        style={{
          minHeight: "100vh",
          background: "#050505",
          color: "#fff",
          padding: "60px 6%",
        }}
      >
        <div
          style={{
            marginBottom: "50px",
          }}
        >
          <span
            style={{
              color: "#D4AF37",
              textTransform: "uppercase",
              letterSpacing: "3px",
              fontSize: ".85rem",
            }}
          >
            Secure Checkout
          </span>

          <h1
            style={{
              fontSize: "clamp(3rem,6vw,5rem)",
              fontWeight: 900,
              marginTop: "10px",
            }}
          >
            Checkout
          </h1>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "2fr 1fr",
            gap: "40px",
            alignItems: "start",
          }}
        >
          {/* FORM */}
          <div
            style={{
              background:
                "linear-gradient(180deg,#111,#0b0b0b)",
              border:
                "1px solid rgba(212,175,55,.08)",
              borderRadius: "24px",
              padding: "35px",
            }}
          >
            <h2
              style={{
                marginBottom: "30px",
              }}
            >
              Delivery Details
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <input
                placeholder="Full Name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                style={inputStyle}
              />

              <input
                placeholder="Phone Number"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                style={inputStyle}
              />

              <textarea
                placeholder="Full Address"
                value={address}
                onChange={(e) =>
                  setAddress(
                    e.target.value
                  )
                }
                rows={5}
                style={{
                  ...inputStyle,
                  resize: "none",
                }}
              />

              <input
                placeholder="Pincode"
                value={pincode}
                onChange={(e) =>
                  setPincode(
                    e.target.value
                  )
                }
                style={inputStyle}
              />
            </div>
          </div>

          {/* SUMMARY */}
          <div
            style={{
              background:
                "linear-gradient(180deg,#111,#0b0b0b)",
              border:
                "1px solid rgba(212,175,55,.08)",
              borderRadius: "24px",
              padding: "30px",
              position: "sticky",
              top: "100px",
            }}
          >
            <h2
              style={{
                marginBottom: "25px",
              }}
            >
              Order Summary
            </h2>

            {cart.map((item) => (
              <div
                key={item.id}
                style={{
                  paddingBottom: "15px",
                  marginBottom: "15px",
                  borderBottom:
                    "1px solid #222",
                }}
              >
                <p
                  style={{
                    fontWeight: 700,
                  }}
                >
                  {item.name}
                </p>

                <p
                  style={{
                    color: "#999",
                    fontSize: ".9rem",
                  }}
                >
                  Qty: {item.quantity}
                </p>

                <p
                  style={{
                    color: "#D4AF37",
                    fontWeight: 700,
                  }}
                >
                  ₹
                  {item.price *
                    item.quantity}
                </p>
              </div>
            ))}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                marginTop: "20px",
                color: "#999",
              }}
            >
              <span>Shipping</span>
              <span>Free</span>
            </div>

            <hr
              style={{
                margin: "25px 0",
                borderColor: "#222",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
              }}
            >
              <h3>Total</h3>

              <h2
                style={{
                  color: "#D4AF37",
                }}
              >
                ₹{total}
              </h2>
            </div>

            <button
              onClick={sendToWhatsapp}
              style={{
                width: "100%",
                marginTop: "30px",
                padding: "18px",
                border: "none",
                borderRadius: "14px",
                cursor: "pointer",
                fontWeight: 800,
                fontSize: "1rem",
                background:
                  "linear-gradient(135deg,#25D366,#128C7E)",
                color: "#fff",
              }}
            >
              Complete Order On WhatsApp
            </button>

            <p
              style={{
                marginTop: "15px",
                color: "#777",
                fontSize: ".85rem",
                textAlign: "center",
              }}
            >
              Secure order confirmation via
              WhatsApp
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

const inputStyle = {
  width: "100%",
  padding: "16px",
  borderRadius: "14px",
  border: "1px solid #222",
  background: "#0a0a0a",
  color: "#fff",
  outline: "none",
  fontSize: "1rem",
} as const;