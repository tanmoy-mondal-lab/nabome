import { useState } from "react";
import { motion } from "framer-motion";
import { Save, ArrowLeft, X, AlertCircle, Loader2, Upload } from "lucide-react";
import { useToast } from "../../components/Toast";
import { generateMockProducts } from "../../lib/mockVendorData";
import type { VendorProduct, VendorTab } from "../../types/vendor";

type Props = {
  productId: string | null;
  vendorId: string;
  onBack: () => void;
  onSave: (product: VendorProduct) => void;
  onTab?: (tab: VendorTab) => void;
};

const categories = [
  "Men's Fashion", "Women's Fashion", "Kids Fashion", "Footwear",
  "Accessories", "Jewelry", "Ethnic Wear", "Western Wear",
  "Sportswear", "Winter Wear", "Other",
];

const subcategories: Record<string, string[]> = {
  "Men's Fashion": ["T-Shirts", "Shirts", "Hoodies", "Jackets", "Pants", "Jeans", "Blazers", "Suits", "Shorts", "Ethnic"],
  "Women's Fashion": ["Dresses", "Tops", "Kurtis", "Jeans", "Shrugs", "Skirts", "Trousers", "Co-ords"],
  "Kids Fashion": ["T-Shirts", "Shorts", "Dresses", "Rompers", "Jeans", "Shirts", "Ethnic", "Winter"],
  Footwear: ["Sports Shoes", "Casual Shoes", "Formal Shoes", "Sandals", "Slippers", "Boots", "Traditional"],
  Accessories: ["Caps", "Belts", "Watches", "Sunglasses", "Wallets", "Bags", "Scarves", "Socks"],
  Jewelry: ["Necklaces", "Earrings", "Bracelets", "Rings", "Anklets", "Chains", "Pendants"],
  "Ethnic Wear": ["Sarees", "Kurtis", "Lehengas", "Sherwanis", "Dhotis", "Salwar Suits", "Kurta Pajama"],
  "Western Wear": ["Dresses", "Tops", "Jeans", "Skirts", "Trousers", "Blazers", "Jumpsuits"],
  Sportswear: ["Active Tees", "Track Pants", "Shorts", "Sports Shoes", "Tracksuits", "Hoodies"],
  "Winter Wear": ["Jackets", "Sweaters", "Hoodies", "Beanies", "Gloves", "Scarves", "Puffer Jackets"],
  Other: ["Other"],
};

const genders = ["Male", "Female", "Unisex"];
const sizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const allColors = ["Black", "White", "Charcoal", "Olive", "Navy", "Red", "Blue", "Green", "Yellow", "Pink", "Purple", "Brown", "Grey", "Maroon", "Gold", "Silver"];

export default function VendorProductForm({ productId, vendorId, onBack, onSave }: Props) {
  const { showToast } = useToast();
  const isEditing = !!productId;

  const existingProducts = generateMockProducts(vendorId);
  const existing = productId ? existingProducts.find((p) => p.id === productId) : null;

  const [form, setForm] = useState({
    name: existing?.name || "",
    shortDescription: existing?.shortDescription || "",
    fullDescription: existing?.fullDescription || "",
    category: existing?.category || "Men's Fashion",
    subcategory: existing?.subcategory || "",
    brand: existing?.brand || "নবME Originals",
    price: existing?.price || 0,
    discountPrice: existing?.discountPrice || 0,
    stockQuantity: existing?.stockQuantity || 0,
    sku: existing?.sku || "",
    tags: existing?.tags?.join(", ") || "",
    gender: existing?.gender || "Unisex",
    material: existing?.material || "Cotton",
  });

  const [selectedSizes, setSelectedSizes] = useState<string[]>(existing?.sizes || ["M", "L", "XL"]);
  const [selectedColors, setSelectedColors] = useState<string[]>(existing?.colors || ["Black", "White"]);
  const [images, setImages] = useState<string[]>(existing?.images || []);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImages((prev) => [...prev, ev.target?.result as string]);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (idx: number) => {
    const next = images.filter((_, i) => i !== idx);
    setImages(next);
    if (mainImageIndex >= next.length && next.length > 0) setMainImageIndex(0);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Product name is required."); return; }
    if (!form.price || form.price <= 0) { setError("Price must be greater than 0."); return; }
    if (images.length === 0) { setError("At least one product image is required."); return; }

    setSaving(true);
    setError("");

    const product: VendorProduct = {
      id: productId || `vp_new_${Date.now()}`,
      vendorId,
      name: form.name.trim(),
      shortDescription: form.shortDescription.trim(),
      fullDescription: form.fullDescription.trim(),
      category: form.category,
      subcategory: form.subcategory,
      brand: form.brand,
      price: Number(form.price),
      discountPrice: Number(form.discountPrice) || 0,
      stockQuantity: Number(form.stockQuantity),
      sku: form.sku || `NB-${String(Date.now()).slice(-4)}`,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      gender: form.gender,
      material: form.material,
      sizes: selectedSizes,
      colors: selectedColors,
      images,
      mainImage: images[mainImageIndex] || images[0] || "",
      status: existing?.status === "rejected" ? "draft" : (existing?.status || "draft"),
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // TODO: persist to DB
    await new Promise((r) => setTimeout(r, 800));
    onSave(product);
    showToast(isEditing ? "Product updated!" : "Product created as draft!");
    onBack();
    setSaving(false);
  };

  const fieldS: React.CSSProperties = {
    width: "100%", padding: "14px 16px", border: "1px solid var(--line)",
    background: "var(--surface)", color: "var(--text)", fontSize: ".9rem",
    outline: "none", borderRadius: "var(--radius)", transition: "border-color var(--transition-fast)",
  };

  const toggleItem = (arr: string[], item: string, set: (v: string[]) => void) => {
    set(arr.includes(item) ? arr.filter((s) => s !== item) : [...arr, item]);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ width: 36, height: 36, border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", display: "grid", placeItems: "center" }}>
            <ArrowLeft size={16} />
          </button>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 400 }}>
            {isEditing ? "Edit Product" : "Add Product"}
          </h1>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
        {/* Left: Images */}
        <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-xl)" }}>
          <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 16 }}>Product Images</h3>
          {/* Main image */}
          <div style={{ aspectRatio: "4/3", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "var(--surface-strong)", marginBottom: 12, position: "relative" }}>
            {images.length > 0 ? (
              <img src={images[mainImageIndex]} alt="Main" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "var(--muted)", fontSize: ".85rem" }}>
                No images uploaded
              </div>
            )}
          </div>
          {/* Thumbnails */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {images.map((img, idx) => (
              <div key={idx} style={{ position: "relative", width: 64, height: 64, borderRadius: "var(--radius)", overflow: "hidden", cursor: "pointer", border: mainImageIndex === idx ? "2px solid var(--gold)" : "2px solid transparent" }}
                onClick={() => setMainImageIndex(idx)}
              >
                <img src={img} alt={`Image ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                  style={{ position: "absolute", top: 2, right: 2, width: 20, height: 20, border: "none", background: "rgba(0,0,0,0.6)", color: "#fff", cursor: "pointer", borderRadius: "50%", display: "grid", placeItems: "center", fontSize: 10 }}>
                  <X size={10} />
                </button>
              </div>
            ))}
            <label htmlFor="product-image-upload" style={{ width: 64, height: 64, border: "1px dashed var(--line)", borderRadius: "var(--radius)", display: "grid", placeItems: "center", cursor: "pointer", color: "var(--muted)" }}>
              <Upload size={18} />
            </label>
            <input id="product-image-upload" type="file" accept="image/*" onChange={addImage} style={{ display: "none" }} />
          </div>
          <p style={{ color: "var(--muted)", fontSize: ".78rem" }}>Upload up to 5 images. Click a thumbnail to set as main image. Future: Cloudinary integration.</p>
        </div>

        {/* Right: Fields */}
        <div className="glass" style={{ padding: 24, borderRadius: "var(--radius-xl)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Product Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={fieldS} placeholder="e.g. Premium Cotton T-Shirt" />
            </div>
            <div>
              <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Short Description</label>
              <textarea rows={2} value={form.shortDescription} onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))} style={{ ...fieldS, resize: "vertical" }} placeholder="Brief product description" />
            </div>
            <div>
              <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Full Description</label>
              <textarea rows={4} value={form.fullDescription} onChange={(e) => setForm((f) => ({ ...f, fullDescription: e.target.value }))} style={{ ...fieldS, resize: "vertical" }} placeholder="Detailed product description" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Category *</label>
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value, subcategory: "" }))} style={fieldS}>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Subcategory</label>
                <select value={form.subcategory} onChange={(e) => setForm((f) => ({ ...f, subcategory: e.target.value }))} style={fieldS}>
                  <option value="">Select subcategory</option>
                  {(subcategories[form.category] || []).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Brand</label>
                <input type="text" value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} style={fieldS} />
              </div>
              <div>
                <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>SKU</label>
                <input type="text" value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} style={fieldS} placeholder="Auto-generated if empty" />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Price (₹) *</label>
                <input type="number" min={0} value={form.price || ""} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} style={fieldS} />
              </div>
              <div>
                <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Discount Price</label>
                <input type="number" min={0} value={form.discountPrice || ""} onChange={(e) => setForm((f) => ({ ...f, discountPrice: Number(e.target.value) }))} style={fieldS} />
              </div>
              <div>
                <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Stock Quantity *</label>
                <input type="number" min={0} value={form.stockQuantity || ""} onChange={(e) => setForm((f) => ({ ...f, stockQuantity: Number(e.target.value) }))} style={fieldS} />
              </div>
            </div>
            <div>
              <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Tags (comma separated)</label>
              <input type="text" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} style={fieldS} placeholder="premium, cotton, casual" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Gender</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {genders.map((g) => (
                    <button key={g} type="button" onClick={() => setForm((f) => ({ ...f, gender: g }))}
                      style={{ flex: 1, padding: "10px", border: `1px solid ${form.gender === g ? "var(--gold)" : "var(--line)"}`, background: form.gender === g ? "var(--gold-soft)" : "transparent", color: form.gender === g ? "var(--gold)" : "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", fontWeight: form.gender === g ? 600 : 400, fontSize: ".82rem" }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Material</label>
                <input type="text" value={form.material} onChange={(e) => setForm((f) => ({ ...f, material: e.target.value }))} style={fieldS} />
              </div>
            </div>
            {/* Sizes */}
            <div>
              <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Sizes</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {sizes.map((s) => (
                  <button key={s} type="button" onClick={() => toggleItem(selectedSizes, s, setSelectedSizes)}
                    style={{ width: 40, height: 40, border: `1px solid ${selectedSizes.includes(s) ? "var(--gold)" : "var(--line)"}`, background: selectedSizes.includes(s) ? "var(--gold-soft)" : "transparent", color: selectedSizes.includes(s) ? "var(--gold)" : "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", fontWeight: selectedSizes.includes(s) ? 700 : 400, fontSize: ".82rem" }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {/* Colors */}
            <div>
              <label style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: 6, display: "block" }}>Colors</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {allColors.map((c) => (
                  <button key={c} type="button" onClick={() => toggleItem(selectedColors, c, setSelectedColors)}
                    style={{ padding: "6px 14px", border: `1px solid ${selectedColors.includes(c) ? "var(--gold)" : "var(--line)"}`, background: selectedColors.includes(c) ? "var(--gold-soft)" : "transparent", color: selectedColors.includes(c) ? "var(--gold)" : "var(--muted)", cursor: "pointer", borderRadius: 20, fontWeight: selectedColors.includes(c) ? 700 : 400, fontSize: ".78rem" }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            {error && <p style={{ color: "var(--error)", fontSize: ".85rem", display: "flex", alignItems: "center", gap: 6 }}><AlertCircle size={14} /> {error}</p>}
            <button onClick={handleSave} disabled={saving} className="premium-button" style={{ justifyContent: "center", display: "flex", alignItems: "center", gap: 8, minHeight: 46, fontSize: ".9rem" }}>
              {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
              {saving ? "Saving..." : (isEditing ? "Update Product" : "Save as Draft")}
            </button>
            <p style={{ color: "var(--muted)", fontSize: ".75rem", textAlign: "center" }}>
              Products are saved as Draft until submitted for Admin Approval.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
