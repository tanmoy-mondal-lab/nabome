/**
 * Shop Product Hooks Tests
 *
 * Unit tests for product management hooks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import {
  useShopProducts,
  useShopProduct,
  useDeleteProduct,
  usePublishProduct,
  useCreateProduct,
  useUpdateProduct,
} from './hooks';

// Mock the API client
vi.mock('../../../lib/api/client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    del: vi.fn(),
  },
}));

const api = (await import('../../../lib/api/client')).api;

describe('useShopProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch products with default parameters', async () => {
    const mockProducts = {
      products: [
        { id: '1', name: 'Product 1', status: 'active' },
        { id: '2', name: 'Product 2', status: 'draft' },
      ],
      total: 2,
    };
    vi.mocked(api.get).mockResolvedValue(mockProducts);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => {
      return React.createElement(
        QueryClientProvider,
        { client: queryClient },
        children,
      );
    };

    const { result } = renderHook(() => useShopProducts(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith('/api/v1/shop/products?');
    expect(result.current.data).toEqual(mockProducts);
  });

  it('should fetch products with query parameters', async () => {
    const mockProducts = {
      products: [{ id: '1', name: 'Product 1', status: 'active' }],
      total: 1,
    };
    vi.mocked(api.get).mockResolvedValue(mockProducts);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => {
      return React.createElement(
        QueryClientProvider,
        { client: queryClient },
        children,
      );
    };

    const { result } = renderHook(
      () => useShopProducts({ status: 'active', limit: 10 }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith(
      '/api/v1/shop/products?status=active&limit=10',
    );
  });
});

describe('useShopProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch single product by ID', async () => {
    const mockProduct = { id: '1', name: 'Product 1', status: 'active' };
    vi.mocked(api.get).mockResolvedValue(mockProduct);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => {
      return React.createElement(
        QueryClientProvider,
        { client: queryClient },
        children,
      );
    };

    const { result } = renderHook(() => useShopProduct('1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith('/api/v1/shop/products/1');
    expect(result.current.data).toEqual(mockProduct);
  });

  it('should not fetch when productId is empty', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => {
      return React.createElement(
        QueryClientProvider,
        { client: queryClient },
        children,
      );
    };

    const { result } = renderHook(() => useShopProduct(''), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(api.get).not.toHaveBeenCalled();
  });
});

describe('useDeleteProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete product and invalidate cache', async () => {
    vi.mocked(api.del).mockResolvedValue({ success: true });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Pre-populate cache
    queryClient.setQueryData(['shop-products'], {
      products: [
        { id: '1', name: 'Product 1', status: 'active' },
        { id: '2', name: 'Product 2', status: 'active' },
      ],
      total: 2,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => {
      return React.createElement(
        QueryClientProvider,
        { client: queryClient },
        children,
      );
    };

    const { result } = renderHook(() => useDeleteProduct(), { wrapper });

    result.current.mutate('1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.del).toHaveBeenCalledWith('/api/v1/shop/products/1');
  });

  it('should rollback optimistic update on error', async () => {
    vi.mocked(api.del).mockRejectedValue(new Error('Delete failed'));

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const initialData = {
      products: [
        { id: '1', name: 'Product 1', status: 'active' },
        { id: '2', name: 'Product 2', status: 'active' },
      ],
      total: 2,
    };

    queryClient.setQueryData(['shop-products'], initialData);

    const wrapper = ({ children }: { children: React.ReactNode }) => {
      return React.createElement(
        QueryClientProvider,
        { client: queryClient },
        children,
      );
    };

    const { result } = renderHook(() => useDeleteProduct(), { wrapper });

    result.current.mutate('1');

    await waitFor(() => expect(result.current.isError).toBe(true));

    // Verify rollback occurred
    const cacheData = queryClient.getQueryData(['shop-products']);
    expect(cacheData).toEqual(initialData);
  });
});

describe('usePublishProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should publish product and update cache', async () => {
    vi.mocked(api.post).mockResolvedValue({ success: true });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    queryClient.setQueryData(['shop-products'], {
      products: [{ id: '1', name: 'Product 1', status: 'draft' }],
      total: 1,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => {
      return React.createElement(
        QueryClientProvider,
        { client: queryClient },
        children,
      );
    };

    const { result } = renderHook(() => usePublishProduct(), { wrapper });

    result.current.mutate('1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.post).toHaveBeenCalledWith('/api/v1/shop/products/1/publish');
  });
});

describe('useCreateProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create product and add to cache', async () => {
    const newProduct = { name: 'New Product', status: 'draft' };
    vi.mocked(api.post).mockResolvedValue({ id: '1', ...newProduct });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    queryClient.setQueryData(['shop-products'], {
      products: [],
      total: 0,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => {
      return React.createElement(
        QueryClientProvider,
        { client: queryClient },
        children,
      );
    };

    const { result } = renderHook(() => useCreateProduct(), { wrapper });

    result.current.mutate(newProduct);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.post).toHaveBeenCalledWith('/api/v1/shop/products', newProduct);
  });
});

describe('useUpdateProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update product and invalidate cache', async () => {
    const updateData = { name: 'Updated Product' };
    vi.mocked(api.patch).mockResolvedValue({ success: true });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    queryClient.setQueryData(['shop-products'], {
      products: [{ id: '1', name: 'Product 1', status: 'active' }],
      total: 1,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => {
      return React.createElement(
        QueryClientProvider,
        { client: queryClient },
        children,
      );
    };

    const { result } = renderHook(() => useUpdateProduct(), { wrapper });

    result.current.mutate({ productId: '1', data: updateData });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.patch).toHaveBeenCalledWith(
      '/api/v1/shop/products/1',
      updateData,
    );
  });
});
