export interface Address {
    id: string;
    profileId: string;
    label: string;
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    district?: string;
    state: string;
    pincode: string;
    country: string;
    isDefault: boolean;
    isBillingDefault: boolean;
    addressType: string;
}
export interface AddressInput {
    label?: string;
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    district?: string;
    state: string;
    pincode: string;
    country?: string;
    isDefault?: boolean;
}
