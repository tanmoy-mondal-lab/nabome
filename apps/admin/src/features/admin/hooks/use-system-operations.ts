/**
 * System Operations Hook
 * Source: ADMIN_DASHBOARD_ARCHITECTURE.md
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { systemOperationsApi } from '@/lib/api/admin-api';
import { useAdminStore } from '@/stores/admin-store';

export function useBackgroundJobs(query?: {
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}) {
  const { setBackgroundJobs, setError, setLoading } = useAdminStore();

  return useQuery({
    queryKey: ['background-jobs', query],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await systemOperationsApi.getBackgroundJobs(query);
        if (response.success && response.data) {
          setBackgroundJobs(response.data);
          return response.data;
        }
        throw new Error(
          response.error?.message || 'Failed to fetch background jobs',
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch background jobs',
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });
}

export function useQueueStatus() {
  const { setQueueStatus, setError, setLoading } = useAdminStore();

  return useQuery({
    queryKey: ['queue-status'],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await systemOperationsApi.getQueueStatus();
        if (response.success && response.data) {
          setQueueStatus(response.data);
          return response.data;
        }
        throw new Error(
          response.error?.message || 'Failed to fetch queue status',
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch queue status',
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });
}

export function useCacheStatus() {
  const { setCacheStatus, setError, setLoading } = useAdminStore();

  return useQuery({
    queryKey: ['cache-status'],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await systemOperationsApi.getCacheStatus();
        if (response.success && response.data) {
          setCacheStatus(response.data);
          return response.data;
        }
        throw new Error(
          response.error?.message || 'Failed to fetch cache status',
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch cache status',
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    refetchInterval: 60 * 1000, // Refresh every minute
  });
}

export function useSearchIndexStatus() {
  const { setSearchIndexStatus, setError, setLoading } = useAdminStore();

  return useQuery({
    queryKey: ['search-index-status'],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await systemOperationsApi.getSearchIndexStatus();
        if (response.success && response.data) {
          setSearchIndexStatus(response.data);
          return response.data;
        }
        throw new Error(
          response.error?.message || 'Failed to fetch search index status',
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch search index status',
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    refetchInterval: 60 * 1000, // Refresh every minute
  });
}

export function useStorageHealth() {
  const { setStorageHealth, setError, setLoading } = useAdminStore();

  return useQuery({
    queryKey: ['storage-health'],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await systemOperationsApi.getStorageHealth();
        if (response.success && response.data) {
          setStorageHealth(response.data);
          return response.data;
        }
        throw new Error(
          response.error?.message || 'Failed to fetch storage health',
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch storage health',
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
  });
}

export function useDatabaseHealth() {
  const { setDatabaseHealth, setError, setLoading } = useAdminStore();

  return useQuery({
    queryKey: ['database-health'],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await systemOperationsApi.getDatabaseHealth();
        if (response.success && response.data) {
          setDatabaseHealth(response.data);
          return response.data;
        }
        throw new Error(
          response.error?.message || 'Failed to fetch database health',
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch database health',
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });
}

export function useAPIHealth() {
  const { setAPIHealth, setError, setLoading } = useAdminStore();

  return useQuery({
    queryKey: ['api-health'],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await systemOperationsApi.getAPIHealth();
        if (response.success && response.data) {
          setAPIHealth(response.data);
          return response.data;
        }
        throw new Error(
          response.error?.message || 'Failed to fetch API health',
        );
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Failed to fetch API health',
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });
}

export function useScheduledTasks() {
  const { setScheduledTasks, setError, setLoading } = useAdminStore();
  const queryClient = useQueryClient();

  const result = useQuery({
    queryKey: ['scheduled-tasks'],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await systemOperationsApi.getScheduledTasks();
        if (response.success && response.data) {
          setScheduledTasks(response.data);
          return response.data;
        }
        throw new Error(
          response.error?.message || 'Failed to fetch scheduled tasks',
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch scheduled tasks',
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });

  const triggerTask = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await systemOperationsApi.triggerTask(taskId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to trigger task');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-tasks'] });
    },
  });

  return {
    ...result,
    triggerTask,
  };
}
