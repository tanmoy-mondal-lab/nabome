import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import ProductReviews from "../components/ProductReviews";
import SEO from "../components/SEO";
import SizeGuideModal from "../components/SizeGuideModal";
import TrustBadges from "../components/TrustBadges";
import { useToast } from "../components/Toast";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { getBadges, products, type Product } from "../data/products";

export default function ProductDetail() {
  const { id } = useParams();
  const product = products.find((p) => p.id === Number(id));
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || "");
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || "");
  const [selectedImage, setSelectedImage] = useState(product?.image || "");
  const [pincode, setPincode] = useState("");
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  useEffect(() => {
    if (!product) return;
    const viewed = JSON.parse(localStorage.getItem("nabome-recently-viewed") || "[]") as number[];
    localStorage.setItem("nabome-recently-viewed", JSON.stringify([product.id, ...viewed.filter((item) => item !== product.id)].slice(0, 6)));
  }, [product]);

  const recentlyViewed = useMemo(() => {
    const viewed = JSON.parse(localStorage.getItem("nabome-recently-viewed") || "[]") as number[];
    return viewed.map((viewedId) => products.find((item) => item.id === viewedId)).filter((item): item is Product => Boolean(item)).filter((item) => item.id !== product?.id);
  }, [product?.id]);

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="page" style={{ display: "grid", minHeight: "70vh", placeItems: "center" }}>
          <div className="glass" style={{ padding: 38, textAlign: "center" }}>
            <h1>Product not found</h1>
            <Link className="premium-button" to="/category" style={{ display: "inline-flex", marginTop: 24, padding: "0 24px", alignItems: "center" }}>
              Shop Collection
            </Link>
          </div>
        </main>
      </>
    );
  }

  const relatedProducts = products.filter((p) => p.id !== product.id && (p.category === product.category || p.tags.some((tag) => product.tags.includes(tag)))).slice(0, 4);
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const addProduct = () => {
    addToCart({ ...product, selectedSize, selectedColor });
    showToast(`${product.name} added to bag`);
  };

  return (
    <>
      <SEO
        title={`${product.name} | NABOME`}
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
          brand: { "@type": "Brand", name: "NABOME" },
          offers: { "@type": "Offer", priceCurrency: "INR", price: product.price, availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
          aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviews },
        }}
      />
      <Navbar />
      <main className="page">
        <section className="container product-detail">
          <div className="gallery">
            <div className="gallery-main skeleton">
              <img src={selectedImage || product.image} alt={product.name} />
            </div>
            <div className="gallery-thumbs">
              {product.images.map((image) => (
                <button key={image} onClick={() => setSelectedImage(image)} aria-label="Change product image" className={(selectedImage || product.image) === image ? "active" : ""}>
                  <img src={image} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          </div>

          <aside className="product-buy glass">
            <p className="eyebrow">{product.category}</p>
            <h1 className="heading">{product.name}</h1>
            <div className="detail-badges">
              {getBadges(product).map((badge) => (
                <span className="badge" key={badge}>
                  {badge}
                </span>
              ))}
              <span className="badge">{discount}% Off</span>
            </div>
            <div className="product-price detail-price">
              <strong>₹{product.price}</strong>
              <span>₹{product.originalPrice}</span>
            </div>
            <p className="lede">{product.description}</p>

            <div className="selector-block">
              <div className="selector-head">
                <h3>Size</h3>
                <button className="text-button" onClick={() => setSizeGuideOpen(true)}>
                  Size Guide
                </button>
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

            <div className="sticky-actions">
              <button className="premium-button" onClick={addProduct}>
                Add To Bag
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
                ["Inventory", product.stock > 10 ? "In stock" : "Limited stock"],
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
