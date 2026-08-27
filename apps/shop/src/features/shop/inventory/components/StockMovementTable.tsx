/**
 * Stock Movement Table Component
 *
 * Displays stock movement history for a variant.
 */

interface StockMovement {
  id: string;
  variantId: string;
  variantName: string;
  type: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string | null;
  createdAt: string;
}

interface StockMovementTableProps {
  movements?: StockMovement[];
  loading?: boolean;
}

export function StockMovementTable({
  movements = [],
  loading,
}: StockMovementTableProps) {
  if (loading) {
    return (
      <div className="rounded-lg border p-6">
        <div className="text-muted-foreground">Loading movements...</div>
      </div>
    );
  }

  const getMovementTypeColor = (type: string) => {
    if (type === 'sale' || type === 'damage' || type === 'adjustment') {
      return 'text-red-600';
    }
    if (type === 'purchase' || type === 'return' || type === 'initial_stock') {
      return 'text-green-600';
    }
    return 'text-blue-600';
  };

  const getMovementTypeLabel = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
              <th className="px-4 py-3 text-right text-sm font-medium">
                Quantity
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium">
                Previous
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium">New</th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Reason
              </th>
            </tr>
          </thead>
          <tbody>
            {movements.map((movement) => (
              <tr key={movement.id} className="border-b hover:bg-muted/50">
                <td className="px-4 py-3 text-sm">
                  {new Date(movement.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm font-medium">
                  <span className={getMovementTypeColor(movement.type)}>
                    {getMovementTypeLabel(movement.type)}
                  </span>
                </td>
                <td
                  className={`px-4 py-3 text-right text-sm font-semibold ${getMovementTypeColor(movement.type)}`}
                >
                  {movement.quantity > 0 ? '+' : ''}
                  {movement.quantity}
                </td>
                <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                  {movement.previousStock}
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium">
                  {movement.newStock}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {movement.reason || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {movements.length === 0 && (
        <div className="p-6 text-center text-muted-foreground">
          No stock movements found
        </div>
      )}
    </div>
  );
}
