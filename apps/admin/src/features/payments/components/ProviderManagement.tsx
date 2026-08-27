/**
 * Provider Management Component
 *
 * Manages payment providers including health status and enable/disable.
 * Mobile-first, accessible, and keyboard navigable.
 */

import type { Provider } from '../types';
import { formatPercentage } from '../hooks';

interface ProviderManagementProps {
  providers: Provider[];
  loading?: boolean;
  onToggleProvider?: (providerId: string, enabled: boolean) => void;
}

export function ProviderManagement({
  providers,
  loading = false,
  onToggleProvider,
}: ProviderManagementProps) {
  return (
    <div className="provider-management">
      <h2 className="text-lg font-semibold mb-4">Provider Management</h2>

      {loading ? (
        <div className="text-center py-8" role="status" aria-live="polite">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading providers...</p>
        </div>
      ) : providers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No providers found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="bg-white rounded-lg p-4 shadow-sm border flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{provider.displayName}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      provider.healthStatus === 'healthy'
                        ? 'bg-green-100 text-green-800'
                        : provider.healthStatus === 'degraded'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {provider.healthStatus}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Success Rate: {formatPercentage(provider.successRate)}
                </div>
                <div className="text-sm text-gray-600">
                  Avg Response: {provider.averageResponseTime}ms
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {provider.totalTransactions} transactions
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onToggleProvider && (
                  <button
                    type="button"
                    onClick={() =>
                      onToggleProvider(provider.id, !provider.enabled)
                    }
                    className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                      provider.enabled
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                    aria-label={`${provider.enabled ? 'Disable' : 'Enable'} ${provider.displayName}`}
                  >
                    {provider.enabled ? 'Disable' : 'Enable'}
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
