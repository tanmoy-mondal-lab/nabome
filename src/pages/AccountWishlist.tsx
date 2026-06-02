import { motion } from "framer-motion";
import { Heart, ShoppingBag, Trash2, Share2 } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../components/Toast";
import { Link } from "react-router-dom";

export default function AccountWishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const moveToCart = (product: (typeof wishlist)[0]) => {
    addToCart({ ...product, selectedSize: "", selectedColor: "" });
    removeFromWishlist(product.id);
    showToast("Moved to cart!");
  };

  const shareProduct = (name: string) => {
    navigator.clipboard?.writeText(`Check out ${name} on নবME!`);
    showToast("Link copied to clipboard!");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 400, display: "flex", alignItems: "center", gap: 10 }}>
          <Heart size={22} style={{ color: "var(--gold)" }} /> Wishlist ({wishlist.length})
        </h1>
      </div>

      {wishlist.length === 0 ? (
        <div className="glass" style={{ padding: 48, textAlign: "center", borderRadius: "var(--radius-xl)" }}>
          <Heart size={40} style={{ color: "var(--muted)", marginBottom: 12 }} />
          <p style={{ color: "var(--muted)", marginBottom: 16 }}>Your wishlist is empty.</p>
          <Link to="/category" className="premium-button" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, padding: "0 28px" }}>
            <ShoppingBag size={16} /> Explore Collection
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
          {wishlist.map((product, i) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="glass" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden" }}
            >
              <Link to={`/product/${product.id}`} style={{ textDecoration: "none", color: "var(--text)" }}>
                <div style={{ position: "relative", overflow: "hidden", aspectRatio: "3/4" }}>
                  <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                  {/* Discount badge */}
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span style={{ position: "absolute", top: 10, left: 10, background: "var(--gold)", color: "#050505", fontSize: ".7rem", fontWeight: 700, padding: "3px 8px", borderRadius: 4 }}>
                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </span>
                  )}
                </div>
              </Link>
              <div style={{ padding: 16 }}>
                <p style={{ color: "var(--muted)", fontSize: ".72rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>{product.category}</p>
                <Link to={`/product/${product.id}`} style={{ textDecoration: "none", color: "var(--text)" }}>
                  <p style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 6 }}>{product.name}</p>
                </Link>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span style={{ fontWeight: 700, color: "var(--gold)", fontSize: "1rem" }}>₹{product.price}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span style={{ color: "var(--muted)", fontSize: ".82rem", textDecoration: "line-through" }}>₹{product.originalPrice}</span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => moveToCart(product)}
                    className="premium-button" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: ".78rem", minHeight: 38, padding: "0 12px" }}>
                    <ShoppingBag size={14} /> Add to Cart
                  </button>
                  <button onClick={() => shareProduct(product.name)}
                    style={{ width: 38, height: 38, border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", display: "grid", placeItems: "center" }}
                    aria-label="Share product">
                    <Share2 size={14} />
                  </button>
                  <button onClick={() => { removeFromWishlist(product.id); showToast("Removed from wishlist"); }}
                    style={{ width: 38, height: 38, border: "1px solid var(--line)", background: "transparent", color: "var(--error)", cursor: "pointer", borderRadius: "var(--radius)", display: "grid", placeItems: "center" }}
                    aria-label="Remove from wishlist">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
