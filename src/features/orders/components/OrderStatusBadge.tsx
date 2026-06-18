import { cn } from "../../../lib/utils/cn";

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-indigo-100 text-indigo-700",
  packed: "bg-purple-100 text-purple-700",
  shipped: "bg-cyan-100 text-cyan-700",
  out_for_delivery: "bg-teal-100 text-teal-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  returned: "bg-orange-100 text-orange-700",
  refunded: "bg-gray-100 text-gray-700",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
  refunded: "Refunded",
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const normalizedStatus = status.toLowerCase().replace(/ /g, "_");
  const style = STATUS_STYLES[normalizedStatus] || "bg-neutral-100 text-neutral-600";
  const label = STATUS_LABELS[normalizedStatus] || status;

  return (
    <span className={cn(
      "text-[10px] uppercase tracking-wider px-2 py-1 rounded font-medium",
      style,
      className
    )}>
      {label}
    </span>
  );
}
