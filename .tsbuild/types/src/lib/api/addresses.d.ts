import type { Address, AddressInput } from "../../types/address";
export type { Address, AddressInput };
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
