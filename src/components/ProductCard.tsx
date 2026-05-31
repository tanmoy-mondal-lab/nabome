import { Link } from "react-router-dom";
import { getBadges, type Product } from "../data/products";

type ProductCardProps = {
  product: Product;
  onQuickView?: (product: Product) => void;
  onQuickAdd?: (product: Product) => void;
};

export default function ProductCard({ product, onQuickView, onQuickAdd }: ProductCardProps) {
  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} aria-label={`View ${product.name}`}>
        <div className="product-media skeleton">
          <img src={product.image} alt={product.name} loading="lazy" />
          <div className="product-badges">
            {getBadges(product).map((badge) => (
              <span className="badge" key={badge}>
                {badge}
              </span>
            ))}
          </div>
        </div>
      </Link>

      <div className="product-info">
        <div>
          <p className="product-category">{product.category}</p>
          <h3>
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </h3>
          <p className="product-rating">★ {product.rating} ({product.reviews})</p>
        </div>
        <div className="product-price">
          <strong>₹{product.price}</strong>
          <span>₹{product.originalPrice}</span>
        </div>
      </div>

      <div className="product-actions">
        <button className="ghost-button" onClick={() => onQuickView?.(product)}>
          Quick View
        </button>
        <button className="premium-button" onClick={() => onQuickAdd?.(product)}>
          Quick Add
        </button>
      </div>
    </article>
  );
}
