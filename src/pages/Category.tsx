import Navbar from "../components/Navbar";
import { products } from "../data/products";
import { useCart } from "../context/CartContext";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

export default function Category() {
  const { addToCart } = useCart();

  const location = useLocation();

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const searchParams =
    new URLSearchParams(location.search);

  const search =
    searchParams.get("search") || "";

  const filteredProducts = products.filter(
    (product) => {
      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        product.category
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All"
          ? true
          : product.category ===
            selectedCategory;

      return (
        matchesSearch &&
        matchesCategory
      );
    }
  );

  return (
    <>
      <Navbar />

      <div
        style={{
          minHeight: "100vh",
          background: "#050505",
          color: "#fff",
          padding: "40px 6%",
        }}
      >
        {/* HEADER */}
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
              fontSize: "0.9rem",
            }}
          >
            Premium Collection
          </span>

          <h1
            style={{
              fontSize: "clamp(3rem,6vw,5rem)",
              marginTop: "10px",
              fontWeight: 900,
              letterSpacing: "-2px",
            }}
          >
            Shop All Products
          </h1>

          {search && (
            <p
              style={{
                color: "#999",
                marginTop: "15px",
              }}
            >
              Search results for: "{search}"
            </p>
          )}
        </div>

        {/* FILTERS */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "50px",
          }}
        >
          {[
            "All",
            "Men",
            "Women",
            "Unisex",
            "Accessories",
          ].map((category) => (
            <button
              key={category}
              onClick={() =>
                setSelectedCategory(
                  category
                )
              }
              style={{
                padding: "12px 24px",
                outline: "none",
                cursor: "pointer",
                borderRadius: "999px",
                fontWeight: 700,
                transition: "0.3s",
                background:
                  selectedCategory ===
                  category
                    ? "linear-gradient(135deg,#FFD700,#D4AF37)"
                    : "#111",
                color:
                  selectedCategory ===
                  category
                    ? "#000"
                    : "#fff",
                border:
                  selectedCategory ===
                  category
                    ? "none"
                    : "1px solid rgba(255,255,255,.08)",
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* EMPTY */}
        {filteredProducts.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 0",
            }}
          >
            <h2>No products found.</h2>
          </div>
        )}

        {/* PRODUCTS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill,minmax(320px,1fr))",
            gap: "30px",
          }}
        >
          {filteredProducts.map(
            (product) => (
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
                  <div
                    style={{
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "420px",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      padding: "24px",
                    }}
                  >
                    <p
                      style={{
                        color: "#D4AF37",
                        fontSize: "0.85rem",
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
                        fontSize: "1.3rem",
                        marginBottom: "18px",
                        color: "#fff",
                      }}
                    >
                      {product.name}
                    </h3>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span
                        style={{
                          color: "#D4AF37",
                          fontSize: "1.5rem",
                          fontWeight: 800,
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
                  }}
                >
                  <button
                    onClick={() =>
                      addToCart(product)
                    }
                    style={{
                      width: "100%",
                      padding: "15px",
                      border: "none",
                      borderRadius: "14px",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: "1rem",
                      background:
                        "linear-gradient(135deg,#FFD700,#D4AF37)",
                      color: "#000",
                    }}
                  >
                    Add To Cart
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}