export interface Address {
    id: string;
    profileId: string;
    label: string;
    fullName: string;
    phone: string;
    line1: string;
    line2: string | null;
    city: string;
    district: string | null;
    state: string;
    pincode: string;
    country: string;
    isDefault: boolean;
    createdAt: string;
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
export declare const addressesApi: {
    list: () => Promise<{
        addresses: Address[];
    }>;
    create: (data: AddressInput) => Promise<Address>;
    update: (id: string, data: Partial<AddressInput>) => Promise<Address>;
    delete: (id: string) => Promise<{
        message: string;
    }>;
};
