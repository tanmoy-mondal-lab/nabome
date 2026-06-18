import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../lib/api/admin";
import { DataTable } from "../common/DataTable";
import { StatusBadge } from "../common/StatusBadge";
import { Modal } from "../common/Modal";
import { Edit3, Trash2, Plus, Download, Upload, Copy, CheckCircle, Filter } from "lucide-react";

interface Product {
  id: string; name: string; slug: string; status: string; basePrice: number; salePrice?: number; stock: number;
  category?: { name: string }; images: { url: string }[]; _count: { variants: number };
  isActive: boolean; isFeatured: boolean; isNew: boolean; gender: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({ status: "", gender: "", category: "", lowStock: false });
  const navigate = useNavigate();

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | undefined> = { page, limit: 20, search };
      if (filters.status) params.status = filters.status;
      const res = await adminApi.getProducts(params);
      setProducts((res.products as Product[]) ?? []);
      const pag = res.pagination as { totalPages?: number } | undefined;
      setTotalPages(pag?.totalPages ?? 1);
    } catch { } finally { setLoading(false); }
  }, [page, search, filters]);

  useEffect(() => { fetch(); }, [fetch]);

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
    if (!window.confirm(`${active ? "Publish" : "Archive"} ${selected.size} products?`)) return;
    await adminApi.bulkUpdateStatus(Array.from(selected), active);
    setSelected(new Set()); setShowBulkModal(false); fetch();
  }

  async function handleBulkDelete() {
    if (!window.confirm(`Archive ${selected.size} products?`)) return;
    await adminApi.bulkDeleteProducts(Array.from(selected));
    setSelected(new Set()); setShowBulkModal(false); fetch();
  }

  async function handleDuplicate(id: string) {
    await adminApi.duplicateProduct(id); fetch();
  }

  async function handleExport() {
    const category = filters.category || undefined;
    await adminApi.exportProducts("csv", category);
  }

  const columns = [
    {
      key: "select", label: "", render: (p: Product) => (
        <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} className="rounded border-neutral-300" onClick={(e) => e.stopPropagation()} />
      ),
    },
    { key: "name", label: "Product", sortable: true,
      render: (p: Product) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-neutral-100 rounded overflow-hidden shrink-0">
            {p.images?.[0] ? <img src={p.images[0].url} alt="" className="w-full h-full object-cover" /> : null}
          </div>
          <div>
            <p className="font-medium text-neutral-900">{p.name}</p>
            <p className="text-xs text-neutral-400">{p._count?.variants} variants • {p.gender}</p>
          </div>
        </div>
      ),
    },
    { key: "category", label: "Category", render: (p: Product) => <span className="text-sm text-neutral-500">{p.category?.name ?? "—"}</span> },
    { key: "basePrice", label: "Price", sortable: true, render: (p: Product) => (
      <div><span className="font-medium">₹{p.basePrice?.toLocaleString()}</span>{p.salePrice ? <span className="text-xs text-red-500 ml-1 line-through">₹{p.salePrice.toLocaleString()}</span> : null}</div>
    )},
    { key: "stock", label: "Stock", sortable: true, render: (p: Product) => (
      <span className={`text-sm ${p.stock === 0 ? "text-red-600 font-medium" : p.stock <= 5 ? "text-amber-600 font-medium" : "text-neutral-500"}`}>{p.stock === 0 ? "OOS" : p.stock}</span>
    )},
    { key: "isActive", label: "Status", render: (p: Product) => <StatusBadge status={p.isActive ? "published" : "draft"} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">Products</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage your product catalog</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilter(!showFilter)} className="flex items-center gap-2 border border-neutral-200 text-neutral-600 px-3 py-2 text-sm rounded hover:bg-neutral-50"><Filter size={14} /> Filter</button>
          <button onClick={handleExport} className="flex items-center gap-2 border border-neutral-200 text-neutral-600 px-3 py-2 text-sm rounded hover:bg-neutral-50"><Download size={14} /> Export</button>
          <button onClick={() => navigate("/admin/products/new")} className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-neutral-800"><Plus size={16} /> Add Product</button>
        </div>
      </div>

      {showFilter && (
        <div className="flex items-center gap-4 p-4 bg-neutral-50 border border-neutral-200 rounded">
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="px-3 py-2 text-sm border rounded"><option value="">All Status</option><option value="active">Active</option><option value="inactive">Draft</option></select>
          <select value={filters.gender} onChange={(e) => setFilters({ ...filters, gender: e.target.value })} className="px-3 py-2 text-sm border rounded"><option value="">All Genders</option><option value="men">Men</option><option value="women">Women</option><option value="unisex">Unisex</option></select>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={filters.lowStock} onChange={(e) => setFilters({ ...filters, lowStock: e.target.checked })} className="rounded" /> Low Stock Only</label>
        </div>
      )}

      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-neutral-900 text-white rounded text-sm">
          <span className="font-medium">{selected.size} selected</span>
          <button onClick={() => handleBulkStatus(true)} className="underline hover:text-neutral-300">Publish</button>
          <button onClick={() => handleBulkStatus(false)} className="underline hover:text-neutral-300">Archive</button>
          <button onClick={handleBulkDelete} className="underline text-red-300 hover:text-red-200">Delete</button>
          <button onClick={() => setSelected(new Set())} className="underline ml-auto hover:text-neutral-300">Clear</button>
        </div>
      )}

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
        actions={(p) => (
          <div className="flex justify-end gap-1">
            <button onClick={(e) => { e.stopPropagation(); handleDuplicate(p.id); }} className="p-2 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-600" title="Duplicate"><Copy size={14} /></button>
            <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/products/${p.id}/edit`); }} className="p-2 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-600"><Edit3 size={14} /></button>
            <button onClick={(e) => { e.stopPropagation(); adminApi.deleteProduct(p.id).then(fetch); }} className="p-2 hover:bg-red-50 rounded text-neutral-400 hover:text-red-500"><Trash2 size={14} /></button>
          </div>
        )}
      />
    </div>
  );
}
