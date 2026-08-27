/**
 * Shipping Hooks Tests
 *
 * Unit tests for shipping hooks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createQueryClientWrapper } from '@/test/utils';
import {
  useShipments,
  useTrackingTimeline,
  useCarrierRates,
  useFulfillmentQueue,
} from '../hooks';

// Mock fetch globally
global.fetch = vi.fn();

describe('Shipping Hooks', () => {
  let queryClient: QueryClient;
  let wrapper: ReturnType<typeof createQueryClientWrapper>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    wrapper = createQueryClientWrapper(queryClient);
    vi.clearAllMocks();
  });

  describe('useShipments', () => {
    it('fetches shipments successfully', async () => {
      const mockShipments = [
        {
          id: '1',
          trackingNumber: 'TRACK123',
          orderId: 'ORD001',
          carrier: 'FedEx',
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockShipments,
      });

      const { result } = renderHook(() => useShipments(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockShipments);
      });
    });

    it('includes search query in request', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      renderHook(() => useShipments({ search: 'TRACK123' }), { wrapper });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('search=TRACK123'),
        );
      });
    });

    it('handles fetch errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useShipments(), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });
    });
  });

  describe('useTrackingTimeline', () => {
    it('fetches tracking timeline for a shipment', async () => {
      const mockTimeline = [
        { status: 'picked_up', timestamp: '2024-01-01T10:00:00Z' },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTimeline,
      });

      const { result } = renderHook(() => useTrackingTimeline('SHIP123'), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockTimeline);
      });
    });

    it('does not fetch when shipmentId is not provided', () => {
      const { result } = renderHook(() => useTrackingTimeline(''), { wrapper });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('useCarrierRates', () => {
    it('fetches carrier rates successfully', async () => {
      const mockCarriers = [
        { id: '1', name: 'FedEx', baseRate: 100, perKgRate: 10 },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCarriers,
      });

      const { result } = renderHook(() => useCarrierRates(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockCarriers);
      });
    });
  });

  describe('useFulfillmentQueue', () => {
    it('fetches fulfillment queue successfully', async () => {
      const mockQueue = [
        { id: '1', orderNumber: 'ORD001', customerName: 'John Doe' },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockQueue,
      });

      const { result } = renderHook(() => useFulfillmentQueue(), { wrapper });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockQueue);
      });
    });
  });
});
