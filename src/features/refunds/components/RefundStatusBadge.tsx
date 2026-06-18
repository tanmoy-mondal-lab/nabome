import { cn } from "../../../lib/utils/cn";

interface RefundStatusBadgeProps {
  status: string;
  className?: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
};

export function RefundStatusBadge({ status, className }: RefundStatusBadgeProps) {
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
