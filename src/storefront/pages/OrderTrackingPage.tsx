import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { Package, Truck, CheckCircle, XCircle, Circle, MapPin, ArrowLeft } from "lucide-react";
import { customerApi } from "../../lib/api/customer";
import { formatDate } from "../../lib/utils/format";
import { cn } from "../../lib/utils/cn";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { Helmet } from "react-helmet-async";

const timelineIcons: Record<string, typeof Circle> = {
  placed: Package,
  confirmed: CheckCircle,
  processing: Package,
  packed: Package,
  shipped: Truck,
  out_for_delivery: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
  returned: Package,
  refunded: CheckCircle,
};

const timelineLabels: Record<string, string> = {
  placed: "Order Placed",
  confirmed: "Order Confirmed",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
  refunded: "Refunded",
};

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["customer", "order", "tracking", id],
    queryFn: () => customerApi.getOrderTracking(id!),
    enabled: !!id,
  });

  const tracking = data as unknown as {
    timeline: Array<{ id: string; status: string; createdAt: string; creator?: { firstName?: string }; note?: string }>;
    shipping?: { fullName: string; line1: string; line2?: string; city: string; state: string; pincode: string };
    currentStatus: string;
    shippedAt?: string;
    deliveredAt?: string;
  } | undefined;

  if (isLoading) {
    return (
      <div className="container-page py-8">
        <Helmet><title>Order Tracking — নবME</title><meta name="robots" content="noindex, nofollow" /></Helmet>
        <div className="grid lg:grid-cols-4 gap-8">
          <DashboardSidebar />
          <div className="lg:col-span-3 space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-neutral-100 animate-pulse rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  const timeline = tracking?.timeline ?? [];
  const currentStatus = tracking?.currentStatus ?? "";

  const allStatuses = ["placed", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered"];
  const currentIdx = allStatuses.indexOf(currentStatus);

  return (
    <div className="container-page py-8">
      <Helmet><title>Order Tracking — নবME</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="grid lg:grid-cols-4 gap-8">
        <DashboardSidebar />
        <div className="lg:col-span-3 space-y-8">
          <Link to={`/account/orders/${id}`} className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Back to Order
          </Link>

          <div>
            <h1 className="text-lg md:text-xl font-display text-neutral-900">Order Tracking</h1>
          </div>

          {currentStatus !== "cancelled" && currentStatus !== "returned" && (
            <div className="flex items-center gap-0">
              {["Ordered", "Processed", "Shipped", "Delivered"].map((label, i) => {
                const idx = i * 2;
                const completed = currentIdx >= idx;
                return (
                  <div key={label} className="flex-1 flex flex-col items-center">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                      completed ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-400"
                    )}>
                      {completed ? <CheckCircle className="w-4 h-4" /> : i + 1}
                    </div>
                    <p className={cn("text-[10px] mt-2 font-medium tracking-wider uppercase", completed ? "text-neutral-900" : "text-neutral-400")}>{label}</p>
                    {i < 3 && <div className={cn("hidden md:block w-full h-px -mt-4 ml-8", currentIdx > idx ? "bg-neutral-900" : "bg-neutral-200")} />}
                  </div>
                );
              })}
            </div>
          )}

          {timeline.length > 0 && (
            <div className="premium-card p-6 shadow-subtle">
              <h3 className="text-sm uppercase tracking-widest font-medium text-neutral-900 mb-6">Tracking Timeline</h3>
              <div className="space-y-0">
                {timeline.map((event, index) => {
                  const Icon = timelineIcons[event.status] || Circle;
                  const label = timelineLabels[event.status] || event.status;
                  const isLast = index === timeline.length - 1;
                  return (
                    <div key={event.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", "bg-neutral-900")}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        {!isLast && <div className="w-0.5 h-full min-h-[24px] bg-neutral-200" />}
                      </div>
                      <div className={cn("pb-6", isLast && "pb-0")}>
                        <p className="text-sm font-medium text-neutral-900">{label}</p>
                        <p className="text-xs text-neutral-400 mt-0.5">{formatDate(event.createdAt)}</p>
                        {event.note && <p className="text-xs text-neutral-500 mt-1">{event.note}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tracking?.shipping && (
            <div className="premium-card p-6 shadow-subtle">
              <h3 className="text-sm uppercase tracking-widest font-medium text-neutral-900 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Shipping Address
              </h3>
              <div className="text-sm text-neutral-600 space-y-1">
                <p className="font-medium text-neutral-900">{tracking.shipping.fullName}</p>
                <p>{tracking.shipping.line1}</p>
                {tracking.shipping.line2 && <p>{tracking.shipping.line2}</p>}
                <p>{tracking.shipping.city}, {tracking.shipping.state} {tracking.shipping.pincode}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
