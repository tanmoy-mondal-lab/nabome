/**
 * Address Selector Component
 *
 * Allows users to select from saved addresses or add a new one.
 * Mobile-first, accessible, following official Component Library patterns.
 */

import type { Address } from '../types';

interface AddressSelectorProps {
  addresses: Address[];
  selectedAddressId?: string | null;
  onSelectAddress: (addressId: string) => void;
  onAddNewAddress: () => void;
  onEditAddress?: (addressId: string) => void;
  onDeleteAddress?: (addressId: string) => void;
  onSetDefault?: (addressId: string) => void;
  isLoading?: boolean;
}

export function AddressSelector({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddNewAddress,
  onEditAddress,
  onDeleteAddress,
  onSetDefault,
  isLoading,
}: AddressSelectorProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"
          role="status"
          aria-label="Loading addresses"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add New Address Button */}
      <button
        onClick={onAddNewAddress}
        className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-500 hover:bg-brand-50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        aria-label="Add new address"
      >
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span className="text-sm font-medium text-gray-600">
          Add New Address
        </span>
      </button>

      {/* Saved Addresses List */}
      <div className="space-y-3" role="radiogroup" aria-label="Select address">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={`
              relative p-4 border rounded-lg cursor-pointer transition-all
              ${
                selectedAddressId === address.id
                  ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500 ring-offset-2'
                  : 'border-gray-200 hover:border-gray-300'
              }
            `}
            onClick={() => onSelectAddress(address.id)}
            role="radio"
            aria-checked={selectedAddressId === address.id}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectAddress(address.id);
              }
            }}
          >
            {/* Radio Indicator */}
            <div className="absolute top-4 right-4">
              <div
                className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${
                    selectedAddressId === address.id
                      ? 'border-brand-500 bg-brand-500'
                      : 'border-gray-300'
                  }
                `}
              >
                {selectedAddressId === address.id && (
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

            {/* Address Details */}
            <div className="pr-12">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">{address.name}</p>
                  <p className="text-sm text-gray-600">{address.phone}</p>
                </div>
                {address.isDefault && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Default
                  </span>
                )}
              </div>

              <div className="mt-2 text-sm text-gray-600">
                <p>{address.line1}</p>
                {address.line2 && <p>{address.line2}</p>}
                <p>
                  {address.city}, {address.state} {address.pincode}
                </p>
                <p>{address.country}</p>
              </div>

              {/* Address Type Badge */}
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                  {address.addressType === 'both'
                    ? 'Shipping & Billing'
                    : address.addressType}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              {onSetDefault && !address.isDefault && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetDefault(address.id);
                  }}
                  className="p-1 text-gray-400 hover:text-brand-500 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 rounded"
                  aria-label={`Set ${address.name} as default address`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </button>
              )}
              {onEditAddress && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditAddress(address.id);
                  }}
                  className="p-1 text-gray-400 hover:text-brand-500 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 rounded"
                  aria-label={`Edit ${address.name}`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
              )}
              {onDeleteAddress && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteAddress(address.id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                  aria-label={`Delete ${address.name}`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* No Addresses Message */}
      {addresses.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">
            No saved addresses. Add a new address to get started.
          </p>
        </div>
      )}
    </div>
  );
}
