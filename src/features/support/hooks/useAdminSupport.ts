import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../../lib/api/admin";

export function useAdminSupportTickets(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ["admin", "support", params],
    queryFn: () => adminApi.getSupportTickets(params),
  });
}

export function useAdminSupportTicket(id: string) {
  return useQuery({
    queryKey: ["admin", "support", id],
    queryFn: () => adminApi.getSupportTicket(id),
    enabled: !!id,
  });
}

export function useUpdateSupportTicketStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string } }) =>
      adminApi.updateSupportTicketStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "support"] });
    },
  });
}

export function useAssignSupportTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { assignedTo: string } }) =>
      adminApi.assignSupportTicket(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "support"] });
    },
  });
}

export function useReplySupportTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { message: string } }) =>
      adminApi.replySupportTicket(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "support"] });
    },
  });
}

export function useAdminFAQs() {
  return useQuery({
    queryKey: ["admin", "faq"],
    queryFn: () => adminApi.getFaqs(),
  });
}

export function useCreateFAQ() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { question: string; answer: string; category?: string; sortOrder?: number }) =>
      adminApi.createFaq(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "faq"] });
    },
  });
}

export function useUpdateFAQ() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      adminApi.updateFaq(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "faq"] });
    },
  });
}

export function useDeleteFAQ() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteFaq(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "faq"] });
    },
  });
}
