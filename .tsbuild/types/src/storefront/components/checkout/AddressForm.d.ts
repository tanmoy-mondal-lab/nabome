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
export declare const EMPTY_SHIPPING: ShippingFormState;
interface AddressFormProps {
    form: ShippingFormState;
    setForm: (f: ShippingFormState) => void;
    errors: Partial<Record<keyof ShippingFormState, string>>;
    setErrors: (e: Partial<Record<keyof ShippingFormState, string>>) => void;
    prefix: string;
}
export declare function AddressForm({ form, setForm, errors, setErrors, prefix }: AddressFormProps): import("react").JSX.Element;
export declare function validateAddress(form: ShippingFormState, setErrors: (e: Partial<Record<keyof ShippingFormState, string>>) => void): boolean;
export {};
