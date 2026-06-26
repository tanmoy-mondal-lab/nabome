import { MediaPicker } from "../common/MediaPicker";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/admin";
import { DataTable } from "../common/DataTable";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { useToast } from "../../components/ui/Toast";
import { Plus, Edit3, Trash2 } from "lucide-react";

export default function SubcategoriesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", categoryId: "", description: "", imageUrl: "", imagePublicId: "", sortOrder: 0, isActive: true });

  const { data: subs = [], isLoading } = useQuery({
    queryKey: ["admin", "subcategories"],
    queryFn: () => adminApi.getSubcategories().then((r) => r.subcategories ?? []),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => adminApi.getCategories().then((r) => r.categories ?? []),
  });

  function openCreate() { setEdit(null); setForm({ name: "", slug: "", categoryId: "", description: "", imageUrl: "", imagePublicId: "", sortOrder: 0, isActive: true }); setShowModal(true); }

  function openEdit(sub: Record<string, unknown>) {
    setEdit(sub);
    setForm({
      name: sub.name as string ?? "", slug: sub.slug as string ?? "",
      categoryId: (sub.categoryId as string) ?? (sub.category as Record<string, unknown>)?.id as string ?? "",
      description: sub.description as string ?? "", imageUrl: sub.imageUrl as string ?? "", imagePublicId: sub.imagePublicId as string ?? "",
      sortOrder: (sub.sortOrder as number) ?? 0, isActive: (sub.isActive as boolean) ?? true,
    });
    setShowModal(true);
  }

  const saveMutation = useMutation({
    mutationFn: (data: { id?: string; payload: Record<string, unknown> }) =>
      data.id ? adminApi.updateSubcategory(data.id, data.payload) : adminApi.createSubcategory(data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "subcategories"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setShowModal(false);
      toast(edit ? "Subcategory updated" : "Subcategory created", "success");
    },
    onError: (err: Error) => toast(`Failed to save subcategory: ${err.message ?? "Unknown error"}`, "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteSubcategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "subcategories"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast("Subcategory deleted", "success");
    },
    onError: (err: Error) => toast(`Failed to delete subcategory: ${err.message ?? "Unknown error"}`, "error"),
  });

  function handleSave() {
    if (!form.categoryId) return;
    saveMutation.mutate({ id: edit?.id as string | undefined, payload: { ...form } });
  }

  function handleDelete(id: string) {
    deleteMutation.mutate(id);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display text-neutral-900">Subcategories</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage subcategories within main categories</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 text-sm font-medium rounded hover:bg-neutral-800">
          <Plus className="w-4 h-4" /> Add Subcategory
        </button>
      </div>

      {subs.length === 0 && !isLoading ? <EmptyState title="No subcategories" description="Create subcategories within your main categories." action={<button onClick={openCreate} className="bg-neutral-900 text-white px-4 py-2 text-sm rounded">Add Subcategory</button>} />
        : <DataTable columns={[
          { key: "name", label: "Name", sortable: true },
          { key: "category", label: "Category", render: (item) => { const c = (item as Record<string, unknown>).category as Record<string, unknown>; return c?.name as string ?? "—"; } },
          { key: "slug", label: "Slug" },
          { key: "description", label: "Description" },
          { key: "isActive", label: "Status", render: (item) => { const v = (item as Record<string, unknown>).isActive as boolean; return <span className={`text-xs px-2 py-1 rounded ${v ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"}`}>{v ? "Active" : "Archived"}</span>; } },
          { key: "_count", label: "Products", render: (item) => <span className="text-xs bg-neutral-100 px-2 py-1 rounded">{(((item as Record<string, unknown>)._count as Record<string, number>)?.products ?? 0)}</span> },
        ]} data={subs} isLoading={isLoading} actions={(row) => <><button onClick={() => openEdit(row as Record<string, unknown>)} className="p-1.5 text-neutral-400 hover:text-neutral-600"><Edit3 className="w-4 h-4" /></button>
          <button onClick={() => handleDelete((row as Record<string, unknown>).id as string)} className="p-1.5 text-neutral-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
        </>} />}

      <Modal open={showModal} title={edit ? "Edit Subcategory" : "Create Subcategory"} onClose={() => setShowModal(false)}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs text-neutral-500 mb-1">Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: edit ? form.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") })} className="w-full px-3 py-2 text-sm border rounded" /></div>
            <div><label className="block text-xs text-neutral-500 mb-1">Slug</label><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full px-3 py-2 text-sm border rounded" /></div>
          </div>
          <div><label className="block text-xs text-neutral-500 mb-1">Parent Category *</label><select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full px-3 py-2 text-sm border rounded"><option value="">Select...</option>{(categories as Record<string, unknown>[]).map((c) => <option key={c.id as string} value={c.id as string}>{c.name as string}</option>)}</select></div>
          <div><label className="block text-xs text-neutral-500 mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 text-sm border rounded" /></div>
          <div><MediaPicker value={form.imageUrl} onChange={(url, publicId) => setForm({ ...form, imageUrl: url, imagePublicId: publicId ?? "" })} label="Image URL" folder="categories" /></div>
          <div><label className="block text-xs text-neutral-500 mb-1">Sort Order</label><input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 text-sm border rounded" /></div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded border-neutral-300" />
            <span className="text-sm text-neutral-700">Active</span>
          </label>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t mt-4">
          <button onClick={() => setShowModal(false)} type="button" className="px-4 py-2 text-sm border border-neutral-200 rounded text-neutral-600 hover:bg-neutral-50">Cancel</button>
          <button onClick={handleSave} type="button" disabled={saveMutation.isPending} className="px-4 py-2 text-sm bg-neutral-900 text-white rounded hover:bg-neutral-800 disabled:opacity-50">{saveMutation.isPending ? "Saving..." : "Save"}</button>
        </div>
      </Modal>
    </div>
  );
}
