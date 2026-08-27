import { useEffect, useState } from 'react';

import { useAdminOrder } from '../hooks';
import { setDocumentMeta } from '@/lib/seo';

export default function OrdersPage() {
  const {
    orders,
    dashboardStats,
    isLoading,
    error,
    fetchOrders,
    fetchDashboardStats,
    transitionOrder,
    cancelOrder,
    bulkTransition,
  } = useAdminOrder();
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    setDocumentMeta({ title: 'Orders — নবME Admin' });
    fetchDashboardStats();
    fetchOrders(filters);
  }, [fetchDashboardStats, fetchOrders]);

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId],
    );
  };

  const handleBulkTransition = async (to: string) => {
    if (selectedOrders.length === 0) return;
    await bulkTransition(selectedOrders, to);
    setSelectedOrders([]);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchOrders(filters);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Orders</h1>
        {selectedOrders.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkTransition('processing')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Bulk Update ({selectedOrders.length})
            </button>
            <button
              onClick={() => setSelectedOrders([])}
              className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Dashboard Stats */}
      {dashboardStats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-600">Today's Orders</p>
            <p className="text-2xl font-bold">{dashboardStats.todayOrders}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-600">Today's Revenue</p>
            <p className="text-2xl font-bold">
              {dashboardStats.todayRevenue.amount}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-600">Pending Orders</p>
            <p className="text-2xl font-bold">{dashboardStats.pendingOrders}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-600">Cancellation Rate (7d)</p>
            <p className="text-2xl font-bold">
              {dashboardStats.cancellationRate7d}%
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="border rounded-lg p-4 mb-6">
        <div className="grid grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search orders..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="border rounded px-3 py-2"
          />
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="border rounded px-3 py-2"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>
        <button
          onClick={applyFilters}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Apply Filters
        </button>
      </div>

      {/* Orders Table */}
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No orders found</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === orders.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOrders(orders.map((o: any) => o.id));
                      } else {
                        setSelectedOrders([]);
                      }
                    }}
                  />
                </th>
                <th className="px-4 py-3 text-left">Order Number</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleOrderSelect(order.id)}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                  <td className="px-4 py-3">{order.user?.email || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      {order.customerVisibleStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {order.amounts?.grandTotal || 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => transitionOrder(order.id, 'processing')}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Update Status
                      </button>
                      <button
                        onClick={() =>
                          cancelOrder(order.id, 'Admin cancellation')
                        }
                        className="text-red-600 hover:underline text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
