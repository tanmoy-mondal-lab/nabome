/**
 * Inventory Hooks
 *
 * React hooks for inventory data fetching and operations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api/client';

// Types
interface InventorySummary {
  totalVariants: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalStock: number;
  totalReserved: number;
}

interface LowStockAlert {
  id: string;
  variantId: string;
  variantName: string;
  sku: string;
  currentStock: number;
  threshold: number;
  createdAt: string;
}

interface InventoryItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  availableStock: number;
  reservedStock: number;
  realAvailableStock: number;
  inventoryStatus: string;
  lowStockThreshold: number;
  price: number;
}

interface StockMovement {
  id: string;
  variantId: string;
  variantName: string;
  type: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string | null;
  createdAt: string;
}

/**
 * Hook to fetch inventory summary
 */
export function useInventorySummary() {
  return useQuery({
    queryKey: ['inventory', 'summary'],
    queryFn: async (): Promise<InventorySummary> => {
      return api.get<InventorySummary>('/api/v1/inventory/summary');
    },
  });
}

/**
 * Hook to fetch low stock alerts
 */
export function useLowStockAlerts() {
  return useQuery({
    queryKey: ['inventory', 'alerts'],
    queryFn: async (): Promise<LowStockAlert[]> => {
      const data = await api.get<{ alerts: LowStockAlert[] }>(
        '/api/v1/inventory/low-stock-alerts',
      );
      return data.alerts || [];
    },
  });
}

/**
 * Hook to fetch inventory items with pagination
 */
export function useInventoryItems(
  page = 1,
  limit = 20,
  filters?: Record<string, any>,
) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...filters,
  });

  return useQuery({
    queryKey: ['inventory', 'items', page, limit, filters],
    queryFn: async (): Promise<{ items: InventoryItem[]; total: number }> => {
      return api.get<{ items: InventoryItem[]; total: number }>(
        `/api/v1/inventory/items?${params}`,
      );
    },
  });
}

/**
 * Hook to fetch stock movements for a variant
 */
export function useStockMovements(variantId: string, limit = 50, offset = 0) {
  return useQuery({
    queryKey: ['inventory', 'movements', variantId, limit, offset],
    queryFn: async (): Promise<StockMovement[]> => {
      const data = await api.get<{ movements: StockMovement[] }>(
        `/api/v1/inventory/variant/${variantId}/movements?limit=${limit}&offset=${offset}`,
      );
      return data.movements || [];
    },
    enabled: !!variantId,
  });
}

/**
 * Hook to add stock to a variant
 */
export function useAddStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      variantId: string;
      quantity: number;
      type: string;
      reason?: string;
      warehouseId?: string;
    }) => {
      return api.post('/api/v1/inventory/stock/add', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

/**
 * Hook to decrease stock from a variant
 */
export function useDecreaseStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      variantId: string;
      quantity: number;
      type: string;
      reason?: string;
      warehouseId?: string;
    }) => {
      return api.post('/api/v1/inventory/stock/decrease', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

/**
 * Hook to set stock to a specific value
 */
export function useSetStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      variantId: string;
      quantity: number;
      type: string;
      reason?: string;
      warehouseId?: string;
    }) => {
      return api.post('/api/v1/inventory/stock/set', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

/**
 * Hook to reserve stock
 */
export function useReserveStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      variantId: string;
      quantity: number;
      cartId?: string;
      orderId?: string;
      warehouseId?: string;
    }) => {
      return api.post('/api/v1/inventory/reserve', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

/**
 * Hook to check availability for variants
 */
export function useAvailabilityCheck(variantIds: string[]) {
  return useQuery({
    queryKey: ['inventory', 'availability', variantIds],
    queryFn: async () => {
      return api.get(
        `/api/v1/inventory/availability?variantIds=${variantIds.join(',')}`,
      );
    },
    enabled: variantIds.length > 0,
  });
}

/**
 * Hook to fetch warehouses
 */
export function useWarehouses() {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const data = await api.get<{ warehouses: any[] }>('/api/v1/warehouses');
      return data.warehouses || [];
    },
  });
}
