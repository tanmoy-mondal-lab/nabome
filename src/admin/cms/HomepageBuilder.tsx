import { useState, useCallback, useMemo } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, useSortable, verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { MediaPicker } from "../common/MediaPicker";
import { Link } from "react-router-dom";
import {
  Plus, Edit3, Trash2, Eye, EyeOff, Layout, GripVertical, Copy, Search,
  Volume2, VolumeX, Film, Star, ChevronUp, ChevronDown, ChevronRight, ArrowLeft,
} from "lucide-react";
import { useToast } from "../../components/ui/Toast";
import { normalizeHeroSlides } from "../../cms/core/hero-slides";

// ─── Types ───

interface HomeSection {
  id: string;
  sectionType: string;
  title: string;
  subtitle: string;
  sortOrder: number;
  isActive: boolean;
  visibility: string;
  content: Record<string, unknown>;
}

interface HeroSlide {
  id: string;
  videoUrl: string;
  posterUrl: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaUrl: string;
  soundEnabled: boolean;
}

interface TestimonialItem {
  name: string;
  role: string;
  content: string;
  avatar: string;
  rating: number;
}

interface TrustItem {
  title: string;
  description: string;
}

interface FormState {
  sectionType: string;
  title: string;
  subtitle: string;
  isActive: boolean;
  visibility: string;
  productSourceType: string;
  productSourceValue: string;
  productSourceLabel: string;
  productLimit: number;
  productViewAllUrl: string;
  collectionLimit: number;
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
  trustItems: TrustItem[];
  bannerImageUrl: string;
  bannerImagePublicId: string;
  bannerCtaText: string;
  bannerCtaUrl: string;
  htmlContent: string;
  heroSlides: HeroSlide[];
  heroInterval: number;
  testimonialItems: TestimonialItem[];
  instagramHeading: string;
  instagramAccessToken: string;
  instagramLimit: number;
  instagramLayout: string;
  newArrivalsLimit: number;
  categoryColumns: number;
  publishAt: string;
  expireAt: string;
  bgColor: string;
  textColor: string;
  paddingTop: string;
  paddingBottom: string;
  maxWidth: string;
  animationStyle: string;
}

interface FormErrors {
  [key: string]: string;
}

// ─── Constants ───

const SECTION_TYPES = [
  { value: "hero_slider", label: "Hero Slider" },
  { value: "product_grid", label: "Product Grid" },
  { value: "featured_collections", label: "Featured Collections" },
  { value: "new_arrivals", label: "New Arrivals" },
  { value: "categories_grid", label: "Categories Grid" },
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
  new_arrivals: "bg-cyan-50 text-cyan-700 border-cyan-200",
  categories_grid: "bg-violet-50 text-violet-700 border-violet-200",
  brand_story: "bg-emerald-50 text-emerald-700 border-emerald-200",
  trust_bar: "bg-teal-50 text-teal-700 border-teal-200",
  newsletter: "bg-rose-50 text-rose-700 border-rose-200",
  testimonials: "bg-indigo-50 text-indigo-700 border-indigo-200",
  instagram_feed: "bg-pink-50 text-pink-700 border-pink-200",
  banner_promo: "bg-orange-50 text-orange-700 border-orange-200",
  custom_html: "bg-neutral-50 text-neutral-700 border-neutral-200",
};

const defaultForm: FormState = {
  sectionType: "hero_slider", title: "", subtitle: "", isActive: true, visibility: "all",
  productSourceType: "featured", productSourceValue: "", productSourceLabel: "", productLimit: 8, productViewAllUrl: "",
  collectionLimit: 3,
  brandHeadline: "", brandBody: "", brandImageUrl: "", brandImagePublicId: "",
  brandStat1Label: "", brandStat1Value: "", brandStat2Label: "", brandStat2Value: "",
  brandStat3Label: "", brandStat3Value: "",
  trustItems: [
    { title: "Free Shipping", description: "On orders above ₹999" },
    { title: "Easy Returns", description: "30-day return policy" },
    { title: "Secure Payment", description: "100% secure checkout" },
    { title: "Premium Service", description: "Dedicated support" },
  ],
  bannerImageUrl: "", bannerImagePublicId: "", bannerCtaText: "", bannerCtaUrl: "",
  htmlContent: "",
  heroSlides: [], heroInterval: 7000,
  testimonialItems: [],
  instagramHeading: "", instagramAccessToken: "", instagramLimit: 12, instagramLayout: "grid",
  newArrivalsLimit: 8,
  categoryColumns: 4,
  publishAt: "",
  expireAt: "",
  bgColor: "",
  textColor: "",
  paddingTop: "",
  paddingBottom: "",
  maxWidth: "",
  animationStyle: "none",
};

const inputClass = "w-full px-3 py-2.5 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400 transition-colors";

// ─── Sub-components ───

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500 mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function SortableSectionCard({
  section, index, isLast, isReordering,
  onEdit, onToggle, onDuplicate, onDelete,
}: {
  section: HomeSection; index: number; isLast: boolean; isReordering: boolean;
  onEdit: () => void; onToggle: () => void; onDuplicate: () => void; onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const typeLabel = (type: string) => SECTION_TYPES.find((t) => t.value === type)?.label ?? type;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border transition-all duration-200 ${
        isDragging ? "z-50 shadow-xl border-brand-400 ring-2 ring-brand-200" : ""
      } ${!section.isActive ? "opacity-50 border-dashed" : "border-neutral-200 hover:border-neutral-300"}`}
    >
      <div className="flex items-center gap-4 px-5 py-4">
        <button
          {...attributes}
          {...listeners}
          className="flex flex-col items-center gap-0.5 shrink-0 cursor-grab active:cursor-grabbing text-neutral-300 hover:text-neutral-600 transition-colors touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical size={16} />
        </button>

        <div className="w-px h-10 bg-neutral-100 shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium text-neutral-900 truncate">
              {section.title || typeLabel(section.sectionType)}
            </h3>
            <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium tracking-[0.1em] uppercase border ${SECTION_COLORS[section.sectionType] || "bg-neutral-50 text-neutral-500 border-neutral-200"}`}>
              {typeLabel(section.sectionType)}
            </span>
          </div>
          {section.subtitle && (
            <p className="text-xs text-neutral-400 mt-0.5 truncate">{section.subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onToggle}
            className={`p-2 rounded transition-colors ${section.isActive ? "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100" : "text-neutral-300 hover:text-amber-600 hover:bg-amber-50"}`}
            title={section.isActive ? "Hide section" : "Show section"}
          >
            {section.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button
            onClick={onDuplicate}
            className="p-2 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            title="Duplicate section"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={onEdit}
            className="p-2 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            title="Edit section"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Delete section"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function HeroSlideEditor({
  slides, interval, onChangeSlides, onChangeInterval,
}: {
  slides: HeroSlide[]; interval: number;
  onChangeSlides: (slides: HeroSlide[]) => void;
  onChangeInterval: (interval: number) => void;
}) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const addSlide = () => {
    const slide: HeroSlide = {
      id: crypto.randomUUID(), videoUrl: "", posterUrl: "", title: "",
      subtitle: "", ctaText: "Shop Now", ctaUrl: "/products", soundEnabled: true,
    };
    onChangeSlides([...slides, slide]);
    setEditingIdx(slides.length);
  };

  const updateSlide = (idx: number, patch: Partial<HeroSlide>) => {
    const updated = slides.map((s, i) => (i === idx ? { ...s, ...patch } : s));
    onChangeSlides(updated);
  };

  const removeSlide = (idx: number) => {
    onChangeSlides(slides.filter((_, i) => i !== idx));
    setEditingIdx(null);
  };

  const moveSlide = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= slides.length) return;
    const updated = [...slides];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    onChangeSlides(updated);
    if (editingIdx === idx) setEditingIdx(newIdx);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500">
          {slides.length} slide{slides.length !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-neutral-400">Interval (ms):</span>
            <input type="number" min={1000} max={30000} step={500} value={interval}
              onChange={(e) => onChangeInterval(Number(e.target.value))}
              className="w-20 px-2 py-1.5 text-xs border border-neutral-200 focus:outline-none focus:border-neutral-400" />
          </div>
          <button onClick={addSlide}
            className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.1em] bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
            <Plus size={12} /> Add Slide
          </button>
        </div>
      </div>

      {slides.length === 0 ? (
        <div className="text-center py-6 bg-neutral-50 border border-dashed border-neutral-200">
          <Film size={24} className="mx-auto text-neutral-300 mb-2" />
          <p className="text-xs text-neutral-400">No slides yet. Add a video or image slide.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {slides.map((slide, i) => (
            <div key={slide.id} className="border border-neutral-200">
              <div className="flex items-center gap-3 px-3 py-2 bg-neutral-50 border-b border-neutral-100">
                <div className="flex items-center gap-0.5">
                  <button onClick={() => moveSlide(i, -1)} disabled={i === 0}
                    className="p-0.5 text-neutral-300 hover:text-neutral-600 disabled:opacity-20"><ChevronUp size={12} /></button>
                  <button onClick={() => moveSlide(i, 1)} disabled={i === slides.length - 1}
                    className="p-0.5 text-neutral-300 hover:text-neutral-600 disabled:opacity-20"><ChevronDown size={12} /></button>
                </div>
                <span className="text-[10px] font-mono text-neutral-400 w-6">#{i + 1}</span>
                {slide.videoUrl ? <Film size={12} className="text-neutral-400" /> : null}
                <span className="text-xs text-neutral-700 truncate flex-1">{slide.title || "Untitled"}</span>
                {slide.soundEnabled ? <Volume2 size={10} className="text-neutral-400" /> : <VolumeX size={10} className="text-neutral-300" />}
                {editingIdx === i ? (
                  <button onClick={() => setEditingIdx(null)}
                    className="text-[10px] text-neutral-500 hover:text-neutral-700 uppercase tracking-wider">Done</button>
                ) : (
                  <button onClick={() => setEditingIdx(i)}
                    className="text-[10px] text-brand-600 hover:text-brand-700 uppercase tracking-wider">Edit</button>
                )}
                <button onClick={() => removeSlide(i)}
                  className="text-[10px] text-red-400 hover:text-red-600 uppercase tracking-wider">Remove</button>
              </div>
              {editingIdx === i && (
                <div className="p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Title">
                      <input value={slide.title} onChange={(e) => updateSlide(i, { title: e.target.value })}
                        placeholder="Summer Collection" className={inputClass} />
                    </Field>
                    <Field label="Subtitle">
                      <input value={slide.subtitle} onChange={(e) => updateSlide(i, { subtitle: e.target.value })}
                        placeholder="Discover the new arrivals" className={inputClass} />
                    </Field>
                  </div>
                  <Field label="Video URL">
                    <input value={slide.videoUrl} onChange={(e) => updateSlide(i, { videoUrl: e.target.value })}
                      placeholder="https://res.cloudinary.com/…/video.mp4" className={inputClass} />
                  </Field>
                  <Field label="Poster Image URL">
                    <div className="flex gap-2">
                      <input value={slide.posterUrl} onChange={(e) => updateSlide(i, { posterUrl: e.target.value })}
                        placeholder="Fallback image URL" className="flex-1 px-3 py-2.5 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400" />
                      {slide.posterUrl && (
                        <img
                          src={slide.posterUrl}
                          alt=""
                          aria-hidden="true"
                          role="presentation"
                          className="w-10 h-10 object-cover border border-neutral-200 shrink-0"
                        />
                      )}
                    </div>
                  </Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="CTA Text">
                      <input value={slide.ctaText} onChange={(e) => updateSlide(i, { ctaText: e.target.value })}
                        placeholder="Shop Now" className={inputClass} />
                    </Field>
                    <Field label="CTA URL">
                      <input value={slide.ctaUrl} onChange={(e) => updateSlide(i, { ctaUrl: e.target.value })}
                        placeholder="/collections/summer" className={inputClass} />
                    </Field>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={slide.soundEnabled}
                      onChange={(e) => updateSlide(i, { soundEnabled: e.target.checked })}
                      className="w-4 h-4 accent-brand-500 rounded" />
                    <span className="text-xs text-neutral-600">Enable sound by default</span>
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TestimonialEditor({
  items, onChange,
}: {
  items: TestimonialItem[];
  onChange: (items: TestimonialItem[]) => void;
}) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const addItem = () => {
    const item: TestimonialItem = { name: "", role: "", content: "", avatar: "", rating: 5 };
    onChange([...items, item]);
    setEditingIdx(items.length);
  };

  const updateItem = (idx: number, patch: Partial<TestimonialItem>) => {
    onChange(items.map((t, i) => (i === idx ? { ...t, ...patch } : t)));
  };

  const removeItem = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
    if (editingIdx === idx) setEditingIdx(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500">
          {items.length} testimonial{items.length !== 1 ? "s" : ""}
        </span>
        <button onClick={addItem}
          className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.1em] bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
          <Plus size={12} /> Add Testimonial
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="border border-neutral-200">
          <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50 border-b border-neutral-100">
            <Star size={10} className="text-amber-400" />
            <span className="text-xs text-neutral-700 flex-1 truncate">{item.name || "Unnamed"}</span>
            {editingIdx === i ? (
              <button onClick={() => setEditingIdx(null)}
                className="text-[10px] text-neutral-500 hover:text-neutral-700 uppercase">Done</button>
            ) : (
              <button onClick={() => setEditingIdx(i)}
                className="text-[10px] text-brand-600 hover:text-brand-700 uppercase">Edit</button>
            )}
            <button onClick={() => removeItem(i)}
              className="text-[10px] text-red-400 hover:text-red-600 uppercase">Remove</button>
          </div>
          {editingIdx === i && (
            <div className="p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Field label="Name">
                  <input value={item.name} onChange={(e) => updateItem(i, { name: e.target.value })}
                    placeholder="Customer name" className={inputClass} />
                </Field>
                <Field label="Role">
                  <input value={item.role} onChange={(e) => updateItem(i, { role: e.target.value })}
                    placeholder="e.g. Verified Buyer" className={inputClass} />
                </Field>
              </div>
              <Field label="Review">
                <textarea rows={3} value={item.content} onChange={(e) => updateItem(i, { content: e.target.value })}
                  placeholder="What they said…" className={inputClass} />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Avatar URL">
                  <input value={item.avatar} onChange={(e) => updateItem(i, { avatar: e.target.value })}
                    placeholder="Image URL" className={inputClass} />
                </Field>
                <Field label="Rating">
                  <select value={item.rating} onChange={(e) => updateItem(i, { rating: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400">
                    {[1, 2, 3, 4, 5].map((r) => <option key={r} value={r}>{r} Star{r > 1 ? "s" : ""}</option>)}
                  </select>
                </Field>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Product Grid Source Selector ───

function ProductGridFields({
  sourceType, sourceValue, sourceLabel, limit, viewAllUrl, errors,
  onUpdate,
}: {
  sourceType: string; sourceValue: string; sourceLabel: string;
  limit: number; viewAllUrl: string; errors: FormErrors;
  onUpdate: (patch: Partial<FormState>) => void;
}) {
  const { data: catRes } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => { const r = await adminApi.getCategories(); return (r as any).categories ?? []; },
    staleTime: 1000 * 60 * 10,
  });
  const { data: colRes } = useQuery({
    queryKey: ["admin", "collections"],
    queryFn: async () => { const r = await adminApi.getCollections(); return (r as any).collections ?? []; },
    staleTime: 1000 * 60 * 10,
  });
  const { data: labelRes } = useQuery({
    queryKey: ["admin", "labels"],
    queryFn: async () => { const r = await adminApi.getLabels(); return (r as any).labels ?? []; },
    staleTime: 1000 * 60 * 10,
  });
  const { data: tagRes } = useQuery({
    queryKey: ["admin", "tags"],
    queryFn: async () => { const r = await adminApi.getTags(); return (r as any).tags ?? []; },
    staleTime: 1000 * 60 * 10,
  });
  const { data: brandRes } = useQuery({
    queryKey: ["admin", "brands"],
    queryFn: async () => { const r = await adminApi.getBrands(); return (r as any).brands ?? []; },
    staleTime: 1000 * 60 * 10,
  });

  const categories = Array.isArray(catRes) ? catRes : [];
  const collections = Array.isArray(colRes) ? colRes : [];
  const labels = Array.isArray(labelRes) ? labelRes : [];
  const tags = Array.isArray(tagRes) ? tagRes : [];
  const brands = Array.isArray(brandRes) ? brandRes : [];

  const needsValue = ["category", "collection", "label", "tag", "brand"].includes(sourceType);

  const renderSourceValueSelector = () => {
    switch (sourceType) {
      case "category":
        return (
          <Field label="Category">
            <select value={sourceValue} onChange={(e) => {
              const opt = categories.find((c: any) => c.slug === e.target.value);
              onUpdate({ productSourceValue: e.target.value, productSourceLabel: opt?.name ?? "" });
            }} className={inputClass}>
              <option value="">Select category…</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.slug}>
                  {c.name}{c._count?.products != null ? ` (${c._count.products})` : ""}
                </option>
              ))}
            </select>
          </Field>
        );
      case "collection":
        return (
          <Field label="Collection">
            <select value={sourceValue} onChange={(e) => {
              const opt = collections.find((c: any) => c.slug === e.target.value);
              onUpdate({ productSourceValue: e.target.value, productSourceLabel: opt?.name ?? "" });
            }} className={inputClass}>
              <option value="">Select collection…</option>
              {collections.map((c: any) => (
                <option key={c.id} value={c.slug}>
                  {c.name}{c._count?.products != null ? ` (${c._count.products})` : ""}
                </option>
              ))}
            </select>
          </Field>
        );
      case "label":
        return (
          <Field label="Label">
            <select value={sourceValue} onChange={(e) => {
              const opt = labels.find((l: any) => l.slug === e.target.value);
              onUpdate({ productSourceValue: e.target.value, productSourceLabel: opt?.name ?? "" });
            }} className={inputClass}>
              <option value="">Select label…</option>
              {labels.map((l: any) => (
                <option key={l.id} value={l.slug}>
                  {l.name}{l._count?.products != null ? ` (${l._count.products})` : ""}
                </option>
              ))}
            </select>
          </Field>
        );
      case "tag":
        return (
          <Field label="Tag">
            <select value={sourceValue} onChange={(e) => {
              const opt = tags.find((t: any) => t.slug === e.target.value);
              onUpdate({ productSourceValue: e.target.value, productSourceLabel: opt?.name ?? "" });
            }} className={inputClass}>
              <option value="">Select tag…</option>
              {tags.map((t: any) => (
                <option key={t.id} value={t.slug}>
                  {t.name}{t._count?.products != null ? ` (${t._count.products})` : ""}
                </option>
              ))}
            </select>
          </Field>
        );
      case "brand":
        return (
          <Field label="Brand">
            <select value={sourceValue} onChange={(e) => {
              const opt = brands.find((b: any) => b.slug === e.target.value);
              onUpdate({ productSourceValue: e.target.value, productSourceLabel: opt?.name ?? "" });
            }} className={inputClass}>
              <option value="">Select brand…</option>
              {brands.map((b: any) => (
                <option key={b.id} value={b.slug}>
                  {b.name}{b._count?.products != null ? ` (${b._count.products})` : ""}
                </option>
              ))}
            </select>
          </Field>
        );
      case "custom":
        return (
          <Field label="API Params (JSON)">
            <input value={sourceValue} onChange={(e) => onUpdate({ productSourceValue: e.target.value })}
              placeholder='{"gender":"women","minPrice":1000}' className={`${inputClass} font-mono text-xs`} />
          </Field>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Source Type">
          <select value={sourceType} onChange={(e) => {
            onUpdate({ productSourceType: e.target.value, productSourceValue: "", productSourceLabel: "" });
          }} className={inputClass}>
            <option value="featured">Featured Products</option>
            <option value="new_arrivals">New Arrivals</option>
            <option value="category">By Category</option>
            <option value="collection">By Collection</option>
            <option value="label">By Label</option>
            <option value="tag">By Tag</option>
            <option value="brand">By Brand</option>
            <option value="custom">Custom Params</option>
          </select>
        </Field>
        <Field label="Product Limit" error={errors.productLimit}>
          <input type="number" min={1} max={50} value={limit}
            onChange={(e) => onUpdate({ productLimit: Math.min(50, Math.max(1, Number(e.target.value))) })}
            className={inputClass} />
        </Field>
      </div>

      {needsValue && renderSourceValueSelector()}

      <Field label="View All URL (optional)">
        <input value={viewAllUrl} onChange={(e) => onUpdate({ productViewAllUrl: e.target.value })}
          placeholder={sourceType === "collection" ? `/collections/${sourceValue || "{slug}"}` : `/products?${sourceType}=${sourceValue || "{slug}"}`}
          className={inputClass} />
      </Field>
    </div>
  );
}

// ─── Main Component ───

export default function HomepageBuilder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<HomeSection | null>(null);
  const [form, setForm] = useState<FormState>({ ...defaultForm });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showScheduling, setShowScheduling] = useState(false);
  const [showStyles, setShowStyles] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const { data: sections = [], isLoading: loading, error: queryError } = useQuery<HomeSection[]>({
    queryKey: ["admin", "homepage"],
    queryFn: async () => {
      const res = await adminApi.getHomepageSections();
      return (res.sections as HomeSection[]) ?? [];
    },
  });

  const filteredSections = useMemo(() => {
    if (!searchQuery) return sections;
    const q = searchQuery.toLowerCase();
    return sections.filter((s) => {
      const label = SECTION_TYPES.find((t) => t.value === s.sectionType)?.label ?? "";
      return s.title?.toLowerCase().includes(q) || label.toLowerCase().includes(q) || s.sectionType.includes(q);
    });
  }, [sections, searchQuery]);

  const saveMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      if (editItem) {
        await adminApi.updateHomeSection(editItem.id, payload);
      } else {
        await adminApi.createHomeSection(payload);
      }
    },
    onSuccess: () => {
      const wasEditing = !!editItem;
      toast(wasEditing ? "Section updated successfully" : "Section created successfully", "success");
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
      setDeleteConfirm(null);
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

  const duplicateMutation = useMutation({
    mutationFn: async (sec: HomeSection) => {
      const payload = {
        sectionType: sec.sectionType,
        title: sec.title || null,
        subtitle: sec.subtitle || null,
        content: sec.content,
        sortOrder: sections.length,
        isActive: sec.isActive,
        visibility: sec.visibility || "all",
      };
      await adminApi.createHomeSection(payload);
    },
    onSuccess: () => {
      toast("Section duplicated", "success");
      queryClient.invalidateQueries({ queryKey: ["admin", "homepage"] });
    },
    onError: (err: Error) => {
      toast(err.message || "Failed to duplicate section", "error");
    },
  });

  const updateForm = (patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setFormErrors({});
  };

  // ─── Validation ───

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!form.sectionType) errors.sectionType = "Section type is required";

    if (form.sectionType === "hero_slider") {
      form.heroSlides.forEach((slide, i) => {
        if (!slide.videoUrl && !slide.posterUrl) {
          errors[`heroSlides_${i}`] = "Slide needs at least a video or poster URL";
        }
      });
    }

    if (form.sectionType === "testimonials") {
      form.testimonialItems.forEach((item, i) => {
        if (!item.name && !item.content) errors[`testimonial_${i}`] = "Name or content required";
      });
    }

    if (form.sectionType === "brand_story" && !form.brandImageUrl) {
      errors.brandImageUrl = "Brand story image is recommended";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ─── Form → Content builders ───

  const buildContent = (): Record<string, unknown> => {
    switch (form.sectionType) {
      case "product_grid": {
        const result: Record<string, unknown> = {
          source: form.productSourceType,
          limit: form.productLimit || 8,
        };
        if (form.productSourceValue) result.sourceValue = form.productSourceValue;
        if (form.productSourceLabel) result.sourceLabel = form.productSourceLabel;
        if (form.productViewAllUrl) result.viewAllUrl = form.productViewAllUrl;
        return result;
      }
      case "featured_collections":
        return { limit: form.collectionLimit || 3 };
      case "new_arrivals":
        return { limit: form.newArrivalsLimit || 8 };
      case "categories_grid":
        return { columns: form.categoryColumns || 4 };
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
        return { items: form.trustItems };
      case "custom_html":
        return { html: form.htmlContent };
      case "banner_promo":
        return {
          imageUrl: form.bannerImageUrl || null,
          imagePublicId: form.bannerImagePublicId || undefined,
          ctaText: form.bannerCtaText || null,
          ctaUrl: form.bannerCtaUrl || null,
        };
      case "hero_slider":
        return { slides: form.heroSlides, interval: form.heroInterval };
      case "testimonials":
        return { items: form.testimonialItems };
      case "instagram_feed":
        return {
          heading: form.instagramHeading || null,
          accessToken: form.instagramAccessToken || null,
          limit: form.instagramLimit || 12,
          layout: form.instagramLayout || "grid",
        };
      default:
        return {};
    }
  };

  const openCreate = () => {
    setEditItem(null);
    setForm({ ...defaultForm, sectionType: sections.length === 0 ? "hero_slider" : "product_grid" });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (sec: HomeSection) => {
    setEditItem(sec);
    const c = (sec.content ?? {}) as Record<string, unknown>;
    const s = ((sec as any).styles ?? {}) as Record<string, string>;
    const items = (c.items as Record<string, string>[] | undefined) ?? [];
    const stats = (c.stats as { label: string; value: string }[] | undefined) ?? [];
    const slides = normalizeHeroSlides(c.slides, {
      title: sec.title,
      subtitle: sec.subtitle,
    });
    const testimonials = (c.items as TestimonialItem[] | undefined) ?? [];
    const heroSlides = sec.sectionType === "hero_slider" ? slides : [];
    const testimonialItems = sec.sectionType === "testimonials" ? testimonials : [];

    setForm({
      sectionType: sec.sectionType,
      title: sec.title ?? "",
      subtitle: sec.subtitle ?? "",
      isActive: sec.isActive,
      visibility: (sec.visibility as string) ?? "all",
      productSourceType: (c.source as string) ?? "featured",
      productSourceValue: (c.sourceValue as string) ?? "",
      productSourceLabel: (c.sourceLabel as string) ?? "",
      productLimit: (c.limit as number) ?? 8,
      productViewAllUrl: (c.viewAllUrl as string) ?? "",
      collectionLimit: (c.limit as number) ?? 3,
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
      trustItems: items.length > 0
        ? (items as unknown as TrustItem[])
        : defaultForm.trustItems,
      bannerImageUrl: (c.imageUrl as string) ?? "",
      bannerImagePublicId: (c.imagePublicId as string) ?? "",
      bannerCtaText: (c.ctaText as string) ?? "",
      bannerCtaUrl: (c.ctaUrl as string) ?? "",
      htmlContent: (c.html as string) ?? "",
      heroSlides,
      heroInterval: (c.interval as number) ?? 7000,
      testimonialItems,
      instagramHeading: (c.heading as string) ?? "",
      instagramAccessToken: (c.accessToken as string) ?? "",
      instagramLimit: (c.limit as number) ?? 12,
      instagramLayout: (c.layout as string) ?? "grid",
      newArrivalsLimit: (c.limit as number) ?? 8,
      categoryColumns: (c.columns as number) ?? 4,
      publishAt: (sec as any).publishAt ? String((sec as any).publishAt).slice(0, 16) : "",
      expireAt: (sec as any).expireAt ? String((sec as any).expireAt).slice(0, 16) : "",
      bgColor: (s?.bgColor as string) ?? "",
      textColor: (s?.textColor as string) ?? "",
      paddingTop: (s?.paddingTop as string) ?? "",
      paddingBottom: (s?.paddingBottom as string) ?? "",
      maxWidth: (s?.maxWidth as string) ?? "",
      animationStyle: (s?.animation as string) ?? "none",
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast("Please fix the form errors", "error");
      return;
    }
    const content = buildContent();
    const styles: Record<string, string> = {};
    if (form.bgColor) styles.bgColor = form.bgColor;
    if (form.textColor) styles.textColor = form.textColor;
    if (form.paddingTop) styles.paddingTop = form.paddingTop;
    if (form.paddingBottom) styles.paddingBottom = form.paddingBottom;
    if (form.maxWidth) styles.maxWidth = form.maxWidth;
    if (form.animationStyle && form.animationStyle !== "none") styles.animation = form.animationStyle;

    const payload: Record<string, unknown> = {
      sectionType: form.sectionType,
      title: form.title || null,
      subtitle: form.subtitle || null,
      content,
      sortOrder: editItem?.sortOrder ?? sections.length,
      isActive: form.isActive,
      visibility: form.visibility,
      publishAt: form.publishAt || null,
      expireAt: form.expireAt || null,
    };
    if (Object.keys(styles).length > 0) payload.styles = styles;
    saveMutation.mutate(payload as any);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (deleteConfirm) deleteMutation.mutate(deleteConfirm);
  };

  const toggleActive = (sec: HomeSection) => {
    toggleMutation.mutate(sec);
  };

  const handleDuplicate = (sec: HomeSection) => {
    duplicateMutation.mutate(sec);
  };

  // ─── DnD handlers ───

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(sections, oldIndex, newIndex);
    queryClient.setQueryData<HomeSection[]>(["admin", "homepage"], reordered);
    reorderMutation.mutate(reordered.map((s, i) => ({ id: s.id, sortOrder: i })));
  };

  // ─── Form field sets ───

  const renderTypeSpecificFields = () => {
    switch (form.sectionType) {
      case "product_grid":
        return (
          <ProductGridFields
            sourceType={form.productSourceType}
            sourceValue={form.productSourceValue}
            sourceLabel={form.productSourceLabel}
            limit={form.productLimit}
            viewAllUrl={form.productViewAllUrl}
            errors={formErrors}
            onUpdate={updateForm}
          />
        );

      case "featured_collections":
        return (
          <Field label="Collection Limit">
            <input type="number" min={1} max={20} value={form.collectionLimit}
              onChange={(e) => updateForm({ collectionLimit: Math.min(20, Math.max(1, Number(e.target.value))) })}
              className={inputClass} />
          </Field>
        );

      case "new_arrivals":
        return (
          <Field label="Product Limit">
            <input type="number" min={1} max={50} value={form.newArrivalsLimit}
              onChange={(e) => updateForm({ newArrivalsLimit: Math.min(50, Math.max(1, Number(e.target.value))) })}
              className={inputClass} />
          </Field>
        );

      case "categories_grid":
        return (
          <Field label="Columns">
            <select value={form.categoryColumns} onChange={(e) => updateForm({ categoryColumns: Number(e.target.value) })}
              className="w-full px-3 py-2.5 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400 transition-colors">
              {[2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} Columns</option>)}
            </select>
          </Field>
        );

      case "brand_story":
        return (
          <>
            <Field label="Headline">
              <input value={form.brandHeadline} onChange={(e) => updateForm({ brandHeadline: e.target.value })}
                placeholder="Brand story headline" className={inputClass} />
            </Field>
            <Field label="Body Text">
              <textarea rows={4} value={form.brandBody} onChange={(e) => updateForm({ brandBody: e.target.value })}
                placeholder="Tell your brand story..." className={inputClass} />
            </Field>
            <Field label="Image" error={formErrors.brandImageUrl}>
              <MediaPicker value={form.brandImageUrl}
                onChange={(url, publicId) => updateForm({ brandImageUrl: url, brandImagePublicId: publicId ?? "" })}
                folder="brand-story" />
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
        );

      case "trust_bar":
        return (
          <>
            <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500">Trust Items</p>
            {form.trustItems.map((item, i) => (
              <div key={i} className="border border-neutral-100 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-neutral-400 uppercase tracking-[0.15em] font-medium">Item {i + 1}</p>
                  {form.trustItems.length > 1 && (
                    <button onClick={() => updateForm({ trustItems: form.trustItems.filter((_, idx) => idx !== i) })}
                      className="text-[10px] text-red-400 hover:text-red-600 uppercase tracking-wider">Remove</button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Title">
                    <input value={item.title} onChange={(e) => {
                      const updated = [...form.trustItems];
                      updated[i] = { ...updated[i], title: e.target.value };
                      updateForm({ trustItems: updated });
                    }} className={inputClass} />
                  </Field>
                  <Field label="Description">
                    <input value={item.description} onChange={(e) => {
                      const updated = [...form.trustItems];
                      updated[i] = { ...updated[i], description: e.target.value };
                      updateForm({ trustItems: updated });
                    }} className={inputClass} />
                  </Field>
                </div>
              </div>
            ))}
            <button onClick={() => updateForm({ trustItems: [...form.trustItems, { title: "", description: "" }] })}
              className="text-xs text-brand-600 hover:text-brand-700 mt-1">+ Add Item</button>
          </>
        );

      case "banner_promo":
        return (
          <>
            <Field label="Image URL">
              <MediaPicker value={form.bannerImageUrl}
                onChange={(url, publicId) => updateForm({ bannerImageUrl: url, bannerImagePublicId: publicId ?? "" })}
                folder="banners" />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="CTA Text">
                <input value={form.bannerCtaText} onChange={(e) => updateForm({ bannerCtaText: e.target.value })}
                  className={inputClass} placeholder="Shop Now" />
              </Field>
              <Field label="CTA URL">
                <input value={form.bannerCtaUrl} onChange={(e) => updateForm({ bannerCtaUrl: e.target.value })}
                  className={inputClass} placeholder="/products" />
              </Field>
            </div>
          </>
        );

      case "custom_html":
        return (
          <Field label="HTML Content">
            <textarea rows={8} value={form.htmlContent} onChange={(e) => updateForm({ htmlContent: e.target.value })}
              className={`${inputClass} font-mono text-xs`} placeholder="<div>...</div>" />
          </Field>
        );

      case "hero_slider":
        return (
          <HeroSlideEditor
            slides={form.heroSlides}
            interval={form.heroInterval}
            onChangeSlides={(slides) => updateForm({ heroSlides: slides })}
            onChangeInterval={(interval) => updateForm({ heroInterval: interval })}
          />
        );

      case "testimonials":
        return (
          <TestimonialEditor
            items={form.testimonialItems}
            onChange={(items) => updateForm({ testimonialItems: items })}
          />
        );

      case "instagram_feed":
        return (
          <>
            <Field label="Heading">
              <input value={form.instagramHeading} onChange={(e) => updateForm({ instagramHeading: e.target.value })}
                placeholder="Follow Us @nabome" className={inputClass} />
            </Field>
            <Field label="Access Token / Hashtag">
              <input value={form.instagramAccessToken} onChange={(e) => updateForm({ instagramAccessToken: e.target.value })}
                placeholder="Instagram access token or #hashtag" className={inputClass} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Feed Limit">
                <input type="number" min={1} max={50} value={form.instagramLimit}
                  onChange={(e) => updateForm({ instagramLimit: Math.min(50, Math.max(1, Number(e.target.value))) })}
                  className={inputClass} />
              </Field>
              <Field label="Layout">
                <select value={form.instagramLayout} onChange={(e) => updateForm({ instagramLayout: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400 transition-colors">
                  <option value="grid">Grid</option>
                  <option value="carousel">Carousel</option>
                  <option value="masonry">Masonry</option>
                </select>
              </Field>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const typeLabel = (type: string) => SECTION_TYPES.find((t) => t.value === type)?.label ?? type;

  // ─── Render ───

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <Link to="/admin/cms" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 mb-4 transition-colors">
        <ArrowLeft size={16} /> Back to CMS
      </Link>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display text-neutral-900">Homepage Builder</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {sections.length} section{sections.length !== 1 ? "s" : ""} · Drag to reorder
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sections…"
              className="pl-8 pr-3 py-2 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400 transition-colors w-48"
            />
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 text-[11px] font-medium tracking-[0.15em] uppercase hover:bg-neutral-800 transition-colors">
            <Plus size={14} /> Add Section
          </button>
        </div>
      </div>

      {queryError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-4 flex items-center justify-between">
          <span className="text-sm">{queryError.message}</span>
          <button onClick={() => queryClient.invalidateQueries({ queryKey: ["admin", "homepage"] })}
            className="text-red-500 hover:text-red-700 text-sm font-medium">Retry</button>
        </div>
      )}

      {filteredSections.length === 0 ? (
        <div className="bg-white border border-neutral-200">
          <EmptyState
            icon={Layout}
            title={searchQuery ? "No matching sections" : "No sections yet"}
            description={searchQuery ? "Try a different search term" : "Build your homepage by adding sections"}
            action={
              searchQuery ? (
                <button onClick={() => setSearchQuery("")}
                  className="text-xs text-neutral-500 hover:text-neutral-700 uppercase tracking-wider">Clear Search</button>
              ) : (
                <button onClick={openCreate}
                  className="bg-neutral-900 text-white px-5 py-2.5 text-[11px] font-medium tracking-[0.15em] uppercase hover:bg-neutral-800 transition-colors">Add Section</button>
              )
            }
          />
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredSections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {filteredSections.map((sec, i) => (
                <SortableSectionCard
                  key={sec.id}
                  section={sec}
                  index={i}
                  isLast={i === filteredSections.length - 1}
                  isReordering={reorderMutation.isPending}
                  onEdit={() => openEdit(sec)}
                  onToggle={() => toggleActive(sec)}
                  onDuplicate={() => handleDuplicate(sec)}
                  onDelete={() => handleDelete(sec.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editItem ? "Edit Section" : "New Section"} size="lg">
        <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          <Field label="Section Type" error={formErrors.sectionType}>
            <select value={form.sectionType}
              onChange={(e) => updateForm({ sectionType: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400 transition-colors">
              {SECTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Title">
              <input value={form.title} onChange={(e) => updateForm({ title: e.target.value })}
                className={inputClass} placeholder="Section title" />
            </Field>
            <Field label="Subtitle">
              <input value={form.subtitle} onChange={(e) => updateForm({ subtitle: e.target.value })}
                className={inputClass} placeholder="Optional subtitle" />
            </Field>
          </div>

          <div className="border-t border-neutral-100 pt-4">
            {renderTypeSpecificFields()}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-neutral-100 pt-4">
            <Field label="Visibility">
              <select value={form.visibility} onChange={(e) => updateForm({ visibility: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400 transition-colors">
                <option value="all">Everyone</option>
                <option value="logged_in">Logged-in users only</option>
                <option value="logged_out">Guests only</option>
              </select>
            </Field>
            <label className="flex items-center gap-2.5 cursor-pointer pt-6">
              <input type="checkbox" checked={form.isActive}
                onChange={(e) => updateForm({ isActive: e.target.checked })}
                className="w-4 h-4 accent-brand-500 rounded" />
              <span className="text-sm text-neutral-700">Active — visible on homepage</span>
            </label>
          </div>

          {/* Scheduling */}
          <div className="border-t border-neutral-100 pt-4">
            <button
              onClick={() => setShowScheduling(!showScheduling)}
              className="flex items-center gap-2 w-full text-left mb-3"
            >
              {showScheduling ? <ChevronDown size={14} className="text-neutral-400" /> : <ChevronRight size={14} className="text-neutral-400" />}
              <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500">Scheduling</p>
            </button>
            {showScheduling && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Publish At (optional)">
                  <input type="datetime-local" value={form.publishAt}
                    onChange={(e) => updateForm({ publishAt: e.target.value })}
                    className={inputClass} />
                </Field>
                <Field label="Expire At (optional)">
                  <input type="datetime-local" value={form.expireAt}
                    onChange={(e) => updateForm({ expireAt: e.target.value })}
                    className={inputClass} />
                </Field>
              </div>
            )}
          </div>

          {/* Styles */}
          <div className="border-t border-neutral-100 pt-4">
            <button
              onClick={() => setShowStyles(!showStyles)}
              className="flex items-center gap-2 w-full text-left mb-3"
            >
              {showStyles ? <ChevronDown size={14} className="text-neutral-400" /> : <ChevronRight size={14} className="text-neutral-400" />}
              <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500">Style Overrides</p>
            </button>
            {showStyles && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Field label="Bg Color">
                    <div className="flex gap-2 items-center">
                      <input type="color" value={form.bgColor || "#ffffff"}
                        onChange={(e) => updateForm({ bgColor: e.target.value })}
                        className="w-8 h-8 p-0.5 border border-neutral-200 cursor-pointer shrink-0" />
                      <input value={form.bgColor} onChange={(e) => updateForm({ bgColor: e.target.value })}
                        className="flex-1 px-2 py-2 text-xs border border-neutral-200 focus:outline-none focus:border-neutral-400 font-mono" placeholder="—" />
                    </div>
                  </Field>
                  <Field label="Text Color">
                    <div className="flex gap-2 items-center">
                      <input type="color" value={form.textColor || "#000000"}
                        onChange={(e) => updateForm({ textColor: e.target.value })}
                        className="w-8 h-8 p-0.5 border border-neutral-200 cursor-pointer shrink-0" />
                      <input value={form.textColor} onChange={(e) => updateForm({ textColor: e.target.value })}
                        className="flex-1 px-2 py-2 text-xs border border-neutral-200 focus:outline-none focus:border-neutral-400 font-mono" placeholder="—" />
                    </div>
                  </Field>
                  <Field label="Animation">
                    <select value={form.animationStyle} onChange={(e) => updateForm({ animationStyle: e.target.value })}
                      className="w-full px-2 py-2.5 text-xs border border-neutral-200 focus:outline-none focus:border-neutral-400">
                      <option value="none">None</option>
                      <option value="fade-up">Fade Up</option>
                      <option value="fade-left">Fade Left</option>
                      <option value="fade-right">Fade Right</option>
                      <option value="zoom-in">Zoom In</option>
                      <option value="slide-up">Slide Up</option>
                    </select>
                  </Field>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <Field label="Padding Top">
                    <input value={form.paddingTop} onChange={(e) => updateForm({ paddingTop: e.target.value })}
                      className="px-2 py-2 text-xs border border-neutral-200 focus:outline-none focus:border-neutral-400 font-mono" placeholder="e.g. 4rem" />
                  </Field>
                  <Field label="Padding Bottom">
                    <input value={form.paddingBottom} onChange={(e) => updateForm({ paddingBottom: e.target.value })}
                      className="px-2 py-2 text-xs border border-neutral-200 focus:outline-none focus:border-neutral-400 font-mono" placeholder="e.g. 4rem" />
                  </Field>
                  <Field label="Max Width">
                    <input value={form.maxWidth} onChange={(e) => updateForm({ maxWidth: e.target.value })}
                      className="px-2 py-2 text-xs border border-neutral-200 focus:outline-none focus:border-neutral-400 font-mono" placeholder="e.g. 1280px" />
                  </Field>
                </div>
              </>
            )}
          </div>

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

      <Modal open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)} title="Delete Section" size="sm">
        <p className="text-sm text-neutral-600 mb-6">
          Are you sure you want to delete this section? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteConfirm(null)}
            className="px-4 py-2 text-[11px] font-medium tracking-[0.15em] uppercase text-neutral-500 hover:text-neutral-900 transition-colors">
            Cancel
          </button>
          <button onClick={confirmDelete} disabled={deleteMutation.isPending}
            className="px-5 py-2 text-[11px] font-medium tracking-[0.15em] uppercase bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-40 flex items-center gap-2">
            {deleteMutation.isPending && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
