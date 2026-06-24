import { useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { Edit3, Trash2, Plus, LayoutList } from "lucide-react";
import { useToast } from "../../components/ui/Toast";

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
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<FooterSection | null>(null);
  const [form, setForm] = useState({ title: "", contentType: "links", content: "", isActive: true, linksRaw: "[]", column: 1 });

  const { data: sections = [], isLoading: loading, error: queryError } = useQuery<FooterSection[]>({
    queryKey: ["admin", "footer"],
    queryFn: async () => {
      const res = await adminApi.getFooterSections();
      return (res.sections as FooterSection[]) ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: { id?: string; data: Record<string, unknown> }) => {
      if (payload.id) {
        await adminApi.updateFooterSection(payload.id, payload.data);
      } else {
        await adminApi.createFooterSection(payload.data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "footer"] });
      queryClient.invalidateQueries({ queryKey: ["footer"] });
      setModalOpen(false);
      toast(editItem ? "Section updated" : "Section created", "success");
    },
    onError: (err: Error) => {
      toast(err.message || "Failed to save section", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminApi.deleteFooterSection(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "footer"] });
      queryClient.invalidateQueries({ queryKey: ["footer"] });
      toast("Section deleted", "success");
    },
    onError: (err: Error) => {
      toast(err.message || "Failed to delete section", "error");
    },
  });

  const openCreate = () => {
    setEditItem(null);
    setForm({ title: "", contentType: "links", content: "", isActive: true, linksRaw: "[]", column: 1 });
    setModalOpen(true);
  };

  const openEdit = (sec: FooterSection) => {
    setEditItem(sec);
    setForm({
      title: sec.title, contentType: sec.contentType, content: typeof sec.content === 'object' ? JSON.stringify(sec.content) : (sec.content ?? ""),
      isActive: sec.isActive, linksRaw: JSON.stringify(sec.links ?? [], null, 2), column: (sec as unknown as { column?: number }).column ?? 1,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    const links = JSON.parse(form.linksRaw || "[]");
    const payload: Record<string, unknown> = {
      title: form.title, contentType: form.contentType, content: form.linksRaw ? JSON.stringify({ links }) : form.content,
      isActive: form.isActive, sortOrder: editItem?.sortOrder ?? sections.length, column: form.column,
    };
    saveMutation.mutate({ id: editItem?.id, data: payload });
  };

  const handleDelete = (id: string) => {
    const sec = sections.find((s) => s.id === id);
    if (!window.confirm(`Delete "${sec?.title ?? "this section"}"? This cannot be undone.`)) return;
    deleteMutation.mutate(id);
  };

  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to load footer sections") : null;

  return (
    <div>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}
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
              <div className="grid-cols-1 sm:grid-cols-2 gap-4">
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
                <label className="block text-xs text-neutral-500 mb-1">Column</label>
                <input type="number" min={1} max={12} value={form.column}
                  onChange={(e) => setForm({ ...form, column: Number(e.target.value) || 1 })}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500" />
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
                <button onClick={handleSave} disabled={saveMutation.isPending}
                  className="bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50">
                  {saveMutation.isPending ? "Saving..." : editItem ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
}
