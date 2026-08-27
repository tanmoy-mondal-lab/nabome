/**
 * Shop Reports Hooks
 *
 * Custom hooks for report generation and data fetching
 * Following SHOP_OWNER_DASHBOARD_FRONTEND_IMPLEMENTATION_SPECIFICATION.md
 */

import { useQuery, useMutation } from '@tanstack/react-query';

const API_BASE = '/api/v1/shop/reports';

// Sales report hook
export function useSalesReport(params: { startDate: string; endDate: string }) {
  const queryParams = new URLSearchParams(params);
  return useQuery({
    queryKey: ['sales-report', params],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE}/sales?${queryParams.toString()}`,
      );
      if (!response.ok) {
        throw new Error('Failed to fetch sales report');
      }
      return response.json();
    },
    enabled: !!params.startDate && !!params.endDate,
  });
}

// Inventory report hook
export function useInventoryReport() {
  return useQuery({
    queryKey: ['inventory-report'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/inventory`);
      if (!response.ok) {
        throw new Error('Failed to fetch inventory report');
      }
      return response.json();
    },
  });
}

// Returns report hook
export function useReturnsReport(params: {
  startDate: string;
  endDate: string;
}) {
  const queryParams = new URLSearchParams(params);
  return useQuery({
    queryKey: ['returns-report', params],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE}/returns?${queryParams.toString()}`,
      );
      if (!response.ok) {
        throw new Error('Failed to fetch returns report');
      }
      return response.json();
    },
    enabled: !!params.startDate && !!params.endDate,
  });
}

// Payment report hook
export function usePaymentReport(params: {
  startDate: string;
  endDate: string;
}) {
  const queryParams = new URLSearchParams(params);
  return useQuery({
    queryKey: ['payment-report', params],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE}/payments?${queryParams.toString()}`,
      );
      if (!response.ok) {
        throw new Error('Failed to fetch payment report');
      }
      return response.json();
    },
    enabled: !!params.startDate && !!params.endDate,
  });
}

// Shipping report hook
export function useShippingReport(params: {
  startDate: string;
  endDate: string;
}) {
  const queryParams = new URLSearchParams(params);
  return useQuery({
    queryKey: ['shipping-report', params],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE}/shipping?${queryParams.toString()}`,
      );
      if (!response.ok) {
        throw new Error('Failed to fetch shipping report');
      }
      return response.json();
    },
    enabled: !!params.startDate && !!params.endDate,
  });
}

// Tax report hook
export function useTaxReport(params: { startDate: string; endDate: string }) {
  const queryParams = new URLSearchParams(params);
  return useQuery({
    queryKey: ['tax-report', params],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/tax?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tax report');
      }
      return response.json();
    },
    enabled: !!params.startDate && !!params.endDate,
  });
}

// Export report mutation
export function useExportReport() {
  return useMutation({
    mutationFn: async ({
      reportType,
      format,
      params,
    }: {
      reportType: string;
      format: 'csv' | 'pdf';
      params: Record<string, string>;
    }) => {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(
        `${API_BASE}/${reportType}/export?${queryParams.toString()}&format=${format}`,
      );
      if (!response.ok) {
        throw new Error('Failed to export report');
      }
      return response.blob();
    },
  });
}
