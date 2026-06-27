import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../../components/ui/Toast";
import { adminApi } from "../../lib/api/admin";
import { MediaPicker } from "../common/MediaPicker";
import {
  useProductDropdowns,
  useProduct,
  buildDefaultForm,
  productToForm,
  productToVariants,
  productToImages,
  productToSelectedLabels,
  useFormDirty,
  validateProductForm,
} from "./hooks/useProductForm";
import type { ProductFormData, Variant, ProductImage, FormErrors } from "./hooks/useProductForm";
import { ProductFormHeader } from "./components/ProductFormHeader";
import { VariantManager } from "./components/VariantManager";
import { MediaManager } from "./components/MediaManager";
import {
  Calendar, ArrowLeft, X, ChevronDown,
  Tag, Eye, Settings2, FileText, Truck, Search as SearchIcon,
} from "lucide-react";

/* ─── Collapsible Section ─── */
function Section({
  title, icon: Icon, children, defaultOpen = true, badge,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <motion.section
      layout="position"
      className="premium-card rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-5 py-3.5 text-left hover:bg-neutral-50/60 transition-colors"
      >
        <Icon size={15} className="text-neutral-400 shrink-0" />
        <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wider flex-1">
          {title}
        </span>
        {badge && (
          <span className="text-[10px] font-medium text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded-full mr-1">
            {badge}
          </span>
        )}
        <ChevronDown
          size={14}
          className={`text-neutral-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

/* ─── Main Component ─── */
export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isEdit = !!id;

  const dropdowns = useProductDropdowns();
  const { categories, subcategories, collections, brands, labels, sizeGuides } = dropdowns;

  const { data: productData, isLoading: productLoading, error: productError } = useProduct(id);

  const [form, setForm] = useState<ProductFormData>(buildDefaultForm);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [altTextInput, setAltTextInput] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<{
    url: string; publicId: string; variantId?: string;
  } | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [validationErrors, setValidationErrors] = useState<FormErrors>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const initialImageIdsRef = useRef<Set<string>>(new Set());
  const initialVariantIdsRef = useRef<Set<string>>(new Set());
  const initialVariantImageIdsRef = useRef<Map<string, Set<string>>>(new Map());
  const { dirty, setInitial, resetDirty } = useFormDirty(form, variants, images, selectedLabels);
  const handleSaveRef = useRef<(() => Promise<void>) | undefined>(undefined);

  /* ─── Initialize from product data ─── */
  useEffect(() => {
    if (!isEdit) {
      setForm(buildDefaultForm());
      setVariants([]);
      setImages([]);
      setSelectedLabels([]);
      initialImageIdsRef.current = new Set();
      initialVariantIdsRef.current = new Set();
      initialVariantImageIdsRef.current = new Map();
      setInitialized(true);
      resetDirty();
      return;
    }
    if (!productData || productLoading) return;

    const loadedForm = productToForm(productData);
    const loadedVariants = productToVariants(productData);
    const loadedImages = productToImages(productData);
    const loadedLabels = productToSelectedLabels(productData);

    setForm(loadedForm);
    setVariants(loadedVariants);
    setImages(loadedImages);
    setSelectedLabels(loadedLabels);

    initialImageIdsRef.current = new Set(
      loadedImages.filter((img) => img.id).map((img) => img.id!)
    );
    initialVariantIdsRef.current = new Set(
      loadedVariants.map((v) => v.id).filter((vId) => !vId.startsWith("new-"))
    );
    initialVariantImageIdsRef.current = new Map(
      loadedVariants.map((variant) => [
        variant.id,
        new Set((variant.images ?? []).filter((img) => img.id).map((img) => img.id!)),
      ])
    );

    setSlugManuallyEdited(false);
    setInitialized(true);
    requestAnimationFrame(() => {
      setInitial(loadedForm, loadedVariants, loadedImages, loadedLabels);
    });
  }, [isEdit, productData, productLoading, setInitial, resetDirty]);

  /* ─── beforeunload (no useBlocker — it causes crashes) ─── */
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  /* ─── Ctrl+S ─── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSaveRef.current?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const productLoadError = isEdit && !productLoading && productError;

  const filteredSubs = useMemo(
    () => subcategories.data?.filter((s) => !form.categoryId || s.categoryId === form.categoryId) ?? [],
    [subcategories.data, form.categoryId]
  );

  /* ─── Alt text handlers ─── */
  const confirmAltText = useCallback(() => {
    if (!pendingImage) return;
    const imgData = { url: pendingImage.url, publicId: pendingImage.publicId, altText: altTextInput ?? "", isPrimary: false, sortOrder: 0 };

    if (pendingImage.variantId) {
      const vIdx = variants.findIndex((v) => v.id === pendingImage.variantId);
      if (vIdx >= 0) {
        const updated = [...variants];
        const vImages = [...(updated[vIdx].images ?? [])];
        imgData.isPrimary = vImages.length === 0;
        imgData.sortOrder = vImages.length;
        vImages.push(imgData);
        updated[vIdx] = { ...updated[vIdx], images: vImages };
        setVariants(updated);
      }
    } else {
      setImages((prev) => {
        imgData.isPrimary = prev.length === 0;
        imgData.sortOrder = prev.length;
        return [...prev, imgData];
      });
    }
    setPendingImage(null);
    setAltTextInput(null);
  }, [pendingImage, altTextInput, variants]);

  const skipAltText = useCallback(() => {
    if (!pendingImage) return;
    const imgData = { url: pendingImage.url, publicId: pendingImage.publicId, altText: "", isPrimary: false, sortOrder: 0 };

    if (pendingImage.variantId) {
      const vIdx = variants.findIndex((v) => v.id === pendingImage.variantId);
      if (vIdx >= 0) {
        const updated = [...variants];
        const vImages = [...(updated[vIdx].images ?? [])];
        imgData.isPrimary = vImages.length === 0;
        imgData.sortOrder = vImages.length;
        vImages.push(imgData);
        updated[vIdx] = { ...updated[vIdx], images: vImages };
        setVariants(updated);
      }
    } else {
      setImages((prev) => {
        imgData.isPrimary = prev.length === 0;
        imgData.sortOrder = prev.length;
        return [...prev, imgData];
      });
    }
    setPendingImage(null);
    setAltTextInput(null);
  }, [pendingImage, variants]);

  /* ─── Save handler ─── */
  const handleSave = useCallback(async () => {
    const errors = validateProductForm(form);
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast("Please fix the validation errors", "error");
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      const data = { ...form };
      const optionalStringFields = [
        "categoryId", "subcategoryId", "collectionId", "brandId", "sizeGuideId",
        "sizeChartUrl", "material", "careInstructions", "metaTitle", "metaDesc",
        "scheduledPublishAt", "scheduledArchiveAt",
      ];
      for (const f of optionalStringFields) {
        if ((data as Record<string, unknown>)[f] === "")
          (data as Record<string, unknown>)[f] = null;
      }
      if (data.scheduledPublishAt) data.scheduledPublishAt = new Date(data.scheduledPublishAt).toISOString();
      if (data.scheduledArchiveAt) data.scheduledArchiveAt = new Date(data.scheduledArchiveAt).toISOString();

      let res: unknown;
      if (isEdit) {
        await adminApi.updateProduct(id!, data);
        await adminApi.assignLabels(id!, selectedLabels);
      } else {
        res = await adminApi.createProduct(data);
        const newId = (res as Record<string, { id: string }>).product?.id ?? (res as Record<string, string>).id;
        if (newId) await adminApi.assignLabels(newId, selectedLabels);
      }
      const productId = isEdit ? id! : (res as Record<string, { id: string }>).product?.id ?? (res as Record<string, string>).id;

      if (productId) {
        // Save variants
        let savedVariants: Record<string, unknown>[] = [];
        if (variants.length > 0) {
          const variantRes = await adminApi.updateProductVariants(
            productId,
            variants.map((v) => ({
              id: v.id?.startsWith("new-") ? undefined : v.id,
              sku: v.sku, size: v.size, color: v.color, colorHex: v.colorHex,
              priceAdjustment: v.priceAdjustment, stock: v.stock, weight: v.weight,
              isActive: v.isActive, videoUrl: v.videoUrl ?? null, videoPublicId: v.videoPublicId ?? null,
            }))
          );
          savedVariants = (variantRes as Record<string, unknown>)?.variants as Record<string, unknown>[] ?? [];
        }

        // Save variant images
        for (let i = 0; i < variants.length; i++) {
          const v = variants[i];
          const variantId = savedVariants[i]?.id as string | undefined;
          if (!variantId) continue;
          const variantImages = v.images ?? [];
          for (const img of variantImages) {
            if (!img.id) {
              // New image - add it
              await adminApi.addProductImage(productId, {
                url: img.url, publicId: img.publicId,
                altText: img.altText ?? "", isPrimary: false,
                variantId,
              });
            }
          }
        }

        // Delete removed images
        const currentImageIds = new Set(images.filter((img) => img.id).map((img) => img.id!));
        const deletedImageIds = [...initialImageIdsRef.current].filter((imgId) => !currentImageIds.has(imgId));
        if (deletedImageIds.length > 0) {
          await Promise.all(deletedImageIds.map((imgId) => adminApi.deleteProductImage(productId, imgId)));
        }

        // Delete removed variant images for variants that still exist.
        const deletedVariantImageIds = variants.flatMap((variant) => {
          const currentImageIds = new Set((variant.images ?? []).filter((img) => img.id).map((img) => img.id!));
          const initialImageIds = initialVariantImageIdsRef.current.get(variant.id) ?? new Set<string>();
          return [...initialImageIds].filter((imgId) => !currentImageIds.has(imgId));
        });
        if (deletedVariantImageIds.length > 0) {
          await Promise.all(deletedVariantImageIds.map((imgId) => adminApi.deleteProductImage(productId, imgId)));
        }

        // Add new product-level images
        const newImages = images.filter((img) => !img.id);
        if (newImages.length > 0) {
          await Promise.all(
            newImages.map((img, index) =>
              adminApi.addProductImage(productId, { url: img.url, publicId: img.publicId, altText: img.altText ?? "", isPrimary: index === 0 })
            )
          );
        }
      }

      // Invalidate ALL relevant caches
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "product", id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });

      resetDirty();
      toast(isEdit ? "Product updated" : "Product created", "success");
      navigate("/admin/products");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setSaveError(`Failed to save product: ${msg}`);
      toast("Failed to save product", "error");
    } finally {
      setSaving(false);
    }
  }, [form, id, isEdit, variants, images, selectedLabels, queryClient, navigate, toast, resetDirty]);

  handleSaveRef.current = handleSave;

  function handleDuplicate() {
    if (!id) return;
    adminApi.duplicateProduct(id)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
        toast("Product duplicated as draft", "success");
        navigate("/admin/products");
      })
      .catch(() => toast("Failed to duplicate product", "error"));
  }

  function handleBack() {
    if (dirty) {
      if (!window.confirm("You have unsaved changes. Leave without saving?")) return;
    }
    navigate("/admin/products");
  }

  function handleNameChange(name: string) {
    setForm({
      ...form,
      name,
      slug: slugManuallyEdited
        ? form.slug
        : name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    });
  }

  /* ─── Loading skeleton ─── */
  if (isEdit && productLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-neutral-100 rounded-lg" />
              <div>
                <div className="h-6 bg-neutral-100 rounded w-48 mb-1" />
                <div className="h-4 bg-neutral-100 rounded w-32" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-9 bg-neutral-100 rounded-lg w-24" />
              <div className="h-9 bg-neutral-100 rounded-lg w-32" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-white border border-neutral-100 rounded-xl p-6">
                <div className="h-4 bg-neutral-100 rounded w-32 mb-4" />
                <div className="space-y-3">
                  <div className="h-9 bg-neutral-50 rounded w-full" />
                  <div className="h-9 bg-neutral-50 rounded w-full" />
                  <div className="h-9 bg-neutral-50 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse bg-white border border-neutral-100 rounded-xl p-6">
                <div className="h-4 bg-neutral-100 rounded w-24 mb-4" />
                <div className="space-y-3">
                  <div className="h-9 bg-neutral-50 rounded w-full" />
                  <div className="h-9 bg-neutral-50 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ─── Error state ─── */
  if (productLoadError) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin/products")} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-display text-neutral-900">Edit Product</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <X className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-lg font-medium text-red-900">Failed to load product</h2>
          <p className="text-sm text-red-700 max-w-md mx-auto">
            {productError?.message || "The product could not be loaded. It may have been deleted or you may not have permission to view it."}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ["admin", "product", id] })}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => navigate("/admin/products")}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const inputCls = "w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors";
  const inputErrorCls = "w-full px-3 py-2 text-sm border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors";

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <ProductFormHeader
        isEdit={isEdit}
        productName={form.name}
        saving={saving}
        saveError={saveError}
        dirty={dirty}
        onBack={handleBack}
        onSave={handleSave}
        onDuplicate={isEdit ? handleDuplicate : undefined}
        onDismissError={() => setSaveError(null)}
      />

      <div className="grid grid-cols-3 gap-5">
        {/* ─── Main Content ─── */}
        <div className="col-span-2 space-y-4">
          <Section title="Basic Information" icon={FileText} defaultOpen badge={form.name ? undefined : "Required"}>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">Product Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={validationErrors.name ? inputErrorCls : inputCls}
                  placeholder="e.g., Classic Oxford Shirt"
                />
                {validationErrors.name && <p className="mt-1 text-xs text-red-600">{validationErrors.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">Slug</label>
                  <input
                    value={form.slug}
                    onChange={(e) => { setSlugManuallyEdited(true); setForm({ ...form, slug: e.target.value }); }}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">Gender</label>
                  <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className={inputCls}>
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">Short Description</label>
                <textarea
                  value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  rows={2}
                  className={inputCls}
                  placeholder="Brief product summary for listings..."
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">Full Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={5}
                  className={inputCls}
                  placeholder="Detailed product description with features, specifications..."
                />
              </div>
            </div>
          </Section>

          <Section title="Pricing" icon={Tag} defaultOpen badge={form.basePrice > 0 ? `₹${form.basePrice}` : "Required"}>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">Regular Price *</label>
                <input type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: parseFloat(e.target.value) || 0 })} className={validationErrors.basePrice ? inputErrorCls : inputCls} />
                {validationErrors.basePrice && <p className="mt-1 text-xs text-red-600">{validationErrors.basePrice}</p>}
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">Sale Price</label>
                <input type="number" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: parseFloat(e.target.value) || 0 })} className={inputCls} />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">Compare At</label>
                <input type="number" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: parseFloat(e.target.value) || 0 })} className={inputCls} />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">Cost Price</label>
                <input type="number" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: parseFloat(e.target.value) || 0 })} className={inputCls} />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">Discount %</label>
                <input type="number" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: parseFloat(e.target.value) || 0 })} className={inputCls} />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">Currency</label>
                <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className={inputCls}>
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
          </Section>

          <VariantManager
            variants={variants}
            onChange={setVariants}
            uploadingMedia={uploadingMedia}
            onUploadStart={() => setUploadingMedia(true)}
            onUploadEnd={() => setUploadingMedia(false)}
            onPendingImage={setPendingImage}
          />

          <MediaManager
            images={images}
            onChange={setImages}
            uploadingMedia={uploadingMedia}
            onUploadStart={() => setUploadingMedia(true)}
            onUploadEnd={() => setUploadingMedia(false)}
            onPendingImage={(data) => {
              if (data) {
                setPendingImage({ url: data.url, publicId: data.publicId, variantId: data.variantId });
                setAltTextInput("");
              }
            }}
          />
        </div>

        {/* ─── Sidebar ─── */}
        <div className="space-y-4">
          <Section title="Organization" icon={Settings2} defaultOpen>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">Category</label>
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value, subcategoryId: "" })} className={inputCls}>
                  <option value="">None</option>
                  {categories.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">Subcategory</label>
                <select value={form.subcategoryId} onChange={(e) => setForm({ ...form, subcategoryId: e.target.value })} className={inputCls}>
                  <option value="">None</option>
                  {filteredSubs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">Collection</label>
                <select value={form.collectionId} onChange={(e) => setForm({ ...form, collectionId: e.target.value })} className={inputCls}>
                  <option value="">None</option>
                  {collections.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">Brand</label>
                <select value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })} className={inputCls}>
                  <option value="">None</option>
                  {brands.data?.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">Size Guide</label>
                <select value={form.sizeGuideId} onChange={(e) => setForm({ ...form, sizeGuideId: e.target.value })} className={inputCls}>
                  <option value="">None</option>
                  {sizeGuides.data?.map((sg) => <option key={sg.id} value={sg.id}>{sg.name}</option>)}
                </select>
              </div>
            </div>
          </Section>

          <Section title="Visibility & Flags" icon={Eye} defaultOpen>
            <div className="space-y-3">
              {(["isActive", "isFeatured", "isNew"] as const).map((f) => (
                <label key={f} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form[f]}
                    onChange={(e) => setForm({ ...form, [f]: e.target.checked })}
                    className="rounded border-neutral-300"
                  />
                  <span className="text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors">
                    {f === "isActive" ? "Published" : f === "isFeatured" ? "Featured" : "New Arrival"}
                  </span>
                </label>
              ))}
              <div className="pt-2 border-t border-neutral-100">
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">Sort Order</label>
                <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className={inputCls} />
              </div>
            </div>
          </Section>

          <Section title="Labels" icon={Tag} defaultOpen={false} badge={selectedLabels.length > 0 ? `${selectedLabels.length}` : undefined}>
            <div className="flex flex-wrap gap-1.5">
              {labels.data?.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setSelectedLabels((prev) => prev.includes(l.id) ? prev.filter((id) => id !== l.id) : [...prev, l.id])}
                  className={`px-2.5 py-1 text-[11px] rounded-full border transition-all ${
                    selectedLabels.includes(l.id)
                      ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                      : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"
                  }`}
                  style={selectedLabels.includes(l.id) && l.color ? { backgroundColor: l.color, borderColor: l.color } : {}}
                >
                  {l.name}
                </button>
              ))}
              {(!labels.data || labels.data.length === 0) && (
                <p className="text-[11px] text-neutral-400">No labels available.</p>
              )}
            </div>
          </Section>

          <Section title="Details" icon={Truck} defaultOpen={false}>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">Material</label>
                <input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} className={inputCls} placeholder="e.g., 100% Organic Cotton" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">Care Instructions</label>
                <textarea value={form.careInstructions} onChange={(e) => setForm({ ...form, careInstructions: e.target.value })} rows={2} className={inputCls} />
              </div>
              <MediaPicker
                value={form.sizeChartUrl}
                onChange={(url: string, publicId?: string) => setForm({ ...form, sizeChartUrl: url, sizeChartPublicId: publicId ?? "" })}
                label="Size Chart URL"
                folder="size-guides"
                placeholder="URL to external size chart"
              />
            </div>
          </Section>

          <Section title="SEO" icon={SearchIcon} defaultOpen={false}>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">Meta Title</label>
                <input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">Meta Description</label>
                <textarea value={form.metaDesc} onChange={(e) => setForm({ ...form, metaDesc: e.target.value })} rows={2} className={inputCls} />
              </div>
            </div>
          </Section>

          <Section title="Scheduling" icon={Calendar} defaultOpen={false}>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">Schedule Publish</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input type="datetime-local" value={form.scheduledPublishAt} onChange={(e) => setForm({ ...form, scheduledPublishAt: e.target.value })} className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">Schedule Archive</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input type="datetime-local" value={form.scheduledArchiveAt} onChange={(e) => setForm({ ...form, scheduledArchiveAt: e.target.value })} className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
                </div>
              </div>
              <p className="text-[10px] text-neutral-400">Set future dates to automatically publish or unpublish this product.</p>
            </div>
          </Section>
        </div>
      </div>

      {/* Alt Text Modal */}
      <AnimatePresence>
        {pendingImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl"
            >
              <h3 className="font-medium text-sm text-neutral-900 mb-1">Image Alt Text</h3>
              <p className="text-xs text-neutral-500 mb-4">Optional — describe this image for accessibility and SEO.</p>
              <input
                value={altTextInput ?? ""}
                onChange={(e) => setAltTextInput(e.target.value)}
                placeholder="e.g., Blue cotton t-shirt front view"
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 mb-4"
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") confirmAltText(); if (e.key === "Escape") skipAltText(); }}
              />
              <div className="flex justify-end gap-2">
                <button onClick={skipAltText} className="px-4 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
                  Skip
                </button>
                <button onClick={confirmAltText} className="btn-primary">
                  Add Image
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
