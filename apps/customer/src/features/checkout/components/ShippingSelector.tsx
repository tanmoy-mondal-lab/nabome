/**
 * Shipping Selector Component
 *
 * Allows users to select shipping methods.
 * Mobile-first, accessible, following official Component Library patterns.
 */

import type { ShippingRate } from '../types';

interface ShippingSelectorProps {
  shippingRates: ShippingRate[];
  selectedRateId?: string | null;
  onSelectRate: (rate: ShippingRate) => void;
  isLoading?: boolean;
  subtotal?: number;
}

export function ShippingSelector({
  shippingRates,
  selectedRateId,
  onSelectRate,
  isLoading,
  subtotal = 0,
}: ShippingSelectorProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"
          role="status"
          aria-label="Loading shipping rates"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="space-y-3"
      role="radiogroup"
      aria-label="Select shipping method"
    >
      {shippingRates.map((rate) => {
        const isSelected = selectedRateId === rate.id;
        const cost = Number(rate.baseRate);
        const freeAbove = rate.freeAboveAmount
          ? Number(rate.freeAboveAmount)
          : null;
        const isFree = freeAbove && subtotal >= freeAbove;
        const finalCost = isFree ? 0 : cost;

        return (
          <div
            key={rate.id}
            onClick={() => onSelectRate(rate)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectRate(rate);
              }
            }}
            className={`
              relative p-4 border rounded-lg cursor-pointer transition-all
              ${
                isSelected
                  ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500 ring-offset-2'
                  : 'border-gray-200 hover:border-gray-300'
              }
            `}
            role="radio"
            aria-checked={isSelected}
            tabIndex={0}
            aria-label={`${rate.name} - ${isFree ? 'Free' : `₹${finalCost.toFixed(2)}`}`}
          >
            {/* Radio Indicator */}
            <div className="absolute top-4 right-4">
              <div
                className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${isSelected ? 'border-brand-500 bg-brand-500' : 'border-gray-300'}
                `}
              >
                {isSelected && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>

            {/* Shipping Details */}
            <div className="pr-12">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{rate.name}</p>
                  {rate.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {rate.description}
                    </p>
                  )}
                  {rate.estimatedDays && (
                    <p className="text-sm text-gray-500 mt-1">
                      Estimated delivery: {rate.estimatedDays} business days
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {isFree ? (
                    <span className="text-green-600 font-semibold">FREE</span>
                  ) : (
                    <span className="font-semibold text-gray-900">
                      ₹{finalCost.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {freeAbove && subtotal < freeAbove && (
                <p className="text-xs text-gray-500 mt-2">
                  Free shipping on orders above ₹{freeAbove.toFixed(2)}
                </p>
              )}

              {rate.ratePerKg && (
                <p className="text-xs text-gray-500 mt-1">
                  Additional ₹{Number(rate.ratePerKg).toFixed(2)}/kg above base
                  weight
                </p>
              )}
            </div>
          </div>
        );
      })}

      {/* No Shipping Rates Message */}
      {shippingRates.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">
            No shipping methods available for your location.
          </p>
        </div>
      )}
    </div>
  );
}
