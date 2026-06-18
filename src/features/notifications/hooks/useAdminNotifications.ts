import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../../lib/api/admin";

export function useAdminNotifications(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ["admin", "notifications", params],
    queryFn: () => adminApi.getNotifications(params),
  });
}

export function useNotificationTemplates() {
  return useQuery({
    queryKey: ["admin", "notification-templates"],
    queryFn: () => adminApi.getNotificationTemplates(),
  });
}

export function useUpdateNotificationTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      adminApi.updateNotificationTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notification-templates"] });
    },
  });
}

export function useSendManualNotification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { profileId: string; type: string; title: string; body?: string }) =>
      adminApi.sendManualNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
    },
  });
}
