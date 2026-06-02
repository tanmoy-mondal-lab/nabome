import { memo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, ShoppingBag, Heart } from "lucide-react";
import { getBadges, type Product } from "../data/products";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "./Toast";

type ProductCardProps = {
  product: Product;
  onQuickView?: (product: Product) => void;
  onQuickAdd?: (product: Product) => void;
};

function ProductCard({ product, onQuickView, onQuickAdd }: ProductCardProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const [imgLoaded, setImgLoaded] = useState(false);
  const wished = isInWishlist(product.id);

  const toggleWish = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (wished) {
      removeFromWishlist(product.id);
      showToast("Removed from wishlist");
    } else {
      addToWishlist(product);
      showToast("Saved to wishlist");
    }
  };

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <article className="product-card" style={{ position: "relative" }}>
      <Link to={`/product/${product.id}`} aria-label={`View ${product.name}`}>
        <div className="product-media skeleton" style={{ position: "relative", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            style={{ opacity: imgLoaded ? 1 : 0, transition: "opacity 0.3s" }}
          />
          <div className="product-badges">
            {getBadges(product).map((badge) => (
              <span className="badge" key={badge}>{badge}</span>
            ))}
            {discount > 0 && <span className="badge" style={{ borderColor: "rgba(231,76,60,0.4)", color: "#e74c3c" }}>-{discount}%</span>}
          </div>

          {/* Hover overlay actions */}
          <div style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            opacity: 0,
            transition: "opacity var(--transition)",
          }} className="product-hover-actions">
            <button onClick={(e) => { e.preventDefault(); onQuickView?.(product); }}
              style={{ width: 40, height: 40, border: "1px solid var(--line)", background: "rgba(5,5,5,0.8)", color: "var(--text)", borderRadius: "50%", cursor: "pointer", display: "grid", placeItems: "center", backdropFilter: "blur(8px)" }}
              aria-label="Quick view">
              <Eye size={16} />
            </button>
            <button onClick={(e) => { e.preventDefault(); onQuickAdd?.(product); }}
              style={{ width: 40, height: 40, border: "none", background: "var(--gold)", color: "#050505", borderRadius: "50%", cursor: "pointer", display: "grid", placeItems: "center" }}
              aria-label="Add to cart">
              <ShoppingBag size={16} />
            </button>
          </div>
        </div>
      </Link>

      <div className="product-info">
        <div>
          <p className="product-category">{product.category}</p>
          <h3>
            <Link to={`/product/${product.id}`} style={{ textDecoration: "none", color: "var(--text)" }}>{product.name}</Link>
          </h3>
          <p className="product-rating" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ color: "var(--gold)" }}>★</span> {product.rating} ({product.reviews})
          </p>
        </div>
        <div className="product-price">
          <strong>₹{product.price}</strong>
          {product.originalPrice > product.price && <span>₹{product.originalPrice}</span>}
        </div>
      </div>

      <div className="product-actions" style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button className="ghost-button" onClick={() => onQuickView?.(product)} style={{ flex: 1, minHeight: 40, fontSize: ".72rem", gap: 6 }}>
          <Eye size={14} /> Quick View
        </button>
        <button className="premium-button" onClick={() => onQuickAdd?.(product)} style={{ flex: 1, minHeight: 40, fontSize: ".72rem", gap: 6 }}>
          <ShoppingBag size={14} /> Add
        </button>
        <button onClick={toggleWish}
          style={{ width: 40, minHeight: 40, border: `1px solid ${wished ? "var(--gold)" : "var(--line)"}`, background: wished ? "var(--gold-soft)" : "transparent", color: wished ? "var(--gold)" : "var(--muted)", borderRadius: "var(--radius)", cursor: "pointer", display: "grid", placeItems: "center", transition: "all var(--transition-fast)" }}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={16} fill={wished ? "var(--gold)" : "none"} />
        </button>
      </div>

      <style>{`
        .product-card:hover .product-hover-actions { opacity: 1; }
        @media (hover: none) {
          .product-hover-actions { opacity: 1; }
        }
      `}</style>
    </article>
  );
}

export default memo(ProductCard);
