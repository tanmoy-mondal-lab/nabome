import { useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { Edit3, Trash2, Plus, LayoutList, GripVertical } from "lucide-react";
import { useToast } from "../../components/ui/Toast";

interface FooterSection {
  id: string;
  title: string;
  contentType: string;
  content: string;
  sortOrder: number;
  isActive: boolean;
  links?: FooterLink[];
}

interface FooterLink {
  id: string;
  label: string;
  url: string;
}

export default function FooterBuilder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<FooterSection | null>(null);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<{ index?: number; link: FooterLink } | null>(null);
  const [form, setForm] = useState({ title: "", contentType: "links", content: "", isActive: true, links: [] as FooterLink[], column: 1 });
  const [linkForm, setLinkForm] = useState({ label: "", url: "" });

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
    setForm({ title: "", contentType: "links", content: "", isActive: true, links: [], column: 1 });
    setModalOpen(true);
  };

  const openEdit = (sec: FooterSection) => {
    setEditItem(sec);
    setForm({
      title: sec.title, contentType: sec.contentType, content: typeof sec.content === 'object' ? JSON.stringify(sec.content) : (sec.content ?? ""),
      isActive: sec.isActive, links: sec.links ?? [], column: (sec as unknown as { column?: number }).column ?? 1,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    const payload: Record<string, unknown> = {
      title: form.title, contentType: form.contentType, content: form.contentType === 'links' ? JSON.stringify({ links: form.links }) : form.content,
      isActive: form.isActive, sortOrder: editItem?.sortOrder ?? sections.length, column: form.column,
    };
    saveMutation.mutate({ id: editItem?.id, data: payload });
  };

  const openAddLink = () => {
    setEditingLink(null);
    setLinkForm({ label: "", url: "" });
    setLinkModalOpen(true);
  };

  const openEditLink = (index: number, link: FooterLink) => {
    setEditingLink({ index, link });
    setLinkForm({ label: link.label, url: link.url });
    setLinkModalOpen(true);
  };

  const handleSaveLink = () => {
    if (!linkForm.label || !linkForm.url) return;
    
    const newLink: FooterLink = {
      id: editingLink?.link.id || `link-${Date.now()}`,
      label: linkForm.label,
      url: linkForm.url,
    };

    let newLinks = [...form.links];
    
    if (editingLink) {
      newLinks[editingLink.index!] = newLink;
    } else {
      newLinks.push(newLink);
    }
    
    setForm({ ...form, links: newLinks });
    setLinkModalOpen(false);
  };

  const handleDeleteLink = (index: number) => {
    const newLinks = form.links.filter((_, i) => i !== index);
    setForm({ ...form, links: newLinks });
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
              {form.contentType === 'links' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs text-neutral-500">Links</label>
                    <button onClick={openAddLink} className="text-xs bg-brand-500 text-white px-2 py-1 rounded hover:bg-brand-600">
                      + Add Link
                    </button>
                  </div>
                  <div className="border border-neutral-200 rounded divide-y divide-neutral-100">
                    {form.links.length === 0 ? (
                      <div className="p-4 text-center text-sm text-neutral-400">
                        No links yet. Click "+ Add Link" to add footer links.
                      </div>
                    ) : (
                      form.links.map((link, idx) => (
                        <div key={link.id} className="p-3 flex items-center gap-2">
                          <GripVertical size={14} className="text-neutral-300" />
                          <span className="flex-1 text-sm font-medium text-neutral-900">{link.label}</span>
                          <span className="text-xs text-neutral-400">{link.url}</span>
                          <button onClick={() => openEditLink(idx, link)} className="p-1 hover:bg-neutral-100 rounded text-neutral-400">
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => handleDeleteLink(idx)} className="p-1 hover:bg-red-50 rounded text-neutral-400 hover:text-red-500">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
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

          <Modal open={linkModalOpen} onClose={() => setLinkModalOpen(false)} title={editingLink ? "Edit Link" : "Add Link"} size="md">
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Label *</label>
                <input required value={linkForm.label}
                  onChange={(e) => setLinkForm({ ...linkForm, label: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="e.g., About Us"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">URL *</label>
                <input required value={linkForm.url}
                  onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="e.g., /about"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setLinkModalOpen(false)} className="px-4 py-2 text-sm text-neutral-500">Cancel</button>
                <button 
                  onClick={handleSaveLink}
                  disabled={!linkForm.label || !linkForm.url}
                  className="bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
                >
                  {editingLink ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
}
