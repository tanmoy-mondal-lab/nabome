import { MediaPicker } from "../common/MediaPicker";
import { useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { Edit3, Trash2, Plus, Folder, ChevronRight, Search, Tag } from "lucide-react";
import { SafeImage } from "../../components/SafeImage";
import { useToast } from "../../components/ui/Toast";

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  _count?: { products: number };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  parent?: { id: string; name: string; slug?: string };
  children?: { id: string; name: string; slug: string }[];
  subcategories?: Subcategory[];
  imageUrl?: string;
  imagePublicId?: string;
  sortOrder?: number;
  isActive?: boolean;
  metaTitle?: string;
  metaDesc?: string;
  _count: { products: number; children: number };
}

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "", slug: "", description: "", parentId: "", imageUrl: "", imagePublicId: "",
    sortOrder: 0, isActive: true, metaTitle: "", metaDesc: ""
  });

  // Subcategory state
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [editSubItem, setEditSubItem] = useState<Subcategory | null>(null);
  const [subCategoryId, setSubCategoryId] = useState("");
  const [subForm, setSubForm] = useState({ name: "", slug: "", sortOrder: 0, isActive: true });

  const { data: categories = [], isLoading: loading, error: queryError } = useQuery<Category[]>({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const res = await adminApi.getCategories();
      return (res.categories as Category[]) ?? [];
    },
  });

  // ─── Category Mutations ───
  const saveMutation = useMutation({
    mutationFn: (data: { name: string; slug: string; description: string; parentId: string | null; imageUrl: string; imagePublicId?: string; sortOrder: number; isActive: boolean; metaTitle: string; metaDesc: string }) =>
      editItem
        ? adminApi.updateCategory(editItem.id, data)
        : adminApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      setModalOpen(false);
      toast(editItem ? "Category updated" : "Category created", "success");
    },
    onError: (err: Error) => {
      toast(err.message || "Failed to save category", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast("Category deleted", "success");
    },
    onError: (err: Error) => {
      toast(err.message || "Failed to delete category", "error");
    },
  });

  // ─── Subcategory Mutations ───
  const saveSubMutation = useMutation({
    mutationFn: (data: { name: string; slug: string; categoryId: string; sortOrder: number; isActive: boolean }) =>
      editSubItem
        ? adminApi.updateSubcategory(editSubItem.id, data)
        : adminApi.createSubcategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      setSubModalOpen(false);
      setEditSubItem(null);
      toast(editSubItem ? "Subcategory updated" : "Subcategory created", "success");
    },
    onError: (err: Error) => {
      toast(err.message || "Failed to save subcategory", "error");
    },
  });

  const deleteSubMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteSubcategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast("Subcategory deleted", "success");
    },
    onError: (err: Error) => {
      toast(err.message || "Failed to delete subcategory", "error");
    },
  });

  // ─── Category Handlers ───
  const openCreate = () => {
    setEditItem(null);
    setForm({ name: "", slug: "", description: "", parentId: "", imageUrl: "", imagePublicId: "", sortOrder: 0, isActive: true, metaTitle: "", metaDesc: "" });
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditItem(cat);
    setForm({
      name: cat.name, slug: cat.slug, description: cat.description ?? "",
      parentId: cat.parentId ?? "", imageUrl: cat.imageUrl ?? "", imagePublicId: cat.imagePublicId ?? "",
      sortOrder: cat.sortOrder ?? 0, isActive: cat.isActive ?? true,
      metaTitle: cat.metaTitle ?? "", metaDesc: cat.metaDesc ?? ""
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    const data = { ...form, parentId: form.parentId || null };
    saveMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category? This action cannot be undone.")) return;
    deleteMutation.mutate(id);
  };

  // ─── Subcategory Handlers ───
  const openCreateSub = (categoryId: string) => {
    setEditSubItem(null);
    setSubCategoryId(categoryId);
    setSubForm({ name: "", slug: "", sortOrder: 0, isActive: true });
    setSubModalOpen(true);
  };

  const openEditSub = (sub: Subcategory, categoryId: string) => {
    setEditSubItem(sub);
    setSubCategoryId(categoryId);
    setSubForm({ name: sub.name, slug: sub.slug, sortOrder: sub.sortOrder ?? 0, isActive: sub.isActive ?? true });
    setSubModalOpen(true);
  };

  const handleSaveSub = () => {
    saveSubMutation.mutate({ ...subForm, categoryId: subCategoryId });
  };

  const handleDeleteSub = (id: string) => {
    if (!window.confirm("Delete this subcategory? Products using it will need reassignment.")) return;
    deleteSubMutation.mutate(id);
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const rootCategories = filtered.filter((c) => !c.parentId);
  const totalProducts = categories.reduce((sum, c) => sum + (c._count?.products ?? 0), 0);
  const totalSubcategories = categories.reduce((sum, c) => sum + (c.subcategories?.length ?? 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const queryErrorMessage = queryError ? (queryError instanceof Error ? queryError.message : "Failed to load categories") : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display text-neutral-900">Categories</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {categories.length} categories · {totalSubcategories} subcategories · {totalProducts} total products
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 text-[11px] font-medium tracking-[0.15em] uppercase hover:bg-neutral-800 transition-colors"
        >
          <Plus size={14} /> Add Category
        </button>
      </div>

      {queryErrorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{queryErrorMessage}</div>
      )}

      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
          />
        </div>
      </div>

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
                <th className="text-center px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">Subs</th>
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
                  onAddSub={openCreateSub}
                  onEditSub={openEditSub}
                  onDeleteSub={handleDeleteSub}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Category Modal */}
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
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                placeholder="e.g. Women, Men, Accessories"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500 mb-1.5">Slug</label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                placeholder="auto-generated"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500 mb-1.5">Sort Order</label>
              <input type="number" value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
            </div>
            <div>
              <MediaPicker value={form.imageUrl} onChange={(url, publicId) => setForm({ ...form, imageUrl: url, imagePublicId: publicId ?? "" })} label="Image URL" folder="categories" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500 mb-1.5">Parent Category</label>
            <select
              value={form.parentId}
              onChange={(e) => setForm({ ...form, parentId: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
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
              className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors resize-none"
              placeholder="Optional description for SEO"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500 mb-1.5">Meta Title</label>
              <input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                placeholder="SEO title"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500 mb-1.5">Meta Description</label>
              <input value={form.metaDesc} onChange={(e) => setForm({ ...form, metaDesc: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
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
            <button onClick={handleSave} disabled={saveMutation.isPending || !form.name.trim()}
              className="bg-neutral-900 text-white px-6 py-2.5 text-[11px] font-medium tracking-[0.15em] uppercase hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
              {saveMutation.isPending && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editItem ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Subcategory Modal */}
      <Modal open={subModalOpen} onClose={() => { setSubModalOpen(false); setEditSubItem(null); }} title={editSubItem ? "Edit Subcategory" : "New Subcategory"}>
        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500 mb-1.5">Parent Category</label>
            <select
              value={subCategoryId}
              onChange={(e) => setSubCategoryId(e.target.value)}
              disabled
              className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-600"
            >
              {categories.filter((c) => c.id === subCategoryId).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500 mb-1.5">Name *</label>
              <input
                required value={subForm.name}
                onChange={(e) => setSubForm({
                  ...subForm, name: e.target.value,
                  slug: editSubItem ? subForm.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
                })}
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                placeholder="e.g. Shirts, Dresses, Shoes"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500 mb-1.5">Slug</label>
              <input
                value={subForm.slug}
                onChange={(e) => setSubForm({ ...subForm, slug: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                placeholder="auto-generated"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500 mb-1.5">Sort Order</label>
              <input type="number" value={subForm.sortOrder}
                onChange={(e) => setSubForm({ ...subForm, sortOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2.5 cursor-pointer pb-2.5">
                <input type="checkbox" checked={subForm.isActive}
                  onChange={(e) => setSubForm({ ...subForm, isActive: e.target.checked })}
                  className="w-4 h-4 accent-brand-500 rounded"
                />
                <span className="text-sm text-neutral-700">Active</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
            <button onClick={() => { setSubModalOpen(false); setEditSubItem(null); }}
              className="px-5 py-2.5 text-[11px] font-medium tracking-[0.15em] uppercase text-neutral-500 hover:text-neutral-900 transition-colors">
              Cancel
            </button>
            <button onClick={handleSaveSub} disabled={saveSubMutation.isPending || !subForm.name.trim()}
              className="bg-neutral-900 text-white px-6 py-2.5 text-[11px] font-medium tracking-[0.15em] uppercase hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
              {saveSubMutation.isPending && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editSubItem ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function CategoryRow({
  category, depth, onEdit, onDelete, onAddSub, onEditSub, onDeleteSub
}: {
  category: Category;
  depth: number;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
  onAddSub: (categoryId: string) => void;
  onEditSub: (sub: Subcategory, categoryId: string) => void;
  onDeleteSub: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth === 0);
  const hasChildren = category.children && category.children.length > 0;
  const hasSubcategories = category.subcategories && category.subcategories.length > 0;

  return (
    <>
      <tr className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-2" style={{ paddingLeft: depth * 24 }}>
            {(hasChildren || hasSubcategories) ? (
              <button onClick={() => setExpanded(!expanded)}
                className="p-0.5 hover:bg-neutral-100 rounded transition-colors">
                <ChevronRight className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${expanded ? "rotate-90" : ""}`} />
              </button>
            ) : (
              <span className="w-5" />
            )}
            {category.imageUrl ? (
              <SafeImage src={category.imageUrl} alt={`${category.name} category image`} className="w-8 h-8 rounded object-cover border border-neutral-100" />
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
          <span className="text-xs font-medium text-neutral-700">{category.subcategories?.length ?? 0}</span>
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
            <button onClick={() => onAddSub(category.id)} title="Add subcategory"
              className="p-2 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-700 transition-colors">
              <Tag size={14} />
            </button>
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
      {expanded && hasSubcategories && category.subcategories!.map((sub) => (
        <tr key={sub.id} className="border-b border-neutral-50 bg-neutral-50/30">
          <td className="px-5 py-2.5">
            <div className="flex items-center gap-2" style={{ paddingLeft: (depth + 1) * 24 + 20 }}>
              <Tag className="w-3.5 h-3.5 text-neutral-300" />
              <span className="text-sm text-neutral-600">{sub.name}</span>
            </div>
          </td>
          <td className="px-5 py-2.5 text-neutral-400 font-mono text-xs">{sub.slug}</td>
          <td className="px-5 py-2.5 text-neutral-400 text-xs">{category.name}</td>
          <td className="px-5 py-2.5 text-center text-xs text-neutral-500">{sub._count?.products ?? 0}</td>
          <td colSpan={2} />
          <td className="px-5 py-2.5 text-center">
            <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase ${
              sub.isActive
                ? "bg-green-50 text-green-700 border border-green-100"
                : "bg-neutral-100 text-neutral-500 border border-neutral-200"
            }`}>
              {sub.isActive ? "Active" : "Draft"}
            </span>
          </td>
          <td className="px-5 py-2.5 text-right">
            <div className="flex justify-end gap-1">
              <button onClick={() => onEditSub(sub, category.id)}
                className="p-2 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-700 transition-colors">
                <Edit3 size={14} />
              </button>
              <button onClick={() => onDeleteSub(sub.id)}
                className="p-2 hover:bg-red-50 rounded text-neutral-400 hover:text-red-500 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </td>
        </tr>
      ))}
      {expanded && hasChildren && category.children!.map((child) => (
        <tr key={child.id} className="border-b border-neutral-50 bg-neutral-50/30">
          <td className="px-5 py-2.5">
            <div className="flex items-center gap-2" style={{ paddingLeft: (depth + 1) * 24 + 20 }}>
              <Folder className="w-3.5 h-3.5 text-neutral-300" />
              <span className="text-sm text-neutral-600">{child.name}</span>
            </div>
          </td>
          <td className="px-5 py-2.5 text-neutral-400 font-mono text-xs">{child.slug}</td>
          <td colSpan={6} />
        </tr>
      ))}
    </>
  );
}
