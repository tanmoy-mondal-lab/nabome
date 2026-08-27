/**
 * Transaction History Component
 *
 * Displays transaction history for settlements.
 * Mobile-first, accessible, and keyboard navigable.
 */

import type { Settlement } from '../types';
import { formatCurrency, formatDate } from '../hooks';

interface TransactionHistoryProps {
  settlements: Settlement[];
  loading?: boolean;
}

export function TransactionHistory({
  settlements,
  loading = false,
}: TransactionHistoryProps) {
  return (
    <div className="transaction-history">
      <h2 className="text-lg font-semibold mb-4">Transaction History</h2>

      {loading ? (
        <div className="text-center py-8" role="status" aria-live="polite">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading transactions...</p>
        </div>
      ) : settlements.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No transactions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {settlements.map((settlement) => (
            <div
              key={settlement.id}
              className="bg-white rounded-lg p-4 shadow-sm border"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">
                    {settlement.settlementNumber}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Gross:{' '}
                    {formatCurrency(
                      settlement.grossAmount,
                      settlement.currency,
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    Net:{' '}
                    {formatCurrency(settlement.netAmount, settlement.currency)}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Commission:{' '}
                    {formatCurrency(
                      settlement.commissionAmount,
                      settlement.currency,
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    Tax:{' '}
                    {formatCurrency(settlement.taxAmount, settlement.currency)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{settlement.status}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(settlement.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
