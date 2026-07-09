import type { Profile } from "../../../types/index";
export interface CustomerListResponse {
    customers: Profile[];
    pagination: {
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    };
}
export declare const customersApi: {
    list: (params?: Record<string, string | number | undefined>) => Promise<CustomerListResponse>;
    get: (id: string) => Promise<{
        customer: Profile;
    }>;
    update: (id: string, data: Partial<Profile>) => Promise<{
        customer: Profile;
    }>;
};
