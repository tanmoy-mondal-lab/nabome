import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../lib/api/admin";
import { StatusBadge } from "../common/StatusBadge";
import { EmptyState } from "../common/EmptyState";
import { ShieldAlert, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDateTime } from "../../lib/utils/format";

interface LoginAttempt {
  id: string;
  email: string;
  ipAddress: string | null;
  userAgent: string | null;
  success: boolean;
  failureReason: string | null;
  createdAt: string;
  profile?: { firstName: string; lastName: string; email: string } | null;
}

export default function LoginAttemptsPage() {
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [emailFilter, setEmailFilter] = useState("");
  const [successFilter, setSuccessFilter] = useState<"" | "true" | "false">("");

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | undefined> = { page, limit: 25 };
      if (emailFilter) params.email = emailFilter;
      if (successFilter) params.success = successFilter;
      const res = await adminApi.getLoginAttempts(params) as { attempts?: LoginAttempt[]; loginAttempts?: LoginAttempt[]; pagination?: { totalPages: number } };
      const items = res.loginAttempts ?? res.attempts ?? [];
      setAttempts(items);
      setTotalPages(res.pagination?.totalPages ?? 1);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [page, emailFilter, successFilter]);

  useEffect(() => { setPage(1); }, [emailFilter, successFilter]);
  useEffect(() => { fetch(); }, [fetch]);

  const inputClass = "w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500";

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">Login Attempts</h1>
          <p className="text-sm text-neutral-500 mt-1">{attempts.length} login attempt{attempts.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative max-w-xs flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input type="text" placeholder="Search by email…" value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
        {(["", "true", "false"] as const).map((v) => (
          <button key={v} onClick={() => setSuccessFilter(v)}
            className={`whitespace-nowrap px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${successFilter === v ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}
          >{v ? (v === "true" ? "Success" : "Fail") : "All"}</button>
        ))}
      </div>

      {attempts.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded">
          <EmptyState icon={ShieldAlert} title="No login attempts" />
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">IP Address</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">User Agent</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Failure Reason</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900">{a.profile ? `${a.profile.firstName} ${a.profile.lastName}` : a.email}</p>
                    {a.profile && <p className="text-xs text-neutral-400">{a.email}</p>}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={a.success ? "success" : "failed"} /></td>
                  <td className="px-4 py-3 text-neutral-500 font-mono text-xs">{a.ipAddress ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-500 max-w-[200px] truncate" title={a.userAgent ?? undefined}>{a.userAgent ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-500 max-w-[200px] truncate text-xs" title={a.failureReason ?? undefined}>{a.failureReason ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-500 whitespace-nowrap text-xs">{formatDateTime(a.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100">
              <p className="text-xs text-neutral-500">Page {page} of {totalPages}</p>
              <div className="flex gap-1">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)}
                  className="p-1.5 rounded hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronLeft size={16} />
                </button>
                <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
                  className="p-1.5 rounded hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
