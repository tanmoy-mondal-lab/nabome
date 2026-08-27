/**
 * Security Operations Hook
 * Source: ADMIN_DASHBOARD_ARCHITECTURE.md
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { securityOperationsApi } from '@/lib/api/admin-api';
import { useAdminStore } from '@/stores/admin-store';

export function useSecurityAuditLogs(query?: {
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  const { setError, setLoading } = useAdminStore();

  return useQuery({
    queryKey: ['security-audit-logs', query],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await securityOperationsApi.getAuditLogs(query);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(
          response.error?.message || 'Failed to fetch audit logs',
        );
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Failed to fetch audit logs',
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });
}

export function useActiveSessions(userId?: string) {
  const { setError, setLoading } = useAdminStore();
  const queryClient = useQueryClient();

  const result = useQuery({
    queryKey: ['active-sessions', userId],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await securityOperationsApi.getActiveSessions(userId);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(
          response.error?.message || 'Failed to fetch active sessions',
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch active sessions',
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });

  const revokeSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await securityOperationsApi.revokeSession(sessionId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to revoke session');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
    },
  });

  return {
    ...result,
    revokeSession,
  };
}

export function useSecurityAlerts(query?: {
  severity?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const { setSecurityAlerts, setError, setLoading } = useAdminStore();
  const queryClient = useQueryClient();

  const result = useQuery({
    queryKey: ['security-alerts', query],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await securityOperationsApi.getSecurityAlerts(query);
        if (response.success && response.data) {
          setSecurityAlerts(response.data);
          return response.data;
        }
        throw new Error(
          response.error?.message || 'Failed to fetch security alerts',
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch security alerts',
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });

  const resolveAlert = useMutation({
    mutationFn: async ({
      alertId,
      resolution,
    }: {
      alertId: string;
      resolution: string;
    }) => {
      const response = await securityOperationsApi.resolveAlert(
        alertId,
        resolution,
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to resolve alert');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-alerts'] });
    },
  });

  return {
    ...result,
    resolveAlert,
  };
}

export function useFailedLoginAttempts(query?: {
  email?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  const { setError, setLoading } = useAdminStore();

  return useQuery({
    queryKey: ['failed-login-attempts', query],
    queryFn: async () => {
      setLoading(true);
      try {
        const response =
          await securityOperationsApi.getFailedLoginAttempts(query);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(
          response.error?.message || 'Failed to fetch failed login attempts',
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch failed login attempts',
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });
}
