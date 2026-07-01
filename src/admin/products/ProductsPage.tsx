import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/admin";
import { DataTable } from "../common/DataTable";
import { StatusBadge } from "../common/StatusBadge";
import { SafeImage } from "../../components/SafeImage";
import { useToast } from "../../components/ui/Toast";
import { formatPrice, formatDate } from "../../lib/utils/format";
import { cn } from "../../lib/utils/cn";
import { DeleteConfirmDialog } from "./components/DeleteConfirmDialog";
import { PermanentDeleteDialog } from "./components/PermanentDeleteDialog";
import { BulkActionDialog } from "./components/BulkActionDialog";
import { BulkCategoryModal } from "./components/BulkCategoryModal";
import { ProductTableSkeleton, ProductGridSkeleton } from "./components/ProductSkeleton";
import { ProductGridCard } from "./components/ProductGridCard";
import {
  Edit3, Trash2, Plus, Download, Copy, Filter, Package,
  Eye, EyeOff, X, LayoutGrid, List, FolderOpen,
  Undo2, AlertTriangle, Archive,
} from "lucide-react";

interface Product {
  id: string; name: string; slug: string; basePrice: number; salePrice?: number;
  variants: { stock: number; sku: string }[];
  category?: { name: string }; subcategory?: { name: string }; collection?: { name: string }; brand?: { name: string; logoUrl?: string };
  images: { url: string; isPrimary: boolean }[]; _count: { variants: number };
  isActive: boolean; isFeatured: boolean; isNew: boolean; gender: string;
  compareAtPrice?: number; createdAt?: string; updatedAt?: string;
  totalStock?: number;
}

function getTotalStock(variants: { stock: number }[]): number {
  return variants?.reduce((sum, v) => sum + (v.stock ?? 0), 0) ?? 0;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

type StatusTab = "all" | "active" | "draft";

export default function ProductsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({ status: "", gender: "", lowStock: false });
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [statusTab, setStatusTab] = useState<StatusTab>("all");

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [permDeleteTarget, setPermDeleteTarget] = useState<Product | null>(null);
  const [bulkAction, setBulkAction] = useState<{ type: "publish" | "archive" | "delete" | "permDelete" } | null>(null);
  const [showBulkCategory, setShowBulkCategory] = useState(false);

  const debouncedSearch = useDebounce(search, 300);
  const searchRef = useRef<HTMLInputElement>(null);

  // Map status tab to API filter
  const apiStatus = useMemo(() => {
    if (statusTab === "active") return "active";
    if (statusTab === "draft") return "inactive";
    return filters.status || undefined;
  }, [statusTab, filters.status]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "products", { page, search: debouncedSearch, status: apiStatus, gender: filters.gender, lowStock: filters.lowStock }],
    queryFn: async () => {
      const params: Record<string, string | number | undefined> = { page, limit: 20, search: debouncedSearch };
      if (apiStatus) params.status = apiStatus;
      if (filters.gender) params.gender = filters.gender;
      if (filters.lowStock) params.lowStock = "true";
      const res = await adminApi.getProducts(params);
      const raw = (res.products as Product[]) ?? [];
      return {
        products: raw.map((p) => ({ ...p, totalStock: getTotalStock(p.variants) })),
        totalPages: (res.pagination as { totalPages?: number })?.totalPages ?? 1,
      };
    },
  });

  const products = useMemo(() => data?.products ?? [], [data?.products]);
  const totalPages = data?.totalPages ?? 1;

  const { data: categories = [] } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => adminApi.getCategories().then((r: any) => r.categories ?? []),
  });

  const { data: collections = [] } = useQuery({
    queryKey: ["admin", "collections"],
    queryFn: () => adminApi.getCollections().then((r: any) => r.collections ?? []),
  });

  const stats = useMemo(() => {
    const total = products.length;
    const totalStock = products.reduce((sum, p) => sum + (p.totalStock ?? 0), 0);
    const lowStock = products.filter((p) => (p.totalStock ?? 0) > 0 && (p.totalStock ?? 0) <= 5).length;
    const outOfStock = products.filter((p) => (p.totalStock ?? 0) === 0).length;
    return { total, totalStock, lowStock, outOfStock };
  }, [products]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status) count++;
    if (filters.gender) count++;
    if (filters.lowStock) count++;
    return count;
  }, [filters]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ─── Mutations ───

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      toast("Product deactivated", "success");
      setDeleteTarget(null);
    },
    onError: () => toast("Failed to delete product", "error"),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => adminApi.restoreProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast("Product restored to published", "success");
    },
    onError: () => toast("Failed to restore product", "error"),
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.permanentDeleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast("Product permanently deleted", "success");
      setPermDeleteTarget(null);
    },
    onError: (err: Error) => toast(err.message || "Failed to permanently delete product", "error"),
  });

  const bulkPermanentDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => adminApi.bulkPermanentDeleteProducts(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setSelected(new Set());
      setBulkAction(null);
      toast("Products permanently deleted", "success");
    },
    onError: (err: Error) => toast(err.message || "Failed to permanently delete products", "error"),
  });

  const bulkStatusMutation = useMutation({
    mutationFn: ({ ids, active }: { ids: string[]; active: boolean }) => adminApi.bulkUpdateStatus(ids, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setSelected(new Set());
      setBulkAction(null);
      toast("Products updated successfully", "success");
    },
    onError: () => toast("Failed to update products", "error"),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => adminApi.bulkDeleteProducts(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setSelected(new Set());
      setBulkAction(null);
      toast("Products deactivated", "success");
    },
    onError: () => toast("Failed to delete products", "error"),
  });

  const bulkCategoryMutation = useMutation({
    mutationFn: ({ ids, categoryId, subcategoryId, collectionId }: { ids: string[]; categoryId?: string; subcategoryId?: string; collectionId?: string }) =>
      adminApi.bulkUpdateCategory(ids, { categoryId, subcategoryId, collectionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      setSelected(new Set());
      setShowBulkCategory(false);
      toast("Categories assigned successfully", "success");
    },
    onError: () => toast("Failed to assign categories", "error"),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => adminApi.duplicateProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      toast("Product duplicated as draft", "success");
    },
    onError: () => toast("Failed to duplicate product", "error"),
  });

  function toggleSelect(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  }

  function toggleSelectAll() {
    if (selected.size === products.length) setSelected(new Set());
    else setSelected(new Set(products.map((p) => p.id)));
  }

  async function handleExport() {
    try {
      const res = await adminApi.exportProducts("csv") as Record<string, unknown>;
      const products = (res.products ?? res) as Product[];
      const headers = ["Name", "Slug", "Base Price", "Sale Price", "Category", "Subcategory", "Collection", "Brand", "Gender", "Stock", "Active", "Featured", "New", "Created At"];
      const rows = products.map((p) => [
        p.name, p.slug, p.basePrice ?? 0, p.salePrice ?? "",
        p.category?.name ?? "", p.subcategory?.name ?? "", p.collection?.name ?? "", p.brand?.name ?? "",
        p.gender, p.totalStock ?? 0, p.isActive ? "Yes" : "No", p.isFeatured ? "Yes" : "No", p.isNew ? "Yes" : "No",
        p.createdAt ?? "",
      ]);
      const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `products-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast("Products exported successfully", "success");
    } catch {
      toast("Failed to export products", "error");
    }
  }

  function clearFilters() {
    setFilters({ status: "", gender: "", lowStock: false });
  }

  const isDraftView = statusTab === "draft";

  const columns = [
    {
      key: "select", label: "", className: "w-10",
      render: (p: Product) => (
        <input
          type="checkbox"
          checked={selected.has(p.id)}
          onChange={() => toggleSelect(p.id)}
          className="rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: "name", label: "Product", sortable: true,
      render: (p: Product) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 bg-neutral-100 rounded-lg overflow-hidden shrink-0 ring-1 ring-neutral-200">
            {p.images?.[0]
              ? <SafeImage src={p.images[0].url} alt={`${p.name} product image`} className="w-full h-full object-cover" useTransform={false} />
              : <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-neutral-300" /></div>
            }
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-medium text-neutral-900 truncate">{p.name}</p>
              {p.isFeatured && <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">Featured</span>}
              {p.isNew && <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">New</span>}
            </div>
            <p className="text-xs text-neutral-400 truncate">{p.gender} · {p._count?.variants ?? 0} variants</p>
          </div>
        </div>
      ),
    },
    {
      key: "category", label: "Category",
      render: (p: Product) => (
        <span className="text-sm text-neutral-600">{p.category?.name ?? <span className="text-neutral-300">—</span>}</span>
      ),
    },
    {
      key: "basePrice", label: "Price", sortable: true,
      render: (p: Product) => (
        <div className="flex flex-col">
          <span className="font-medium text-neutral-900">{formatPrice(p.basePrice ?? 0)}</span>
          {p.salePrice ? (
            <span className="text-xs text-red-500 line-through">{formatPrice(p.salePrice)}</span>
          ) : p.compareAtPrice ? (
            <span className="text-xs text-neutral-400 line-through">{formatPrice(p.compareAtPrice)}</span>
          ) : null}
        </div>
      ),
    },
    {
      key: "totalStock", label: "Stock", sortable: true,
      render: (p: Product) => {
        const total = p.totalStock ?? 0;
        const fillPct = Math.min((total / 50) * 100, 100);
        if (total === 0) {
          return (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-xs font-medium text-red-600">OOS</span>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-2 min-w-[80px]">
            <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", total <= 5 ? "bg-amber-400" : "bg-emerald-400")}
                style={{ width: `${fillPct}%` }}
              />
            </div>
            <span className={cn("text-xs tabular-nums", total <= 5 ? "text-amber-600 font-medium" : "text-neutral-500")}>{total}</span>
          </div>
        );
      },
    },
    {
      key: "isActive", label: "Status",
      render: (p: Product) => (
        <div className="flex items-center gap-1.5">
          {p.isActive ? <Eye size={12} className="text-green-500" /> : <EyeOff size={12} className="text-neutral-400" />}
          <StatusBadge status={p.isActive ? "published" : "draft"} />
        </div>
      ),
    },
    {
      key: "createdAt", label: "Created", sortable: true,
      render: (p: Product) => (
        <span className="text-xs text-neutral-400">{p.createdAt ? formatDate(p.createdAt) : "—"}</span>
      ),
    },
  ];

  const isAnyMutating = deleteMutation.isPending || bulkStatusMutation.isPending || bulkDeleteMutation.isPending || duplicateMutation.isPending || permanentDeleteMutation.isPending || restoreMutation.isPending || bulkPermanentDeleteMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">Products</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage your product catalog</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors",
              showFilter || activeFilterCount > 0
                ? "bg-neutral-900 text-white border-neutral-900"
                : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            )}
          >
            <Filter size={14} />
            Filter
            {activeFilterCount > 0 && (
              <span className="ml-0.5 w-5 h-5 rounded-full bg-white/20 text-[10px] font-medium flex items-center justify-center">{activeFilterCount}</span>
            )}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 border border-neutral-200 text-neutral-600 px-3 py-2 text-sm rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <Download size={14} /> Export
          </button>
          <button
            onClick={() => navigate("/admin/products/new")}
            className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1 border-b border-neutral-200">
        {([
          { key: "all", label: "All Products" },
          { key: "active", label: "Published" },
          { key: "draft", label: "Drafts & Archived" },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setStatusTab(tab.key); setPage(1); setSelected(new Set()); }}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              statusTab === tab.key
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-500 hover:text-neutral-700"
            )}
          >
            {tab.key === "draft" && <Archive size={14} />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats Row */}
      {!isLoading && products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border border-neutral-200 rounded-xl px-4 py-3">
            <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">Total Products</p>
            <p className="font-display text-xl text-neutral-900 mt-0.5">{stats.total}</p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl px-4 py-3">
            <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">Total Stock</p>
            <p className="font-display text-xl text-neutral-900 mt-0.5">{stats.totalStock.toLocaleString()}</p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl px-4 py-3">
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">Low Stock</p>
              {stats.lowStock > 0 && <Package size={12} className="text-amber-500" />}
            </div>
            <p className={cn("font-display text-xl mt-0.5", stats.lowStock > 0 ? "text-amber-600" : "text-neutral-900")}>{stats.lowStock}</p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl px-4 py-3">
            <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">Out of Stock</p>
            <p className={cn("font-display text-xl mt-0.5", stats.outOfStock > 0 ? "text-red-600" : "text-neutral-900")}>{stats.outOfStock}</p>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      {showFilter && (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-white border border-neutral-200 rounded-xl">
          <select
            value={filters.gender}
            onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
            className="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            <option value="">All Genders</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="unisex">Unisex</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.lowStock}
              onChange={(e) => setFilters({ ...filters, lowStock: e.target.checked })}
              className="rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
            />
            Low Stock Only
          </label>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700 ml-1">
              <X size={12} /> Clear all
            </button>
          )}
        </div>
      )}

      {/* Toolbar: Search + View Toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products... (⌘K)"
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode("table")}
            className={cn("p-2 transition-colors", viewMode === "table" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-50")}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={cn("p-2 transition-colors", viewMode === "grid" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-50")}
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-neutral-900 text-white rounded-xl text-sm shadow-lg">
          <span className="font-medium tabular-nums">{selected.size} selected</span>
          <div className="w-px h-4 bg-neutral-700" />
          {isDraftView ? (
            <>
              <button onClick={() => {
                const ids = Array.from(selected);
                ids.forEach((id) => restoreMutation.mutate(id));
                setSelected(new Set());
              }} className="flex items-center gap-1.5 hover:text-neutral-300 transition-colors">
                <Undo2 size={14} /> Restore
              </button>
              <button onClick={() => setBulkAction({ type: "permDelete" })} className="flex items-center gap-1.5 text-red-300 hover:text-red-200 transition-colors">
                <Trash2 size={14} /> Delete Forever
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setBulkAction({ type: "publish" })} className="flex items-center gap-1.5 hover:text-neutral-300 transition-colors">
                <Eye size={14} /> Publish
              </button>
              <button onClick={() => setBulkAction({ type: "archive" })} className="flex items-center gap-1.5 hover:text-neutral-300 transition-colors">
                <EyeOff size={14} /> Archive
              </button>
              <button onClick={() => setShowBulkCategory(true)} className="flex items-center gap-1.5 hover:text-neutral-300 transition-colors">
                <FolderOpen size={14} /> Categories
              </button>
              <button onClick={() => setBulkAction({ type: "delete" })} className="flex items-center gap-1.5 text-red-300 hover:text-red-200 transition-colors">
                <Trash2 size={14} /> Delete
              </button>
            </>
          )}
          <button onClick={() => setSelected(new Set())} className="ml-auto hover:text-neutral-300 transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Content */}
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-sm text-red-600">Failed to load products. Please try again.</p>
        </div>
      ) : isLoading ? (
        viewMode === "table" ? <ProductTableSkeleton /> : <ProductGridSkeleton />
      ) : products.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
          <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500">
            {isDraftView ? "No draft products" : "No products found"}
          </p>
          <p className="text-sm text-neutral-400 mt-1">
            {isDraftView ? "Archived products will appear here." : "Create your first product to get started."}
          </p>
          {!isDraftView && (
            <button
              onClick={() => navigate("/admin/products/new")}
              className="mt-4 inline-flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
            >
              <Plus size={16} /> Add Product
            </button>
          )}
        </div>
      ) : viewMode === "table" ? (
        <DataTable
          columns={columns}
          data={products}
          isLoading={false}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onSearch={() => {}}
          searchPlaceholder=""
          onRowClick={(p) => navigate(`/admin/products/${p.id}/edit`)}
          emptyMessage=""
          actions={(p) => (
            <div className="flex justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {isDraftView ? (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); restoreMutation.mutate(p.id); }}
                    disabled={isAnyMutating}
                    className="p-1.5 hover:bg-green-50 rounded-md text-neutral-400 hover:text-green-600 transition-colors"
                    title="Restore"
                  >
                    <Undo2 size={14} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setPermDeleteTarget(p); }}
                    disabled={isAnyMutating}
                    className="p-1.5 hover:bg-red-50 rounded-md text-neutral-400 hover:text-red-500 transition-colors"
                    title="Delete Forever"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); duplicateMutation.mutate(p.id); }}
                    disabled={isAnyMutating}
                    className="p-1.5 hover:bg-neutral-100 rounded-md text-neutral-400 hover:text-neutral-600 transition-colors"
                    title="Duplicate"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/admin/products/${p.id}/edit`); }}
                    className="p-1.5 hover:bg-neutral-100 rounded-md text-neutral-400 hover:text-neutral-600 transition-colors"
                    title="Edit"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(p); }}
                    disabled={isAnyMutating}
                    className="p-1.5 hover:bg-red-50 rounded-md text-neutral-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          )}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((p) => (
            <ProductGridCard
              key={p.id}
              product={p}
              onEdit={() => navigate(`/admin/products/${p.id}/edit`)}
              onDelete={() => isDraftView ? setPermDeleteTarget(p) : setDeleteTarget(p)}
              onDuplicate={isDraftView ? () => {} : () => duplicateMutation.mutate(p.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination for grid view */}
      {viewMode === "grid" && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Soft Delete Confirmation Dialog (non-drafts) */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        productName={deleteTarget?.name ?? ""}
        loading={deleteMutation.isPending}
      />

      {/* Permanent Delete Confirmation Dialog (drafts) */}
      <PermanentDeleteDialog
        open={!!permDeleteTarget}
        onClose={() => setPermDeleteTarget(null)}
        onConfirm={() => permDeleteTarget && permanentDeleteMutation.mutate(permDeleteTarget.id)}
        productName={permDeleteTarget?.name ?? ""}
        loading={permanentDeleteMutation.isPending}
      />

      {/* Bulk Action Dialog */}
      <BulkActionDialog
        open={!!bulkAction}
        onClose={() => setBulkAction(null)}
        onConfirm={() => {
          if (!bulkAction) return;
          const ids = Array.from(selected);
          if (bulkAction.type === "publish") bulkStatusMutation.mutate({ ids, active: true });
          else if (bulkAction.type === "archive") bulkStatusMutation.mutate({ ids, active: false });
          else if (bulkAction.type === "delete") bulkDeleteMutation.mutate(ids);
          else if (bulkAction.type === "permDelete") bulkPermanentDeleteMutation.mutate(ids);
        }}
        action={bulkAction?.type === "permDelete" ? "delete" : (bulkAction?.type ?? "delete")}
        count={selected.size}
        loading={bulkStatusMutation.isPending || bulkDeleteMutation.isPending || bulkPermanentDeleteMutation.isPending}
      />

      {/* Bulk Category Modal */}
      <BulkCategoryModal
        open={showBulkCategory}
        onClose={() => setShowBulkCategory(false)}
        onConfirm={(data) => bulkCategoryMutation.mutate({ ids: Array.from(selected), ...data })}
        categories={categories}
        collections={collections}
        count={selected.size}
        loading={bulkCategoryMutation.isPending}
      />
    </div>
  );
}
