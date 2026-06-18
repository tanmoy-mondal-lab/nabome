import { cn } from "../../../lib/utils/cn";

interface ReturnStatusBadgeProps {
  status: string;
  className?: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  item_received: "bg-blue-100 text-blue-700",
  refund_initiated: "bg-purple-100 text-purple-700",
  completed: "bg-gray-100 text-gray-700",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  item_received: "Item Received",
  refund_initiated: "Refund Initiated",
  completed: "Completed",
};

export function ReturnStatusBadge({ status, className }: ReturnStatusBadgeProps) {
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
