import { PhoneInput } from "../../../components/PhoneInput";
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

export interface ShippingFormState {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  country: string;
}

export const EMPTY_SHIPPING: ShippingFormState = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  district: "",
  state: "",
  pincode: "",
  country: "India",
};

interface AddressFormProps {
  form: ShippingFormState;
  setForm: (f: ShippingFormState) => void;
  errors: Partial<Record<keyof ShippingFormState, string>>;
  setErrors: (e: Partial<Record<keyof ShippingFormState, string>>) => void;
  prefix: string;
}

export function AddressForm({ form, setForm, errors, setErrors, prefix }: AddressFormProps) {
  const update = (field: keyof ShippingFormState, value: string) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  };
  const inputCls = (field: keyof ShippingFormState) =>
    cn(
      "input-field w-full px-3 py-2.5 text-sm",
      errors[field] ? "border-red-400" : "border-neutral-200"
    );
  const labelCls = "text-xs text-neutral-500 mb-1 block font-body";
  const errorId = (field: keyof ShippingFormState) => `${prefix}-${field}-error`;
  const errorProps = (field: keyof ShippingFormState) => ({
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? errorId(field) : undefined,
  });

  return (
    <div className="grid grid-cols-2 gap-5">
      <div className="col-span-2 sm:col-span-1">
        <label className={labelCls} htmlFor={`${prefix}-fullName`}>Full Name *</label>
        <input id={`${prefix}-fullName`} value={form.fullName} onChange={(e) => update("fullName", e.target.value)} className={inputCls("fullName")} placeholder="John Doe" {...errorProps("fullName")} />
        {errors.fullName && <p id={errorId("fullName")} className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
      </div>
      <div className="col-span-2 sm:col-span-1">
        <label className={labelCls} htmlFor={`${prefix}-phone`}>Phone *</label>
        <PhoneInput id={`${prefix}-phone`} value={form.phone} onChange={(v) => update("phone", v)} ariaInvalid={!!errors.phone} ariaDescribedBy={errors.phone ? errorId("phone") : undefined} />
        {errors.phone && <p id={errorId("phone")} className="text-xs text-red-500 mt-1">{errors.phone}</p>}
      </div>
      <div className="col-span-2">
        <label className={labelCls} htmlFor={`${prefix}-line1`}>Street Address / Line 1 *</label>
        <input id={`${prefix}-line1`} value={form.line1} onChange={(e) => update("line1", e.target.value)} className={inputCls("line1")} placeholder="123 Main Street" {...errorProps("line1")} />
        {errors.line1 && <p id={errorId("line1")} className="text-xs text-red-500 mt-1">{errors.line1}</p>}
      </div>
      <div className="col-span-2">
        <label className={labelCls} htmlFor={`${prefix}-line2`}>Apartment / Line 2 (optional)</label>
        <input id={`${prefix}-line2`} value={form.line2} onChange={(e) => update("line2", e.target.value)} className={inputCls("line2")} placeholder="Apartment, suite, etc." />
      </div>
      <div>
        <label className={labelCls} htmlFor={`${prefix}-city`}>City *</label>
        <input id={`${prefix}-city`} value={form.city} onChange={(e) => update("city", e.target.value)} className={inputCls("city")} placeholder="Mumbai" {...errorProps("city")} />
        {errors.city && <p id={errorId("city")} className="text-xs text-red-500 mt-1">{errors.city}</p>}
      </div>
      <div>
        <label className={labelCls} htmlFor={`${prefix}-district`}>District</label>
        <input id={`${prefix}-district`} value={form.district} onChange={(e) => update("district", e.target.value)} className={inputCls("district")} placeholder="Mumbai City" />
      </div>
      <div>
        <label className={labelCls} htmlFor={`${prefix}-state`}>State *</label>
        <select id={`${prefix}-state`} value={form.state} onChange={(e) => update("state", e.target.value)} className={inputCls("state")} {...errorProps("state")}>
          <option value="">Select state</option>
          {INDIAN_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {errors.state && <p id={errorId("state")} className="text-xs text-red-500 mt-1">{errors.state}</p>}
      </div>
      <div>
        <label className={labelCls} htmlFor={`${prefix}-pincode`}>Pincode *</label>
        <input id={`${prefix}-pincode`} value={form.pincode} onChange={(e) => update("pincode", e.target.value)} className={inputCls("pincode")} placeholder="400001" maxLength={6} {...errorProps("pincode")} />
        {errors.pincode && <p id={errorId("pincode")} className="text-xs text-red-500 mt-1">{errors.pincode}</p>}
      </div>
      <div>
        <label className={labelCls} htmlFor={`${prefix}-country`}>Country</label>
        <input id={`${prefix}-country`} value={form.country} className={inputCls("country")} readOnly />
      </div>
    </div>
  );
}

export function validateAddress(
  form: ShippingFormState,
  setErrors: (e: Partial<Record<keyof ShippingFormState, string>>) => void
): boolean {
  const errs: Partial<Record<keyof ShippingFormState, string>> = {};
  if (!form.fullName.trim()) errs.fullName = "Full name is required";
  if (!form.phone.trim()) errs.phone = "Phone number is required";
  else {
    const digits = form.phone.replace(/\D/g, "");
    const localNumber = digits.length > 10 ? digits.slice(-10) : digits;
    if (!/^[6-9]\d{9}$/.test(localNumber)) errs.phone = "Enter a valid 10-digit number";
  }
  if (!form.line1.trim()) errs.line1 = "Address is required";
  if (!form.city.trim()) errs.city = "City is required";
  if (!form.state) errs.state = "Select a state";
  if (!form.pincode.trim()) errs.pincode = "Pincode is required";
  else if (!/^\d{6}$/.test(form.pincode.trim())) errs.pincode = "Enter a valid 6-digit pincode";
  setErrors(errs);
  return Object.keys(errs).length === 0;
}
