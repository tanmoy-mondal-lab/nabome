import { useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { StatusBadge } from "../common/StatusBadge";
import { EmptyState } from "../common/EmptyState";
import { MediaPicker } from "../common/MediaPicker";
import { Plus, Edit3, Trash2, FileJson } from "lucide-react";
import { useToast } from "../../components/ui/Toast";

interface PageTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  thumbnail: string | null;
  thumbnailPublicId?: string | null;
  sections: unknown;
  isActive: boolean;
  useCount: number;
  createdAt: string;
}

export default function PageTemplatesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<PageTemplate | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", category: "custom", isActive: true, thumbnail: "", thumbnailPublicId: "" });
  const [sectionsJson, setSectionsJson] = useState("[]");

  const { data: templates = [], isLoading: loading } = useQuery<PageTemplate[]>({
    queryKey: ["admin", "templates"],
    queryFn: async () => {
      const res = await adminApi.getTemplates();
      return (res.templates as PageTemplate[]) ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; description: string | null; category: string; sections: unknown; isActive: boolean }) =>
      adminApi.createTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "templates"] });
      toast("Template created", "success");
    },
    onError: () => toast("Failed to create template", "error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name: string; description: string | null; category: string; sections: unknown; isActive: boolean } }) =>
      adminApi.updateTemplate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "templates"] });
      toast("Template updated", "success");
    },
    onError: () => toast("Failed to update template", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "templates"] });
      toast("Template deleted", "success");
    },
    onError: () => toast("Failed to delete template", "error"),
  });

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: "", description: "", category: "custom", isActive: true, thumbnail: "", thumbnailPublicId: "" });
    setSectionsJson("[]");
    setModalOpen(true);
  };

  const openEdit = (t: PageTemplate) => {
    setEditItem(t);
    setForm({ name: t.name, description: t.description ?? "", category: t.category, isActive: t.isActive, thumbnail: t.thumbnail ?? "", thumbnailPublicId: "" });
    setSectionsJson(JSON.stringify(t.sections, null, 2));
    setModalOpen(true);
  };

  const handleSave = () => {
    let sections;
    try { sections = JSON.parse(sectionsJson); } catch { toast("Invalid JSON in sections", "error"); return; }
    const payload = { name: form.name, description: form.description || null, category: form.category, sections, isActive: form.isActive, thumbnail: form.thumbnail || null, thumbnailPublicId: form.thumbnailPublicId || null };
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, payload }, { onSuccess: () => setModalOpen(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => setModalOpen(false) });
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, { onSuccess: () => setDeleteConfirm(null) });
  };

  const inputClass = "w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500";

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">Page Templates</h1>
          <p className="text-sm text-neutral-500 mt-1">{templates.length} templates for page layouts</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} /> Add Template
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded">
          <EmptyState icon={FileJson} title="No templates yet"
            action={<button onClick={openCreate} className="btn-primary">Create Template</button>} />
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Slug</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Category</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Used</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900">{t.name}</p>
                    {t.description && <p className="text-xs text-neutral-400 mt-0.5">{t.description}</p>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-neutral-500">{t.slug}</td>
                  <td className="px-4 py-3 capitalize text-neutral-500">{t.category}</td>
                  <td className="px-4 py-3 text-neutral-500">{t.useCount}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.isActive ? "active" : "inactive"} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(t)} className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100"><Edit3 size={14} /></button>
                      <button onClick={() => setDeleteConfirm(t.id)} className="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Template" : "New Template"} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
                <option value="custom">Custom</option>
                <option value="product">Product</option>
                <option value="collection">Collection</option>
                <option value="about">About</option>
                <option value="contact">Contact</option>
                <option value="landing">Landing</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
          </div>
          <div>
            <MediaPicker value={form.thumbnail} onChange={(url, publicId) => setForm({ ...form, thumbnail: url, thumbnailPublicId: publicId ?? "" })} label="Thumbnail URL" folder="page-builder" />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Sections (JSON) *</label>
            <textarea rows={8} value={sectionsJson} onChange={(e) => setSectionsJson(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-brand-500" />
            <span className="text-xs text-neutral-600">Active</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-neutral-500">Cancel</button>
            <button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50">
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Template" size="sm">
        <p className="text-sm text-neutral-600 mb-2">Are you sure you want to delete this template?</p>
        <p className="text-xs text-neutral-400 mb-6">This action cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-neutral-500">Cancel</button>
          <button onClick={() => handleDelete(deleteConfirm!)} disabled={deleteMutation.isPending} className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50">
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
