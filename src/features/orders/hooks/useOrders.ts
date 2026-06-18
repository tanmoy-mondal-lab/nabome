import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerApi } from "../../../lib/api/customer";

export function useOrders(params?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["customer", "orders", params?.status, params?.page],
    queryFn: () => customerApi.getOrders(params),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["customer", "order", id],
    queryFn: () => customerApi.getOrder(id),
    enabled: !!id,
  });
}

export function useOrderStats() {
  return useQuery({
    queryKey: ["customer", "order-stats"],
    queryFn: () => customerApi.getOrderStats(),
  });
}

export function useOrderTracking(id: string) {
  return useQuery({
    queryKey: ["customer", "order", id, "tracking"],
    queryFn: () => customerApi.getOrderTracking(id),
    enabled: !!id,
  });
}

export function useOrderInvoice(id: string) {
  return useQuery({
    queryKey: ["customer", "order", id, "invoice"],
    queryFn: () => customerApi.getOrderInvoice(id),
    enabled: !!id,
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => customerApi.cancelOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["customer", "order-stats"] });
    },
  });
}
