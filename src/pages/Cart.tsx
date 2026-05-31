import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

export default function Cart() {
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
  } = useCart();

  const total = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  return (
    <>
      <Navbar />

      <div
        style={{
          minHeight: "100vh",
          background: "#050505",
          color: "#fff",
          padding: "50px 6%",
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
            Shopping Bag
          </span>

          <h1
            style={{
              fontSize: "clamp(3rem,6vw,5rem)",
              fontWeight: 900,
              marginTop: "10px",
            }}
          >
            Your Cart
          </h1>
        </div>

        {cart.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "120px 20px",
            }}
          >
            <h2
              style={{
                marginBottom: "20px",
              }}
            >
              Your cart is empty
            </h2>

            <p
              style={{
                color: "#999",
                marginBottom: "30px",
              }}
            >
              Discover premium pieces from
              our latest collection.
            </p>

            <Link to="/category">
              <button
                style={{
                  background:
                    "linear-gradient(135deg,#FFD700,#D4AF37)",
                  color: "#000",
                  border: "none",
                  padding: "16px 32px",
                  borderRadius: "14px",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Continue Shopping
              </button>
            </Link>
          </div>
        )}

        {cart.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "2fr 1fr",
              gap: "40px",
              alignItems: "start",
            }}
          >
            {/* ITEMS */}
            <div>
              {cart.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    gap: "24px",
                    marginBottom: "25px",
                    background:
                      "linear-gradient(180deg,#111,#0b0b0b)",
                    border:
                      "1px solid rgba(212,175,55,.08)",
                    borderRadius: "24px",
                    padding: "20px",
                  }}
                >
                  <img
                    src={(item as any).image}
                    alt={item.name}
                    style={{
                      width: "180px",
                      height: "180px",
                      objectFit: "cover",
                      borderRadius: "18px",
                    }}
                  />

                  <div
                    style={{
                      flex: 1,
                    }}
                  >
                    <h2
                      style={{
                        marginBottom: "10px",
                      }}
                    >
                      {item.name}
                    </h2>

                    <p
                      style={{
                        color: "#999",
                        marginBottom: "8px",
                      }}
                    >
                      Size:{" "}
                      {(item as any)
                        .selectedSize ||
                        "N/A"}
                    </p>

                    <p
                      style={{
                        color: "#999",
                        marginBottom: "20px",
                      }}
                    >
                      Color:{" "}
                      {(item as any)
                        .selectedColor ||
                        "N/A"}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "20px",
                      }}
                    >
                      <button
                        onClick={() =>
                          decreaseQuantity(
                            item.id
                          )
                        }
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "10px",
                          border: "none",
                          background: "#222",
                          color: "#fff",
                          cursor: "pointer",
                        }}
                      >
                        -
                      </button>

                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "1.1rem",
                        }}
                      >
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          increaseQuantity(
                            item.id
                          )
                        }
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "10px",
                          border: "none",
                          background: "#222",
                          color: "#fff",
                          cursor: "pointer",
                        }}
                      >
                        +
                      </button>
                    </div>

                    <h3
                      style={{
                        color: "#D4AF37",
                        marginBottom: "10px",
                      }}
                    >
                      ₹{item.price}
                    </h3>

                    <p
                      style={{
                        color: "#aaa",
                      }}
                    >
                      Subtotal: ₹
                      {item.price *
                        item.quantity}
                    </p>

                    <button
                      onClick={() =>
                        removeItem(item.id)
                      }
                      style={{
                        marginTop: "20px",
                        background:
                          "#2a1111",
                        color: "#ff6b6b",
                        border:
                          "1px solid rgba(255,107,107,.2)",
                        padding:
                          "10px 18px",
                        borderRadius:
                          "12px",
                        cursor: "pointer",
                      }}
                    >
                      Remove Item
                    </button>
                  </div>
                </div>
              ))}
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

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginBottom: "15px",
                  color: "#aaa",
                }}
              >
                <span>Items</span>
                <span>{cart.length}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginBottom: "15px",
                  color: "#aaa",
                }}
              >
                <span>Shipping</span>
                <span>Free</span>
              </div>

              <hr
                style={{
                  borderColor: "#222",
                  margin: "25px 0",
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

              <Link
                to="/checkout"
                style={{
                  textDecoration: "none",
                }}
              >
                <button
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
                      "linear-gradient(135deg,#FFD700,#D4AF37)",
                    color: "#000",
                  }}
                >
                  Proceed To Checkout
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}