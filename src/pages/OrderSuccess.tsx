import { Link } from "react-router-dom";
import { useEffect } from "react";

export default function OrderSuccess() {
  useEffect(() => {
    localStorage.removeItem(
      "nabome-cart"
    );
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        color: "#111",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "90px",
            height: "90px",
            margin: "0 auto 30px",
            border: "2px solid #111",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "2rem",
            fontWeight: 600,
          }}
        >
          ✓
        </div>

        <p
          style={{
            textTransform: "uppercase",
            letterSpacing: "4px",
            color: "#888",
            fontSize: ".85rem",
          }}
        >
          Order Received
        </p>

        <h1
          style={{
            fontSize:
              "clamp(3rem,7vw,5rem)",
            fontWeight: 300,
            marginTop: "20px",
            lineHeight: 1,
          }}
        >
          Thank You
          <br />
          For Your Order
        </h1>

        <p
          style={{
            color: "#666",
            lineHeight: 1.9,
            marginTop: "30px",
            maxWidth: "550px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Your order request has been
          submitted successfully.
          Our team will review your
          request and contact you
          shortly with confirmation
          and delivery details.
        </p>

        <div
          style={{
            marginTop: "50px",
            display: "flex",
            justifyContent: "center",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          <Link to="/">
            <button
              style={{
                padding:
                  "18px 40px",
                border: "none",
                background:
                  "#111",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Continue Shopping
            </button>
          </Link>

          <Link to="/category">
            <button
              style={{
                padding:
                  "18px 40px",
                border:
                  "1px solid #111",
                background:
                  "#fff",
                color: "#111",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Browse Collection
            </button>
          </Link>
        </div>

        <div
          style={{
            marginTop: "70px",
            paddingTop: "40px",
            borderTop:
              "1px solid #e5e5e5",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(180px,1fr))",
              gap: "20px",
            }}
          >
            <div>
              <h4>
                Secure Checkout
              </h4>

              <p
                style={{
                  color: "#777",
                  marginTop: "10px",
                }}
              >
                Safe order processing
              </p>
            </div>

            <div>
              <h4>
                Easy Returns
              </h4>

              <p
                style={{
                  color: "#777",
                  marginTop: "10px",
                }}
              >
                Customer-friendly support
              </p>
            </div>

            <div>
              <h4>
                Fast Delivery
              </h4>

              <p
                style={{
                  color: "#777",
                  marginTop: "10px",
                }}
              >
                Quick shipping across India
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}