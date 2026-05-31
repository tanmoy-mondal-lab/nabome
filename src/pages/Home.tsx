import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Home() {
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
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            Premium Bengali Streetwear
          </span>

          <h1
            style={{
              fontSize: "clamp(4rem,8vw,7rem)",
              lineHeight: 0.9,
              marginTop: "20px",
              marginBottom: "30px",
              fontWeight: 900,
              letterSpacing: "-4px",
            }}
          >
            WEAR
            <br />
            IDENTITY
          </h1>

          <p
            style={{
              color: "#A0A0A0",
              fontSize: "1.15rem",
              lineHeight: 1.9,
              maxWidth: "600px",
              marginBottom: "40px",
            }}
          >
            Premium clothing and accessories designed
            for creators, dreamers and disruptors.
            Minimal design. Maximum expression.
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
                  padding: "16px 36px",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "1rem",
                  background:
                    "linear-gradient(135deg,#FFD700,#D4AF37)",
                  color: "#000",
                  boxShadow:
                    "0 15px 40px rgba(212,175,55,.35)",
                }}
              >
                Shop Collection
              </button>
            </Link>

            <button
              style={{
                padding: "16px 36px",
                borderRadius: "12px",
                border: "1px solid #333",
                background: "transparent",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Explore Brand
            </button>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: "320px" }}>
          <img
            src="/images/hero/hero-banner.png"
            alt="Hero"
            style={{
              width: "100%",
              borderRadius: "30px",
              boxShadow:
                "0 40px 100px rgba(0,0,0,.6)",
              border:
                "1px solid rgba(212,175,55,.15)",
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
          gap: "30px",
          color: "#fff",
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
              padding: "40px",
              borderRadius: "20px",
              border:
                "1px solid rgba(212,175,55,.12)",
            }}
          >
            <h2
              style={{
                color: "#D4AF37",
                fontSize: "3rem",
                marginBottom: "10px",
              }}
            >
              {number}
            </h2>

            <p style={{ color: "#999" }}>{text}</p>
          </div>
        ))}
      </section>

      {/* COLLECTIONS */}
      <section
        style={{
          padding: "120px 8%",
          background: "#0d0d0d",
          color: "#fff",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: "4rem",
            marginBottom: "70px",
          }}
        >
          Collections
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
            "Men",
            "Women",
            "Unisex",
            "Accessories",
          ].map((item) => (
            <div
              key={item}
              style={{
                background:
                  "linear-gradient(180deg,#1a1a1a,#0f0f0f)",
                padding: "60px 40px",
                borderRadius: "24px",
                border:
                  "1px solid rgba(212,175,55,.12)",
                boxShadow:
                  "0 20px 60px rgba(0,0,0,.4)",
              }}
            >
              <h3
                style={{
                  fontSize: "2rem",
                  marginBottom: "15px",
                }}
              >
                {item}
              </h3>

              <p style={{ color: "#888" }}>
                Discover premium pieces crafted
                for everyday expression.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY NABOME */}
      <section
        style={{
          background: "#050505",
          color: "#fff",
          padding: "120px 8%",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: "4rem",
            marginBottom: "70px",
          }}
        >
          Why Nabome
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(260px,1fr))",
            gap: "30px",
          }}
        >
          {[
            {
              title: "Premium Quality",
              text: "Crafted with premium fabrics and exceptional finishing.",
            },
            {
              title: "Bengali Identity",
              text: "Rooted in culture while embracing global fashion.",
            },
            {
              title: "Print On Demand",
              text: "Less waste. Better quality. Smarter production.",
            },
            {
              title: "Built For Expression",
              text: "Designed for people who wear their story proudly.",
            },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                background: "#111",
                padding: "40px",
                borderRadius: "24px",
              }}
            >
              <h3
                style={{
                  color: "#D4AF37",
                  marginBottom: "15px",
                }}
              >
                {item.title}
              </h3>

              <p style={{ color: "#999" }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* COMMUNITY */}
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
            marginBottom: "20px",
          }}
        >
          Built By Us.
          <br />
          Worn By You.
        </h2>

        <p
          style={{
            color: "#999",
            marginBottom: "50px",
          }}
        >
          Join the growing Nabome community.
        </p>

        <img
          src="/images/community/community.jpeg"
          alt="Community"
          style={{
            width: "100%",
            maxWidth: "900px",
            borderRadius: "30px",
            boxShadow:
              "0 30px 80px rgba(0,0,0,.5)",
          }}
        />
      </section>

      {/* CTA */}
      <section
        style={{
          padding: "120px 8%",
          textAlign: "center",
          background: "#050505",
          color: "#fff",
        }}
      >
        <h2
          style={{
            fontSize: "4rem",
            marginBottom: "20px",
          }}
        >
          Ready To Build
          <br />
          Your Story?
        </h2>

        <p
          style={{
            color: "#999",
            marginBottom: "40px",
          }}
        >
          Discover premium apparel and accessories.
        </p>

        <Link to="/category">
          <button
            style={{
              padding: "18px 42px",
              border: "none",
              borderRadius: "14px",
              fontWeight: 700,
              cursor: "pointer",
              background:
                "linear-gradient(135deg,#FFD700,#D4AF37)",
            }}
          >
            Start Shopping
          </button>
        </Link>
      </section>

    </>
  );
}