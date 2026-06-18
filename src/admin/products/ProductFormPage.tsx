import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminApi } from "../../lib/api/admin";
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Calendar } from "lucide-react";

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [subcategories, setSubcategories] = useState<Record<string, unknown>[]>([]);
  const [collections, setCollections] = useState<Record<string, unknown>[]>([]);
  const [brands, setBrands] = useState<Record<string, unknown>[]>([]);
  const [labels, setLabels] = useState<Record<string, unknown>[]>([]);
  const [sizeGuides, setSizeGuides] = useState<Record<string, unknown>[]>([]);

  const [form, setForm] = useState({
    name: "", slug: "", description: "", shortDescription: "", categoryId: "", subcategoryId: "",
    collectionId: "", brandId: "", sizeGuideId: "", material: "", careInstructions: "",
    basePrice: 0, compareAtPrice: 0, costPrice: 0, salePrice: 0, currency: "INR",
    gender: "unisex", isActive: false, isFeatured: false, isNew: false, sortOrder: 0,
    metaTitle: "", metaDesc: "", scheduledPublishAt: "", scheduledArchiveAt: "",
  });
  const [variants, setVariants] = useState<Record<string, unknown>[]>([]);
  const [images, setImages] = useState<Record<string, unknown>[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      adminApi.getCategories(), adminApi.getSubcategories(), adminApi.getCollections(),
      adminApi.getBrands(), adminApi.getLabels(), adminApi.getSizeGuides(),
    ]).then(([c, s, col, b, l, sg]) => {
      setCategories(c.categories as Record<string, unknown>[] ?? []);
      setSubcategories(s.subcategories as Record<string, unknown>[] ?? []);
      setCollections(col.collections as Record<string, unknown>[] ?? []);
      setBrands(b.brands as Record<string, unknown>[] ?? []);
      setLabels(l.labels as Record<string, unknown>[] ?? []);
      setSizeGuides(sg.sizeGuides as Record<string, unknown>[] ?? []);
    }).catch(() => {});

    if (isEdit) {
      adminApi.getProduct(id!).then((res) => {
        const p = res.product as Record<string, unknown>;
        setForm({
          name: p.name as string ?? "", slug: p.slug as string ?? "",
          description: p.description as string ?? "", shortDescription: p.shortDescription as string ?? "",
          categoryId: p.categoryId as string ?? "", subcategoryId: p.subcategoryId as string ?? "",
          collectionId: p.collectionId as string ?? "", brandId: p.brandId as string ?? "",
          sizeGuideId: p.sizeGuideId as string ?? "",
          material: p.material as string ?? "", careInstructions: p.careInstructions as string ?? "",
          basePrice: Number(p.basePrice ?? 0), compareAtPrice: Number(p.compareAtPrice ?? 0),
          costPrice: Number(p.costPrice ?? 0), salePrice: Number(p.salePrice ?? 0),
          currency: p.currency as string ?? "INR", gender: p.gender as string ?? "unisex",
          isActive: p.isActive as boolean ?? false, isFeatured: p.isFeatured as boolean ?? false,
          isNew: p.isNew as boolean ?? false, sortOrder: p.sortOrder as number ?? 0,
          metaTitle: p.metaTitle as string ?? "", metaDesc: p.metaDesc as string ?? "",
          scheduledPublishAt: (p.scheduledPublishAt as string) ?? "",
          scheduledArchiveAt: (p.scheduledArchiveAt as string) ?? "",
        });
        setVariants(p.variants as Record<string, unknown>[] ?? []);
        setImages(p.images as Record<string, unknown>[] ?? []);
        const tags = p.productLabels as { label: Record<string, unknown> }[] ?? [];
        setSelectedLabels(tags.map((t) => t.label.id as string));
      }).catch(() => navigate("/admin/products"));
    }
  }, [id, isEdit, navigate]);

  async function handleSave() {
    setSaving(true);
    try {
      const data = { ...form };
      if (data.scheduledPublishAt) data.scheduledPublishAt = new Date(data.scheduledPublishAt).toISOString();
      if (data.scheduledArchiveAt) data.scheduledArchiveAt = new Date(data.scheduledArchiveAt).toISOString();
      if (isEdit) {
        await adminApi.updateProduct(id!, data);
        if (selectedLabels.length > 0) await adminApi.assignLabels(id!, selectedLabels);
      } else {
        const res = await adminApi.createProduct(data);
        const newId = (res as Record<string, { id: string }>).product?.id ?? (res as Record<string, string>).id;
        if (newId && selectedLabels.length > 0) await adminApi.assignLabels(newId, selectedLabels);
      }
      navigate("/admin/products");
    } catch (e) {
      alert("Error saving product");
    } finally { setSaving(false); }
  }

  function addVariant() {
    setVariants([...variants, { sku: "", size: "M", color: "", colorHex: "#000000", priceAdjustment: 0, stock: 0, isActive: true, id: `new-${Date.now()}` }]);
  }

  function updateVariant(idx: number, field: string, value: unknown) {
    const updated = [...variants];
    updated[idx] = { ...updated[idx], [field]: value };
    setVariants(updated);
  }

  function removeVariant(idx: number) {
    setVariants(variants.filter((_, i) => i !== idx));
  }

  function addImage() {
    const url = window.prompt("Image URL:");
    if (url) setImages([...images, { url, isPrimary: images.length === 0, sortOrder: images.length }]);
  }

  function setPrimary(idx: number) {
    setImages(images.map((img, i) => ({ ...img, isPrimary: i === idx })));
  }

  function removeImage(idx: number) {
    setImages(images.filter((_, i) => i !== idx));
  }

  const filteredSubs = subcategories.filter((s) => !form.categoryId || (s.categoryId as string) === form.categoryId);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin/products")} className="p-2 hover:bg-neutral-100 rounded"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="text-xl font-display text-neutral-900">{isEdit ? "Edit Product" : "New Product"}</h1>
            <p className="text-sm text-neutral-500">{isEdit ? `Editing: ${form.name}` : "Create a new product"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEdit && <button onClick={() => adminApi.duplicateProduct(id!).then(() => navigate("/admin/products"))} className="flex items-center gap-2 border border-neutral-200 px-4 py-2 text-sm rounded hover:bg-neutral-50">Duplicate</button>}
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-2 text-sm font-medium rounded hover:bg-neutral-800 disabled:opacity-50"><Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Product"}</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <section className="bg-white border border-neutral-200 rounded p-6 space-y-4">
            <h2 className="font-medium text-sm text-neutral-900 uppercase tracking-wider">Basic Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="block text-xs text-neutral-500 mb-1">Product Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") })} className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-neutral-900" /></div>
              <div><label className="block text-xs text-neutral-500 mb-1">Slug</label><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full px-3 py-2 text-sm border rounded" /></div>
              <div><label className="block text-xs text-neutral-500 mb-1">Gender</label><select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full px-3 py-2 text-sm border rounded"><option value="men">Men</option><option value="women">Women</option><option value="unisex">Unisex</option></select></div>
              <div className="col-span-2"><label className="block text-xs text-neutral-500 mb-1">Short Description</label><textarea value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} rows={2} className="w-full px-3 py-2 text-sm border rounded" /></div>
              <div className="col-span-2"><label className="block text-xs text-neutral-500 mb-1">Full Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full px-3 py-2 text-sm border rounded" /></div>
            </div>
          </section>

          <section className="bg-white border border-neutral-200 rounded p-6 space-y-4">
            <h2 className="font-medium text-sm text-neutral-900 uppercase tracking-wider">Pricing</h2>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-xs text-neutral-500 mb-1">Regular Price (₹) *</label><input type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 text-sm border rounded" /></div>
              <div><label className="block text-xs text-neutral-500 mb-1">Sale Price (₹)</label><input type="number" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 text-sm border rounded" /></div>
              <div><label className="block text-xs text-neutral-500 mb-1">Compare At (₹)</label><input type="number" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 text-sm border rounded" /></div>
              <div><label className="block text-xs text-neutral-500 mb-1">Cost Price (₹)</label><input type="number" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 text-sm border rounded" /></div>
              <div><label className="block text-xs text-neutral-500 mb-1">Currency</label><select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full px-3 py-2 text-sm border rounded"><option value="INR">INR</option><option value="USD">USD</option><option value="EUR">EUR</option></select></div>
            </div>
          </section>

          <section className="bg-white border border-neutral-200 rounded p-6 space-y-4">
            <h2 className="font-medium text-sm text-neutral-900 uppercase tracking-wider">Variants</h2>
            {variants.length === 0 && <p className="text-xs text-neutral-400">No variants yet. This product will be treated as a simple (non-variable) product.</p>}
            {variants.map((v, i) => (
              <div key={v.id as string} className="grid grid-cols-7 gap-2 items-end p-3 bg-neutral-50 rounded">
                <div><label className="block text-xs text-neutral-400 mb-1">SKU</label><input value={v.sku as string} onChange={(e) => updateVariant(i, "sku", e.target.value)} className="w-full px-2 py-1.5 text-xs border rounded" /></div>
                <div><label className="block text-xs text-neutral-400 mb-1">Size</label><select value={v.size as string} onChange={(e) => updateVariant(i, "size", e.target.value)} className="w-full px-2 py-1.5 text-xs border rounded"><option value="XS">XS</option><option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option><option value="XXL">XXL</option><option value="3XL">3XL</option><option value="One Size">One Size</option></select></div>
                <div><label className="block text-xs text-neutral-400 mb-1">Color</label><input value={v.color as string} onChange={(e) => updateVariant(i, "color", e.target.value)} className="w-full px-2 py-1.5 text-xs border rounded" /></div>
                <div><label className="block text-xs text-neutral-400 mb-1">Hex</label><input type="color" value={v.colorHex as string ?? "#000000"} onChange={(e) => updateVariant(i, "colorHex", e.target.value)} className="w-full h-[30px] border rounded cursor-pointer" /></div>
                <div><label className="block text-xs text-neutral-400 mb-1">Price Adj.</label><input type="number" value={v.priceAdjustment as number} onChange={(e) => updateVariant(i, "priceAdjustment", parseFloat(e.target.value) || 0)} className="w-full px-2 py-1.5 text-xs border rounded" /></div>
                <div><label className="block text-xs text-neutral-400 mb-1">Stock</label><input type="number" value={v.stock as number} onChange={(e) => updateVariant(i, "stock", parseInt(e.target.value) || 0)} className="w-full px-2 py-1.5 text-xs border rounded" /></div>
                <button onClick={() => removeVariant(i)} className="p-1.5 text-neutral-300 hover:text-red-500 mt-5"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            <button onClick={addVariant} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"><Plus className="w-4 h-4" /> Add Variant</button>
          </section>

          {images.length > 0 && (
            <section className="bg-white border border-neutral-200 rounded p-6 space-y-4">
              <h2 className="font-medium text-sm text-neutral-900 uppercase tracking-wider">Images</h2>
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative group aspect-[3/4] bg-neutral-100 rounded overflow-hidden border-2" style={{ borderColor: img.isPrimary ? "#1B2A4A" : "transparent" }}>
                    <img src={img.url as string} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      {!img.isPrimary && <button onClick={() => setPrimary(i)} className="bg-white text-xs px-2 py-1 rounded shadow">Primary</button>}
                      <button onClick={() => removeImage(i)} className="bg-red-500 text-white text-xs px-2 py-1 rounded shadow">Remove</button>
                    </div>
                    {img.isPrimary as boolean && <span className="absolute top-1 left-1 bg-neutral-900 text-white text-[10px] px-1.5 py-0.5 rounded">Primary</span>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="bg-white border border-neutral-200 rounded p-6 space-y-4">
            <h2 className="font-medium text-sm text-neutral-900 uppercase tracking-wider">Organization</h2>
            <div><label className="block text-xs text-neutral-500 mb-1">Category</label><select value={form.categoryId} onChange={(e) => { setForm({ ...form, categoryId: e.target.value, subcategoryId: "" }); }} className="w-full px-3 py-2 text-sm border rounded"><option value="">None</option>{categories.map((c) => <option key={c.id as string} value={c.id as string}>{c.name as string}</option>)}</select></div>
            <div><label className="block text-xs text-neutral-500 mb-1">Subcategory</label><select value={form.subcategoryId} onChange={(e) => setForm({ ...form, subcategoryId: e.target.value })} className="w-full px-3 py-2 text-sm border rounded"><option value="">None</option>{filteredSubs.map((s) => <option key={s.id as string} value={s.id as string}>{s.name as string}</option>)}</select></div>
            <div><label className="block text-xs text-neutral-500 mb-1">Collection</label><select value={form.collectionId} onChange={(e) => setForm({ ...form, collectionId: e.target.value })} className="w-full px-3 py-2 text-sm border rounded"><option value="">None</option>{collections.map((c) => <option key={c.id as string} value={c.id as string}>{c.name as string}</option>)}</select></div>
            <div><label className="block text-xs text-neutral-500 mb-1">Brand</label><select value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })} className="w-full px-3 py-2 text-sm border rounded"><option value="">None</option>{brands.map((b) => <option key={b.id as string} value={b.id as string}>{b.name as string}</option>)}</select></div>
            <div><label className="block text-xs text-neutral-500 mb-1">Size Guide</label><select value={form.sizeGuideId} onChange={(e) => setForm({ ...form, sizeGuideId: e.target.value })} className="w-full px-3 py-2 text-sm border rounded"><option value="">None</option>{sizeGuides.map((sg) => <option key={sg.id as string} value={sg.id as string}>{sg.name as string}</option>)}</select></div>
          </section>

          <section className="bg-white border border-neutral-200 rounded p-6 space-y-4">
            <h2 className="font-medium text-sm text-neutral-900 uppercase tracking-wider">Flags</h2>
            <div className="space-y-3">
              {(["isActive", "isFeatured", "isNew"] as const).map((f) => (
                <label key={f} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form[f] as boolean} onChange={(e) => setForm({ ...form, [f]: e.target.checked })} className="rounded border-neutral-300" />
                  <span className="text-sm text-neutral-700">{f === "isActive" ? "Published" : f === "isFeatured" ? "Featured" : "New Arrival"}</span>
                </label>
              ))}
            </div>
            <div><label className="block text-xs text-neutral-500 mb-1">Sort Order</label><input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 text-sm border rounded" /></div>
          </section>

          <section className="bg-white border border-neutral-200 rounded p-6 space-y-4">
            <h2 className="font-medium text-sm text-neutral-900 uppercase tracking-wider">Labels</h2>
            <div className="flex flex-wrap gap-2">
              {labels.map((l) => (
                <button key={l.id as string} onClick={() => { setSelectedLabels((prev) => prev.includes(l.id as string) ? prev.filter((id) => id !== l.id) : [...prev, l.id as string]); }}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${selectedLabels.includes(l.id as string) ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"}`}
                  style={selectedLabels.includes(l.id as string) && l.color ? { backgroundColor: l.color as string, borderColor: l.color as string } : {}}>
                  {l.name as string}
                </button>
              ))}
              {labels.length === 0 && <p className="text-xs text-neutral-400">No labels available. Create them in Labels & Tags.</p>}
            </div>
          </section>

          <section className="bg-white border border-neutral-200 rounded p-6 space-y-4">
            <h2 className="font-medium text-sm text-neutral-900 uppercase tracking-wider">Details</h2>
            <div><label className="block text-xs text-neutral-500 mb-1">Material</label><input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} className="w-full px-3 py-2 text-sm border rounded" placeholder="e.g., 100% Organic Cotton" /></div>
            <div><label className="block text-xs text-neutral-500 mb-1">Care Instructions</label><textarea value={form.careInstructions} onChange={(e) => setForm({ ...form, careInstructions: e.target.value })} rows={2} className="w-full px-3 py-2 text-sm border rounded" /></div>
          </section>

          <section className="bg-white border border-neutral-200 rounded p-6 space-y-4">
            <h2 className="font-medium text-sm text-neutral-900 uppercase tracking-wider">SEO</h2>
            <div><label className="block text-xs text-neutral-500 mb-1">Meta Title</label><input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} className="w-full px-3 py-2 text-sm border rounded" /></div>
            <div><label className="block text-xs text-neutral-500 mb-1">Meta Description</label><textarea value={form.metaDesc} onChange={(e) => setForm({ ...form, metaDesc: e.target.value })} rows={2} className="w-full px-3 py-2 text-sm border rounded" /></div>
          </section>

          <section className="bg-white border border-neutral-200 rounded p-6 space-y-4">
            <h2 className="font-medium text-sm text-neutral-900 uppercase tracking-wider">Scheduling</h2>
            <div><label className="block text-xs text-neutral-500 mb-1">Schedule Publish</label><div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" /><input type="datetime-local" value={form.scheduledPublishAt} onChange={(e) => setForm({ ...form, scheduledPublishAt: e.target.value })} className="w-full pl-9 pr-3 py-2 text-sm border rounded" /></div></div>
            <div><label className="block text-xs text-neutral-500 mb-1">Schedule Archive</label><div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" /><input type="datetime-local" value={form.scheduledArchiveAt} onChange={(e) => setForm({ ...form, scheduledArchiveAt: e.target.value })} className="w-full pl-9 pr-3 py-2 text-sm border rounded" /></div></div>
            <p className="text-[10px] text-neutral-400">Set future dates to automatically publish or unpublish this product.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
