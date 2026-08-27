/**
 * Transaction Detail Component
 *
 * Displays detailed transaction information including timeline and refund status.
 * Mobile-first, accessible, and keyboard navigable.
 */

import { formatCurrency, formatDate } from '../hooks';
import type { TransactionDetail } from '../types';

import { PaymentStatusBadge } from './PaymentStatus';

interface TransactionDetailProps {
  detail: TransactionDetail;
  loading?: boolean;
}

export function TransactionDetail({
  detail,
  loading = false,
}: TransactionDetailProps) {
  if (loading) {
    return (
      <div className="transaction-detail" role="status" aria-live="polite">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">
            Loading transaction details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-detail">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Transaction Details</h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Payment ID</div>
              <div className="font-medium">{detail.payment.id}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Order ID</div>
              <div className="font-medium">{detail.payment.orderId}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Amount</div>
              <div className="font-medium">
                {formatCurrency(detail.payment.amount, detail.payment.currency)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Status</div>
              <div>
                <PaymentStatusBadge status={detail.payment.status} />
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Method</div>
              <div className="font-medium">{detail.payment.method}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Provider</div>
              <div className="font-medium">{detail.payment.provider}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Created</div>
              <div className="font-medium">
                {formatDate(detail.payment.createdAt)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Updated</div>
              <div className="font-medium">
                {formatDate(detail.payment.updatedAt)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {detail.refunds && detail.refunds.length > 0 && (
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-3">Refunds</h3>
          <div className="space-y-2">
            {detail.refunds.map((refund) => (
              <div key={refund.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {formatCurrency(refund.amount, refund.currency)}
                    </div>
                    {refund.reason && (
                      <div className="text-sm text-gray-600">
                        {refund.reason}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">{refund.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-md font-semibold mb-3">Timeline</h3>
        <div className="space-y-3">
          {detail.timeline.map((event, index) => (
            <div key={event.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-blue-600" />
                {index < detail.timeline.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gray-300 mt-1" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="font-medium text-sm">{event.description}</div>
                <div className="text-xs text-gray-600">
                  {formatDate(event.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
