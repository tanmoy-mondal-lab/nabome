// @ts-nocheck
/**
 * useTracking Hook
 *
 * React hook for managing shipment tracking in the frontend.
 *
 * Source: SHIPPING_DELIVERY_LOGISTICS_ARCHITECTURE.md (binding)
 */

import { useState, useCallback } from 'react';

import type { TrackingEventType, ActorType } from '../enums';
import type { TrackingTimeline, TrackingEventResult } from '../types';

interface UseTrackingReturn {
  timeline: TrackingTimeline | null;
  loading: boolean;
  error: string | null;
  getTrackingTimeline: (shipmentId: string) => Promise<void>;
  getTrackingByNumber: (trackingNumber: string) => Promise<void>;
  addTrackingEvent: (
    shipmentId: string,
    status: TrackingEventType,
    location: string | null,
    description: string,
    actorType: ActorType,
    actorId: string | null,
    metadata?: Record<string, unknown>,
  ) => Promise<TrackingEventResult>;
}

/**
 * Hook for managing shipment tracking
 */
export function useTracking(): UseTrackingReturn {
  const [timeline, setTimeline] = useState<TrackingTimeline | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = '/api/v1';

  /**
   * Get tracking timeline for a shipment
   */
  const getTrackingTimeline = useCallback(async (shipmentId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE}/shipments/${shipmentId}/tracking`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tracking timeline');
      }

      setTimeline(data.timeline || null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch tracking timeline',
      );
      setTimeline(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get tracking timeline by tracking number
   */
  const getTrackingByNumber = useCallback(async (trackingNumber: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/tracking/${trackingNumber}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tracking');
      }

      setTimeline(data.timeline || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tracking');
      setTimeline(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Add a tracking event to a shipment
   */
  const addTrackingEvent = useCallback(
    async (
      shipmentId: string,
      status: TrackingEventType,
      location: string | null,
      description: string,
      actorType: ActorType,
      actorId: string | null,
      metadata?: Record<string, unknown>,
    ): Promise<TrackingEventResult> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE}/shipments/${shipmentId}/tracking/events`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status,
              location,
              description,
              actorType,
              actorId,
              metadata,
            }),
          },
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to add tracking event');
        }

        // Refresh timeline
        await getTrackingTimeline(shipmentId);

        return data.result;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to add tracking event',
        );
        return {
          success: false,
          eventId: '',
          error:
            err instanceof Error ? err.message : 'Failed to add tracking event',
        };
      } finally {
        setLoading(false);
      }
    },
    [getTrackingTimeline],
  );

  return {
    timeline,
    loading,
    error,
    getTrackingTimeline,
    getTrackingByNumber,
    addTrackingEvent,
  };
}
