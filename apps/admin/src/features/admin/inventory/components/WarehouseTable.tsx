/**
 * Warehouse Table Component
 *
 * Displays warehouses with management actions for administrators.
 */

interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string | null;
  email: string | null;
  status: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WarehouseTableProps {
  warehouses?: Warehouse[];
  loading?: boolean;
}

export function WarehouseTable({
  warehouses = [],
  loading,
}: WarehouseTableProps) {
  if (loading) {
    return (
      <div className="rounded-lg border p-6">
        <div className="text-muted-foreground">Loading warehouses...</div>
      </div>
    );
  }

  const getStatusColor = (status: string, isActive: boolean) => {
    if (!isActive) return 'bg-gray-100 text-gray-800';
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">Code</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Location
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium">
                Status
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium">
                Priority
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {warehouses.map((warehouse) => (
              <tr key={warehouse.id} className="border-b hover:bg-muted/50">
                <td className="px-4 py-3 text-sm font-medium">
                  {warehouse.code}
                </td>
                <td className="px-4 py-3 text-sm">{warehouse.name}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {warehouse.city}, {warehouse.state}, {warehouse.country}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(warehouse.status, warehouse.isActive)}`}
                  >
                    {warehouse.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  {warehouse.priority}
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-sm text-blue-600 hover:text-blue-800 mr-2">
                    Edit
                  </button>
                  <button className="text-sm text-red-600 hover:text-red-800">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {warehouses.length === 0 && (
        <div className="p-6 text-center text-muted-foreground">
          No warehouses found
        </div>
      )}
    </div>
  );
}
