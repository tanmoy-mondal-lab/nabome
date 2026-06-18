import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerApi } from "../../../lib/api/customer";
import { useAuthStore } from "../../../stores/auth-store";

export function useCustomerDashboard() {
  return useQuery({
    queryKey: ["customer", "dashboard"],
    queryFn: () => customerApi.getDashboard(),
  });
}

export function useCustomerProfile() {
  return useQuery({
    queryKey: ["customer", "profile"],
    queryFn: () => customerApi.getProfile(),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { firstName?: string; lastName?: string; phone?: string }) =>
      customerApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "profile"] });
      queryClient.invalidateQueries({ queryKey: ["customer", "dashboard"] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      customerApi.changePassword(data),
  });
}

export function useCustomerAddresses() {
  return useQuery({
    queryKey: ["customer", "addresses"],
    queryFn: () => customerApi.getAddresses(),
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: unknown) => customerApi.createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "addresses"] });
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      customerApi.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "addresses"] });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => customerApi.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "addresses"] });
    },
  });
}

export function useCustomerWishlist() {
  return useQuery({
    queryKey: ["customer", "wishlist"],
    queryFn: () => customerApi.getWishlist(),
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (variantId: string) => customerApi.addToWishlist(variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["customer", "dashboard"] });
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (variantId: string) => customerApi.removeFromWishlist(variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["customer", "dashboard"] });
    },
  });
}

export function useCustomerNotifications(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ["customer", "notifications", params],
    queryFn: () => customerApi.getNotifications(params),
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ["customer", "notifications", "unread-count"],
    queryFn: () => customerApi.getUnreadNotificationCount(),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => customerApi.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "notifications"] });
      queryClient.invalidateQueries({ queryKey: ["customer", "notifications", "unread-count"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => customerApi.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "notifications"] });
      queryClient.invalidateQueries({ queryKey: ["customer", "notifications", "unread-count"] });
    },
  });
}

export function useCustomerSupportTickets() {
  return useQuery({
    queryKey: ["customer", "support"],
    queryFn: () => customerApi.getSupportTickets(),
  });
}

export function useCreateSupportTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { subject: string; message: string; orderId?: string }) =>
      customerApi.createSupportTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "support"] });
    },
  });
}

export function useAddSupportReply() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ ticketId, data }: { ticketId: string; data: { message: string } }) =>
      customerApi.addSupportReply(ticketId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "support"] });
    },
  });
}

export function useCustomerFAQs() {
  return useQuery({
    queryKey: ["customer", "faq"],
    queryFn: () => customerApi.getFaqs(),
  });
}
