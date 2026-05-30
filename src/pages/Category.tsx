import Navbar from "../components/Navbar";
import { products } from "../data/products";
import { useCart } from "../context/CartContext";
import "../styles/product.css";
import { Link } from "react-router-dom";

export default function Category() {
  const { addToCart } = useCart();

  return (
    <>
      <Navbar />

      <div className="products-grid">
        {products.map((product) => (
          <div
            key={product.id}
            className="product-card"
          >
            <Link
              to={`/product/${product.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
              />
              <div className="product-info">
                <h3>{product.name}</h3>
                <p>{product.category}</p>
                <p className="product-price">
                  ₹{product.price}
                </p>
              </div>
            </Link>
            <button
              className="add-btn"
              onClick={() => addToCart(product)}
            >
              Add To Cart
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
