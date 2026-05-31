import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { products } from "../data/products";

export default function Home() {
  const featuredProducts = products.slice(0, 4);

  return (
    <>
      <Navbar />

      {/* HERO */}
      <section
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(180deg,#050505 0%,#0d0d0d 100%)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "80px",
          padding: "80px 8%",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: "320px" }}>
          <span
            style={{
              color: "#D4AF37",
              letterSpacing: "4px",
              textTransform: "uppercase",
              fontSize: ".85rem",
              fontWeight: 700,
            }}
          >
            Premium Bengali Streetwear
          </span>

          <h1
            style={{
              fontSize: "clamp(4rem,9vw,8rem)",
              fontWeight: 900,
              lineHeight: ".9",
              marginTop: "20px",
              marginBottom: "30px",
            }}
          >
            BUILD
            <br />
            YOUR STORY
          </h1>

          <p
            style={{
              color: "#999",
              fontSize: "1.15rem",
              lineHeight: 1.9,
              maxWidth: "650px",
              marginBottom: "40px",
            }}
          >
            Luxury streetwear inspired by Bengali
            culture, modern fashion, and fearless
            self-expression.
          </p>

          <div
            style={{
              display: "flex",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <Link to="/category">
              <button
                style={{
                  padding: "18px 36px",
                  borderRadius: "14px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 800,
                  background:
                    "linear-gradient(135deg,#FFD700,#D4AF37)",
                  color: "#000",
                }}
              >
                Shop Collection
              </button>
            </Link>

            <Link to="/about">
              <button
                style={{
                  padding: "18px 36px",
                  borderRadius: "14px",
                  border:
                    "1px solid rgba(255,255,255,.15)",
                  background: "transparent",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Our Story
              </button>
            </Link>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: "320px" }}>
          <img
            src="/images/hero/hero-banner.png"
            alt="Nabome"
            style={{
              width: "100%",
              borderRadius: "30px",
              boxShadow:
                "0 30px 80px rgba(0,0,0,.6)",
            }}
          />
        </div>
      </section>

      {/* STATS */}
      <section
        style={{
          background: "#080808",
          padding: "80px 8%",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: "25px",
        }}
      >
        {[
          ["10K+", "Customers"],
          ["500+", "Designs"],
          ["99%", "Satisfaction"],
          ["24/7", "Support"],
        ].map(([number, text]) => (
          <div
            key={text}
            style={{
              background: "#111",
              borderRadius: "24px",
              padding: "40px",
            }}
          >
            <h2
              style={{
                color: "#D4AF37",
                fontSize: "3rem",
              }}
            >
              {number}
            </h2>

            <p style={{ color: "#999" }}>
              {text}
            </p>
          </div>
        ))}
      </section>

      {/* FEATURED PRODUCTS */}
      <section
        style={{
          padding: "120px 8%",
          background: "#050505",
          color: "#fff",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "60px",
          }}
        >
          <span
            style={{
              color: "#D4AF37",
              letterSpacing: "3px",
            }}
          >
            FEATURED COLLECTION
          </span>

          <h2
            style={{
              fontSize: "4rem",
              marginTop: "15px",
            }}
          >
            Best Sellers
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(280px,1fr))",
            gap: "30px",
          }}
        >
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              style={{
                textDecoration: "none",
                color: "#fff",
              }}
            >
              <div
                style={{
                  background:
                    "linear-gradient(180deg,#111,#0b0b0b)",
                  borderRadius: "24px",
                  overflow: "hidden",
                  border:
                    "1px solid rgba(212,175,55,.08)",
                }}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "380px",
                    objectFit: "cover",
                  }}
                />

                <div
                  style={{
                    padding: "24px",
                  }}
                >
                  <h3>{product.name}</h3>

                  <p
                    style={{
                      color: "#D4AF37",
                      marginTop: "10px",
                      fontWeight: 700,
                    }}
                  >
                    ₹{product.price}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* BRAND STORY */}
      <section
        style={{
          background: "#0d0d0d",
          color: "#fff",
          padding: "120px 8%",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "4rem",
            marginBottom: "25px",
          }}
        >
          Fashion With Identity
        </h2>

        <p
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            color: "#999",
            lineHeight: 1.9,
          }}
        >
          NABOME blends Bengali culture with
          modern streetwear aesthetics, creating
          timeless pieces that help you express
          who you are.
        </p>
      </section>

      {/* TESTIMONIALS */}
      <section
        style={{
          padding: "120px 8%",
          background: "#050505",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#fff",
            fontSize: "3rem",
            marginBottom: "60px",
          }}
        >
          What Customers Say
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(280px,1fr))",
            gap: "30px",
          }}
        >
          {[
            "Amazing quality and premium feel.",
            "The fit is perfect. Love the design.",
            "Best Bengali streetwear brand I've found.",
          ].map((review, index) => (
            <div
              key={index}
              style={{
                background: "#111",
                padding: "35px",
                borderRadius: "24px",
              }}
            >
              <p
                style={{
                  color: "#D4AF37",
                  marginBottom: "15px",
                }}
              >
                ★★★★★
              </p>

              <p
                style={{
                  color: "#ccc",
                  lineHeight: 1.8,
                }}
              >
                {review}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: "120px 8%",
          textAlign: "center",
          background: "#0a0a0a",
          color: "#fff",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(3rem,6vw,5rem)",
            marginBottom: "20px",
          }}
        >
          Wear Your Story
        </h2>

        <p
          style={{
            color: "#999",
            marginBottom: "40px",
          }}
        >
          Join thousands who choose identity over trends.
        </p>

        <Link to="/category">
          <button
            style={{
              padding: "18px 40px",
              border: "none",
              borderRadius: "14px",
              cursor: "pointer",
              fontWeight: 800,
              background:
                "linear-gradient(135deg,#FFD700,#D4AF37)",
            }}
          >
            Explore Collection
          </button>
        </Link>
      </section>
    </>
  );
}