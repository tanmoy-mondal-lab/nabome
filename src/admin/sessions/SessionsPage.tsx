import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { StatusBadge } from "../common/StatusBadge";
import { EmptyState } from "../common/EmptyState";
import { Clock, LogOut, Search } from "lucide-react";

interface SessionProfile {
  firstName: string;
  lastName: string;
  email: string;
}

interface Session {
  id: string;
  profileId: string;
  ipAddress: string | null;
  userAgent: string | null;
  isActive: boolean;
  lastActiveAt: string;
  expiresAt: string;
  createdAt: string;
  profile: SessionProfile;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [revokeConfirm, setRevokeConfirm] = useState<string | null>(null);
  const limit = 15;

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | undefined> = { page, limit };
      if (isActive !== undefined) params.isActive = isActive ? "true" : "false";
      const res = await adminApi.getSessions(params);
      setSessions((res.sessions as Session[]) ?? []);
      setPagination((res.pagination as Pagination) ?? null);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [page, isActive]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleRevoke = async (id: string) => {
    try {
      await adminApi.revokeSession(id);
      setRevokeConfirm(null);
      fetch();
    } catch {
      /* ignore */
    }
  };

  const formatDate = (d: string) => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(d));
    } catch {
      return d;
    }
  };

  const truncate = (s: string | null, len = 40) => {
    if (!s) return "—";
    return s.length > len ? s.slice(0, len) + "…" : s;
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
          <h1 className="font-display text-2xl text-neutral-900">Auth Sessions</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {pagination ? `${pagination.total} session${pagination.total === 1 ? "" : "s"}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {([undefined, true, false] as const).map((val) => {
            const label = val === undefined ? "All" : val ? "Active" : "Inactive";
            return (
              <button
                key={String(val)}
                onClick={() => {
                  setIsActive(val);
                  setPage(1);
                }}
                className={`px-3 py-2 text-sm rounded border font-medium transition-colors ${
                  isActive === val
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded">
          <EmptyState
            icon={Search}
            title="No sessions found"
            description="No auth sessions match the current filter."
          />
        </div>
      ) : (
        <>
          <div className="bg-white border border-neutral-200 rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">User</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">IP Address</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">User Agent</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Last Active</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Expires</th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-neutral-900">
                      {s.profile.firstName} {s.profile.lastName}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{s.profile.email}</td>
                    <td className="px-4 py-3 text-neutral-500 font-mono text-xs">
                      {s.ipAddress ?? "—"}
                    </td>
                    <td
                      className="px-4 py-3 text-neutral-500 text-xs max-w-[200px] truncate"
                      title={s.userAgent ?? undefined}
                    >
                      {truncate(s.userAgent)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={s.isActive ? "active" : "inactive"} />
                    </td>
                    <td className="px-4 py-3 text-neutral-500 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-neutral-400 shrink-0" />
                        {formatDate(s.lastActiveAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500 text-xs whitespace-nowrap">
                      {formatDate(s.expiresAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {s.isActive && (
                        <button
                          onClick={() => setRevokeConfirm(s.id)}
                          className="inline-flex items-center gap-1 p-1.5 text-red-400 hover:text-red-600 rounded"
                          title="Revoke session"
                        >
                          <LogOut size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-neutral-500">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 text-sm border border-neutral-200 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50"
                >
                  Previous
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 text-sm rounded border ${
                      p === page
                        ? "bg-neutral-900 text-white border-neutral-900"
                        : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  className="px-3 py-1.5 text-sm border border-neutral-200 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <Modal
        open={!!revokeConfirm}
        onClose={() => setRevokeConfirm(null)}
        title="Revoke Session"
        size="sm"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-50 rounded-full shrink-0">
            <LogOut size={18} className="text-red-500" />
          </div>
          <div>
            <p className="text-sm text-neutral-600">
              Are you sure you want to revoke this session? The user will be signed out
              immediately and will need to log in again.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={() => setRevokeConfirm(null)}
            className="px-4 py-2 text-sm text-neutral-500"
          >
            Cancel
          </button>
          <button
            onClick={() => handleRevoke(revokeConfirm!)}
            className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium"
          >
            Revoke
          </button>
        </div>
      </Modal>
    </div>
  );
}
