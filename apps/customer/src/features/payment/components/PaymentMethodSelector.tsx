/**
 * Payment Method Selector Component
 *
 * Allows customers to select their preferred payment method from available options.
 * Mobile-first, accessible, and keyboard navigable.
 */

import { formatCurrency } from '../hooks';
import type { PaymentMethod } from '../types';

interface PaymentMethodSelectorProps {
  methods: PaymentMethod[];
  selectedMethod?: string;
  onSelect: (method: string) => void;
  amount: number;
  currency: string;
}

export function PaymentMethodSelector({
  methods,
  selectedMethod,
  onSelect,
  amount,
  currency,
}: PaymentMethodSelectorProps) {
  return (
    <div className="payment-method-selector">
      <h2 className="text-lg font-semibold mb-4">Select Payment Method</h2>
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        role="radiogroup"
      >
        {methods.map((method) => (
          <button
            key={method.id}
            type="button"
            role="radio"
            aria-checked={selectedMethod === method.id}
            aria-label={`Pay with ${method.displayName}`}
            className={`payment-method-card p-4 border-2 rounded-lg transition-all ${
              selectedMethod === method.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onSelect(method.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(method.id);
              }
            }}
            tabIndex={0}
          >
            <div className="flex items-center gap-3">
              <img
                src={method.icon}
                alt={method.displayName}
                className="w-8 h-8 object-contain"
                loading="lazy"
              />
              <div className="text-left">
                <div className="font-medium">{method.displayName}</div>
                {method.supportedMethods.length > 0 && (
                  <div className="text-xs text-gray-500">
                    {method.supportedMethods.join(', ')}
                  </div>
                )}
              </div>
            </div>
            {selectedMethod === method.id && (
              <div className="mt-2 text-sm font-semibold text-blue-600">
                {formatCurrency(amount, currency)}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
