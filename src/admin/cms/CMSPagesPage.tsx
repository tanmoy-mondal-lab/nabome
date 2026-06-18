import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { StatusBadge } from "../common/StatusBadge";
import { EmptyState } from "../common/EmptyState";
import { Edit3, Trash2, Plus, FileText } from "lucide-react";

interface CMSPage {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
}

export default function CMSPagesPage() {
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<CMSPage | null>(null);
  const [form, setForm] = useState({ title: "", slug: "", content: "", metaTitle: "", metaDescription: "", status: "draft" });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPages();
      setPages((res.pages as CMSPage[]) ?? []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ title: "", slug: "", content: "", metaTitle: "", metaDescription: "", status: "draft" });
    setModalOpen(true);
  };

  const openEdit = (page: CMSPage) => {
    setEditItem(page);
    setForm({ title: page.title, slug: page.slug, content: "", metaTitle: "", metaDescription: "", status: page.status });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...form, content: form.content || "<!-- content -->" };
      if (editItem) {
        await adminApi.updatePage(editItem.id, payload);
      } else {
        await adminApi.createPage(payload);
      }
      setModalOpen(false);
      fetch();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this page?")) return;
    try {
      await adminApi.deletePage(id);
      fetch();
    } catch { /* ignore */ }
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
          <h1 className="font-display text-2xl text-neutral-900">CMS Pages</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage static pages</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded text-sm font-medium hover:bg-neutral-800"
        >
          <Plus size={16} /> Add Page
        </button>
      </div>

      {pages.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded">
          <EmptyState icon={FileText} title="No pages yet" description="Create pages like About, Contact, etc."
            action={<button onClick={openCreate} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm">Create Page</button>}
          />
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-neutral-500 font-medium">Title</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-neutral-500 font-medium">Slug</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-neutral-500 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-neutral-500 font-medium">Updated</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-neutral-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-b border-neutral-50">
                  <td className="px-4 py-3 font-medium text-neutral-900">{page.title}</td>
                  <td className="px-4 py-3 text-neutral-500">/{page.slug}</td>
                  <td className="px-4 py-3"><StatusBadge status={page.status} /></td>
                  <td className="px-4 py-3 text-sm text-neutral-500">
                    {new Date(page.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(page)} className="p-2 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-600">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => handleDelete(page.id)} className="p-2 hover:bg-red-50 rounded text-neutral-400 hover:text-red-500">
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Page" : "New Page"} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Title *</label>
              <input required value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value, slug: editItem ? form.slug : e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Slug</label>
              <input value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Content (HTML)</label>
            <textarea rows={10} value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full px-3 py-2 text-sm font-mono border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Meta Title</label>
              <input value={form.metaTitle}
                onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Status</label>
              <select value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Meta Description</label>
            <textarea rows={2} value={form.metaDescription}
              onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none" />
          </div>
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
