import { cn } from "../../../lib/utils/cn";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttarakhand", "Uttar Pradesh", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
] as const;

interface ShippingFormState {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

interface AddressFormProps {
  form: ShippingFormState;
  setForm: (form: ShippingFormState) => void;
  errors: Partial<Record<keyof ShippingFormState, string>>;
  setErrors: (errors: Partial<Record<keyof ShippingFormState, string>>) => void;
  prefix: string;
  className?: string;
}

export function AddressForm({
  form,
  setForm,
  errors,
  setErrors,
  prefix,
  className,
}: AddressFormProps) {
  const update = (field: keyof ShippingFormState, value: string) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  };

  const inputCls = (field: keyof ShippingFormState) =>
    cn(
      "w-full px-3 py-2.5 text-sm border bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-colors",
      errors[field] ? "border-red-400" : "border-neutral-200"
    );

  const labelCls = "text-xs text-neutral-500 mb-1 block";

  return (
    <div className={cn("grid grid-cols-2 gap-4", className)}>
      <div className="col-span-2 sm:col-span-1">
        <label className={labelCls} htmlFor={`${prefix}-fullName`}>Full Name *</label>
        <input
          id={`${prefix}-fullName`}
          value={form.fullName}
          onChange={(e) => update("fullName", e.target.value)}
          className={inputCls("fullName")}
          placeholder="John Doe"
        />
        {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
      </div>
      <div className="col-span-2 sm:col-span-1">
        <label className={labelCls} htmlFor={`${prefix}-phone`}>Phone *</label>
        <input
          id={`${prefix}-phone`}
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          className={inputCls("phone")}
          placeholder="9876543210"
          maxLength={10}
        />
        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
      </div>
      <div className="col-span-2">
        <label className={labelCls} htmlFor={`${prefix}-line1`}>Street Address / Line 1 *</label>
        <input
          id={`${prefix}-line1`}
          value={form.line1}
          onChange={(e) => update("line1", e.target.value)}
          className={inputCls("line1")}
          placeholder="123 Main Street"
        />
        {errors.line1 && <p className="text-xs text-red-500 mt-1">{errors.line1}</p>}
      </div>
      <div className="col-span-2">
        <label className={labelCls} htmlFor={`${prefix}-line2`}>Apartment / Line 2 (optional)</label>
        <input
          id={`${prefix}-line2`}
          value={form.line2}
          onChange={(e) => update("line2", e.target.value)}
          className={inputCls("line2")}
          placeholder="Apartment, suite, etc."
        />
      </div>
      <div>
        <label className={labelCls} htmlFor={`${prefix}-city`}>City *</label>
        <input
          id={`${prefix}-city`}
          value={form.city}
          onChange={(e) => update("city", e.target.value)}
          className={inputCls("city")}
          placeholder="Mumbai"
        />
        {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
      </div>
      <div>
        <label className={labelCls} htmlFor={`${prefix}-state`}>State *</label>
        <select
          id={`${prefix}-state`}
          value={form.state}
          onChange={(e) => update("state", e.target.value)}
          className={inputCls("state")}
        >
          <option value="">Select state</option>
          {INDIAN_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
      </div>
      <div>
        <label className={labelCls} htmlFor={`${prefix}-pincode`}>Pincode *</label>
        <input
          id={`${prefix}-pincode`}
          value={form.pincode}
          onChange={(e) => update("pincode", e.target.value)}
          className={inputCls("pincode")}
          placeholder="400001"
          maxLength={6}
        />
        {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>}
      </div>
      <div>
        <label className={labelCls} htmlFor={`${prefix}-country`}>Country</label>
        <input
          id={`${prefix}-country`}
          value={form.country}
          className={inputCls("country")}
          readOnly
        />
      </div>
    </div>
  );
}
