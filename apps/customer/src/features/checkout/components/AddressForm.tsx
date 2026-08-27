/**
 * Address Form Component
 *
 * Form for adding/editing addresses.
 * Mobile-first, accessible, following official Component Library patterns.
 */

interface AddressFormProps {
  onSubmit: (address: AddressFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<AddressFormData>;
  isLoading?: boolean;
}

export interface AddressFormData {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  addressType?: 'shipping' | 'billing' | 'both';
  isDefault?: boolean;
}

export function AddressForm({
  onSubmit,
  onCancel,
  initialData,
  isLoading,
}: AddressFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const address: AddressFormData = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      line1: formData.get('line1') as string,
      line2: (formData.get('line2') as string) || undefined,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      pincode: formData.get('pincode') as string,
      country: (formData.get('country') as string) || 'IN',
      addressType:
        (formData.get('addressType') as 'shipping' | 'billing' | 'both') ||
        'both',
      isDefault: formData.get('isDefault') === 'true',
    };

    onSubmit(address);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={initialData?.name}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="Enter your full name"
          aria-required="true"
        />
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          defaultValue={initialData?.phone}
          required
          pattern="[6-9]\d{9}"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="10-digit mobile number"
          aria-required="true"
          aria-describedby="phone-hint"
        />
        <p id="phone-hint" className="text-xs text-gray-500 mt-1">
          Enter 10-digit mobile number starting with 6-9
        </p>
      </div>

      {/* Address Line 1 */}
      <div>
        <label
          htmlFor="line1"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Address Line 1 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="line1"
          name="line1"
          defaultValue={initialData?.line1}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="House/Flat No, Building, Street"
          aria-required="true"
        />
      </div>

      {/* Address Line 2 */}
      <div>
        <label
          htmlFor="line2"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Address Line 2 (Optional)
        </label>
        <input
          type="text"
          id="line2"
          name="line2"
          defaultValue={initialData?.line2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="Landmark, Area, Locality"
        />
      </div>

      {/* City */}
      <div>
        <label
          htmlFor="city"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          City <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="city"
          name="city"
          defaultValue={initialData?.city}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="Enter city name"
          aria-required="true"
        />
      </div>

      {/* State */}
      <div>
        <label
          htmlFor="state"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          State <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="state"
          name="state"
          defaultValue={initialData?.state}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="Enter state name"
          aria-required="true"
        />
      </div>

      {/* Pincode */}
      <div>
        <label
          htmlFor="pincode"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          PIN Code <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="pincode"
          name="pincode"
          defaultValue={initialData?.pincode}
          required
          pattern="\d{6}"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="6-digit PIN code"
          aria-required="true"
          aria-describedby="pincode-hint"
        />
        <p id="pincode-hint" className="text-xs text-gray-500 mt-1">
          Enter 6-digit PIN code
        </p>
      </div>

      {/* Country */}
      <div>
        <label
          htmlFor="country"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Country
        </label>
        <select
          id="country"
          name="country"
          defaultValue={initialData?.country || 'IN'}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        >
          <option value="IN">India</option>
          <option value="US">United States</option>
          <option value="UK">United Kingdom</option>
          <option value="CA">Canada</option>
          <option value="AU">Australia</option>
        </select>
      </div>

      {/* Address Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address Type
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="addressType"
              value="both"
              defaultChecked={
                initialData?.addressType === 'both' || !initialData?.addressType
              }
              className="mr-2 text-brand-500 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700">Both</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="addressType"
              value="shipping"
              defaultChecked={initialData?.addressType === 'shipping'}
              className="mr-2 text-brand-500 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700">Shipping</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="addressType"
              value="billing"
              defaultChecked={initialData?.addressType === 'billing'}
              className="mr-2 text-brand-500 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700">Billing</span>
          </label>
        </div>
      </div>

      {/* Set as Default */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isDefault"
          name="isDefault"
          value="true"
          defaultChecked={initialData?.isDefault}
          className="mr-2 text-brand-500 focus:ring-brand-500"
        />
        <label htmlFor="isDefault" className="text-sm text-gray-700">
          Set as default address
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-brand-500 text-white px-4 py-2 rounded-md font-medium hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading
            ? 'Saving...'
            : initialData
              ? 'Update Address'
              : 'Add Address'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
