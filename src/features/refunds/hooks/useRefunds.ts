import { useQuery } from "@tanstack/react-query";
import { customerApi } from "../../../lib/api/customer";

export function useCustomerRefunds(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ["customer", "refunds", params],
    queryFn: () => customerApi.getRefunds(params),
  });
}

export function useCustomerRefund(id: string) {
  return useQuery({
    queryKey: ["customer", "refund", id],
    queryFn: () => customerApi.getRefund(id),
    enabled: !!id,
  });
}
