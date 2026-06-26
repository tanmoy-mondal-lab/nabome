import { useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { MediaPicker } from "../common/MediaPicker";
import { Plus, Edit3, Trash2, Eye, EyeOff, Layout, ChevronUp, ChevronDown, GripVertical, ArrowUp, ArrowDown, Save } from "lucide-react";
import { useToast } from "../../components/ui/Toast";

interface HomeSection {
  id: string;
  sectionType: string;
  title: string;
  subtitle: string;
  sortOrder: number;
  isActive: boolean;
  content: Record<string, unknown>;
}

const SECTION_TYPES = [
  { value: "hero_slider", label: "Hero Slider" },
  { value: "product_grid", label: "Product Grid" },
  { value: "featured_collections", label: "Featured Collections" },
  { value: "brand_story", label: "Brand Story" },
  { value: "trust_bar", label: "Trust Bar" },
  { value: "newsletter", label: "Newsletter Signup" },
  { value: "testimonials", label: "Testimonials" },
  { value: "instagram_feed", label: "Instagram Feed" },
  { value: "banner_promo", label: "Banner Promo" },
  { value: "custom_html", label: "Custom HTML" },
];

const SECTION_COLORS: Record<string, string> = {
  hero_slider: "bg-amber-50 text-amber-700 border-amber-200",
  product_grid: "bg-blue-50 text-blue-700 border-blue-200",
  featured_collections: "bg-purple-50 text-purple-700 border-purple-200",
  brand_story: "bg-emerald-50 text-emerald-700 border-emerald-200",
  trust_bar: "bg-teal-50 text-teal-700 border-teal-200",
  newsletter: "bg-rose-50 text-rose-700 border-rose-200",
  testimonials: "bg-indigo-50 text-indigo-700 border-indigo-200",
  instagram_feed: "bg-pink-50 text-pink-700 border-pink-200",
  banner_promo: "bg-orange-50 text-orange-700 border-orange-200",
  custom_html: "bg-neutral-50 text-neutral-700 border-neutral-200",
};

interface FormState {
  sectionType: string;
  title: string;
  subtitle: string;
  isActive: boolean;
  content: string;
  productSource: string;
  productLimit: string;
  collectionLimit: string;
  brandHeadline: string;
  brandBody: string;
  brandImageUrl: string;
  brandImagePublicId: string;
  brandStat1Label: string;
  brandStat1Value: string;
  brandStat2Label: string;
  brandStat2Value: string;
  brandStat3Label: string;
  brandStat3Value: string;
  trustItem1Title: string;
  trustItem1Desc: string;
  trustItem2Title: string;
  trustItem2Desc: string;
  trustItem3Title: string;
  trustItem3Desc: string;
  trustItem4Title: string;
  trustItem4Desc: string;
  bannerImageUrl: string;
  bannerImagePublicId: string;
  bannerCtaText: string;
  bannerCtaUrl: string;
  htmlContent: string;
}

const defaultForm: FormState = {
  sectionType: "hero_slider", title: "", subtitle: "", isActive: true, content: "{}",
  productSource: "featured", productLimit: "8",
  collectionLimit: "3",
  brandHeadline: "", brandBody: "", brandImageUrl: "", brandImagePublicId: "",
  brandStat1Label: "", brandStat1Value: "", brandStat2Label: "", brandStat2Value: "", brandStat3Label: "", brandStat3Value: "",
  trustItem1Title: "Free Shipping", trustItem1Desc: "On orders above ₹999",
  trustItem2Title: "Easy Returns", trustItem2Desc: "30-day return policy",
  trustItem3Title: "Secure Payment", trustItem3Desc: "100% secure checkout",
  trustItem4Title: "Premium Service", trustItem4Desc: "Dedicated support",
  bannerImageUrl: "", bannerImagePublicId: "", bannerCtaText: "", bannerCtaUrl: "",
  htmlContent: "",
};

const inputClass = "w-full px-3 py-2.5 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400 transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export default function HomepageBuilder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<HomeSection | null>(null);
  const [form, setForm] = useState<FormState>({ ...defaultForm });

  const { data: sections = [], isLoading: loading, error: queryError } = useQuery<HomeSection[]>({
    queryKey: ["admin", "homepage"],
    queryFn: async () => {
      const res = await adminApi.getHomepageSections();
      return (res.sections as HomeSection[]) ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: { sectionType: string; title: string | null; subtitle: string | null; content: Record<string, unknown>; sortOrder: number; isActive: boolean }) => {
      if (editItem) {
        await adminApi.updateHomeSection(editItem.id, payload);
      } else {
        await adminApi.createHomeSection(payload);
      }
    },
    onSuccess: () => {
      toast(editItem ? "Section updated successfully" : "Section created successfully", "success");
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "homepage"] });
    },
    onError: (err: Error) => {
      toast(err.message || "Failed to save section", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminApi.deleteHomeSection(id);
    },
    onSuccess: () => {
      toast("Section deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["admin", "homepage"] });
    },
    onError: (err: Error) => {
      toast(err.message || "Failed to delete section", "error");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (sec: HomeSection) => {
      await adminApi.updateHomeSection(sec.id, { isActive: !sec.isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "homepage"] });
    },
    onError: (err: Error) => {
      toast(err.message || "Failed to toggle section", "error");
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (order: { id: string; sortOrder: number }[]) => {
      await adminApi.reorderHomeSections(order);
    },
    onError: () => {
      toast("Failed to reorder sections", "error");
      queryClient.invalidateQueries({ queryKey: ["admin", "homepage"] });
    },
  });

  const updateForm = (patch: Partial<FormState>) => setForm((prev) => ({ ...prev, ...patch }));

  const openCreate = () => {
    setEditItem(null);
    setForm({ ...defaultForm });
    setModalOpen(true);
  };

  const openEdit = (sec: HomeSection) => {
    setEditItem(sec);
    const c = (sec.content ?? {}) as Record<string, unknown>;
    const items = (c.items as Record<string, string>[] | undefined) ?? [];
    const stats = (c.stats as { label: string; value: string }[] | undefined) ?? [];
    setForm({
      sectionType: sec.sectionType,
      title: sec.title ?? "",
      subtitle: sec.subtitle ?? "",
      isActive: sec.isActive,
      content: JSON.stringify(sec.content ?? {}, null, 2),
      productSource: (c.source as string) ?? "featured",
      productLimit: (c.limit as string) ?? "8",
      collectionLimit: (c.limit as string) ?? "3",
      brandHeadline: (c.headline as string) ?? "",
      brandBody: (c.body as string) ?? "",
      brandImageUrl: (c.imageUrl as string) ?? "",
      brandImagePublicId: (c.imagePublicId as string) ?? "",
      brandStat1Label: (stats[0]?.label as string) ?? "",
      brandStat1Value: (stats[0]?.value as string) ?? "",
      brandStat2Label: (stats[1]?.label as string) ?? "",
      brandStat2Value: (stats[1]?.value as string) ?? "",
      brandStat3Label: (stats[2]?.label as string) ?? "",
      brandStat3Value: (stats[2]?.value as string) ?? "",
      trustItem1Title: (items[0]?.title as string) ?? "Free Shipping",
      trustItem1Desc: (items[0]?.description as string) ?? "On orders above ₹999",
      trustItem2Title: (items[1]?.title as string) ?? "Easy Returns",
      trustItem2Desc: (items[1]?.description as string) ?? "30-day return policy",
      trustItem3Title: (items[2]?.title as string) ?? "Secure Payment",
      trustItem3Desc: (items[2]?.description as string) ?? "100% secure checkout",
      trustItem4Title: (items[3]?.title as string) ?? "Premium Service",
      trustItem4Desc: (items[3]?.description as string) ?? "Dedicated support",
      bannerImageUrl: (c.imageUrl as string) ?? "",
      bannerImagePublicId: (c.imagePublicId as string) ?? "",
      bannerCtaText: (c.ctaText as string) ?? "",
      bannerCtaUrl: (c.ctaUrl as string) ?? "",
      htmlContent: (c.html as string) ?? "",
    });
    setModalOpen(true);
  };

  const buildContent = (): Record<string, unknown> => {
    switch (form.sectionType) {
      case "product_grid":
        return { source: form.productSource, limit: Number(form.productLimit) || 8 };
      case "featured_collections":
        return { limit: Number(form.collectionLimit) || 3 };
      case "brand_story":
        return {
          headline: form.brandHeadline || null,
          body: form.brandBody || null,
          imageUrl: form.brandImageUrl || null,
          imagePublicId: form.brandImagePublicId || undefined,
          stats: [
            { label: form.brandStat1Label || "Artisan Craftspeople", value: form.brandStat1Value || "200+" },
            { label: form.brandStat2Label || "Countries Served", value: form.brandStat2Value || "15+" },
            { label: form.brandStat3Label || "Customer Satisfaction", value: form.brandStat3Value || "98%" },
          ].filter((s) => s.label || s.value),
        };
      case "trust_bar":
        return {
          items: [
            { title: form.trustItem1Title, description: form.trustItem1Desc },
            { title: form.trustItem2Title, description: form.trustItem2Desc },
            { title: form.trustItem3Title, description: form.trustItem3Desc },
            { title: form.trustItem4Title, description: form.trustItem4Desc },
          ],
        };
      case "custom_html":
        return { html: form.htmlContent };
      case "banner_promo":
        return {
          imageUrl: form.bannerImageUrl || null,
          imagePublicId: form.bannerImagePublicId || undefined,
          ctaText: form.bannerCtaText || null,
          ctaUrl: form.bannerCtaUrl || null,
        };
      default:
        try { return JSON.parse(form.content || "{}"); }
        catch { return {}; }
    }
  };

  const handleSave = () => {
    const content = buildContent();
    const payload = {
      sectionType: form.sectionType,
      title: form.title || null,
      subtitle: form.subtitle || null,
      content,
      sortOrder: editItem?.sortOrder ?? sections.length,
      isActive: form.isActive,
    };
    saveMutation.mutate(payload);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const toggleActive = (sec: HomeSection) => {
    toggleMutation.mutate(sec);
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const reordered = [...sections];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);

    // Optimistic update via queryClient.setQueryData
    queryClient.setQueryData<HomeSection[]>(["admin", "homepage"], reordered);

    const order = reordered.map((s, i) => ({ id: s.id, sortOrder: i }));
    reorderMutation.mutate(order);
  };

  const typeLabel = (type: string) => SECTION_TYPES.find((t) => t.value === type)?.label ?? type;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display text-neutral-900">Homepage Builder</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {sections.length} sections · Drag to reorder
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 text-[11px] font-medium tracking-[0.15em] uppercase hover:bg-neutral-800 transition-colors"
        >
          <Plus size={14} /> Add Section
        </button>
      </div>

      {queryError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{queryError.message}<button onClick={() => queryClient.invalidateQueries({ queryKey: ["admin", "homepage"] })} className="ml-2 text-red-500 hover:text-red-700">×</button></div>}

      {sections.length === 0 ? (
        <div className="bg-white border border-neutral-200">
          <EmptyState icon={Layout} title="No sections yet" description="Build your homepage by adding sections"
            action={<button onClick={openCreate} className="bg-neutral-900 text-white px-5 py-2.5 text-[11px] font-medium tracking-[0.15em] uppercase hover:bg-neutral-800 transition-colors">Add Section</button>}
          />
        </div>
      ) : (
        <div className="space-y-2">
          {sections.map((sec, i) => (
            <div
              key={sec.id}
              className={`bg-white border transition-all duration-200 ${
                !sec.isActive ? "opacity-50 border-dashed" : "border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="flex flex-col items-center gap-0.5 shrink-0">
                  <button
                    onClick={() => moveSection(i, "up")}
                    disabled={i === 0 || reorderMutation.isPending}
                    className="p-1 text-neutral-300 hover:text-neutral-700 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    aria-label="Move up"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <span className="text-[10px] font-mono text-neutral-400 w-5 text-center">{i + 1}</span>
                  <button
                    onClick={() => moveSection(i, "down")}
                    disabled={i === sections.length - 1 || reorderMutation.isPending}
                    className="p-1 text-neutral-300 hover:text-neutral-700 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    aria-label="Move down"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>

                <div className="w-px h-10 bg-neutral-100 shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-medium text-neutral-900 truncate">
                      {sec.title || typeLabel(sec.sectionType)}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium tracking-[0.1em] uppercase border ${SECTION_COLORS[sec.sectionType] || "bg-neutral-50 text-neutral-500 border-neutral-200"}`}>
                      {typeLabel(sec.sectionType)}
                    </span>
                  </div>
                  {sec.subtitle && (
                    <p className="text-xs text-neutral-400 mt-0.5 truncate">{sec.subtitle}</p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleActive(sec)}
                    className={`p-2 rounded transition-colors ${sec.isActive ? "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100" : "text-neutral-300 hover:text-amber-600 hover:bg-amber-50"}`}
                    title={sec.isActive ? "Hide section" : "Show section"}
                  >
                    {sec.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button
                    onClick={() => openEdit(sec)}
                    className="p-2 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                    title="Edit section"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(sec.id)}
                    className="p-2 rounded text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete section"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Section" : "New Section"}>
        <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          <Field label="Section Type">
            <select value={form.sectionType}
              onChange={(e) => updateForm({ sectionType: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400 transition-colors">
              {SECTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>

          <div className="grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Title">
              <input value={form.title} onChange={(e) => updateForm({ title: e.target.value })} className={inputClass} placeholder="Section title" />
            </Field>
            <Field label="Subtitle">
              <input value={form.subtitle} onChange={(e) => updateForm({ subtitle: e.target.value })} className={inputClass} placeholder="Optional subtitle" />
            </Field>
          </div>

          {form.sectionType === "product_grid" && (
            <div className="grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Product Source">
                <select value={form.productSource} onChange={(e) => updateForm({ productSource: e.target.value })} className="w-full px-3 py-2.5 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400 transition-colors">
                  <option value="featured">Featured Products</option>
                  <option value="new">New Arrivals</option>
                </select>
              </Field>
              <Field label="Product Limit">
                <input type="number" min={1} max={50} value={form.productLimit}
                  onChange={(e) => updateForm({ productLimit: e.target.value })} className={inputClass} />
              </Field>
            </div>
          )}

          {form.sectionType === "featured_collections" && (
            <Field label="Collection Limit">
              <input type="number" min={1} max={20} value={form.collectionLimit}
                onChange={(e) => updateForm({ collectionLimit: e.target.value })} className={inputClass} />
            </Field>
          )}

          {form.sectionType === "brand_story" && (
            <>
              <Field label="Headline">
                <input value={form.brandHeadline} onChange={(e) => updateForm({ brandHeadline: e.target.value })} className={inputClass} placeholder="Brand story headline" />
              </Field>
              <Field label="Body Text">
                <textarea rows={4} value={form.brandBody} onChange={(e) => updateForm({ brandBody: e.target.value })} className={inputClass} placeholder="Tell your brand story..." />
              </Field>
              <Field label="Image URL">
                <MediaPicker value={form.brandImageUrl} onChange={(url: string, publicId?: string) => updateForm({ brandImageUrl: url, brandImagePublicId: publicId ?? "" })} folder="brand-story" />
              </Field>
              <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500 mt-2">Statistics</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Stat 1 Label"><input value={form.brandStat1Label} onChange={(e) => updateForm({ brandStat1Label: e.target.value })} className={inputClass} placeholder="e.g. Artisans" /></Field>
                <Field label="Stat 1 Value"><input value={form.brandStat1Value} onChange={(e) => updateForm({ brandStat1Value: e.target.value })} className={inputClass} placeholder="e.g. 200+" /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Stat 2 Label"><input value={form.brandStat2Label} onChange={(e) => updateForm({ brandStat2Label: e.target.value })} className={inputClass} placeholder="e.g. Countries" /></Field>
                <Field label="Stat 2 Value"><input value={form.brandStat2Value} onChange={(e) => updateForm({ brandStat2Value: e.target.value })} className={inputClass} placeholder="e.g. 15+" /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Stat 3 Label"><input value={form.brandStat3Label} onChange={(e) => updateForm({ brandStat3Label: e.target.value })} className={inputClass} placeholder="e.g. Satisfaction" /></Field>
                <Field label="Stat 3 Value"><input value={form.brandStat3Value} onChange={(e) => updateForm({ brandStat3Value: e.target.value })} className={inputClass} placeholder="e.g. 98%" /></Field>
              </div>
            </>
          )}

          {form.sectionType === "trust_bar" && (
            <>
              <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500">Trust Items</p>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border border-neutral-100 p-3 space-y-2">
                  <p className="text-[10px] text-neutral-400 uppercase tracking-[0.15em] font-medium">Item {i}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Title">
                      <input value={i === 1 ? form.trustItem1Title : i === 2 ? form.trustItem2Title : i === 3 ? form.trustItem3Title : form.trustItem4Title}
                        onChange={(e) => {
                          const key = `trustItem${i}Title` as const;
                          updateForm({ [key]: e.target.value });
                        }} className={inputClass} />
                    </Field>
                    <Field label="Description">
                      <input value={i === 1 ? form.trustItem1Desc : i === 2 ? form.trustItem2Desc : i === 3 ? form.trustItem3Desc : form.trustItem4Desc}
                        onChange={(e) => {
                          const key = `trustItem${i}Desc` as const;
                          updateForm({ [key]: e.target.value });
                        }} className={inputClass} />
                    </Field>
                  </div>
                </div>
              ))}
            </>
          )}

          {form.sectionType === "banner_promo" && (
            <>
              <Field label="Image URL">
                <MediaPicker value={form.bannerImageUrl} onChange={(url: string, publicId?: string) => updateForm({ bannerImageUrl: url, bannerImagePublicId: publicId ?? "" })} folder="banners" />
              </Field>
              <div className="grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="CTA Text">
                  <input value={form.bannerCtaText} onChange={(e) => updateForm({ bannerCtaText: e.target.value })} className={inputClass} placeholder="Shop Now" />
                </Field>
                <Field label="CTA URL">
                  <input value={form.bannerCtaUrl} onChange={(e) => updateForm({ bannerCtaUrl: e.target.value })} className={inputClass} placeholder="/products" />
                </Field>
              </div>
            </>
          )}

          {form.sectionType === "custom_html" && (
            <Field label="HTML Content">
              <textarea rows={8} value={form.htmlContent} onChange={(e) => updateForm({ htmlContent: e.target.value })} className={`${inputClass} font-mono text-xs`} placeholder="<div>...</div>" />
            </Field>
          )}

          {(form.sectionType === "hero_slider" || form.sectionType === "testimonials" || form.sectionType === "instagram_feed") && (
            <Field label="Config (JSON)">
              <textarea rows={6} value={form.content} onChange={(e) => updateForm({ content: e.target.value })}
                className={`${inputClass} font-mono text-xs`} />
            </Field>
          )}

          <label className="flex items-center gap-2.5 cursor-pointer py-2">
            <input type="checkbox" checked={form.isActive}
              onChange={(e) => updateForm({ isActive: e.target.checked })}
              className="w-4 h-4 accent-brand-500 rounded" />
            <span className="text-sm text-neutral-700">Active — visible on homepage</span>
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
            <button onClick={() => setModalOpen(false)}
              className="px-5 py-2.5 text-[11px] font-medium tracking-[0.15em] uppercase text-neutral-500 hover:text-neutral-900 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saveMutation.isPending}
              className="bg-neutral-900 text-white px-6 py-2.5 text-[11px] font-medium tracking-[0.15em] uppercase hover:bg-neutral-800 transition-colors disabled:opacity-40 flex items-center gap-2">
              {saveMutation.isPending && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editItem ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
