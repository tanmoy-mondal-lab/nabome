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
          background: "#fff",
          minHeight: "100vh",
          color: "#111",
        }}
      >
        {/* HERO */}

        <section
          style={{
            padding: "80px 6% 60px",
            borderBottom:
              "1px solid #e5e5e5",
          }}
        >
          <p
            style={{
              textTransform:
                "uppercase",
              letterSpacing: "3px",
              color: "#888",
              fontSize: ".85rem",
            }}
          >
            Collection
          </p>

          <h1
            style={{
              fontSize:
                "clamp(3rem,7vw,6rem)",
              fontWeight: 300,
              marginTop: "15px",
              lineHeight: 1,
            }}
          >
            Shop All
          </h1>

          {search && (
            <p
              style={{
                marginTop: "20px",
                color: "#666",
              }}
            >
              Showing results for:
              <strong>
                {" "}
                "{search}"
              </strong>
            </p>
          )}
        </section>

        {/* FILTERS */}

        <section
          style={{
            padding: "40px 6%",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "20px",
              marginBottom: "50px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
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
                    padding:
                      "12px 22px",
                    cursor:
                      "pointer",
                    background:
                      selectedCategory ===
                      category
                        ? "#111"
                        : "#fff",
                    color:
                      selectedCategory ===
                      category
                        ? "#fff"
                        : "#111",
                    border:
                      "1px solid #ddd",
                    fontWeight: 600,
                  }}
                >
                  {category}
                </button>
              ))}
            </div>

            <p
              style={{
                color: "#666",
              }}
            >
              {
                filteredProducts.length
              }{" "}
              Products
            </p>
          </div>

          {/* EMPTY STATE */}

          {filteredProducts.length ===
            0 && (
            <div
              style={{
                textAlign:
                  "center",
                padding:
                  "100px 0",
              }}
            >
              <h2>
                No products found
              </h2>

              <p
                style={{
                  marginTop:
                    "15px",
                  color:
                    "#666",
                }}
              >
                Try another
                search or
                category.
              </p>
            </div>
          )}

          {/* PRODUCT GRID */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill,minmax(300px,1fr))",
              gap: "40px",
            }}
          >
                        {filteredProducts.map(
              (product) => (
                <div
                  key={product.id}
                >
                  <Link
                    to={`/product/${product.id}`}
                    style={{
                      color:
                        "#111",
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
                          transition:
                            "transform .4s ease",
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
                            "#888",
                          fontSize:
                            ".85rem",
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

                        {(product as any)
                          .originalPrice && (
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
                              (
                                product as any
                              )
                                .originalPrice
                            }
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* QUICK ADD */}

                  <button
                    onClick={() =>
                      addToCart(
                        product
                      )
                    }
                    style={{
                      width:
                        "100%",
                      marginTop:
                        "18px",
                      padding:
                        "15px",
                      border:
                        "1px solid #111",
                      background:
                        "#fff",
                      color:
                        "#111",
                      cursor:
                        "pointer",
                      fontWeight:
                        600,
                      transition:
                        ".3s",
                    }}
                  >
                    Quick Add
                  </button>
                </div>
              )
            )}
          </div>
        </section>

        {/* COLLECTION MESSAGE */}

        <section
          style={{
            background:
              "#f8f6f2",
            padding:
              "120px 6%",
            textAlign:
              "center",
            marginTop:
              "60px",
          }}
        >
          <span
            style={{
              textTransform:
                "uppercase",
              letterSpacing:
                "4px",
              color:
                "#888",
            }}
          >
            NABOME
          </span>

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
            Modern Fashion
            <br />
            Inspired By
            <br />
            Bengal
          </h2>

          <p
            style={{
              maxWidth:
                "700px",
              margin:
                "30px auto 0",
              color:
                "#666",
              lineHeight:
                1.9,
            }}
          >
            Discover
            premium
            essentials,
            timeless
            silhouettes
            and everyday
            pieces
            designed for
            comfort,
            quality and
            expression.
          </p>
        </section>
      </div>
    </>
  );
}
