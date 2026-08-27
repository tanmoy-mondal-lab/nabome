/**
 * Platform KPIs Hook
 * Source: ADMIN_DASHBOARD_ARCHITECTURE.md
 */

import { useQuery } from '@tanstack/react-query';

import { platformOverviewApi } from '../../../lib/api/admin-api';
import { useAdminStore } from '../../../stores/admin-store';
import type { ActivityItem } from '../dashboard/components/ActivityFeed';
import type { PendingTask } from '../dashboard/components/PendingTasks';

export function usePlatformKPIs(period?: string) {
  const { setKPIs, setError, setLoading } = useAdminStore();

  return useQuery({
    queryKey: ['platform-kpis', period],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await platformOverviewApi.getKPIs(period);
        if (response.success && response.data) {
          setKPIs(response.data);
          return response.data;
        }
        throw new Error(response.error?.message || 'Failed to fetch KPIs');
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Failed to fetch KPIs',
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
  });
}

export function usePlatformActivity() {
  return useQuery({
    queryKey: ['platform-activity'],
    queryFn: async (): Promise<ActivityItem[]> => {
      const response = await fetch('/api/v1/admin/platform/activity');
      if (!response.ok) {
        throw new Error('Failed to fetch platform activity');
      }
      const data = await response.json();
      return data.success ? data.data : [];
    },
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000,
  });
}

export function usePendingTasks() {
  return useQuery({
    queryKey: ['pending-tasks'],
    queryFn: async (): Promise<PendingTask[]> => {
      const response = await fetch('/api/v1/admin/platform/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch pending tasks');
      }
      const data = await response.json();
      return data.success ? data.data : [];
    },
    refetchInterval: 120000, // Refresh every 2 minutes
    staleTime: 60000,
  });
}
