import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { Edit3, Trash2, Plus, LayoutList } from "lucide-react";

interface FooterSection {
  id: string;
  title: string;
  contentType: string;
  content: string;
  sortOrder: number;
  isActive: boolean;
  links?: { label: string; url: string }[];
}

export default function FooterBuilder() {
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<FooterSection | null>(null);
  const [form, setForm] = useState({ title: "", contentType: "links", content: "", isActive: true, linksRaw: "[]" });

  const fetch = useCallback(async () => {
    try {
      const res = await adminApi.getFooterSections();
      setSections((res.sections as FooterSection[]) ?? []);
    } catch (error) {
      console.error("Failed to fetch footer sections:", error);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ title: "", contentType: "links", content: "", isActive: true, linksRaw: "[]" });
    setModalOpen(true);
  };

  const openEdit = (sec: FooterSection) => {
    setEditItem(sec);
    setForm({
      title: sec.title, contentType: sec.contentType, content: typeof sec.content === 'object' ? JSON.stringify(sec.content) : (sec.content ?? ""),
      isActive: sec.isActive, linksRaw: JSON.stringify(sec.links ?? [], null, 2),
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const links = JSON.parse(form.linksRaw || "[]");
      const payload: Record<string, unknown> = {
        title: form.title, contentType: form.contentType, content: form.linksRaw ? { links } : form.content,
        isActive: form.isActive, sortOrder: editItem?.sortOrder ?? sections.length,
      };
      if (editItem) {
        await adminApi.updateFooterSection(editItem.id, payload);
      } else {
        await adminApi.createFooterSection(payload);
      }
      setModalOpen(false);
      fetch();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this footer section?")) return;
    try {
      await adminApi.deleteFooterSection(id);
      fetch();
    } catch { /* ignore */ }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">Footer Builder</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage footer sections and links</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded text-sm font-medium">
          <Plus size={16} /> Add Section
        </button>
      </div>

      {sections.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded">
          <EmptyState icon={LayoutList} title="No footer sections" description="Add columns to your footer"
            action={<button onClick={openCreate} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm">Add Section</button>}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((sec) => (
            <div key={sec.id} className="bg-white border border-neutral-200 rounded p-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-sm text-neutral-900">{sec.title}</h3>
                <p className="text-xs text-neutral-500 capitalize">{sec.contentType} · {(sec as unknown as { links?: [] }).links?.length ?? 0} links</p>
              </div>
              <div className="flex items-center gap-1">
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Section" : "New Section"} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Title *</label>
              <input required value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Type</label>
              <select value={form.contentType}
                onChange={(e) => setForm({ ...form, contentType: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded">
                <option value="links">Links</option>
                <option value="text">Text/About</option>
                <option value="newsletter">Newsletter</option>
                <option value="social">Social Media</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Content (for text type)</label>
            <textarea rows={3} value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Links (JSON)</label>
            <textarea rows={6} value={form.linksRaw}
              onChange={(e) => setForm({ ...form, linksRaw: e.target.value })}
              className="w-full px-3 py-2 text-sm font-mono border border-neutral-200 rounded focus:outline-none"
              placeholder='[{"label":"About Us","url":"/about"}]' />
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
