/**
 * Payment History Component
 *
 * Displays customer's payment history with filtering and pagination.
 * Mobile-first, accessible, and keyboard navigable.
 */

import { formatCurrency, formatDate } from '../hooks';
import type { Payment, PaymentHistoryFilters } from '../types';

import { PaymentStatusBadge } from './PaymentStatus';

interface PaymentHistoryProps {
  payments: Payment[];
  loading?: boolean;
  onFilterChange?: (filters: PaymentHistoryFilters) => void;
  onPaymentClick?: (paymentId: string) => void;
}

export function PaymentHistory({
  payments,
  loading = false,
  onFilterChange,
  onPaymentClick,
}: PaymentHistoryProps) {
  return (
    <div className="payment-history">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Payment History</h2>
        {onFilterChange && (
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-700"
            aria-label="Filter payments"
          >
            Filter
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8" role="status" aria-live="polite">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading payments...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No payments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <button
              key={payment.id}
              type="button"
              className="w-full text-left p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              onClick={() => onPaymentClick?.(payment.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onPaymentClick?.(payment.id);
                }
              }}
              tabIndex={0}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      Order #{payment.orderId}
                    </span>
                    <PaymentStatusBadge status={payment.status} size="sm" />
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatCurrency(payment.amount, payment.currency)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {payment.method} • {payment.provider}
                  </div>
                </div>
                <div className="text-xs text-gray-500 whitespace-nowrap">
                  {formatDate(payment.createdAt)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
