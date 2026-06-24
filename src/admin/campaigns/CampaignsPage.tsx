import { useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/admin";
import { useToast } from "../../components/ui/Toast";
import { Modal } from "../common/Modal";
import { StatusBadge } from "../common/StatusBadge";
import { EmptyState } from "../common/EmptyState";
import { Megaphone, Plus, Edit3, Trash2 } from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  type: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  metadata: unknown | null;
  createdAt: string;
}

const CAMPAIGN_TYPES = ["seasonal", "promotional", "launch", "event"];

export default function CampaignsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Campaign | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", type: "seasonal", startDate: "", endDate: "", isActive: true });

  const { data: campaigns = [], isLoading: loading } = useQuery({
    queryKey: ["admin", "campaigns"],
    queryFn: async () => {
      const res = await adminApi.getCampaigns();
      return (res.campaigns as Campaign[]) ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; type: string; startDate: string; endDate?: string }) =>
      adminApi.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "campaigns"] });
      setModalOpen(false);
      toast("Campaign created", "success");
    },
    onError: () => {
      toast("Failed to create campaign", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; description: string | null; type: string; startDate: string; endDate: string | null; isActive: boolean } }) =>
      adminApi.updateCampaign(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "campaigns"] });
      setModalOpen(false);
      toast("Campaign updated", "success");
    },
    onError: () => {
      toast("Failed to update campaign", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "campaigns"] });
      setDeleteConfirm(null);
      toast("Campaign deleted", "success");
    },
    onError: () => {
      toast("Failed to delete campaign", "error");
    },
  });

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: "", description: "", type: "seasonal", startDate: "", endDate: "", isActive: true });
    setModalOpen(true);
  };

  const openEdit = (c: Campaign) => {
    setEditItem(c);
    setForm({ name: c.name, description: c.description ?? "", type: c.type, startDate: c.startDate, endDate: c.endDate ?? "", isActive: c.isActive });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (editItem) {
      updateMutation.mutate({
        id: editItem.id,
        data: { name: form.name, description: form.description || null, type: form.type, startDate: form.startDate, endDate: form.endDate || null, isActive: form.isActive },
      });
    } else {
      createMutation.mutate({
        name: form.name,
        description: form.description || undefined,
        type: form.type,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const inputClass = "w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500";

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">Campaigns</h1>
          <p className="text-sm text-neutral-500 mt-1">{campaigns.length} campaigns</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded text-sm font-medium hover:bg-neutral-800">
          <Plus size={16} /> Add Campaign
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded">
          <EmptyState icon={Megaphone} title="No campaigns yet"
            action={<button onClick={openCreate} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm">Create Campaign</button>} />
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Start Date</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">End Date</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900">{c.name}</p>
                    {c.description && <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">{c.description}</p>}
                  </td>
                  <td className="px-4 py-3 capitalize text-neutral-600">{c.type}</td>
                  <td className="px-4 py-3 text-neutral-500">{c.startDate}</td>
                  <td className="px-4 py-3 text-neutral-500">{c.endDate ?? "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.isActive ? "active" : "inactive"} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded"><Edit3 size={14} /></button>
                      <button onClick={() => setDeleteConfirm(c.id)} className="p-1.5 text-red-400 hover:text-red-600 rounded"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Campaign" : "New Campaign"}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Type *</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>
                {CAMPAIGN_TYPES.map((t) => (
                  <option key={t} value={t} className="capitalize">{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Start Date *</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">End Date</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputClass} />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-brand-500" />
            <span className="text-xs text-neutral-600">Active</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-neutral-500">Cancel</button>
            <button onClick={handleSave} disabled={isSaving} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50">
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Campaign" size="sm">
        <p className="text-sm text-neutral-600 mb-6">Delete this campaign?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-neutral-500">Cancel</button>
          <button
            onClick={() => handleDelete(deleteConfirm!)}
            disabled={deleteMutation.isPending}
            className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
