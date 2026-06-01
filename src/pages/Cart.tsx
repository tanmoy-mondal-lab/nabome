import SEO from "../components/SEO";
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

  const freeShippingThreshold = 999;

  const amountRemaining =
    freeShippingThreshold - total;

  return (
    <>
      <SEO title="Shopping Cart | নবME" description="View your নবME shopping bag and checkout." path="/cart" />
      <Navbar />

      <div
        style={{
          background: "var(--bg)",
          color: "var(--text)",
          minHeight: "100vh",
        }}
      >
        {/* HEADER */}

        <section
          style={{
            padding: "80px 6% 50px",
            borderBottom:
              "1px solid var(--line)",
          }}
        >
          <p
            style={{
              textTransform:
                "uppercase",
              letterSpacing: "3px",
              color: "var(--muted)",
              fontSize: ".85rem",
            }}
          >
            Shopping Bag
          </p>

          <h1
            style={{
              fontSize:
                "clamp(3rem,7vw,5rem)",
              fontWeight: 300,
              marginTop: "15px",
            }}
          >
            Your Cart
          </h1>

          <p
            style={{
              marginTop: "20px",
              color: "var(--muted)",
            }}
          >
            {cart.length} item(s) in your
            shopping bag.
          </p>
        </section>

        {/* EMPTY CART */}

        {cart.length === 0 && (
          <section
            style={{
              textAlign: "center",
              padding:
                "120px 6%",
            }}
          >
            <h2
              style={{
                marginBottom: "20px",
                fontWeight: 400,
                color: "var(--text)",
              }}
            >
              Your cart is empty
            </h2>

            <p
              style={{
                color: "#666",
                marginBottom: "40px",
              }}
            >
              Explore our latest collection.</p>

            <Link to="/category">
              <button
                style={{
                  padding:
                    "18px 40px",
                  border: "none",
                  background:
                    "var(--gold)",
                  color:
                    "#050505",
                  cursor:
                    "pointer",
                  fontWeight: 600,
                }}
              >
                Continue Shopping
              </button>
            </Link>
          </section>
        )}

        {/* CART CONTENT */}

        {cart.length > 0 && (
          <section
            style={{
              padding: "60px 6%",
            }}
          >
            <div className="cart-grid">
              {/* ITEMS */}

              <div>
                {amountRemaining > 0 ? (
                  <div
                    style={{
                      background:
                        "var(--surface)",
                      padding:
                        "20px",
                      marginBottom:
                        "30px",
                    }}
                  >
                    Add ₹
                    {amountRemaining}
                    more for free shipping.
                  </div>
                ) : (
                  <div
                    style={{
                      background:
                        "var(--surface)",
                      padding:
                        "20px",
                      marginBottom:
                        "30px",
                    }}
                  >
                    ✓ You qualify for
                    free shipping.
                  </div>
                )}

                {cart.map(
                  (
                    item
                  ) => (
                    <div
                      key={`${item.id}-${item.selectedSize || ""}-${item.selectedColor || ""}`}
                      style={{
                        display:
                          "grid",
                        gridTemplateColumns:
                          "180px 1fr",
                        gap: "30px",
                        padding:
                          "30px 0",
                        borderBottom:
                          "1px solid var(--line)",
                      }}
                    >
                      <img
                        src={
                          item.image
                        }
                        alt={
                          item.name
                        }
                        style={{
                          width:
                            "100%",
                          height:
                            "220px",
                          objectFit:
                            "cover",
                        }}
                      />

                      <div>
                        <p
                          style={{
                            color:
                              "var(--muted)",
                            textTransform:
                              "uppercase",
                            letterSpacing:
                              "2px",
                            marginBottom:
                              "10px",
                            fontSize:
                              ".85rem",
                          }}
                        >
                          Product
                        </p>

                        <h2
                          style={{
                            fontWeight:
                              500,
                            marginBottom:
                              "20px",
                          }}
                        >
                          {item.name}
                        </h2>

                        <p
                          style={{
                            color:
                              "var(--muted)",
                            marginBottom:
                              "8px",
                          }}
                        >
                          Size:
                          {" "}
                          {item.selectedSize ||
                            "N/A"}
                        </p>

                        <p
                          style={{
                            color:
                              "var(--muted)",
                            marginBottom:
                              "20px",
                          }}
                        >
                          Colour:
                          {" "}
                          {item.selectedColor ||
                            "N/A"}
                        </p>
                                                {/* QUANTITY */}

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginBottom: "25px",
                          }}
                        >
                          <button
                            onClick={() =>
                              decreaseQuantity(
                                item.id,
                                item.variantId
                              )
                            }
                            style={{
                              width: "42px",
                              height: "42px",
                              border:
                                "1px solid var(--line)",
                              background:
                                "transparent",
                              color: "var(--text)",
                              cursor:
                                "pointer",
                              fontSize:
                                "1.1rem",
                            }}
                          >
                            −
                          </button>

                          <span
                            style={{
                              minWidth:
                                "30px",
                              textAlign:
                                "center",
                              fontWeight:
                                600,
                            }}
                          >
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              increaseQuantity(
                                item.id,
                                item.variantId
                              )
                            }
                            style={{
                              width: "42px",
                              height: "42px",
                              border:
                                "1px solid var(--line)",
                              background:
                                "transparent",
                              color: "var(--text)",
                              cursor:
                                "pointer",
                              fontSize:
                                "1.1rem",
                            }}
                          >
                            +
                          </button>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            alignItems:
                              "center",
                            flexWrap:
                              "wrap",
                            gap: "15px",
                          }}
                        >
                          <div>
                            <h3
                              style={{
                                fontWeight:
                                  600,
                              }}
                            >
                              ₹
                              {item.price *
                                item.quantity}
                            </h3>

                            <p
                              style={{
                                color:
                                  "var(--muted)",
                                fontSize:
                                  ".9rem",
                              }}
                            >
                              ₹
                              {
                                item.price
                              }{" "}
                              each
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              removeItem(
                                item.id,
                                item.variantId
                              )
                            }
                            style={{
                              border:
                                "1px solid var(--line)",
                              background:
                                "transparent",
                              padding:
                                "12px 18px",
                              cursor:
                                "pointer",
                              color:
                                "var(--muted)",
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* ORDER SUMMARY */}

              <div
                style={{
                  position: "sticky",
                  top: "120px",
                  border:
                    "1px solid var(--line)",
                  padding: "35px",
                  background:
                    "var(--surface)",
                }}
              >
                <h2
                  style={{
                    marginBottom:
                      "30px",
                    fontWeight:
                      500,
                  }}
                >
                  Order Summary
                </h2>

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    marginBottom:
                      "15px",
                    color:
                      "var(--muted)",
                  }}
                >
                  <span>
                    Items
                  </span>

                  <span>
                    {
                      cart.length
                    }
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    marginBottom:
                      "15px",
                    color:
                      "var(--muted)",
                  }}
                >
                  <span>
                    Shipping
                  </span>

                  <span>
                    Free
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    marginBottom:
                      "25px",
                    color:
                      "var(--muted)",
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
                    paddingTop:
                      "20px",
                    display:
                      "flex",
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

                <Link
                  to="/checkout"
                  style={{
                    textDecoration:
                      "none",
                  }}
                >
                  <button
                    style={{
                      width:
                        "100%",
                      marginTop:
                        "30px",
                      padding:
                        "18px",
                      border:
                        "none",
                      background:
                        "var(--gold)",
                      color:
                        "#050505",
                      cursor:
                        "pointer",
                      fontWeight:
                        600,
                      fontSize:
                        "1rem",
                    }}
                  >
                    Proceed To Checkout
                  </button>
                </Link>

                <Link
                  to="/category"
                  style={{
                    textDecoration:
                      "none",
                  }}
                >
                  <button
                    style={{
                      width:
                        "100%",
                      marginTop:
                        "12px",
                      padding:
                        "18px",
                      border:
                        "1px solid var(--gold)",
                      background:
                        "transparent",
                      color:
                        "var(--gold)",
                      cursor:
                        "pointer",
                      fontWeight:
                        600,
                    }}
                  >
                    Continue Shopping
                  </button>
                </Link>

                <div
                  style={{
                    marginTop:
                      "35px",
                    paddingTop:
                      "25px",
                    borderTop:
                      "1px solid var(--line)",
                    color:
                      "var(--muted)",
                    lineHeight:
                      2,
                  }}
                >
                  <p>
                    ✓ Secure
                    Checkout
                  </p>

                  <p>
                    ✓ Easy
                    Returns
                  </p>

                  <p>
                    ✓ Free
                    Shipping
                  </p>

                  <p>
                    ✓ Customer
                    Support
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}