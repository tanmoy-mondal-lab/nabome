/**
 * Transaction Search Component
 *
 * Allows admin to search and filter transactions.
 * Mobile-first, accessible, and keyboard navigable.
 */

import { formatCurrency, formatDate } from '../hooks';

interface TransactionSearchProps {
  transactions: any[];
  loading?: boolean;
}

export function TransactionSearch({
  transactions,
  loading = false,
}: TransactionSearchProps) {
  return (
    <div className="transaction-search">
      <h2 className="text-lg font-semibold mb-4">Transaction Search</h2>

      <div className="bg-white rounded-lg p-4 shadow-sm border mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label
              htmlFor="paymentId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Payment ID
            </label>
            <input
              type="text"
              id="paymentId"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter payment ID"
            />
          </div>
          <div>
            <label
              htmlFor="orderId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Order ID
            </label>
            <input
              type="text"
              id="orderId"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter order ID"
            />
          </div>
          <div>
            <label
              htmlFor="shopId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Shop ID
            </label>
            <input
              type="text"
              id="shopId"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter shop ID"
            />
          </div>
          <div>
            <label
              htmlFor="provider"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Provider
            </label>
            <select
              id="provider"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Providers</option>
              <option value="razorpay">Razorpay</option>
              <option value="stripe">Stripe</option>
              <option value="sslcommerz">SSLCommerz</option>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            aria-label="Search transactions"
          >
            Search
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8" role="status" aria-live="polite">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">
            Searching transactions...
          </p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No transactions found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full" role="grid">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">
                  Payment ID
                </th>
                <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">
                  Order ID
                </th>
                <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">
                  Shop ID
                </th>
                <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">
                  Provider
                </th>
                <th className="text-right py-3 px-4 font-medium text-sm text-gray-600">
                  Amount
                </th>
                <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-sm">
                    {transaction.id}
                  </td>
                  <td className="py-3 px-4 text-sm">{transaction.orderId}</td>
                  <td className="py-3 px-4 text-sm">{transaction.shopId}</td>
                  <td className="py-3 px-4 text-sm">{transaction.provider}</td>
                  <td className="py-3 px-4 text-right">
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </td>
                  <td className="py-3 px-4 text-sm">{transaction.status}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {formatDate(transaction.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
