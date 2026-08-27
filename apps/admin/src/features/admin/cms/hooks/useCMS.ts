/**
 * CMS Hooks
 * Hooks for interacting with CMS governance API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsGovernanceApi } from '../../../../lib/api/admin-api';

export function useCMSContent(type?: string) {
  return useQuery({
    queryKey: ['cms-content', type],
    queryFn: async () => {
      const response = await cmsGovernanceApi.getContent(type);
      return response.data;
    },
  });
}

export function useCMSContentById(contentId: string) {
  return useQuery({
    queryKey: ['cms-content', contentId],
    queryFn: async () => {
      const response = await cmsGovernanceApi.getContentById(contentId);
      return response.data;
    },
    enabled: !!contentId,
  });
}

export function useVersionHistory(contentId: string) {
  return useQuery({
    queryKey: ['cms-history', contentId],
    queryFn: async () => {
      const response = await cmsGovernanceApi.getVersionHistory(contentId);
      return response.data;
    },
    enabled: !!contentId,
  });
}

export function useCreateContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: any) => cmsGovernanceApi.createContent(content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-content'] });
    },
  });
}

export function useUpdateContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contentId, content }: { contentId: string; content: any }) =>
      cmsGovernanceApi.updateContent(contentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-content'] });
    },
  });
}
