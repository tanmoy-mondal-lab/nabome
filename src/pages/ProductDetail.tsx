import { useParams } from "react-router-dom";
import { products } from "../data/products";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { useState } from "react";
import "../styles/productDetail.css";

export default function ProductDetail() {
  const { id } = useParams();

  const product = products.find(
    (p) => p.id === Number(id)
  );

  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] =
    useState("");

  const [selectedColor, setSelectedColor] =
    useState("");

  if (!product) {
    return <h1>Product Not Found</h1>;
  }

  return (
    <>
      <Navbar />

      <div className="product-page">
        <img
          src={product.image}
          alt={product.name}
          className="product-image-large"
        />

        <div>
          <h1>{product.name}</h1>

          <p
            style={{
              color: "#D4AF37",
              fontSize: "20px",
            }}
          >
            ★★★★★
          </p>

          <div>
            <span
              style={{
                fontSize: "34px",
                fontWeight: "bold",
                color: "#D4AF37",
              }}
            >
              ₹{product.price}
            </span>

            <span
              style={{
                marginLeft: "15px",
                textDecoration: "line-through",
                color: "#999",
                fontSize: "22px",
              }}
            >
              ₹{(product as any).originalPrice}
            </span>
          </div>

          <p
            style={{
              color: "#28a745",
              fontWeight: "bold",
            }}
          >
            Save ₹
            {(product as any).originalPrice -
              product.price}
          </p>

          {(product as any).originalPrice &&
            (product as any).originalPrice >
              product.price && (
              <p
                style={{
                  color: "#28a745",
                  fontWeight: "bold",
                }}
              >
                {Math.round(
                  (((product as any).originalPrice -
                    product.price) /
                    (product as any).originalPrice) *
                    100
                )}
                % OFF
              </p>
            )}

          <p>{product.description}</p>

          <h3>Available Sizes</h3>

          <div>
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() =>
                  setSelectedSize(size)
                }
                className="size-btn"
                style={{
                  background:
                    selectedSize === size
                      ? "#D4AF37"
                      : "white",
                }}
              >
                {size}
              </button>
            ))}
          </div>

          <h3
            style={{
              marginTop: "20px",
            }}
          >
            Available Colors
          </h3>

          <div>
            {product.colors.map((color) => (
              <button
                key={color}
                onClick={() =>
                  setSelectedColor(color)
                }
                className="color-btn"
                style={{
                  background:
                    selectedColor === color
                      ? "#D4AF37"
                      : "white",
                }}
              >
                {color}
              </button>
            ))}
          </div>

          <button
            className="add-cart-btn"
            onClick={() => {
              if (!selectedSize) {
                alert(
                  "Please select a size"
                );
                return;
              }

              if (!selectedColor) {
                alert(
                  "Please select a color"
                );
                return;
              }

              addToCart({
                ...product,
                selectedSize,
                selectedColor,
              });

              alert(
                "Added To Cart Successfully!"
              );
            }}
          >
            Add To Cart
          </button>
        </div>
      </div>
    </>
  );
}
