import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { StatusBadge } from "../common/StatusBadge";
import { Plus, Edit3, Trash2, Percent } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  description: string | null;
  minOrderValue: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  perUserLimit: number;
  applicableGender: string | null;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Coupon | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: "", discountType: "percentage" as "percentage" | "fixed", discountValue: 0,
    description: "", minOrderValue: "", maxDiscount: "", usageLimit: "", perUserLimit: "1",
    applicableGender: "", isActive: true,
    startDate: "", endDate: "",
  });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCoupons();
      setCoupons((res.coupons as Coupon[]) ?? []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ code: "", discountType: "percentage", discountValue: 0, description: "", minOrderValue: "", maxDiscount: "", usageLimit: "", perUserLimit: "1", applicableGender: "", isActive: true, startDate: "", endDate: "" });
    setModalOpen(true);
  };

  const openEdit = (c: Coupon) => {
    setEditItem(c);
    setForm({
      code: c.code, discountType: c.discountType, discountValue: c.discountValue,
      description: c.description ?? "",
      minOrderValue: c.minOrderValue?.toString() ?? "",
      maxDiscount: c.maxDiscount?.toString() ?? "",
      usageLimit: c.usageLimit?.toString() ?? "",
      perUserLimit: c.perUserLimit.toString(),
      applicableGender: c.applicableGender ?? "",
      isActive: c.isActive,
      startDate: c.startDate ?? "", endDate: c.endDate ?? "",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        code: form.code.toUpperCase(),
        discountType: form.discountType,
        discountValue: form.discountValue,
        description: form.description || null,
        minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : null,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        perUserLimit: Number(form.perUserLimit) || 1,
        applicableGender: form.applicableGender || null,
        isActive: form.isActive,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      };
      if (editItem) {
        await adminApi.updateCoupon(editItem.id, payload);
      } else {
        await adminApi.createCoupon(payload);
      }
      setModalOpen(false);
      fetch();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi.deleteCoupon(id);
      setDeleteConfirm(null);
      fetch();
    } catch { /* ignore */ }
  };

  const inputClass = "w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500";

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
          <h1 className="font-display text-2xl text-neutral-900">Coupons & Discounts</h1>
          <p className="text-sm text-neutral-500 mt-1">Create and manage promotional coupon codes</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded text-sm font-medium hover:bg-neutral-800">
          <Plus size={16} /> Add Coupon
        </button>
      </div>

      {coupons.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded">
          <EmptyState icon={Percent} title="No coupons yet"
            action={<button onClick={openCreate} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm">Create Coupon</button>}
          />
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Code</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Value</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Min Order</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Max Disc.</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Uses</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Per User</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Gender</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Expires</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                  <tr key={c.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="px-4 py-3 font-mono text-sm font-medium text-neutral-900">{c.code}</td>
                    <td className="px-4 py-3 capitalize text-neutral-500">{c.discountType}</td>
                    <td className="px-4 py-3 text-neutral-900">
                      {c.discountType === "percentage" ? `${c.discountValue}%` : `₹${c.discountValue.toLocaleString()}`}
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{c.minOrderValue ? `₹${c.minOrderValue.toLocaleString()}` : "—"}</td>
                    <td className="px-4 py-3 text-neutral-500">{c.maxDiscount ? `₹${c.maxDiscount.toLocaleString()}` : "—"}</td>
                    <td className="px-4 py-3 text-neutral-500">
                      {c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{c.perUserLimit}</td>
                    <td className="px-4 py-3 text-neutral-500 capitalize">{c.applicableGender ?? "All"}</td>
                    <td className="px-4 py-3 text-neutral-500">
                      {c.endDate ? new Date(c.endDate).toLocaleDateString() : "Never"}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={c.isActive ? "active" : "inactive"} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => setDeleteConfirm(c.id)} className="p-1.5 text-red-400 hover:text-red-600 rounded">
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Coupon" : "New Coupon"}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Coupon Code *</label>
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="e.g. SUMMER20" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional description" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Type</label>
              <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as "percentage" | "fixed" })}
                className={inputClass}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Value *</label>
              <input type="number" value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Min Order Value (₹)</label>
              <input type="number" value={form.minOrderValue}
                onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Max Discount (₹)</label>
              <input type="number" value={form.maxDiscount}
                onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Usage Limit</label>
              <input type="number" value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Per-User Limit</label>
              <input type="number" value={form.perUserLimit} min={1}
                onChange={(e) => setForm({ ...form, perUserLimit: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Applicable Gender</label>
            <select value={form.applicableGender} onChange={(e) => setForm({ ...form, applicableGender: e.target.value })}
              className={inputClass}>
              <option value="">All</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Start Date *</label>
              <input type="date" value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Expiry Date *</label>
              <input type="date" value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputClass} />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-brand-500" />
            <span className="text-xs text-neutral-600">Active</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-neutral-500">Cancel</button>
            <button onClick={handleSave} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium">Save</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Coupon" size="sm">
        <p className="text-sm text-neutral-600 mb-6">Are you sure you want to delete this coupon? This cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-neutral-500">Cancel</button>
          <button onClick={() => handleDelete(deleteConfirm!)} className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
