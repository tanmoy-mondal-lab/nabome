import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminApi } from "../../lib/api/admin";
import { StatusBadge } from "../common/StatusBadge";
import { Modal } from "../common/Modal";
import { ArrowLeft, CheckCircle, XCircle, Package, Banknote } from "lucide-react";

interface EvidenceImage {
  url: string;
  altText?: string;
}

interface ReturnTimelineEntry {
  id: string;
  status: string;
  note: string | null;
  createdAt: string;
}

interface ReturnDetail {
  id: string;
  returnNumber: string;
  orderNumber: string;
  orderId: string;
  reason: string;
  status: string;
  customerNote: string | null;
  adminNote: string | null;
  createdAt: string;
  customer: { firstName: string; lastName: string; email: string; phone?: string };
  evidence: EvidenceImage[];
  timeline: ReturnTimelineEntry[];
  refund?: {
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    note?: string;
  };
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
      setReturnDetail(res.returnRequest as ReturnDetail);
    }).catch(() => {
      navigate("/admin/returns");
    }).finally(() => setLoading(false));
  }, [id, navigate]);

  const handleApprove = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await adminApi.approveReturn(id, adminNote ? { adminNote } : undefined);
      const res = await adminApi.getReturn(id);
      setReturnDetail(res.returnRequest as ReturnDetail);
      setAdminNote("");
    } catch { /* ignore */ } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await adminApi.rejectReturn(id, { adminNote });
      const res = await adminApi.getReturn(id);
      setReturnDetail(res.returnRequest as ReturnDetail);
      setAdminNote("");
    } catch { /* ignore */ } finally {
      setActionLoading(false);
    }
  };

  const handleMarkReceived = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await adminApi.receiveReturn(id);
      const res = await adminApi.getReturn(id);
      setReturnDetail(res.returnRequest as ReturnDetail);
    } catch { /* ignore */ } finally {
      setActionLoading(false);
    }
  };

  const handleCreateRefund = async () => {
    if (!id || !returnDetail) return;
    setActionLoading(true);
    try {
      await adminApi.createRefund({
        orderId: returnDetail.orderId,
        returnRequestId: id,
        amount: refundAmount,
        type: "refund",
        notes: refundNote || undefined,
      });
      const res = await adminApi.getReturn(id);
      setReturnDetail(res.returnRequest as ReturnDetail);
      setRefundModalOpen(false);
    } catch { /* ignore */ } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!returnDetail) return null;

  const canApprove = returnDetail.status === "pending";
  const canReject = returnDetail.status === "pending";
  const canMarkReceived = returnDetail.status === "approved";
  const canCreateRefund = returnDetail.status === "received" && !returnDetail.refund;

  return (
    <div>
      <button onClick={() => navigate("/admin/returns")} className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 mb-4">
        <ArrowLeft size={14} /> Back to Returns
      </button>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">Return #{returnDetail.returnNumber}</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Order #{returnDetail.orderNumber} · {new Date(returnDetail.createdAt).toLocaleDateString("en-IN", { dateStyle: "long" })}
          </p>
        </div>
        <StatusBadge status={returnDetail.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Reason */}
          <div className="bg-white border border-neutral-200 rounded p-6">
            <h3 className="font-medium text-sm text-neutral-900 mb-4">Return Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-500">Customer</span>
                <p className="text-neutral-900">{returnDetail.customer?.firstName} {returnDetail.customer?.lastName}</p>
                <p className="text-neutral-400 text-xs">{returnDetail.customer?.email}</p>
              </div>
              <div>
                <span className="text-neutral-500">Order</span>
                <p className="text-neutral-900">
                  <button
                    onClick={() => navigate(`/admin/orders/${returnDetail.orderId}`)}
                    className="text-brand-600 hover:underline"
                  >
                    #{returnDetail.orderNumber}
                  </button>
                </p>
              </div>
              <div className="col-span-2">
                <span className="text-neutral-500">Reason</span>
                <p className="text-neutral-900 mt-0.5">{returnDetail.reason}</p>
              </div>
              {returnDetail.customerNote && (
                <div className="col-span-2">
                  <span className="text-neutral-500">Customer Note</span>
                  <p className="text-neutral-900 mt-0.5">{returnDetail.customerNote}</p>
                </div>
              )}
            </div>
          </div>

          {/* Evidence Images */}
          {returnDetail.evidence && returnDetail.evidence.length > 0 && (
            <div className="bg-white border border-neutral-200 rounded p-6">
              <h3 className="font-medium text-sm text-neutral-900 mb-4">Evidence Images</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {returnDetail.evidence.map((img, i) => (
                  <div key={i} className="aspect-square bg-neutral-100 rounded overflow-hidden">
                    <img src={img.url} alt={img.altText ?? ""} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Timeline */}
          <div className="bg-white border border-neutral-200 rounded p-6">
            <h3 className="font-medium text-sm text-neutral-900 mb-4">Timeline</h3>
            {returnDetail.timeline && returnDetail.timeline.length > 0 ? (
              <ol className="relative border-l border-neutral-200 ml-2 space-y-4">
                {returnDetail.timeline.map((entry) => (
                  <li key={entry.id} className="ml-6">
                    <div className="absolute -left-[9px] mt-1 w-4 h-4 bg-white border-2 border-neutral-300 rounded-full" />
                    <div className="text-sm">
                      <p className="font-medium text-neutral-900 capitalize">{entry.status.replace(/_/g, " ")}</p>
                      {entry.note && <p className="text-neutral-500 text-xs mt-0.5">{entry.note}</p>}
                      <p className="text-neutral-400 text-xs mt-0.5">
                        {new Date(entry.createdAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-neutral-400">No timeline entries</p>
            )}
          </div>

          {/* Refund Section */}
          {returnDetail.refund && (
            <div className="bg-white border border-neutral-200 rounded p-6">
              <h3 className="font-medium text-sm text-neutral-900 mb-4">Refund Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-neutral-500">Amount</span>
                  <p className="text-lg font-medium text-neutral-900">₹{returnDetail.refund.amount.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-neutral-500">Status</span>
                  <p className="mt-1"><StatusBadge status={returnDetail.refund.status} /></p>
                </div>
                <div>
                  <span className="text-neutral-500">Date</span>
                  <p className="text-neutral-900">{new Date(returnDetail.refund.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                {returnDetail.refund.note && (
                  <div className="col-span-2">
                    <span className="text-neutral-500">Note</span>
                    <p className="text-neutral-900">{returnDetail.refund.note}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-4">
          {/* Actions */}
          <div className="bg-white border border-neutral-200 rounded p-6">
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
              {canCreateRefund && (
                <button
                  onClick={() => {
                    setRefundAmount(0);
                    setRefundNote("");
                    setRefundModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium bg-neutral-900 text-white rounded hover:bg-neutral-800"
                >
                  <Banknote size={14} /> Create Refund
                </button>
              )}
              {returnDetail.status === "refunded" && (
                <p className="text-xs text-green-600 text-center">Return has been refunded</p>
              )}
            </div>
          </div>

          {/* Order Link */}
          <div className="bg-white border border-neutral-200 rounded p-6">
            <h3 className="font-medium text-sm text-neutral-900 mb-2">Order</h3>
            <button
              onClick={() => navigate(`/admin/orders/${returnDetail.orderId}`)}
              className="text-sm text-brand-600 hover:underline"
            >
              View Order #{returnDetail.orderNumber} →
            </button>
          </div>
        </div>
      </div>

      {/* Create Refund Modal */}
      <Modal open={refundModalOpen} onClose={() => setRefundModalOpen(false)} title="Create Refund" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Create a refund for return #{returnDetail?.returnNumber}
          </p>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Refund Amount (₹)</label>
            <input
              type="number"
              value={refundAmount}
              onChange={(e) => setRefundAmount(Number(e.target.value))}
              min={0}
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
