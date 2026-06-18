import { cn } from "../../../lib/utils/cn";

interface PaymentStatusBadgeProps {
  status: string;
  className?: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700",
  partially_refunded: "bg-orange-100 text-orange-700",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
  partially_refunded: "Partially Refunded",
};

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
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
