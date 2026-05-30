import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import "./../styles/navbar.css";

export default function Navbar() {
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const { cart } = useCart();

  const { wishlist } = useWishlist();

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">
          <img
            src="/images/logo/logo.png"
            alt="Nabome"
          />
        </Link>
      </div>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/category">Shop</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </div>

      <div
        className="nav-right"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
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
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            minWidth: "220px",
          }}
        />

        <Link
          to="/wishlist"
          style={{
            textDecoration: "none",
            color: "inherit",
            fontWeight: "bold",
          }}
        >
          ❤️ {wishlist.length}
        </Link>

        <Link
          to="/cart"
          className="cart-btn"
        >
          🛒 {cartCount}
        </Link>
      </div>
    </nav>
  );
}
