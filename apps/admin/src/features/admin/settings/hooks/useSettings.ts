/**
 * Settings Hooks
 * Hooks for interacting with platform settings API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { platformSettingsApi } from '../../../../lib/api/admin-api';

export function useGlobalSettings() {
  return useQuery({
    queryKey: ['settings-global'],
    queryFn: async () => {
      const response = await platformSettingsApi.getGlobalSettings();
      return response.data;
    },
  });
}

export function useTaxSettings() {
  return useQuery({
    queryKey: ['settings-tax'],
    queryFn: async () => {
      const response = await platformSettingsApi.getTaxSettings();
      return response.data;
    },
  });
}

export function useCommissionSettings() {
  return useQuery({
    queryKey: ['settings-commission'],
    queryFn: async () => {
      const response = await platformSettingsApi.getCommissionSettings();
      return response.data;
    },
  });
}

export function useShippingSettings() {
  return useQuery({
    queryKey: ['settings-shipping'],
    queryFn: async () => {
      const response = await platformSettingsApi.getShippingSettings();
      return response.data;
    },
  });
}

export function usePaymentSettings() {
  return useQuery({
    queryKey: ['settings-payment'],
    queryFn: async () => {
      const response = await platformSettingsApi.getPaymentSettings();
      return response.data;
    },
  });
}

export function useCMSSettings() {
  return useQuery({
    queryKey: ['settings-cms'],
    queryFn: async () => {
      const response = await platformSettingsApi.getCMSSettings();
      return response.data;
    },
  });
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: ['settings-notifications'],
    queryFn: async () => {
      const response = await platformSettingsApi.getNotificationSettings();
      return response.data;
    },
  });
}

export function useFeatureFlags() {
  return useQuery({
    queryKey: ['settings-features'],
    queryFn: async () => {
      const response = await platformSettingsApi.getFeatureFlags();
      return response.data;
    },
  });
}

export function useUpdateGlobalSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: any) =>
      platformSettingsApi.updateGlobalSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings-global'] });
    },
  });
}

export function useUpdateFeatureFlag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      flagId,
      enabled,
      reason,
    }: {
      flagId: string;
      enabled: boolean;
      reason?: string;
    }) => platformSettingsApi.updateFeatureFlag(flagId, enabled, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings-features'] });
    },
  });
}
