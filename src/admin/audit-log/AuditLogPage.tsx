import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/admin";
import { DataTable } from "../common/DataTable";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { ClipboardList, Search, FileText } from "lucide-react";
import { formatDate } from "../../lib/utils/format";

interface Log {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  profile: { firstName: string; lastName: string; email: string };
}

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [metadataModal, setMetadataModal] = useState<Log | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "auditLog", page, actionFilter, entityFilter],
    queryFn: async () => {
      const params: Record<string, string | number | undefined> = { page, limit: 20 };
      if (actionFilter) params.action = actionFilter;
      if (entityFilter) params.entity = entityFilter;
      const res = await adminApi.getAuditLog(params);
      return {
        logs: (res.logs as Log[]) ?? [],
        pagination: (res.pagination as { total: number; totalPages: number }) ?? { total: 0, totalPages: 1 },
      };
    },
  });

  const logs = data?.logs ?? [];
  const pagination = data?.pagination;

  const columns = [
    {
      key: "action", label: "Action",
      render: (l: Log) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-neutral-100 text-neutral-700">
          {l.action}
        </span>
      ),
    },
    {
      key: "entity", label: "Entity",
      render: (l: Log) => <span className="text-neutral-700 capitalize">{l.entity}</span>,
    },
    {
      key: "entityId", label: "Entity ID",
      render: (l: Log) => <span className="text-neutral-500 font-mono text-xs">{l.entityId.slice(0, 8)}...</span>,
    },
    {
      key: "profile", label: "User",
      render: (l: Log) => (
        <div>
          <p className="text-neutral-700">{l.profile.firstName} {l.profile.lastName}</p>
          <p className="text-xs text-neutral-400">{l.profile.email}</p>
        </div>
      ),
    },
    {
      key: "createdAt", label: "Timestamp",
      render: (l: Log) => <span className="text-neutral-500 whitespace-nowrap">{formatDate(l.createdAt)}</span>,
    },
    {
      key: "metadata", label: "",
      render: (l: Log) => l.metadata ? (
        <button onClick={(ev) => { ev.stopPropagation(); setMetadataModal(l); }}
          className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 text-xs font-medium">
          <FileText size={14} /> View
        </button>
      ) : null,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">Audit Log</h1>
          <p className="text-sm text-neutral-500 mt-1">{pagination?.total ?? logs.length} entries</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              placeholder="Filter by action..."
              className="pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 w-44"
            />
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              value={entityFilter}
              onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
              placeholder="Filter by entity..."
              className="pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 w-44"
            />
          </div>
        </div>
      </div>

      {logs.length === 0 && !isLoading ? (
        <EmptyState icon={ClipboardList} title="No audit log entries" description={actionFilter || entityFilter ? "Try different filters" : undefined} />
      ) : (
        <DataTable columns={columns} data={logs} isLoading={isLoading}
          page={page} totalPages={pagination?.totalPages ?? 1} onPageChange={setPage}
          emptyMessage="No audit log entries" />
      )}

      <Modal open={!!metadataModal} onClose={() => setMetadataModal(null)} title="Metadata Details" size="lg">
        <pre className="text-xs bg-neutral-50 border border-neutral-200 rounded-xl p-4 overflow-auto max-h-96 text-neutral-800 font-mono leading-relaxed">
          {JSON.stringify(metadataModal?.metadata, null, 2)}
        </pre>
      </Modal>
    </div>
  );
}
