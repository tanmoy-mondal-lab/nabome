import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../../lib/api/admin";

export function useAdminRefunds(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ["admin", "refunds", params],
    queryFn: () => adminApi.getRefunds(params),
  });
}

export function useAdminRefund(id: string) {
  return useQuery({
    queryKey: ["admin", "refund", id],
    queryFn: () => adminApi.getRefund(id),
    enabled: !!id,
  });
}

export function useCreateRefund() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      orderId: string;
      returnRequestId?: string;
      amount: number;
      type: string;
      notes?: string;
    }) => adminApi.createRefund(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "refunds"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });
}

export function useProcessRefund() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminApi.processRefund(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "refunds"] });
    },
  });
}

export function useCompleteRefund() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminApi.completeRefund(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "refunds"] });
    },
  });
}

export function useFailRefund() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { notes?: string } }) =>
      adminApi.failRefund(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "refunds"] });
    },
  });
}
