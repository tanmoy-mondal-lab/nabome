import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { StatusBadge } from "../common/StatusBadge";
import { EmptyState } from "../common/EmptyState";
import { MediaPicker } from "../common/MediaPicker";
import { SafeImage } from "../../components/SafeImage";
import { Edit3, Trash2, Plus, Images } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  position: string;
  isActive: boolean;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Banner | null>(null);
  const [form, setForm] = useState({ title: "", subtitle: "", imageUrl: "", linkUrl: "", position: "hero", isActive: true });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getHomepageSections();
      const allSections = (res.sections as Array<Record<string, unknown>>) ?? [];
      const heroSections = allSections.filter((s) => s.type === "hero");
      const extracted = heroSections.flatMap((s) => {
        const config = s.config as Record<string, unknown> | undefined;
        return Array.isArray(config?.banners) ? (config.banners as Banner[]) : [];
      });
      setBanners(extracted.length ? extracted : [
        { id: "1", title: "Summer Collection", subtitle: "Discover the new arrivals", imageUrl: "", linkUrl: "/shop", position: "hero", isActive: true },
      ]);
    } catch (error) {
      // failed to fetch
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ title: "", subtitle: "", imageUrl: "", linkUrl: "", position: "hero", isActive: true });
    setModalOpen(true);
  };

  const openEdit = (banner: Banner) => {
    setEditItem(banner);
    setForm({ title: banner.title, subtitle: banner.subtitle, imageUrl: banner.imageUrl, linkUrl: banner.linkUrl, position: banner.position, isActive: banner.isActive });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setModalOpen(false);
    fetch();
  };

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
          <h1 className="font-display text-2xl text-neutral-900">Banners</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage promotional banners</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded text-sm font-medium">
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {banners.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded">
          <EmptyState icon={Images} title="No banners yet"
            action={<button onClick={openCreate} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm">Add Banner</button>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white border border-neutral-200 rounded overflow-hidden group">
              <div className="aspect-[16/9] bg-neutral-100 relative">
                {banner.imageUrl ? (
                  <SafeImage src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" useTransform={false} />
                ) : (
                  <div className="flex items-center justify-center h-full text-neutral-300"><Images size={32} /></div>
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(banner)} className="bg-white p-1.5 rounded shadow text-neutral-600"><Edit3 size={12} /></button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm text-neutral-900">{banner.title || "Untitled"}</h3>
                  <StatusBadge status={banner.isActive ? "active" : "inactive"} />
                </div>
                <p className="text-xs text-neutral-400 mt-1 capitalize">{banner.position}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Banner" : "New Banner"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Position</label>
              <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded">
                <option value="hero">Hero</option>
                <option value="promo">Promo Strip</option>
                <option value="sidebar">Sidebar</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Subtitle</label>
            <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
          </div>
          <div>
            <MediaPicker value={form.imageUrl} onChange={(url: string) => setForm({ ...form, imageUrl: url })} label="Image URL" folder="banners" />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Link URL</label>
            <input value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-brand-500" />
            <span className="text-xs text-neutral-600">Active</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-neutral-500">Cancel</button>
            <button onClick={handleSave} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium">Save</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
