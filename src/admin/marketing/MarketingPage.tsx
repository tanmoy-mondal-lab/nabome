import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { StatusBadge } from "../common/StatusBadge";
import { EmptyState } from "../common/EmptyState";
import { Edit3, Trash2, Plus, Percent, Bell } from "lucide-react";

// ─── Coupons ───

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrderValue: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: string;
}

// ─── Announcements ───

interface Announcement {
  id: string;
  message: string;
  linkUrl: string;
  linkLabel: string;
  position: string;
  isActive: boolean;
}

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<"coupons" | "announcements">("coupons");
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Coupon form
  const [couponForm, setCouponForm] = useState({
    code: "", type: "percentage", value: 0, minOrderValue: 0,
    maxUses: 0, isActive: true, expiresAt: "",
  });
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);

  // Announcement form
  const [annForm, setAnnForm] = useState({
    message: "", linkUrl: "", linkLabel: "", position: "top", isActive: true,
  });
  const [editAnn, setEditAnn] = useState<Announcement | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, aRes] = await Promise.all([
        adminApi.getCoupons(),
        adminApi.getAnnouncements(),
      ]);
      setCoupons((cRes.coupons as Coupon[]) ?? []);
      setAnnouncements((aRes.announcements as Announcement[]) ?? []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  // Coupon handlers
  const openCouponCreate = () => {
    setEditCoupon(null);
    setCouponForm({ code: "", type: "percentage", value: 0, minOrderValue: 0, maxUses: 0, isActive: true, expiresAt: "" });
    setModalOpen(true);
  };

  const openCouponEdit = (c: Coupon) => {
    setEditCoupon(c);
    setCouponForm({
      code: c.code, type: c.type, value: c.value, minOrderValue: c.minOrderValue,
      maxUses: c.maxUses, isActive: c.isActive,
      expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().split("T")[0] : "",
    });
    setModalOpen(true);
  };

  const handleCouponSave = async () => {
    try {
      if (editCoupon) {
        await adminApi.updateCoupon(editCoupon.id, couponForm);
      } else {
        await adminApi.createCoupon(couponForm);
      }
      setModalOpen(false);
      fetch();
    } catch { /* ignore */ }
  };

  const handleCouponDelete = async (id: string) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await adminApi.deleteCoupon(id);
      fetch();
    } catch { /* ignore */ }
  };

  // Announcement handlers
  const openAnnCreate = () => {
    setEditAnn(null);
    setAnnForm({ message: "", linkUrl: "", linkLabel: "", position: "top", isActive: true });
    setModalOpen(true);
  };

  const openAnnEdit = (a: Announcement) => {
    setEditAnn(a);
    setAnnForm({ message: a.message, linkUrl: a.linkUrl ?? "", linkLabel: a.linkLabel ?? "", position: a.position, isActive: a.isActive });
    setModalOpen(true);
  };

  const handleAnnSave = async () => {
    try {
      if (editAnn) {
        await adminApi.updateAnnouncement(editAnn.id, annForm);
      } else {
        await adminApi.createAnnouncement(annForm);
      }
      setModalOpen(false);
      fetch();
    } catch { /* ignore */ }
  };

  const handleAnnDelete = async (id: string) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await adminApi.deleteAnnouncement(id);
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
      <div className="mb-6">
        <h1 className="font-display text-2xl text-neutral-900">Marketing</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage coupons, promotions, and announcements</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-neutral-200 mb-6">
        <button onClick={() => setActiveTab("coupons")}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "coupons" ? "text-neutral-900 border-neutral-900" : "text-neutral-400 border-transparent hover:text-neutral-600"
          }`}>Coupons</button>
        <button onClick={() => setActiveTab("announcements")}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "announcements" ? "text-neutral-900 border-neutral-900" : "text-neutral-400 border-transparent hover:text-neutral-600"
          }`}>Announcements</button>
      </div>

      {/* Coupons Tab */}
      {activeTab === "coupons" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-neutral-500">{coupons.length} coupon{coupons.length !== 1 ? "s" : ""}</p>
            <button onClick={openCouponCreate}
              className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium">
              <Plus size={14} /> Add Coupon
            </button>
          </div>

          {coupons.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded">
              <EmptyState icon={Percent} title="No coupons yet"
                action={<button onClick={openCouponCreate} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm">Create Coupon</button>}
              />
            </div>
          ) : (
            <div className="bg-white border border-neutral-200 rounded overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-neutral-500 font-medium">Code</th>
                    <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-neutral-500 font-medium">Value</th>
                    <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-neutral-500 font-medium">Uses</th>
                    <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-neutral-500 font-medium">Expires</th>
                    <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-neutral-500 font-medium">Status</th>
                    <th className="text-right px-4 py-3 text-xs uppercase tracking-wider text-neutral-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.id} className="border-b border-neutral-50">
                      <td className="px-4 py-3 font-mono font-medium text-neutral-900">{c.code}</td>
                      <td className="px-4 py-3">{c.type === "percentage" ? `${c.value}%` : `₹${c.value}`}</td>
                      <td className="px-4 py-3 text-neutral-500">{c.usedCount}/{c.maxUses || "∞"}</td>
                      <td className="px-4 py-3 text-neutral-500">
                        {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-IN") : "Never"}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={c.isActive ? "active" : "inactive"} /></td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openCouponEdit(c)} className="p-2 hover:bg-neutral-100 rounded text-neutral-400"><Edit3 size={14} /></button>
                          <button onClick={() => handleCouponDelete(c.id)} className="p-2 hover:bg-red-50 rounded text-neutral-400 hover:text-red-500"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Modal open={modalOpen && activeTab === "coupons"} onClose={() => setModalOpen(false)}
            title={editCoupon ? "Edit Coupon" : "New Coupon"}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">Code *</label>
                  <input required value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded font-mono uppercase focus:outline-none focus:ring-1 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">Type</label>
                  <select value={couponForm.type}
                    onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">Value</label>
                  <input type="number" value={couponForm.value || ""}
                    onChange={(e) => setCouponForm({ ...couponForm, value: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">Min Order Value</label>
                  <input type="number" value={couponForm.minOrderValue || ""}
                    onChange={(e) => setCouponForm({ ...couponForm, minOrderValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">Max Uses (0 = unlimited)</label>
                  <input type="number" value={couponForm.maxUses || ""}
                    onChange={(e) => setCouponForm({ ...couponForm, maxUses: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">Expires At</label>
                  <input type="date" value={couponForm.expiresAt}
                    onChange={(e) => setCouponForm({ ...couponForm, expiresAt: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={couponForm.isActive}
                  onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.checked })} className="accent-brand-500" />
                <span className="text-xs text-neutral-600">Active</span>
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-neutral-500">Cancel</button>
                <button onClick={handleCouponSave} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium">Save</button>
              </div>
            </div>
          </Modal>
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === "announcements" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-neutral-500">{announcements.length} announcement{announcements.length !== 1 ? "s" : ""}</p>
            <button onClick={openAnnCreate}
              className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium">
              <Plus size={14} /> Add Announcement
            </button>
          </div>

          {announcements.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded">
              <EmptyState icon={Bell} title="No announcements"
                action={<button onClick={openAnnCreate} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm">Add Announcement</button>}
              />
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className="bg-white border border-neutral-200 rounded p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{a.message}</p>
                    <p className="text-xs text-neutral-400 capitalize">{a.position} · {a.linkLabel || "No link"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={a.isActive ? "active" : "inactive"} />
                    <button onClick={() => openAnnEdit(a)} className="p-2 hover:bg-neutral-100 rounded text-neutral-400"><Edit3 size={14} /></button>
                    <button onClick={() => handleAnnDelete(a.id)} className="p-2 hover:bg-red-50 rounded text-neutral-400 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Modal open={modalOpen && activeTab === "announcements"} onClose={() => setModalOpen(false)}
            title={editAnn ? "Edit Announcement" : "New Announcement"}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Message *</label>
                <input required value={annForm.message}
                  onChange={(e) => setAnnForm({ ...annForm, message: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">Link Label</label>
                  <input value={annForm.linkLabel}
                    onChange={(e) => setAnnForm({ ...annForm, linkLabel: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">Position</label>
                  <select value={annForm.position}
                    onChange={(e) => setAnnForm({ ...annForm, position: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded">
                    <option value="top">Top Bar</option>
                    <option value="bottom">Bottom Bar</option>
                    <option value="inline">Inline</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Link URL</label>
                <input value={annForm.linkUrl}
                  onChange={(e) => setAnnForm({ ...annForm, linkUrl: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={annForm.isActive}
                  onChange={(e) => setAnnForm({ ...annForm, isActive: e.target.checked })} className="accent-brand-500" />
                <span className="text-xs text-neutral-600">Active</span>
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-neutral-500">Cancel</button>
                <button onClick={handleAnnSave} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium">Save</button>
              </div>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
}
