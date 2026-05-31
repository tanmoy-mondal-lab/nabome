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
    <>
      {/* TOP BAR */}
      <div
        style={{
          background: "#111",
          color: "#fff",
          textAlign: "center",
          padding: "10px",
          fontSize: ".8rem",
          letterSpacing: "2px",
          textTransform: "uppercase",
        }}
      >
        Free Shipping On Orders Above ₹999
      </div>

      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 9999,
          background: "#fff",
          borderBottom: "1px solid #eee",
        }}
      >
        <div
          style={{
            maxWidth: "1600px",
            margin: "0 auto",
            padding: "20px 6%",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
            }}
          >
            {/* LEFT */}
            <div
              className="desktop-nav"
              style={{
                display: "flex",
                gap: "25px",
                alignItems: "center",
              }}
            >
              <Link
                to="/category"
                style={navLink}
              >
                SHOP
              </Link>

              <Link
                to="/category"
                style={navLink}
              >
                NEW
              </Link>

              <Link
                to="/about"
                style={navLink}
              >
                ABOUT
              </Link>

              <Link
                to="/contact"
                style={navLink}
              >
                CONTACT
              </Link>
            </div>

            {/* LOGO */}
            <Link
              to="/"
              style={{
                textDecoration: "none",
                color: "#111",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
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
                    fontSize: "1.3rem",
                    letterSpacing: "4px",
                    fontWeight: 700,
                  }}
                >
                  NABOME
                </span>
              </div>
            </Link>

            {/* RIGHT */}
            <div
              className="desktop-nav"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "18px",
              }}
            >
              <input
                type="text"
                placeholder="Search"
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
                  border: "1px solid #ddd",
                  padding: "12px 15px",
                  outline: "none",
                  minWidth: "180px",
                  fontSize: ".9rem",
                }}
              />

              <Link
                to="/profile"
                style={navLink}
              >
                ACCOUNT
              </Link>

              <Link
                to="/wishlist"
                style={navLink}
              >
                ♡ {wishlist.length}
              </Link>

              <Link
                to="/cart"
                style={navLink}
              >
                👜 {cartCount}
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
                fontSize: "1.8rem",
                color: "#111",
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
                display: "flex",
                flexDirection: "column",
                gap: "15px",
                marginTop: "25px",
                paddingTop: "25px",
                borderTop:
                  "1px solid #eee",
              }}
            >
              <Link
                to="/category"
                style={mobileLink}
              >
                SHOP
              </Link>

              <Link
                to="/about"
                style={mobileLink}
              >
                ABOUT
              </Link>

              <Link
                to="/contact"
                style={mobileLink}
              >
                CONTACT
              </Link>

              <Link
                to="/profile"
                style={mobileLink}
              >
                ACCOUNT
              </Link>

              <Link
                to="/wishlist"
                style={mobileLink}
              >
                WISHLIST (
                {wishlist.length})
              </Link>

              <Link
                to="/cart"
                style={mobileLink}
              >
                CART ({cartCount})
              </Link>

              <input
                type="text"
                placeholder="Search"
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
                  border: "1px solid #ddd",
                  padding: "14px",
                  outline: "none",
                }}
              />
            </div>
          )}
        </div>
      </nav>
    </>
  );
}

const navLink = {
  color: "#111",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: ".9rem",
  letterSpacing: "1px",
} as const;

const mobileLink = {
  color: "#111",
  textDecoration: "none",
  fontWeight: 600,
  padding: "6px 0",
} as const;