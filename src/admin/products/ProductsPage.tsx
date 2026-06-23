import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../lib/api/admin";
import { DataTable } from "../common/DataTable";
import { StatusBadge } from "../common/StatusBadge";
import { SafeImage } from "../../components/SafeImage";
import { formatPrice, formatDate } from "../../lib/utils/format";
import {
  Edit3, Trash2, Plus, Download, Copy, Filter, Package,
  AlertTriangle, Eye, EyeOff, X, Search, ChevronDown,
} from "lucide-react";

interface Product {
  id: string; name: string; slug: string; status: string; basePrice: number; salePrice?: number;
  variants: { stock: number; sku: string }[];
  category?: { name: string }; subcategory?: { name: string }; collection?: { name: string }; brand?: { name: string; logoUrl?: string };
  images: { url: string }[]; _count: { variants: number };
  isActive: boolean; isFeatured: boolean; isNew: boolean; gender: string;
  compareAtPrice?: number; costPrice?: number; discountPercent?: number; currency?: string;
  material?: string; careInstructions?: string; sortOrder?: number;
  createdAt?: string; updatedAt?: string;
  totalStock?: number;
}

function getTotalStock(variants: { stock: number }[]): number {
  return variants?.reduce((sum, v) => sum + (v.stock ?? 0), 0) ?? 0;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({ status: "", gender: "", category: "", lowStock: false });
  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | undefined> = { page, limit: 20, search };
      if (filters.status) params.status = filters.status;
      const res = await adminApi.getProducts(params);
      const raw = (res.products as Product[]) ?? [];
      setProducts(raw.map((p) => ({ ...p, totalStock: getTotalStock(p.variants) })));
      const pag = res.pagination as { totalPages?: number } | undefined;
      setTotalPages(pag?.totalPages ?? 1);
    } catch { /* non-critical, keep existing data */ } finally { setLoading(false); }
  }, [page, search, filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.isActive).length;
    const draft = total - active;
    const totalStock = products.reduce((sum, p) => sum + (p.totalStock ?? 0), 0);
    const lowStock = products.filter((p) => (p.totalStock ?? 0) > 0 && (p.totalStock ?? 0) <= 5).length;
    const outOfStock = products.filter((p) => (p.totalStock ?? 0) === 0).length;
    return { total, active, draft, totalStock, lowStock, outOfStock };
  }, [products]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status) count++;
    if (filters.gender) count++;
    if (filters.lowStock) count++;
    return count;
  }, [filters]);

  function toggleSelect(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  }

  function toggleSelectAll() {
    if (selected.size === products.length) setSelected(new Set());
    else setSelected(new Set(products.map((p) => p.id)));
  }

  async function handleBulkStatus(active: boolean) {
    await adminApi.bulkUpdateStatus(Array.from(selected), active);
    setSelected(new Set()); fetchProducts();
  }

  async function handleBulkDelete() {
    await adminApi.bulkDeleteProducts(Array.from(selected));
    setSelected(new Set()); fetchProducts();
  }

  async function handleDuplicate(id: string) {
    await adminApi.duplicateProduct(id); fetchProducts();
  }

  async function handleExport() {
    try {
      const params = new URLSearchParams();
      params.set("format", "csv");
      if (filters.category) params.set("categoryId", filters.category);
      const stored = localStorage.getItem("nabome-auth");
      let token = "";
      if (stored) {
        const parsed = JSON.parse(stored);
        token = parsed?.state?.accessToken ?? "";
      }
      const res = await fetch(`/api/admin/products/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `products-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* non-critical */ }
  }

  function clearFilters() {
    setFilters({ status: "", gender: "", category: "", lowStock: false });
  }

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
              ? <SafeImage src={p.images[0].url} alt="" className="w-full h-full object-cover" useTransform={false} />
              : <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-neutral-300" /></div>
            }
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-medium text-neutral-900 truncate">{p.name}</p>
              {p.isFeatured && <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">Featured</span>}
              {p.isNew && <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">New</span>}
            </div>
            <p className="text-xs text-neutral-400 truncate">{p.gender} • {p._count?.variants ?? 0} variants</p>
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
        const maxStock = 50;
        const fillPct = Math.min((total / maxStock) * 100, 100);
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
                className={`h-full rounded-full transition-all ${total <= 5 ? "bg-amber-400" : "bg-emerald-400"}`}
                style={{ width: `${fillPct}%` }}
              />
            </div>
            <span className={`text-xs tabular-nums ${total <= 5 ? "text-amber-600 font-medium" : "text-neutral-500"}`}>{total}</span>
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
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded border transition-colors ${
              showFilter || activeFilterCount > 0
                ? "bg-neutral-900 text-white border-neutral-900"
                : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            <Filter size={14} />
            Filter
            {activeFilterCount > 0 && (
              <span className="ml-0.5 w-5 h-5 rounded-full bg-white/20 text-[10px] font-medium flex items-center justify-center">{activeFilterCount}</span>
            )}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 border border-neutral-200 text-neutral-600 px-3 py-2 text-sm rounded hover:bg-neutral-50 transition-colors"
          >
            <Download size={14} /> Export
          </button>
          <button
            onClick={() => navigate("/admin/products/new")}
            className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Stats Row */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border border-neutral-200 rounded-lg px-4 py-3">
            <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">Total Products</p>
            <p className="font-display text-xl text-neutral-900 mt-0.5">{stats.total}</p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-lg px-4 py-3">
            <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">Total Stock</p>
            <p className="font-display text-xl text-neutral-900 mt-0.5">{stats.totalStock.toLocaleString()}</p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-lg px-4 py-3">
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">Low Stock</p>
              {stats.lowStock > 0 && <AlertTriangle size={12} className="text-amber-500" />}
            </div>
            <p className={`font-display text-xl mt-0.5 ${stats.lowStock > 0 ? "text-amber-600" : "text-neutral-900"}`}>{stats.lowStock}</p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-lg px-4 py-3">
            <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">Out of Stock</p>
            <p className={`font-display text-xl mt-0.5 ${stats.outOfStock > 0 ? "text-red-600" : "text-neutral-900"}`}>{stats.outOfStock}</p>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      {showFilter && (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-white border border-neutral-200 rounded-lg">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-1.5 text-sm border border-neutral-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Draft</option>
          </select>
          <select
            value={filters.gender}
            onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
            className="px-3 py-1.5 text-sm border border-neutral-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
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
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700 ml-1"
            >
              <X size={12} /> Clear all
            </button>
          )}
        </div>
      )}

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-neutral-900 text-white rounded-lg text-sm shadow-lg">
          <span className="font-medium tabular-nums">{selected.size} selected</span>
          <div className="w-px h-4 bg-neutral-700" />
          <button onClick={() => handleBulkStatus(true)} className="flex items-center gap-1.5 hover:text-neutral-300 transition-colors">
            <Eye size={14} /> Publish
          </button>
          <button onClick={() => handleBulkStatus(false)} className="flex items-center gap-1.5 hover:text-neutral-300 transition-colors">
            <EyeOff size={14} /> Archive
          </button>
          <button onClick={handleBulkDelete} className="flex items-center gap-1.5 text-red-300 hover:text-red-200 transition-colors">
            <Trash2 size={14} /> Delete
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-auto hover:text-neutral-300 transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Table */}
      <DataTable
        columns={columns}
        data={products}
        isLoading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onSearch={setSearch}
        searchPlaceholder="Search products by name, SKU, brand…"
        onRowClick={(p) => navigate(`/admin/products/${p.id}/edit`)}
        emptyMessage="No products found. Create your first product to get started."
        actions={(p) => (
          <div className="flex justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); handleDuplicate(p.id); }}
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
              onClick={(e) => { e.stopPropagation(); adminApi.deleteProduct(p.id).then(fetchProducts); }}
              className="p-1.5 hover:bg-red-50 rounded-md text-neutral-400 hover:text-red-500 transition-colors"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      />
    </div>
  );
}
