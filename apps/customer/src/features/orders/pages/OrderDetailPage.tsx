import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { setDocumentMeta } from '@/lib/seo';

import { useCart } from '../../cart/hooks';
import { useOrder, useOrderActions } from '../hooks';

interface OrderDetailPageProps {
  orderId: string;
}

export default function OrderDetailPage({ orderId }: OrderDetailPageProps) {
  const navigate = useNavigate();
  const { order, timeline, isLoading, error, fetchOrder, fetchTimeline } =
    useOrder();
  const { cancelOrder } = useOrderActions();
  const { addItem } = useCart();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [reorderLoading, setReorderLoading] = useState(false);
  const [reorderSuccess, setReorderSuccess] = useState(false);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const [reorderProgress, setReorderProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [reorderResults, setReorderResults] = useState<{
    successful: number;
    failed: number;
    failedItems: string[];
  }>({ successful: 0, failed: 0, failedItems: [] });

  useEffect(() => {
    setDocumentMeta({ title: 'Order Details — নবME' });
    if (orderId) {
      fetchOrder(orderId);
      fetchTimeline(orderId);
    }
  }, [orderId, fetchOrder, fetchTimeline]);

  const handleCancel = async () => {
    if (orderId && cancelReason) {
      await cancelOrder(orderId, cancelReason);
      setShowCancelDialog(false);
      setCancelReason('');
    }
  };

  const handleReorder = async () => {
    if (!order?.items) return;

    setReorderLoading(true);
    setReorderSuccess(false);
    setReorderError(null);
    setReorderProgress({ current: 0, total: order.items.length });
    setReorderResults({ successful: 0, failed: 0, failedItems: [] });

    try {
      // Add all items from the order to the cart
      const results = await Promise.allSettled(
        order.items.map(async (item, index) => {
          try {
            setReorderProgress({
              current: index + 1,
              total: order.items.length,
            });
            if (item.variantId && item.quantity) {
              await addItem(item.variantId, item.quantity);
            }
            return { success: true, item };
          } catch (error) {
            return {
              success: false,
              item,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
        }),
      );

      const successful = results.filter(
        (r) => r.status === 'fulfilled' && r.value.success,
      ).length;
      const failed = results.filter(
        (r) =>
          r.status === 'rejected' ||
          (r.status === 'fulfilled' && !r.value.success),
      ).length;
      const failedItems = results
        .filter(
          (r) =>
            r.status === 'rejected' ||
            (r.status === 'fulfilled' && !r.value.success),
        )
        .map((r) => {
          if (r.status === 'rejected') return 'Unknown item';
          return r.value.item.name || 'Unknown item';
        });

      setReorderResults({ successful, failed, failedItems });

      if (failed === 0) {
        setReorderSuccess(true);
        // Redirect to cart after 2 seconds
        setTimeout(() => {
          navigate('/cart');
        }, 2000);
      } else if (successful > 0) {
        // Partial success - show message but don't redirect
        setReorderError(
          `Successfully added ${successful} items. ${failed} item${failed > 1 ? 's' : ''} could not be added: ${failedItems.join(', ')}`,
        );
      } else {
        // Complete failure
        setReorderError(
          `Failed to add any items to cart. Errors: ${failedItems.join(', ')}`,
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to add items to cart';
      setReorderError(errorMessage);
      console.error('Failed to reorder items:', error);
    } finally {
      setReorderLoading(false);
      setReorderProgress(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-600">{error || 'Order not found'}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <a href="/account/orders" className="text-blue-600 hover:underline">
          ← Back to Orders
        </a>
      </div>

      <h1 className="text-3xl font-bold mb-6">{order.orderNumber}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Order Information</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-semibold">
                  {order.customerVisibleStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span>{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              {order.shop && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Sold by:</span>
                  <span className="font-semibold">{order.shop.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold">
                  {order.amounts?.grandTotal || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Items</h2>
            <div className="space-y-4">
              {order.items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 py-4 border-b last:border-b-0"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded" />
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{item.unitPrice}</p>
                    <p className="text-sm text-gray-600">{item.lineTotal}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            {order.shippingAddress ? (
              <div className="text-gray-700">
                <p>
                  {order.shippingAddress.firstName}{' '}
                  {order.shippingAddress.lastName}
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
                <p className="mt-2">{order.shippingAddress.phone}</p>
              </div>
            ) : (
              <p className="text-gray-600">No shipping address</p>
            )}
          </div>
        </div>

        {/* Timeline & Actions */}
        <div className="space-y-6">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Timeline</h2>
            {timeline && timeline.events.length > 0 ? (
              <div className="space-y-4">
                {timeline.events.map((event: any) => (
                  <div
                    key={event.id}
                    className="relative pl-6 pb-4 border-l-2 border-gray-200 last:border-l-0"
                  >
                    <div className="absolute left-0 top-0 w-3 h-3 bg-blue-600 rounded-full -translate-x-1/2" />
                    <p className="font-medium text-sm">{event.description}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(event.occurredAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No timeline events</p>
            )}
          </div>

          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-3">
              {order.status === 'confirmed' && (
                <button
                  onClick={() => setShowCancelDialog(true)}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
                >
                  Cancel Order
                </button>
              )}
              {order.status === 'delivered' && (
                <button
                  onClick={() => {
                    // Implement return request logic
                    navigate(`/account/orders/${orderId}/return`);
                  }}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                >
                  Request Return
                </button>
              )}
              <button
                onClick={handleReorder}
                disabled={reorderLoading}
                className="w-full border border-gray-300 py-2 px-4 rounded hover:bg-gray-50 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
              >
                {reorderLoading ? 'Adding to Cart...' : 'Reorder Items'}
              </button>
              {reorderProgress && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Adding items...</span>
                    <span>
                      {reorderProgress.current}/{reorderProgress.total}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{
                        width: `${(reorderProgress.current / reorderProgress.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
              {reorderSuccess && (
                <div className="text-green-600 text-sm text-center">
                  Items added to cart! Redirecting...
                </div>
              )}
              {reorderError && (
                <div className="text-red-600 text-sm text-center">
                  {reorderError}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Cancel Order</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please provide a reason for cancellation"
              className="w-full border rounded p-2 mb-4"
              rows={3}
            />
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowCancelDialog(false);
                  setCancelReason('');
                }}
                className="flex-1 border border-gray-300 py-2 px-4 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCancel}
                disabled={!cancelReason}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
