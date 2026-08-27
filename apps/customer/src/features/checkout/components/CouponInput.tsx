/**
 * Coupon Input Component
 *
 * Allows users to apply and remove coupon codes.
 * Mobile-first, accessible, following official Component Library patterns.
 */

import React from 'react';

interface CouponInputProps {
  appliedCoupon: string | null;
  onApplyCoupon: (
    code: string,
  ) => Promise<{ success: boolean; error?: string }>;
  onRemoveCoupon: () => Promise<{ success: boolean; error?: string }>;
  isLoading?: boolean;
}

export function CouponInput({
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  isLoading,
}: CouponInputProps) {
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const handleApply = async () => {
    if (!code.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setError(null);
    const result = await onApplyCoupon(code.trim());

    if (!result.success) {
      setError(result.error || 'Failed to apply coupon');
    } else {
      setCode('');
    }
  };

  const handleRemove = async () => {
    setError(null);
    const result = await onRemoveCoupon();

    if (!result.success) {
      setError(result.error || 'Failed to remove coupon');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Apply Coupon</h3>

      {appliedCoupon ? (
        // Applied Coupon Display
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md p-3">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-green-800">
                Coupon Applied
              </p>
              <p className="text-xs text-green-600">{appliedCoupon}</p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            disabled={isLoading}
            className="text-sm text-red-600 hover:text-red-700 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Remove coupon"
          >
            Remove
          </button>
        </div>
      ) : (
        // Coupon Input Form
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent uppercase"
              aria-label="Coupon code"
              aria-describedby={error ? 'coupon-error' : undefined}
              aria-invalid={!!error}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApply();
                }
              }}
            />
            <button
              onClick={handleApply}
              disabled={isLoading || !code.trim()}
              className="px-4 py-2 bg-brand-500 text-white rounded-md font-medium hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Apply coupon"
            >
              {isLoading ? 'Applying...' : 'Apply'}
            </button>
          </div>

          {error && (
            <p id="coupon-error" className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <p className="text-xs text-gray-500">
            Enter a valid coupon code to get discount on your order
          </p>
        </div>
      )}
    </div>
  );
}
