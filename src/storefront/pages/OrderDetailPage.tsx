import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, MapPin, CreditCard, XCircle, RotateCcw, Truck, FileText, CheckCircle, Circle } from "lucide-react";
import { customerApi } from "../../lib/api/customer";
import { formatPrice } from "../../lib/utils/format";
import { formatDate } from "../../lib/utils/format";
import { cn } from "../../lib/utils/cn";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { SafeImage } from "../../components/SafeImage";

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  items: Array<{
    id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
  }>;
  shippingAddress: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  timeline: Array<{
    status: string;
    label: string;
    timestamp: string;
    completed: boolean;
  }>;
}

const statusStyles: Record<string, string> = {
  pending: "status-pending",
  processing: "status-processing",
  shipped: "status-shipped",
  delivered: "status-delivered",
  cancelled: "status-cancelled",
};

const paymentStatusStyles: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  unpaid: "bg-amber-100 text-amber-700",
  refunded: "bg-blue-100 text-blue-700",
  failed: "bg-red-100 text-red-700",
};

const timelineIcons: Record<string, typeof Circle> = {
  placed: Package,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["customer", "order", id],
    queryFn: () => customerApi.getOrder(id!),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: () => customerApi.cancelOrder(id!),
  });

  const order = (data as unknown as { order: Order })?.order ?? ({} as Order);

  if (isLoading) {
    return (
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <DashboardSidebar />
          <div className="lg:col-span-3 space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-neutral-100 animate-pulse rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!order.id) {
    return (
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <DashboardSidebar />
          <div className="lg:col-span-3 text-center py-12">
            <p className="text-sm text-neutral-500">Order not found.</p>
            <Link to="/account/orders" className="text-xs text-brand-600 hover:underline mt-2 inline-block">Back to Orders</Link>
          </div>
        </div>
      </div>
    );
  }

  const timeline = order.timeline || [];

  return (
    <div className="container-page py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        <DashboardSidebar />
        <div className="lg:col-span-3 space-y-8">
          <Link to="/account/orders" className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Back to Orders
          </Link>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-lg md:text-xl font-display text-neutral-900 tracking-fashion">{order.orderNumber}</h1>
              <p className="text-sm text-neutral-500 mt-1">Placed on {formatDate(order.createdAt)}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded ${statusStyles[order.status] || "bg-neutral-100 text-neutral-600"}`}>
                {order.status}
              </span>
              <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded ${paymentStatusStyles[order.paymentStatus] || "bg-neutral-100 text-neutral-600"}`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>

          {timeline.length > 0 && (
            <div className="premium-card p-6 shadow-subtle">
              <h3 className="text-sm uppercase tracking-widest font-medium text-neutral-900 mb-6">Order Timeline</h3>
              <div className="space-y-0">
                {timeline.map((event, index) => {
                  const Icon = timelineIcons[event.status] || Circle;
                  const isLast = index === timeline.length - 1;
                  return (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", event.completed ? "bg-neutral-900" : "bg-neutral-100")}>
                          <Icon className={cn("w-4 h-4", event.completed ? "text-white" : "text-neutral-400")} />
                        </div>
                        {!isLast && <div className={cn("w-0.5 h-full min-h-[24px]", event.completed ? "bg-neutral-900" : "bg-neutral-200")} />}
                      </div>
                      <div className={cn("pb-6", isLast && "pb-0")}>
                        <p className={cn("text-sm font-medium", event.completed ? "text-neutral-900" : "text-neutral-400")}>{event.label}</p>
                        {event.timestamp && (
                          <p className="text-xs text-neutral-400 mt-0.5">{formatDate(event.timestamp)}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="premium-card shadow-subtle">
            <div className="border-b px-6 py-3">
              <h3 className="text-sm uppercase tracking-widest font-medium text-neutral-900">Items ({order.items?.length || 0})</h3>
            </div>
            <div className="divide-y">
              {(order.items || []).map((item) => (
                <div key={item.id} className="flex gap-4 p-4">
                  <SafeImage src={item.image || "/placeholder.svg"} alt={item.name} className="w-20 h-24 object-cover bg-neutral-100 shrink-0 rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900">{item.name}</p>
                    {item.size && <p className="text-xs text-neutral-400">Size: {item.size}</p>}
                    {item.color && <p className="text-xs text-neutral-400">Color: {item.color}</p>}
                    <p className="text-xs text-neutral-400 mt-1">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-neutral-900 whitespace-nowrap">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="premium-card p-6 shadow-subtle">
              <h3 className="text-sm uppercase tracking-widest font-medium text-neutral-900 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Shipping Address
              </h3>
              {order.shippingAddress ? (
                <div className="text-sm text-neutral-600 space-y-1">
                  <p className="font-medium text-neutral-900">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.line1}</p>
                  {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                  <p>{order.shippingAddress.phone}</p>
                </div>
              ) : (
                <p className="text-sm text-neutral-400">No shipping address available.</p>
              )}
            </div>

            <div className="premium-card p-6 shadow-subtle">
              <h3 className="text-sm uppercase tracking-widest font-medium text-neutral-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Payment Info
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Shipping</span>
                  <span>{order.shippingCost === 0 ? <span className="text-green-600">Free</span> : formatPrice(order.shippingCost || 0)}</span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between text-neutral-600">
                    <span>Tax</span>
                    <span>{formatPrice(order.tax)}</span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="divider" />
                <div className="flex justify-between font-medium text-neutral-900 text-base pt-2">
                  <span>Total</span>
                  <span>{formatPrice(order.total || 0)}</span>
                </div>
                <div className="pt-2 text-xs text-neutral-400">
                  Payment via {order.paymentMethod || "N/A"}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {order.status === "pending" && (
              <button
                onClick={() => { if (window.confirm("Are you sure you want to cancel this order?")) cancelMutation.mutate(); }}
                disabled={cancelMutation.isPending}
                className="btn-outline flex items-center gap-2"
              >
                <XCircle className="w-3 h-3" /> {cancelMutation.isPending ? "Cancelling..." : "Cancel Order"}
              </button>
            )}
            {order.status === "delivered" && (
              <Link
                to={`/account/orders/${order.id}/return`}
                className="btn-ghost flex items-center gap-2"
              >
                <RotateCcw className="w-3 h-3" /> Return / Exchange
              </Link>
            )}
            {(order.status === "shipped" || order.status === "processing") && (
              <button className="btn-ghost flex items-center gap-2">
                <Truck className="w-3 h-3" /> Track Package
              </button>
            )}
            <Link
              to={`/api/orders/${order.id}/invoice`}
              target="_blank"
              className="btn-ghost flex items-center gap-2"
            >
              <FileText className="w-3 h-3" /> Download Invoice
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
