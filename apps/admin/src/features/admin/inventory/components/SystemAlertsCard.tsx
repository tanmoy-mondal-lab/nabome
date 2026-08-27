/**
 * System Alerts Card Component
 *
 * Displays platform-wide inventory alerts for administrators.
 */

interface SystemAlert {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'warehouse_issue' | 'system_error';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  shopId?: string;
  shopName?: string;
  createdAt: string;
}

interface SystemAlertsCardProps {
  alerts?: SystemAlert[];
  loading?: boolean;
}

export function SystemAlertsCard({
  alerts = [],
  loading,
}: SystemAlertsCardProps) {
  if (loading) {
    return (
      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">System Alerts</h3>
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">System Alerts</h3>
        <div className="text-muted-foreground">No system alerts</div>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-900';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '🔴';
      case 'warning':
        return '🟡';
      case 'info':
      default:
        return '🔵';
    }
  };

  return (
    <div className="rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">System Alerts</h3>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start justify-between p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">
                  {getSeverityIcon(alert.severity)}
                </span>
                <p className="font-medium">{alert.message}</p>
              </div>
              {alert.shopName && (
                <p className="text-sm opacity-75">Shop: {alert.shopName}</p>
              )}
              <p className="text-xs opacity-75 mt-1">
                {new Date(alert.createdAt).toLocaleString()}
              </p>
            </div>
            <button className="text-sm font-medium hover:opacity-75">
              Dismiss
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
