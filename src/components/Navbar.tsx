import { Link, useLocation } from "react-router-dom";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useCustomer } from "../context/CustomerContext";
import { useAuth } from "../context/AuthContext";
import BrandWordmark from "./BrandWordmark";
import {
  Search, ShoppingBag, Heart, User, Menu, X, LogOut,
  Package, MapPin, Home, Grid3X3, Store, Shield, Lock,
} from "lucide-react";

export default function Navbar() {
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { customer } = useCustomer();
  const { role, logout: authLogout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const pathKey = useMemo(() => location.pathname + location.search, [location.pathname, location.search]);

  const handleLogout = useCallback(() => {
    authLogout();
    setProfileOpen(false);
    setMobileOpen(false);
  }, [authLogout]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/category?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  }, [searchQuery]);

  const linkStyle = (path: string): React.CSSProperties => ({
    color: location.pathname === path ? "var(--gold)" : "var(--muted)",
    textDecoration: "none",
    fontSize: ".78rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    transition: "color var(--transition-fast)",
    display: "flex",
    alignItems: "center",
    gap: 6,
  });

  const navBtn: React.CSSProperties = {
    position: "relative",
    background: "none",
    border: "none",
    color: "var(--text)",
    cursor: "pointer",
    padding: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    transition: "background var(--transition-fast), color var(--transition-fast)",
  };

  const bottomNav: React.CSSProperties = {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9998,
    background: "rgba(5,5,5,0.95)",
    borderTop: "1px solid var(--line)",
    backdropFilter: "blur(20px)",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "6px 0",
    paddingBottom: "calc(6px + env(safe-area-inset-bottom))",
  };

  const bottomLink = (path: string, icon: React.ReactNode, label: string) => (
    <Link to={path} style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 2,
      textDecoration: "none",
      color: location.pathname === path ? "var(--gold)" : "var(--muted)",
      fontSize: ".6rem",
      fontWeight: 700,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      padding: "4px 12px",
      transition: "color var(--transition-fast)",
    }}>
      {icon}
      <span>{label}</span>
    </Link>
  );

  return (
    <div key={pathKey}>
      <nav style={{
        position: "sticky",
        top: 0,
        zIndex: 9997,
        background: "rgba(5,5,5,0.92)",
        borderBottom: "1px solid var(--line)",
        backdropFilter: "blur(24px)",
      }}>
        <div className="container" style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
          gap: 24,
        }}>
          {/* Mobile menu toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} style={{ ...navBtn, display: "none" }} className="mobile-menu-toggle" aria-label="Toggle menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <BrandWordmark size="nav" />
          </Link>

          {/* Desktop nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, flex: 1, justifyContent: "center" }} className="nav-links">
            <Link to="/" style={linkStyle("/")}>Home</Link>
            <Link to="/category" style={linkStyle("/category")}>Shop</Link>
            <Link to="/category?badge=new" style={linkStyle("/category?badge=new")}>New</Link>
            <Link to="/about" style={linkStyle("/about")}>About</Link>
            <Link to="/contact" style={linkStyle("/contact")}>Contact</Link>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {/* Search */}
            <button onClick={() => setSearchOpen(!searchOpen)} style={navBtn} aria-label="Search">
              <Search size={20} />
            </button>

            {/* Wishlist */}
            <Link to="/wishlist" style={{ ...navBtn, textDecoration: "none" }} aria-label="Wishlist">
              <Heart size={20} />
              {wishlistCount > 0 && <span className="nav-icon-badge">{wishlistCount}</span>}
            </Link>

            {/* Cart */}
            <Link to="/cart" style={{ ...navBtn, textDecoration: "none" }} aria-label="Cart">
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="nav-icon-badge">{cartCount}</span>}
            </Link>

            {/* Profile / Login */}
            {customer ? (
              <div style={{ position: "relative" }}>
                <button onClick={() => setProfileOpen(!profileOpen)} style={navBtn} aria-label="Profile">
                  <User size={20} />
                </button>
                {profileOpen && (
                  <>
                    <div onClick={() => setProfileOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 1 }} />
                    <div style={{
                      position: "absolute",
                      right: 0,
                      top: "100%",
                      marginTop: 8,
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--line)",
                      borderRadius: "var(--radius-lg)",
                      boxShadow: "var(--shadow-lg)",
                      minWidth: 200,
                      padding: 8,
                      zIndex: 2,
                    }}>
                      <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)", marginBottom: 4 }}>
                        <p style={{ fontWeight: 700, fontSize: ".9rem" }}>{customer.name}</p>
                        <p style={{ color: "var(--muted)", fontSize: ".78rem" }}>{customer.phone}</p>
                      </div>
                      <Link to="/profile" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", textDecoration: "none", color: "var(--text)", fontSize: ".85rem", borderRadius: 8, transition: "background var(--transition-fast)" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-strong)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <User size={16} /> Profile
                      </Link>
                      <Link to="/profile?tab=orders" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", textDecoration: "none", color: "var(--text)", fontSize: ".85rem", borderRadius: 8, transition: "background var(--transition-fast)" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-strong)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <Package size={16} /> Orders
                      </Link>
                      <Link to="/profile?tab=addresses" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", textDecoration: "none", color: "var(--text)", fontSize: ".85rem", borderRadius: 8, transition: "background var(--transition-fast)" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-strong)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <MapPin size={16} /> Addresses
                      </Link>
                      {role === "vendor" && (
                        <Link to="/vendor" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", textDecoration: "none", color: "var(--gold)", fontSize: ".85rem", borderRadius: 8, transition: "background var(--transition-fast)" }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-strong)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          <Store size={16} /> Vendor Dashboard
                        </Link>
                      )}
                      {role === "admin" && (
                        <Link to="/admin" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", textDecoration: "none", color: "var(--gold)", fontSize: ".85rem", borderRadius: 8, transition: "background var(--transition-fast)" }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-strong)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          <Shield size={16} /> Admin Panel
                        </Link>
                      )}
                      <Link to="/change-password" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", textDecoration: "none", color: "var(--text)", fontSize: ".85rem", borderRadius: 8, transition: "background var(--transition-fast)" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-strong)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <Lock size={16} /> Change Password
                      </Link>
                      <div style={{ borderTop: "1px solid var(--line)", marginTop: 4, paddingTop: 4 }}>
                        <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", width: "100%", border: "none", background: "transparent", color: "var(--error)", fontSize: ".85rem", cursor: "pointer", borderRadius: 8, transition: "background var(--transition-fast)" }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-strong)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          <LogOut size={16} /> Log out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login" style={{ ...navBtn, textDecoration: "none" }} aria-label="Login">
                <User size={20} />
              </Link>
            )}
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div style={{ borderTop: "1px solid var(--line)", padding: "12px 6%" }}>
            <form onSubmit={handleSearch} style={{ display: "flex", gap: 12 }}>
              <input
                ref={searchRef}
                type="search"
                placeholder="Search products, categories, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  padding: "14px 18px",
                  border: "1px solid var(--line)",
                  background: "var(--surface)",
                  color: "var(--text)",
                  fontSize: "1rem",
                  outline: "none",
                  borderRadius: "var(--radius)",
                }}
                aria-label="Search products"
              />
              <button type="submit" className="premium-button" style={{ minHeight: 48, padding: "0 24px" }}>
                <Search size={18} /> Search
              </button>
            </form>
          </div>
        )}
      </nav>

      {/* Mobile slide-out menu */}
      {mobileOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 9996,
          background: "rgba(0,0,0,0.6)",
        }} onClick={() => setMobileOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            width: "min(320px, 80vw)",
            background: "var(--bg-elevated)",
            borderRight: "1px solid var(--line)",
            padding: "24px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <BrandWordmark size="nav" />
              <button onClick={() => setMobileOpen(false)} style={{ ...navBtn }} aria-label="Close menu">
                <X size={22} />
              </button>
            </div>
            {[
              ["Home", "/", <Home size={18} key="h" />],
              ["Shop All", "/category", <Grid3X3 size={18} key="s" />],
              ["New Arrivals", "/category?badge=new", <Package size={18} key="n" />],
              ["Cart", "/cart", <ShoppingBag size={18} key="c" />],
              ["Wishlist", "/wishlist", <Heart size={18} key="w" />],
              ["About", "/about", <User size={18} key="a" />],
              ["Contact", "/contact", <MapPin size={18} key="co" />],
              ...(customer ? [["Profile", "/profile", <User size={18} key="p" />] as const] : [["Login", "/login", <User size={18} key="l" />] as const]),
              ...(role === "vendor" ? [["Vendor Dashboard", "/vendor", <Store size={18} key="vd" />] as const] : []),
              ...(role === "admin" ? [["Admin Panel", "/admin", <Shield size={18} key="ad" />] as const] : []),
            ].map(([label, path, icon]) => (
              <Link key={path as string} to={path as string} style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 16px",
                textDecoration: "none",
                color: location.pathname === path ? "var(--gold)" : "var(--text)",
                fontSize: ".9rem",
                fontWeight: 600,
                borderRadius: "var(--radius)",
                transition: "background var(--transition-fast)",
              }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-strong)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                {icon}
                {label as string}
              </Link>
            ))}
            {customer && (
              <button onClick={handleLogout} style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 16px",
                border: "none",
                background: "transparent",
                color: "var(--error)",
                fontSize: ".9rem",
                fontWeight: 600,
                cursor: "pointer",
                borderRadius: "var(--radius)",
                marginTop: "auto",
              }}>
                <LogOut size={18} /> Log out
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile bottom navigation */}
      <div style={bottomNav} className="mobile-bottom-nav">
        {bottomLink("/", <Home size={20} />, "Home")}
        {bottomLink("/category", <Grid3X3 size={20} />, "Shop")}
        {bottomLink("/cart", <><ShoppingBag size={20} />{cartCount > 0 && <span className="nav-icon-badge" style={{ top: -2, right: -8 }}>{cartCount}</span>}</>, "Cart")}
        {bottomLink("/wishlist", <><Heart size={20} />{wishlistCount > 0 && <span className="nav-icon-badge" style={{ top: -2, right: -8 }}>{wishlistCount}</span>}</>, "Wishlist")}
        {bottomLink(customer ? "/profile" : "/login", <User size={20} />, customer ? "Profile" : "Login")}
      </div>
    </div>
  );
}
