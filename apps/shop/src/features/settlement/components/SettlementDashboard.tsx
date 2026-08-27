/**
 * Settlement Dashboard Component
 *
 * Main dashboard for shop owners to view settlement summary, pending settlements, and payout summary.
 * Mobile-first, accessible, and keyboard navigable.
 */

import type { SettlementSummary, PayoutSummary } from '../types';
import { formatCurrency } from '../hooks';

interface SettlementDashboardProps {
  settlementSummary: SettlementSummary | null;
  payoutSummary: PayoutSummary | null;
  loading?: boolean;
}

export function SettlementDashboard({
  settlementSummary,
  payoutSummary,
  loading = false,
}: SettlementDashboardProps) {
  if (loading) {
    return (
      <div className="settlement-dashboard" role="status" aria-live="polite">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settlement-dashboard">
      <h1 className="text-2xl font-bold mb-6">Settlement Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-sm text-gray-600 mb-1">Total Settlements</div>
          <div className="text-2xl font-bold">
            {settlementSummary?.totalSettlements || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-sm text-gray-600 mb-1">Pending Settlements</div>
          <div className="text-2xl font-bold text-yellow-600">
            {settlementSummary?.pendingSettlements || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-sm text-gray-600 mb-1">Total Gross Amount</div>
          <div className="text-2xl font-bold">
            {settlementSummary
              ? formatCurrency(
                  settlementSummary.totalGrossAmount,
                  settlementSummary.currency,
                )
              : '₹0.00'}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-sm text-gray-600 mb-1">Total Net Amount</div>
          <div className="text-2xl font-bold text-green-600">
            {settlementSummary
              ? formatCurrency(
                  settlementSummary.totalNetAmount,
                  settlementSummary.currency,
                )
              : '₹0.00'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Payout Summary</h2>
          {payoutSummary ? (
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Payouts</span>
                <span className="font-medium">
                  {payoutSummary.totalPayouts}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending Payouts</span>
                <span className="font-medium text-yellow-600">
                  {payoutSummary.pendingPayouts}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completed Payouts</span>
                <span className="font-medium text-green-600">
                  {payoutSummary.completedPayouts}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Payout Amount</span>
                <span className="font-medium">
                  {formatCurrency(
                    payoutSummary.totalPayoutAmount,
                    payoutSummary.currency,
                  )}
                </span>
              </div>
              {payoutSummary.nextPayoutDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Next Payout Date</span>
                  <span className="font-medium">
                    {new Date(payoutSummary.nextPayoutDate).toLocaleDateString(
                      'en-IN',
                      {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      },
                    )}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No payout data available</p>
          )}
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Settlement Status</h2>
          {settlementSummary ? (
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Completed</span>
                <span className="font-medium text-green-600">
                  {settlementSummary.completedSettlements}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Paid</span>
                <span className="font-medium text-green-600">
                  {settlementSummary.paidSettlements}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending</span>
                <span className="font-medium text-yellow-600">
                  {settlementSummary.pendingSettlements}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No settlement data available</p>
          )}
        </div>
      </div>
    </div>
  );
}
