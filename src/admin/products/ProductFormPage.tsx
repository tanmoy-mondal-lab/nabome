import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminApi } from "../../lib/api/admin";
import {
  ArrowLeft, Save, Plus, Trash2, Calendar, Upload, Film,
  ImagePlus, X, ChevronDown, ChevronRight, ImageIcon, VideoIcon,
} from "lucide-react";
import { MediaPicker } from "../common/MediaPicker";
import { SafeImage } from "../../components/SafeImage";

interface VariantImage {
  id?: string;
  url: string;
  publicId?: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
  type?: string;
}

interface Variant {
  id: string;
  sku: string;
  size: string;
  color: string;
  colorHex: string;
  priceAdjustment: number;
  stock: number;
  weight: number;
  isActive: boolean;
  videoUrl?: string;
  videoPublicId?: string;
  images?: VariantImage[];
}

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [subcategories, setSubcategories] = useState<Record<string, unknown>[]>([]);
  const [collections, setCollections] = useState<Record<string, unknown>[]>([]);
  const [brands, setBrands] = useState<Record<string, unknown>[]>([]);
  const [labels, setLabels] = useState<Record<string, unknown>[]>([]);
  const [sizeGuides, setSizeGuides] = useState<Record<string, unknown>[]>([]);
  const [altTextInput, setAltTextInput] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<{ url: string; publicId: string; variantId?: string } | null>(null);

  const [form, setForm] = useState({
    name: "", slug: "", description: "", shortDescription: "", categoryId: "", subcategoryId: "",
    collectionId: "", brandId: "", sizeGuideId: "", material: "", careInstructions: "",
    basePrice: 0, compareAtPrice: 0, costPrice: 0, salePrice: 0, discountPercent: 0, currency: "INR",
    gender: "unisex", isActive: false, isFeatured: false, isNew: false, sortOrder: 0,
    metaTitle: "", metaDesc: "", scheduledPublishAt: "", scheduledArchiveAt: "", sizeChartUrl: "",
  });
  const [variants, setVariants] = useState<Variant[]>([]);
  const [images, setImages] = useState<Record<string, unknown>[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [expandedVariant, setExpandedVariant] = useState<string | null>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const variantImageRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const variantVideoRefs = useRef<Record<string, HTMLInputElement | null>>({});

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
    }).catch(() => { /* non-critical: dropdowns will be empty */ });

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
          discountPercent: Number(p.discountPercent ?? 0),
          currency: p.currency as string ?? "INR", gender: p.gender as string ?? "unisex",
          isActive: p.isActive as boolean ?? false, isFeatured: p.isFeatured as boolean ?? false,
          isNew: p.isNew as boolean ?? false, sortOrder: p.sortOrder as number ?? 0,
          metaTitle: p.metaTitle as string ?? "", metaDesc: p.metaDesc as string ?? "",
          scheduledPublishAt: (p.scheduledPublishAt as string) ?? "",
          scheduledArchiveAt: (p.scheduledArchiveAt as string) ?? "",
          sizeChartUrl: (p.sizeChartUrl as string) ?? "",
        });
        const rawVariants = (p.variants as Variant[]) ?? [];
        setVariants(rawVariants.map((v) => ({
          ...v,
          images: ((v as unknown as Record<string, unknown>).images as VariantImage[]) ?? [],
        })));
        setImages(p.images as Record<string, unknown>[] ?? []);
        const tags = p.productLabels as { label: Record<string, unknown> }[] ?? [];
        setSelectedLabels(tags.map((t) => t.label.id as string));
      }).catch(() => navigate("/admin/products"));
    }
  }, [id, isEdit, navigate]);

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const data = { ...form };
      const uuidFields = ["categoryId", "subcategoryId", "collectionId", "brandId", "sizeGuideId"];
      for (const f of uuidFields) {
        if ((data as Record<string, unknown>)[f] === "") (data as Record<string, unknown>)[f] = null;
      }
      if (data.scheduledPublishAt) data.scheduledPublishAt = new Date(data.scheduledPublishAt).toISOString();
      if (data.scheduledArchiveAt) data.scheduledArchiveAt = new Date(data.scheduledArchiveAt).toISOString();
      let res: unknown;
      if (isEdit) {
        await adminApi.updateProduct(id!, data);
        if (selectedLabels.length > 0) await adminApi.assignLabels(id!, selectedLabels);
      } else {
        res = await adminApi.createProduct(data);
        const newId = (res as Record<string, { id: string }>).product?.id ?? (res as Record<string, string>).id;
        if (newId && selectedLabels.length > 0) await adminApi.assignLabels(newId, selectedLabels);
      }
      const productId = isEdit ? id! : (res as Record<string, { id: string }>).product?.id ?? (res as Record<string, string>).id;

      if (productId) {
        // Save variants with video data
        if (variants.length > 0) {
          await adminApi.updateProductVariants(productId, variants.map((v) => ({
            id: v.id?.startsWith("new-") ? undefined : v.id,
            sku: v.sku,
            size: v.size,
            color: v.color,
            colorHex: v.colorHex,
            priceAdjustment: v.priceAdjustment,
            stock: v.stock,
            weight: v.weight,
            isActive: v.isActive,
            videoUrl: v.videoUrl ?? null,
            videoPublicId: v.videoPublicId ?? null,
          })));
        }

        // Save product images
        if (images.length > 0) {
          await Promise.all(images.map((img, index) =>
            adminApi.addProductImage(productId, {
              url: img.url as string,
              publicId: (img as Record<string, unknown>).publicId as string | undefined,
              altText: (img.altText as string) ?? "",
              isPrimary: index === 0,
            })
          ));
        }
      }
      navigate("/admin/products");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setSaveError(`Failed to save product: ${msg}`);
    } finally { setSaving(false); }
  }

  function addVariant() {
    const newId = `new-${Date.now()}`;
    setVariants([...variants, {
      id: newId, sku: "", size: "M", color: "", colorHex: "#000000",
      priceAdjustment: 0, stock: 0, weight: 0, isActive: true, images: [],
    }]);
  }

  function updateVariant(idx: number, field: string, value: unknown) {
    const updated = [...variants];
    updated[idx] = { ...updated[idx], [field]: value };
    setVariants(updated);
  }

  function removeVariant(idx: number) {
    setVariants(variants.filter((_, i) => i !== idx));
  }

  const fileInputRef = useRef<HTMLInputElement>(null);
  function addImage(file?: File, variantId?: string) {
    if (file) {
      adminApi.uploadFile(file, "products").then((res) => {
        setPendingImage({ url: res.url, publicId: res.publicId, variantId });
        setAltTextInput("");
      }).catch(() => { /* non-critical: image upload failed */ });
    }
  }

  function confirmAltText() {
    if (pendingImage) {
      if (pendingImage.variantId) {
        // Variant image
        const vIdx = variants.findIndex((v) => v.id === pendingImage.variantId);
        if (vIdx >= 0) {
          const updated = [...variants];
          const vImages = [...(updated[vIdx].images ?? [])];
          vImages.push({ url: pendingImage.url, publicId: pendingImage.publicId, altText: altTextInput ?? "", isPrimary: vImages.length === 0, sortOrder: vImages.length });
          updated[vIdx] = { ...updated[vIdx], images: vImages };
          setVariants(updated);
        }
      } else {
        // Product image
        setImages((prev) => [...prev, { url: pendingImage.url, publicId: pendingImage.publicId, altText: altTextInput ?? "", isPrimary: prev.length === 0, sortOrder: prev.length }]);
      }
      setPendingImage(null);
      setAltTextInput(null);
    }
  }

  function skipAltText() {
    if (pendingImage) {
      if (pendingImage.variantId) {
        const vIdx = variants.findIndex((v) => v.id === pendingImage.variantId);
        if (vIdx >= 0) {
          const updated = [...variants];
          const vImages = [...(updated[vIdx].images ?? [])];
          vImages.push({ url: pendingImage.url, publicId: pendingImage.publicId, altText: "", isPrimary: vImages.length === 0, sortOrder: vImages.length });
          updated[vIdx] = { ...updated[vIdx], images: vImages };
          setVariants(updated);
        }
      } else {
        setImages((prev) => [...prev, { url: pendingImage.url, publicId: pendingImage.publicId, altText: "", isPrimary: prev.length === 0, sortOrder: prev.length }]);
      }
      setPendingImage(null);
      setAltTextInput(null);
    }
  }

  function setPrimary(idx: number) {
    setImages(images.map((img, i) => ({ ...img, isPrimary: i === idx })));
  }

  function removeImage(idx: number) {
    setImages(images.filter((_, i) => i !== idx));
  }

  function removeVariantImage(variantId: string, imgIdx: number) {
    const vIdx = variants.findIndex((v) => v.id === variantId);
    if (vIdx >= 0) {
      const updated = [...variants];
      const vImages = [...(updated[vIdx].images ?? [])];
      vImages.splice(imgIdx, 1);
      updated[vIdx] = { ...updated[vIdx], images: vImages };
      setVariants(updated);
    }
  }

  function setVariantPrimaryImage(variantId: string, imgIdx: number) {
    const vIdx = variants.findIndex((v) => v.id === variantId);
    if (vIdx >= 0) {
      const updated = [...variants];
      const vImages = (updated[vIdx].images ?? []).map((img, i) => ({ ...img, isPrimary: i === imgIdx }));
      updated[vIdx] = { ...updated[vIdx], images: vImages };
      setVariants(updated);
    }
  }

  async function handleVariantVideoUpload(variantId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia(true);
    try {
      const res = await adminApi.uploadFile(file, "product-videos", file.name);
      updateVariant(variants.findIndex((v) => v.id === variantId), "videoUrl", res.url);
      updateVariant(variants.findIndex((v) => v.id === variantId), "videoPublicId", res.publicId);
    } catch { /* ignore */ } finally {
      setUploadingMedia(false);
      const ref = variantVideoRefs.current[variantId];
      if (ref) ref.value = "";
    }
  }

  function removeVariantVideo(variantId: string) {
    const vIdx = variants.findIndex((v) => v.id === variantId);
    if (vIdx >= 0) {
      updateVariant(vIdx, "videoUrl", null);
      updateVariant(vIdx, "videoPublicId", null);
    }
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia(true);
    try {
      const res = await adminApi.uploadFile(file, "product-videos", file.name);
      setImages([...images, { url: res.url, isPrimary: images.length === 0, sortOrder: images.length, type: "video" }]);
    } catch { /* ignore */ } finally {
      setUploadingMedia(false);
      if (videoFileRef.current) videoFileRef.current.value = "";
    }
  }

  const filteredSubs = subcategories.filter((s) => !form.categoryId || (s.categoryId as string) === form.categoryId);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 flex items-center justify-between">
          <span>{saveError}</span>
          <button onClick={() => setSaveError(null)} className="text-red-500 hover:text-red-700 text-xs">Dismiss</button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin/products")} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="text-xl font-display text-neutral-900">{isEdit ? "Edit Product" : "New Product"}</h1>
            <p className="text-sm text-neutral-500">{isEdit ? `Editing: ${form.name}` : "Create a new product"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEdit && <button onClick={() => adminApi.duplicateProduct(id!).then(() => navigate("/admin/products"))} className="flex items-center gap-2 border border-neutral-200 px-4 py-2 text-sm rounded-lg hover:bg-neutral-50 transition-colors">Duplicate</button>}
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-2 text-sm font-medium rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition-colors shadow-sm"><Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Product"}</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <section className="bg-white border border-neutral-200 rounded-lg p-6 space-y-4">
            <h2 className="font-medium text-sm text-neutral-900 uppercase tracking-wider">Basic Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="block text-xs text-neutral-500 mb-1">Product Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" /></div>
              <div><label className="block text-xs text-neutral-500 mb-1">Slug</label><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" /></div>
              <div><label className="block text-xs text-neutral-500 mb-1">Gender</label><select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"><option value="men">Men</option><option value="women">Women</option><option value="unisex">Unisex</option></select></div>
              <div className="col-span-2"><label className="block text-xs text-neutral-500 mb-1">Short Description</label><textarea value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} rows={2} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" /></div>
              <div className="col-span-2"><label className="block text-xs text-neutral-500 mb-1">Full Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" /></div>
            </div>
          </section>

          <section className="bg-white border border-neutral-200 rounded-lg p-6 space-y-4">
            <h2 className="font-medium text-sm text-neutral-900 uppercase tracking-wider">Pricing</h2>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-xs text-neutral-500 mb-1">Regular Price *</label><input type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" /></div>
              <div><label className="block text-xs text-neutral-500 mb-1">Sale Price</label><input type="number" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" /></div>
              <div><label className="block text-xs text-neutral-500 mb-1">Compare At</label><input type="number" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" /></div>
              <div><label className="block text-xs text-neutral-500 mb-1">Cost Price</label><input type="number" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" /></div>
              <div><label className="block text-xs text-neutral-500 mb-1">Discount %</label><input type="number" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" /></div>
              <div><label className="block text-xs text-neutral-500 mb-1">Currency</label><select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"><option value="INR">INR</option><option value="USD">USD</option><option value="EUR">EUR</option></select></div>
            </div>
          </section>

          {/* Variants with Media */}
          <section className="bg-white border border-neutral-200 rounded-lg p-6 space-y-4">
            <h2 className="font-medium text-sm text-neutral-900 uppercase tracking-wider">Variants</h2>
            {variants.length === 0 && <p className="text-xs text-neutral-400">No variants yet. This product will be treated as a simple (non-variable) product.</p>}
            {variants.map((v, i) => {
              const isExpanded = expandedVariant === v.id;
              const variantImages = v.images ?? [];
              const hasMedia = variantImages.length > 0 || v.videoUrl;
              return (
                <div key={v.id} className="border border-neutral-200 rounded-lg overflow-hidden">
                  {/* Variant Header */}
                  <div className="flex items-center gap-3 p-3 bg-neutral-50">
                    <button onClick={() => setExpandedVariant(isExpanded ? null : v.id)} className="p-1 hover:bg-neutral-200 rounded transition-colors">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {v.colorHex && <div className="w-4 h-4 rounded-full border border-neutral-200 shrink-0" style={{ backgroundColor: v.colorHex }} />}
                      <span className="text-sm font-medium text-neutral-700 truncate">{v.sku || `Variant ${i + 1}`}</span>
                      <span className="text-xs text-neutral-400">{v.size} • {v.color || "No color"}</span>
                      {hasMedia && (
                        <span className="flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                          <ImageIcon size={8} /> {variantImages.length}
                          {v.videoUrl && <><VideoIcon size={8} /> 1</>}
                        </span>
                      )}
                    </div>
                    <input type="checkbox" checked={v.isActive} onChange={(e) => updateVariant(i, "isActive", e.target.checked)} className="rounded border-neutral-300" />
                    <button onClick={() => removeVariant(i)} className="p-1.5 text-neutral-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>

                  {/* Variant Fields */}
                  <div className="grid grid-cols-9 gap-2 items-end p-3 border-t border-neutral-100">
                    <div><label className="block text-[10px] text-neutral-400 mb-1">SKU</label><input value={v.sku} onChange={(e) => updateVariant(i, "sku", e.target.value)} className="w-full px-2 py-1.5 text-xs border border-neutral-200 rounded-md" /></div>
                    <div><label className="block text-[10px] text-neutral-400 mb-1">Size</label><select value={v.size} onChange={(e) => updateVariant(i, "size", e.target.value)} className="w-full px-2 py-1.5 text-xs border border-neutral-200 rounded-md"><option value="XS">XS</option><option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option><option value="XXL">XXL</option><option value="3XL">3XL</option><option value="One Size">One Size</option></select></div>
                    <div><label className="block text-[10px] text-neutral-400 mb-1">Color</label><input value={v.color} onChange={(e) => updateVariant(i, "color", e.target.value)} className="w-full px-2 py-1.5 text-xs border border-neutral-200 rounded-md" /></div>
                    <div><label className="block text-[10px] text-neutral-400 mb-1">Hex</label><input type="color" value={v.colorHex ?? "#000000"} onChange={(e) => updateVariant(i, "colorHex", e.target.value)} className="w-full h-[30px] border border-neutral-200 rounded-md cursor-pointer" /></div>
                    <div><label className="block text-[10px] text-neutral-400 mb-1">Price Adj.</label><input type="number" value={v.priceAdjustment} onChange={(e) => updateVariant(i, "priceAdjustment", parseFloat(e.target.value) || 0)} className="w-full px-2 py-1.5 text-xs border border-neutral-200 rounded-md" /></div>
                    <div><label className="block text-[10px] text-neutral-400 mb-1">Stock</label><input type="number" value={v.stock} onChange={(e) => updateVariant(i, "stock", parseInt(e.target.value) || 0)} className="w-full px-2 py-1.5 text-xs border border-neutral-200 rounded-md" /></div>
                    <div><label className="block text-[10px] text-neutral-400 mb-1">Weight</label><input type="number" value={v.weight ?? 0} onChange={(e) => updateVariant(i, "weight", parseFloat(e.target.value) || 0)} className="w-full px-2 py-1.5 text-xs border border-neutral-200 rounded-md" step="0.1" /></div>
                  </div>

                  {/* Variant Media Panel */}
                  {isExpanded && (
                    <div className="border-t border-neutral-100 p-3 space-y-3 bg-white">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Media</p>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => variantImageRefs.current[v.id]?.click()}
                            className="flex items-center gap-1 text-[11px] text-neutral-600 hover:text-neutral-900 border border-neutral-200 px-2 py-1 rounded-md transition-colors"
                          >
                            <ImagePlus size={10} /> Image
                          </button>
                          <button
                            onClick={() => variantVideoRefs.current[v.id]?.click()}
                            disabled={uploadingMedia || !!v.videoUrl}
                            className="flex items-center gap-1 text-[11px] text-neutral-600 hover:text-neutral-900 border border-neutral-200 px-2 py-1 rounded-md transition-colors disabled:opacity-40"
                          >
                            <Film size={10} /> {v.videoUrl ? "Video Added" : "Video"}
                          </button>
                          <input
                            ref={(el) => { variantImageRefs.current[v.id] = el; }}
                            type="file" accept="image/*" className="hidden"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) addImage(f, v.id); }}
                          />
                          <input
                            ref={(el) => { variantVideoRefs.current[v.id] = el; }}
                            type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden"
                            onChange={(e) => handleVariantVideoUpload(v.id, e)}
                          />
                        </div>
                      </div>

                      {/* Variant Images Grid */}
                      {variantImages.length > 0 && (
                        <div className="grid grid-cols-4 gap-2">
                          {variantImages.map((img, imgIdx) => (
                            <div key={imgIdx} className="relative group aspect-square bg-neutral-100 rounded-md overflow-hidden border border-neutral-200">
                              <SafeImage src={img.url} alt="" className="w-full h-full object-cover" useTransform={false} />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                                {!img.isPrimary && (
                                  <button onClick={() => setVariantPrimaryImage(v.id, imgIdx)} className="bg-white text-[10px] px-1.5 py-0.5 rounded shadow-sm">Primary</button>
                                )}
                                <button onClick={() => removeVariantImage(v.id, imgIdx)} className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm">Remove</button>
                              </div>
                              {img.isPrimary && <span className="absolute top-0.5 left-0.5 bg-neutral-900 text-white text-[9px] px-1 py-0.5 rounded">Primary</span>}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Variant Video */}
                      {v.videoUrl && (
                        <div className="relative group aspect-video bg-neutral-900 rounded-md overflow-hidden border border-neutral-200">
                          <video src={v.videoUrl} className="w-full h-full object-cover" controls />
                          <button
                            onClick={() => removeVariantVideo(v.id)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}

                      {variantImages.length === 0 && !v.videoUrl && (
                        <p className="text-[11px] text-neutral-400 text-center py-2">No media uploaded for this variant.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <button onClick={addVariant} className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"><Plus className="w-4 h-4" /> Add Variant</button>
          </section>

          <section className="bg-white border border-neutral-200 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-sm text-neutral-900 uppercase tracking-wider">Product Media</h2>
              <div className="flex gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900 border border-neutral-200 px-3 py-1.5 rounded-md transition-colors">
                  <Plus size={12} /> Add Image
                </button>
                <button onClick={() => videoFileRef.current?.click()} disabled={uploadingMedia}
                  className="flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900 border border-neutral-200 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50">
                  <Film size={12} /> {uploadingMedia ? "Uploading…" : "Upload Video"}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) addImage(f); if (fileInputRef.current) fileInputRef.current.value = ""; }} />
                <input ref={videoFileRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={handleVideoUpload} />
              </div>
            </div>
            {images.length > 0 ? (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, i) => {
                  const isVideo = (img.type as string) === "video" || (img.url as string).match(/\.(mp4|webm|mov|avi)(\?|$)/i);
                  return (
                    <div key={i} className="relative group aspect-[3/4] bg-neutral-100 rounded-lg overflow-hidden border-2 transition-colors" style={{ borderColor: img.isPrimary ? "#1B2A4A" : "transparent" }}>
                      {isVideo ? (
                        <div className="relative w-full h-full bg-neutral-900">
                          <video src={img.url as string} className="w-full h-full object-cover opacity-80" />
                          <Film size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/60" />
                        </div>
                      ) : (
                        <SafeImage src={img.url as string} alt="" className="w-full h-full object-cover" useTransform={false} />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        {!img.isPrimary && <button onClick={() => setPrimary(i)} className="bg-white text-xs px-2 py-1 rounded-md shadow">Primary</button>}
                        <button onClick={() => removeImage(i)} className="bg-red-500 text-white text-xs px-2 py-1 rounded-md shadow">Remove</button>
                      </div>
                      {img.isPrimary as boolean && <span className="absolute top-1 left-1 bg-neutral-900 text-white text-[10px] px-1.5 py-0.5 rounded">Primary</span>}
                      {isVideo && <span className="absolute top-1 right-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1"><Film size={8} /> Video</span>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-neutral-400">No media yet. Add images or upload videos for this product.</p>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white border border-neutral-200 rounded-lg p-6 space-y-4">
            <h2 className="font-medium text-sm text-neutral-900 uppercase tracking-wider">Organization</h2>
            <div><label className="block text-xs text-neutral-500 mb-1">Category</label><select value={form.categoryId} onChange={(e) => { setForm({ ...form, categoryId: e.target.value, subcategoryId: "" }); }} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"><option value="">None</option>{categories.map((c) => <option key={c.id as string} value={c.id as string}>{c.name as string}</option>)}</select></div>
            <div><label className="block text-xs text-neutral-500 mb-1">Subcategory</label><select value={form.subcategoryId} onChange={(e) => setForm({ ...form, subcategoryId: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"><option value="">None</option>{filteredSubs.map((s) => <option key={s.id as string} value={s.id as string}>{s.name as string}</option>)}</select></div>
            <div><label className="block text-xs text-neutral-500 mb-1">Collection</label><select value={form.collectionId} onChange={(e) => setForm({ ...form, collectionId: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"><option value="">None</option>{collections.map((c) => <option key={c.id as string} value={c.id as string}>{c.name as string}</option>)}</select></div>
            <div><label className="block text-xs text-neutral-500 mb-1">Brand</label><select value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"><option value="">None</option>{brands.map((b) => <option key={b.id as string} value={b.id as string}>{b.name as string}</option>)}</select></div>
            <div><label className="block text-xs text-neutral-500 mb-1">Size Guide</label><select value={form.sizeGuideId} onChange={(e) => setForm({ ...form, sizeGuideId: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"><option value="">None</option>{sizeGuides.map((sg) => <option key={sg.id as string} value={sg.id as string}>{sg.name as string}</option>)}</select></div>
          </section>

          <section className="bg-white border border-neutral-200 rounded-lg p-6 space-y-4">
            <h2 className="font-medium text-sm text-neutral-900 uppercase tracking-wider">Flags</h2>
            <div className="space-y-3">
              {(["isActive", "isFeatured", "isNew"] as const).map((f) => (
                <label key={f} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form[f] as boolean} onChange={(e) => setForm({ ...form, [f]: e.target.checked })} className="rounded border-neutral-300" />
                  <span className="text-sm text-neutral-700">{f === "isActive" ? "Published" : f === "isFeatured" ? "Featured" : "New Arrival"}</span>
                </label>
              ))}
            </div>
            <div><label className="block text-xs text-neutral-500 mb-1">Sort Order</label><input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" /></div>
          </section>

          <section className="bg-white border border-neutral-200 rounded-lg p-6 space-y-4">
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

          <section className="bg-white border border-neutral-200 rounded-lg p-6 space-y-4">
            <h2 className="font-medium text-sm text-neutral-900 uppercase tracking-wider">Details</h2>
            <div><label className="block text-xs text-neutral-500 mb-1">Material</label><input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" placeholder="e.g., 100% Organic Cotton" /></div>
            <div><label className="block text-xs text-neutral-500 mb-1">Care Instructions</label><textarea value={form.careInstructions} onChange={(e) => setForm({ ...form, careInstructions: e.target.value })} rows={2} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" /></div>
            <div><MediaPicker value={form.sizeChartUrl} onChange={(url: string) => setForm({ ...form, sizeChartUrl: url })} label="Size Chart URL" folder="size-guides" placeholder="URL to external size chart" /></div>
          </section>

          <section className="bg-white border border-neutral-200 rounded-lg p-6 space-y-4">
            <h2 className="font-medium text-sm text-neutral-900 uppercase tracking-wider">SEO</h2>
            <div><label className="block text-xs text-neutral-500 mb-1">Meta Title</label><input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" /></div>
            <div><label className="block text-xs text-neutral-500 mb-1">Meta Description</label><textarea value={form.metaDesc} onChange={(e) => setForm({ ...form, metaDesc: e.target.value })} rows={2} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" /></div>
          </section>

          <section className="bg-white border border-neutral-200 rounded-lg p-6 space-y-4">
            <h2 className="font-medium text-sm text-neutral-900 uppercase tracking-wider">Scheduling</h2>
            <div><label className="block text-xs text-neutral-500 mb-1">Schedule Publish</label><div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" /><input type="datetime-local" value={form.scheduledPublishAt} onChange={(e) => setForm({ ...form, scheduledPublishAt: e.target.value })} className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" /></div></div>
            <div><label className="block text-xs text-neutral-500 mb-1">Schedule Archive</label><div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" /><input type="datetime-local" value={form.scheduledArchiveAt} onChange={(e) => setForm({ ...form, scheduledArchiveAt: e.target.value })} className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" /></div></div>
            <p className="text-[10px] text-neutral-400">Set future dates to automatically publish or unpublish this product.</p>
          </section>
        </div>
      </div>

      {/* Alt Text Modal */}
      {pendingImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-medium text-sm text-neutral-900 mb-4">Image Alt Text</h3>
            <p className="text-xs text-neutral-500 mb-3">Optional — describe this image for accessibility and SEO.</p>
            <input
              value={altTextInput ?? ""}
              onChange={(e) => setAltTextInput(e.target.value)}
              placeholder="e.g., Blue cotton t-shirt front view"
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 mb-4"
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") confirmAltText(); if (e.key === "Escape") skipAltText(); }}
            />
            <div className="flex justify-end gap-2">
              <button onClick={skipAltText} className="px-4 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">Skip</button>
              <button onClick={confirmAltText} className="px-4 py-2 text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors shadow-sm">Add Image</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
