import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { ClipboardList, Search, FileText } from "lucide-react";

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
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{ page: number; perPage: number; total: number; totalPages: number } | null>(null);
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [metadataModal, setMetadataModal] = useState<Log | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | undefined> = { page, limit: 20 };
      if (actionFilter) params.action = actionFilter;
      if (entityFilter) params.entity = entityFilter;
      const res = await adminApi.getAuditLog(params);
      setLogs((res.logs as Log[]) ?? []);
      setPagination((res.pagination as typeof pagination) ?? null);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [page, actionFilter, entityFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const inputClass = "w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500";

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

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
              className="pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500 w-44"
            />
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              value={entityFilter}
              onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
              placeholder="Filter by entity..."
              className="pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500 w-44"
            />
          </div>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded">
          <EmptyState icon={ClipboardList} title="No audit log entries" description={actionFilter || entityFilter ? "Try different filters" : undefined} />
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Action</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Entity</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Entity ID</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">User</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Timestamp</th>
                <th className="text-right px-4 py-3 font-medium text-neutral-600">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-700">
                      {l.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-700 capitalize">{l.entity}</td>
                  <td className="px-4 py-3 text-neutral-500 font-mono text-xs">{l.entityId}</td>
                  <td className="px-4 py-3 text-neutral-700">
                    {l.profile.firstName} {l.profile.lastName}
                    <p className="text-xs text-neutral-400">{l.profile.email}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">{formatDate(l.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    {l.metadata && (
                      <button
                        onClick={() => setMetadataModal(l)}
                        className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 text-xs font-medium"
                      >
                        <FileText size={14} /> View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-neutral-500">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 border border-neutral-200 rounded text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 border border-neutral-200 rounded text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <Modal open={!!metadataModal} onClose={() => setMetadataModal(null)} title="Metadata Details" size="lg">
        <pre className="text-xs bg-neutral-50 border border-neutral-200 rounded p-4 overflow-auto max-h-96 text-neutral-800 font-mono leading-relaxed">
          {JSON.stringify(metadataModal?.metadata, null, 2)}
        </pre>
      </Modal>
    </div>
  );
}
