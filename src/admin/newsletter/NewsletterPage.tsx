import { useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { Mail, Trash2, Download, Search, AlertCircle } from "lucide-react";
import { StatusBadge } from "../common/StatusBadge";
import { formatDate } from "../../lib/utils/format";
import { useToast } from "../../components/ui/Toast";

interface Subscriber {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function NewsletterPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const limit = 20;

  const { data, isLoading: loading, isError, refetch } = useQuery({
    queryKey: ["admin", "newsletter", page],
    queryFn: async () => {
      const res = await adminApi.getNewsletterSubscribers({ page, limit });
      return {
        subscribers: (res.subscribers as Subscriber[]) ?? [],
        pagination: (res.pagination as Pagination) ?? { total: 0, page: 1, pageSize: limit, totalPages: 1 },
      };
    },
  });

  const subscribers = data?.subscribers ?? [];
  const pagination = data?.pagination;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteSubscriber(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "newsletter"] });
      setDeleteConfirm(null);
      toast("Subscriber removed", "success");
    },
    onError: () => {
      toast("Failed to remove subscriber", "error");
    },
  });

  const handleExport = () => {
    if (subscribers.length === 0) return;
    const csv = ["email,subscribed_at", ...subscribers.map((s) => `${s.email},${s.createdAt}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast("CSV exported", "success");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="premium-card rounded-2xl px-6 py-5 flex items-center gap-3 shadow-subtle">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-neutral-500">Loading subscribers...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">Newsletter Subscribers</h1>
          <p className="text-sm text-neutral-500 mt-1">{pagination?.total ?? subscribers.length} subscriber{(pagination?.total ?? subscribers.length) !== 1 ? "s" : ""}</p>
        </div>
        {subscribers.length > 0 && (
          <button onClick={handleExport}
            className="btn-secondary text-xs px-4 py-2.5">
            <Download size={16} /> Export CSV
          </button>
        )}
      </div>

      {isError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">Failed to load subscribers</p>
          <button onClick={() => refetch()} className="ml-auto text-sm text-red-600 hover:underline">Retry</button>
        </div>
      )}

      {subscribers.length === 0 ? (
        <EmptyState icon={Mail} title="No subscribers yet" />
      ) : (
        <>
          <div className="premium-card rounded-2xl overflow-hidden">
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

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-neutral-500">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 border border-neutral-200 rounded text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed">
                  Previous
                </button>
                <button disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 border border-neutral-200 rounded text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Remove Subscriber" size="sm">
        <p className="text-sm text-neutral-600 mb-6">Remove this subscriber from the newsletter list?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-neutral-500">Cancel</button>
          <button onClick={() => deleteMutation.mutate(deleteConfirm!)} disabled={deleteMutation.isPending}
            className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50">
            {deleteMutation.isPending ? "Removing..." : "Remove"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
