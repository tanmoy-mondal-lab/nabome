import { Link } from "react-router-dom";
import "./../styles/navbar.css";

export default function Navbar() {
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