import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { SafeImage } from "../../components/SafeImage";
import { Plus, Edit3, Trash2, Film, ChevronUp, ChevronDown, ChevronRight, Volume2, VolumeX, ArrowLeft } from "lucide-react";
import { normalizeHeroSlides } from "../../cms/core/hero-slides";

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

interface HeroConfig {
  slides: HeroSlide[];
  interval: number;
}

export default function HeroBuilder() {
  const [config, setConfig] = useState<HeroConfig>({ slides: [], interval: 7000 });
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [expandedSlides, setExpandedSlides] = useState<Set<number>>(new Set());
  const [form, setForm] = useState<HeroSlide>({
    id: "", videoUrl: "", posterUrl: "", title: "", subtitle: "", ctaText: "", ctaUrl: "", soundEnabled: true,
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const posterRef = useRef<HTMLInputElement>(null);
  const [uploadingFor, setUploadingFor] = useState<"video" | "poster" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getHomepageSections();
      const sections = (res.sections as Array<Record<string, unknown>>) ?? [];
      const heroSection = sections.find((s) => s.sectionType === "hero_slider");
      if (heroSection) {
        setSectionId(heroSection.id as string);
        const content = heroSection.content as HeroConfig | null;
        setConfig({
          slides: normalizeHeroSlides(content?.slides, {
            title: heroSection.title as string | undefined,
            subtitle: heroSection.subtitle as string | undefined,
          }),
          interval: content?.interval ?? 7000,
        });
      } else {
        setConfig({ slides: [], interval: 7000 });
        setSectionId(null);
      }
    } catch (error) {
      setError("Failed to load hero slides.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const saveConfig = async (newConfig: HeroConfig) => {
    setSaving(true);
    try {
      if (sectionId) {
        await adminApi.updateHomeSection(sectionId, {
          sectionType: "hero_slider",
          title: "Hero Banner",
          content: newConfig,
          isActive: true,
        });
      } else {
        const res = await adminApi.createHomeSection({
          sectionType: "hero_slider",
          title: "Hero Banner",
          content: newConfig,
          isActive: true,
        });
        const created = res as { id: string } | undefined;
        if (created?.id) setSectionId(created.id);
      }
      setConfig(newConfig);
    } catch { setError("Failed to save hero config."); } finally {
      setSaving(false);
    }
  };

  const openCreate = () => {
    setEditIdx(null);
    setForm({ id: crypto.randomUUID(), videoUrl: "", posterUrl: "", title: "", subtitle: "", ctaText: "Shop Now", ctaUrl: "/shop", soundEnabled: true });
    setModalOpen(true);
  };

  const openEdit = (idx: number) => {
    setEditIdx(idx);
    setForm({ ...config.slides[idx] });
    setModalOpen(true);
  };

  const handleSaveSlide = async () => {
    const newSlides = [...config.slides];
    if (editIdx !== null) {
      newSlides[editIdx] = form;
    } else {
      newSlides.push(form);
    }
    await saveConfig({ ...config, slides: newSlides });
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (deleteConfirm === null) return;
    const newSlides = config.slides.filter((_, i) => i !== deleteConfirm);
    await saveConfig({ ...config, slides: newSlides });
    setDeleteConfirm(null);
  };

  const moveSlide = async (idx: number, direction: -1 | 1) => {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= config.slides.length) return;
    const newSlides = [...config.slides];
    [newSlides[idx], newSlides[newIdx]] = [newSlides[newIdx], newSlides[idx]];
    await saveConfig({ ...config, slides: newSlides });
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "videoUrl" | "posterUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFor(field === "videoUrl" ? "video" : "poster");
    try {
      const res = await adminApi.uploadFile(file, "hero-banners");
      setForm((prev) => ({ ...prev, [field]: res.url }));
    } catch { setError("Failed to upload file."); } finally {
      setUploadingFor(null);
      if (fileRef.current) fileRef.current.value = "";
      if (posterRef.current) posterRef.current.value = "";
    }
  };

  const updateInterval = async (val: number) => {
    await saveConfig({ ...config, interval: val });
  };

  const inputClass = "w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="premium-card rounded-2xl px-6 py-5 flex items-center gap-3 shadow-subtle">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-neutral-500">Loading hero slides…</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link to="/admin/cms" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 mb-4 transition-colors">
        <ArrowLeft size={16} /> Back to CMS
      </Link>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">Hero Banner Builder</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage video & image hero slides for the homepage carousel</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <span className="text-xs">Interval (ms):</span>
            <input type="number" value={config.interval}
              onChange={(e) => updateInterval(Number(e.target.value))}
              className="w-20 px-2 py-1.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <button onClick={openCreate}
            className="btn-primary">
            <Plus size={16} /> Add Slide
          </button>
        </div>
      </div>

      <div className="premium-card rounded-2xl flex items-center gap-2 mb-4 text-xs text-neutral-500 bg-amber-50/70 border-amber-200 px-4 py-2">
        <Film size={14} className="text-amber-500" />
        Upload MP4/WebM videos as hero backgrounds. Each slide auto-advances after the interval. Customers can toggle sound on/off.
      </div>

      {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3">{error}<button onClick={() => setError(null)} className="ml-2 text-red-500 hover:text-red-700">×</button></div>}

      {config.slides.length === 0 ? (
        <div className="premium-card rounded-2xl">
          <EmptyState icon={Film} title="No hero slides"
            description="Add video or image slides to create a stunning homepage hero carousel"
            action={<button onClick={openCreate} className="btn-primary">Add Slide</button>}
          />
        </div>
      ) : (
        <div className="space-y-2">
          {config.slides.map((slide, i) => {
            const isExpanded = expandedSlides.has(i);
            return (
              <div key={slide.id} className={`premium-card rounded-2xl overflow-hidden transition-all ${isExpanded ? "ring-1 ring-neutral-300" : ""}`}>
                {/* Collapsed Header — always visible */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none hover:bg-neutral-50 transition-colors"
                  onClick={() => {
                    setExpandedSlides((prev) => {
                      const next = new Set(prev);
                      if (next.has(i)) next.delete(i);
                      else next.add(i);
                      return next;
                    });
                  }}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <button onClick={(e) => { e.stopPropagation(); moveSlide(i, -1); }} disabled={i === 0}
                      className="p-0.5 text-neutral-300 hover:text-neutral-600 disabled:opacity-30"><ChevronUp size={12} /></button>
                    <span className="text-[10px] font-mono text-neutral-400">#{i + 1}</span>
                    <button onClick={(e) => { e.stopPropagation(); moveSlide(i, 1); }} disabled={i === config.slides.length - 1}
                      className="p-0.5 text-neutral-300 hover:text-neutral-600 disabled:opacity-30"><ChevronDown size={12} /></button>
                  </div>
                  {isExpanded ? <ChevronDown size={14} className="text-neutral-400 shrink-0" /> : <ChevronRight size={14} className="text-neutral-400 shrink-0" />}
                  {slide.videoUrl ? <Film size={14} className="text-neutral-400 shrink-0" /> : slide.posterUrl ? <span className="w-3.5 h-3.5 rounded bg-blue-100 shrink-0" /> : null}
                  <span className="text-sm text-neutral-900 font-medium truncate flex-1">{slide.title || "Untitled"}</span>
                  {slide.soundEnabled ? <Volume2 size={12} className="text-neutral-400 shrink-0" /> : <VolumeX size={12} className="text-neutral-300 shrink-0" />}
                  {slide.ctaText && <span className="text-[10px] text-neutral-400 hidden sm:inline">CTA: {slide.ctaText}</span>}
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => openEdit(i)} className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-xl">
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => setDeleteConfirm(i)} className="p-1.5 text-red-400 hover:text-red-600 rounded-xl">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Expanded Body — full preview */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-neutral-100">
                    <div className="flex gap-4">
                      <div className="w-40 h-24 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {slide.videoUrl ? (
                          <video src={slide.videoUrl} className="w-full h-full object-cover" muted />
                        ) : slide.posterUrl ? (
                          <SafeImage src={slide.posterUrl} alt="" className="w-full h-full object-cover" useTransform={false} />
                        ) : (
                          <Film size={24} className="text-neutral-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        {slide.subtitle && <p className="text-xs text-neutral-500">{slide.subtitle}</p>}
                        <div className="flex items-center gap-3 text-[10px] text-neutral-400">
                          {slide.ctaText && <span>CTA: {slide.ctaText}</span>}
                          {slide.ctaUrl && <span>→ {slide.ctaUrl}</span>}
                        </div>
                        {slide.videoUrl && (
                          <div className="text-[10px] text-neutral-400 truncate">Video: {slide.videoUrl}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editIdx !== null ? "Edit Slide" : "New Slide"} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Summer Collection 2024" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Subtitle</label>
            <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              placeholder="Discover the new arrivals" className={inputClass} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Video URL *</label>
              <div className="flex gap-2">
                <input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  placeholder="https://res.cloudinary.com/…/video.mp4" className={`flex-1 ${inputClass}`} />
                <button onClick={() => fileRef.current?.click()}
                  className="shrink-0 px-3 py-2 text-xs font-medium rounded-xl border border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors">
                  {uploadingFor === "video" ? "…" : "Upload"}
                </button>
              </div>
              <input ref={fileRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden"
                onChange={(e) => handleVideoUpload(e, "videoUrl")} />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Poster Image URL</label>
              <div className="flex gap-2">
                <input value={form.posterUrl} onChange={(e) => setForm({ ...form, posterUrl: e.target.value })}
                  placeholder="Fallback image URL" className={`flex-1 ${inputClass}`} />
                <button onClick={() => posterRef.current?.click()}
                  className="shrink-0 px-3 py-2 text-xs font-medium rounded-xl border border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors">
                  {uploadingFor === "poster" ? "…" : "Upload"}
                </button>
              </div>
              <input ref={posterRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => handleVideoUpload(e, "posterUrl")} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">CTA Text</label>
              <input value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                placeholder="Shop Now" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">CTA Link</label>
              <input value={form.ctaUrl} onChange={(e) => setForm({ ...form, ctaUrl: e.target.value })}
                placeholder="/collections/summer" className={inputClass} />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.soundEnabled}
              onChange={(e) => setForm({ ...form, soundEnabled: e.target.checked })} className="accent-brand-500" />
            <span className="text-xs text-neutral-600">Enable sound by default (customer can toggle)</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-700">Cancel</button>
            <button onClick={handleSaveSlide} disabled={saving} className="btn-primary disabled:opacity-50 flex items-center gap-2">
              {saving && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editIdx !== null ? "Save Slide" : "Add Slide"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)} title="Delete Slide" size="sm">
        <p className="text-sm text-neutral-600 mb-6">Delete this hero slide?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-700">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
