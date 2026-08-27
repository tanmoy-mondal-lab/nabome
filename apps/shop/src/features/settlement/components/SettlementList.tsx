/**
 * Settlement List Component
 *
 * Displays list of settlements with filtering and pagination.
 * Mobile-first, accessible, and keyboard navigable.
 */

import type { Settlement, SettlementFilters } from '../types';
import {
  formatCurrency,
  formatDate,
  getSettlementStatusLabel,
  getSettlementStatusColor,
} from '../hooks';

interface SettlementListProps {
  settlements: Settlement[];
  loading?: boolean;
  onFilterChange?: (filters: SettlementFilters) => void;
  onSettlementClick?: (settlementId: string) => void;
}

export function SettlementList({
  settlements,
  loading = false,
  onFilterChange,
  onSettlementClick,
}: SettlementListProps) {
  return (
    <div className="settlement-list">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Settlements</h2>
        {onFilterChange && (
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-700"
            aria-label="Filter settlements"
          >
            Filter
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8" role="status" aria-live="polite">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading settlements...</p>
        </div>
      ) : settlements.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No settlements found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full" role="grid">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">
                  Settlement #
                </th>
                <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">
                  Status
                </th>
                <th className="text-right py-3 px-4 font-medium text-sm text-gray-600">
                  Gross
                </th>
                <th className="text-right py-3 px-4 font-medium text-sm text-gray-600">
                  Net
                </th>
                <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {settlements.map((settlement) => (
                <tr
                  key={settlement.id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => onSettlementClick?.(settlement.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSettlementClick?.(settlement.id);
                    }
                  }}
                  tabIndex={0}
                  role="row"
                >
                  <td className="py-3 px-4 font-medium">
                    {settlement.settlementNumber}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        getSettlementStatusColor(settlement.status) === 'green'
                          ? 'bg-green-100 text-green-800'
                          : getSettlementStatusColor(settlement.status) ===
                              'yellow'
                            ? 'bg-yellow-100 text-yellow-800'
                            : getSettlementStatusColor(settlement.status) ===
                                'blue'
                              ? 'bg-blue-100 text-blue-800'
                              : getSettlementStatusColor(settlement.status) ===
                                  'red'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {getSettlementStatusLabel(settlement.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {formatCurrency(
                      settlement.grossAmount,
                      settlement.currency,
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {formatCurrency(settlement.netAmount, settlement.currency)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {formatDate(settlement.createdAt)}
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
