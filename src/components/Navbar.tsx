import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./../styles/navbar.css";

export default function Navbar() {
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="logo">
        <img
          src="/images/logo/logo.png"
          alt="Nabome"
        />
      </div>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/men">Men</Link>
        <Link to="/women">Women</Link>
        <Link to="/unisex">Unisex</Link>
        <Link to="/accessories">Accessories</Link>
      </div>

      <div className="nav-right">
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
            marginRight: "15px",
          }}
        />

        <Link
          to="/cart"
          className="cart-btn"
        >
          Cart
        </Link>
      </div>
    </nav>
  );
}
