import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminApi } from "../../lib/api/admin";
import { StatusBadge } from "../common/StatusBadge";
import { ArrowLeft } from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  product: { name: string; images: { url: string }[] };
  variant?: { size: string; color: string; sku: string };
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
  notes: string;
  shippingAddress: Record<string, string>;
  billingAddress: Record<string, string>;
  createdAt: string;
  customer: { firstName: string; lastName: string; email: string; phone: string };
  items: OrderItem[];
}

const STATUS_FLOW = ["pending", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered"];

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusNote, setStatusNote] = useState("");

  useEffect(() => {
    if (!id) return;
    adminApi.getOrder(id).then((res) => {
      setOrder(res.order as Order);
    }).catch(() => {
      navigate("/admin/orders");
    }).finally(() => setLoading(false));
  }, [id, navigate]);

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    try {
      await adminApi.updateOrderStatus(id, { status: newStatus, note: statusNote });
      setOrder((prev) => prev ? { ...prev, status: newStatus, notes: statusNote } : prev);
      setStatusNote("");
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

  const currentIdx = STATUS_FLOW.indexOf(order.status);

  return (
    <div>
      <button onClick={() => navigate("/admin/orders")} className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 mb-4">
        <ArrowLeft size={14} /> Back to Orders
      </button>

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
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-white border border-neutral-200 rounded p-6 mb-6">
        <h3 className="font-medium text-sm text-neutral-900 mb-4">Order Progress</h3>
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          {STATUS_FLOW.map((s, i) => {
            const done = i <= currentIdx;
            const isCurrent = i === currentIdx;
            return (
              <div key={s} className="flex items-center gap-2 shrink-0">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                  isCurrent ? "bg-brand-500 text-white" : done ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-400"
                }`}>
                  {done && !isCurrent ? "✓" : ""}
                  {s.replace(/_/g, " ")}
                </div>
                {i < STATUS_FLOW.length - 1 && (
                  <div className={`w-6 h-px ${done && i < currentIdx ? "bg-green-400" : "bg-neutral-200"}`} />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-neutral-500 mb-1">Advance to next status</label>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full max-w-xs px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none"
            >
              {STATUS_FLOW.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
              <option value="cancelled">Cancel Order</option>
              <option value="returned">Mark Returned</option>
              <option value="refunded">Mark Refunded</option>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Items */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded p-6">
          <h3 className="font-medium text-sm text-neutral-900 mb-4">Items ({order.items?.length ?? 0})</h3>
          <div className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex gap-3 pb-3 border-b border-neutral-50 last:border-0 last:pb-0">
                <div className="w-14 h-14 bg-neutral-100 rounded shrink-0 overflow-hidden">
                  {item.product?.images?.[0] ? <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" /> : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{item.product?.name}</p>
                  <p className="text-xs text-neutral-500">
                    {item.variant?.size} / {item.variant?.color} · SKU: {item.variant?.sku}
                  </p>
                  <p className="text-xs text-neutral-500">Qty: {item.quantity} × ₹{item.unitPrice?.toLocaleString()}</p>
                </div>
                <p className="text-sm font-medium shrink-0">₹{(item.quantity * item.unitPrice).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="bg-white border border-neutral-200 rounded p-6">
            <h3 className="font-medium text-sm text-neutral-900 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-neutral-500">Subtotal</span><span>₹{order.subtotal?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Shipping</span><span>₹{order.shippingCost?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Tax</span><span>₹{order.tax?.toLocaleString()}</span></div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between"><span className="text-green-600">Discount {order.couponCode ? `(${order.couponCode})` : ""}</span><span className="text-green-600">-₹{order.discountAmount?.toLocaleString()}</span></div>
              )}
              <div className="border-t pt-2 flex justify-between font-medium"><span>Total</span><span>₹{order.total?.toLocaleString()}</span></div>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded p-6">
            <h3 className="font-medium text-sm text-neutral-900 mb-3">Customer</h3>
            <p className="text-sm text-neutral-900">{order.customer?.firstName} {order.customer?.lastName}</p>
            <p className="text-xs text-neutral-500">{order.customer?.email}</p>
            <p className="text-xs text-neutral-500">{order.customer?.phone}</p>
          </div>

          <div className="bg-white border border-neutral-200 rounded p-6">
            <h3 className="font-medium text-sm text-neutral-900 mb-3">Shipping Address</h3>
            {order.shippingAddress ? (
              <div className="text-sm text-neutral-600">
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            ) : (
              <p className="text-sm text-neutral-400">No address</p>
            )}
          </div>

          {order.notes && (
            <div className="bg-white border border-neutral-200 rounded p-6">
              <h3 className="font-medium text-sm text-neutral-900 mb-2">Notes</h3>
              <p className="text-sm text-neutral-600">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
