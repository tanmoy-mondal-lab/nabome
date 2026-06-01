import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import ProductReviews from "../components/ProductReviews";
import SEO from "../components/SEO";
import SizeGuideModal from "../components/SizeGuideModal";
import TrustBadges from "../components/TrustBadges";
import { useToast } from "../components/Toast";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { getBadges, products, type Product } from "../data/products";

function StarRating({ rating, size = ".85rem" }: { rating: number; size?: string }) {
  return (
    <span style={{ color: "var(--gold)", fontSize: size, letterSpacing: "0.1em" }}>
      {"★".repeat(Math.floor(rating))}{rating % 1 >= 0.5 ? "½" : ""}
    </span>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const product = products.find((p) => p.id === Number(id));
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || "");
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || "");
  const [selectedImage, setSelectedImage] = useState(product?.image || "");
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"details" | "shipping" | "care">("details");

  const currentVariant = useMemo(() => {
    if (!product?.variants) return null;
    return product.variants.find((v) => v.size === selectedSize && v.color === selectedColor) || null;
  }, [product, selectedSize, selectedColor]);

  const variantStock = currentVariant?.stock ?? product?.stock ?? 0;
  const isOutOfStock = variantStock === 0;

  useEffect(() => {
    if (!product) return;
    const viewed = JSON.parse(localStorage.getItem("nabome-recently-viewed") || "[]") as number[];
    localStorage.setItem("nabome-recently-viewed", JSON.stringify([product.id, ...viewed.filter((item) => item !== product.id)].slice(0, 6)));
  }, [product]);

  const recentlyViewed = useMemo(() => {
    const viewed = JSON.parse(localStorage.getItem("nabome-recently-viewed") || "[]") as number[];
    return viewed.map((viewedId) => products.find((item) => item.id === viewedId)).filter((item): item is Product => Boolean(item)).filter((item) => item.id !== product?.id);
  }, [product?.id]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const goNext = useCallback(() => {
    if (!product) return;
    setLightboxIndex((prev) => (prev + 1) % product.images.length);
  }, [product]);

  const goPrev = useCallback(() => {
    if (!product) return;
    setLightboxIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  }, [product]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxOpen, goNext, goPrev]);

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

  const relatedProducts = products.filter((p) => p.id !== product.id && (p.category === product.category || p.tags.some((tag) => product.tags.includes(tag)))).slice(0, 4);
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const addProduct = () => {
    const variantId = currentVariant?.id;
    addToCart({ ...product, selectedSize, selectedColor, variantId, quantity });
    showToast(`${product.name} added to bag`);
  };

  const tabStyle = (tab: string): React.CSSProperties => ({
    padding: "10px 24px",
    border: "none",
    background: activeTab === tab ? "var(--gold)" : "transparent",
    color: activeTab === tab ? "#050505" : "var(--muted)",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: ".9rem",
    letterSpacing: "0.03em",
    borderRadius: 0,
  });

  const lightboxOverlay: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 10000,
    background: "rgba(0,0,0,0.95)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const lightboxBtn: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(255,255,255,0.1)",
    border: "none",
    color: "#fff",
    fontSize: "2rem",
    padding: "16px 20px",
    cursor: "pointer",
    zIndex: 1,
  };

  return (
    <>
      <SEO
        title={`${product.name} | নবME`}
        description={product.description}
        path={`/product/${product.id}`}
        image={product.image}
        type="product"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          image: product.images.map((image) => `https://www.nabome.online${image}`),
          description: product.description,
          brand: { "@type": "Brand", name: "নবME" },
          offers: { "@type": "Offer", priceCurrency: "INR", price: product.price, availability: variantStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
          aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviews },
        }}
      />
      <Navbar />

      {/* ── LIGHTBOX ── */}
      {lightboxOpen && (
        <div style={lightboxOverlay} onClick={() => setLightboxOpen(false)} role="presentation">
          {product.images.length > 1 && (
            <>
              <button style={{ ...lightboxBtn, left: 16 }} onClick={(e) => { e.stopPropagation(); goPrev(); }} aria-label="Previous image">‹</button>
              <button style={{ ...lightboxBtn, right: 16 }} onClick={(e) => { e.stopPropagation(); goNext(); }} aria-label="Next image">›</button>
            </>
          )}
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: "90vw", maxHeight: "90vh", display: "grid", placeItems: "center" }}>
            <img
              src={product.images[lightboxIndex] || product.image}
              alt={`${product.name} — Image ${lightboxIndex + 1}`}
              style={{ maxWidth: "100%", maxHeight: "90vh", objectFit: "contain" }}
            />
          </div>
          <button
            onClick={() => setLightboxOpen(false)}
            style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", fontSize: "1.5rem", padding: "8px 16px", cursor: "pointer", zIndex: 1 }}
            aria-label="Close lightbox"
          >
            ✕
          </button>
          <p style={{ position: "absolute", bottom: 24, color: "rgba(255,255,255,0.5)", fontSize: ".85rem" }}>
            {lightboxIndex + 1} / {product.images.length}
          </p>
        </div>
      )}

      <main className="page" key={product.id}>
        <section className="container product-detail">
          <div className="gallery">
            <div
              className="gallery-main skeleton"
              onClick={() => {
                const idx = product.images.indexOf(selectedImage || product.image);
                openLightbox(idx >= 0 ? idx : 0);
              }}
              style={{ cursor: "zoom-in" }}
            >
              <img src={selectedImage || product.image} alt={product.name} />
            </div>
            {product.images.length > 1 && (
              <div className="gallery-thumbs">
                {product.images.map((image, i) => (
                  <button
                    key={image}
                    onClick={() => {
                      setSelectedImage(image);
                      openLightbox(i);
                    }}
                    aria-label={`View image ${i + 1}`}
                    className={(selectedImage || product.image) === image ? "active" : ""}
                  >
                    <img src={image} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <aside className="product-buy glass">
            <p className="eyebrow">{product.category}</p>
            <h1 className="heading">{product.name}</h1>
            <div className="detail-badges">
              {getBadges(product).map((badge) => (
                <span className="badge" key={badge}>{badge}</span>
              ))}
              {discount > 0 && <span className="badge">{discount}% Off</span>}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <StarRating rating={product.rating} size="1rem" />
              <span style={{ color: "var(--muted)", fontSize: ".85rem" }}>
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            <div className="product-price detail-price">
              <strong>₹{product.price}</strong>
              {product.originalPrice > product.price && <span>₹{product.originalPrice}</span>}
            </div>
            <p className="lede">{product.description}</p>

            <div className="selector-block">
              <div className="selector-head">
                <h3>Size</h3>
                <button className="text-button" onClick={() => setSizeGuideOpen(true)}>Size Guide</button>
              </div>
              <div className="option-grid">
                {product.sizes.map((size) => (
                  <button className={selectedSize === size ? "selected" : ""} key={size} onClick={() => setSelectedSize(size)}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="selector-block">
              <h3>Colour</h3>
              <div className="option-grid">
                {product.colors.map((color) => (
                  <button className={selectedColor === color ? "selected" : ""} key={color} onClick={() => setSelectedColor(color)}>
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {currentVariant && (
              <p style={{ color: "var(--muted)", fontSize: ".85rem", margin: "-8px 0 16px" }}>
                Stock: {currentVariant.stock} available
              </p>
            )}

            {/* Quantity selector */}
            <div className="selector-block">
              <h3>Quantity</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1px solid var(--line)", width: "fit-content" }}>
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  style={{ padding: "12px 18px", border: "none", borderRight: "1px solid var(--line)", background: "transparent", color: quantity <= 1 ? "var(--muted)" : "var(--text)", cursor: quantity <= 1 ? "not-allowed" : "pointer", fontSize: "1.1rem" }}
                >
                  −
                </button>
                <span style={{ padding: "12px 24px", fontWeight: 600, minWidth: 48, textAlign: "center" }}>{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(variantStock || product.stock || 10, q + 1))}
                  disabled={quantity >= (variantStock || product.stock || 10)}
                  style={{ padding: "12px 18px", border: "none", borderLeft: "1px solid var(--line)", background: "transparent", color: quantity >= (variantStock || product.stock || 10) ? "var(--muted)" : "var(--text)", cursor: quantity >= (variantStock || product.stock || 10) ? "not-allowed" : "pointer", fontSize: "1.1rem" }}
                >
                  +
                </button>
              </div>
            </div>

            <div className="sticky-actions">
              <button className="premium-button" onClick={addProduct} disabled={isOutOfStock} style={isOutOfStock ? { opacity: 0.5, cursor: "not-allowed" } : {}}>
                {isOutOfStock ? "Out of Stock" : "Add To Bag"}
              </button>
              <button
                className="ghost-button"
                onClick={() => {
                  if (isInWishlist(product.id)) {
                    removeFromWishlist(product.id);
                    showToast("Removed from wishlist");
                  } else {
                    addToWishlist(product);
                    showToast("Saved to wishlist");
                  }
                }}
              >
                {isInWishlist(product.id) ? "Saved" : "Wishlist"}
              </button>
            </div>

            <div className="delivery-check">
              <input className="field" placeholder="Enter pincode" value={pincode} onChange={(event) => setPincode(event.target.value)} />
              <button className="ghost-button" onClick={() => showToast(pincode ? "Delivery estimate: 3-5 business days" : "Enter a pincode first")}>
                Check
              </button>
            </div>

            <div className="detail-table">
              {[
                ["Material", product.material],
                ["Fit", product.fit],
                ["Inventory", variantStock > 10 ? "In stock" : variantStock > 0 ? "Limited stock" : "Out of stock"],
                ["Wash Care", "Cold wash, dry inside out"],
                ["Origin", "Designed in Bengal"],
              ].map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </aside>
        </section>

        {/* ── TABBED INFO SECTION ── */}
        <section className="container" style={{ marginTop: 60 }}>
          <div style={{ display: "flex", borderBottom: "1px solid var(--line)", marginBottom: 32 }}>
            {(["details", "shipping", "care"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={tabStyle(tab)}>
                {tab === "details" && "Product Details"}
                {tab === "shipping" && "Shipping & Returns"}
                {tab === "care" && "Care Instructions"}
              </button>
            ))}
          </div>

          <div style={{ color: "var(--muted)", fontSize: ".95rem", lineHeight: 1.8, maxWidth: 720 }}>
            {activeTab === "details" && (
              <div>
                <p>{product.description}</p>
                <ul style={{ marginTop: 16, paddingLeft: 20, listStyle: "disc" }}>
                  <li>{product.material}</li>
                  <li>{product.fit}</li>
                  <li>Premium garment construction</li>
                  <li>Designed and crafted in Bengal</li>
                </ul>
              </div>
            )}
            {activeTab === "shipping" && (
              <div>
                <p><strong>Delivery Timeline</strong> — Orders are dispatched within 1-3 business days. Standard delivery takes 3-5 business days across India.</p>
                <p style={{ marginTop: 12 }}><strong>Shipping Charges</strong> — Free shipping on orders above ₹999. A flat ₹99 applies below that.</p>
                <p style={{ marginTop: 12 }}><strong>Returns & Exchanges</strong> — We accept returns and exchanges within 7 days of delivery. Items must be unworn, unwashed, with tags intact. Initiate a return by contacting our support team.</p>
                <p style={{ marginTop: 12 }}><strong>Cancellation</strong> — Orders can be cancelled before dispatch. Once shipped, cancellation is not possible; you may initiate a return after delivery.</p>
              </div>
            )}
            {activeTab === "care" && (
              <div>
                <p><strong>Wash Care Instructions</strong></p>
                <ul style={{ marginTop: 12, paddingLeft: 20, listStyle: "disc" }}>
                  <li>Cold wash inside out with similar colours</li>
                  <li>Do not bleach or use harsh detergents</li>
                  <li>Tumble dry on low or hang dry in shade</li>
                  <li>Iron on medium temperature, avoid printing area</li>
                  <li>Do not dry clean</li>
                </ul>
              </div>
            )}
          </div>
        </section>

        <section className="container">
          <TrustBadges />
          <ProductReviews />
        </section>

        <section className="section">
          <div className="container split-intro">
            <div>
              <p className="eyebrow">Recommended</p>
              <h2 className="heading">Complete the look</h2>
            </div>
          </div>
          <div className="container product-grid">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} onQuickAdd={(nextProduct) => addToCart({ ...nextProduct, selectedSize: nextProduct.sizes[0], selectedColor: nextProduct.colors[0] })} />
            ))}
          </div>
        </section>

        {recentlyViewed.length > 0 && (
          <section className="section">
            <div className="container split-intro">
              <div>
                <p className="eyebrow">Recently Viewed</p>
                <h2 className="heading">Your last looks</h2>
              </div>
            </div>
            <div className="container product-grid">
              {recentlyViewed.slice(0, 4).map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </main>
      <SizeGuideModal open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </>
  );
}
