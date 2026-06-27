import { useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { MessageCircle, Trash2, Mail, Eye } from "lucide-react";
import { formatDate, formatDateTime } from "../../lib/utils/format";
import { useToast } from "../../components/ui/Toast";

interface Submission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function ContactsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [detailItem, setDetailItem] = useState<Submission | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const limit = 20;

  const { data, isLoading: loading } = useQuery({
    queryKey: ["admin", "contacts", page, unreadOnly],
    queryFn: async () => {
      const params: Record<string, string | undefined> = { page: String(page), limit: String(limit) };
      if (unreadOnly) params.unread = "true";
      const res = await adminApi.getContactSubmissions(params);
      return {
        submissions: (res.submissions as Submission[]) ?? [],
        unreadCount: (res.unreadCount as number) ?? 0,
        pagination: (res.pagination as Pagination) ?? { total: 0, page: 1, pageSize: limit, totalPages: 1 },
      };
    },
  });

  const submissions = data?.submissions ?? [];
  const unreadCount = data?.unreadCount ?? 0;
  const pagination = data?.pagination;

  const markReadMutation = useMutation({
    mutationFn: (id: string) => adminApi.markContactRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "contacts"] });
    },
    onError: () => {
      toast("Failed to mark submission as read", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteContactSubmission(id),
    onSuccess: () => {
      setDeleteConfirm(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "contacts"] });
      toast("Submission deleted", "success");
    },
    onError: () => {
      toast("Failed to delete submission", "error");
    },
  });

  const openDetail = (item: Submission) => {
    setDetailItem(item);
    if (!item.isRead) markReadMutation.mutate(item.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="premium-card rounded-2xl px-6 py-5 flex items-center gap-3 shadow-subtle">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-neutral-500">Loading submissions...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">Contact Submissions</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {pagination?.total ?? submissions.length} submission{(pagination?.total ?? submissions.length) !== 1 ? "s" : ""}
            {unreadCount > 0 ? ` (${unreadCount} unread)` : ""}
          </p>
        </div>
        <div className="flex gap-1">
          <button onClick={() => { setUnreadOnly(false); setPage(1); }}
            className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${!unreadOnly ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}>
            All
          </button>
          <button onClick={() => { setUnreadOnly(true); setPage(1); }}
            className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${unreadOnly ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}>
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>
      </div>

      {submissions.length === 0 ? (
        <EmptyState icon={MessageCircle} title="No submissions yet" />
      ) : (
        <>
          <div className="space-y-2">
            {submissions.map((s) => (
              <div key={s.id}
                className={`premium-card rounded-2xl p-4 cursor-pointer hover:border-neutral-300 transition-colors ${
                  !s.isRead ? "border-neutral-300 bg-neutral-50" : "border-neutral-200"
                }`}
                onClick={() => openDetail(s)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {!s.isRead && <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />}
                      <span className="font-medium text-sm text-neutral-900 truncate">{s.name}</span>
                      <span className="text-xs text-neutral-400">{formatDate(s.createdAt)}</span>
                    </div>
                    <p className="text-sm text-neutral-600 truncate">{s.subject}</p>
                    <p className="text-xs text-neutral-400 mt-0.5 truncate">{s.email}{s.phone ? ` - ${s.phone}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-1 ml-4 flex-shrink-0">
                    {!s.isRead && (
                      <span className="p-1.5 text-neutral-400" title="Unread">
                        <Mail size={14} />
                      </span>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(s.id); }}
                      className="p-1.5 text-red-400 hover:text-red-600 rounded">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
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

      <Modal open={!!detailItem} onClose={() => setDetailItem(null)} title="Submission Detail" size="lg">
        {detailItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Name</label>
                <p className="text-sm text-neutral-900">{detailItem.name}</p>
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Date</label>
                <p className="text-sm text-neutral-900">{formatDateTime(detailItem.createdAt)}</p>
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Email</label>
                <a href={`mailto:${detailItem.email}`} className="text-sm text-brand-600 hover:underline">{detailItem.email}</a>
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Phone</label>
                <p className="text-sm text-neutral-900">{detailItem.phone ?? "-"}</p>
              </div>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Subject</label>
              <p className="text-sm text-neutral-900 font-medium">{detailItem.subject}</p>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Message</label>
              <p className="text-sm text-neutral-600 whitespace-pre-wrap bg-neutral-50 rounded-xl p-3 border border-neutral-200">
                {detailItem.message}
              </p>
            </div>
            <div className="flex justify-end">
              <a href={`mailto:${detailItem.email}?subject=Re: ${detailItem.subject}`}
                className="btn-primary">
                Reply via Email
              </a>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Submission" size="sm">
        <p className="text-sm text-neutral-600 mb-6">Delete this contact submission?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-neutral-500">Cancel</button>
          <button onClick={() => deleteMutation.mutate(deleteConfirm!)} disabled={deleteMutation.isPending}
            className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50">
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
