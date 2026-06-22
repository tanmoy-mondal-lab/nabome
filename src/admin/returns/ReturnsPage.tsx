import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../lib/api/admin";
import { DataTable } from "../common/DataTable";
import { StatusBadge } from "../common/StatusBadge";
import { Modal } from "../common/Modal";
import { StatsCard } from "../common/StatsCard";
import { RotateCcw, Clock, CheckCircle, XCircle, Banknote } from "lucide-react";

interface ReturnEntry {
  id: string;
  reason: string;
  reasonDetail?: string;
  status: string;
  adminNote?: string;
  evidenceImages: string[];
  createdAt: string;
  profile?: { id: string; firstName: string; lastName: string; email: string };
  order?: { orderNumber: string; total: number };
  refund?: { id: string; amount: number; status: string };
  orderId: string;
}

const TABS = ["All Returns", "Pending", "Approved", "Rejected", "Refunded"];

const TAB_STATUS_MAP: Record<string, string | undefined> = {
  "All Returns": undefined,
  Pending: "pending",
  Approved: "approved",
  Rejected: "rejected",
  Refunded: "refunded",
};

export default function ReturnsPage() {
  const [returns, setReturns] = useState<ReturnEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("All Returns");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<ReturnEntry | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [adminNote, setAdminNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const status = TAB_STATUS_MAP[activeTab];
      const params: Record<string, string | number | undefined> = { page, limit: 20 };
      if (status) params.status = status;
      const res = await adminApi.getReturns(params);
      setReturns((res.returns as ReturnEntry[]) ?? []);
      const pag = res.pagination as { totalPages?: number } | undefined;
      setTotalPages(pag?.totalPages ?? 1);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [page, activeTab]);

  useEffect(() => { setPage(1); }, [activeTab]);
  useEffect(() => { fetch(); }, [fetch]);

  const handleAction = (returnItem: ReturnEntry, action: "approve" | "reject") => {
    setSelectedReturn(returnItem);
    setActionType(action);
    setAdminNote("");
    setModalOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedReturn) return;
    setActionLoading(true);
    try {
      if (actionType === "approve") {
        await adminApi.approveReturn(selectedReturn.id, adminNote ? { adminNote } : undefined);
      } else {
        await adminApi.rejectReturn(selectedReturn.id, { adminNote });
      }
      setModalOpen(false);
      fetch();
    } catch { /* ignore */ } finally {
      setActionLoading(false);
    }
  };

  const kpiCards = [
    { label: "Total Returns", value: returns.length, icon: RotateCcw },
    { label: "Pending", value: returns.filter((r) => r.status === "pending").length, icon: Clock },
    { label: "Approved This Month", value: returns.filter((r) => r.status === "approved").length, icon: CheckCircle },
  ];

  const columns = [
    {
      key: "id", label: "Return ID",
      render: (r: ReturnEntry) => <span className="font-medium text-neutral-900">#{r.id.slice(0, 8)}</span>,
    },
    {
      key: "orderNumber", label: "Order #",
      render: (r: ReturnEntry) => <span className="text-neutral-600">#{r.order?.orderNumber ?? "—"}</span>,
    },
    {
      key: "profile", label: "Customer",
      render: (r: ReturnEntry) => (
        <div>
          <p className="text-sm text-neutral-900">{r.profile?.firstName} {r.profile?.lastName}</p>
          <p className="text-xs text-neutral-400">{r.profile?.email}</p>
        </div>
      ),
    },
    {
      key: "reason", label: "Reason",
      render: (r: ReturnEntry) => (
        <span className="text-sm text-neutral-600 max-w-[200px] truncate block">{r.reason.replace(/_/g, " ")}</span>
      ),
    },
    {
      key: "status", label: "Status",
      render: (r: ReturnEntry) => <StatusBadge status={r.status} />,
    },
    {
      key: "createdAt", label: "Date",
      render: (r: ReturnEntry) => (
        <span className="text-sm text-neutral-500">
          {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-neutral-900">Returns & Refunds</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage return requests and process refunds</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {kpiCards.map((kpi) => (
          <StatsCard key={kpi.label} label={kpi.label} value={kpi.value} icon={kpi.icon} />
        ))}
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${
              activeTab === tab
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={returns}
        isLoading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onRowClick={(r) => navigate(`/admin/returns/${r.id}`)}
        actions={(r) => (
          <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
            {r.status === "pending" && (
              <>
                <button
                  onClick={() => handleAction(r, "approve")}
                  className="px-2.5 py-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction(r, "reject")}
                  className="px-2.5 py-1 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100"
                >
                  Reject
                </button>
              </>
            )}
          </div>
        )}
        emptyMessage="No returns found"
      />

      {/* Approve/Reject Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={actionType === "approve" ? "Approve Return" : "Reject Return"} size="sm">
        <div className="space-y-4">
          {selectedReturn && (
            <p className="text-sm text-neutral-600">
              {actionType === "approve" ? "Approve" : "Reject"} return #{selectedReturn.id.slice(0, 8)} for order #{selectedReturn.order?.orderNumber ?? "—"}?
            </p>
          )}
          <div>
            <label className="block text-xs text-neutral-500 mb-1">
              Admin Note {actionType === "reject" ? "(required)" : "(optional)"}
            </label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={3}
              placeholder={actionType === "reject" ? "Reason for rejection…" : "Optional note…"}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium border border-neutral-200 rounded hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmAction}
              disabled={actionLoading || (actionType === "reject" && !adminNote.trim())}
              className={`px-4 py-2 text-sm font-medium text-white rounded disabled:opacity-50 ${
                actionType === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {actionLoading ? "Processing…" : actionType === "approve" ? "Approve" : "Reject"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
