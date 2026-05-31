import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

export default function Navbar() {
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] =
    useState(false);

  const navigate = useNavigate();

  const { cart } = useCart();
  const { wishlist } = useWishlist();

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 9999,
        backdropFilter: "blur(20px)",
        background: "rgba(5,5,5,.92)",
        borderBottom:
          "1px solid rgba(212,175,55,.08)",
      }}
    >
      <div
        style={{
          maxWidth: "1600px",
          margin: "0 auto",
          padding: "18px 6%",
        }}
      >
        {/* TOP BAR */}
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
          }}
        >
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
            }}
          >
            <img
              src="/images/logo/logo.png"
              alt="NABOME"
              style={{
                height: "42px",
              }}
            />

            <span
              style={{
                color: "#D4AF37",
                fontWeight: 900,
                letterSpacing: "2px",
                fontSize: "1.2rem",
              }}
            >
              NABOME
            </span>
          </Link>

          {/* DESKTOP */}
          <div
            className="desktop-nav"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "25px",
            }}
          >
            <Link
              to="/"
              style={linkStyle}
            >
              Home
            </Link>

            <Link
              to="/category"
              style={linkStyle}
            >
              Shop
            </Link>

            <Link
              to="/about"
              style={linkStyle}
            >
              About
            </Link>

            <Link
              to="/contact"
              style={linkStyle}
            >
              Contact
            </Link>

            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  search.trim()
                ) {
                  navigate(
                    `/category?search=${search}`
                  );
                }
              }}
              style={{
                background: "#111",
                border:
                  "1px solid rgba(212,175,55,.08)",
                color: "#fff",
                borderRadius: "999px",
                padding: "12px 18px",
                minWidth: "220px",
                outline: "none",
              }}
            />

            <Link
              to="/wishlist"
              style={iconStyle}
            >
              ♡ {wishlist.length}
            </Link>

            <Link
              to="/cart"
              style={{
                background:
                  "linear-gradient(135deg,#FFD700,#D4AF37)",
                color: "#000",
                padding: "12px 18px",
                borderRadius: "999px",
                textDecoration: "none",
                fontWeight: 800,
              }}
            >
              🛒 {cartCount}
            </Link>
          </div>

          {/* MOBILE BUTTON */}
          <button
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: "1.8rem",
              cursor: "pointer",
            }}
          >
            ☰
          </button>
        </div>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              paddingTop: "20px",
              borderTop:
                "1px solid rgba(255,255,255,.08)",
            }}
          >
            <Link
              to="/"
              style={mobileLink}
            >
              Home
            </Link>

            <Link
              to="/category"
              style={mobileLink}
            >
              Shop
            </Link>

            <Link
              to="/about"
              style={mobileLink}
            >
              About
            </Link>

            <Link
              to="/contact"
              style={mobileLink}
            >
              Contact
            </Link>

            <Link
              to="/wishlist"
              style={mobileLink}
            >
              Wishlist (
              {wishlist.length})
            </Link>

            <Link
              to="/cart"
              style={mobileLink}
            >
              Cart ({cartCount})
            </Link>

            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  search.trim()
                ) {
                  navigate(
                    `/category?search=${search}`
                  );
                  setMenuOpen(false);
                }
              }}
              style={{
                background: "#111",
                border:
                  "1px solid rgba(212,175,55,.08)",
                color: "#fff",
                borderRadius: "12px",
                padding: "14px",
                outline: "none",
              }}
            />
          </div>
        )}
      </div>
    </nav>
  );
}

const linkStyle = {
  color: "#fff",
  textDecoration: "none",
  fontWeight: 600,
} as const;

const mobileLink = {
  color: "#fff",
  textDecoration: "none",
  fontWeight: 600,
  padding: "8px 0",
} as const;

const iconStyle = {
  color: "#fff",
  textDecoration: "none",
  fontWeight: 700,
} as const;