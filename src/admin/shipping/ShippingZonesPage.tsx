import { useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { formatPrice } from "../../lib/utils/format";
import { Plus, Edit2, Trash2, Truck } from "lucide-react";
import { useToast } from "../../components/ui/Toast";

interface ShippingRate {
  id: string;
  name: string;
  method: string;
  minOrderValue: number | null;
  maxOrderValue: number | null;
  baseRate: number;
  perKgRate: number | null;
  freeAbove: number | null;
  estimatedDaysMin: number | null;
  estimatedDaysMax: number | null;
}

interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  states: string[];
  pincodes: string[];
  isActive: boolean;
  sortOrder: number;
  rates: ShippingRate[];
}

const emptyZone = { name: "", countries: [], states: [], pincodes: [], isActive: true, sortOrder: 0 };
const emptyRate = {
  name: "", method: "standard", minOrderValue: null, maxOrderValue: null,
  baseRate: 0, perKgRate: null, freeAbove: null,
  estimatedDaysMin: null, estimatedDaysMax: null,
};

export default function ShippingZonesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [zoneModalOpen, setZoneModalOpen] = useState(false);
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingZone, setEditingZone] = useState<Partial<ShippingZone> & { name: string; countries: string[]; states: string[]; pincodes: string[] }>(emptyZone);
  const [editingRate, setEditingRate] = useState<Partial<ShippingRate> & Record<string, unknown>>(emptyRate);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [zoneInputs, setZoneInputs] = useState({ countries: "", states: "", pincodes: "" });

  const { data: zones = [], isLoading: loading } = useQuery<ShippingZone[]>({
    queryKey: ["admin", "shippingZones"],
    queryFn: async () => {
      const res = await adminApi.getShippingZones();
      return (res.zones as ShippingZone[]) ?? [];
    },
  });

  const createZoneMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => adminApi.createShippingZone(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "shippingZones"] });
      setZoneModalOpen(false);
      toast("Zone created", "success");
    },
    onError: () => toast("Failed to create zone", "error"),
  });

  const updateZoneMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => adminApi.updateShippingZone(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "shippingZones"] });
      setZoneModalOpen(false);
      toast("Zone updated", "success");
    },
    onError: () => toast("Failed to update zone", "error"),
  });

  const deleteZoneMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteShippingZone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "shippingZones"] });
      setDeleteConfirm(null);
      toast("Zone deleted", "success");
    },
    onError: () => toast("Failed to delete zone", "error"),
  });

  const addRateMutation = useMutation({
    mutationFn: ({ zoneId, data }: { zoneId: string; data: Record<string, unknown> }) => adminApi.addShippingRate(zoneId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "shippingZones"] });
      setRateModalOpen(false);
      toast("Rate added", "success");
    },
    onError: () => toast("Failed to add rate", "error"),
  });

  const updateRateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => adminApi.updateShippingRate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "shippingZones"] });
      setRateModalOpen(false);
      toast("Rate updated", "success");
    },
    onError: () => toast("Failed to update rate", "error"),
  });

  const openAddZone = () => {
    setEditingZone({ name: "", countries: [], states: [], pincodes: [], isActive: true, sortOrder: 0 });
    setZoneInputs({ countries: "", states: "", pincodes: "" });
    setEditingZoneId(null);
    setZoneModalOpen(true);
  };

  const openEditZone = (zone: ShippingZone) => {
    setEditingZone({
      name: zone.name,
      countries: zone.countries,
      states: zone.states,
      pincodes: zone.pincodes,
      isActive: zone.isActive,
      sortOrder: zone.sortOrder,
    });
    setZoneInputs({
      countries: zone.countries.join(", "),
      states: zone.states.join(", "),
      pincodes: zone.pincodes.join(", "),
    });
    setEditingZoneId(zone.id);
    setZoneModalOpen(true);
  };

  const saveZone = () => {
    if (!editingZone.name.trim()) return;
    const data = {
      name: editingZone.name,
      countries: zoneInputs.countries.split(",").map((s) => s.trim()).filter(Boolean),
      states: zoneInputs.states.split(",").map((s) => s.trim()).filter(Boolean),
      pincodes: zoneInputs.pincodes.split(",").map((s) => s.trim()).filter(Boolean),
      isActive: editingZone.isActive ?? true,
      sortOrder: editingZone.sortOrder ?? 0,
    };
    if (editingZoneId) {
      updateZoneMutation.mutate({ id: editingZoneId, data });
    } else {
      createZoneMutation.mutate(data);
    }
  };

  const deleteZone = (id: string) => {
    deleteZoneMutation.mutate(id);
  };

  const openAddRate = (zoneId: string) => {
    setEditingRate({ ...emptyRate, method: "standard" });
    setEditingZoneId(zoneId);
    setEditingRateId(null);
    setRateModalOpen(true);
  };

  const openEditRate = (_zoneId: string, rate: ShippingRate) => {
    setEditingRate({ ...rate });
    setEditingZoneId(_zoneId);
    setEditingRateId(rate.id);
    setRateModalOpen(true);
  };

  const saveRate = () => {
    if (!editingZoneId) return;
    const data = {
      name: editingRate.name,
      method: editingRate.method,
      minOrderValue: editingRate.minOrderValue || null,
      maxOrderValue: editingRate.maxOrderValue || null,
      baseRate: editingRate.baseRate,
      perKgRate: editingRate.perKgRate || null,
      freeAbove: editingRate.freeAbove || null,
      estimatedDaysMin: editingRate.estimatedDaysMin || null,
      estimatedDaysMax: editingRate.estimatedDaysMax || null,
    };
    if (editingRateId) {
      updateRateMutation.mutate({ id: editingRateId, data });
    } else {
      addRateMutation.mutate({ zoneId: editingZoneId, data });
    }
  };

  const isSaving = createZoneMutation.isPending || updateZoneMutation.isPending || addRateMutation.isPending || updateRateMutation.isPending;

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
          <h1 className="font-display text-2xl text-neutral-900">Shipping Zones</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage shipping zones and rates</p>
        </div>
        <button
          onClick={openAddZone}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <Plus size={16} /> Add Zone
        </button>
      </div>

      {zones.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center">
          <Truck size={40} className="text-neutral-300 mx-auto mb-4" />
          <p className="font-display text-lg text-neutral-500">No shipping zones</p>
          <p className="text-sm text-neutral-400 mt-1">Add your first shipping zone to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {zones.map((zone) => (
            <div key={zone.id} className="bg-white border border-neutral-200 rounded-lg">
              {/* Zone Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-neutral-900">{zone.name}</h3>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${zone.isActive !== false ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"}`}>{zone.isActive !== false ? "Active" : "Inactive"}</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {zone.countries.join(", ") || "All countries"}
                    {zone.states.length > 0 && ` · ${zone.states.length} states`}
                    {zone.pincodes.length > 0 && ` · ${zone.pincodes.length} pincodes`}
                    {zone.sortOrder > 0 && ` · Order ${zone.sortOrder}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openAddRate(zone.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <Plus size={12} /> Add Rate
                  </button>
                  <button
                    onClick={() => openEditZone(zone)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(zone.id)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-neutral-100 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Rates Table */}
              {zone.rates && zone.rates.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-50 bg-neutral-50">
                        <th className="text-left px-6 py-2 text-xs uppercase tracking-wider text-neutral-500 font-medium">Rate Name</th>
                        <th className="text-left px-6 py-2 text-xs uppercase tracking-wider text-neutral-500 font-medium">Method</th>
                        <th className="text-left px-6 py-2 text-xs uppercase tracking-wider text-neutral-500 font-medium">Min Order</th>
                        <th className="text-left px-6 py-2 text-xs uppercase tracking-wider text-neutral-500 font-medium">Max Order</th>
                        <th className="text-left px-6 py-2 text-xs uppercase tracking-wider text-neutral-500 font-medium">Base Rate</th>
                        <th className="text-left px-6 py-2 text-xs uppercase tracking-wider text-neutral-500 font-medium">Per Kg</th>
                        <th className="text-left px-6 py-2 text-xs uppercase tracking-wider text-neutral-500 font-medium">Free Above</th>
                        <th className="text-left px-6 py-2 text-xs uppercase tracking-wider text-neutral-500 font-medium">Est. Days</th>
                        <th className="px-6 py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {zone.rates.map((rate) => (
                        <tr key={rate.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                          <td className="px-6 py-3 font-medium text-neutral-900">{rate.name}</td>
                          <td className="px-6 py-3 capitalize text-neutral-600">{rate.method.replace(/_/g, " ")}</td>
                          <td className="px-6 py-3 text-neutral-600">{rate.minOrderValue ? formatPrice(rate.minOrderValue) : "—"}</td>
                          <td className="px-6 py-3 text-neutral-600">{rate.maxOrderValue ? formatPrice(rate.maxOrderValue) : "—"}</td>
                          <td className="px-6 py-3 text-neutral-900">{formatPrice(rate.baseRate ?? 0)}</td>
                          <td className="px-6 py-3 text-neutral-600">{rate.perKgRate ? formatPrice(rate.perKgRate) : "—"}</td>
                          <td className="px-6 py-3 text-neutral-600">{rate.freeAbove ? formatPrice(rate.freeAbove) : "—"}</td>
                          <td className="px-6 py-3 text-neutral-600">
                            {rate.estimatedDaysMin && rate.estimatedDaysMax
                              ? `${rate.estimatedDaysMin}-${rate.estimatedDaysMax}`
                              : "—"}
                          </td>
                          <td className="px-6 py-3">
                            <button
                              onClick={() => openEditRate(zone.id, rate)}
                              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
                            >
                              <Edit2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="px-6 py-4 text-sm text-neutral-400">No rates configured for this zone</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Zone Modal */}
      <Modal open={zoneModalOpen} onClose={() => setZoneModalOpen(false)} title={editingZoneId ? "Edit Zone" : "Add Zone"} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Zone Name</label>
            <input
              value={editingZone.name}
              onChange={(e) => setEditingZone({ ...editingZone, name: e.target.value })}
              placeholder="e.g. Domestic, International"
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Countries (comma-separated)</label>
            <input
              value={zoneInputs.countries}
              onChange={(e) => setZoneInputs({ ...zoneInputs, countries: e.target.value })}
              placeholder="India, USA, UK"
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">States (comma-separated, leave blank for all)</label>
            <input
              value={zoneInputs.states}
              onChange={(e) => setZoneInputs({ ...zoneInputs, states: e.target.value })}
              placeholder="Maharashtra, Delhi, Karnataka"
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Pincodes (comma-separated, leave blank for all)</label>
            <input
              value={zoneInputs.pincodes}
              onChange={(e) => setZoneInputs({ ...zoneInputs, pincodes: e.target.value })}
              placeholder="400001, 110001, 560001"
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Sort Order</label>
              <input type="number" min={0} value={editingZone.sortOrder ?? 0}
                onChange={(e) => setEditingZone({ ...editingZone, sortOrder: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editingZone.isActive ?? true}
                  onChange={(e) => setEditingZone({ ...editingZone, isActive: e.target.checked })}
                  className="accent-brand-500" />
                <span className="text-xs text-neutral-600">Active</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setZoneModalOpen(false)} className="px-4 py-2 text-sm font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
              Cancel
            </button>
            <button onClick={saveZone} disabled={isSaving || !editingZone.name.trim()} className="px-4 py-2 text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50">
              {isSaving ? "Saving…" : editingZoneId ? "Update Zone" : "Create Zone"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add/Edit Rate Modal */}
      <Modal open={rateModalOpen} onClose={() => setRateModalOpen(false)} title={editingRateId ? "Edit Rate" : "Add Rate"} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Rate Name</label>
              <input
                value={editingRate.name as string}
                onChange={(e) => setEditingRate({ ...editingRate, name: e.target.value })}
                placeholder="e.g. Standard, Express"
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Method</label>
              <select
                value={editingRate.method as string}
                onChange={(e) => setEditingRate({ ...editingRate, method: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              >
                <option value="standard">Standard</option>
                <option value="express">Express</option>
                <option value="overnight">Overnight</option>
                <option value="freight">Freight</option>
                <option value="pickup">Store Pickup</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Base Rate (₹)</label>
              <input
                type="number"
                value={(editingRate.baseRate as number) ?? 0}
                onChange={(e) => setEditingRate({ ...editingRate, baseRate: Number(e.target.value) })}
                min={0}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Per Kg Rate (₹)</label>
              <input
                type="number"
                value={(editingRate.perKgRate as number | null) ?? ""}
                onChange={(e) => setEditingRate({ ...editingRate, perKgRate: e.target.value ? Number(e.target.value) : null })}
                min={0}
                placeholder="Optional"
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Min Order Value (₹)</label>
              <input
                type="number"
                value={(editingRate.minOrderValue as number | null) ?? ""}
                onChange={(e) => setEditingRate({ ...editingRate, minOrderValue: e.target.value ? Number(e.target.value) : null })}
                min={0}
                placeholder="Optional"
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Max Order Value (₹)</label>
              <input
                type="number"
                value={(editingRate.maxOrderValue as number | null) ?? ""}
                onChange={(e) => setEditingRate({ ...editingRate, maxOrderValue: e.target.value ? Number(e.target.value) : null })}
                min={0}
                placeholder="Optional"
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Free Shipping Above (₹)</label>
              <input
                type="number"
                value={(editingRate.freeAbove as number | null) ?? ""}
                onChange={(e) => setEditingRate({ ...editingRate, freeAbove: e.target.value ? Number(e.target.value) : null })}
                min={0}
                placeholder="Optional"
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Estimated Days</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={(editingRate.estimatedDaysMin as number | null) ?? ""}
                  onChange={(e) => setEditingRate({ ...editingRate, estimatedDaysMin: e.target.value ? Number(e.target.value) : null })}
                  min={0}
                  placeholder="Min"
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                />
                <span className="text-neutral-400">to</span>
                <input
                  type="number"
                  value={(editingRate.estimatedDaysMax as number | null) ?? ""}
                  onChange={(e) => setEditingRate({ ...editingRate, estimatedDaysMax: e.target.value ? Number(e.target.value) : null })}
                  min={0}
                  placeholder="Max"
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setRateModalOpen(false)} className="px-4 py-2 text-sm font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
              Cancel
            </button>
            <button onClick={saveRate} disabled={isSaving || !editingRate.name} className="px-4 py-2 text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50">
              {isSaving ? "Saving…" : editingRateId ? "Update Rate" : "Add Rate"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)} title="Delete Zone" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">Are you sure you want to delete this shipping zone? This action cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={() => deleteConfirm && deleteZone(deleteConfirm)}
              className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
