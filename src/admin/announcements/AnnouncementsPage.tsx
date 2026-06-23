import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { StatusBadge } from "../common/StatusBadge";
import { Plus, Edit3, Trash2, Megaphone } from "lucide-react";
import { formatDate } from "../../lib/utils/format";

interface Announcement {
  id: string;
  text: string;
  linkUrl: string | null;
  linkText: string | null;
  bgColor: string | null;
  textColor: string | null;
  position: string;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Announcement | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({
    text: "", linkUrl: "", linkText: "", bgColor: "#000000", textColor: "#ffffff",
    position: "top", isActive: true, startDate: "", endDate: "",
  });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAnnouncements();
      setAnnouncements((res.announcements as Announcement[]) ?? []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ text: "", linkUrl: "", linkText: "", bgColor: "#000000", textColor: "#ffffff", position: "top", isActive: true, startDate: "", endDate: "" });
    setModalOpen(true);
  };

  const openEdit = (a: Announcement) => {
    setEditItem(a);
    setForm({
      text: a.text, linkUrl: a.linkUrl ?? "", linkText: a.linkText ?? "",
      bgColor: a.bgColor ?? "#000000", textColor: a.textColor ?? "#ffffff",
      position: a.position,
      isActive: a.isActive, startDate: a.startDate ?? "", endDate: a.endDate ?? "",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        text: form.text,
        linkUrl: form.linkUrl || null,
        linkText: form.linkText || null,
        bgColor: form.bgColor || null,
        textColor: form.textColor || null,
        position: form.position,
        isActive: form.isActive,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      };
      if (editItem) {
        await adminApi.updateAnnouncement(editItem.id, payload);
      } else {
        await adminApi.createAnnouncement(payload);
      }
      setModalOpen(false);
      fetch();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi.deleteAnnouncement(id);
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
          <h1 className="font-display text-2xl text-neutral-900">Announcements</h1>
          <p className="text-sm text-neutral-500 mt-1">Site-wide announcement bar messages</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded text-sm font-medium hover:bg-neutral-800">
          <Plus size={16} /> Add Announcement
        </button>
      </div>

      {announcements.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded">
          <EmptyState icon={Megaphone} title="No announcements"
            action={<button onClick={openCreate} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm">Create Announcement</button>}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="bg-white border border-neutral-200 rounded p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-neutral-900 font-medium truncate">{a.text}</span>
                        <StatusBadge status={a.isActive ? "active" : "inactive"} />
                        {a.position && <span className="text-xs px-1.5 py-0.5 bg-neutral-100 rounded capitalize">{a.position}</span>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-neutral-400">
                        {a.linkText && a.linkUrl && <span>Link: {a.linkText}</span>}
                        {a.bgColor && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>Color: <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 2, backgroundColor: a.bgColor }} /></span>}
                        {a.startDate && <span>From: {formatDate(a.startDate)}</span>}
                        {a.endDate && <span>Until: {formatDate(a.endDate)}</span>}
                        <span>Created: {formatDate(a.createdAt)}</span>
                      </div>
                    </div>
                <div className="flex items-center gap-1 ml-4">
                  <button onClick={() => openEdit(a)} className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => setDeleteConfirm(a.id)} className="p-1.5 text-red-400 hover:text-red-600 rounded">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Announcement" : "New Announcement"}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Announcement Text *</label>
            <input value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })}
              placeholder="e.g. Free shipping on orders over ₹5000" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Link URL</label>
              <input value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                placeholder="/shop" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Link Text</label>
              <input value={form.linkText} onChange={(e) => setForm({ ...form, linkText: e.target.value })}
                placeholder="Shop Now" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Background Color</label>
              <div className="flex gap-2">
                <input type="color" value={form.bgColor}
                  onChange={(e) => setForm({ ...form, bgColor: e.target.value })} className="w-10 h-9 border border-neutral-200 rounded cursor-pointer" />
                <input value={form.bgColor} onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded font-mono" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Text Color</label>
              <div className="flex gap-2">
                <input type="color" value={form.textColor}
                  onChange={(e) => setForm({ ...form, textColor: e.target.value })} className="w-10 h-9 border border-neutral-200 rounded cursor-pointer" />
                <input value={form.textColor} onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded font-mono" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Position</label>
            <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}
              className={inputClass}>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Start Date</label>
              <input type="date" value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Expiry Date</label>
              <input type="date" value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputClass} />
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

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Announcement" size="sm">
        <p className="text-sm text-neutral-600 mb-6">Delete this announcement?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-neutral-500">Cancel</button>
          <button onClick={() => handleDelete(deleteConfirm!)} className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
