import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { Mail, Trash2, Download } from "lucide-react";
import { StatusBadge } from "../common/StatusBadge";
import { formatDate } from "../../lib/utils/format";

interface Subscriber {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getNewsletterSubscribers();
      setSubscribers((res.subscribers as Subscriber[]) ?? []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async (id: string) => {
    try {
      await adminApi.deleteSubscriber(id);
      setDeleteConfirm(null);
      fetch();
    } catch { /* ignore */ }
  };

  const handleExport = () => {
    const csv = ["email,subscribed_at", ...subscribers.map((s) => `${s.email},${s.createdAt}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">Newsletter Subscribers</h1>
          <p className="text-sm text-neutral-500 mt-1">{subscribers.length} subscriber{subscribers.length !== 1 ? "s" : ""}</p>
        </div>
        {subscribers.length > 0 && (
          <button onClick={handleExport}
            className="flex items-center gap-2 bg-neutral-100 text-neutral-700 px-4 py-2.5 rounded text-sm font-medium hover:bg-neutral-200">
            <Download size={16} /> Export CSV
          </button>
        )}
      </div>

      {subscribers.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded">
          <EmptyState icon={Mail} title="No subscribers yet" />
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Subscribed On</th>
                <th className="text-right px-4 py-3 font-medium text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="px-4 py-3 text-neutral-900">{s.email}</td>
                  <td className="px-4 py-3"><StatusBadge status={s.isActive !== false ? "active" : "inactive"} /></td>
                  <td className="px-4 py-3 text-neutral-500">{formatDate(s.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setDeleteConfirm(s.id)} className="p-1.5 text-red-400 hover:text-red-600 rounded">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Remove Subscriber" size="sm">
        <p className="text-sm text-neutral-600 mb-6">Remove this subscriber from the newsletter list?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-neutral-500">Cancel</button>
          <button onClick={() => handleDelete(deleteConfirm!)} className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium">Remove</button>
        </div>
      </Modal>
    </div>
  );
}
