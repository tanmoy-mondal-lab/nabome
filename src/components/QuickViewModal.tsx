import { Link } from "react-router-dom";
import { type Product } from "../data/products";

type QuickViewModalProps = {
  product: Product | null;
  onClose: () => void;
  onAdd: (product: Product) => void;
};

export default function QuickViewModal({ product, onClose, onAdd }: QuickViewModalProps) {
  if (!product) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="quick-view glass" role="dialog" aria-modal="true" aria-label={product.name} onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close quick view">
          x
        </button>
        <div className="quick-view-media">
          <img src={product.image} alt={product.name} loading="lazy" />
        </div>
        <div className="quick-view-copy">
          <p className="eyebrow">{product.category}</p>
          <h2 className="heading">{product.name}</h2>
          <p className="lede">{product.description}</p>
          <div className="product-price" style={{ marginTop: 18 }}>
            <strong>₹{product.price}</strong>
            <span>₹{product.originalPrice}</span>
          </div>
          <div className="quick-swatches">
            {product.colors.map((color) => (
              <span key={color}>{color}</span>
            ))}
          </div>
          <div className="product-actions" style={{ marginTop: 24 }}>
            <button className="premium-button" onClick={() => onAdd(product)}>
              Add First Size
            </button>
            <Link className="ghost-button quick-link" to={`/product/${product.id}`}>
              Full Details
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
