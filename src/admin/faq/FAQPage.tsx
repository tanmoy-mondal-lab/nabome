import { useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "../../components/ui/Toast";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { StatusBadge } from "../common/StatusBadge";
import { EmptyState } from "../common/EmptyState";
import { Plus, Edit3, Trash2, HelpCircle } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export default function FAQPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<FAQItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({ question: "", answer: "", category: "", sortOrder: "0", isActive: true });

  const { data: faqs = [], isLoading: loading } = useQuery({
    queryKey: ["admin", "faqs"],
    queryFn: async () => {
      const res = await adminApi.getFaqs();
      return (res.faqs as FAQItem[]) ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: { question: string; answer: string; category?: string; sortOrder: number }) =>
      adminApi.createFaq(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "faqs"] });
      setModalOpen(false);
      toast("FAQ created successfully", "success");
    },
    onError: () => {
      toast("Failed to create FAQ", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { question: string; answer: string; category?: string; sortOrder: number; isActive: boolean } }) =>
      adminApi.updateFaq(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "faqs"] });
      setModalOpen(false);
      toast("FAQ updated successfully", "success");
    },
    onError: () => {
      toast("Failed to update FAQ", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteFaq(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "faqs"] });
      setDeleteConfirm(null);
      toast("FAQ deleted successfully", "success");
    },
    onError: () => {
      toast("Failed to delete FAQ", "error");
    },
  });

  const openCreate = () => {
    setEditItem(null);
    setForm({ question: "", answer: "", category: "", sortOrder: "0", isActive: true });
    setModalOpen(true);
  };

  const openEdit = (f: FAQItem) => {
    setEditItem(f);
    setForm({ question: f.question, answer: f.answer, category: f.category ?? "", sortOrder: f.sortOrder.toString(), isActive: f.isActive });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (editItem) {
      updateMutation.mutate({
        id: editItem.id,
        data: {
          question: form.question,
          answer: form.answer,
          category: form.category || undefined,
          sortOrder: Number(form.sortOrder) || 0,
          isActive: form.isActive,
        },
      });
    } else {
      createMutation.mutate({
        question: form.question,
        answer: form.answer,
        category: form.category || undefined,
        sortOrder: Number(form.sortOrder) || 0,
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const inputClass = "w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500";

  const grouped = faqs.reduce<Record<string, FAQItem[]>>((acc, f) => {
    const cat = f.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(f);
    return acc;
  }, {});

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">FAQ Management</h1>
          <p className="text-sm text-neutral-500 mt-1">{faqs.length} frequently asked questions</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded text-sm font-medium hover:bg-neutral-800">
          <Plus size={16} /> Add FAQ
        </button>
      </div>

      {faqs.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded">
          <EmptyState icon={HelpCircle} title="No FAQs yet"
            action={<button onClick={openCreate} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm">Create FAQ</button>} />
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <h3 className="text-xs uppercase tracking-wider text-neutral-400 font-medium mb-2 px-1">{cat}</h3>
              <div className="bg-white border border-neutral-200 rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50">
                      <th className="text-left px-4 py-3 font-medium text-neutral-600">Question</th>
                      <th className="text-left px-4 py-3 font-medium text-neutral-600">Order</th>
                      <th className="text-left px-4 py-3 font-medium text-neutral-600">Status</th>
                      <th className="text-right px-4 py-3 font-medium text-neutral-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((f) => (
                      <tr key={f.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-neutral-900">{f.question}</p>
                          <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">{f.answer}</p>
                        </td>
                        <td className="px-4 py-3 text-neutral-500">{f.sortOrder}</td>
                        <td className="px-4 py-3"><StatusBadge status={f.isActive ? "active" : "inactive"} /></td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEdit(f)} className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded"><Edit3 size={14} /></button>
                            <button onClick={() => setDeleteConfirm(f.id)} className="p-1.5 text-red-400 hover:text-red-600 rounded"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit FAQ" : "New FAQ"}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Question *</label>
            <input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Answer *</label>
            <textarea rows={4} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Category</label>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="General" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Sort Order</label>
              <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className={inputClass} />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-brand-500" />
            <span className="text-xs text-neutral-600">Active</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-neutral-500">Cancel</button>
            <button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50">
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete FAQ" size="sm">
        <p className="text-sm text-neutral-600 mb-6">Delete this FAQ entry?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-neutral-500">Cancel</button>
          <button onClick={() => handleDelete(deleteConfirm!)} disabled={deleteMutation.isPending} className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50">
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
