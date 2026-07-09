import { api } from "../client";
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

export const customersApi = {
  list: (params?: Record<string, string | number | undefined>) =>
    api.get<CustomerListResponse>("/admin/customers", { params }),
  get: (id: string) => api.get<{ customer: Profile }>(`/admin/customers/${id}`),
  update: (id: string, data: Partial<Profile>) => api.put<{ customer: Profile }>(`/admin/customers/${id}`, data),
};
