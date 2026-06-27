interface StatusBadgeProps {
  status: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-indigo-50 text-indigo-700 border-indigo-200",
  packed: "bg-purple-50 text-purple-700 border-purple-200",
  shipped: "bg-cyan-50 text-cyan-700 border-cyan-200",
  out_for_delivery: "bg-sky-50 text-sky-700 border-sky-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  returned: "bg-orange-50 text-orange-700 border-orange-200",
  refunded: "bg-gray-50 text-gray-700 border-gray-200",
  active: "bg-green-50 text-green-700 border-green-200",
  inactive: "bg-red-50 text-red-700 border-red-200",
  published: "bg-green-50 text-green-700 border-green-200",
  draft: "bg-gray-50 text-gray-700 border-gray-200",
  paid: "bg-green-50 text-green-700 border-green-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  refunded_payment: "bg-gray-50 text-gray-700 border-gray-200",
  true: "bg-green-50 text-green-700 border-green-200",
  false: "bg-red-50 text-red-700 border-red-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  open: "bg-blue-50 text-blue-700 border-blue-200",
  in_progress: "bg-indigo-50 text-indigo-700 border-indigo-200",
  resolved: "bg-green-50 text-green-700 border-green-200",
  closed: "bg-gray-50 text-gray-700 border-gray-200",
  partially_refunded: "bg-orange-50 text-orange-700 border-orange-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  item_received: "bg-blue-50 text-blue-700 border-blue-200",
  refund_initiated: "bg-indigo-50 text-indigo-700 border-indigo-200",
  success: "bg-green-50 text-green-700 border-green-200",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass = STATUS_COLORS[status?.toLowerCase()] ?? "bg-neutral-50 text-neutral-700 border-neutral-200";
  return (
    <span className={`inline-block text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${colorClass}`}>
      {status?.replace(/_/g, " ") ?? "Unknown"}
    </span>
  );
}
