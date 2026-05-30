import { useParams, Link } from "react-router-dom";
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

  const [selectedImage, setSelectedImage] =
    useState(product?.image || "");

  if (!product) {
    return <h1>Product Not Found</h1>;
  }

  const relatedProducts = products.filter(
    (p) => p.id !== product.id
  );

  return (
    <>
      <Navbar />

      <div className="product-page">
        <div>
          <img
            src={selectedImage}
            alt={product.name}
            className="product-image-large"
          />

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "15px",
            }}
          >
            {product.images?.map((img) => (
              <img
                key={img}
                src={img}
                alt="thumbnail"
                onClick={() =>
                  setSelectedImage(img)
                }
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "cover",
                  border:
                    selectedImage === img
                      ? "3px solid #D4AF37"
                      : "1px solid #ddd",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </div>

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
                  (((product as any)
                    .originalPrice -
                    product.price) /
                    (product as any)
                      .originalPrice) *
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

      <section
        style={{
          padding: "60px 30px",
          maxWidth: "1200px",
          margin: "auto",
        }}
      >
        <h2
          style={{
            marginBottom: "30px",
            color: "#D4AF37",
          }}
        >
          You May Also Like
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(250px,1fr))",
            gap: "20px",
          }}
        >
          {relatedProducts.map((item) => (
            <Link
              key={item.id}
              to={`/product/${item.id}`}
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "15px",
                  overflow: "hidden",
                  background: "#fff",
                }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  style={{
                    width: "100%",
                    height: "300px",
                    objectFit: "cover",
                  }}
                />

                <div
                  style={{
                    padding: "15px",
                  }}
                >
                  <h3>{item.name}</h3>

                  <p
                    style={{
                      color: "#D4AF37",
                      fontWeight: "bold",
                    }}
                  >
                    ₹{item.price}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
