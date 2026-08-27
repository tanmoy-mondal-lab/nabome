/**
 * Global Payment Dashboard Component
 *
 * Displays global payment metrics and overview for admin.
 * Mobile-first, accessible, and keyboard navigable.
 */

import type { GlobalPaymentMetrics } from '../types';
import { formatCurrency, formatPercentage } from '../hooks';

interface GlobalPaymentDashboardProps {
  metrics: GlobalPaymentMetrics | null;
  loading?: boolean;
}

export function GlobalPaymentDashboard({
  metrics,
  loading = false,
}: GlobalPaymentDashboardProps) {
  if (loading) {
    return (
      <div
        className="global-payment-dashboard"
        role="status"
        aria-live="polite"
      >
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="global-payment-dashboard">
      <h1 className="text-2xl font-bold mb-6">Global Payment Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-sm text-gray-600 mb-1">Total Payments</div>
          <div className="text-2xl font-bold">
            {metrics?.totalPayments || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-sm text-gray-600 mb-1">Success Rate</div>
          <div className="text-2xl font-bold text-green-600">
            {metrics ? formatPercentage(metrics.successRate) : '0%'}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-sm text-gray-600 mb-1">Total Amount</div>
          <div className="text-2xl font-bold">
            {metrics
              ? formatCurrency(metrics.totalAmount, metrics.currency)
              : '₹0.00'}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-sm text-gray-600 mb-1">Avg Transaction</div>
          <div className="text-2xl font-bold">
            {metrics
              ? formatCurrency(
                  metrics.averageTransactionValue,
                  metrics.currency,
                )
              : '₹0.00'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Payment Status</h2>
          {metrics ? (
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Successful</span>
                <span className="font-medium text-green-600">
                  {metrics.successfulPayments}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Failed</span>
                <span className="font-medium text-red-600">
                  {metrics.failedPayments}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Failure Rate</span>
                <span className="font-medium text-red-600">
                  {formatPercentage(metrics.failureRate)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No metrics available</p>
          )}
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button
              type="button"
              className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View All Providers
            </button>
            <button
              type="button"
              className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View Financial Exceptions
            </button>
            <button
              type="button"
              className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Search Transactions
            </button>
            <button
              type="button"
              className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View Settlements
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
