import { useParams, Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag, Heart, Scale, Truck, ShieldCheck, RotateCcw,
  Clock, Star, Minus, Plus,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import ProductGallery from "../components/ProductGallery";
import ProductVariants from "../components/ProductVariants";
import ProductBadges from "../components/ProductBadges";
import ProductShare from "../components/ProductShare";
import ProductReviews from "../components/ProductReviews";
import AdvancedProductCard from "../components/AdvancedProductCard";
import RecentlyViewed from "../components/RecentlyViewed";
import TrustBadges from "../components/TrustBadges";
import SizeGuideModal from "../components/SizeGuideModal";
import { useToast } from "../components/Toast";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import {
  generateAdvancedProducts, getBadgesForAdvanced, addToRecentlyViewed,
  getCompareList, getRelatedProducts,
  getFrequentlyBoughtTogether, getTrendingProducts,
  generateMockReviews, addToCompare as addToCompareFn,
} from "../lib/mockProductData";
import type { ProductReview } from "../types/product";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  const [allProducts] = useState(() => generateAdvancedProducts(48));
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [activeInfoTab, setActiveInfoTab] = useState<"details" | "shipping" | "care">("details");

  const product = useMemo(() => allProducts.find((p) => p.id === id), [id, allProducts]);

  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product.id);
      setReviews(generateMockReviews(product.id));
      const defaultVar = product.variants.find((v) => v.stock > 0) || product.variants[0];
      if (defaultVar) {
        if (!selectedSize) setSelectedSize(defaultVar.size);
        if (!selectedColor) setSelectedColor(defaultVar.color);
      }
    }
  }, [product?.id]);

  const currentVariant = useMemo(
    () => product?.variants.find((v) => v.size === selectedSize && v.color === selectedColor) || null,
    [product, selectedSize, selectedColor]
  );

  const variantStock = currentVariant?.stock ?? 0;
  const totalStock = product?.variants.reduce((s, v) => s + v.stock, 0) ?? 0;
  const isOutOfStock = variantStock === 0;
  const wished = isInWishlist(Number(id) || 0);

  const badges = useMemo(() => product ? getBadgesForAdvanced(product) : [], [product]);
  const discount = useMemo(() => product ? Math.round(((product.defaultOriginalPrice - product.defaultPrice) / product.defaultOriginalPrice) * 100) : 0, [product]);

  const relatedProducts = useMemo(() => product ? getRelatedProducts(product, allProducts) : [], [product, allProducts]);
  const frequentlyBought = useMemo(() => product ? getFrequentlyBoughtTogether(product, allProducts) : [], [product, allProducts]);
  const trendingProducts = useMemo(() => getTrendingProducts(allProducts, 4).filter((p) => p.id !== id), [id, allProducts]);
  const hasFrequentlyBought = frequentlyBought.length > 0;
  const hasRelated = relatedProducts.length > 0;
  const hasTrending = trendingProducts.length > 0;

  const handleAddToCart = () => {
    if (isOutOfStock) { showToast("This variant is out of stock"); return; }
    addToCart({
      id: Number(id) || 0,
      name: product!.name,
      price: currentVariant?.price || product!.defaultPrice,
      image: product!.images[0]?.url || "",
      quantity,
      selectedSize,
      selectedColor,
      variantId: currentVariant?.id,
    });
    showToast(`${product!.name} added to bag`);
  };

  const handleWishlist = () => {
    const pid = Number(id) || 0;
    if (wished) {
      removeFromWishlist(pid);
      showToast("Removed from wishlist");
    } else {
      addToWishlist({ id: pid, name: product!.name, price: product!.defaultPrice, image: product!.images[0]?.url || "", category: product!.category });
      showToast("Saved to wishlist");
    }
  };

  const handleCompare = () => {
    if (!product) return;
    const list = getCompareList();
    if (list.length >= 4) { showToast("Maximum 4 products to compare"); return; }
    if (list.some((p) => p.id === product.id)) { showToast("Already in compare"); return; }
    addToCompareFn(product);
    window.dispatchEvent(new Event("compare-updated"));
    showToast("Added to compare");
  };

  const handleAddReview = (review: { rating: number; title: string; comment: string }) => {
    const newReview: ProductReview = {
      id: `rev_${Date.now()}`,
      productId: product!.id,
      customerId: user?.id || "guest",
      customerName: user?.name || "Customer",
      customerAvatar: "",
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      images: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "visible",
      reactions: { likes: 0, dislikes: 0, currentUserLiked: false, currentUserDisliked: false },
      vendorReply: null,
      vendorRepliedAt: null,
    };
    setReviews((prev) => [newReview, ...prev]);
  };

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="page" style={{ display: "grid", minHeight: "70vh", placeItems: "center" }}>
          <div className="glass" style={{ padding: 38, textAlign: "center" }}>
            <p>Product not found</p>
            <Link to="/category">
              <button style={{ padding: "12px 24px", border: "1px solid var(--gold)", background: "transparent", color: "var(--gold)", cursor: "pointer" }}>
                Browse Products
              </button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const tabBtnStyle = (tab: string): React.CSSProperties => ({
    padding: "12px 24px", border: "none", background: "none",
    color: activeInfoTab === tab ? "var(--gold)" : "var(--muted)",
    cursor: "pointer", fontWeight: activeInfoTab === tab ? 600 : 400,
    fontSize: ".9rem", borderBottom: activeInfoTab === tab ? "2px solid var(--gold)" : "2px solid transparent",
    transition: "all 0.2s",
  });

  const trustItems = [
    { icon: <Truck size={18} />, label: "Free shipping", sub: "On orders above ₹999" },
    { icon: <RotateCcw size={18} />, label: "7-day returns", sub: "Easy return policy" },
    { icon: <ShieldCheck size={18} />, label: "Secure checkout", sub: "256-bit SSL" },
    { icon: <Clock size={18} />, label: "Ships in 24hrs", sub: "Fast dispatch" },
  ];

  return (
    <>
      <SEO
        title={`${product.name} | নবME`}
        description={product.shortDescription}
        path={`/product/${product.id}`}
        image={product.images[0]?.url}
        type="product"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          image: product.images.map((img) => `https://www.nabome.online${img.url}`),
          description: product.shortDescription,
          brand: { "@type": "Brand", name: product.brand },
          offers: {
            "@type": "Offer", priceCurrency: "INR", price: product.defaultPrice,
            availability: totalStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          },
          aggregateRating: product.reviewCount > 0 ? {
            "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount,
          } : undefined,
        }}
      />
      <Navbar />
      <main className="page" key={product.id}>
        {/* Breadcrumb */}
        <div className="container" style={{ paddingTop: 20, paddingBottom: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".82rem", color: "var(--muted)", flexWrap: "wrap" }}>
            <Link to="/" style={{ color: "var(--muted)", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <Link to="/category" style={{ color: "var(--muted)", textDecoration: "none" }}>{product.category}</Link>
            <span>/</span>
            <Link to={`/category?subcategory=${product.subcategory}`} style={{ color: "var(--muted)", textDecoration: "none" }}>{product.subcategory}</Link>
            <span>/</span>
            <span style={{ color: "var(--text)" }}>{product.name}</span>
          </div>
        </div>

        {/* Product Section */}
        <section className="container" style={{ marginTop: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
            {/* Left: Gallery */}
            <div style={{ position: "sticky", top: 100 }}>
              <ProductGallery images={product.images} productName={product.name} />
            </div>

            {/* Right: Product Info */}
            <div>
              <p className="eyebrow" style={{ margin: 0 }}>{product.category} · {product.brand}</p>
              <h1 style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)", fontWeight: 600, marginTop: 8, lineHeight: 1.3 }}>
                {product.name}
              </h1>

              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
                <ProductBadges badges={badges} size="md" />
              </div>

              {/* Rating */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={16}
                      fill={star <= Math.floor(product.rating) ? "var(--gold)" : "var(--line)"}
                      color={star <= Math.floor(product.rating) ? "var(--gold)" : "var(--line)"}
                    />
                  ))}
                </div>
                <span style={{ fontWeight: 600, fontSize: ".9rem" }}>{product.rating}</span>
                <span style={{ color: "var(--muted)", fontSize: ".85rem" }}>
                  ({product.reviewCount} review{product.reviewCount !== 1 ? "s" : ""})
                </span>
                <span style={{ color: "var(--muted)", fontSize: ".82rem" }}>
                  · {product.soldCount} sold
                </span>
              </div>

              {/* Price */}
              <div style={{ marginTop: 20, padding: "16px 20px", borderRadius: "var(--radius)", background: "var(--gold-soft)", border: "1px solid rgba(212,175,55,0.2)" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                  <span style={{ fontSize: "2rem", fontWeight: 700, color: "var(--gold)" }}>
                    ₹{(currentVariant?.price || product.defaultPrice).toLocaleString("en-IN")}
                  </span>
                  {(currentVariant?.originalPrice || product.defaultOriginalPrice) > (currentVariant?.price || product.defaultPrice) && (
                    <>
                      <span style={{ fontSize: "1.1rem", color: "var(--muted)", textDecoration: "line-through" }}>
                        ₹{(currentVariant?.originalPrice || product.defaultOriginalPrice).toLocaleString("en-IN")}
                      </span>
                      <span style={{ fontSize: ".9rem", color: "#e74c3c", fontWeight: 600 }}>
                        {discount}% OFF
                      </span>
                    </>
                  )}
                </div>
                <p style={{ color: "var(--muted)", fontSize: ".82rem", marginTop: 4 }}>
                  Inclusive of all taxes · Free shipping above ₹999
                </p>
              </div>

              {/* Variants */}
              <div style={{ marginTop: 24 }}>
                <ProductVariants
                  variants={product.variants}
                  selectedSize={selectedSize}
                  selectedColor={selectedColor}
                  onSizeChange={setSelectedSize}
                  onColorChange={setSelectedColor}
                />
              </div>

              {/* Quantity */}
              <div style={{ marginTop: 20 }}>
                <span style={{ color: "var(--muted)", fontSize: ".82rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>
                  Quantity
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1px solid var(--line)", width: "fit-content", borderRadius: "var(--radius)", overflow: "hidden" }}>
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1}
                    style={{ padding: "14px 18px", border: "none", borderRight: "1px solid var(--line)", background: "transparent", color: quantity <= 1 ? "var(--muted)" : "var(--text)", cursor: quantity <= 1 ? "not-allowed" : "pointer", fontSize: "1rem" }}>
                    <Minus size={16} />
                  </button>
                  <span style={{ padding: "14px 28px", fontWeight: 600, minWidth: 48, textAlign: "center" }}>{quantity}</span>
                  <button onClick={() => setQuantity((q) => Math.min(variantStock || totalStock || 10, q + 1))} disabled={quantity >= (variantStock || totalStock || 10)}
                    style={{ padding: "14px 18px", border: "none", borderLeft: "1px solid var(--line)", background: "transparent", color: quantity >= (variantStock || totalStock || 10) ? "var(--muted)" : "var(--text)", cursor: quantity >= (variantStock || totalStock || 10) ? "not-allowed" : "pointer", fontSize: "1rem" }}>
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="premium-button"
                  style={{
                    flex: 1, minHeight: 52, fontSize: ".95rem", gap: 10,
                    opacity: isOutOfStock ? 0.5 : 1, cursor: isOutOfStock ? "not-allowed" : "pointer",
                  }}
                >
                  <ShoppingBag size={20} />
                  {isOutOfStock ? "Out of Stock" : "Add to Bag"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleWishlist}
                  style={{
                    width: 52, height: 52, border: `1px solid ${wished ? "var(--gold)" : "var(--line)"}`,
                    background: wished ? "var(--gold-soft)" : "transparent",
                    color: wished ? "var(--gold)" : "var(--muted)", borderRadius: "var(--radius)",
                    cursor: "pointer", display: "grid", placeItems: "center",
                  }}
                >
                  <Heart size={20} fill={wished ? "var(--gold)" : "none"} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleCompare}
                  style={{
                    width: 52, height: 52, border: "1px solid var(--line)",
                    background: "transparent", color: "var(--muted)", borderRadius: "var(--radius)",
                    cursor: "pointer", display: "grid", placeItems: "center",
                  }}
                >
                  <Scale size={20} />
                </motion.button>
                <ProductShare productName={product.name} productUrl={window.location.href} />
              </div>

              {/* Delivery Check */}
              <div style={{ marginTop: 20 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Enter pincode for delivery estimate"
                    style={{
                      flex: 1, padding: "12px 16px", border: "1px solid var(--line)",
                      background: "var(--surface)", color: "var(--text)", borderRadius: "var(--radius)",
                      fontSize: ".9rem", outline: "none",
                    }}
                  />
                  <button onClick={() => showToast(pincode ? "Delivery estimate: 3-5 business days" : "Enter a pincode")}
                    className="ghost-button" style={{ minHeight: 46, fontSize: ".85rem" }}>
                    Check
                  </button>
                </div>
              </div>

              {/* Trust Badges Row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 20, padding: "16px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
                {trustItems.map((item) => (
                  <div key={item.label} style={{ textAlign: "center" }}>
                    <div style={{ color: "var(--gold)", marginBottom: 6, display: "grid", placeItems: "center" }}>{item.icon}</div>
                    <p style={{ fontSize: ".72rem", fontWeight: 600 }}>{item.label}</p>
                    <p style={{ fontSize: ".65rem", color: "var(--muted)" }}>{item.sub}</p>
                  </div>
                ))}
              </div>

              {/* Short Description */}
              <p style={{ color: "var(--muted)", marginTop: 20, lineHeight: 1.7, fontSize: ".9rem" }}>
                {product.shortDescription}
              </p>

              {/* Vendor Info */}
              <div className="glass" style={{ marginTop: 20, padding: "12px 16px", borderRadius: "var(--radius)", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--gold-soft)", color: "var(--gold)", display: "grid", placeItems: "center", fontWeight: 700 }}>
                  {product.vendorShop.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: ".85rem" }}>Sold by {product.vendorShop}</p>
                  <p style={{ color: "var(--muted)", fontSize: ".78rem" }}>{product.vendorName} · {product.vendorId}</p>
                </div>
                <Link to={`/shop/${product.vendorId}`} style={{ color: "var(--gold)", fontSize: ".82rem", textDecoration: "none", fontWeight: 500 }}>
                  Visit Shop →
                </Link>
              </div>

              {/* Product Details Table */}
              <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  ["SKU", currentVariant?.sku || product.sku],
                  ["Brand", product.brand],
                  ["Category", product.category],
                  ["Subcategory", product.subcategory],
                  ["Material", product.material],
                  ["Weight", `${product.weight}g`],
                  ["Gender", product.gender],
                  ["Season", product.season],
                  ["Collection", product.collection],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--line)", fontSize: ".82rem" }}>
                    <span style={{ color: "var(--muted)" }}>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tabbed Info Section */}
        <section className="container" style={{ marginTop: 60 }}>
          <div style={{ display: "flex", borderBottom: "1px solid var(--line)", marginBottom: 32 }}>
            {(["details", "shipping", "care"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveInfoTab(tab)} style={tabBtnStyle(tab)}>
                {tab === "details" && "Product Details"}
                {tab === "shipping" && "Shipping & Returns"}
                {tab === "care" && "Care Instructions"}
              </button>
            ))}
          </div>

          <motion.div key={activeInfoTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
            style={{ color: "var(--muted)", fontSize: ".95rem", lineHeight: 1.8, maxWidth: 720 }}>
            {activeInfoTab === "details" && (
              <div style={{ whiteSpace: "pre-line" }}>{product.fullDescription}</div>
            )}
            {activeInfoTab === "shipping" && (
              <div>
                <p><strong>Delivery Timeline</strong> — {product.shippingInfo}</p>
                <p style={{ marginTop: 12 }}><strong>Returns & Exchanges</strong> — {product.returnPolicy}</p>
                <p style={{ marginTop: 12 }}><strong>Cancellation</strong> — Orders can be cancelled before dispatch. Once shipped, cancellation is not possible; you may initiate a return after delivery.</p>
              </div>
            )}
            {activeInfoTab === "care" && (
              <div>
                <p><strong>Care Instructions</strong></p>
                <div style={{ whiteSpace: "pre-line", marginTop: 8 }}>{product.careInstructions}</div>
              </div>
            )}
          </motion.div>
        </section>

        {/* Trust Badges */}
        <section className="container">
          <TrustBadges />
        </section>

        {/* Reviews */}
        <ProductReviews
          reviews={reviews}
          productId={product.id}
          rating={product.rating}
          reviewCount={product.reviewCount}
          ratingDistribution={product.ratingDistribution}
          onAddReview={handleAddReview}
        />

        {/* Frequently Bought Together */}
        {hasFrequentlyBought && (
          <section className="section">
            <div className="container split-intro">
              <div>
                <p className="eyebrow" style={{ margin: 0 }}>Complete the Look</p>
                <h2 className="heading" style={{ marginTop: 2 }}>Frequently Bought Together</h2>
              </div>
            </div>
            <div className="container">
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(frequentlyBought.length, 3)}, 1fr)`, gap: 20 }}>
                {frequentlyBought.map((item, i) => (
                  <AdvancedProductCard key={item.id} product={item} index={i} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Related Products */}
        {hasRelated && (
          <section className="section">
            <div className="container split-intro">
              <div>
                <p className="eyebrow" style={{ margin: 0 }}>You May Also Like</p>
                <h2 className="heading" style={{ marginTop: 2 }}>Related Products</h2>
              </div>
            </div>
            <div className="container">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
                {relatedProducts.map((item, i) => (
                  <AdvancedProductCard key={item.id} product={item} index={i} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Trending */}
        {hasTrending && (
          <section className="section">
            <div className="container split-intro">
              <div>
                <p className="eyebrow" style={{ margin: 0 }}>Trending Now</p>
                <h2 className="heading" style={{ marginTop: 2 }}>Most Popular This Week</h2>
              </div>
            </div>
            <div className="container">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
                {trendingProducts.map((item, i) => (
                  <AdvancedProductCard key={item.id} product={item} index={i} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Recently Viewed */}
        <RecentlyViewed />
      </main>
      <SizeGuideModal open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
      <Footer />
    </>
  );
}
