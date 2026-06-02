import { memo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Heart, Scale } from "lucide-react";
import { useToast } from "./Toast";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { getBadgesForAdvanced, addToCompare, getCompareList } from "../lib/mockProductData";
import ProductBadges from "./ProductBadges";
import type { AdvancedProduct } from "../types/product";

type Props = {
  product: AdvancedProduct;
  index?: number;
};

function AdvancedProductCard({ product, index = 0 }: Props) {
  const { showToast } = useToast();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [imgLoaded, setImgLoaded] = useState(false);

  const badges = getBadgesForAdvanced(product);
  const wished = isInWishlist(Number(product.id) || 0);
  const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
  const isOutOfStock = totalStock === 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) { showToast("Out of stock"); return; }
    const variant = product.variants.find((v) => v.stock > 0) || product.variants[0];
    addToCart({
      id: Number(product.id) || 0,
      name: product.name,
      price: variant?.price || product.defaultPrice,
      image: product.images[0]?.url || "",
      quantity: 1,
      selectedSize: variant?.size,
      selectedColor: variant?.color,
      variantId: variant?.id,
    });
    showToast("Added to bag");
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const pid = Number(product.id) || 0;
    if (wished) {
      removeFromWishlist(pid);
      showToast("Removed from wishlist");
    } else {
      addToWishlist({ id: pid, name: product.name, price: product.defaultPrice, image: product.images[0]?.url || "", category: product.category });
      showToast("Saved to wishlist");
    }
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const list = getCompareList();
    if (list.length >= 4) { showToast("Maximum 4 products to compare"); return; }
    if (list.some((p) => p.id === product.id)) { showToast("Already in compare"); return; }
    addToCompare(product);
    window.dispatchEvent(new Event("compare-updated"));
    showToast("Added to compare");
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.4 }}
      style={{ position: "relative" }}
    >
      <Link to={`/product/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
        <div style={{
          position: "relative", borderRadius: "var(--radius-lg)", overflow: "hidden",
          background: "var(--surface-strong)", aspectRatio: "3/4",
        }}>
          <img
            src={product.images[0]?.url || ""}
            alt={product.name}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              opacity: imgLoaded ? 1 : 0, transition: "opacity 0.3s",
            }}
          />

          <div style={{ position: "absolute", top: 8, left: 8, display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }}>
            <ProductBadges badges={badges} size="sm" />
          </div>

          <div style={{
            position: "absolute", right: 8, top: 8, display: "flex", flexDirection: "column", gap: 6,
            opacity: 0, transition: "opacity 0.2s",
          }} className="apc-hover-actions">
            <button onClick={handleWishlist}
              style={{ width: 36, height: 36, border: "1px solid var(--line)", background: "rgba(5,5,5,0.8)", color: wished ? "var(--gold)" : "var(--text)", borderRadius: "50%", cursor: "pointer", display: "grid", placeItems: "center", backdropFilter: "blur(8px)" }}>
              <Heart size={15} fill={wished ? "var(--gold)" : "none"} />
            </button>
            <button onClick={handleCompare}
              style={{ width: 36, height: 36, border: "1px solid var(--line)", background: "rgba(5,5,5,0.8)", color: "var(--text)", borderRadius: "50%", cursor: "pointer", display: "grid", placeItems: "center", backdropFilter: "blur(8px)" }}>
              <Scale size={15} />
            </button>
          </div>

          {isOutOfStock && (
            <div style={{
              position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)",
              display: "grid", placeItems: "center", backdropFilter: "blur(2px)",
            }}>
              <span style={{ color: "#fff", fontWeight: 600, fontSize: ".9rem", letterSpacing: "0.05em" }}>Out of Stock</span>
            </div>
          )}
        </div>

        <div style={{ padding: "12px 0" }}>
          <p style={{ color: "var(--muted)", fontSize: ".72rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{product.category}</p>
          <h3 style={{ fontSize: ".9rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.name}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
            <span style={{ color: "var(--gold)", fontSize: ".78rem" }}>★</span>
            <span style={{ fontSize: ".78rem", color: "var(--muted)" }}>{product.rating} ({product.reviewCount})</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--gold)" }}>₹{product.defaultPrice.toLocaleString("en-IN")}</span>
            {product.defaultOriginalPrice > product.defaultPrice && (
              <span style={{ color: "var(--muted)", fontSize: ".82rem", textDecoration: "line-through" }}>₹{product.defaultOriginalPrice.toLocaleString("en-IN")}</span>
            )}
          </div>
        </div>
      </Link>

      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={handleQuickAdd} disabled={isOutOfStock}
          className="premium-button"
          style={{ flex: 1, minHeight: 38, fontSize: ".77rem", gap: 6, opacity: isOutOfStock ? 0.5 : 1, cursor: isOutOfStock ? "not-allowed" : "pointer" }}>
          <ShoppingBag size={14} /> {isOutOfStock ? "Sold Out" : "Add"}
        </button>
      </div>

      <style>{`
        .apc-hover-actions { opacity: 0; }
        article:hover .apc-hover-actions { opacity: 1; }
        @media (hover: none) { .apc-hover-actions { opacity: 1; } }
      `}</style>
    </motion.article>
  );
}

export default memo(AdvancedProductCard);
