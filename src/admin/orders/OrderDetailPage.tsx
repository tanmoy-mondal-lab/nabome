import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminApi } from "../../lib/api/admin";
import { StatusBadge } from "../common/StatusBadge";
import { SafeImage } from "../../components/SafeImage";
import { ArrowLeft, FileText, CheckCircle, Circle, Clock, User, CreditCard, RotateCcw, Bell, LifeBuoy } from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  product: { name: string; images: { url: string }[] };
  variant?: { size: string; color: string; sku: string };
}

interface TimelineEntry {
  id: string;
  status: string;
  note: string | null;
  createdBy: string | null;
  createdAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discountAmount: number;
  couponCode: string | null;
  currency?: string;
  paymentMethod?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  giftMessage?: string;
  notes: string;
  internalNotes?: string;
  invoiceUrl?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  refundedAt?: string;
  returnRequestedAt?: string;
  shippingAddress: Record<string, string>;
  billingAddress: Record<string, string>;
  createdAt: string;
  customer: { firstName: string; lastName: string; email: string; phone: string };
  items: OrderItem[];
  transactionId?: string;
  returnRequests?: Array<{
    id: string;
    reason: string;
    status: string;
    adminNote?: string;
    createdAt: string;
    refund?: { id: string; amount: number; status: string };
  }>;
  notifications?: Array<{
    id: string;
    type: string;
    title: string;
    body?: string;
    channel: string;
    createdAt: string;
  }>;
  supportTickets?: Array<{
    id: string;
    subject: string;
    status: string;
    priority: string;
    createdAt: string;
  }>;
}

const ALL_STATUSES = [
  "pending", "confirmed", "processing", "packed", "shipped",
  "out_for_delivery", "delivered", "cancelled", "returned", "refunded",
];

const TABS = ["Details", "Customer", "Payments", "Returns & Refunds", "Notifications", "Support"];

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusNote, setStatusNote] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [activeTab, setActiveTab] = useState("Details");
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      adminApi.getOrder(id),
      adminApi.getOrderTimeline(id),
    ]).then(([orderRes, timelineRes]) => {
      const o = orderRes.order as Order;
      setOrder(o);
      setInternalNote(o.internalNotes || o.notes || "");
      setTimeline((timelineRes.timeline as TimelineEntry[]) ?? []);
    }).catch(() => {
      navigate("/admin/orders");
    }).finally(() => setLoading(false));
  }, [id, navigate]);

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    try {
      await adminApi.updateOrderStatus(id, { status: newStatus, note: statusNote });
      setOrder((prev) => prev ? { ...prev, status: newStatus } : prev);
      const timelineRes = await adminApi.getOrderTimeline(id);
      setTimeline((timelineRes.timeline as TimelineEntry[]) ?? []);
      setStatusNote("");
    } catch { /* ignore */ }
  };

  const handleSaveNote = async () => {
    if (!id) return;
    setSavingNote(true);
    try {
      await adminApi.updateOrderInternalNotes(id, internalNote);
      setOrder((prev) => prev ? { ...prev, notes: internalNote } : prev);
    } catch { /* ignore */ } finally {
      setSavingNote(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!id) return;
    try {
      const res = await adminApi.generateOrderInvoice(id);
      if ((res as { html?: string }).html) window.open(`/admin/orders/${id}/invoice`, "_blank");
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) return null;

  const currentIdx = ALL_STATUSES.indexOf(order.status);

  return (
    <div>
      {/* Back button */}
      <button onClick={() => navigate("/admin/orders")} className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 mb-4">
        <ArrowLeft size={14} /> Back to Orders
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">Order #{order.orderNumber}</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Placed {new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "long" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          <StatusBadge status={order.paymentStatus} />
          <button
            onClick={handleGenerateInvoice}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-neutral-200 rounded hover:bg-neutral-50"
          >
            <FileText size={14} /> Generate Invoice
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-0.5 mb-6 border-b border-neutral-200 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {tab === "Details" && <FileText size={14} />}
            {tab === "Customer" && <User size={14} />}
            {tab === "Payments" && <CreditCard size={14} />}
            {tab === "Returns & Refunds" && <RotateCcw size={14} />}
            {tab === "Notifications" && <Bell size={14} />}
            {tab === "Support" && <LifeBuoy size={14} />}
            {tab}
          </button>
        ))}
      </div>

      {/* ──────── Details Tab ──────── */}
      {activeTab === "Details" && (
        <div className="space-y-6">
          {/* Order Progress Timeline */}
          <div className="bg-white border border-neutral-200 rounded p-6">
            <h3 className="font-medium text-sm text-neutral-900 mb-4">Order Progress</h3>
            <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
              {ALL_STATUSES.map((s, i) => {
                const done = i <= currentIdx;
                const isCurrent = i === currentIdx;
                return (
                  <div key={s} className="flex items-center gap-1 shrink-0">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                      isCurrent ? "bg-brand-500 text-white" : done ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-400"
                    }`}>
                      {done && !isCurrent ? <CheckCircle size={12} /> : isCurrent ? <Clock size={12} /> : <Circle size={12} />}
                      {s.replace(/_/g, " ")}
                    </div>
                    {i < ALL_STATUSES.length - 1 && (
                      <div className={`w-5 h-px ${i < currentIdx ? "bg-green-400" : "bg-neutral-200"}`} />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs text-neutral-500 mb-1">Update Status</label>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full max-w-xs px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-neutral-500 mb-1">Note (optional)</label>
                <input
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Reason for status change…"
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white border border-neutral-200 rounded p-6">
            <h3 className="font-medium text-sm text-neutral-900 mb-4">Items ({order.items?.length ?? 0})</h3>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex gap-3 pb-3 border-b border-neutral-50 last:border-0 last:pb-0">
                  <div className="w-14 h-14 bg-neutral-100 rounded shrink-0 overflow-hidden">
                    {item.product?.images?.[0] ? <SafeImage src={item.product.images[0].url} alt="" className="w-full h-full object-cover" useTransform={false} /> : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{item.product?.name}</p>
                    <p className="text-xs text-neutral-500">
                      {item.variant?.size && `${item.variant.size} / `}{item.variant?.color && `${item.variant.color} · `}SKU: {item.variant?.sku ?? "N/A"}
                    </p>
                    <p className="text-xs text-neutral-500">Qty: {item.quantity} × ₹{item.unitPrice?.toLocaleString()}</p>
                  </div>
                  <p className="text-sm font-medium shrink-0">₹{(item.totalPrice ?? item.quantity * item.unitPrice).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Internal Notes */}
          <div className="bg-white border border-neutral-200 rounded p-6">
            <h3 className="font-medium text-sm text-neutral-900 mb-3">Internal Notes</h3>
            <textarea
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              rows={3}
              placeholder="Add internal notes about this order…"
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
            />
            <button
              onClick={handleSaveNote}
              disabled={savingNote}
              className="mt-2 px-4 py-1.5 text-xs font-medium bg-neutral-900 text-white rounded hover:bg-neutral-800 disabled:opacity-50"
            >
              {savingNote ? "Saving…" : "Save Note"}
            </button>
          </div>

          {/* Additional Info */}
          {(order.giftMessage || order.invoiceUrl || order.shippedAt || order.deliveredAt || order.cancellationReason) && (
            <div className="bg-white border border-neutral-200 rounded p-6">
              <h3 className="font-medium text-sm text-neutral-900 mb-4">Additional Info</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {order.giftMessage && <div><span className="text-neutral-500">Gift Message</span><p className="text-neutral-900 mt-0.5">{order.giftMessage}</p></div>}
                {order.invoiceUrl && <div><span className="text-neutral-500">Invoice</span><p className="mt-0.5"><a href={order.invoiceUrl} target="_blank" className="text-brand-600 underline">View Invoice</a></p></div>}
                {order.shippedAt && <div><span className="text-neutral-500">Shipped At</span><p className="text-neutral-900 mt-0.5">{new Date(order.shippedAt).toLocaleString()}</p></div>}
                {order.deliveredAt && <div><span className="text-neutral-500">Delivered At</span><p className="text-neutral-900 mt-0.5">{new Date(order.deliveredAt).toLocaleString()}</p></div>}
                {order.cancelledAt && <div><span className="text-neutral-500">Cancelled At</span><p className="text-neutral-900 mt-0.5">{new Date(order.cancelledAt).toLocaleString()}</p></div>}
                {order.cancellationReason && <div className="col-span-2"><span className="text-neutral-500">Cancellation Reason</span><p className="text-neutral-900 mt-0.5">{order.cancellationReason}</p></div>}
                {order.refundedAt && <div><span className="text-neutral-500">Refunded At</span><p className="text-neutral-900 mt-0.5">{new Date(order.refundedAt).toLocaleString()}</p></div>}
                {order.returnRequestedAt && <div><span className="text-neutral-500">Return Requested</span><p className="text-neutral-900 mt-0.5">{new Date(order.returnRequestedAt).toLocaleString()}</p></div>}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white border border-neutral-200 rounded p-6">
            <h3 className="font-medium text-sm text-neutral-900 mb-4">Status Timeline</h3>
            {timeline.length === 0 ? (
              <p className="text-sm text-neutral-400">No status changes recorded</p>
            ) : (
              <ol className="relative border-l border-neutral-200 ml-2 space-y-4">
                {timeline.map((entry) => (
                  <li key={entry.id} className="ml-6">
                    <div className="absolute -left-[9px] mt-1 w-4 h-4 bg-white border-2 border-neutral-300 rounded-full" />
                    <div className="text-sm">
                      <p className="font-medium text-neutral-900 capitalize">{entry.status.replace(/_/g, " ")}</p>
                      {entry.note && <p className="text-neutral-500 text-xs mt-0.5">{entry.note}</p>}
                      <p className="text-neutral-400 text-xs mt-0.5">
                        {new Date(entry.createdAt).toLocaleString("en-IN")}
                        {entry.createdBy ? ` by ${entry.createdBy}` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}

      {/* ──────── Customer Tab ──────── */}
      {activeTab === "Customer" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-neutral-200 rounded p-6">
            <h3 className="font-medium text-sm text-neutral-900 mb-4">Customer Information</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-neutral-500">Name</span>
                <p className="text-neutral-900">{order.customer?.firstName} {order.customer?.lastName}</p>
              </div>
              <div>
                <span className="text-neutral-500">Email</span>
                <p className="text-neutral-900">{order.customer?.email}</p>
              </div>
              <div>
                <span className="text-neutral-500">Phone</span>
                <p className="text-neutral-900">{order.customer?.phone ?? "N/A"}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-neutral-200 rounded p-6">
            <h3 className="font-medium text-sm text-neutral-900 mb-4">Shipping Address</h3>
            {order.shippingAddress ? (
              <div className="text-sm text-neutral-600 space-y-1">
                <p className="text-neutral-900">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                <p>{order.shippingAddress.street || order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip || order.shippingAddress.pincode}</p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && <p className="text-neutral-500">{order.shippingAddress.phone}</p>}
              </div>
            ) : (
              <p className="text-sm text-neutral-400">No shipping address</p>
            )}
          </div>
          <div className="bg-white border border-neutral-200 rounded p-6">
            <h3 className="font-medium text-sm text-neutral-900 mb-4">Billing Address</h3>
            {order.billingAddress ? (
              <div className="text-sm text-neutral-600 space-y-1">
                <p className="text-neutral-900">{order.billingAddress.firstName} {order.billingAddress.lastName}</p>
                <p>{order.billingAddress.street || order.billingAddress.address}</p>
                <p>{order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zip || order.billingAddress.pincode}</p>
                <p>{order.billingAddress.country}</p>
                {order.billingAddress.phone && <p className="text-neutral-500">{order.billingAddress.phone}</p>}
              </div>
            ) : (
              <p className="text-sm text-neutral-400">Same as shipping</p>
            )}
          </div>
        </div>
      )}

      {/* ──────── Payments Tab ──────── */}
      {activeTab === "Payments" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-neutral-200 rounded p-6">
            <h3 className="font-medium text-sm text-neutral-900 mb-4">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Subtotal</span>
                <span>{order.currency ? `${order.currency} ` : "₹"}{order.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Shipping</span>
                <span>{order.currency ? `${order.currency} ` : "₹"}{order.shippingCost?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Tax</span>
                <span>{order.currency ? `${order.currency} ` : "₹"}{order.tax?.toLocaleString()}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-green-600">Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                  <span className="text-green-600">-{order.currency ? `${order.currency} ` : "₹"}{order.discountAmount?.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total</span>
                <span>{order.currency ? `${order.currency} ` : "₹"}{order.total?.toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">Payment Status</span>
                <StatusBadge status={order.paymentStatus} />
              </div>
              {order.paymentMethod && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">Payment Method</span>
                  <span className="text-sm capitalize">{order.paymentMethod}</span>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white border border-neutral-200 rounded p-6">
              <h3 className="font-medium text-sm text-neutral-900 mb-3">Transaction Details</h3>
              <div className="space-y-2 text-sm">
                {order.transactionId ? (
                  <div><span className="text-neutral-500">Transaction ID</span><p className="text-neutral-900 font-mono text-xs mt-0.5 break-all">{order.transactionId}</p></div>
                ) : null}
                {order.razorpayOrderId && (
                  <div><span className="text-neutral-500">Razorpay Order ID</span><p className="text-neutral-900 font-mono text-xs mt-0.5 break-all">{order.razorpayOrderId}</p></div>
                )}
                {order.razorpayPaymentId && (
                  <div><span className="text-neutral-500">Razorpay Payment ID</span><p className="text-neutral-900 font-mono text-xs mt-0.5 break-all">{order.razorpayPaymentId}</p></div>
                )}
                {!order.transactionId && !order.razorpayOrderId && (
                  <p className="text-neutral-400">No transaction recorded</p>
                )}
              </div>
            </div>
            <div className="bg-white border border-neutral-200 rounded p-6">
              <h3 className="font-medium text-sm text-neutral-900 mb-3">Refunds</h3>
              {order.returnRequests?.some((r) => r.refund) ? (
                <div className="space-y-2">
                  {order.returnRequests.filter((r) => r.refund).map((r) => (
                    <div key={r.id} className="p-2 bg-neutral-50 rounded text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Amount</span>
                        <span className="font-medium">₹{r.refund!.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-neutral-500">Status</span>
                        <StatusBadge status={r.refund!.status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-400">No refunds processed for this order</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ──────── Returns & Refunds Tab ──────── */}
      {activeTab === "Returns & Refunds" && (
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded p-6">
            <h3 className="font-medium text-sm text-neutral-900 mb-4">Return Requests</h3>
            {order.returnRequests && order.returnRequests.length > 0 ? (
              <div className="space-y-3">
                {order.returnRequests.map((r) => (
                  <div key={r.id} className="p-3 bg-neutral-50 rounded text-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-neutral-900">Return #{r.id.slice(0, 8)}</p>
                        <p className="text-neutral-600 mt-0.5">Reason: {r.reason}</p>
                        {r.adminNote && <p className="text-neutral-500 text-xs mt-0.5">Admin note: {r.adminNote}</p>}
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-xs text-neutral-400 mt-2">Created {new Date(r.createdAt).toLocaleDateString()}</p>
                    {r.refund && (
                      <div className="mt-2 pt-2 border-t border-neutral-200 flex justify-between text-xs">
                        <span>Refund: ₹{r.refund.amount.toLocaleString()}</span>
                        <StatusBadge status={r.refund.status} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-400">No return requests for this order</p>
            )}
          </div>
          <div className="text-sm">
            <button
              onClick={() => navigate("/admin/returns")}
              className="text-brand-600 hover:text-brand-700 underline"
            >
              View all returns & refunds →
            </button>
          </div>
        </div>
      )}

      {/* ──────── Notifications Tab ──────── */}
      {activeTab === "Notifications" && (
        <div className="bg-white border border-neutral-200 rounded p-6">
          <h3 className="font-medium text-sm text-neutral-900 mb-4">Notifications</h3>
          {order.notifications && order.notifications.length > 0 ? (
            <div className="space-y-3">
              {order.notifications.map((n) => (
                <div key={n.id} className="p-3 bg-neutral-50 rounded text-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-neutral-900">{n.title}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${n.channel === "email" ? "bg-blue-100 text-blue-700" : n.channel === "sms" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"}`}>{n.channel}</span>
                      </div>
                      {n.body && <p className="text-neutral-500 text-xs mt-1">{n.body}</p>}
                    </div>
                    <StatusBadge status={n.type} />
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-400">No notifications sent</p>
          )}
        </div>
      )}

      {/* ──────── Support Tab ──────── */}
      {activeTab === "Support" && (
        <div className="bg-white border border-neutral-200 rounded p-6">
          <h3 className="font-medium text-sm text-neutral-900 mb-4">Linked Support Tickets</h3>
          {order.supportTickets && order.supportTickets.length > 0 ? (
            <div className="space-y-3">
              {order.supportTickets.map((t) => (
                <div key={t.id} className="p-3 bg-neutral-50 rounded text-sm flex justify-between items-start">
                  <div>
                    <p className="font-medium text-neutral-900">{t.subject}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={t.status} />
                      <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${t.priority === "urgent" ? "bg-red-100 text-red-700" : t.priority === "high" ? "bg-orange-100 text-orange-700" : t.priority === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>{t.priority}</span>
                    </div>
                  </div>
                  <span className="text-xs text-neutral-400">{new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-400">No support tickets linked to this order</p>
          )}
        </div>
      )}
    </div>
  );
}
