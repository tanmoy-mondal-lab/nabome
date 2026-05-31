import { useParams, Link } from "react-router-dom";
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

  const [selectedSize, setSelectedSize] =
    useState("");

  const [selectedColor, setSelectedColor] =
    useState("");

  const [selectedImage, setSelectedImage] =
    useState(product?.image || "");

  if (!product) {
    return (
      <>
        <Navbar />
        <div
          style={{
            minHeight: "100vh",
            background: "#050505",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h1>Product Not Found</h1>
        </div>
      </>
    );
  }

  const relatedProducts = products.filter(
    (p) => p.id !== product.id
  );

  const discount =
    (product as any).originalPrice
      ? Math.round(
          (((product as any).originalPrice -
            product.price) /
            (product as any).originalPrice) *
            100
        )
      : 0;

  return (
    <>
      <Navbar />

      <div
        style={{
          background: "#050505",
          color: "#fff",
          minHeight: "100vh",
          padding: "60px 6%",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(450px,1fr))",
            gap: "60px",
            alignItems: "start",
          }}
        >
          {/* LEFT */}
          <div>
            <img
              src={selectedImage}
              alt={product.name}
              style={{
                width: "100%",
                borderRadius: "28px",
                objectFit: "cover",
                border:
                  "1px solid rgba(212,175,55,.08)",
              }}
            />

            {product.images &&
              product.images.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    marginTop: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  {product.images.map((img) => (
                    <img
                      key={img}
                      src={img}
                      alt="thumbnail"
                      onClick={() =>
                        setSelectedImage(img)
                      }
                      style={{
                        width: "90px",
                        height: "90px",
                        objectFit: "cover",
                        borderRadius: "14px",
                        cursor: "pointer",
                        border:
                          selectedImage === img
                            ? "2px solid #D4AF37"
                            : "1px solid #333",
                      }}
                    />
                  ))}
                </div>
              )}
          </div>

          {/* RIGHT */}
          <div>
            <span
              style={{
                color: "#D4AF37",
                letterSpacing: "3px",
                textTransform: "uppercase",
                fontSize: ".85rem",
              }}
            >
              Premium Collection
            </span>

            <h1
              style={{
                fontSize: "clamp(2.5rem,5vw,4rem)",
                marginTop: "10px",
                marginBottom: "15px",
                fontWeight: 900,
              }}
            >
              {product.name}
            </h1>

            <p
              style={{
                color: "#D4AF37",
                marginBottom: "25px",
                fontSize: "1.1rem",
              }}
            >
              ★★★★★ 4.9 Rating
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  fontSize: "2.2rem",
                  fontWeight: 800,
                  color: "#D4AF37",
                }}
              >
                ₹{product.price}
              </span>

              {(product as any)
                .originalPrice && (
                <span
                  style={{
                    color: "#777",
                    textDecoration:
                      "line-through",
                    fontSize: "1.2rem",
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

            {discount > 0 && (
              <div
                style={{
                  marginBottom: "25px",
                }}
              >
                <span
                  style={{
                    background:
                      "rgba(212,175,55,.15)",
                    color: "#D4AF37",
                    padding: "8px 14px",
                    borderRadius: "999px",
                    fontWeight: 700,
                  }}
                >
                  {discount}% OFF
                </span>
              </div>
            )}

            <p
              style={{
                color: "#aaa",
                lineHeight: 1.9,
                marginBottom: "35px",
              }}
            >
              {product.description}
            </p>

            {/* SIZES */}
            <h3
              style={{
                marginBottom: "15px",
              }}
            >
              Select Size
            </h3>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "30px",
              }}
            >
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() =>
                    setSelectedSize(size)
                  }
                  style={{
                    padding: "12px 22px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontWeight: 700,
                    border:
                      selectedSize === size
                        ? "none"
                        : "1px solid #333",
                    background:
                      selectedSize === size
                        ? "#D4AF37"
                        : "#111",
                    color:
                      selectedSize === size
                        ? "#000"
                        : "#fff",
                  }}
                >
                  {size}
                </button>
              ))}
            </div>

            {/* COLORS */}
            <h3
              style={{
                marginBottom: "15px",
              }}
            >
              Select Color
            </h3>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "40px",
              }}
            >
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() =>
                    setSelectedColor(color)
                  }
                  style={{
                    padding: "12px 22px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontWeight: 700,
                    border:
                      selectedColor ===
                      color
                        ? "none"
                        : "1px solid #333",
                    background:
                      selectedColor ===
                      color
                        ? "#D4AF37"
                        : "#111",
                    color:
                      selectedColor ===
                      color
                        ? "#000"
                        : "#fff",
                  }}
                >
                  {color}
                </button>
              ))}
            </div>

            <button
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
              style={{
                width: "100%",
                padding: "18px",
                border: "none",
                borderRadius: "16px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: 800,
                background:
                  "linear-gradient(135deg,#FFD700,#D4AF37)",
                color: "#000",
              }}
            >
              Add To Cart
            </button>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        <section
          style={{
            marginTop: "120px",
          }}
        >
          <h2
            style={{
              fontSize: "2.5rem",
              marginBottom: "40px",
            }}
          >
            You May Also Like
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill,minmax(280px,1fr))",
              gap: "30px",
            }}
          >
            {relatedProducts
              .slice(0, 4)
              .map((item) => (
                <Link
                  key={item.id}
                  to={`/product/${item.id}`}
                  style={{
                    textDecoration: "none",
                    color: "#fff",
                  }}
                >
                  <div
                    style={{
                      background: "#111",
                      borderRadius: "24px",
                      overflow: "hidden",
                      border:
                        "1px solid rgba(212,175,55,.08)",
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: "100%",
                        height: "350px",
                        objectFit: "cover",
                      }}
                    />

                    <div
                      style={{
                        padding: "20px",
                      }}
                    >
                      <h3
                        style={{
                          marginBottom: "10px",
                        }}
                      >
                        {item.name}
                      </h3>

                      <p
                        style={{
                          color: "#D4AF37",
                          fontWeight: 700,
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
      </div>
    </>
  );
}