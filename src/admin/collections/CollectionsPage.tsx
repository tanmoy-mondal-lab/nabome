import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { Edit3, Trash2, Plus, LayoutGrid } from "lucide-react";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  _count: { products: number };
  image?: { url: string };
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Collection | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", isActive: true, sortOrder: 0, imageUrl: "" });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCollections();
      setCollections((res.collections as Collection[]) ?? []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: "", slug: "", description: "", isActive: true, sortOrder: 0, imageUrl: "" });
    setModalOpen(true);
  };

  const openEdit = (col: Collection) => {
    setEditItem(col);
    setForm({
      name: col.name, slug: col.slug, description: col.description ?? "",
      isActive: col.isActive, sortOrder: col.sortOrder,
      imageUrl: col.image?.url ?? "",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...form, image: form.imageUrl ? { url: form.imageUrl } : undefined };
      if (editItem) {
        await adminApi.updateCollection(editItem.id, payload);
      } else {
        await adminApi.createCollection(payload);
      }
      setModalOpen(false);
      fetch();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this collection?")) return;
    try {
      await adminApi.deleteCollection(id);
      fetch();
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">Collections</h1>
          <p className="text-sm text-neutral-500 mt-1">Curate product collections</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded text-sm font-medium hover:bg-neutral-800"
        >
          <Plus size={16} /> Add Collection
        </button>
      </div>

      {collections.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded">
          <EmptyState
            icon={LayoutGrid}
            title="No collections yet"
            description="Group products into themed collections"
            action={
              <button onClick={openCreate} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm">
                Create Collection
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((col) => (
            <div key={col.id} className="bg-white border border-neutral-200 rounded overflow-hidden group">
              <div className="aspect-[16/9] bg-neutral-100 relative">
                {col.image?.url ? (
                  <img src={col.image.url} alt={col.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-neutral-300">
                    <LayoutGrid size={32} />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(col)} className="bg-white p-1.5 rounded shadow text-neutral-600 hover:text-neutral-900">
                    <Edit3 size={12} />
                  </button>
                  <button onClick={() => handleDelete(col.id)} className="bg-white p-1.5 rounded shadow text-red-500 hover:text-red-600">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm text-neutral-900">{col.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                    col.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                  }`}>
                    {col.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  {col._count?.products ?? 0} products · Order {col.sortOrder}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Collection" : "New Collection"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Name *</label>
              <input
                required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value, slug: editItem ? form.slug : e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Sort Order</label>
              <input
                type="number" value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Image URL</label>
            <input
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Description</label>
            <textarea
              rows={3} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox" checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="accent-brand-500"
            />
            <span className="text-xs text-neutral-600">Active</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-neutral-500">Cancel</button>
            <button onClick={handleSave} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium">
              {editItem ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
