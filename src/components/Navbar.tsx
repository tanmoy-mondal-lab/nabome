import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import BrandWordmark from "./BrandWordmark";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { getUserRole } from "../lib/db";

const links = [
  { to: "/category", label: "Shop" },
  { to: "/category?badge=new", label: "New" },
  { to: "/about", label: "Story" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn] = useState(() => !!localStorage.getItem("nabome-user"));
  const navigate = useNavigate();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const [isAdmin, setIsAdmin] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    getUserRole().then((role) => setIsAdmin(role === "admin"));
  }, []);

  const submitSearch = () => {
    if (search.trim()) {
      navigate(`/category?search=${encodeURIComponent(search.trim())}`);
      setMenuOpen(false);
    }
  };

  return (
    <>
      <div className="top-bar">Free shipping above ₹999 · WhatsApp checkout · Made for Bengal</div>
      <header className="nav-shell">
        <nav className="container nav-inner" aria-label="Primary navigation">
          <div className="desktop-nav nav-links">
            {links.map((link) => (
              <NavLink className="nav-link" key={link.label} to={link.to}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <Link className="brand-lockup" to="/" aria-label="নবME home">
            <span className="brand-emblem" aria-hidden="true">ন</span>
            <BrandWordmark size="nav" />
          </Link>

          <div className="desktop-nav nav-actions">
            <input
              className="nav-search"
              type="search"
              placeholder="Search drops"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  submitSearch();
                }
              }}
            />
            {isAdmin && (
              <Link className="nav-link" to="/admin" style={{ color: "var(--gold)" }}>
                Admin
              </Link>
            )}
            <Link className="nav-link" to={isLoggedIn ? "/profile" : "/login"}>
              {isLoggedIn ? "Account" : "Login"}
            </Link>
            <Link className="nav-link" to="/wishlist" aria-label={`Wishlist with ${wishlist.length} products`}>
              Wish {wishlist.length}
            </Link>
            <Link className="nav-link" to="/cart" aria-label={`Cart with ${cartCount} items`}>
              Bag {cartCount}
            </Link>
          </div>

          <button className="menu-button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label="Toggle menu">
            {menuOpen ? "x" : "☰"}
          </button>

          {menuOpen && (
            <div className="mobile-menu" style={{ gridColumn: "1 / -1" }}>
              {links.map((link) => (
                <Link className="nav-link" key={link.label} to={link.to} onClick={() => setMenuOpen(false)}>
                  {link.label}
                </Link>
              ))}
              <Link className="nav-link" to={isLoggedIn ? "/profile" : "/login"} onClick={() => setMenuOpen(false)}>
                {isLoggedIn ? "Account" : "Login"}
              </Link>
              {!isLoggedIn && (
                <Link className="nav-link" to="/register" onClick={() => setMenuOpen(false)}>
                  Register
                </Link>
              )}
              {isAdmin && (
                <Link className="nav-link" to="/admin" onClick={() => setMenuOpen(false)} style={{ color: "var(--gold)" }}>
                  Admin
                </Link>
              )}
              <Link className="nav-link" to="/wishlist" onClick={() => setMenuOpen(false)}>
                Wishlist ({wishlist.length})
              </Link>
              <Link className="nav-link" to="/cart" onClick={() => setMenuOpen(false)}>
                Bag ({cartCount})
              </Link>
              <input
                className="field"
                type="search"
                placeholder="Search নবME"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    submitSearch();
                  }
                }}
              />
            </div>
          )}
        </nav>
      </header>
    </>
  );
}
