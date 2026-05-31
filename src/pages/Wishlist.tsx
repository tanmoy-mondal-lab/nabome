import SEO from "../components/SEO";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

export default function Wishlist() {
  const {
    wishlist,
    removeFromWishlist,
  } = useWishlist();

  const { addToCart } =
    useCart();

  return (
    <>
      <SEO title="Wishlist | নবME" description="Your saved নবME items." path="/wishlist" />
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
            Saved Collection
          </p>

          <h1
            style={{
              fontSize:
                "clamp(3rem,7vw,5rem)",
              fontWeight: 300,
              marginTop: "15px",
            }}
          >
            Wishlist
          </h1>

          <p
            style={{
              marginTop: "20px",
              color: "#666",
            }}
          >
            {wishlist.length} saved
            item(s).
          </p>
        </section>

        {/* EMPTY STATE */}

        {wishlist.length === 0 && (
          <section
            style={{
              textAlign: "center",
              padding:
                "120px 6%",
            }}
          >
            <h2
              style={{
                fontWeight: 400,
                marginBottom: "20px",
              }}
            >
              Your wishlist is empty
            </h2>

            <p
              style={{
                color: "var(--muted)",
                marginBottom: "40px",
              }}
            >
              Save products you love and
              revisit them anytime.
            </p>

            <Link to="/category">
              <button
                style={{
                  padding:
                    "18px 40px",
                  border: "none",
                  background:
                    "#111",
                  color: "#fff",
                  cursor:
                    "pointer",
                  fontWeight: 600,
                }}
              >
                Explore Collection
              </button>
            </Link>
          </section>
        )}

        {/* PRODUCT GRID */}

        {wishlist.length > 0 && (
          <section
            style={{
              padding: "60px 6%",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill,minmax(300px,1fr))",
                gap: "40px",
              }}
            >
                            {wishlist.map(
                (product) => (
                  <div
                    key={product.id}
                  >
                    <Link
                      to={`/product/${product.id}`}
                      style={{
                        color:
                          "var(--text)",
                        textDecoration:
                          "none",
                      }}
                    >
                      {/* IMAGE */}

                      <div
                        style={{
                          overflow:
                            "hidden",
                          background:
                            "#f6f6f6",
                        }}
                      >
                        <img
                          src={
                            product.image
                          }
                          alt={
                            product.name
                          }
                          style={{
                            width:
                              "100%",
                            height:
                              "460px",
                            objectFit:
                              "cover",
                          }}
                        />
                      </div>

                      {/* INFO */}

                      <div
                        style={{
                          paddingTop:
                            "18px",
                        }}
                      >
                        <p
                          style={{
                    color:
                      "var(--muted)",
                            textTransform:
                              "uppercase",
                            letterSpacing:
                              "2px",
                            marginBottom:
                              "8px",
                          }}
                        >
                          {
                            product.category
                          }
                        </p>

                        <h3
                          style={{
                            fontWeight:
                              500,
                            marginBottom:
                              "12px",
                            lineHeight:
                              1.4,
                          }}
                        >
                          {
                            product.name
                          }
                        </h3>

                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap:
                              "10px",
                          }}
                        >
                          <span
                            style={{
                              fontWeight:
                                600,
                            }}
                          >
                            ₹
                            {
                              product.price
                            }
                          </span>

                          {product.originalPrice && (
                            <span
                              style={{
                                color:
                                  "#999",
                                textDecoration:
                                  "line-through",
                                fontSize:
                                  ".9rem",
                              }}
                            >
                              ₹
                              {
                                product.originalPrice
                              }
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>

                    {/* ACTIONS */}

                    <div
                      style={{
                        display:
                          "flex",
                        gap: "12px",
                        marginTop:
                          "18px",
                      }}
                    >
              <button
                onClick={() => addToCart(product)}
                style={{
                  flex: 1,
                  padding: "15px",
                  border: "1px solid var(--gold)",
                  background: "var(--gold)",
                  color: "#050505",
                          cursor:
                            "pointer",
                          fontWeight:
                            600,
                        }}
                      >
                        Add To Cart
                      </button>

                      <button
                        onClick={() =>
                          removeFromWishlist(
                            product.id
                          )
                        }
                        style={{
                          padding:
                            "15px 18px",
                    border:
                      "1px solid var(--line)",
                    background:
                      "transparent",
                    color:
                      "var(--muted)",
                          cursor:
                            "pointer",
                          fontWeight:
                            500,
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* COLLECTION CTA */}

            <section
              style={{
                background:
                  "var(--surface)",
                padding:
                  "100px 6%",
                textAlign:
                  "center",
                marginTop:
                  "80px",
              }}
            >
              <p
                style={{
                  textTransform:
                    "uppercase",
                  letterSpacing:
                    "4px",
                color:
                  "var(--muted)",
                }}
              >
                Discover More
              </p>

              <h2
                style={{
                  fontSize:
                    "clamp(3rem,6vw,5rem)",
                  fontWeight:
                    300,
                  marginTop:
                    "20px",
                  lineHeight:
                    1.1,
                }}
              >
                Continue
                <br />
                Exploring
              </h2>

              <p
                style={{
                  maxWidth:
                    "650px",
                    margin:
                      "30px auto",
                    color:
                      "var(--muted)",
                    lineHeight:
                    1.9,
                }}
              >
                Browse our latest
                collection and discover
                premium essentials inspired
                by modern Bengali fashion.
              </p>

              <Link
                to="/category"
              >
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
                    fontWeight:
                      600,
                  }}
                >
                  Shop Collection
                </button>
              </Link>
            </section>
          </section>
        )}
      </div>
    </>
  );
}
