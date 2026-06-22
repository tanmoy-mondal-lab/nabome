import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { Plus, Edit3, Trash2, Link2 } from "lucide-react";

const PLATFORM_ICONS: Record<string, string> = {
  instagram: "📸", facebook: "👍", twitter: "🐦", youtube: "▶️",
  pinterest: "📌", tiktok: "🎵", linkedin: "💼", whatsapp: "💬",
};

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  label: string | null;
  sortOrder: number;
  isActive: boolean;
}

export default function SocialLinksPage() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<SocialLink | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({ platform: "instagram", url: "", label: "", sortOrder: 0, isActive: true });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSocialLinks();
      setLinks((res.links as SocialLink[]) ?? []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ platform: "instagram", url: "", label: "", sortOrder: 0, isActive: true });
    setModalOpen(true);
  };

  const openEdit = (l: SocialLink) => {
    setEditItem(l);
    setForm({ platform: l.platform, url: l.url, label: l.label ?? "", sortOrder: l.sortOrder, isActive: l.isActive });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        platform: form.platform,
        url: form.url,
        label: form.label || null,
        sortOrder: form.sortOrder,
        isActive: form.isActive,
      };
      if (editItem) {
        await adminApi.updateSocialLink(editItem.id, payload);
      } else {
        await adminApi.createSocialLink(payload);
      }
      setModalOpen(false);
      fetch();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi.deleteSocialLink(id);
      setDeleteConfirm(null);
      fetch();
    } catch { /* ignore */ }
  };

  const inputClass = "w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500";

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
          <h1 className="font-display text-2xl text-neutral-900">Social Links</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage social media links displayed on the storefront</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded text-sm font-medium hover:bg-neutral-800">
          <Plus size={16} /> Add Link
        </button>
      </div>

      {links.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded">
          <EmptyState icon={Link2} title="No social links"
            action={<button onClick={openCreate} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm">Add Social Link</button>}
          />
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Platform</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">URL</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Label</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Order</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map((l) => (
                <tr key={l.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <span className="mr-2">{PLATFORM_ICONS[l.platform] ?? "🔗"}</span>
                    <span className="capitalize text-neutral-900">{l.platform}</span>
                  </td>
                  <td className="px-4 py-3">
                    <a href={l.url} target="_blank" rel="noopener noreferrer"
                      className="text-brand-600 hover:underline text-xs truncate block max-w-[200px]">
                      {l.url}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{l.label ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-500">{l.sortOrder}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${
                      l.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                    }`}>
                      {l.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(l)} className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => setDeleteConfirm(l.id)} className="p-1.5 text-red-400 hover:text-red-600 rounded">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Social Link" : "Add Social Link"}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Platform *</label>
            <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}
              className={inputClass}>
              {Object.keys(PLATFORM_ICONS).map((p) => (
                <option key={p} value={p} className="capitalize">{PLATFORM_ICONS[p]} {p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">URL *</label>
            <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://instagram.com/yourbrand" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Label</label>
              <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="Follow us" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Sort Order</label>
              <input type="number" value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className={inputClass} />
            </div>
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

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Link" size="sm">
        <p className="text-sm text-neutral-600 mb-6">Delete this social link?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-neutral-500">Cancel</button>
          <button onClick={() => handleDelete(deleteConfirm!)} className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
