import { useState } from "react";
import { FolderOpen } from "lucide-react";
import { Modal } from "../../common/Modal";

interface BulkCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: { categoryId?: string; subcategoryId?: string; collectionId?: string }) => void;
  categories: { id: string; name: string; subcategories?: { id: string; name: string }[] }[];
  collections: { id: string; name: string }[];
  count: number;
  loading?: boolean;
}

export function BulkCategoryModal({ open, onClose, onConfirm, categories, collections, count, loading }: BulkCategoryModalProps) {
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [collectionId, setCollectionId] = useState("");

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const subcategories = selectedCategory?.subcategories ?? [];

  function handleConfirm() {
    onConfirm({
      categoryId: categoryId || undefined,
      subcategoryId: subcategoryId || undefined,
      collectionId: collectionId || undefined,
    });
  }

  function handleClose() {
    setCategoryId("");
    setSubcategoryId("");
    setCollectionId("");
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Assign Categories" size="md">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm text-neutral-700">
            Assign categories to <span className="font-medium">{count} product{count === 1 ? "" : "s"}</span>
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setSubcategoryId("");
              }}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="">No change</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {subcategories.length > 0 && (
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Subcategory</label>
              <select
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="">No change</option>
                {subcategories.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs text-neutral-500 mb-1">Collection</label>
            <select
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="">No change</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 border border-neutral-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || (!categoryId && !subcategoryId && !collectionId)}
            className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Assigning..." : "Assign Categories"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
