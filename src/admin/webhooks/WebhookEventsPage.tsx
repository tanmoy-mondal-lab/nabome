import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/admin";
import { DataTable } from "../common/DataTable";
import { StatusBadge } from "../common/StatusBadge";
import { RefreshCw, AlertCircle } from "lucide-react";
import { formatDateTime } from "../../lib/utils/format";
import { useToast } from "../../components/ui/Toast";

interface WebhookEvent {
  id: string;
  eventType: string;
  source: string;
  status: string;
  orderId: string | null;
  errorMessage: string | null;
  retryCount: number;
  processedAt: string | null;
  createdAt: string;
}

export default function WebhookEventsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "webhooks", page, statusFilter],
    queryFn: async () => {
      const params: Record<string, string | number | undefined> = { page, limit: 25 };
      if (statusFilter) params.status = statusFilter;
      const res = await adminApi.getWebhookEvents(params) as { events: WebhookEvent[]; pagination?: { totalPages: number; total: number } };
      return {
        events: res.events ?? [],
        totalPages: res.pagination?.totalPages ?? 1,
        total: res.pagination?.total ?? 0,
      };
    },
  });

  const events = data?.events ?? [];
  const totalPages = data?.totalPages ?? 1;

  const reprocessMutation = useMutation({
    mutationFn: (eventId: string) => adminApi.reprocessWebhookEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "webhooks"] });
      toast("Event reprocessed", "success");
    },
    onError: () => {
      toast("Failed to reprocess event", "error");
    },
  });

  const columns = [
    {
      key: "eventType", label: "Event",
      render: (e: WebhookEvent) => <span className="font-mono text-xs text-neutral-900">{e.eventType}</span>,
    },
    {
      key: "source", label: "Source",
      render: (e: WebhookEvent) => <span className="text-xs capitalize text-neutral-500">{e.source}</span>,
    },
    {
      key: "status", label: "Status",
      render: (e: WebhookEvent) => <StatusBadge status={e.status} />,
    },
    {
      key: "orderId", label: "Order",
      render: (e: WebhookEvent) => <span className="text-xs text-neutral-500">{e.orderId ? e.orderId.slice(0, 8) : "-"}</span>,
    },
    {
      key: "retryCount", label: "Retries",
      render: (e: WebhookEvent) => <span className="text-sm text-neutral-500">{e.retryCount}</span>,
    },
    {
      key: "createdAt", label: "Received",
      render: (e: WebhookEvent) => <span className="text-sm text-neutral-500">{formatDateTime(e.createdAt)}</span>,
    },
    {
      key: "actions", label: "",
      render: (e: WebhookEvent) => e.status === "failed" || e.status === "error" ? (
        <button onClick={(ev) => { ev.stopPropagation(); reprocessMutation.mutate(e.id); }}
          disabled={reprocessMutation.isPending && reprocessMutation.variables === e.id}
          className="p-1.5 text-neutral-400 hover:text-brand-600 rounded-lg hover:bg-neutral-100">
          <RefreshCw size={14} className={reprocessMutation.isPending && reprocessMutation.variables === e.id ? "animate-spin" : ""} />
        </button>
      ) : null,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-neutral-900">Webhook Events</h1>
        <p className="text-sm text-neutral-500 mt-1">Monitor incoming webhook events from payment gateways</p>
      </div>

      <div className="flex gap-1 mb-4">
        {["", "received", "processed", "failed", "error"].map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`whitespace-nowrap px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${statusFilter === s ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}>
            {s ? s.replace(/_/g, " ") : "All"}
          </button>
        ))}
      </div>

      {isError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">Failed to load webhook events</p>
          <button onClick={() => refetch()} className="ml-auto text-sm text-red-600 hover:underline">Retry</button>
        </div>
      )}

      <DataTable columns={columns} data={events} isLoading={isLoading}
        page={page} totalPages={totalPages} onPageChange={setPage}
        emptyMessage="No webhook events" />
    </div>
  );
}
