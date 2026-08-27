/**
 * Admin Inventory Hooks
 *
 * React hooks for admin inventory data fetching and operations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
interface InventorySummary {
  totalVariants: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalStock: number;
  totalReserved: number;
}

interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string | null;
  email: string | null;
  status: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// API base URL
const API_BASE = '/api/v1';

/**
 * Hook to fetch platform inventory summary
 */
export function useInventorySummary() {
  return useQuery({
    queryKey: ['inventory', 'summary'],
    queryFn: async (): Promise<InventorySummary> => {
      const response = await fetch(`${API_BASE}/inventory/summary`);
      if (!response.ok) {
        throw new Error('Failed to fetch inventory summary');
      }
      return response.json();
    },
  });
}

/**
 * Hook to fetch all warehouses
 */
export function useWarehouses() {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: async (): Promise<Warehouse[]> => {
      const response = await fetch(`${API_BASE}/warehouses`);
      if (!response.ok) {
        throw new Error('Failed to fetch warehouses');
      }
      const data = await response.json();
      return data.warehouses || [];
    },
  });
}

/**
 * Hook to create a warehouse
 */
export function useCreateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      code: string;
      address: string;
      city: string;
      state: string;
      postalCode: string;
      country?: string;
      phone?: string;
      email?: string;
      priority?: number;
    }) => {
      const response = await fetch(`${API_BASE}/warehouses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create warehouse');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
  });
}

/**
 * Hook to update a warehouse
 */
export function useUpdateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Warehouse>;
    }) => {
      const response = await fetch(`${API_BASE}/warehouses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update warehouse');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
  });
}

/**
 * Hook to delete a warehouse
 */
export function useDeleteWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE}/warehouses/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete warehouse');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
  });
}
