// @ts-nocheck
/**
 * useShipments Hook
 *
 * React hook for managing shipments in the frontend.
 *
 * Source: SHIPPING_DELIVERY_LOGISTICS_ARCHITECTURE.md (binding)
 */

import { useState, useCallback } from 'react';

import {
  ShipmentStatus,
  ActorType,
  ShippingMethod,
  CarrierType,
} from '../enums';
import type {
  Shipment,
  ShipmentFilterOptions,
  CreateShipmentInput,
  UpdateShipmentStatusInput,
  StateTransitionResult,
} from '../types';

interface UseShipmentsOptions {
  initialFilters?: ShipmentFilterOptions;
}

interface UseShipmentsReturn {
  shipments: Shipment[];
  loading: boolean;
  error: string | null;
  fetchShipments: (filters?: ShipmentFilterOptions) => Promise<void>;
  getShipmentById: (id: string) => Promise<Shipment | null>;
  createShipment: (
    input: CreateShipmentInput,
    shippingAddress: Record<string, unknown>,
  ) => Promise<Shipment | null>;
  updateShipmentStatus: (
    input: UpdateShipmentStatusInput,
  ) => Promise<StateTransitionResult>;
  deleteShipment: (id: string) => Promise<void>;
  getShipmentsByOrder: (orderId: string) => Promise<Shipment[]>;
}

/**
 * Hook for managing shipments
 */
export function useShipments(
  options: UseShipmentsOptions = {},
): UseShipmentsReturn {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = '/api/v1';

  /**
   * Fetch shipments with optional filters
   */
  const fetchShipments = useCallback(
    async (filters?: ShipmentFilterOptions) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (filters?.orderId) params.append('orderId', filters.orderId);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.carrierCode)
          params.append('carrierCode', filters.carrierCode);
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.offset) params.append('offset', filters.offset.toString());

        const response = await fetch(
          `${API_BASE}/shipments?${params.toString()}`,
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch shipments');
        }

        setShipments(data.shipments || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch shipments',
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Get a specific shipment by ID
   */
  const getShipmentById = useCallback(
    async (id: string): Promise<Shipment | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/shipments/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch shipment');
        }

        return data.shipment || null;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch shipment',
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Create a new shipment
   */
  const createShipment = useCallback(
    async (
      input: CreateShipmentInput,
      shippingAddress: Record<string, unknown>,
    ): Promise<Shipment | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/shipments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...input,
            shippingAddress,
          }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create shipment');
        }

        // Refresh shipments list
        await fetchShipments(options.initialFilters);

        return data.shipment || null;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to create shipment',
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchShipments, options.initialFilters],
  );

  /**
   * Update shipment status
   */
  const updateShipmentStatus = useCallback(
    async (
      input: UpdateShipmentStatusInput,
    ): Promise<StateTransitionResult> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE}/shipments/${input.shipmentId}/status`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
          },
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to update shipment status');
        }

        // Refresh shipments list
        await fetchShipments(options.initialFilters);

        return data.result;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to update shipment status',
        );
        return {
          success: false,
          previousStatus: ShipmentStatus.SHIPMENT_CREATED,
          newStatus: input.status,
          error:
            err instanceof Error
              ? err.message
              : 'Failed to update shipment status',
        };
      } finally {
        setLoading(false);
      }
    },
    [fetchShipments, options.initialFilters],
  );

  /**
   * Delete a shipment
   */
  const deleteShipment = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/shipments/${id}`, {
          method: 'DELETE',
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to delete shipment');
        }

        // Refresh shipments list
        await fetchShipments(options.initialFilters);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to delete shipment',
        );
      } finally {
        setLoading(false);
      }
    },
    [fetchShipments, options.initialFilters],
  );

  /**
   * Get shipments for an order
   */
  const getShipmentsByOrder = useCallback(
    async (orderId: string): Promise<Shipment[]> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/orders/${orderId}/shipments`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch shipments for order');
        }

        return data.shipments || [];
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to fetch shipments for order',
        );
        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    shipments,
    loading,
    error,
    fetchShipments,
    getShipmentById,
    createShipment,
    updateShipmentStatus,
    deleteShipment,
    getShipmentsByOrder,
  };
}
