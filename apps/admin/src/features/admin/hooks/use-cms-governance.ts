/**
 * CMS Governance Hook
 * Source: ADMIN_DASHBOARD_ARCHITECTURE.md
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { cmsGovernanceApi } from '@/lib/api/admin-api';
import { useAdminStore } from '@/stores/admin-store';
import type { CMSContent } from '@/types/admin';

export function useCMSContent(type?: string) {
  const { setCMSContent, setError, setLoading } = useAdminStore();
  const queryClient = useQueryClient();

  const result = useQuery({
    queryKey: ['cms-content', type],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await cmsGovernanceApi.getContent(type);
        if (response.success && response.data) {
          setCMSContent(response.data);
          return response.data;
        }
        throw new Error(
          response.error?.message || 'Failed to fetch CMS content',
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch CMS content',
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });

  const createContent = useMutation({
    mutationFn: async (content: Partial<CMSContent>) => {
      const response = await cmsGovernanceApi.createContent(content);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to create content');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-content'] });
    },
  });

  const updateContent = useMutation({
    mutationFn: async ({
      contentId,
      content,
    }: {
      contentId: string;
      content: Partial<CMSContent>;
    }) => {
      const response = await cmsGovernanceApi.updateContent(contentId, content);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to update content');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-content'] });
    },
  });

  const publishContent = useMutation({
    mutationFn: async (contentId: string) => {
      const response = await cmsGovernanceApi.publishContent(contentId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to publish content');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-content'] });
    },
  });

  const scheduleContent = useMutation({
    mutationFn: async ({
      contentId,
      scheduledFor,
    }: {
      contentId: string;
      scheduledFor: string;
    }) => {
      const response = await cmsGovernanceApi.scheduleContent(
        contentId,
        scheduledFor,
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to schedule content');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-content'] });
    },
  });

  return {
    ...result,
    createContent,
    updateContent,
    publishContent,
    scheduleContent,
  };
}

export function useCMSContentById(contentId: string) {
  const { setError, setLoading } = useAdminStore();

  return useQuery({
    queryKey: ['cms-content', contentId],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await cmsGovernanceApi.getContentById(contentId);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(
          response.error?.message || 'Failed to fetch CMS content',
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch CMS content',
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!contentId,
  });
}

export function useCMSVersionHistory(contentId: string) {
  const { setError, setLoading } = useAdminStore();

  return useQuery({
    queryKey: ['cms-version-history', contentId],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await cmsGovernanceApi.getVersionHistory(contentId);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(
          response.error?.message || 'Failed to fetch version history',
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch version history',
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!contentId,
  });
}
