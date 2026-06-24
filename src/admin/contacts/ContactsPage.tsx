import { useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { StatusBadge } from "../common/StatusBadge";
import { MessageCircle, Trash2, Mail, MailOpen, Eye } from "lucide-react";
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

export default function ContactsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [detailItem, setDetailItem] = useState<Submission | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: submissions = [], isLoading: loading } = useQuery<Submission[]>({
    queryKey: ["admin", "contacts"],
    queryFn: async () => {
      const res = await adminApi.getContactSubmissions();
      return (res.submissions as Submission[]) ?? [];
    },
  });

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

  const unreadCount = submissions.filter((s) => !s.isRead).length;

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
          <h1 className="font-display text-2xl text-neutral-900">Contact Submissions</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
            {unreadCount > 0 ? ` (${unreadCount} unread)` : ""}
          </p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded">
          <EmptyState icon={MessageCircle} title="No submissions yet" />
        </div>
      ) : (
        <div className="space-y-2">
          {submissions.map((s) => (
            <div key={s.id}
              className={`bg-white border rounded p-4 cursor-pointer hover:border-neutral-300 transition-colors ${
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
                  <p className="text-xs text-neutral-400 mt-0.5 truncate">{s.email}{s.phone ? ` · ${s.phone}` : ""}</p>
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
                <p className="text-sm text-neutral-900">{detailItem.phone ?? "—"}</p>
              </div>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Subject</label>
              <p className="text-sm text-neutral-900 font-medium">{detailItem.subject}</p>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Message</label>
              <p className="text-sm text-neutral-600 whitespace-pre-wrap bg-neutral-50 rounded p-3 border border-neutral-200">
                {detailItem.message}
              </p>
            </div>
            <div className="flex justify-end">
              <a href={`mailto:${detailItem.email}?subject=Re: ${detailItem.subject}`}
                className="bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-neutral-800">
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
          <button onClick={() => deleteMutation.mutate(deleteConfirm!)} className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
