/**
 * Low Stock Alerts Card Component
 *
 * Displays low stock alerts for shop owner attention.
 */

interface LowStockAlert {
  id: string;
  variantId: string;
  variantName: string;
  sku: string;
  currentStock: number;
  threshold: number;
  createdAt: string;
}

interface LowStockAlertsCardProps {
  alerts?: LowStockAlert[];
  loading?: boolean;
}

export function LowStockAlertsCard({
  alerts = [],
  loading,
}: LowStockAlertsCardProps) {
  if (loading) {
    return (
      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Low Stock Alerts</h3>
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Low Stock Alerts</h3>
        <div className="text-muted-foreground">No low stock alerts</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Low Stock Alerts</h3>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
          >
            <div>
              <p className="font-medium">{alert.variantName}</p>
              <p className="text-sm text-muted-foreground">SKU: {alert.sku}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-yellow-900">
                {alert.currentStock} / {alert.threshold}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(alert.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
