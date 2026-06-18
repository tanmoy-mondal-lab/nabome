import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { Edit3, Trash2, Plus, Folder } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  parent?: { name: string };
  _count: { products: number; children: number };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", parentId: "" });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCategories();
      setCategories((res.categories as Category[]) ?? []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: "", slug: "", description: "", parentId: "" });
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditItem(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description ?? "", parentId: cat.parentId ?? "" });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editItem) {
        await adminApi.updateCategory(editItem.id, form);
      } else {
        await adminApi.createCategory(form);
      }
      setModalOpen(false);
      fetch();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await adminApi.deleteCategory(id);
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
          <h1 className="font-display text-2xl text-neutral-900">Categories</h1>
          <p className="text-sm text-neutral-500 mt-1">Organize your product categories</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded text-sm font-medium hover:bg-neutral-800"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded">
          <EmptyState
            icon={Folder}
            title="No categories yet"
            description="Create your first category to organize products"
            action={
              <button onClick={openCreate} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm">
                Create Category
              </button>
            }
          />
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-neutral-500 font-medium">Name</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-neutral-500 font-medium">Slug</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-neutral-500 font-medium">Parent</th>
                <th className="text-center px-4 py-3 text-xs uppercase tracking-wider text-neutral-500 font-medium">Products</th>
                <th className="text-center px-4 py-3 text-xs uppercase tracking-wider text-neutral-500 font-medium">Subcategories</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-neutral-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-neutral-50">
                  <td className="px-4 py-3 font-medium text-neutral-900">{cat.name}</td>
                  <td className="px-4 py-3 text-neutral-500">{cat.slug}</td>
                  <td className="px-4 py-3 text-neutral-500">{cat.parent?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-center text-neutral-500">{cat._count?.products ?? 0}</td>
                  <td className="px-4 py-3 text-center text-neutral-500">{cat._count?.children ?? 0}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(cat)} className="p-2 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-600">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className="p-2 hover:bg-red-50 rounded text-neutral-400 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Category" : "New Category"}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Name *</label>
            <input
              required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value, slug: editItem ? form.slug : e.target.value.toLowerCase().replace(/\s+/g, "-") })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Slug</label>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Parent Category</label>
            <select
              value={form.parentId}
              onChange={(e) => setForm({ ...form, parentId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">None (top level)</option>
              {categories.filter((c) => c.id !== editItem?.id).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Description</label>
            <textarea
              rows={3} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-neutral-500">Cancel</button>
            <button onClick={handleSave} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-neutral-800">
              {editItem ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
