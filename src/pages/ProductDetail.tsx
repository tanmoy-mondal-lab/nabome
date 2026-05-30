import { useParams } from "react-router-dom";
import { products } from "../data/products";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { useState } from "react";

export default function ProductDetail() {
  const { id } = useParams();

  const product = products.find(
    (p) => p.id === Number(id)
  );

  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  if (!product) {
    return <h1>Product Not Found</h1>;
  }

  return (
    <>
      <Navbar />

      <div
        style={{
          padding: "50px",
          display: "flex",
          gap: "40px",
          flexWrap: "wrap",
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: "400px",
            maxWidth: "100%",
            borderRadius: "15px",
          }}
        />

        <div>
          <h1>{product.name}</h1>

          <h2>₹{product.price}</h2>

          <p>{product.description}</p>

          <h3>Available Sizes</h3>

          <div>
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                style={{
                  marginRight: "10px",
                  padding: "10px 15px",
                  background: selectedSize === size ? "#D4AF37" : "white",
                  border: selectedSize === size ? "2px solid #D4AF37" : "2px solid #ccc",
                }}
              >
                {size}
              </button>
            ))}
          </div>

          <h3 style={{ marginTop: "20px" }}>
            Available Colors
          </h3>

          <div>
            {product.colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                style={{
                  marginRight: "10px",
                  padding: "10px 15px",
                  background: selectedColor === color ? "#D4AF37" : "white",
                  border: selectedColor === color ? "2px solid #D4AF37" : "2px solid #ccc",
                }}
              >
                {color}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              if (!selectedSize) {
                alert("Please select a size");
                return;
              }

              if (!selectedColor) {
                alert("Please select a color");
                return;
            }

            addToCart({
              ...product,
              selectedSize,
              selectedColor,
            });

            alert("Added To Cart Successfully!");
        }}
        style={{
          marginTop: "30px",
          padding: "15px 30px",
          background: "#111",
          color: "white",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        Add To Cart
    </button>
        </div>
      </div>
    </>
  );
}