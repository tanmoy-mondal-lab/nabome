// @ts-nocheck
/**
 * useCarriers Hook
 *
 * React hook for managing carriers in the frontend.
 *
 * Source: SHIPPING_DELIVERY_LOGISTICS_ARCHITECTURE.md (binding)
 */

import { useState, useCallback } from 'react';

import type { CarrierType } from '../enums';
import type { Carrier, ShippingRate } from '../types';

interface UseCarriersReturn {
  carriers: Carrier[];
  loading: boolean;
  error: string | null;
  getCarriers: () => Promise<void>;
  getCarrierByCode: (code: CarrierType) => Promise<Carrier | null>;
  registerCarrier: (
    code: CarrierType,
    name: string,
    displayName: string,
    config: Record<string, unknown>,
    trackingUrlTemplate?: string,
  ) => Promise<Carrier | null>;
  updateCarrier: (
    code: CarrierType,
    config: Record<string, unknown>,
  ) => Promise<Carrier | null>;
  calculateRates: (
    origin: Record<string, unknown>,
    destination: Record<string, unknown>,
    weight: number,
    dimensions?: { length: number; width: number; height: number },
  ) => Promise<ShippingRate[]>;
}

/**
 * Hook for managing carriers
 */
export function useCarriers(): UseCarriersReturn {
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = '/api/v1';

  /**
   * Get all carriers
   */
  const getCarriers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/carriers`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch carriers');
      }

      setCarriers(data.carriers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch carriers');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get a specific carrier by code
   */
  const getCarrierByCode = useCallback(
    async (code: CarrierType): Promise<Carrier | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/carriers/${code}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch carrier');
        }

        return data.carrier || null;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch carrier',
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Register a new carrier
   */
  const registerCarrier = useCallback(
    async (
      code: CarrierType,
      name: string,
      displayName: string,
      config: Record<string, unknown>,
      trackingUrlTemplate?: string,
    ): Promise<Carrier | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/carriers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            name,
            displayName,
            config,
            trackingUrlTemplate,
          }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to register carrier');
        }

        // Refresh carriers list
        await getCarriers();

        return data.carrier || null;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to register carrier',
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getCarriers],
  );

  /**
   * Update carrier configuration
   */
  const updateCarrier = useCallback(
    async (
      code: CarrierType,
      config: Record<string, unknown>,
    ): Promise<Carrier | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/carriers/${code}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ config }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to update carrier');
        }

        // Refresh carriers list
        await getCarriers();

        return data.carrier || null;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to update carrier',
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getCarriers],
  );

  /**
   * Calculate shipping rates
   */
  const calculateRates = useCallback(
    async (
      origin: Record<string, unknown>,
      destination: Record<string, unknown>,
      weight: number,
      dimensions?: { length: number; width: number; height: number },
    ): Promise<ShippingRate[]> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/carriers/rates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin,
            destination,
            weight,
            dimensions: dimensions || { length: 0, width: 0, height: 0 },
          }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to calculate rates');
        }

        return data.rates || [];
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to calculate rates',
        );
        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    carriers,
    loading,
    error,
    getCarriers,
    getCarrierByCode,
    registerCarrier,
    updateCarrier,
    calculateRates,
  };
}
