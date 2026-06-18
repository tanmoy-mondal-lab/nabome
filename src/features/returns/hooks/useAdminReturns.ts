import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../../lib/api/admin";

export function useAdminReturns(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ["admin", "returns", params],
    queryFn: () => adminApi.getReturns(params),
  });
}

export function useAdminReturn(id: string) {
  return useQuery({
    queryKey: ["admin", "return", id],
    queryFn: () => adminApi.getReturn(id),
    enabled: !!id,
  });
}

export function useApproveReturn() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { adminNote?: string } }) =>
      adminApi.approveReturn(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "returns"] });
    },
  });
}

export function useRejectReturn() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { adminNote: string } }) =>
      adminApi.rejectReturn(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "returns"] });
    },
  });
}

export function useReceiveReturn() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminApi.receiveReturn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "returns"] });
    },
  });
}
