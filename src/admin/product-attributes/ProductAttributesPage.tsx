import { useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { SlidersHorizontal, Plus, Edit3, Trash2, Search } from "lucide-react";
import { useToast } from "../../components/ui/Toast";

interface Attribute {
  id: string;
  productId: string;
  name: string;
  value: string;
  createdAt: string;
}

export default function ProductAttributesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [productId, setProductId] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Attribute | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", value: "" });

  const { data: attributes = [], isLoading: loading } = useQuery<Attribute[]>({
    queryKey: ["admin", "productAttributes", selectedId],
    queryFn: async () => {
      const res = await adminApi.getProductAttributes(selectedId);
      return (res.attributes as Attribute[]) ?? [];
    },
    enabled: !!selectedId,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "productAttributes"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editItem) {
        await adminApi.updateProductAttribute(editItem.id, { name: form.name, value: form.value });
      } else {
        await adminApi.createProductAttribute(selectedId, { name: form.name, value: form.value });
      }
    },
    onSuccess: () => {
      setModalOpen(false);
      invalidateAll();
      toast(editItem ? "Attribute updated" : "Attribute created", "success");
    },
    onError: () => {
      toast("Failed to save attribute", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminApi.deleteProductAttribute(id);
    },
    onSuccess: () => {
      setDeleteConfirm(null);
      invalidateAll();
      toast("Attribute deleted", "success");
    },
    onError: () => {
      toast("Failed to delete attribute", "error");
    },
  });

  const handleSearch = () => {
    const trimmed = productId.trim();
    if (trimmed) {
      setSelectedId(trimmed);
    }
  };

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: "", value: "" });
    setModalOpen(true);
  };

  const openEdit = (a: Attribute) => {
    setEditItem(a);
    setForm({ name: a.name, value: a.value });
    setModalOpen(true);
  };

  const handleSave = () => saveMutation.mutate();
  const handleDelete = (id: string) => deleteMutation.mutate(id);

  const inputClass = "w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">Product Attributes</h1>
          <p className="text-sm text-neutral-500 mt-1">{attributes.length} attribute{attributes.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter Product ID..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <button onClick={handleSearch} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-neutral-800">
          Search
        </button>
      </div>

      {!selectedId ? (
        <div className="bg-white border border-neutral-200 rounded">
          <EmptyState icon={SlidersHorizontal} title="Select a Product"
            description="Enter a Product ID above to view its attributes" />
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : attributes.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded">
          <EmptyState icon={SlidersHorizontal} title="No attributes yet"
            description="Add attributes for this product"
            action={<button onClick={openCreate} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm">Create Attribute</button>} />
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-neutral-50">
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Product ID: {selectedId}</span>
            <button onClick={openCreate} className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-neutral-800">
              <Plus size={16} /> Add Attribute
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Value</th>
                <th className="text-right px-4 py-3 font-medium text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {attributes.map((a) => (
                <tr key={a.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-neutral-900">{a.name}</td>
                  <td className="px-4 py-3 text-neutral-600">{a.value}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(a)} className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded"><Edit3 size={14} /></button>
                      <button onClick={() => setDeleteConfirm(a.id)} className="p-1.5 text-red-400 hover:text-red-600 rounded"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Attribute" : "New Attribute"}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Value *</label>
            <input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className={inputClass} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-neutral-500">Cancel</button>
            <button onClick={handleSave} disabled={saveMutation.isPending} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50">
              {saveMutation.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Attribute" size="sm">
        <p className="text-sm text-neutral-600 mb-6">Delete this product attribute?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-neutral-500">Cancel</button>
          <button onClick={() => handleDelete(deleteConfirm!)} disabled={deleteMutation.isPending} className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50">
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
