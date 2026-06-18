import { api } from "./client";

export interface Address {
  id: string;
  profileId: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
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
  state: string;
  pincode: string;
  country?: string;
  isDefault?: boolean;
}

export const addressesApi = {
  list: () => api.get<{ addresses: Address[] }>("/addresses"),
  create: (data: AddressInput) => api.post<Address>("/addresses", data),
  update: (id: string, data: Partial<AddressInput>) => api.put<Address>(`/addresses/${id}`, data),
  delete: (id: string) => api.delete<{ message: string }>(`/addresses/${id}`),
};
