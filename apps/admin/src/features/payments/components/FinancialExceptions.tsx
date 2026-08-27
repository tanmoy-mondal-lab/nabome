/**
 * Financial Exceptions Component
 *
 * Displays financial exceptions that need attention.
 * Mobile-first, accessible, and keyboard navigable.
 */

import type { FinancialException } from '../types';
import { formatDate } from '../hooks';

interface FinancialExceptionsProps {
  exceptions: FinancialException[];
  loading?: boolean;
  onResolve?: (exceptionId: string) => void;
}

export function FinancialExceptions({
  exceptions,
  loading = false,
  onResolve,
}: FinancialExceptionsProps) {
  return (
    <div className="financial-exceptions">
      <h2 className="text-lg font-semibold mb-4">Financial Exceptions</h2>

      {loading ? (
        <div className="text-center py-8" role="status" aria-live="polite">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading exceptions...</p>
        </div>
      ) : exceptions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No financial exceptions</p>
        </div>
      ) : (
        <div className="space-y-3">
          {exceptions.map((exception) => (
            <div
              key={exception.id}
              className="bg-white rounded-lg p-4 shadow-sm border"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        exception.severity === 'critical'
                          ? 'bg-red-100 text-red-800'
                          : exception.severity === 'high'
                            ? 'bg-orange-100 text-orange-800'
                            : exception.severity === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {exception.severity}
                    </span>
                    <span className="text-xs text-gray-500 uppercase">
                      {exception.type}
                    </span>
                  </div>
                  <div className="text-sm font-medium">
                    {exception.description}
                  </div>
                  {exception.relatedEntityId && (
                    <div className="text-xs text-gray-500 mt-1">
                      Related: {exception.relatedEntityType} #
                      {exception.relatedEntityId}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(exception.createdAt)}
                  </div>
                </div>
                {onResolve && !exception.resolvedAt && (
                  <button
                    type="button"
                    onClick={() => onResolve(exception.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    aria-label={`Resolve exception ${exception.id}`}
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
