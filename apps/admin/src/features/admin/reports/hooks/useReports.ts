/**
 * Reports Hooks
 * Hooks for interacting with reports API
 */

import { useMutation } from '@tanstack/react-query';
import { reportsApi } from '../../../../lib/api/admin-api';

export function useGenerateRevenueReport() {
  return useMutation({
    mutationFn: (query?: {
      startDate?: string;
      endDate?: string;
      period?: string;
    }) => reportsApi.generateRevenueReport(query),
  });
}

export function useGenerateCommerceReport() {
  return useMutation({
    mutationFn: (query?: {
      startDate?: string;
      endDate?: string;
      period?: string;
    }) => reportsApi.generateCommerceReport(query),
  });
}

export function useGenerateCustomerReport() {
  return useMutation({
    mutationFn: (query?: {
      startDate?: string;
      endDate?: string;
      segment?: string;
    }) => reportsApi.generateCustomerReport(query),
  });
}

export function useGenerateShopReport() {
  return useMutation({
    mutationFn: (query?: {
      startDate?: string;
      endDate?: string;
      status?: string;
    }) => reportsApi.generateShopReport(query),
  });
}

export function useGenerateSecurityReport() {
  return useMutation({
    mutationFn: (query?: {
      startDate?: string;
      endDate?: string;
      type?: string;
    }) => reportsApi.generateSecurityReport(query),
  });
}

export function useGenerateAuditReport() {
  return useMutation({
    mutationFn: (query?: {
      startDate?: string;
      endDate?: string;
      action?: string;
    }) => reportsApi.generateAuditReport(query),
  });
}

export function useGenerateOperationsReport() {
  return useMutation({
    mutationFn: (query?: {
      startDate?: string;
      endDate?: string;
      metric?: string;
    }) => reportsApi.generateOperationsReport(query),
  });
}
