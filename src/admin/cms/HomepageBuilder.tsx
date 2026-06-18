import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { GripVertical, Plus, Edit3, Trash2, Eye, EyeOff, Layout } from "lucide-react";

interface HomeSection {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  sortOrder: number;
  isActive: boolean;
  config: Record<string, unknown>;
}

const SECTION_TYPES = [
  { value: "hero", label: "Hero Banner" },
  { value: "featured_categories", label: "Featured Categories" },
  { value: "featured_products", label: "Featured Products" },
  { value: "new_arrivals", label: "New Arrivals" },
  { value: "collection_grid", label: "Collection Grid" },
  { value: "brand_story", label: "Brand Story" },
  { value: "testimonials", label: "Testimonials" },
  { value: "instagram_feed", label: "Instagram Feed" },
  { value: "newsletter", label: "Newsletter Signup" },
  { value: "custom_html", label: "Custom HTML" },
];

export default function HomepageBuilder() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<HomeSection | null>(null);
  const [form, setForm] = useState({ type: "hero", title: "", subtitle: "", isActive: true, config: "{}" });
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getHomepageSections();
      setSections((res.sections as HomeSection[]) ?? []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ type: "hero", title: "", subtitle: "", isActive: true, config: "{}" });
    setModalOpen(true);
  };

  const openEdit = (sec: HomeSection) => {
    setEditItem(sec);
    setForm({
      type: sec.type, title: sec.title, subtitle: sec.subtitle ?? "",
      isActive: sec.isActive, config: JSON.stringify(sec.config ?? {}, null, 2),
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...form, sortOrder: editItem?.sortOrder ?? sections.length, config: JSON.parse(form.config || "{}") };
      if (editItem) {
        await adminApi.updateHomeSection(editItem.id, payload);
      } else {
        await adminApi.createHomeSection(payload);
      }
      setModalOpen(false);
      fetch();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this section?")) return;
    try {
      await adminApi.deleteHomeSection(id);
      fetch();
    } catch { /* ignore */ }
  };

  const toggleActive = async (sec: HomeSection) => {
    try {
      await adminApi.updateHomeSection(sec.id, { ...sec, isActive: !sec.isActive });
      fetch();
    } catch { /* ignore */ }
  };

  const handleDragStart = (i: number) => setDragIdx(i);

  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i) return;
    const reordered = [...sections];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(i, 0, moved);
    setSections(reordered);
    setDragIdx(i);
  };

  const handleDragEnd = async () => {
    setDragIdx(null);
    try {
      const order = sections.map((s, i) => ({ id: s.id, sortOrder: i }));
      await adminApi.reorderHomeSections(order);
    } catch { /* ignore */ }
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">Homepage Builder</h1>
          <p className="text-sm text-neutral-500 mt-1">Drag to reorder homepage sections</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded text-sm font-medium hover:bg-neutral-800"
        >
          <Plus size={16} /> Add Section
        </button>
      </div>

      {sections.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded">
          <EmptyState icon={Layout} title="No sections yet" description="Build your homepage by adding sections"
            action={<button onClick={openCreate} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm">Add Section</button>}
          />
        </div>
      ) : (
        <div className="space-y-2">
          {sections.map((sec, i) => (
            <div
              key={sec.id}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragEnd={handleDragEnd}
              className={`bg-white border rounded p-4 flex items-center gap-4 transition-colors ${
                dragIdx === i ? "border-brand-500 shadow-md" : "border-neutral-200"
              } ${!sec.isActive ? "opacity-60" : ""}`}
            >
              <div className="cursor-grab text-neutral-300 hover:text-neutral-500">
                <GripVertical size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-neutral-900">{sec.title || typeLabel(sec.type)}</p>
                <p className="text-xs text-neutral-400">
                  {typeLabel(sec.type)} · Order {sec.sortOrder}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleActive(sec)} className="p-2 hover:bg-neutral-100 rounded text-neutral-400">
                  {sec.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button onClick={() => openEdit(sec)} className="p-2 hover:bg-neutral-100 rounded text-neutral-400">
                  <Edit3 size={14} />
                </button>
                <button onClick={() => handleDelete(sec.id)} className="p-2 hover:bg-red-50 rounded text-neutral-400 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Section" : "New Section"}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Section Type</label>
            <select value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none">
              {SECTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Title</label>
            <input value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Subtitle</label>
            <input value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Config (JSON)</label>
            <textarea rows={6} value={form.config}
              onChange={(e) => setForm({ ...form, config: e.target.value })}
              className="w-full px-3 py-2 text-sm font-mono border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="accent-brand-500" />
            <span className="text-xs text-neutral-600">Active</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-neutral-500">Cancel</button>
            <button onClick={handleSave} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium">
              {editItem ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
