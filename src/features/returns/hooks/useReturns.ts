import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerApi } from "../../../lib/api/customer";

export function useCustomerReturns(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ["customer", "returns", params],
    queryFn: () => customerApi.getReturns(params),
  });
}

export function useCustomerReturn(id: string) {
  return useQuery({
    queryKey: ["customer", "return", id],
    queryFn: () => customerApi.getReturn(id),
    enabled: !!id,
  });
}

export function useCreateReturn() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      orderId: string;
      orderItemId?: string;
      reason: string;
      reasonDetail?: string;
      evidenceImages?: string[];
    }) => customerApi.createReturn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "returns"] });
    },
  });
}
