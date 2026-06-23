import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../lib/api/admin";
import { DataTable } from "../common/DataTable";
import { StatusBadge } from "../common/StatusBadge";
import { formatDate } from "../../lib/utils/format";

interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  name: string;
  email: string;
  createdAt: string;
  profile?: { id: string; firstName: string; lastName: string; email: string };
  assignee?: { id: string; firstName: string; lastName: string };
  _count?: { replies: number };
}

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | undefined> = { page, limit: 25 };
      if (statusFilter) params.status = statusFilter;
      const res = await adminApi.getSupportTickets(params) as { tickets: SupportTicket[]; pagination?: { totalPages: number } };
      setTickets(res.tickets ?? []);
      setTotalPages(res.pagination?.totalPages ?? 1);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { setPage(1); }, [statusFilter]);
  useEffect(() => { fetch(); }, [fetch]);

  const statuses = ["", "open", "in_progress", "resolved", "closed"];

  const columns = [
    {
      key: "subject", label: "Subject",
      render: (t: SupportTicket) => <span className="font-medium text-neutral-900 max-w-[300px] truncate block">{t.subject}</span>,
    },
    {
      key: "name", label: "Customer",
      render: (t: SupportTicket) => (
        <div>
          <p className="text-sm text-neutral-900">{t.name}</p>
          <p className="text-xs text-neutral-400">{t.email}</p>
        </div>
      ),
    },
    {
      key: "status", label: "Status",
      render: (t: SupportTicket) => <StatusBadge status={t.status} />,
    },
    {
      key: "priority", label: "Priority",
      render: (t: SupportTicket) => (
        <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${t.priority === "urgent" ? "bg-red-100 text-red-700" : t.priority === "high" ? "bg-orange-100 text-orange-700" : t.priority === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>{t.priority}</span>
      ),
    },
    {
      key: "assignee", label: "Assigned To",
      render: (t: SupportTicket) => <span className="text-sm text-neutral-500">{t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName}` : "—"}</span>,
    },
    {
      key: "_count", label: "Replies",
      render: (t: SupportTicket) => <span className="text-sm text-neutral-500">{t._count?.replies ?? 0}</span>,
    },
    {
      key: "createdAt", label: "Date",
      render: (t: SupportTicket) => <span className="text-sm text-neutral-500">{formatDate(t.createdAt)}</span>,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-neutral-900">Support Tickets</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage customer support tickets</p>
      </div>

      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {statuses.map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`whitespace-nowrap px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${statusFilter === s ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}
          >{s ? s.replace(/_/g, " ") : "All"}</button>
        ))}
      </div>

      <DataTable columns={columns} data={tickets} isLoading={loading}
        page={page} totalPages={totalPages} onPageChange={setPage}
        onRowClick={(t) => navigate(`/admin/support/${t.id}`)}
        emptyMessage="No tickets found" />
    </div>
  );
}
