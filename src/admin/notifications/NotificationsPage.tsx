import { useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/admin";
import { DataTable } from "../common/DataTable";
import { StatusBadge } from "../common/StatusBadge";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { Bell, Edit3, AlertCircle } from "lucide-react";
import { formatDate } from "../../lib/utils/format";
import { useToast } from "../../components/ui/Toast";

interface NotificationEntry {
  id: string;
  type: string;
  title: string;
  body: string | null;
  channel: string;
  isRead: boolean;
  createdAt: string;
  profile?: { id: string; firstName: string; lastName: string; email: string };
}

interface NotificationTemplate {
  id: string;
  event: string;
  subject: string;
  emailBody: string | null;
  smsBody: string | null;
  inAppBody: string | null;
  isActive: boolean;
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"all" | "templates">("all");
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({ subject: "", emailBody: "", smsBody: "", inAppBody: "", isActive: true });
  const [typeFilter, setTypeFilter] = useState("");
  const inputClass = "w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500";

  const { data: notifData, isLoading: notifLoading, isError: isErrorNotif, refetch: refetchNotif } = useQuery({
    queryKey: ["admin", "notifications", page, typeFilter],
    queryFn: async () => {
      const params: Record<string, string | number | undefined> = { page, limit: 25 };
      if (typeFilter) params.type = typeFilter;
      const res = await adminApi.getNotifications(params) as { notifications: NotificationEntry[]; pagination?: { totalPages: number; total: number } };
      return {
        notifications: res.notifications ?? [],
        totalPages: res.pagination?.totalPages ?? 1,
        total: res.pagination?.total ?? 0,
      };
    },
    enabled: activeTab === "all",
  });

  const { data: templateData, isLoading: templateLoading, isError: isErrorTemplates, refetch: refetchTemplates } = useQuery({
    queryKey: ["admin", "notificationTemplates"],
    queryFn: async () => {
      const res = await adminApi.getNotificationTemplates();
      return (res.templates as NotificationTemplate[]) ?? [];
    },
    enabled: activeTab === "templates",
  });

  const notifications = notifData?.notifications ?? [];
  const totalPages = notifData?.totalPages ?? 1;
  const templates = templateData ?? [];

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof templateForm }) =>
      adminApi.updateNotificationTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notificationTemplates"] });
      setTemplateModalOpen(false);
      setEditingTemplate(null);
      toast("Template updated", "success");
    },
    onError: () => {
      toast("Failed to update template", "error");
    },
  });

  const openEditTemplate = (t: NotificationTemplate) => {
    setEditingTemplate(t);
    setTemplateForm({ subject: t.subject, emailBody: t.emailBody ?? "", smsBody: t.smsBody ?? "", inAppBody: t.inAppBody ?? "", isActive: t.isActive });
    setTemplateModalOpen(true);
  };

  const saveTemplate = () => {
    if (!editingTemplate) return;
    updateTemplateMutation.mutate({ id: editingTemplate.id, data: templateForm });
  };

  const notifColumns = [
    { key: "title", label: "Title", render: (n: NotificationEntry) => <span className="font-medium text-neutral-900">{n.title}</span> },
    { key: "profile", label: "User", render: (n: NotificationEntry) => <span className="text-sm text-neutral-500">{n.profile ? `${n.profile.firstName} ${n.profile.lastName}` : "-"}</span> },
    { key: "type", label: "Type", render: (n: NotificationEntry) => <StatusBadge status={n.type} /> },
    { key: "channel", label: "Channel", render: (n: NotificationEntry) => <span className="text-xs capitalize px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">{n.channel}</span> },
    { key: "isRead", label: "Read", render: (n: NotificationEntry) => <span className={`text-xs ${n.isRead ? "text-green-600" : "text-orange-600 font-medium"}`}>{n.isRead ? "Yes" : "No"}</span> },
    { key: "createdAt", label: "Date", render: (n: NotificationEntry) => <span className="text-sm text-neutral-500">{formatDate(n.createdAt)}</span> },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-neutral-900">Notifications</h1>
        <p className="text-sm text-neutral-500 mt-1">View sent notifications and manage templates</p>
      </div>

      <div className="flex gap-1 mb-4">
        {(["all", "templates"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${activeTab === tab ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}>
            {tab === "all" ? "Sent Notifications" : "Templates"}
          </button>
        ))}
      </div>

      {(isErrorNotif || isErrorTemplates) && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">Failed to load notifications</p>
          <button onClick={() => { refetchNotif(); refetchTemplates(); }} className="ml-auto text-sm text-red-600 hover:underline">Retry</button>
        </div>
      )}

      {activeTab === "all" && (
        <>
          <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
            {["", "order_confirmation", "shipping_update", "delivery", "return_update", "payment", "marketing", "system"].map((t) => (
              <button key={t} onClick={() => { setTypeFilter(t); setPage(1); }}
                className={`whitespace-nowrap px-3 py-1 text-xs rounded-full font-medium transition-colors ${typeFilter === t ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}>
                {t.replace(/_/g, " ") || "All"}
              </button>
            ))}
          </div>
          <DataTable columns={notifColumns} data={notifications} isLoading={notifLoading}
            page={page} totalPages={totalPages} onPageChange={setPage}
            emptyMessage="No notifications found" />
        </>
      )}

      {activeTab === "templates" && (
        <div className="premium-card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Event</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Subject</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">SMS</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">In-App</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templateLoading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-neutral-500">Loading templates...</td></tr>
              ) : templates.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-neutral-500">No templates found</td></tr>
              ) : (
                templates.map((t) => (
                  <tr key={t.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="px-4 py-3 font-mono text-xs text-neutral-900">{t.event.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3 text-neutral-900 max-w-[200px] truncate">{t.subject}</td>
                    <td className="px-4 py-3 text-xs">{t.emailBody ? <span className="text-green-600">Yes</span> : <span className="text-neutral-300">-</span>}</td>
                    <td className="px-4 py-3 text-xs">{t.smsBody ? <span className="text-green-600">Yes</span> : <span className="text-neutral-300">-</span>}</td>
                    <td className="px-4 py-3 text-xs">{t.inAppBody ? <span className="text-green-600">Yes</span> : <span className="text-neutral-300">-</span>}</td>
                    <td className="px-4 py-3"><StatusBadge status={t.isActive ? "active" : "inactive"} /></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEditTemplate(t)} className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100">
                        <Edit3 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={templateModalOpen} onClose={() => setTemplateModalOpen(false)} title={`Edit Template: ${editingTemplate?.event?.replace(/_/g, " ") ?? ""}`} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Subject</label>
            <input value={templateForm.subject} onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Email Body (HTML)</label>
            <textarea rows={4} value={templateForm.emailBody} onChange={(e) => setTemplateForm({ ...templateForm, emailBody: e.target.value })} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">SMS Body</label>
              <textarea rows={3} value={templateForm.smsBody} onChange={(e) => setTemplateForm({ ...templateForm, smsBody: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">In-App Body</label>
              <textarea rows={3} value={templateForm.inAppBody} onChange={(e) => setTemplateForm({ ...templateForm, inAppBody: e.target.value })} className={inputClass} />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={templateForm.isActive} onChange={(e) => setTemplateForm({ ...templateForm, isActive: e.target.checked })} className="accent-brand-500" />
            <span className="text-xs text-neutral-600">Active</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setTemplateModalOpen(false)} className="px-4 py-2 text-sm text-neutral-500">Cancel</button>
            <button onClick={saveTemplate} disabled={updateTemplateMutation.isPending}
              className="btn-primary disabled:opacity-50">
              {updateTemplateMutation.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
