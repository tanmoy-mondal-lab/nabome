import { MediaPicker } from "../common/MediaPicker";
import { useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { SafeImage } from "../../components/SafeImage";
import { Edit3, Trash2, Plus, LayoutGrid } from "lucide-react";
import { formatDate } from "../../lib/utils/format";
import { useToast } from "../../components/ui/Toast";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  isFeatured?: boolean;
  sortOrder: number;
  startDate?: string;
  endDate?: string;
  metaTitle?: string;
  metaDesc?: string;
  heroImageUrl?: string;
  _count: { products: number };
}

export default function CollectionsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Collection | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", isActive: true, isFeatured: false, sortOrder: 0, imageUrl: "", startDate: "", endDate: "", metaTitle: "", metaDesc: "" });

  const { data: collections = [], isLoading: loading } = useQuery<Collection[]>({
    queryKey: ["admin", "collections"],
    queryFn: async () => {
      const res = await adminApi.getCollections();
      return (res.collections as Collection[]) ?? [];
    },
  });

  const invalidateCollections = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "collections"] });
    queryClient.invalidateQueries({ queryKey: ["collections"] });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, heroImageUrl: form.imageUrl || undefined, image: undefined };
      if (editItem) {
        return adminApi.updateCollection(editItem.id, payload);
      }
      return adminApi.createCollection(payload);
    },
    onSuccess: () => {
      setModalOpen(false);
      invalidateCollections();
      toast(editItem ? "Collection updated" : "Collection created", "success");
    },
    onError: () => {
      toast("Failed to save collection", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteCollection(id),
    onSuccess: () => {
      invalidateCollections();
      toast("Collection deleted", "success");
    },
    onError: () => {
      toast("Failed to delete collection", "error");
    },
  });

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: "", slug: "", description: "", isActive: true, isFeatured: false, sortOrder: 0, imageUrl: "", startDate: "", endDate: "", metaTitle: "", metaDesc: "" });
    setModalOpen(true);
  };

  const openEdit = (col: Collection) => {
    setEditItem(col);
    setForm({
      name: col.name, slug: col.slug, description: col.description ?? "",
      isActive: col.isActive, isFeatured: col.isFeatured ?? false, sortOrder: col.sortOrder,
      imageUrl: col.heroImageUrl ?? "", startDate: col.startDate ? col.startDate.slice(0, 16) : "",
      endDate: col.endDate ? col.endDate.slice(0, 16) : "", metaTitle: col.metaTitle ?? "", metaDesc: col.metaDesc ?? "",
    });
    setModalOpen(true);
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
          className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
        >
          <Plus size={16} /> Add Collection
        </button>
      </div>

      {collections.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-lg">
          <EmptyState
            icon={LayoutGrid}
            title="No collections yet"
            description="Group products into themed collections"
            action={
              <button onClick={openCreate} className="bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                Create Collection
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((col) => (
            <div key={col.id} className="bg-white border border-neutral-200 rounded-lg overflow-hidden group">
              <div className="aspect-[16/9] bg-neutral-100 relative">
                {col.heroImageUrl ? (
                  <SafeImage src={col.heroImageUrl} alt={col.name} className="w-full h-full object-cover" useTransform={false} />
                ) : (
                  <div className="flex items-center justify-center h-full text-neutral-300">
                    <LayoutGrid size={32} />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(col)} className="bg-white p-1.5 rounded shadow text-neutral-600 hover:text-neutral-900">
                    <Edit3 size={12} />
                  </button>
                  <button onClick={() => deleteMutation.mutate(col.id)} className="bg-white p-1.5 rounded shadow text-red-500 hover:text-red-600">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm text-neutral-900">{col.name}</h3>
                  <div className="flex gap-1">
                    {col.isFeatured && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">Featured</span>}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                      col.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                    }`}>
                      {col.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  {col._count?.products ?? 0} products · Order {col.sortOrder}
                  {col.startDate && <> · {formatDate(col.startDate)}{col.endDate ? ` — ${formatDate(col.endDate)}` : ""}</>}
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
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Sort Order</label>
              <input
                type="number" value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
            </div>
          </div>
          <div>
            <MediaPicker value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} label="Image URL" folder="collections" />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Description</label>
            <textarea
              rows={2} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Start Date</label>
              <input type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">End Date</label>
              <input type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Meta Title</label>
              <input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Meta Description</label>
              <input value={form.metaDesc} onChange={(e) => setForm({ ...form, metaDesc: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-brand-500" />
              <span className="text-xs text-neutral-600">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="accent-brand-500" />
              <span className="text-xs text-neutral-600">Featured</span>
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="border border-neutral-200 px-4 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 transition-colors">Cancel</button>
            <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50">
              {saveMutation.isPending ? "Saving..." : editItem ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
