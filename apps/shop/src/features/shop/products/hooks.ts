/**
 * Shop Product Management Hooks
 *
 * Custom hooks for product management operations
 * Following SHOP_OWNER_DASHBOARD_FRONTEND_IMPLEMENTATION_SPECIFICATION.md
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api/client';

// Product list hook
export function useShopProducts(
  query: {
    status?: string;
    category?: string;
    brand?: string;
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: string;
  } = {},
) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, String(value));
    }
  });

  return useQuery({
    queryKey: ['shop-products', query],
    queryFn: async () => {
      return api.get(`/api/v1/shop/products?${params.toString()}`);
    },
  });
}

// Single product hook
export function useShopProduct(productId: string) {
  return useQuery({
    queryKey: ['shop-product', productId],
    queryFn: async () => {
      return api.get(`/api/v1/shop/products/${productId}`);
    },
    enabled: !!productId,
  });
}

// Delete product mutation with optimistic update
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      return api.del(`/api/v1/shop/products/${productId}`);
    },
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ['shop-products'] });
      const previousProducts = queryClient.getQueryData(['shop-products']);
      queryClient.setQueryData(['shop-products'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          products: old.products?.filter((p: any) => p.id !== productId) || [],
        };
      });
      return { previousProducts };
    },
    onError: (err, productId, context) => {
      queryClient.setQueryData(
        ['shop-products'],
        (context as any)?.previousProducts,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-products'] });
    },
  });
}

// Publish product mutation with optimistic update
export function usePublishProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      return api.post(`/api/v1/shop/products/${productId}/publish`);
    },
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ['shop-products'] });
      const previousProducts = queryClient.getQueryData(['shop-products']);
      queryClient.setQueryData(['shop-products'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          products:
            old.products?.map((p: any) =>
              p.id === productId ? { ...p, status: 'published' } : p,
            ) || [],
        };
      });
      return { previousProducts };
    },
    onError: (err, productId, context) => {
      queryClient.setQueryData(
        ['shop-products'],
        (context as any)?.previousProducts,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-products'] });
    },
  });
}

// Create product mutation with optimistic update
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      return api.post('/api/v1/shop/products', data);
    },
    onMutate: async (newProduct) => {
      await queryClient.cancelQueries({ queryKey: ['shop-products'] });
      const previousProducts = queryClient.getQueryData(['shop-products']);
      const tempId = `temp-${Date.now()}`;
      queryClient.setQueryData(['shop-products'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          products: [
            { ...newProduct, id: tempId, status: 'draft' },
            ...(old.products || []),
          ],
        };
      });
      return { previousProducts, tempId };
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(
        ['shop-products'],
        (context as any)?.previousProducts,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-products'] });
    },
  });
}

// Update product mutation with optimistic update
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      data,
    }: {
      productId: string;
      data: Record<string, unknown>;
    }) => {
      return api.patch(`/api/v1/shop/products/${productId}`, data);
    },
    onMutate: async ({ productId, data }) => {
      await queryClient.cancelQueries({ queryKey: ['shop-products'] });
      await queryClient.cancelQueries({
        queryKey: ['shop-product', productId],
      });
      const previousProducts = queryClient.getQueryData(['shop-products']);
      const previousProduct = queryClient.getQueryData([
        'shop-product',
        productId,
      ]);

      queryClient.setQueryData(['shop-products'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          products:
            old.products?.map((p: any) =>
              p.id === productId ? { ...p, ...data } : p,
            ) || [],
        };
      });

      queryClient.setQueryData(['shop-product', productId], (old: any) => {
        if (!old) return old;
        return { ...old, ...data };
      });

      return { previousProducts, previousProduct };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ['shop-products'],
        (context as any)?.previousProducts,
      );
      queryClient.setQueryData(
        ['shop-product', variables.productId],
        (context as any)?.previousProduct,
      );
    },
    onSettled: (_, __, variables) => {
      if (variables) {
        queryClient.invalidateQueries({ queryKey: ['shop-products'] });
        queryClient.invalidateQueries({
          queryKey: ['shop-product', variables.productId],
        });
      }
    },
  });
}
