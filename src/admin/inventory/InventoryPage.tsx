import { useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/admin";
import { DataTable } from "../common/DataTable";
import { Modal } from "../common/Modal";
import { StatsCard } from "../common/StatsCard";
import { EmptyState } from "../common/EmptyState";
import { Package, AlertTriangle, XCircle, CheckCircle, PackageSearch, Search } from "lucide-react";
import { formatDate } from "../../lib/utils/format";
import { useToast } from "../../components/ui/Toast";

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [tab, setTab] = useState<"overview" | "alerts" | "history">("overview");
  const [search, setSearch] = useState("");
  const [showAdjust, setShowAdjust] = useState(false);
  const [adjustVariant, setAdjustVariant] = useState<Record<string, unknown> | null>(null);
  const [adjustForm, setAdjustForm] = useState({ quantityChange: 0, reason: "", note: "" });
  const [adjustError, setAdjustError] = useState<string | null>(null);

  const { data: overview, isLoading, error } = useQuery({
    queryKey: ["admin", "inventory"],
    queryFn: async () => {
      const o = await adminApi.getInventoryOverview();
      return { stats: o.stats as Record<string, number>, recentMovements: o.recentMovements as unknown[], alerts: o.alerts as unknown[] };
    },
  });

  const adjustMutation = useMutation({
    mutationFn: (payload: { variantId: string; data: { quantityChange: number; reason: string; note: string } }) =>
      adminApi.adjustVariantStock(payload.variantId, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "inventory"] });
      setShowAdjust(false);
      setAdjustError(null);
      toast("Stock adjusted successfully", "success");
    },
    onError: (err) => {
      const msg = `Failed to adjust stock: ${(err as Error).message ?? "Unknown error"}`;
      setAdjustError(msg);
      toast(msg, "error");
    },
  });

  const resolveAlertMutation = useMutation({
    mutationFn: (alertId: string) => adminApi.resolveAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "inventory"] });
    },
    onError: () => {},
  });

  function openAdjust(variant: Record<string, unknown>) {
    setAdjustVariant(variant);
    setAdjustForm({ quantityChange: 0, reason: "manual_adjustment", note: "" });
    setShowAdjust(true);
  }

  function handleAdjust() {
    if (!adjustVariant) return;
    setAdjustError(null);
    adjustMutation.mutate({ variantId: adjustVariant.id as string, data: adjustForm });
  }

  function handleResolveAlert(alertId: string) {
    resolveAlertMutation.mutate(alertId);
  }

  const stats = overview?.stats;
  const alerts = overview?.alerts ?? [];
  const movements = overview?.recentMovements ?? [];

  const filteredAlerts = (alerts as Record<string, unknown>[]).filter((a) => {
    if (!search) return true;
    const variant = (a.variant as Record<string, unknown>) ?? {};
    return [a.message as string, (variant.sku as string) ?? "", ((variant.product as Record<string, unknown>)?.name as string) ?? ""].some((v) => (v || "").toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-display text-neutral-900">Inventory</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage stock levels, view movements, and resolve alerts</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard icon={PackageSearch} label="Total Variants" value={stats?.totalVariants ?? 0} />
        <StatsCard icon={PackageSearch} label="Total Stock" value={stats?.totalStock ?? 0} />
        <StatsCard icon={AlertTriangle} label="Low Stock" value={stats?.lowStockCount ?? 0} />
        <StatsCard icon={XCircle} label="Out of Stock" value={stats?.outOfStockCount ?? 0} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 text-sm text-red-700">
          {`Failed to load inventory data: ${(error as Error).message ?? "Unknown error"}`}
          <button onClick={() => queryClient.invalidateQueries({ queryKey: ["admin", "inventory"] })} className="ml-3 underline hover:text-red-900">Retry</button>
        </div>
      )}

      <div className="flex gap-1 border-b">
        {([{ key: "overview", label: "Overview" }, { key: "alerts", label: "Alerts" }, { key: "history", label: "History" }] as const).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === t.key ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-500"}`}>{t.label}</button>
        ))}
      </div>

      {tab === "alerts" && (
        <div className="space-y-4">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search alerts..." className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-neutral-900" />
          </div>
          {filteredAlerts.length === 0 ? <EmptyState title="No alerts" description={search ? "No matching alerts" : "All stock levels are healthy."} />
            : <div className="space-y-2">
              {(filteredAlerts as Record<string, unknown>[]).map((a) => {
                const v = (a.variant as Record<string, unknown>) ?? {};
                const p = (v.product as Record<string, unknown>) ?? {};
                return (
                  <div key={a.id as string} className="flex items-center justify-between bg-white border border-neutral-200 rounded px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${a.type === "out_of_stock" ? "bg-red-500" : "bg-amber-500"}`} />
                      <div>
                        <p className="text-sm text-neutral-900">{a.message as string}</p>
                        <p className="text-xs text-neutral-400">{p.name as string} — {v.sku as string} ({v.size as string}/{v.color as string})</p>
                      </div>
                    </div>
                    <button onClick={() => handleResolveAlert(a.id as string)} className="flex items-center gap-1 text-xs text-neutral-500 hover:text-green-600"><CheckCircle className="w-3 h-3" /> Resolve</button>
                  </div>
                );
              })}
            </div>}
        </div>
      )}

      {tab === "history" && (
        movements.length === 0 ? <EmptyState title="No movements yet" description="Stock adjustments will appear here." />
          : <DataTable columns={[
            { key: "createdAt", label: "Date", render: (item) => formatDate((item as Record<string, unknown>).createdAt as string) },
            { key: "variant", label: "Variant", render: (item) => {
              const variant = (item as Record<string, unknown>).variant as Record<string, unknown> ?? {};
              const product = variant.product as Record<string, unknown> ?? {};
              return <span className="text-sm">{(product.name as string) ?? ""} — {variant.sku as string}</span>;
            }},
            { key: "quantityChange", label: "Change", render: (item) => { const v = (item as Record<string, unknown>).quantityChange as number; return <span className={`text-xs font-medium ${v > 0 ? "text-green-600" : "text-red-600"}`}>{v > 0 ? `+${v}` : v}</span>; } },
            { key: "stockAfter", label: "After" },
            { key: "reason", label: "Reason" },
            { key: "note", label: "Note" },
          ]} data={movements as Record<string, unknown>[]} isLoading={isLoading} />)}

      <Modal open={showAdjust && !!adjustVariant} title={`Adjust Stock: ${adjustVariant?.sku ?? ""}`} onClose={() => { setShowAdjust(false); setAdjustError(null); }}>
        <div className="space-y-4">
          {adjustError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{adjustError}</p>}
          <p className="text-xs text-neutral-500">Current stock: <strong className="text-neutral-900">{adjustVariant?.stock as number ?? 0}</strong> | Size: {adjustVariant?.size as string ?? ""} | Color: {adjustVariant?.color as string ?? ""}</p>
          <div><label className="block text-xs text-neutral-500 mb-1">Quantity Change *</label><input type="number" value={adjustForm.quantityChange} onChange={(e) => setAdjustForm({ ...adjustForm, quantityChange: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 text-sm border rounded" placeholder="Use positive to add, negative to subtract" /></div>
          <div><label className="block text-xs text-neutral-500 mb-1">Reason *</label><select value={adjustForm.reason} onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })} className="w-full px-3 py-2 text-sm border rounded">
            <option value="manual_adjustment">Manual Adjustment</option>
            <option value="return">Return</option>
            <option value="damage">Damage / Write-off</option>
            <option value="restock">Restock</option>
            <option value="correction">Correction</option>
            <option value="transfer">Transfer</option>
          </select></div>
          <div><label className="block text-xs text-neutral-500 mb-1">Note</label><input value={adjustForm.note} onChange={(e) => setAdjustForm({ ...adjustForm, note: e.target.value })} className="w-full px-3 py-2 text-sm border rounded" /></div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t mt-4">
          <button onClick={() => setShowAdjust(false)} type="button" className="px-4 py-2 text-sm border border-neutral-200 rounded text-neutral-600 hover:bg-neutral-50">Cancel</button>
          <button onClick={handleAdjust} type="button" disabled={adjustMutation.isPending} className="px-4 py-2 text-sm bg-neutral-900 text-white rounded hover:bg-neutral-800">{adjustMutation.isPending ? "Saving..." : "Save"}</button>
        </div>
      </Modal>
    </div>
  );
}
