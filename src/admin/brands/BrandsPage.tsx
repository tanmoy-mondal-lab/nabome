import { SafeImage } from "../../components/SafeImage";
import { MediaPicker } from "../common/MediaPicker";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/admin";
import { DataTable } from "../common/DataTable";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { useToast } from "../../components/ui/Toast";
import { Plus, Edit3, Trash2, Search } from "lucide-react";

interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  logoPublicId?: string;
  websiteUrl?: string;
  sortOrder: number;
  isActive: boolean;
  _count?: { products: number };
}

const defaultForm = { name: "", description: "", logoUrl: "", logoPublicId: "", websiteUrl: "", sortOrder: 0, isActive: true };

export default function BrandsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState<Brand | null>(null);
  const [form, setForm] = useState(defaultForm);

  const { data: brands = [], isLoading: loading, error: queryError } = useQuery<Brand[]>({
    queryKey: ["admin", "brands"],
    queryFn: async () => {
      const res = await adminApi.getBrands();
      return (res.brands ?? []) as Brand[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data: typeof defaultForm & { id?: string }) => {
      if (data.id) return adminApi.updateBrand(data.id, data);
      return adminApi.createBrand(data);
    },
    onSuccess: () => {
      const wasEditing = !!edit;
      queryClient.invalidateQueries({ queryKey: ["admin", "brands"] });
      setShowModal(false);
      setEdit(null);
      toast(wasEditing ? "Brand updated" : "Brand created", "success");
    },
    onError: () => toast("Failed to save brand", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "brands"] });
      toast("Brand deleted", "success");
    },
    onError: () => toast("Failed to delete brand", "error"),
  });

  function openCreate() {
    setEdit(null);
    setForm(defaultForm);
    setShowModal(true);
  }

  function openEdit(brand: Brand) {
    setEdit(brand);
    setForm({ name: brand.name ?? "", description: brand.description ?? "", logoUrl: brand.logoUrl ?? "", logoPublicId: brand.logoPublicId ?? "", websiteUrl: brand.websiteUrl ?? "", sortOrder: brand.sortOrder ?? 0, isActive: brand.isActive ?? true });
    setShowModal(true);
  }

  function handleSave() {
    if (!form.name.trim()) return;
    saveMutation.mutate(edit ? { ...form, id: edit.id } : form);
  }

  const filtered = brands.filter((b) => !search || (b.name ?? "").toLowerCase().includes(search.toLowerCase()));
  const fetchError = queryError ? (queryError instanceof Error ? queryError.message : "Failed to load brands") : null;

  return (
    <div className="p-6 space-y-6">
      {fetchError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{fetchError}</div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display text-neutral-900">Brands</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage product brands</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors">
          <Plus className="w-4 h-4" /> Add Brand
        </button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search brands..." className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
      </div>

      {filtered.length === 0 && !loading ? <EmptyState title="No brands found" description="Add your first brand to get started." action={<button onClick={openCreate} className="bg-neutral-900 text-white px-4 py-2 text-sm rounded-lg transition-colors">Add Brand</button>} />
        : <DataTable columns={[
          { key: "name", label: "Name", sortable: true },
          { key: "slug", label: "Slug" },
          { key: "description", label: "Description" },
          { key: "logoUrl", label: "Logo", render: (item) => { const b = item as Brand; return b.logoUrl ? <SafeImage src={b.logoUrl} alt="" className="w-10 h-10 object-contain rounded border" useTransform={false} /> : null; } },
          { key: "websiteUrl", label: "Website" },
          { key: "_count", label: "Products", render: (item) => <span className="text-xs bg-neutral-100 px-2 py-1 rounded">{((item as Brand)._count?.products ?? 0)}</span> },
          { key: "isActive", label: "Status", render: (item) => { const b = item as Brand; return <span className={`text-xs px-2 py-1 rounded ${b.isActive ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"}`}>{b.isActive ? "Active" : "Archived"}</span>; } },
        ]} data={filtered.map((b) => ({ ...b, _count: b._count ?? { products: 0 } }))} isLoading={loading} onRowClick={(row) => openEdit(row as Brand)} actions={(row) => <><button onClick={(e) => { e.stopPropagation(); openEdit(row as Brand); }} className="p-1.5 text-neutral-400 hover:text-neutral-600"><Edit3 className="w-4 h-4" /></button>
          <button onClick={(e) => { e.stopPropagation(); deleteMutation.mutate((row as Brand).id); }} className="p-1.5 text-neutral-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
        </>} />}

      <Modal open={showModal} title={edit ? "Edit Brand" : "Create Brand"} onClose={() => setShowModal(false)}>
        <div className="space-y-4">
          <div><label className="block text-xs text-neutral-500 mb-1">Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" /></div>
          <div className="text-[10px] text-neutral-400 -mt-2">Slug will be auto-generated from name</div>
          <div><label className="block text-xs text-neutral-500 mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" /></div>
          <div><MediaPicker value={form.logoUrl} onChange={(url, publicId) => setForm({ ...form, logoUrl: url, logoPublicId: publicId ?? "" })} label="Logo URL" folder="brands" /></div>
          <div><label className="block text-xs text-neutral-500 mb-1">Website URL</label><input value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" /></div>
          <div><label className="block text-xs text-neutral-500 mb-1">Sort Order</label><input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" /></div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded border-neutral-300" />
            <span className="text-sm text-neutral-700">Active</span>
          </label>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t mt-4">
          <button onClick={() => setShowModal(false)} type="button" className="border border-neutral-200 px-4 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 transition-colors">Cancel</button>
          <button onClick={handleSave} type="button" disabled={saveMutation.isPending} className="bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors">{saveMutation.isPending ? "Saving..." : "Save"}</button>
        </div>
      </Modal>
    </div>
  );
}
