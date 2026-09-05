import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { setDocumentMeta } from '@/lib/seo';

import { useOrder } from '../../orders/hooks';

export default function OrdersPage() {
  const navigate = useNavigate();
  const { orders, isLoading, error, fetchOrders } = useOrder();

  useEffect(() => {
    setDocumentMeta({ title: 'My orders — নবME' });
    fetchOrders();
  }, [fetchOrders]);

  if (isLoading) {
    return (
      <div
        className="container mx-auto px-4 py-8"
        aria-live="polite"
        aria-busy="true"
      >
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
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <h3 className="font-semibold mb-2">Unable to load your orders</h3>
          <p className="mb-2">{error}</p>
          <p className="text-sm mb-3">
            This might be due to a network issue or server problem. Please try
            again.
          </p>
          <button
            onClick={() => fetchOrders()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You have no orders yet.</p>
          <a href="/shop" className="text-blue-600 hover:underline">
            Start shopping
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div
              key={order.id}
              className="border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="font-semibold text-lg">{order.orderNumber}</h2>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    order.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {order.customerVisibleStatus}
                </span>
              </div>

              <div className="mb-4">
                {order.items.slice(0, 3).map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 py-2">
                    <div className="w-16 h-16 bg-gray-100 rounded" />
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
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
                <div className="flex gap-3">
                  <a
                    href={`/account/orders/${order.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View Details
                  </a>
                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => {
                        navigate(`/account/orders/${order.id}`);
                      }}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
