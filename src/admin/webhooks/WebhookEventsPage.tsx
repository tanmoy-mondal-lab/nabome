import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../lib/api/admin";
import { DataTable } from "../common/DataTable";
import { StatusBadge } from "../common/StatusBadge";
import { RefreshCw } from "lucide-react";

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
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [reprocessing, setReprocessing] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | undefined> = { page, limit: 25 };
      if (statusFilter) params.status = statusFilter;
      const res = await adminApi.getWebhookEvents(params) as { events: WebhookEvent[]; pagination?: { totalPages: number } };
      setEvents(res.events ?? []);
      setTotalPages(res.pagination?.totalPages ?? 1);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { setPage(1); }, [statusFilter]);
  useEffect(() => { fetch(); }, [fetch]);

  const handleReprocess = async (eventId: string) => {
    setReprocessing(eventId);
    try {
      await adminApi.reprocessWebhookEvent(eventId);
      fetch();
    } catch { /* ignore */ } finally {
      setReprocessing(null);
    }
  };

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
      render: (e: WebhookEvent) => <span className="text-xs text-neutral-500">{e.orderId ? e.orderId.slice(0, 8) : "—"}</span>,
    },
    {
      key: "retryCount", label: "Retries",
      render: (e: WebhookEvent) => <span className="text-sm text-neutral-500">{e.retryCount}</span>,
    },
    {
      key: "createdAt", label: "Received",
      render: (e: WebhookEvent) => <span className="text-sm text-neutral-500">{new Date(e.createdAt).toLocaleString()}</span>,
    },
    {
      key: "actions", label: "",
      render: (e: WebhookEvent) => e.status === "failed" || e.status === "error" ? (
        <button onClick={(ev) => { ev.stopPropagation(); handleReprocess(e.id); }}
          disabled={reprocessing === e.id}
          className="p-1.5 text-neutral-400 hover:text-brand-600 rounded">
          <RefreshCw size={14} className={reprocessing === e.id ? "animate-spin" : ""} />
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
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`whitespace-nowrap px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${statusFilter === s ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}>
            {s ? s.replace(/_/g, " ") : "All"}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={events} isLoading={loading}
        page={page} totalPages={totalPages} onPageChange={setPage}
        emptyMessage="No webhook events" />
    </div>
  );
}
