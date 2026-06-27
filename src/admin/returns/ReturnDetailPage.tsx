import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminApi } from "../../lib/api/admin";
import { StatusBadge } from "../common/StatusBadge";
import { Modal } from "../common/Modal";
import { SafeImage } from "../../components/SafeImage";
import { formatPrice, formatDate, formatDateTime } from "../../lib/utils/format";
import { ArrowLeft, CheckCircle, XCircle, Package, Banknote } from "lucide-react";

interface ReturnDetail {
  id: string;
  reason: string;
  reasonDetail: string | null;
  status: string;
  evidenceImages: string[];
  adminNote: string | null;
  createdAt: string;
  profile?: { id: string; firstName: string; lastName: string; email: string; phone?: string };
  order?: { id: string; orderNumber: string; total: number; items?: Array<{ id: string; name: string }> };
  refund?: {
    id: string;
    amount: number;
    status: string;
    type: string;
    notes: string | null;
    createdAt: string;
    processedAt: string | null;
  };
  timeline?: Array<{
    id: string;
    status: string;
    note: string | null;
    createdAt: string;
  }>;
}

export default function ReturnDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [returnDetail, setReturnDetail] = useState<ReturnDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminNote, setAdminNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundNote, setRefundNote] = useState("");

  useEffect(() => {
    if (!id) return;
    adminApi.getReturn(id).then((res) => {
      const data = (res as unknown as { return: ReturnDetail }).return;
      if (data) setReturnDetail(data);
    }).catch(() => {
      navigate("/admin/returns");
    }).finally(() => setLoading(false));
  }, [id, navigate]);

  const reload = async () => {
    if (!id) return;
    const res = await adminApi.getReturn(id);
    const data = (res as unknown as { return: ReturnDetail }).return;
    if (data) setReturnDetail(data);
  };

  const handleApprove = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await adminApi.approveReturn(id, adminNote ? { adminNote } : undefined);
      await reload();
      setAdminNote("");
    } catch { /* non-critical: failed to approve return, data stays unchanged */ } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await adminApi.rejectReturn(id, { adminNote });
      await reload();
      setAdminNote("");
    } catch { /* non-critical: failed to reject return, data stays unchanged */ } finally {
      setActionLoading(false);
    }
  };

  const handleMarkReceived = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await adminApi.receiveReturn(id);
      await reload();
    } catch { /* non-critical: failed to mark return as received */ } finally {
      setActionLoading(false);
    }
  };

  const handleCreateRefund = async () => {
    if (!id || !returnDetail) return;
    setActionLoading(true);
    try {
      await adminApi.createRefund({
        orderId: returnDetail.order!.id,
        returnRequestId: id,
        amount: refundAmount,
        type: refundAmount >= (returnDetail.order?.total ?? 0) ? "full" : "partial",
        notes: refundNote || undefined,
      });
      await reload();
      setRefundModalOpen(false);
    } catch { /* non-critical: failed to create refund */ } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="premium-card rounded-2xl px-6 py-5 flex items-center gap-3 shadow-subtle">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-neutral-500">Loading return details…</span>
        </div>
      </div>
    );
  }

  if (!returnDetail) return null;

  const canApprove = returnDetail.status === "pending";
  const canReject = returnDetail.status === "pending";
  const canMarkReceived = returnDetail.status === "approved";
  const refundPending = returnDetail.refund?.status === "pending";
  const refundProcessing = returnDetail.refund?.status === "processing";
  const canProcessRefund = refundPending;
  const canCompleteRefund = refundProcessing;
  const canFailRefund = refundPending || refundProcessing;

  return (
    <div>
      <button onClick={() => navigate("/admin/returns")} className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 mb-4">
        <ArrowLeft size={14} /> Back to Returns
      </button>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">Return #{returnDetail.id.slice(0, 8)}</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Order #{returnDetail.order?.orderNumber ?? "—"} · {formatDate(returnDetail.createdAt)}
          </p>
        </div>
        <StatusBadge status={returnDetail.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Reason */}
          <div className="premium-card rounded-2xl p-6">
            <h3 className="font-medium text-sm text-neutral-900 mb-4">Return Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-500">Customer</span>
                <p className="text-neutral-900">{returnDetail.profile?.firstName} {returnDetail.profile?.lastName}</p>
                <p className="text-neutral-400 text-xs">{returnDetail.profile?.email}</p>
              </div>
              <div>
                <span className="text-neutral-500">Order</span>
                <p className="text-neutral-900">
                  <button
                    onClick={() => navigate(`/admin/orders/${returnDetail.order?.id}`)}
                    className="text-brand-600 hover:underline"
                  >
                    #{returnDetail.order?.orderNumber}
                  </button>
                </p>
              </div>
              <div className="col-span-2">
                <span className="text-neutral-500">Reason</span>
                <p className="text-neutral-900 mt-0.5 capitalize">{returnDetail.reason.replace(/_/g, " ")}</p>
              </div>
              {returnDetail.reasonDetail && (
                <div className="col-span-2">
                  <span className="text-neutral-500">Customer Note</span>
                  <p className="text-neutral-900 mt-0.5">{returnDetail.reasonDetail}</p>
                </div>
              )}
            </div>
          </div>

          {/* Evidence Images */}
          {returnDetail.evidenceImages && returnDetail.evidenceImages.length > 0 && (
            <div className="premium-card rounded-2xl p-6">
              <h3 className="font-medium text-sm text-neutral-900 mb-4">Evidence Images</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {returnDetail.evidenceImages.map((url, i) => (
                  <div key={i} className="aspect-square bg-neutral-100 rounded overflow-hidden">
                    <SafeImage src={url} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover" useTransform={false} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Timeline */}
          <div className="premium-card rounded-2xl p-6">
            <h3 className="font-medium text-sm text-neutral-900 mb-4">Status History</h3>
            <ol className="relative border-l border-neutral-200 ml-2 space-y-4">
              {returnDetail.createdAt && (
                <li className="ml-6">
                  <div className="absolute -left-[9px] mt-1 w-4 h-4 bg-white border-2 border-neutral-300 rounded-full" />
                  <div className="text-sm">
                    <p className="font-medium text-neutral-900 capitalize">Return Requested</p>
                    <p className="text-neutral-400 text-xs">{formatDateTime(returnDetail.createdAt)}</p>
                  </div>
                </li>
              )}
              {returnDetail.adminNote && (
                <li className="ml-6">
                  <div className="absolute -left-[9px] mt-1 w-4 h-4 bg-white border-2 border-neutral-300 rounded-full" />
                  <div className="text-sm">
                    <p className="font-medium text-neutral-900 capitalize">{returnDetail.status.replace(/_/g, " ")}</p>
                    <p className="text-neutral-500 text-xs mt-0.5">{returnDetail.adminNote}</p>
                  </div>
                </li>
              )}
              {returnDetail.refund?.processedAt && (
                <li className="ml-6">
                  <div className="absolute -left-[9px] mt-1 w-4 h-4 bg-white border-2 border-neutral-300 rounded-full" />
                  <div className="text-sm">
                    <p className="font-medium text-neutral-900 capitalize">Refund {returnDetail.refund.status}</p>
                    <p className="text-neutral-400 text-xs">{formatDateTime(returnDetail.refund.processedAt)}</p>
                  </div>
                </li>
              )}
            </ol>
          </div>

          {/* Refund Section */}
          {returnDetail.refund && (
            <div className="premium-card rounded-2xl p-6">
              <h3 className="font-medium text-sm text-neutral-900 mb-4">Refund Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-neutral-500">Amount</span>
                  <p className="text-lg font-medium text-neutral-900">{formatPrice(returnDetail.refund.amount ?? 0)}</p>
                </div>
                <div>
                  <span className="text-neutral-500">Status</span>
                  <p className="mt-1"><StatusBadge status={returnDetail.refund.status} /></p>
                </div>
                <div>
                  <span className="text-neutral-500">Type</span>
                  <p className="mt-1 capitalize text-neutral-900">{returnDetail.refund.type}</p>
                </div>
                <div>
                  <span className="text-neutral-500">Created</span>
                  <p className="text-neutral-900">{formatDate(returnDetail.refund.createdAt)}</p>
                </div>
                {returnDetail.refund.notes && (
                  <div className="col-span-2">
                    <span className="text-neutral-500">Note</span>
                    <p className="text-neutral-900">{returnDetail.refund.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-4">
          {/* Actions */}
          <div className="premium-card rounded-2xl p-6">
            <h3 className="font-medium text-sm text-neutral-900 mb-4">Actions</h3>
            <div className="space-y-3">
              {canApprove && (
                <div>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    rows={2}
                    placeholder="Note (optional)…"
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none mb-2"
                  />
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle size={14} /> Approve Return
                  </button>
                </div>
              )}
              {canReject && (
                <div>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    rows={2}
                    placeholder="Reason for rejection (required)…"
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none mb-2"
                  />
                  <button
                    onClick={handleReject}
                    disabled={actionLoading || !adminNote.trim()}
                    className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    <XCircle size={14} /> Reject Return
                  </button>
                </div>
              )}
              {canMarkReceived && (
                <button
                  onClick={handleMarkReceived}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  <Package size={14} /> Mark as Received
                </button>
              )}
              {canProcessRefund && (
                <button
                  onClick={async () => {
                    if (!returnDetail.refund) return;
                    setActionLoading(true);
                    try {
                      await adminApi.processRefund(returnDetail.refund.id);
                      await reload();
                    } catch { /* non-critical: failed to process refund */ } finally {
                      setActionLoading(false);
                    }
                  }}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50"
                >
                  <Banknote size={14} /> Process Refund
                </button>
              )}
              {canCompleteRefund && (
                <button
                  onClick={async () => {
                    if (!returnDetail.refund) return;
                    setActionLoading(true);
                    try {
                      await adminApi.completeRefund(returnDetail.refund.id);
                      await reload();
                    } catch { /* non-critical: failed to complete refund */ } finally {
                      setActionLoading(false);
                    }
                  }}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircle size={14} /> Complete Refund
                </button>
              )}
              {canFailRefund && (
                <button
                  onClick={async () => {
                    if (!returnDetail.refund) return;
                    setActionLoading(true);
                    try {
                      await adminApi.failRefund(returnDetail.refund.id);
                      await reload();
                    } catch { /* non-critical: failed to mark refund as failed */ } finally {
                      setActionLoading(false);
                    }
                  }}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
                >
                  <XCircle size={14} /> Fail Refund
                </button>
              )}
              {returnDetail.refund?.status === "completed" && (
                <p className="text-xs text-green-600 text-center">Refund completed</p>
              )}
            </div>
          </div>

          {/* Order Link */}
          <div className="premium-card rounded-2xl p-6">
            <h3 className="font-medium text-sm text-neutral-900 mb-2">Order</h3>
            <button
              onClick={() => navigate(`/admin/orders/${returnDetail.order?.id}`)}
              className="text-sm text-brand-600 hover:underline"
            >
              View Order #{returnDetail.order?.orderNumber ?? "—"} →
            </button>
          </div>
        </div>
      </div>

      {/* Create Refund Modal */}
      <Modal open={refundModalOpen} onClose={() => setRefundModalOpen(false)} title="Create Refund" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Create a refund for return #{returnDetail?.id.slice(0, 8)} (Order total: {formatPrice(Number(returnDetail?.order?.total ?? 0))})
          </p>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Refund Amount (₹)</label>
            <input
              type="number"
              value={refundAmount}
              onChange={(e) => setRefundAmount(Number(e.target.value))}
              min={0}
              max={Number(returnDetail?.order?.total ?? 0)}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Note (optional)</label>
            <textarea
              value={refundNote}
              onChange={(e) => setRefundNote(e.target.value)}
              rows={2}
              placeholder="Refund note…"
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setRefundModalOpen(false)}
              className="px-4 py-2 text-sm font-medium border border-neutral-200 rounded hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateRefund}
              disabled={actionLoading || refundAmount <= 0}
              className="px-4 py-2 text-sm font-medium bg-neutral-900 text-white rounded hover:bg-neutral-800 disabled:opacity-50"
            >
              {actionLoading ? "Processing…" : "Create Refund"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
