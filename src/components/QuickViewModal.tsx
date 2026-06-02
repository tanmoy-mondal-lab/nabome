import { X, ShoppingBag, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { type Product } from "../data/products";

type QuickViewModalProps = {
  product: Product | null;
  onClose: () => void;
  onAdd: (product: Product) => void;
};

export default function QuickViewModal({ product, onClose, onAdd }: QuickViewModalProps) {
  if (!product) return null;

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="quick-view glass" role="dialog" aria-modal="true" aria-label={product.name}
        onClick={(event) => event.stopPropagation()}
        style={{ borderRadius: "var(--radius-lg)" }}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close quick view"
          style={{ borderRadius: "50%", width: 40, height: 40, display: "grid", placeItems: "center", border: "1px solid var(--line)", background: "rgba(5,5,5,0.7)", color: "var(--text)", cursor: "pointer", position: "absolute", top: 14, right: 14, zIndex: 1, backdropFilter: "blur(8px)" }}
        >
          <X size={18} />
        </button>
        <div className="quick-view-media" style={{ borderRadius: "var(--radius-lg) 0 0 var(--radius-lg)", overflow: "hidden" }}>
          <img src={product.image} alt={product.name} loading="lazy" />
        </div>
        <div className="quick-view-copy">
          <p className="eyebrow" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {product.category}
            {discount > 0 && <span style={{ color: "#e74c3c", fontWeight: 700, fontSize: ".72rem" }}>{discount}% OFF</span>}
          </p>
          <h2 className="heading" style={{ fontSize: "clamp(1.4rem,3vw,1.8rem)" }}>{product.name}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
            <span style={{ color: "var(--gold)", fontSize: ".9rem" }}>★</span>
            <span style={{ color: "var(--muted)", fontSize: ".85rem" }}>{product.rating} ({product.reviews} reviews)</span>
          </div>
          <p className="lede" style={{ marginTop: 16 }}>{product.description}</p>
          <div className="product-price" style={{ marginTop: 18 }}>
            <strong style={{ fontSize: "1.4rem" }}>₹{product.price}</strong>
            {product.originalPrice > product.price && <span style={{ fontSize: "1rem" }}>₹{product.originalPrice}</span>}
          </div>
          <div className="quick-swatches">
            {[product.material, product.fit].filter(Boolean).map((info) => (
              <span key={info} style={{ border: "1px solid var(--line)", padding: "6px 12px", borderRadius: "var(--radius)", color: "var(--muted)", fontSize: ".82rem" }}>{info}</span>
            ))}
          </div>
          <div className="product-actions" style={{ marginTop: 28 }}>
            <button className="premium-button" onClick={() => onAdd(product)} style={{ gap: 8 }}>
              <ShoppingBag size={16} /> Add to Bag
            </button>
            <Link className="ghost-button quick-link" to={`/product/${product.id}`} style={{ gap: 8 }}>
              <Eye size={16} /> Full Details
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
