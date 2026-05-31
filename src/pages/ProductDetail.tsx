import { useParams, Link } from "react-router-dom";
import { products } from "../data/products";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useState } from "react";
import ProductReviews from "../components/ProductReviews";
import TrustBadges from "../components/TrustBadges";

export default function ProductDetail() {
  const { id } = useParams();

  const product = products.find(
    (p) => p.id === Number(id)
  );

  const { addToCart } = useCart();

  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useWishlist();

  const [selectedSize, setSelectedSize] =
    useState("");

  const [selectedColor, setSelectedColor] =
    useState("");

  const [selectedImage, setSelectedImage] =
    useState(product?.image || "");

  const [pincode, setPincode] =
    useState("");

  if (!product) {
    return (
      <>
        <Navbar />

        <div
          style={{
            minHeight: "100vh",
            background: "#fff",
            color: "#111",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
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
          background: "#fff",
          color: "#111",
          minHeight: "100vh",
        }}
      >
        {/* BREADCRUMB */}

        <section
          style={{
            padding: "30px 6%",
            borderBottom: "1px solid #e5e5e5",
          }}
        >
          <p
            style={{
              color: "#777",
              fontSize: ".9rem",
            }}
          >
            Home / Shop / {product.category}
          </p>
        </section>

        {/* PRODUCT SECTION */}

        <section
          style={{
            padding: "60px 6%",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(500px,1fr))",
              gap: "70px",
              alignItems: "start",
            }}
          >
            {/* LEFT SIDE */}

            <div>
              <div
                style={{
                  border: "1px solid #e5e5e5",
                  background: "#fafafa",
                }}
              >
                <img
                  src={selectedImage}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "700px",
                    objectFit: "cover",
                  }}
                />
              </div>

              {/* THUMBNAILS */}

              <div
                style={{
                  display: "flex",
                  gap: "15px",
                  marginTop: "20px",
                  flexWrap: "wrap",
                }}
              >
                {product.images.map((img) => (
                  <img
                    key={img}
                    src={img}
                    alt=""
                    onClick={() =>
                      setSelectedImage(img)
                    }
                    style={{
                      width: "100px",
                      height: "120px",
                      objectFit: "cover",
                      cursor: "pointer",
                      border:
                        selectedImage === img
                          ? "2px solid #111"
                          : "1px solid #ddd",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* RIGHT SIDE */}

            <div
              style={{
                position: "sticky",
                top: "120px",
              }}
            >
              <p
                style={{
                  color: "#888",
                  textTransform: "uppercase",
                  letterSpacing: "3px",
                  fontSize: ".8rem",
                }}
              >
                {product.category}
              </p>

              <h1
                style={{
                  fontSize:
                    "clamp(2.5rem,5vw,4.5rem)",
                  fontWeight: 300,
                  lineHeight: 1,
                  marginTop: "15px",
                }}
              >
                {product.name}
              </h1>

              {/* PRICE */}

              <div
                style={{
                  marginTop: "30px",
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                }}
              >
                <span
                  style={{
                    fontSize: "2rem",
                    fontWeight: 600,
                  }}
                >
                  ₹{product.price}
                </span>

                {(product as any)
                  .originalPrice && (
                  <span
                    style={{
                      color: "#999",
                      textDecoration:
                        "line-through",
                    }}
                  >
                    ₹
                    {
                      (product as any)
                        .originalPrice
                    }
                  </span>
                )}

                {discount > 0 && (
                  <span
                    style={{
                      color: "#111",
                      border:
                        "1px solid #111",
                      padding: "6px 10px",
                      fontSize: ".8rem",
                    }}
                  >
                    {discount}% OFF
                  </span>
                )}
              </div>

              {/* DESCRIPTION */}

              <p
                style={{
                  marginTop: "30px",
                  color: "#666",
                  lineHeight: 1.9,
                  fontSize: "1rem",
                }}
              >
                {product.description}
              </p>

              {/* SIZE */}

              <div
                style={{
                  marginTop: "40px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    marginBottom: "15px",
                  }}
                >
                  <h3>Size</h3>

                  <button
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#666",
                    }}
                  >
                    Size Guide
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  {product.sizes.map(
                    (size) => (
                      <button
                        key={size}
                        onClick={() =>
                          setSelectedSize(
                            size
                          )
                        }
                        style={{
                          minWidth: "60px",
                          padding:
                            "14px 18px",
                          border:
                            selectedSize ===
                            size
                              ? "2px solid #111"
                              : "1px solid #ddd",
                          background:
                            "#fff",
                          cursor:
                            "pointer",
                          fontWeight:
                            600,
                        }}
                      >
                        {size}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* COLOR */}

              <div
                style={{
                  marginTop: "35px",
                }}
              >
                <h3
                  style={{
                    marginBottom: "15px",
                  }}
                >
                  Colour
                </h3>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  {product.colors.map(
                    (color) => (
                      <button
                        key={color}
                        onClick={() =>
                          setSelectedColor(
                            color
                          )
                        }
                        style={{
                          padding:
                            "14px 18px",
                          border:
                            selectedColor ===
                            color
                              ? "2px solid #111"
                              : "1px solid #ddd",
                          background:
                            "#fff",
                          cursor:
                            "pointer",
                          fontWeight:
                            500,
                        }}
                      >
                        {color}
                      </button>
                    )
                  )}
                </div>
              </div>
                            {/* ACTION BUTTONS */}

              <div
                style={{
                  display: "flex",
                  gap: "15px",
                  marginTop: "45px",
                  flexWrap: "wrap",
                }}
              >
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
                        "Please select a colour"
                      );
                      return;
                    }

                    addToCart({
                      ...product,
                      selectedSize,
                      selectedColor,
                    });

                    alert(
                      "Added To Bag"
                    );
                  }}
                  style={{
                    flex: 1,
                    minWidth: "220px",
                    padding: "18px",
                    border: "none",
                    background: "#111",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: "1rem",
                  }}
                >
                  Add To Bag
                </button>

                <button
                  onClick={() => {
                    if (
                      isInWishlist(
                        product.id
                      )
                    ) {
                      removeFromWishlist(
                        product.id
                      );
                    } else {
                      addToWishlist(
                        product
                      );
                    }
                  }}
                  style={{
                    minWidth: "180px",
                    padding: "18px",
                    border:
                      "1px solid #111",
                    background: "#fff",
                    color: "#111",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {isInWishlist(
                    product.id
                  )
                    ? "Saved"
                    : "Wishlist"}
                </button>
              </div>

              {/* DELIVERY */}

              <div
                style={{
                  marginTop: "60px",
                  paddingTop: "35px",
                  borderTop:
                    "1px solid #e5e5e5",
                }}
              >
                <h3
                  style={{
                    marginBottom: "20px",
                  }}
                >
                  Delivery & Returns
                </h3>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Enter Pincode"
                    value={pincode}
                    onChange={(e) =>
                      setPincode(
                        e.target.value
                      )
                    }
                    style={{
                      flex: 1,
                      minWidth: "200px",
                      padding: "15px",
                      border:
                        "1px solid #ddd",
                      outline: "none",
                    }}
                  />

                  <button
                    style={{
                      padding:
                        "15px 30px",
                      border:
                        "1px solid #111",
                      background:
                        "#fff",
                      cursor:
                        "pointer",
                    }}
                  >
                    Check
                  </button>
                </div>

                <div
                  style={{
                    marginTop: "20px",
                    color: "#666",
                    lineHeight: 2,
                  }}
                >
                  <p>
                    ✓ Free Shipping on
                    orders above ₹999
                  </p>

                  <p>
                    ✓ Easy Returns &
                    Exchanges
                  </p>

                  <p>
                    ✓ Estimated Delivery
                    3-5 Business Days
                  </p>
                </div>
              </div>

              {/* PRODUCT DETAILS */}

              <div
                style={{
                  marginTop: "60px",
                  paddingTop: "35px",
                  borderTop:
                    "1px solid #e5e5e5",
                }}
              >
                <h3
                  style={{
                    marginBottom: "25px",
                  }}
                >
                  Product Details
                </h3>

                <div
                  style={{
                    display: "grid",
                    gap: "18px",
                  }}
                >
                  <div
                    style={detailRow}
                  >
                    <span>
                      Material
                    </span>
                    <span>
                      Premium Cotton
                    </span>
                  </div>

                  <div
                    style={detailRow}
                  >
                    <span>Fit</span>
                    <span>
                      Oversized
                    </span>
                  </div>

                  <div
                    style={detailRow}
                  >
                    <span>
                      Category
                    </span>
                    <span>
                      {
                        product.category
                      }
                    </span>
                  </div>

                  <div
                    style={detailRow}
                  >
                    <span>
                      Wash Care
                    </span>
                    <span>
                      Machine Wash
                    </span>
                  </div>

                  <div
                    style={detailRow}
                  >
                    <span>
                      Country
                    </span>
                    <span>
                      India
                    </span>
                  </div>
                </div>
              </div>

              <TrustBadges />
            </div>
          </div>
        </section>

        {/* BRAND MESSAGE */}

        <section
          style={{
            padding:
              "120px 6%",
            background:
              "#f8f6f2",
            textAlign:
              "center",
          }}
        >
          <span
            style={{
              textTransform:
                "uppercase",
              letterSpacing:
                "4px",
              color: "#888",
            }}
          >
            NABOME
          </span>

          <h2
            style={{
              fontSize:
                "clamp(3rem,6vw,5rem)",
              fontWeight: 300,
              marginTop:
                "20px",
            }}
          >
            Designed In
            <br />
            Bengal
          </h2>

          <p
            style={{
              maxWidth:
                "700px",
              margin:
                "30px auto 0",
              color: "#666",
              lineHeight: 1.9,
            }}
          >
            Modern
            silhouettes,
            premium
            materials and
            timeless
            design inspired
            by culture,
            identity and
            everyday
            expression.
          </p>
        </section>

        {/* RELATED PRODUCTS */}

        <section
          style={{
            padding:
              "120px 6%",
            background:
              "#fff",
          }}
        >
          <div
            style={{
              marginBottom:
                "60px",
            }}
          >
            <span
              style={{
                textTransform:
                  "uppercase",
                letterSpacing:
                  "3px",
                color:
                  "#888",
              }}
            >
              More To
              Explore
            </span>

            <h2
              style={{
                fontSize:
                  "3rem",
                fontWeight:
                  300,
                marginTop:
                  "15px",
              }}
            >
              You May
              Also Like
            </h2>
          </div>

          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(280px,1fr))",
              gap: "30px",
            }}
          >
            {relatedProducts
              .slice(0, 4)
              .map(
                (
                  item
                ) => (
                  <Link
                    key={
                      item.id
                    }
                    to={`/product/${item.id}`}
                    style={{
                      color:
                        "#111",
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
                          "420px",
                        objectFit:
                          "cover",
                      }}
                    />

                    <div
                      style={{
                        marginTop:
                          "18px",
                      }}
                    >
                      <p
                        style={{
                          color:
                            "#888",
                          marginBottom:
                            "8px",
                        }}
                      >
                        {
                          item.category
                        }
                      </p>

                      <h3
                        style={{
                          fontWeight:
                            500,
                          marginBottom:
                            "10px",
                        }}
                      >
                        {
                          item.name
                        }
                      </h3>

                      <p>
                        ₹
                        {
                          item.price
                        }
                      </p>
                    </div>
                  </Link>
                )
              )}
          </div>

          <ProductReviews />
        </section>
      </div>
    </>
  );
}

const detailRow = {
  display: "flex",
  justifyContent:
    "space-between",
  paddingBottom:
    "12px",
  borderBottom:
    "1px solid #eee",
  color: "#666",
} as const;