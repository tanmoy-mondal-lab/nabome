/**
 * Admin Inventory Summary Card Component
 *
 * Displays a single metric card for platform inventory summary.
 */

interface InventorySummaryCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  loading?: boolean;
  variant?: 'default' | 'warning' | 'danger';
}

export function InventorySummaryCard({
  title,
  value,
  icon,
  loading = false,
  variant = 'default',
}: InventorySummaryCardProps) {
  const variantStyles = {
    default: 'bg-card text-card-foreground',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    danger: 'bg-red-50 border-red-200 text-red-900',
  };

  return (
    <div className={`rounded-lg border p-6 ${variantStyles[variant]}`}>
      <div className="flex items-center justify-between space-y-0 pb-2">
        <p className="text-sm font-medium">{title}</p>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="text-2xl font-bold">
        {loading ? '...' : value.toLocaleString()}
      </div>
    </div>
  );
}
