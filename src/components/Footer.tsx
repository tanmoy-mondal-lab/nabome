import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      style={{
        background: "#030303",
        color: "#fff",
        borderTop:
          "1px solid rgba(212,175,55,.08)",
        marginTop: "100px",
      }}
    >
      <div
        style={{
          maxWidth: "1600px",
          margin: "0 auto",
          padding: "80px 6% 40px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(250px,1fr))",
            gap: "50px",
            marginBottom: "60px",
          }}
        >
          {/* BRAND */}
          <div>
            <img
              src="/images/logo/logo.png"
              alt="NABOME"
              style={{
                width: "120px",
                marginBottom: "20px",
              }}
            />

            <h2
              style={{
                color: "#D4AF37",
                marginBottom: "15px",
                fontWeight: 800,
              }}
            >
              NABOME
            </h2>

            <p
              style={{
                color: "#999",
                lineHeight: 1.8,
              }}
            >
              Premium Bengali streetwear
              designed for creators,
              dreamers, and individuals who
              build their own story.
            </p>
          </div>

          {/* SHOP */}
          <div>
            <h3
              style={{
                marginBottom: "20px",
                color: "#D4AF37",
              }}
            >
              Shop
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <Link to="/category">
                All Products
              </Link>

              <Link to="/category">
                Men
              </Link>

              <Link to="/category">
                Women
              </Link>

              <Link to="/category">
                Accessories
              </Link>
            </div>
          </div>

          {/* COMPANY */}
          <div>
            <h3
              style={{
                marginBottom: "20px",
                color: "#D4AF37",
              }}
            >
              Company
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <Link to="/about">
                About Us
              </Link>

              <Link to="/contact">
                Contact
              </Link>

              <Link to="/wishlist">
                Wishlist
              </Link>

              <Link to="/cart">
                Cart
              </Link>
            </div>
          </div>

          {/* CONTACT */}
          <div>
            <h3
              style={{
                marginBottom: "20px",
                color: "#D4AF37",
              }}
            >
              Contact
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                color: "#999",
              }}
            >
              <p>+91 9163854706</p>

              <p>support@nabome.in</p>

              <p>
                Kolkata, West Bengal,
                India
              </p>
            </div>
          </div>
        </div>

        {/* NEWSLETTER */}
        <div
          style={{
            background:
              "linear-gradient(180deg,#111,#0b0b0b)",
            border:
              "1px solid rgba(212,175,55,.08)",
            borderRadius: "24px",
            padding: "40px",
            textAlign: "center",
            marginBottom: "50px",
          }}
        >
          <h2
            style={{
              marginBottom: "15px",
            }}
          >
            Join The Community
          </h2>

          <p
            style={{
              color: "#999",
              marginBottom: "25px",
            }}
          >
            Get updates on new drops,
            limited editions, and exclusive
            offers.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <input
              type="email"
              placeholder="Enter your email"
              style={{
                padding: "14px 18px",
                minWidth: "280px",
                borderRadius: "12px",
                border: "1px solid #222",
                background: "#050505",
                color: "#fff",
              }}
            />

            <button
              style={{
                padding: "14px 24px",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: 700,
                background:
                  "linear-gradient(135deg,#FFD700,#D4AF37)",
                color: "#000",
              }}
            >
              Subscribe
            </button>
          </div>
        </div>

        {/* BOTTOM */}
        <div
          style={{
            borderTop:
              "1px solid rgba(255,255,255,.06)",
            paddingTop: "25px",
            display: "flex",
            justifyContent:
              "space-between",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <p
            style={{
              color: "#777",
            }}
          >
            © 2026 NABOME. All Rights
            Reserved.
          </p>

          <p
            style={{
              color: "#777",
            }}
          >
            Build Your Story.
          </p>
        </div>
      </div>
    </footer>
  );
}