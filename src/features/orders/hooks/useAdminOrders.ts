import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../../lib/api/admin";

export function useAdminOrders(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ["admin", "orders", params],
    queryFn: () => adminApi.getOrders(params),
  });
}

export function useAdminOrder(id: string) {
  return useQuery({
    queryKey: ["admin", "order", id],
    queryFn: () => adminApi.getOrder(id),
    enabled: !!id,
  });
}

export function useAdminOrderStats() {
  return useQuery({
    queryKey: ["admin", "order-stats"],
    queryFn: () => adminApi.getOrderStats(),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string; note?: string } }) =>
      adminApi.updateOrderStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "order-stats"] });
    },
  });
}

export function useUpdateOrderInternalNotes() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      adminApi.updateOrderInternalNotes(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "order"] });
    },
  });
}

export function useAdminOrderTimeline(id: string) {
  return useQuery({
    queryKey: ["admin", "order", id, "timeline"],
    queryFn: () => adminApi.getOrderTimeline(id),
    enabled: !!id,
  });
}
