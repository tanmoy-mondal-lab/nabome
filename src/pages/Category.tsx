import Navbar from "../components/Navbar";
import { products } from "../data/products";
import { useCart } from "../context/CartContext";
import "../styles/product.css";
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
          padding: "20px",
        }}
      >
        {search && (
          <h2>
            Search Results for:
            "{search}"
          </h2>
        )}

        {/* FILTER BAR */}

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "30px",
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
                  "10px 18px",
                border: "none",
                borderRadius:
                  "25px",
                cursor: "pointer",
                background:
                  selectedCategory ===
                  category
                    ? "#D4AF37"
                    : "#eee",
                color:
                  selectedCategory ===
                  category
                    ? "white"
                    : "black",
                fontWeight: "bold",
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <h2>
            No products found.
          </h2>
        )}

        <div className="products-grid">
          {filteredProducts.map(
            (product) => (
              <div
                key={product.id}
                className="product-card"
              >
                <Link
                  to={`/product/${product.id}`}
                  style={{
                    textDecoration:
                      "none",
                    color: "inherit",
                  }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-image"
                  />

                  <div className="product-info">
                    <h3>
                      {product.name}
                    </h3>

                    <p>
                      {product.category}
                    </p>

                    <div>
                      <span
                        style={{
                          color:
                            "#D4AF37",
                          fontWeight:
                            "bold",
                          fontSize:
                            "22px",
                        }}
                      >
                        ₹
                        {
                          product.price
                        }
                      </span>

                      <span
                        style={{
                          marginLeft:
                            "10px",
                          textDecoration:
                            "line-through",
                          color:
                            "#999",
                        }}
                      >
                        ₹
                        {(product as any)
                          .originalPrice}
                      </span>
                    </div>
                  </div>
                </Link>

                <button
                  className="add-btn"
                  onClick={() =>
                    addToCart(
                      product
                    )
                  }
                >
                  Add To Cart
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}
