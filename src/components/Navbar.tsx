import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import BrandWordmark from "./BrandWordmark";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useCustomer } from "../context/CustomerContext";
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
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { customer, logout } = useCustomer();

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

  const userMenuItems = customer
    ? [
        { to: "/profile", label: "Profile" },
        { to: "/profile?tab=orders", label: "Orders" },
        { to: "/profile?tab=addresses", label: "Addresses" },
      ]
    : [];

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
            {customer && (
              <NavLink className="nav-link" to="/profile">
                Profile
              </NavLink>
            )}
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
                if (event.key === "Enter") submitSearch();
              }}
            />
            {isAdmin && (
              <Link className="nav-link" to="/admin" style={{ color: "var(--gold)" }}>
                Admin
              </Link>
            )}
            {customer ? (
              <div className="nav-user-menu" style={{ position: "relative", display: "inline-block" }}>
                <Link
                  className="nav-icon-link"
                  to="/profile"
                  aria-label="My account"
                  title={customer.name}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </Link>
              </div>
            ) : (
              <Link className="nav-link" to="/login" style={{ fontWeight: 600 }}>
                Login
              </Link>
            )}
            <Link
              className="nav-icon-link"
              to="/wishlist"
              aria-label={`Wishlist with ${wishlist.length} products`}
              title={`Wishlist (${wishlist.length})`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {wishlist.length > 0 && <span className="nav-icon-badge">{wishlist.length}</span>}
            </Link>
            <Link
              className="nav-icon-link"
              to="/cart"
              aria-label={`Cart with ${cartCount} items`}
              title={`Bag (${cartCount})`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && <span className="nav-icon-badge">{cartCount}</span>}
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
              {customer && userMenuItems.map((item) => (
                <Link key={item.label} className="nav-link" to={item.to} onClick={() => setMenuOpen(false)}>
                  {item.label}
                </Link>
              ))}
              {customer ? (
                <button onClick={() => { logout(); setMenuOpen(false); navigate("/"); }}
                  style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", fontSize: "1rem", color: "var(--muted)", padding: "12px 0", width: "100%" }}>
                  Logout
                </button>
              ) : (
                <Link className="nav-link" to="/login" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Login
                </Link>
              )}
              {!customer && (
                <Link className="nav-link" to="/register" onClick={() => setMenuOpen(false)}>
                  Register
                </Link>
              )}
              {isAdmin && (
                <Link className="nav-link" to="/admin" onClick={() => setMenuOpen(false)} style={{ color: "var(--gold)" }}>
                  Admin
                </Link>
              )}
              <Link className="nav-link" to="/wishlist" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                Wishlist {wishlist.length > 0 ? `(${wishlist.length})` : ""}
              </Link>
              <Link className="nav-link" to="/cart" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                Bag {cartCount > 0 ? `(${cartCount})` : ""}
              </Link>
              <input
                className="field"
                type="search"
                placeholder="Search নবME"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") submitSearch();
                }}
              />
            </div>
          )}
        </nav>
      </header>
    </>
  );
}
