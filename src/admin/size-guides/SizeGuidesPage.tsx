import { MediaPicker } from "../common/MediaPicker";
import { useState, useEffect } from "react";
import { adminApi } from "../../lib/api/admin";
import { DataTable } from "../common/DataTable";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { Plus, Edit3, Trash2, Search } from "lucide-react";

export default function SizeGuidesPage() {
  const [guides, setGuides] = useState<unknown[]>([]);
  const [categories, setCategories] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({ name: "", description: "", categoryId: "", type: "clothing", unit: "inches", imageUrl: "", measurements: "[]", isActive: true });
  const [measurementsArr, setMeasurementsArr] = useState<{ size: string; bust?: string; waist?: string; hips?: string; length?: string; chest?: string; shoulder?: string }[]>([]);

  useEffect(() => {
    Promise.all([adminApi.getSizeGuides(), adminApi.getCategories()]).then(([g, c]) => {
      setGuides(g.sizeGuides ?? []);
      setCategories(c.categories ?? []);
    }).catch(() => { /* non-critical: data will show as empty */ }).finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setEdit(null);
    setForm({ name: "", description: "", categoryId: "", type: "clothing", unit: "inches", imageUrl: "", measurements: "[]", isActive: true });
    setMeasurementsArr([]);
    setShowModal(true);
  }

  function openEdit(guide: Record<string, unknown>) {
    setEdit(guide);
    const m = Array.isArray(guide.measurements) ? guide.measurements as { size: string; bust?: string; waist?: string; hips?: string; length?: string; chest?: string; shoulder?: string }[] : [];
    setMeasurementsArr(m);
    setForm({
      name: guide.name as string ?? "",
      description: guide.description as string ?? "",
      categoryId: (guide.categoryId as string) ?? "",
      type: (guide.type as string) ?? "clothing",
      unit: (guide.unit as string) ?? "inches",
      imageUrl: (guide.imageUrl as string) ?? "",
      measurements: JSON.stringify(m),
      isActive: (guide.isActive as boolean) ?? true,
    });
    setShowModal(true);
  }

  function addMeasurement() {
    setMeasurementsArr([...measurementsArr, { size: "" }]);
  }

  function updateMeasurement(idx: number, field: string, value: string) {
    const updated = [...measurementsArr];
    updated[idx] = { ...updated[idx], [field]: value };
    setMeasurementsArr(updated);
  }

  function removeMeasurement(idx: number) {
    setMeasurementsArr(measurementsArr.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    const data = { ...form, measurements: measurementsArr, categoryId: form.categoryId || null };
    if (edit) { await adminApi.updateSizeGuide((edit.id as string), data); }
    else { await adminApi.createSizeGuide(data); }
    setShowModal(false);
    const g = await adminApi.getSizeGuides();
    setGuides(g.sizeGuides ?? []);
  }

  async function handleDelete(id: string) {
    await adminApi.deleteSizeGuide(id); setGuides((guides as Record<string, unknown>[]).filter((g) => g.id !== id));
  }

  const filtered = (guides as Record<string, unknown>[]).filter((g) => !search || ((g.name as string) ?? "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display text-neutral-900">Size Guides</h1>
          <p className="text-sm text-neutral-500 mt-1">Create and manage size charts for products and categories</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors">
          <Plus className="w-4 h-4" /> Add Size Guide
        </button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search size guides..." className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
      </div>

      {filtered.length === 0 && !loading ? <EmptyState title="No size guides yet" description="Create size charts for your products and categories." action={<button onClick={openCreate} className="bg-neutral-900 text-white px-4 py-2 text-sm rounded-lg transition-colors">Add Size Guide</button>} />
        : <DataTable columns={[
          { key: "name", label: "Name", sortable: true },
          { key: "type", label: "Type" },
          { key: "unit", label: "Unit" },
          { key: "category", label: "Category", render: (item) => { const c = (item as Record<string, unknown>).category as Record<string, unknown>; return c?.name as string ?? "—"; } },
          { key: "_count", label: "Products", render: (item) => <span className="text-xs bg-neutral-100 px-2 py-1 rounded">{(((item as Record<string, unknown>)._count as Record<string, number>)?.products ?? 0)}</span> },
          { key: "isActive", label: "Status", render: (item) => { const v = (item as Record<string, unknown>).isActive as boolean; return <span className={`text-xs px-2 py-1 rounded ${v ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"}`}>{v ? "Active" : "Inactive"}</span>; } },
        ]} data={filtered} isLoading={loading} actions={(row) => <><button onClick={() => openEdit(row as Record<string, unknown>)} className="p-1.5 text-neutral-400 hover:text-neutral-600"><Edit3 className="w-4 h-4" /></button>
          <button onClick={() => handleDelete((row as Record<string, unknown>).id as string)} className="p-1.5 text-neutral-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
        </>} />}

      <Modal open={showModal} title={edit ? "Edit Size Guide" : "Create Size Guide"} onClose={() => setShowModal(false)} size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div><label className="block text-xs text-neutral-500 mb-1">Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" /></div>
          <div><label className="block text-xs text-neutral-500 mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs text-neutral-500 mb-1">Category</label><select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"><option value="">All Categories</option>{(categories as Record<string, unknown>[]).map((c) => <option key={c.id as string} value={c.id as string}>{c.name as string}</option>)}</select></div>
            <div><label className="block text-xs text-neutral-500 mb-1">Type</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"><option value="clothing">Clothing</option><option value="shoes">Shoes</option><option value="accessories">Accessories</option><option value="rings">Rings</option></select></div>
          </div>
          <div><label className="block text-xs text-neutral-500 mb-1">Unit</label><select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"><option value="inches">Inches</option><option value="cm">Centimeters</option><option value="us">US</option><option value="uk">UK</option><option value="eu">EU</option></select></div>
          <div><MediaPicker value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} label="Image URL" folder="size-guides" /></div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded border-neutral-300" />
            <span className="text-sm text-neutral-700">Active</span>
          </label>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-medium text-neutral-700">Measurements</label>
              <button onClick={addMeasurement} className="text-xs text-neutral-600 hover:text-neutral-900 underline">+ Add Row</button>
            </div>
            {measurementsArr.length === 0 && <p className="text-xs text-neutral-400">No measurements defined.</p>}
            {measurementsArr.map((m, i) => (
              <div key={i} className="flex items-start gap-2 mb-2 p-2 bg-neutral-50 rounded">
                <div className="flex-1 grid grid-cols-4 gap-2">
                  <input placeholder="Size" value={m.size} onChange={(e) => updateMeasurement(i, "size", e.target.value)} className="px-2 py-1 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
                  <input placeholder="Bust" value={m.bust ?? ""} onChange={(e) => updateMeasurement(i, "bust", e.target.value)} className="px-2 py-1 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
                  <input placeholder="Waist" value={m.waist ?? ""} onChange={(e) => updateMeasurement(i, "waist", e.target.value)} className="px-2 py-1 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
                  <input placeholder="Hips" value={m.hips ?? ""} onChange={(e) => updateMeasurement(i, "hips", e.target.value)} className="px-2 py-1 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
                </div>
                <button onClick={() => removeMeasurement(i)} className="text-neutral-300 hover:text-red-500 mt-1"><Trash2 className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t mt-4">
          <button onClick={() => setShowModal(false)} type="button" className="border border-neutral-200 px-4 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 transition-colors">Cancel</button>
          <button onClick={handleSave} type="button" className="bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors">Save</button>
        </div>
      </Modal>
    </div>
  );
}
