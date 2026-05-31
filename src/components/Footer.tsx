import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      style={{
        background: "#fff",
        color: "#111",
        borderTop: "1px solid #e5e5e5",
        marginTop: "120px",
      }}
    >
      {/* NEWSLETTER */}

      <section
        style={{
          padding: "100px 6%",
          textAlign: "center",
          borderBottom: "1px solid #e5e5e5",
        }}
      >
        <p
          style={{
            textTransform: "uppercase",
            letterSpacing: "4px",
            color: "#888",
            fontSize: ".85rem",
          }}
        >
          Newsletter
        </p>

        <h2
          style={{
            fontSize:
              "clamp(3rem,5vw,4.5rem)",
            fontWeight: 300,
            marginTop: "20px",
          }}
        >
          Stay Updated
        </h2>

        <p
          style={{
            color: "#666",
            marginTop: "20px",
            maxWidth: "600px",
            marginLeft: "auto",
            marginRight: "auto",
            lineHeight: 1.8,
          }}
        >
          Receive updates on new
          collections, exclusive releases,
          and special offers.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            flexWrap: "wrap",
            marginTop: "35px",
          }}
        >
          <input
            type="email"
            placeholder="Your email address"
            style={{
              minWidth: "320px",
              padding: "16px",
              border: "1px solid #ddd",
              outline: "none",
              background: "#fff",
            }}
          />

          <button
            style={{
              padding: "16px 30px",
              border: "none",
              background: "#111",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Subscribe
          </button>
        </div>
      </section>

      {/* MAIN FOOTER */}

      <div
        style={{
          maxWidth: "1600px",
          margin: "0 auto",
          padding: "80px 6%",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: "50px",
          }}
        >
          {/* BRAND */}

          <div>
            <h2
              style={{
                fontWeight: 700,
                letterSpacing: "4px",
                marginBottom: "20px",
              }}
            >
              NABOME
            </h2>

            <p
              style={{
                color: "#666",
                lineHeight: 1.9,
              }}
            >
              Contemporary fashion inspired
              by Bengal. Premium essentials,
              timeless silhouettes and modern
              everyday wear.
            </p>
          </div>

          {/* SHOP */}

          <div>
            <h4
              style={{
                marginBottom: "20px",
                fontWeight: 600,
              }}
            >
              Shop
            </h4>

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
            <h4
              style={{
                marginBottom: "20px",
                fontWeight: 600,
              }}
            >
              Company
            </h4>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <Link to="/about">
                About
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

          {/* HELP */}

          <div>
            <h4
              style={{
                marginBottom: "20px",
                fontWeight: 600,
              }}
            >
              Help
            </h4>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <Link to="#">
                Shipping Policy
              </Link>

              <Link to="#">
                Return Policy
              </Link>

              <Link to="#">
                Privacy Policy
              </Link>

              <Link to="#">
                Terms & Conditions
              </Link>
            </div>
          </div>

          {/* CONTACT */}

          <div>
            <h4
              style={{
                marginBottom: "20px",
                fontWeight: 600,
              }}
            >
              Contact
            </h4>

            <div
              style={{
                color: "#666",
                lineHeight: 2,
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

        {/* BOTTOM */}

        <div
          style={{
            borderTop: "1px solid #e5e5e5",
            marginTop: "60px",
            paddingTop: "30px",
            display: "flex",
            justifyContent:
              "space-between",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <p
            style={{
              color: "#888",
            }}
          >
            © 2026 NABOME.
            All Rights Reserved.
          </p>

          <p
            style={{
              color: "#888",
            }}
          >
            Build Your Story.
          </p>
        </div>
      </div>
    </footer>
  );
}