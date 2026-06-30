import { useRef, useState, useCallback } from "react";
import { Plus, Trash2, ChevronDown, ChevronRight, ImagePlus, Film, X, GripVertical, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SafeImage } from "../../../components/SafeImage";
import { adminApi } from "../../../lib/api/admin";
import { useToast } from "../../../components/ui/Toast";
import type { Variant } from "../hooks/useProductForm";

interface VariantManagerProps {
  variants: Variant[];
  onChange: (variants: Variant[]) => void;
  uploadingMedia: boolean;
  onUploadStart: () => void;
  onUploadEnd: () => void;
  onPendingImage: (data: { url: string; publicId: string; variantId: string } | null) => void;
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "One Size"];

export function VariantManager({
  variants,
  onChange,
  uploadingMedia,
  onUploadStart,
  onUploadEnd,
  onPendingImage,
}: VariantManagerProps) {
  const { toast } = useToast();
  const [expandedVariant, setExpandedVariant] = useState<string | null>(null);
  const variantImageRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const variantVideoRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const addVariant = useCallback(() => {
    const newId = `new-${Date.now()}`;
    onChange([
      ...variants,
      {
        id: newId,
        sku: "",
        size: "M",
        color: "",
        colorHex: "#000000",
        priceAdjustment: 0,
        stock: 0,
        weight: 0,
        isActive: true,
        images: [],
      },
    ]);
  }, [variants, onChange]);

  const updateVariant = useCallback(
    (idx: number, field: string, value: unknown) => {
      const updated = [...variants];
      updated[idx] = { ...updated[idx], [field]: value };
      onChange(updated);
    },
    [variants, onChange]
  );

  const removeVariant = useCallback(
    (idx: number) => {
      onChange(variants.filter((_, i) => i !== idx));
    },
    [variants, onChange]
  );

  const handleVariantImageUpload = useCallback(
    async (variantId: string, file: File) => {
      onUploadStart();
      try {
        const res = await adminApi.uploadFile(file, "products");
        onPendingImage({ url: res.url, publicId: res.publicId, variantId });
      } catch (err) {
        console.error("Variant image upload failed:", err);
        const msg = err instanceof Error ? err.message : "Image upload failed";
        toast(`${msg} — try again`, "error");
      } finally {
        onUploadEnd();
        const ref = variantImageRefs.current[variantId];
        if (ref) ref.value = "";
      }
    },
    [onUploadStart, onUploadEnd, onPendingImage, toast]
  );

  const handleVariantVideoUpload = useCallback(
    async (variantId: string, file: File) => {
      onUploadStart();
      try {
        const res = await adminApi.uploadFile(file, "product-videos", file.name);
        const idx = variants.findIndex((v) => v.id === variantId);
        if (idx >= 0) {
          const updated = [...variants];
          updated[idx] = { ...updated[idx], videoUrl: res.url, videoPublicId: res.publicId };
          onChange(updated);
        }
      } catch (err) {
        console.error("Variant video upload failed:", err);
        const msg = err instanceof Error ? err.message : "Video upload failed";
        toast(`${msg} — try again`, "error");
      } finally {
        onUploadEnd();
        const ref = variantVideoRefs.current[variantId];
        if (ref) ref.value = "";
      }
    },
    [variants, onChange, onUploadStart, onUploadEnd, toast]
  );

  const removeVariantVideo = useCallback(
    (variantId: string) => {
      const idx = variants.findIndex((v) => v.id === variantId);
      if (idx >= 0) {
        const updated = [...variants];
        updated[idx] = { ...updated[idx], videoUrl: undefined, videoPublicId: undefined };
        onChange(updated);
      }
    },
    [variants, onChange]
  );

  const removeVariantImage = useCallback(
    (variantId: string, imgIdx: number) => {
      const idx = variants.findIndex((v) => v.id === variantId);
      if (idx >= 0) {
        const updated = [...variants];
        const vImages = [...(updated[idx].images ?? [])];
        vImages.splice(imgIdx, 1);
        updated[idx] = { ...updated[idx], images: vImages };
        onChange(updated);
      }
    },
    [variants, onChange]
  );

  const setVariantPrimaryImage = useCallback(
    (variantId: string, imgIdx: number) => {
      const idx = variants.findIndex((v) => v.id === variantId);
      if (idx >= 0) {
        const updated = [...variants];
        const vImages = (updated[idx].images ?? []).map((img, i) => ({
          ...img,
          isPrimary: i === imgIdx,
        }));
        updated[idx] = { ...updated[idx], images: vImages };
        onChange(updated);
      }
    },
    [variants, onChange]
  );

  const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

  return (
    <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100 bg-neutral-50/50">
        <div className="flex items-center gap-2">
          <Package size={14} className="text-neutral-400" />
          <h2 className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">Variants</h2>
          {variants.length > 0 && (
            <span className="text-[10px] font-medium text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded-full">
              {variants.length} · {totalStock} in stock
            </span>
          )}
        </div>
        <button
          onClick={addVariant}
          className="flex items-center gap-1 text-[11px] font-medium text-neutral-600 hover:text-neutral-900 border border-neutral-200 px-2.5 py-1 rounded-md hover:bg-white transition-all"
        >
          <Plus size={11} /> Add
        </button>
      </div>

      {variants.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <Package size={24} className="mx-auto text-neutral-300 mb-2" />
          <p className="text-xs text-neutral-400">No variants. This is a simple product.</p>
          <button onClick={addVariant} className="mt-2 text-[11px] font-medium text-neutral-600 hover:text-neutral-900 underline underline-offset-2">
            Add your first variant
          </button>
        </div>
      ) : (
        <div className="divide-y divide-neutral-100">
          <AnimatePresence>
            {variants.map((v, i) => {
              const isExpanded = expandedVariant === v.id;
              const variantImages = v.images ?? [];
              const hasMedia = variantImages.length > 0 || v.videoUrl;
              return (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  layout
                >
                  {/* Variant Header */}
                  <div
                    className="flex items-center gap-2 px-5 py-2.5 cursor-pointer hover:bg-neutral-50/50 transition-colors"
                    onClick={() => setExpandedVariant(isExpanded ? null : v.id)}
                  >
                    <GripVertical size={12} className="text-neutral-300 shrink-0" />
                    <button className="p-0.5 shrink-0">
                      {isExpanded ? <ChevronDown size={12} className="text-neutral-400" /> : <ChevronRight size={12} className="text-neutral-400" />}
                    </button>
                    {v.colorHex && (
                      <div className="w-3.5 h-3.5 rounded-full border border-neutral-200 shrink-0" style={{ backgroundColor: v.colorHex }} />
                    )}
                    <span className="text-xs font-medium text-neutral-700 truncate">
                      {v.sku || `Variant ${i + 1}`}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {v.size}{v.color ? ` · ${v.color}` : ""}
                    </span>
                    <span className="text-[10px] text-neutral-400 ml-auto">
                      {v.stock} in stock
                    </span>
                    {hasMedia && (
                      <span className="text-[10px] text-blue-600 bg-blue-50 px-1 py-0.5 rounded">
                        {variantImages.length}img{v.videoUrl ? "+vid" : ""}
                      </span>
                    )}
                    <input
                      type="checkbox"
                      checked={v.isActive}
                      onChange={(e) => { e.stopPropagation(); updateVariant(i, "isActive", e.target.checked); }}
                      className="rounded border-neutral-300 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); removeVariant(i); }}
                      className="p-1 text-neutral-300 hover:text-red-500 transition-colors shrink-0"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {/* Variant Fields - Always visible */}
                  <div className="px-5 pb-3">
                    <div className="grid grid-cols-8 gap-1.5">
                      <div>
                        <label className="block text-[10px] text-neutral-400 mb-0.5 uppercase">SKU</label>
                        <input value={v.sku} onChange={(e) => updateVariant(i, "sku", e.target.value)} className="w-full px-2 py-1 text-[11px] border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-neutral-300" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-neutral-400 mb-0.5 uppercase">Size</label>
                        <select value={v.size} onChange={(e) => updateVariant(i, "size", e.target.value)} className="w-full px-2 py-1 text-[11px] border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-neutral-300">
                          {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-neutral-400 mb-0.5 uppercase">Color</label>
                        <input value={v.color} onChange={(e) => updateVariant(i, "color", e.target.value)} className="w-full px-2 py-1 text-[11px] border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-neutral-300" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-neutral-400 mb-0.5 uppercase">Hex</label>
                        <input type="color" value={v.colorHex ?? "#000000"} onChange={(e) => updateVariant(i, "colorHex", e.target.value)} className="w-full h-[26px] border border-neutral-200 rounded cursor-pointer" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-neutral-400 mb-0.5 uppercase">Price Adj.</label>
                        <input type="number" value={v.priceAdjustment} onChange={(e) => updateVariant(i, "priceAdjustment", parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 text-[11px] border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-neutral-300" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-neutral-400 mb-0.5 uppercase">Stock</label>
                        <input type="number" value={v.stock} onChange={(e) => updateVariant(i, "stock", parseInt(e.target.value) || 0)} className="w-full px-2 py-1 text-[11px] border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-neutral-300" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-neutral-400 mb-0.5 uppercase">Weight</label>
                        <input type="number" value={v.weight ?? 0} onChange={(e) => updateVariant(i, "weight", parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 text-[11px] border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-neutral-300" step="0.1" />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Media Panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4 border-t border-neutral-100 pt-3 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">Media</p>
                            <div className="flex gap-1">
                              <button
                                onClick={() => variantImageRefs.current[v.id]?.click()}
                                className="flex items-center gap-1 text-[10px] text-neutral-600 hover:text-neutral-900 border border-neutral-200 px-2 py-0.5 rounded hover:bg-white transition-all"
                              >
                                <ImagePlus size={9} /> Image
                              </button>
                              <button
                                onClick={() => variantVideoRefs.current[v.id]?.click()}
                                disabled={uploadingMedia || !!v.videoUrl}
                                className="flex items-center gap-1 text-[10px] text-neutral-600 hover:text-neutral-900 border border-neutral-200 px-2 py-0.5 rounded hover:bg-white transition-all disabled:opacity-40"
                              >
                                <Film size={9} /> {v.videoUrl ? "Added" : "Video"}
                              </button>
                              <input ref={(el) => { variantImageRefs.current[v.id] = el; }} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVariantImageUpload(v.id, f); }} />
                              <input ref={(el) => { variantVideoRefs.current[v.id] = el; }} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVariantVideoUpload(v.id, f); }} />
                            </div>
                          </div>

                          {variantImages.length > 0 && (
                            <div className="grid grid-cols-4 gap-1.5">
                              {variantImages.map((img, imgIdx) => (
                                <div key={imgIdx} className="relative group aspect-square bg-neutral-100 rounded-md overflow-hidden border border-neutral-200">
                                  <SafeImage src={img.url} alt="" className="w-full h-full object-cover" useTransform={false} />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                                    {!img.isPrimary && (
                                      <button onClick={() => setVariantPrimaryImage(v.id, imgIdx)} className="bg-white text-[8px] px-1 py-0.5 rounded shadow-sm">Primary</button>
                                    )}
                                    <button onClick={() => removeVariantImage(v.id, imgIdx)} className="bg-red-500 text-white text-[8px] px-1 py-0.5 rounded shadow-sm">Remove</button>
                                  </div>
                                  {img.isPrimary && <span className="absolute top-0.5 left-0.5 bg-neutral-900 text-white text-[8px] px-1 py-0.5 rounded">Primary</span>}
                                </div>
                              ))}
                            </div>
                          )}

                          {v.videoUrl && (
                            <div className="relative group aspect-video bg-neutral-900 rounded-md overflow-hidden border border-neutral-200">
                              <video src={v.videoUrl} className="w-full h-full object-cover" controls />
                              <button onClick={() => removeVariantVideo(v.id)} className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                <X size={10} />
                              </button>
                            </div>
                          )}

                          {variantImages.length === 0 && !v.videoUrl && (
                            <p className="text-[10px] text-neutral-400 text-center py-3">No media yet.</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
