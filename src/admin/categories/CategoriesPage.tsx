import { MediaPicker } from "../common/MediaPicker";
import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { Edit3, Trash2, Plus, Folder, ChevronRight, Search, Image } from "lucide-react";
import { SafeImage } from "../../components/SafeImage";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  parent?: { id: string; name: string; slug?: string };
  children?: { id: string; name: string; slug: string }[];
  imageUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
  metaTitle?: string;
  metaDesc?: string;
  _count: { products: number; children: number };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", slug: "", description: "", parentId: "", imageUrl: "",
    sortOrder: 0, isActive: true, metaTitle: "", metaDesc: ""
  });

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
    setForm({ name: "", slug: "", description: "", parentId: "", imageUrl: "", sortOrder: 0, isActive: true, metaTitle: "", metaDesc: "" });
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditItem(cat);
    setForm({
      name: cat.name, slug: cat.slug, description: cat.description ?? "",
      parentId: cat.parentId ?? "", imageUrl: cat.imageUrl ?? "",
      sortOrder: cat.sortOrder ?? 0, isActive: cat.isActive ?? true,
      metaTitle: cat.metaTitle ?? "", metaDesc: cat.metaDesc ?? ""
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editItem) {
        await adminApi.updateCategory(editItem.id, form);
      } else {
        await adminApi.createCategory(form);
      }
      setModalOpen(false);
      fetch();
    } catch (err) {
      console.error("Failed to save category:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteError(null);
    if (!window.confirm("Delete this category? This cannot be undone.")) return;
    try {
      await adminApi.deleteCategory(id);
      fetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete category";
      setDeleteError(msg);
    }
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const rootCategories = filtered.filter((c) => !c.parentId);
  const totalProducts = categories.reduce((sum, c) => sum + (c._count?.products ?? 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display text-neutral-900">Categories</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {categories.length} categories · {totalProducts} total products
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 text-[11px] font-medium tracking-[0.15em] uppercase hover:bg-neutral-800 transition-colors"
        >
          <Plus size={14} /> Add Category
        </button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400 transition-colors"
          />
        </div>
      </div>

      {deleteError && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 text-sm text-red-700 flex items-center justify-between">
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError(null)} className="text-red-400 hover:text-red-600 ml-2">×</button>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="bg-white border border-neutral-200">
          <EmptyState
            icon={Folder}
            title="No categories yet"
            description="Create your first category to organize products"
            action={
              <button onClick={openCreate} className="bg-neutral-900 text-white px-5 py-2.5 text-[11px] font-medium tracking-[0.15em] uppercase hover:bg-neutral-800 transition-colors">
                Create Category
              </button>
            }
          />
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50">
                <th className="text-left px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">Category</th>
                <th className="text-left px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">Slug</th>
                <th className="text-left px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">Parent</th>
                <th className="text-center px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">Products</th>
                <th className="text-center px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">Sub</th>
                <th className="text-center px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">Status</th>
                <th className="text-center px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">Order</th>
                <th className="text-right px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rootCategories.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  category={cat}
                  depth={0}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Category" : "New Category"}>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500 mb-1.5">Name *</label>
              <input
                required value={form.name}
                onChange={(e) => setForm({
                  ...form, name: e.target.value,
                  slug: editItem ? form.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
                })}
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400 transition-colors"
                placeholder="e.g. Women, Men, Accessories"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500 mb-1.5">Slug</label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400 transition-colors"
                placeholder="auto-generated"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500 mb-1.5">Sort Order</label>
              <input type="number" value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400 transition-colors"
              />
            </div>
            <div>
              <MediaPicker value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} label="Image URL" folder="categories" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500 mb-1.5">Parent Category</label>
            <select
              value={form.parentId}
              onChange={(e) => setForm({ ...form, parentId: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400 transition-colors"
            >
              <option value="">None (top level)</option>
              {categories.filter((c) => c.id !== editItem?.id).map((c) => (
                <option key={c.id} value={c.id}>{c.parent ? `${c.parent.name} → ` : ""}{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500 mb-1.5">Description</label>
            <textarea
              rows={3} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400 transition-colors resize-none"
              placeholder="Optional description for SEO"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500 mb-1.5">Meta Title</label>
              <input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400 transition-colors"
                placeholder="SEO title"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500 mb-1.5">Meta Description</label>
              <input value={form.metaDesc} onChange={(e) => setForm({ ...form, metaDesc: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 focus:outline-none focus:border-neutral-400 transition-colors"
                placeholder="SEO description"
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer py-2">
            <input type="checkbox" checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 accent-brand-500 rounded"
            />
            <span className="text-sm text-neutral-700">Active — visible on storefront</span>
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
            <button onClick={() => setModalOpen(false)}
              className="px-5 py-2.5 text-[11px] font-medium tracking-[0.15em] uppercase text-neutral-500 hover:text-neutral-900 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving || !form.name.trim()}
              className="bg-neutral-900 text-white px-6 py-2.5 text-[11px] font-medium tracking-[0.15em] uppercase hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
              {saving && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editItem ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function CategoryRow({
  category, depth, onEdit, onDelete
}: {
  category: Category;
  depth: number;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth === 0);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <>
      <tr className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-2" style={{ paddingLeft: depth * 24 }}>
            {hasChildren ? (
              <button onClick={() => setExpanded(!expanded)}
                className="p-0.5 hover:bg-neutral-100 rounded transition-colors">
                <ChevronRight className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${expanded ? "rotate-90" : ""}`} />
              </button>
            ) : (
              <span className="w-5" />
            )}
            {category.imageUrl ? (
              <SafeImage src={category.imageUrl} alt="" className="w-8 h-8 rounded object-cover border border-neutral-100" />
            ) : (
              <div className="w-8 h-8 rounded bg-neutral-100 flex items-center justify-center">
                <Folder className="w-4 h-4 text-neutral-400" />
              </div>
            )}
            <span className="font-medium text-neutral-900">{category.name}</span>
          </div>
        </td>
        <td className="px-5 py-3.5 text-neutral-500 font-mono text-xs">{category.slug}</td>
        <td className="px-5 py-3.5 text-neutral-500 text-xs">{category.parent?.name ?? "—"}</td>
        <td className="px-5 py-3.5 text-center">
          <span className="text-xs font-medium text-neutral-700">{category._count?.products ?? 0}</span>
        </td>
        <td className="px-5 py-3.5 text-center">
          <span className="text-xs font-medium text-neutral-700">{category._count?.children ?? 0}</span>
        </td>
        <td className="px-5 py-3.5 text-center">
          <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase ${
            category.isActive !== false
              ? "bg-green-50 text-green-700 border border-green-100"
              : "bg-neutral-100 text-neutral-500 border border-neutral-200"
          }`}>
            {category.isActive !== false ? "Active" : "Draft"}
          </span>
        </td>
        <td className="px-5 py-3.5 text-center text-xs text-neutral-400">{category.sortOrder ?? 0}</td>
        <td className="px-5 py-3.5 text-right">
          <div className="flex justify-end gap-1">
            <button onClick={() => onEdit(category)}
              className="p-2 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-700 transition-colors">
              <Edit3 size={14} />
            </button>
            <button onClick={() => onDelete(category.id)}
              className="p-2 hover:bg-red-50 rounded text-neutral-400 hover:text-red-500 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      </tr>
      {expanded && hasChildren && category.children!.map((child) => (
        <SubcategoryRow
          key={child.id}
          childId={child.id}
          name={child.name}
          slug={child.slug}
          depth={depth + 1}
        />
      ))}
    </>
  );
}

function SubcategoryRow({ childId, name, slug, depth }: {
  childId: string;
  name: string;
  slug: string;
  depth: number;
}) {
  return (
    <tr className="border-b border-neutral-50 bg-neutral-50/30">
      <td className="px-5 py-2.5">
        <div className="flex items-center gap-2" style={{ paddingLeft: depth * 24 + 20 }}>
          <span className="w-5" />
          <span className="text-sm text-neutral-600">{name}</span>
        </div>
      </td>
      <td className="px-5 py-2.5 text-neutral-400 font-mono text-xs">{slug}</td>
      <td colSpan={6} />
    </tr>
  );
}
