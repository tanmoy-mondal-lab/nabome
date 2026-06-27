import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { StatusBadge } from "../common/StatusBadge";
import { EmptyState } from "../common/EmptyState";
import { DataTable } from "../common/DataTable";
import { Clock, LogOut, ShieldAlert, Search } from "lucide-react";
import { formatDate, formatDateTime } from "../../lib/utils/format";
import { useToast } from "../../components/ui/Toast";
import { cn } from "../../lib/utils/cn";

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

type Tab = "sessions" | "attempts";

export default function AuthActivityPage() {
  const [tab, setTab] = useState<Tab>("sessions");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-neutral-900">Auth Activity</h1>
        <p className="text-sm text-neutral-500 mt-1">Monitor user sessions and login attempts</p>
      </div>

      <div className="flex items-center gap-1 border-b border-neutral-200">
        {([
          { key: "sessions" as const, label: "Active Sessions", icon: LogOut },
          { key: "attempts" as const, label: "Login Attempts", icon: ShieldAlert },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t.key
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-500 hover:text-neutral-700"
            )}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "sessions" ? <SessionsTab /> : <LoginAttemptsTab />}
    </div>
  );
}

function SessionsTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [revokeConfirm, setRevokeConfirm] = useState<Session | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "sessions", page, isActive],
    queryFn: async () => {
      const params: Record<string, string | number | undefined> = { page, limit: 15 };
      if (isActive !== undefined) params.isActive = isActive ? "true" : "false";
      const res = await adminApi.getSessions(params);
      return {
        sessions: (res.sessions as Session[]) ?? [],
        pagination: (res.pagination as { total: number; totalPages: number }) ?? { total: 0, totalPages: 1 },
      };
    },
  });

  const sessions = data?.sessions ?? [];
  const pagination = data?.pagination;

  const revokeMutation = useMutation({
    mutationFn: (id: string) => adminApi.revokeSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sessions"] });
      setRevokeConfirm(null);
      toast("Session revoked", "success");
    },
    onError: () => toast("Failed to revoke session", "error"),
  });

  const truncate = (s: string | null, len = 40) => {
    if (!s) return "-";
    return s.length > len ? s.slice(0, len) + "..." : s;
  };

  const columns = [
    {
      key: "profile", label: "User",
      render: (s: Session) => <span className="font-medium text-neutral-900">{s.profile.firstName} {s.profile.lastName}</span>,
    },
    {
      key: "email", label: "Email",
      render: (s: Session) => <span className="text-neutral-600">{s.profile.email}</span>,
    },
    {
      key: "ipAddress", label: "IP Address",
      render: (s: Session) => <span className="text-neutral-500 font-mono text-xs">{s.ipAddress ?? "-"}</span>,
    },
    {
      key: "userAgent", label: "User Agent",
      render: (s: Session) => <span className="text-neutral-500 text-xs" title={s.userAgent ?? undefined}>{truncate(s.userAgent)}</span>,
    },
    {
      key: "isActive", label: "Status",
      render: (s: Session) => <StatusBadge status={s.isActive ? "active" : "inactive"} />,
    },
    {
      key: "lastActiveAt", label: "Last Active",
      render: (s: Session) => (
        <span className="flex items-center gap-1 text-neutral-500 text-xs whitespace-nowrap">
          <Clock size={12} className="text-neutral-400 shrink-0" />
          {formatDate(s.lastActiveAt)}
        </span>
      ),
    },
    {
      key: "expiresAt", label: "Expires",
      render: (s: Session) => <span className="text-neutral-500 text-xs whitespace-nowrap">{formatDate(s.expiresAt)}</span>,
    },
    {
      key: "actions", label: "",
      render: (s: Session) => s.isActive ? (
        <button onClick={(ev) => { ev.stopPropagation(); setRevokeConfirm(s); }}
          className="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50" title="Revoke session">
          <LogOut size={14} />
        </button>
      ) : null,
    },
  ];

  return (
    <>
      <div className="flex items-center gap-2">
        {([undefined, true, false] as const).map((val) => {
          const label = val === undefined ? "All" : val ? "Active" : "Inactive";
          return (
            <button
              key={String(val)}
              onClick={() => { setIsActive(val); setPage(1); }}
              className={cn(
                "px-3 py-2 text-sm rounded-xl border font-medium transition-colors",
                isActive === val
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {sessions.length === 0 && !isLoading ? (
        <EmptyState icon={LogOut} title="No sessions found" description="No auth sessions match the current filter." />
      ) : (
        <DataTable columns={columns} data={sessions} isLoading={isLoading}
          page={page} totalPages={pagination?.totalPages ?? 1} onPageChange={setPage}
          emptyMessage="No sessions found" />
      )}

      <Modal open={!!revokeConfirm} onClose={() => setRevokeConfirm(null)} title="Revoke Session" size="sm">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-50 rounded-full shrink-0">
            <LogOut size={18} className="text-red-500" />
          </div>
          <div>
            <p className="text-sm text-neutral-600">
              Are you sure you want to revoke this session? The user will be signed out immediately.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => setRevokeConfirm(null)} className="px-4 py-2 text-sm text-neutral-500">Cancel</button>
          <button onClick={() => revokeConfirm && revokeMutation.mutate(revokeConfirm.id)} disabled={revokeMutation.isPending}
            className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50">
            {revokeMutation.isPending ? "Revoking..." : "Revoke"}
          </button>
        </div>
      </Modal>
    </>
  );
}

function LoginAttemptsTab() {
  const [page, setPage] = useState(1);
  const [emailFilter, setEmailFilter] = useState("");
  const [successFilter, setSuccessFilter] = useState<"" | "true" | "false">("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "loginAttempts", page, emailFilter, successFilter],
    queryFn: async () => {
      const params: Record<string, string | number | undefined> = { page, limit: 25 };
      if (emailFilter) params.email = emailFilter;
      if (successFilter) params.success = successFilter;
      const res = await adminApi.getLoginAttempts(params);
      return {
        attempts: ((res as Record<string, unknown>).loginAttempts ?? (res as Record<string, unknown>).attempts ?? []) as LoginAttempt[],
        pagination: (res as Record<string, unknown>).pagination as { total: number; totalPages: number } | undefined,
      };
    },
  });

  const attempts = data?.attempts ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input type="text" placeholder="Search by email..." value={emailFilter}
            onChange={(e) => { setEmailFilter(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
        {(["", "true", "false"] as const).map((v) => (
          <button key={v} onClick={() => { setSuccessFilter(v); setPage(1); }}
            className={cn(
              "whitespace-nowrap px-3 py-1.5 text-sm rounded-full font-medium transition-colors",
              successFilter === v ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            )}>
            {v ? (v === "true" ? "Success" : "Failed") : "All"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : attempts.length === 0 ? (
        <EmptyState icon={ShieldAlert} title="No login attempts" description="Login attempts will appear here as users sign in." />
      ) : (
        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium textneutral-600">Status</th>
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
                    <td className="px-4 py-3 text-neutral-500 font-mono text-xs">{a.ipAddress ?? "-"}</td>
                    <td className="px-4 py-3 text-neutral-500 max-w-[200px] truncate" title={a.userAgent ?? undefined}>{a.userAgent ?? "-"}</td>
                    <td className="px-4 py-3 text-neutral-500 max-w-[200px] truncate text-xs" title={a.failureReason ?? undefined}>{a.failureReason ?? "-"}</td>
                    <td className="px-4 py-3 text-neutral-500 whitespace-nowrap text-xs">{formatDateTime(a.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100">
              <p className="text-xs text-neutral-500">Page {page} of {totalPages}</p>
              <div className="flex gap-1">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)}
                  className="p-1.5 rounded hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
                  className="p-1.5 rounded hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
