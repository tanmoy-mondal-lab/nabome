import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

export default function Wishlist() {
  const { wishlist, removeFromWishlist } =
    useWishlist();

  const { addToCart } = useCart();

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
              letterSpacing: "3px",
              textTransform: "uppercase",
              fontSize: ".85rem",
            }}
          >
            Saved Collection
          </span>

          <h1
            style={{
              fontSize: "clamp(3rem,6vw,5rem)",
              fontWeight: 900,
              marginTop: "10px",
            }}
          >
            Wishlist
          </h1>
        </div>

        {wishlist.length === 0 && (
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
              Your wishlist is empty
            </h2>

            <p
              style={{
                color: "#999",
                marginBottom: "30px",
              }}
            >
              Save products you love and
              come back anytime.
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
                Explore Collection
              </button>
            </Link>
          </div>
        )}

        {wishlist.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill,minmax(320px,1fr))",
              gap: "30px",
            }}
          >
            {wishlist.map((product: any) => (
              <div
                key={product.id}
                style={{
                  background:
                    "linear-gradient(180deg,#111,#0b0b0b)",
                  borderRadius: "24px",
                  overflow: "hidden",
                  border:
                    "1px solid rgba(212,175,55,.08)",
                  boxShadow:
                    "0 20px 50px rgba(0,0,0,.35)",
                }}
              >
                <Link
                  to={`/product/${product.id}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "420px",
                      objectFit: "cover",
                    }}
                  />

                  <div
                    style={{
                      padding: "24px",
                    }}
                  >
                    <p
                      style={{
                        color: "#D4AF37",
                        fontSize: ".85rem",
                        textTransform:
                          "uppercase",
                        letterSpacing: "2px",
                        marginBottom: "10px",
                      }}
                    >
                      {product.category}
                    </p>

                    <h3
                      style={{
                        marginBottom: "15px",
                      }}
                    >
                      {product.name}
                    </h3>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <span
                        style={{
                          color: "#D4AF37",
                          fontWeight: 800,
                          fontSize: "1.5rem",
                        }}
                      >
                        ₹{product.price}
                      </span>

                      {(product as any)
                        .originalPrice && (
                        <span
                          style={{
                            textDecoration:
                              "line-through",
                            color: "#777",
                          }}
                        >
                          ₹
                          {
                            (product as any)
                              .originalPrice
                          }
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                <div
                  style={{
                    padding: "0 24px 24px",
                    display: "flex",
                    gap: "12px",
                  }}
                >
                  <button
                    onClick={() =>
                      addToCart(product)
                    }
                    style={{
                      flex: 1,
                      padding: "14px",
                      border: "none",
                      borderRadius: "12px",
                      cursor: "pointer",
                      fontWeight: 700,
                      background:
                        "linear-gradient(135deg,#FFD700,#D4AF37)",
                      color: "#000",
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
                      padding: "14px 18px",
                      border: "1px solid rgba(255,90,90,.2)",
                      borderRadius: "12px",
                      cursor: "pointer",
                      background: "#1a0d0d",
                      color: "#ff6b6b",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}