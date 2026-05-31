import { useState } from "react";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

export default function Checkout() {
  const { cart } = useCart();

  const [name, setName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [city, setCity] =
    useState("");

  const [state, setState] =
    useState("");

  const [pincode, setPincode] =
    useState("");


  const total = cart.reduce(
    (sum, item) =>
      sum +
      item.price *
        item.quantity,
    0
  );

  const sendToWhatsapp = () => {
    if (
      !name ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !pincode
    ) {
      alert(
        "Please complete all checkout details."
      );
      return;
    }

    const bill = {
      billNo: `NAB-${Date.now()}`,
      date: new Date().toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      customer: {
        name,
        phone,
        email: email || "Not Provided",
        address,
        city,
        state,
        pincode,
      },
      items: cart,
      shipping: 0,
      taxLabel: "Included",
      total,
    };

    localStorage.setItem(
      "nabome-last-bill",
      JSON.stringify(bill)
    );

    const productList =
      cart
        .map(
          (
            item
          ) => `
${item.name}

Qty: ${item.quantity}

Size: ${item.selectedSize || "N/A"}

Color: ${item.selectedColor || "N/A"}

Subtotal: ₹${
              item.price *
              item.quantity
            }
`
        )
        .join("\n");

    const message = `
🛍️ নবME ORDER

━━━━━━━━━━━━━━

CUSTOMER DETAILS

Name:
${name}

Phone:
${phone}

Email:
${email || "Not Provided"}

Address:
${address}

City:
${city}

State:
${state}

Pincode:
${pincode}

━━━━━━━━━━━━━━

PRODUCTS

${productList}

━━━━━━━━━━━━━━

TOTAL: ₹${total}
`;

    const encoded =
      encodeURIComponent(
        message
      );

    window.open(
      `https://wa.me/919163854706?text=${encoded}`,
      "_blank"
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
          background:
            "var(--bg)",
          color:
            "var(--text)",
          minHeight:
            "100vh",
        }}
      >
        {/* HEADER */}

        <section
          style={{
            padding:
              "80px 6% 50px",
            borderBottom:
              "1px solid var(--line)",
          }}
        >
          <p
            style={{
              textTransform:
                "uppercase",
              letterSpacing:
                "3px",
              color:
                "var(--muted)",
              fontSize:
                ".85rem",
            }}
          >
            Checkout
          </p>

          <h1
            style={{
              fontSize:
                "clamp(3rem,7vw,5rem)",
              fontWeight:
                300,
              marginTop:
                "15px",
            }}
          >
            Secure Checkout
          </h1>
        </section>

        <section
          style={{
            padding:
              "60px 6%",
          }}
        >
          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "2fr 1fr",
              gap:
                "50px",
              alignItems:
                "start",
            }}
          >
            {/* FORM */}

            <div>
              <h2
                style={{
                  marginBottom:
                    "30px",
                  fontWeight:
                    500,
                }}
              >
                Contact Information
              </h2>

              <div
                style={{
                  display:
                    "grid",
                  gap:
                    "18px",
                }}
              >
                <input
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target
                        .value
                    )
                  }
                  style={
                    inputStyle
                  }
                />

                <input
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target
                        .value
                    )
                  }
                  style={
                    inputStyle
                  }
                />

                <input
                  placeholder="Email Address (Optional)"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target
                        .value
                    )
                  }
                  style={
                    inputStyle
                  }
                />
              </div>

              <h2
                style={{
                  marginTop:
                    "60px",
                  marginBottom:
                    "30px",
                  fontWeight:
                    500,
                }}
              >
                Shipping Address
              </h2>

              <div
                style={{
                  display:
                    "grid",
                  gap:
                    "18px",
                }}
              >
                <textarea
                  rows={5}
                  placeholder="Street Address"
                  value={address}
                  onChange={(e) =>
                    setAddress(
                      e.target
                        .value
                    )
                  }
                  style={{
                    ...inputStyle,
                    resize:
                      "none",
                  }}
                />

                <input
                  placeholder="City"
                  value={city}
                  onChange={(e) =>
                    setCity(
                      e.target
                        .value
                    )
                  }
                  style={
                    inputStyle
                  }
                />

                <input
                  placeholder="State"
                  value={state}
                  onChange={(e) =>
                    setState(
                      e.target
                        .value
                    )
                  }
                  style={
                    inputStyle
                  }
                />

                <input
                  placeholder="Pincode"
                  value={
                    pincode
                  }
                  onChange={(e) =>
                    setPincode(
                      e.target
                        .value
                    )
                  }
                  style={
                    inputStyle
                  }
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
              <h2
                style={{
                  marginBottom: "30px",
                  fontWeight: 500,
                }}
              >
                Order Summary
              </h2>

              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.selectedSize || ""}-${item.selectedColor || ""}`}
                  style={{
                    paddingBottom: "20px",
                    marginBottom: "20px",
                    borderBottom:
                      "1px solid var(--line)",
                  }}
                >
                  <h4
                    style={{
                      marginBottom: "10px",
                      fontWeight: 600,
                    }}
                  >
                    {item.name}
                  </h4>

                  <div
                    style={{
                      color: "var(--muted)",
                      fontSize: ".95rem",
                      lineHeight: 1.8,
                    }}
                  >
                    <p>
                      Quantity:
                      {" "}
                      {item.quantity}
                    </p>

                    <p>
                      Size:
                      {" "}
                      {item.selectedSize ||
                        "N/A"}
                    </p>

                    <p>
                      Colour:
                      {" "}
                      {item.selectedColor ||
                        "N/A"}
                    </p>
                  </div>

                  <p
                    style={{
                      marginTop: "10px",
                      fontWeight: 600,
                    }}
                  >
                    ₹
                    {item.price *
                      item.quantity}
                  </p>
                </div>
              ))}

              {/* TOTALS */}

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginBottom: "12px",
                  color: "var(--muted)",
                }}
              >
                <span>
                  Shipping
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginBottom: "25px",
                  color: "var(--muted)",
                }}
              >
                <span>
                  Taxes
                </span>

                <span>
                  Included
                </span>
              </div>

              <div
                style={{
                    borderTop:
                      "1px solid var(--line)",
                    paddingTop: "20px",
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                }}
              >
                <strong>
                  Total
                </strong>

                <h2>
                  ₹{total}
                </h2>
              </div>

              {/* PAYMENT */}

              <div
                style={{
                  marginTop: "40px",
                  paddingTop: "30px",
                  borderTop:
                    "1px solid var(--line)",
                }}
              >
                <h3
                  style={{
                    marginBottom: "20px",
                  }}
                >
                  Payment Method
                </h3>

                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                    border:
                      "1px solid var(--gold)",
                    padding: "14px",
                    background:
                      "var(--gold-soft)",
                    }}
                  >
                    ● WhatsApp Order
                    (Available)
                  </div>

                  <div
                    style={{
                      border:
                        "1px solid var(--line)",
                      padding: "14px",
                      color: "var(--muted)",
                    }}
                  >
                    ○ Razorpay
                    (Coming Soon)
                  </div>

                  <div
                    style={{
                      border:
                        "1px solid var(--line)",
                      padding: "14px",
                      color: "var(--muted)",
                    }}
                  >
                    ○ Cash On
                    Delivery
                    (Coming Soon)
                  </div>
                </div>
              </div>

              {/* TRUST */}

              <div
                style={{
                  marginTop: "40px",
                  paddingTop: "30px",
                    borderTop:
                      "1px solid var(--line)",
                    color: "var(--muted)",
                  lineHeight: 2,
                }}
              >
                <p>
                  ✓ Secure
                  Checkout
                </p>

                <p>
                  ✓ Easy Returns
                </p>

                <p>
                  ✓ Free Shipping
                  Above ₹999
                </p>

                <p>
                  ✓ Customer
                  Support
                </p>
              </div>

              {/* BUTTON */}

              <button
                onClick={
                  sendToWhatsapp
                }
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
                Review & Send
                Order
              </button>

              <p
                style={{
                  marginTop: "15px",
                  color: "var(--muted)",
                  textAlign:
                    "center",
                  fontSize: ".85rem",
                  lineHeight: 1.6,
                }}
              >
                Your order will
                open in WhatsApp
                for final review
                before submission.
              </p>
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
