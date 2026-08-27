import { useEffect, useState } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useShopOrder } from '../hooks';
import { setDocumentMeta } from '@/lib/seo';

export default function OrdersPage() {
  const {
    processingQueue,
    packingQueue,
    fulfillmentQueue,
    isLoading,
    error,
    fetchOrders,
    transitionOrder,
    bulkTransition,
  } = useShopOrder();
  const [activeTab, setActiveTab] = useState<
    'processing' | 'packing' | 'fulfillment'
  >('processing');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    setDocumentMeta({ title: 'Orders — নবME Shop' });
    fetchOrders({ limit, offset: (page - 1) * limit });
  }, [fetchOrders, page, limit]);

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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
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

  const currentQueue =
    activeTab === 'processing'
      ? processingQueue
      : activeTab === 'packing'
        ? packingQueue
        : fulfillmentQueue;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Orders</h1>
        {selectedOrders.length > 0 && (
          <div className="flex gap-2">
            {activeTab === 'processing' && (
              <button
                onClick={() => handleBulkTransition('processing')}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Move to Processing ({selectedOrders.length})
              </button>
            )}
            {activeTab === 'packing' && (
              <button
                onClick={() => handleBulkTransition('packed')}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Mark as Packed ({selectedOrders.length})
              </button>
            )}
            {activeTab === 'fulfillment' && (
              <button
                onClick={() => handleBulkTransition('shipped')}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Mark as Shipped ({selectedOrders.length})
              </button>
            )}
            <button
              onClick={() => setSelectedOrders([])}
              className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('processing')}
          className={`px-4 py-2 ${activeTab === 'processing' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          Processing ({processingQueue.length})
        </button>
        <button
          onClick={() => setActiveTab('packing')}
          className={`px-4 py-2 ${activeTab === 'packing' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          Packing ({packingQueue.length})
        </button>
        <button
          onClick={() => setActiveTab('fulfillment')}
          className={`px-4 py-2 ${activeTab === 'fulfillment' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          Fulfillment ({fulfillmentQueue.length})
        </button>
      </div>

      {currentQueue.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No orders in this queue</p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentQueue.map((order: any) => (
            <div
              key={order.id}
              className="border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={selectedOrders.includes(order.id)}
                  onChange={() => handleOrderSelect(order.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="font-semibold text-lg">
                        {order.orderNumber}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      {order.customerVisibleStatus}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Items:</p>
                    {order.items.slice(0, 3).map((item: any) => (
                      <div key={item.id} className="text-sm">
                        {item.productName} x {item.quantity}
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-sm text-gray-600">
                        +{order.items.length - 3} more items
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="font-semibold">
                      Total: {order.amounts?.grandTotal || 'N/A'}
                    </p>
                    <div className="flex gap-2">
                      {activeTab === 'processing' && (
                        <button
                          onClick={() =>
                            transitionOrder(order.id, 'processing')
                          }
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          Process
                        </button>
                      )}
                      {activeTab === 'packing' && (
                        <button
                          onClick={() => transitionOrder(order.id, 'packed')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Pack
                        </button>
                      )}
                      {activeTab === 'fulfillment' && (
                        <button
                          onClick={() => transitionOrder(order.id, 'shipped')}
                          className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                        >
                          Ship
                        </button>
                      )}
                      <button
                        onClick={() => {
                          window.location.href = `/shop/orders/${order.id}`;
                        }}
                        className="border border-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-50"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <p className="text-sm text-gray-600">
          Showing {(page - 1) * limit + 1} to{' '}
          {Math.min(page * limit, currentQueue.length)} of {currentQueue.length}{' '}
          orders
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="border border-gray-300 px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={currentQueue.length < limit}
            className="border border-gray-300 px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
