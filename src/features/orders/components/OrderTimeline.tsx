import { CheckCircle, Clock, Package, Truck, XCircle, RotateCcw } from "lucide-react";
import { cn } from "../../../lib/utils/cn";

interface TimelineEvent {
  status: string;
  note?: string;
  createdAt: string;
  createdBy?: string;
}

interface OrderTimelineProps {
  events: TimelineEvent[];
  currentStatus: string;
}

const STATUS_CONFIG: Record<string, { icon: any; label: string; color: string }> = {
  pending: { icon: Clock, label: "Order Pending", color: "bg-amber-100 text-amber-700" },
  confirmed: { icon: CheckCircle, label: "Order Confirmed", color: "bg-blue-100 text-blue-700" },
  processing: { icon: Package, label: "Processing", color: "bg-indigo-100 text-indigo-700" },
  packed: { icon: Package, label: "Packed", color: "bg-purple-100 text-purple-700" },
  shipped: { icon: Truck, label: "Shipped", color: "bg-cyan-100 text-cyan-700" },
  out_for_delivery: { icon: Truck, label: "Out for Delivery", color: "bg-teal-100 text-teal-700" },
  delivered: { icon: CheckCircle, label: "Delivered", color: "bg-green-100 text-green-700" },
  cancelled: { icon: XCircle, label: "Cancelled", color: "bg-red-100 text-red-700" },
  returned: { icon: RotateCcw, label: "Returned", color: "bg-orange-100 text-orange-700" },
  refunded: { icon: RotateCcw, label: "Refunded", color: "bg-gray-100 text-gray-700" },
};

const STATUS_ORDER = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
  "refunded",
];

export function OrderTimeline({ events, currentStatus }: OrderTimelineProps) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  
  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedEvents.map((event, index) => {
        const config = STATUS_CONFIG[event.status] || STATUS_CONFIG.pending;
        const Icon = config.icon;
        const isLast = index === sortedEvents.length - 1;
        const isCurrent = event.status === currentStatus;

        return (
          <div key={index} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                isCurrent ? config.color : "bg-neutral-100 text-neutral-400"
              )}>
                <Icon className="w-4 h-4" />
              </div>
              {!isLast && (
                <div className="w-0.5 flex-1 bg-neutral-200 mt-2" />
              )}
            </div>
            <div className="flex-1 pb-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-900">{config.label}</p>
                <p className="text-xs text-neutral-400">
                  {new Date(event.createdAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {event.note && (
                <p className="text-xs text-neutral-500 mt-1">{event.note}</p>
              )}
              {event.createdBy && (
                <p className="text-xs text-neutral-400 mt-1">by {event.createdBy}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
