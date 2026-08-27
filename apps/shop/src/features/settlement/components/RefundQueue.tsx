/**
 * Refund Queue Component
 *
 * Displays pending refunds that need to be processed.
 * Mobile-first, accessible, and keyboard navigable.
 */

import type { RefundQueueItem } from '../types';
import { formatCurrency, formatDate } from '../hooks';

interface RefundQueueProps {
  queue: RefundQueueItem[];
  loading?: boolean;
  onProcessRefund?: (refundId: string) => void;
}

export function RefundQueue({
  queue,
  loading = false,
  onProcessRefund,
}: RefundQueueProps) {
  return (
    <div className="refund-queue">
      <h2 className="text-lg font-semibold mb-4">Refund Queue</h2>

      {loading ? (
        <div className="text-center py-8" role="status" aria-live="polite">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading refund queue...</p>
        </div>
      ) : queue.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No pending refunds</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg p-4 shadow-sm border flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">
                    Order #{item.orderId}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      item.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {formatCurrency(item.amount, item.currency)}
                </div>
                {item.reason && (
                  <div className="text-xs text-gray-500 mt-1">
                    {item.reason}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  {formatDate(item.createdAt)}
                </div>
              </div>
              {onProcessRefund && item.status === 'pending' && (
                <button
                  type="button"
                  onClick={() => onProcessRefund(item.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  aria-label={`Process refund for order ${item.orderId}`}
                >
                  Process
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
