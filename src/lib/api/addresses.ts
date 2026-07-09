import { api } from "./client";
import type { Address, AddressInput } from "../../types/address";

export type { Address, AddressInput };

export const addressesApi = {
  list: () => api.get<{ addresses: Address[] }>("/addresses"),
  create: (data: AddressInput) => api.post<Address>("/addresses", data),
  update: (id: string, data: Partial<AddressInput>) => api.put<Address>(`/addresses/${id}`, data),
  delete: (id: string) => api.delete<{ message: string }>(`/addresses/${id}`),
};
