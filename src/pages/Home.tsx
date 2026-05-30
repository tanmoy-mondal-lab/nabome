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
          background: "#0f0f0f",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "60px",
          gap: "50px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ maxWidth: "550px" }}>
          <img
            src="/images/logo/logo.png"
            alt="Nabome"
            style={{
              width: "220px",
              marginBottom: "20px",
            }}
          />

          <h1
            style={{
              fontSize: "4rem",
              marginBottom: "20px",
              color: "#D4AF37",
            }}
          >
            Build Your Story
          </h1>

          <h2
            style={{
              fontSize: "2rem",
              marginBottom: "20px",
            }}
          >
            Style That Speaks.
            <br />
            Confidence That Stays.
          </h2>

          <p
            style={{
              color: "#cccccc",
              marginBottom: "30px",
            }}
          >
            Premium streetwear crafted for the bold.
            Minimal in design. Maximum in impact.
          </p>

          <Link to="/category">
            <button
              style={{
                padding: "14px 30px",
                border: "none",
                background: "#D4AF37",
                color: "black",
                fontWeight: "bold",
                cursor: "pointer",
                borderRadius: "8px",
              }}
            >
              Shop Collection
            </button>
          </Link>
        </div>

        <img
          src="/images/hero/hero-banner.png"
          alt="Hero"
          style={{
            width: "600px",
            maxWidth: "100%",
            borderRadius: "20px",
          }}
        />
      </section>

      {/* CATEGORIES */}
      <section
        style={{
          padding: "80px 40px",
          background: "#111",
          color: "white",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: "3rem",
            marginBottom: "40px",
            color: "#D4AF37",
          }}
        >
          Collections
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: "25px",
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
                background: "#1a1a1a",
                padding: "40px",
                borderRadius: "15px",
                textAlign: "center",
                border: "1px solid #D4AF37",
              }}
            >
              <h3>{item}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* WHY NABOME */}
      <section
        style={{
          padding: "80px 40px",
          background: "#0f0f0f",
          color: "white",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "50px",
            color: "#D4AF37",
          }}
        >
          Why Nabome?
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(250px,1fr))",
            gap: "25px",
          }}
        >
          {[
            "Premium Quality",
            "Bengali Identity",
            "Print On Demand",
            "Built For Expression",
          ].map((item) => (
            <div
              key={item}
              style={{
                background: "#1a1a1a",
                padding: "30px",
                borderRadius: "15px",
              }}
            >
              <h3>{item}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* COMMUNITY */}
      <section
        style={{
          padding: "80px 40px",
          background: "#111",
          color: "white",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            color: "#D4AF37",
            marginBottom: "20px",
          }}
        >
          Built By Us. Worn By You.
        </h2>

        <img
          src="/images/community/community.jpeg"
          alt="Community"
          style={{
            width: "700px",
            maxWidth: "100%",
            borderRadius: "20px",
          }}
        />
      </section>

      {/* FOOTER */}
      <footer
        style={{
          background: "#000",
          color: "#fff",
          textAlign: "center",
          padding: "40px",
        }}
      >
        <h2 style={{ color: "#D4AF37" }}>
          নবME
        </h2>

        <p>Build Your Story</p>

        <p>WhatsApp: +91 9163854706</p>

        <p>© 2026 Nabome. All Rights Reserved.</p>
      </footer>
    </>
  );
}