/**
 * Payment Retry Button Component
 *
 * Allows customers to retry failed payments with a different payment method.
 * Mobile-first, accessible, and keyboard navigable.
 */

import { PaymentStatus } from '../types';

interface PaymentRetryButtonProps {
  paymentId: string;
  status: PaymentStatus;
  onRetry: (paymentId: string) => void;
  loading?: boolean;
}

export function PaymentRetryButton({
  paymentId,
  status,
  onRetry,
  loading = false,
}: PaymentRetryButtonProps) {
  const canRetry =
    status === PaymentStatus.FAILED || status === PaymentStatus.CANCELLED;

  if (!canRetry) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => onRetry(paymentId)}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      aria-label="Retry payment"
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Retrying...</span>
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Retry Payment</span>
        </>
      )}
    </button>
  );
}
