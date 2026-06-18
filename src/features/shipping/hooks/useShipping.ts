import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../../lib/api/admin";

export function useShippingZones() {
  return useQuery({
    queryKey: ["admin", "shipping-zones"],
    queryFn: () => adminApi.getShippingZones(),
  });
}

export function useCreateShippingZone() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: unknown) => adminApi.createShippingZone(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "shipping-zones"] });
    },
  });
}

export function useUpdateShippingZone() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      adminApi.updateShippingZone(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "shipping-zones"] });
    },
  });
}

export function useDeleteShippingZone() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteShippingZone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "shipping-zones"] });
    },
  });
}

export function useAddShippingRate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ zoneId, data }: { zoneId: string; data: unknown }) =>
      adminApi.addShippingRate(zoneId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "shipping-zones"] });
    },
  });
}

export function useUpdateShippingRate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      adminApi.updateShippingRate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "shipping-zones"] });
    },
  });
}

export function useDeleteShippingRate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteShippingRate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "shipping-zones"] });
    },
  });
}
