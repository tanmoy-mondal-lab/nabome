import { useState, useEffect } from "react";
import { adminApi } from "../../lib/api/admin";
import { DataTable } from "../common/DataTable";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { Plus, Edit3, Trash2 } from "lucide-react";

export default function SubcategoriesPage() {
  const [subs, setSubs] = useState<unknown[]>([]);
  const [categories, setCategories] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({ name: "", categoryId: "", description: "", imageUrl: "", sortOrder: 0 });

  useEffect(() => {
    Promise.all([adminApi.getSubcategories(), adminApi.getCategories()]).then(([s, c]) => {
      setSubs(s.subcategories ?? []); setCategories(c.categories ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  function openCreate() { setEdit(null); setForm({ name: "", categoryId: "", description: "", imageUrl: "", sortOrder: 0 }); setShowModal(true); }

  function openEdit(sub: Record<string, unknown>) {
    setEdit(sub);
    setForm({
      name: sub.name as string ?? "", categoryId: (sub.categoryId as string) ?? (sub.category as Record<string, unknown>)?.id as string ?? "",
      description: sub.description as string ?? "", imageUrl: sub.imageUrl as string ?? "", sortOrder: (sub.sortOrder as number) ?? 0,
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (edit) await adminApi.updateSubcategory(edit.id as string, form);
    else await adminApi.createSubcategory(form);
    setShowModal(false);
    const s = await adminApi.getSubcategories(); setSubs(s.subcategories ?? []);
  }

  async function handleDelete(id: string) {
    if (window.confirm("Archive this subcategory?")) { await adminApi.deleteSubcategory(id); setSubs((subs as Record<string, unknown>[]).filter((s) => s.id !== id)); }
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

      {subs.length === 0 && !loading ? <EmptyState title="No subcategories" description="Create subcategories within your main categories." action={<button onClick={openCreate} className="bg-neutral-900 text-white px-4 py-2 text-sm rounded">Add Subcategory</button>} />
        : <DataTable columns={[
          { key: "name", label: "Name", sortable: true },
          { key: "category", label: "Category", render: (item) => { const c = (item as Record<string, unknown>).category as Record<string, unknown>; return c?.name as string ?? "—"; } },
          { key: "slug", label: "Slug" },
          { key: "description", label: "Description" },
          { key: "isActive", label: "Status", render: (item) => { const v = (item as Record<string, unknown>).isActive as boolean; return <span className={`text-xs px-2 py-1 rounded ${v ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"}`}>{v ? "Active" : "Archived"}</span>; } },
          { key: "_count", label: "Products", render: (item) => <span className="text-xs bg-neutral-100 px-2 py-1 rounded">{(((item as Record<string, unknown>)._count as Record<string, number>)?.products ?? 0)}</span> },
        ]} data={subs} isLoading={loading} actions={(row) => <><button onClick={() => openEdit(row as Record<string, unknown>)} className="p-1.5 text-neutral-400 hover:text-neutral-600"><Edit3 className="w-4 h-4" /></button>
          <button onClick={() => handleDelete((row as Record<string, unknown>).id as string)} className="p-1.5 text-neutral-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
        </>} />}

      <Modal open={showModal} title={edit ? "Edit Subcategory" : "Create Subcategory"} onClose={() => setShowModal(false)}>
        <div className="space-y-4">
          <div><label className="block text-xs text-neutral-500 mb-1">Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 text-sm border rounded" /></div>
          <div><label className="block text-xs text-neutral-500 mb-1">Parent Category *</label><select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full px-3 py-2 text-sm border rounded"><option value="">Select...</option>{(categories as Record<string, unknown>[]).map((c) => <option key={c.id as string} value={c.id as string}>{c.name as string}</option>)}</select></div>
          <div><label className="block text-xs text-neutral-500 mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 text-sm border rounded" /></div>
          <div><label className="block text-xs text-neutral-500 mb-1">Image URL</label><input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="w-full px-3 py-2 text-sm border rounded" /></div>
          <div><label className="block text-xs text-neutral-500 mb-1">Sort Order</label><input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 text-sm border rounded" /></div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t mt-4">
          <button onClick={() => setShowModal(false)} type="button" className="px-4 py-2 text-sm border border-neutral-200 rounded text-neutral-600 hover:bg-neutral-50">Cancel</button>
          <button onClick={handleSave} type="button" className="px-4 py-2 text-sm bg-neutral-900 text-white rounded hover:bg-neutral-800">Save</button>
        </div>
      </Modal>
    </div>
  );
}
