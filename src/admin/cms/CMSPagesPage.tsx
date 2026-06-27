import { useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { StatusBadge } from "../common/StatusBadge";
import { EmptyState } from "../common/EmptyState";
import { Edit3, Trash2, Plus, FileText } from "lucide-react";
import { useToast } from "../../components/ui/Toast";

interface CMSPage {
  id: string;
  title: string;
  slug: string;
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
  status: string;
  updatedAt: string;
}

export default function CMSPagesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<CMSPage | null>(null);
  const [form, setForm] = useState({ title: "", slug: "", content: "", metaTitle: "", metaDescription: "", status: "draft" });

  const { data: pages = [], isLoading: loading } = useQuery<CMSPage[]>({
    queryKey: ["admin", "cmsPages"],
    queryFn: async () => {
      const res = await adminApi.getPages();
      return (res.pages as CMSPage[]) ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: Parameters<typeof adminApi.createPage>[0]) =>
      adminApi.createPage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "cmsPages"] });
      setModalOpen(false);
      toast("Page created", "success");
    },
    onError: () => {
      toast("Failed to create page", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof adminApi.updatePage>[1] }) =>
      adminApi.updatePage(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "cmsPages"] });
      setModalOpen(false);
      toast("Page updated", "success");
    },
    onError: () => {
      toast("Failed to update page", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deletePage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "cmsPages"] });
      toast("Page deleted", "success");
    },
    onError: () => {
      toast("Failed to delete page", "error");
    },
  });

  const openCreate = () => {
    setEditItem(null);
    setForm({ title: "", slug: "", content: "", metaTitle: "", metaDescription: "", status: "draft" });
    setModalOpen(true);
  };

  const openEdit = (page: CMSPage) => {
    setEditItem(page);
    setForm({ title: page.title, slug: page.slug, content: page.content ?? "", metaTitle: page.metaTitle ?? "", metaDescription: page.metaDescription ?? "", status: page.status });
    setModalOpen(true);
  };

  const handleSave = () => {
    const payload = {
      title: form.title,
      slug: form.slug,
      content: form.content || "<!-- content -->",
      metaTitle: form.metaTitle,
      metaDesc: form.metaDescription,
      isPublished: form.status === "published",
    };
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    const page = pages.find((p) => p.id === id);
    if (!window.confirm(`Delete "${page?.title ?? "this page"}"? This cannot be undone.`)) return;
    deleteMutation.mutate(id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="premium-card rounded-2xl px-6 py-5 flex items-center gap-3 shadow-subtle">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-neutral-500">Loading pages…</span>
        </div>
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
          className="btn-primary"
        >
          <Plus size={16} /> Add Page
        </button>
      </div>

      {pages.length === 0 ? (
        <EmptyState icon={FileText} title="No pages yet" description="Create pages like About, Contact, etc."
          action={<button onClick={openCreate} className="btn-primary">Create Page</button>}
        />
      ) : (
        <div className="premium-card rounded-2xl overflow-hidden">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Content (HTML)</label>
            <textarea rows={10} value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full px-3 py-2 text-sm font-mono border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Meta Title</label>
              <input value={form.metaTitle}
                onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Status</label>
              <select value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Meta Description</label>
            <textarea rows={2} value={form.metaDescription}
              onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-neutral-500">Cancel</button>
            <button onClick={handleSave} className="btn-primary">
              {editItem ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
