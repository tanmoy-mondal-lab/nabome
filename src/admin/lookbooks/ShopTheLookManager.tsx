import { useState } from "react";
import { Modal } from "../common/Modal";
import { SafeImage } from "../../components/SafeImage";
import { Plus, X, Move, Crosshair } from "lucide-react";
import { MediaPicker } from "../common/MediaPicker";
import { type ShopTheLook, type ShopTheLookProduct } from "../../cms/core/cms-types";

interface ShopTheLookManagerProps {
  lookId: string;
  onSave: (data: ShopTheLook) => void;
  onClose: () => void;
}

export default function ShopTheLookManager({ lookId, onSave, onClose }: ShopTheLookManagerProps) {
  const [form, setForm] = useState<ShopTheLook>({
    id: lookId,
    name: "",
    slug: "",
    description: "",
    image: "",
    products: [],
    tags: [],
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const addProduct = () => {
    const newProduct: ShopTheLookProduct = {
      productId: "",
      productName: "",
      productImage: "",
      productPrice: 0,
      position: { x: 50, y: 50 },
      hotspotSize: 32,
    };
    setForm({ ...form, products: [...form.products, newProduct] });
    setActiveHotspot(form.products.length);
  };

  const removeProduct = (idx: number) => {
    setForm({ ...form, products: form.products.filter((_, i) => i !== idx) });
    setActiveHotspot(null);
  };

  const updateProduct = (idx: number, field: keyof ShopTheLookProduct, value: unknown) => {
    setForm({
      ...form,
      products: form.products.map((p, i) => (i === idx ? { ...p, [field]: value } : p)),
    });
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>, idx: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    updateProduct(idx, "position", { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 });
  };

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Look Name *</label>
          <input required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
        <div>
          <MediaPicker value={form.image} onChange={(url) => setForm({ ...form, image: url })} label="Look Image URL" folder="lookbooks" />
        </div>
      </div>
      <div>
        <label className="block text-xs text-neutral-500 mb-1">Description</label>
        <textarea rows={2} value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
      </div>

      {/* Interactive Hotspot Editor */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-sm text-neutral-900">Product Hotspots</h3>
          <button onClick={addProduct} className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700">
            <Plus size={12} /> Add Product
          </button>
        </div>

        {form.image ? (
          <div className="relative bg-neutral-100 rounded overflow-hidden border border-neutral-200"
            style={{ maxHeight: "500px" }}>
            <SafeImage
              src={form.image}
              alt={form.name}
              className="w-full h-auto"
              onLoad={() => setImageLoaded(true)}
              crossOrigin="anonymous"
              useTransform={false}
            />
            {imageLoaded && form.products.map((product, idx) => (
              <button
                key={idx}
                onClick={() => setActiveHotspot(idx)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center transition-all ${
                  activeHotspot === idx
                    ? "bg-brand-500 text-white ring-4 ring-brand-200 scale-125 z-10"
                    : "bg-white/80 text-neutral-700 hover:bg-white hover:scale-110"
                }`}
                style={{
                  left: `${product.position.x}%`,
                  top: `${product.position.y}%`,
                  width: `${product.hotspotSize}px`,
                  height: `${product.hotspotSize}px`,
                }}
                title={product.productName || "Add product"}
              >
                <Crosshair size={product.hotspotSize * 0.4} />
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-neutral-50 rounded border border-dashed border-neutral-300">
            <p className="text-sm text-neutral-400">Add a look image above to place product hotspots</p>
          </div>
        )}
      </div>

      {/* Product List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {form.products.length === 0 ? (
          <p className="text-xs text-neutral-400 text-center py-4">No products added yet. Click "Add Product" to create hotspots.</p>
        ) : (
          form.products.map((product, idx) => (
            <div key={idx} className={`p-3 rounded border ${activeHotspot === idx ? "border-brand-500 bg-brand-50" : "border-neutral-200 bg-white"}`}
              onClick={() => setActiveHotspot(idx)}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-xs flex items-center justify-center font-medium">{idx + 1}</span>
                <input placeholder="Product ID/Name" value={product.productName}
                  onChange={(e) => updateProduct(idx, "productName", e.target.value)}
                  className="flex-1 px-2 py-1 text-xs border border-neutral-200 rounded" />
                <input placeholder="₹ Price" type="number" value={product.productPrice || ""}
                  onChange={(e) => updateProduct(idx, "productPrice", Number(e.target.value))}
                  className="w-20 px-2 py-1 text-xs border border-neutral-200 rounded" />
                <button onClick={() => removeProduct(idx)} className="text-red-400 hover:text-red-600 p-1">
                  <X size={12} />
                </button>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                <Move size={10} />
                <span>X: {product.position.x}% Y: {product.position.y}%</span>
                <span className="text-neutral-300">|</span>
                <span>Click on image to reposition</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onClose} className="px-4 py-2 text-sm text-neutral-500">Cancel</button>
        <button onClick={handleSave} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium">
          Save Look
        </button>
      </div>
    </div>
  );
}
