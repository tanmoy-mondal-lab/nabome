import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';

import { setDocumentMeta } from '@/lib/seo';

import { useOrder } from '../../orders/hooks';

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const {
    order,
    timeline,
    isLoading,
    error,
    fetchOrder,
    fetchTimeline,
    cancelOrder,
  } = useOrder();

  useEffect(() => {
    setDocumentMeta({ title: 'Order Details — নবME' });
  }, []);

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
      fetchTimeline(orderId);
    }
  }, [orderId, fetchOrder, fetchTimeline]);

  const handleCancelOrder = async () => {
    if (orderId && confirm('Are you sure you want to cancel this order?')) {
      try {
        await cancelOrder(orderId, 'Customer requested cancellation');
        fetchOrder(orderId);
      } catch (err) {
        console.error('Failed to cancel order:', err);
      }
    }
  };

  if (isLoading) {
    return (
      <div
        className="container mx-auto px-4 py-8"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <h3 className="font-semibold mb-2">Unable to load order details</h3>
            <p className="mb-2">
              {typeof error === 'string' ? error : 'Order not found'}
            </p>
            <p className="text-sm mb-3">
              This might be due to a network issue or the order may not exist.
              Please try again or check your order history.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => orderId && fetchOrder(orderId)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/account/orders')}
              className="text-indigo-600 hover:text-indigo-700 px-4 py-2"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/account/orders')}
            className="text-indigo-600 hover:text-indigo-700 mb-4 inline-block"
          >
            ← Back to Orders
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Order #{order.orderNumber}
              </h1>
              <p className="text-gray-600">
                Placed on{' '}
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                order.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : order.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : order.status === 'confirmed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {order.customerVisibleStatus}
            </span>
          </div>
        </div>

        {/* Order Timeline */}
        {timeline && timeline.events && timeline.events.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Order Timeline
            </h2>
            <div className="space-y-4">
              {timeline.events.map((event: any, index: number) => (
                <div key={event.id || index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-indigo-600 rounded-full" />
                    {index < timeline.events.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium text-gray-900">
                      {event.description || event.type}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(event.occurredAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Order Items
          </h2>
          <div className="space-y-4">
            {order.items.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center gap-4 py-4 border-b last:border-0"
              >
                <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <span className="text-gray-400 text-xs">No image</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {item.productName}
                  </p>
                  <p className="text-sm text-gray-600">{item.variantName}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    ₹{parseFloat(item.unitPrice).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Total: ₹{parseFloat(item.lineTotal).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Totals */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Order Summary
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">
                ₹{parseFloat(order.amounts?.itemsSubtotal || '0').toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="text-gray-900">
                ₹{parseFloat(order.amounts?.shippingTotal || '0').toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span className="text-gray-900">
                ₹{parseFloat(order.amounts?.taxTotal || '0').toFixed(2)}
              </span>
            </div>
            {order.amounts?.discountTotal &&
              parseFloat(order.amounts.discountTotal) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>
                    -₹{parseFloat(order.amounts.discountTotal).toFixed(2)}
                  </span>
                </div>
              )}
            <div className="flex justify-between font-bold text-lg pt-4 border-t">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">
                ₹{parseFloat(order.amounts?.grandTotal || '0').toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Shipping Address
            </h2>
            <div className="text-gray-700">
              <p className="font-medium">
                {order.shippingAddress.recipientName}
              </p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && (
                <p>{order.shippingAddress.addressLine2}</p>
              )}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p>{order.shippingAddress.phone}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          {order.status === 'confirmed' && (
            <button
              onClick={handleCancelOrder}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Cancel Order
            </button>
          )}
          {order.status === 'delivered' && (
            <button
              onClick={() => navigate(`/account/orders/${order.id}/return`)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Request Return
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Print Order
          </button>
        </div>
      </div>
    </div>
  );
}
