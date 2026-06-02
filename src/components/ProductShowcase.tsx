import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Eye, Heart, ShoppingBag, TrendingUp } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "./Toast";
import { staggerContainer, staggerItem, sectionProps } from "../lib/animations";
import { products } from "../data/products";

type Props = {
  title: string;
  subtitle: string;
  filterFn?: (p: typeof products[0]) => boolean;
  limit?: number;
};

export default function ProductShowcase({ title, subtitle, filterFn, limit = 8 }: Props) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const items = products.filter(filterFn || (() => true)).slice(0, limit);

  const updateScrollState = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <motion.section className="section" style={{ padding: "clamp(48px, 8vw, 80px) 0" }} {...sectionProps} variants={staggerContainer}>
      <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
        <div>
          <p className="eyebrow" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <TrendingUp size={14} /> {title}
          </p>
          <h2 className="heading" style={{ fontSize: "clamp(1.8rem, 4vw, 3.2rem)" }}>{subtitle}</h2>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => scroll("left")}
            style={{
              width: 44, height: 44, borderRadius: "50%",
              border: "1px solid var(--line)", background: "var(--surface)",
              color: canScrollLeft ? "var(--text)" : "var(--muted)", cursor: canScrollLeft ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center", opacity: canScrollLeft ? 1 : 0.3,
            }}
          >
            <ChevronLeft size={20} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => scroll("right")}
            style={{
              width: 44, height: 44, borderRadius: "50%",
              border: "1px solid var(--line)", background: "var(--surface)",
              color: canScrollRight ? "var(--text)" : "var(--muted)", cursor: canScrollRight ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center", opacity: canScrollRight ? 1 : 0.3,
            }}
          >
            <ChevronRight size={20} />
          </motion.button>
        </div>
      </div>

      <motion.div
        ref={scrollRef}
        onScroll={updateScrollState}
        variants={staggerContainer}
        style={{
          display: "flex",
          gap: 20,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          paddingBottom: 8,
          scrollbarWidth: "none",
        }}
        className="no-scrollbar"
      >
        {items.map((product) => {
          const inWishlist = isInWishlist(product.id);
          return (
            <motion.div
              key={product.id}
              variants={staggerItem}
              style={{ minWidth: 280, maxWidth: 320, flex: 1, scrollSnapAlign: "start" }}
            >
              <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", border: "1px solid var(--line)", background: "#111" }}>
                <Link to={`/product/${product.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.5 }}
                    style={{ aspectRatio: "4/5", overflow: "hidden" }}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </motion.div>
                </Link>

                {/* Badges */}
                <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>
                  {product.isNew && (
                    <span className="badge" style={{ background: "rgba(212,175,55,0.9)", color: "#050505" }}>New</span>
                  )}
                  {product.isBestSeller && (
                    <span className="badge" style={{ background: "rgba(46,204,113,0.9)", color: "#050505" }}>Best Seller</span>
                  )}
                </div>

                {/* Hover actions */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  style={{
                    position: "absolute", bottom: 12, right: 12,
                    display: "flex", gap: 6, opacity: 0,
                    transition: "opacity 0.3s",
                  }}
                  className="product-hover-actions"
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.preventDefault();
                      if (inWishlist) { removeFromWishlist(product.id); showToast("Removed from wishlist"); }
                      else { addToWishlist(product); showToast("Added to wishlist"); }
                    }}
                    style={{
                      width: 40, height: 40, borderRadius: "50%",
                      border: "none", background: "rgba(5,5,5,0.8)",
                      color: inWishlist ? "#e74c3c" : "var(--text)",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <Heart size={16} fill={inWishlist ? "#e74c3c" : "none"} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart({ ...product, selectedSize: product.sizes[0], selectedColor: product.colors[0] });
                      showToast(`${product.name} added to bag`);
                    }}
                    style={{
                      width: 40, height: 40, borderRadius: "50%",
                      border: "none", background: "var(--gold)",
                      color: "#050505", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <ShoppingBag size={16} />
                  </motion.button>
                  <Link to={`/product/${product.id}`}>
                    <motion.button
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      style={{
                        width: 40, height: 40, borderRadius: "50%",
                        border: "none", background: "rgba(5,5,5,0.8)",
                        color: "var(--text)", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      <Eye size={16} />
                    </motion.button>
                  </Link>
                </motion.div>
              </div>

              <div style={{ padding: "14px 4px" }}>
                <p style={{ color: "var(--muted)", fontSize: ".72rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
                  {product.category}
                </p>
                <Link to={`/product/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <h3 style={{ fontWeight: 700, fontSize: ".95rem", marginBottom: 6, lineHeight: 1.4 }}>{product.name}</h3>
                </Link>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <strong style={{ fontSize: "1.05rem", color: "var(--gold)" }}>₹{product.price}</strong>
                  {product.originalPrice > product.price && (
                    <span style={{ color: "var(--muted)", fontSize: ".85rem", textDecoration: "line-through" }}>
                      ₹{product.originalPrice}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                  <span style={{ color: "var(--gold)", fontSize: ".78rem" }}>★</span>
                  <span style={{ color: "var(--muted)", fontSize: ".78rem" }}>{product.rating} ({product.reviews})</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="container" style={{ textAlign: "center", marginTop: 32 }}>
        <Link to="/category" className="ghost-button" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px" }}>
          View All <Eye size={14} />
        </Link>
      </div>
    </motion.section>
  );
}
