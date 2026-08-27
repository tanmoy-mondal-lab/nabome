/**
 * Customer Management Hook
 * Source: ADMIN_DASHBOARD_ARCHITECTURE.md
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { customerManagementApi } from '@/lib/api/admin-api';
import { useAdminStore } from '@/stores/admin-store';

export function useCustomers(query?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}) {
  const { setCustomers, setError, setLoading } = useAdminStore();
  const queryClient = useQueryClient();

  const result = useQuery({
    queryKey: ['customers', query],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await customerManagementApi.listCustomers(query);
        if (response.success && response.data) {
          setCustomers(response.data);
          return response.data;
        }
        throw new Error(response.error?.message || 'Failed to fetch customers');
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Failed to fetch customers',
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });

  const lockCustomer = useMutation({
    mutationFn: async ({
      customerId,
      reason,
    }: {
      customerId: string;
      reason: string;
    }) => {
      const response = await customerManagementApi.lockCustomer(
        customerId,
        reason,
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to lock customer');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const unlockCustomer = useMutation({
    mutationFn: async ({
      customerId,
      reason,
    }: {
      customerId: string;
      reason: string;
    }) => {
      const response = await customerManagementApi.unlockCustomer(customerId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to unlock customer');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const verifyEmail = useMutation({
    mutationFn: async (customerId: string) => {
      const response = await customerManagementApi.verifyEmail(customerId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to verify email');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const sendPasswordReset = useMutation({
    mutationFn: async (customerId: string) => {
      const response =
        await customerManagementApi.sendPasswordReset(customerId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(
        response.error?.message || 'Failed to send password reset',
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const suspendCustomer = useMutation({
    mutationFn: async ({
      customerId,
      reason,
    }: {
      customerId: string;
      reason: string;
    }) => {
      const response = await customerManagementApi.suspendCustomer(
        customerId,
        reason,
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to suspend customer');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const activateCustomer = useMutation({
    mutationFn: async (customerId: string) => {
      const response = await customerManagementApi.activateCustomer(customerId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to activate customer');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const exportCustomerData = useMutation({
    mutationFn: async (customerId: string) => {
      const response =
        await customerManagementApi.exportCustomerData(customerId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(
        response.error?.message || 'Failed to export customer data',
      );
    },
  });

  return {
    ...result,
    lockCustomer,
    unlockCustomer,
    verifyEmail,
    sendPasswordReset,
    suspendCustomer,
    activateCustomer,
    exportCustomerData,
  };
}

export function useCustomer(customerId: string) {
  const { setSelectedCustomer, setError, setLoading } = useAdminStore();

  return useQuery({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await customerManagementApi.getCustomer(customerId);
        if (response.success && response.data) {
          setSelectedCustomer(response.data);
          return response.data;
        }
        throw new Error(response.error?.message || 'Failed to fetch customer');
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Failed to fetch customer',
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!customerId,
  });
}

export function useLoginHistory(customerId: string) {
  return useQuery({
    queryKey: ['customer-login-history', customerId],
    queryFn: async () => {
      const response = await customerManagementApi.getLoginHistory(customerId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(
        response.error?.message || 'Failed to fetch login history',
      );
    },
    enabled: !!customerId,
  });
}

export function useAuditTimeline(customerId: string) {
  return useQuery({
    queryKey: ['customer-audit-timeline', customerId],
    queryFn: async () => {
      const response = await customerManagementApi.getAuditTimeline(customerId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(
        response.error?.message || 'Failed to fetch audit timeline',
      );
    },
    enabled: !!customerId,
  });
}
