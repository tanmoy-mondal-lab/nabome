import { SafeImage } from "../../components/SafeImage";
import { MediaPicker } from "../common/MediaPicker";
import { useState, useEffect } from "react";
import { adminApi } from "../../lib/api/admin";
import { DataTable } from "../common/DataTable";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { Plus, Edit3, Trash2, Search } from "lucide-react";

export default function BrandsPage() {
  const [brands, setBrands] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState<Record<string, string> | null>(null);
  const [form, setForm] = useState({ name: "", description: "", logoUrl: "", websiteUrl: "", sortOrder: 0, isActive: true });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { const res = await adminApi.getBrands(); setBrands(res.brands ?? []); } catch { setBrands([]); }
    setLoading(false);
  }

  function openCreate() { setEdit(null); setForm({ name: "", description: "", logoUrl: "", websiteUrl: "", sortOrder: 0, isActive: true }); setShowModal(true); }

  function openEdit(brand: Record<string, unknown>) {
    setEdit(brand as Record<string, string>);
    setForm({ name: brand.name as string ?? "", description: brand.description as string ?? "", logoUrl: brand.logoUrl as string ?? "", websiteUrl: brand.websiteUrl as string ?? "", sortOrder: (brand.sortOrder as number) ?? 0, isActive: (brand.isActive as boolean) ?? true });
    setShowModal(true);
  }

  async function handleSave() {
    if (edit) { await adminApi.updateBrand(edit.id!, form); } else { await adminApi.createBrand(form); }
    setShowModal(false); load();
  }

  async function handleDelete(id: string) {
    if (window.confirm("Archive this brand?")) { await adminApi.deleteBrand(id); load(); }
  }

  const filtered = (brands as Record<string, unknown>[]).filter((b) => !search || ((b.name as string) ?? "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display text-neutral-900">Brands</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage product brands</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 text-sm font-medium rounded hover:bg-neutral-800">
          <Plus className="w-4 h-4" /> Add Brand
        </button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search brands..." className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-neutral-900" />
      </div>

      {filtered.length === 0 && !loading ? <EmptyState title="No brands found" description="Add your first brand to get started." action={<button onClick={openCreate} className="bg-neutral-900 text-white px-4 py-2 text-sm rounded">Add Brand</button>} />
        : <DataTable columns={[
          { key: "name", label: "Name", sortable: true },
          { key: "slug", label: "Slug" },
          { key: "description", label: "Description" },
          { key: "logoUrl", label: "Logo", render: (item) => { const v = (item as Record<string, unknown>).logoUrl as string; return v ? <SafeImage src={v} alt="" className="w-10 h-10 object-contain rounded border" useTransform={false} /> : null; } },
          { key: "websiteUrl", label: "Website" },
          { key: "_count", label: "Products", render: (item) => <span className="text-xs bg-neutral-100 px-2 py-1 rounded">{(((item as Record<string, unknown>)._count as Record<string, number>)?.products ?? 0)}</span> },
          { key: "isActive", label: "Status", render: (item) => { const v = (item as Record<string, unknown>).isActive as boolean; return <span className={`text-xs px-2 py-1 rounded ${v ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"}`}>{v ? "Active" : "Archived"}</span>; } },
        ]} data={filtered.map((b: Record<string, unknown>) => ({ ...b, _count: b._count ?? { products: 0 } }))} isLoading={loading} onRowClick={(row) => openEdit(row as Record<string, unknown>)} actions={(row) => <><button onClick={(e) => { e.stopPropagation(); openEdit(row as Record<string, unknown>); }} className="p-1.5 text-neutral-400 hover:text-neutral-600"><Edit3 className="w-4 h-4" /></button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete((row as Record<string, unknown>).id as string); }} className="p-1.5 text-neutral-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
        </>} />}

      <Modal open={showModal} title={edit ? "Edit Brand" : "Create Brand"} onClose={() => setShowModal(false)}>
        <div className="space-y-4">
          <div><label className="block text-xs text-neutral-500 mb-1">Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-neutral-900" /></div>
          <div className="text-[10px] text-neutral-400 -mt-2">Slug will be auto-generated from name</div>
          <div><label className="block text-xs text-neutral-500 mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-neutral-900" /></div>
          <div><MediaPicker value={form.logoUrl} onChange={(url) => setForm({ ...form, logoUrl: url })} label="Logo URL" folder="brands" /></div>
          <div><label className="block text-xs text-neutral-500 mb-1">Website URL</label><input value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-neutral-900" /></div>
          <div><label className="block text-xs text-neutral-500 mb-1">Sort Order</label><input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-neutral-900" /></div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded border-neutral-300" />
            <span className="text-sm text-neutral-700">Active</span>
          </label>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t mt-4">
          <button onClick={() => setShowModal(false)} type="button" className="px-4 py-2 text-sm border border-neutral-200 rounded text-neutral-600 hover:bg-neutral-50">Cancel</button>
          <button onClick={handleSave} type="button" className="px-4 py-2 text-sm bg-neutral-900 text-white rounded hover:bg-neutral-800">Save</button>
        </div>
      </Modal>
    </div>
  );
}
