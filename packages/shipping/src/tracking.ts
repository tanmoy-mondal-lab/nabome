/**
 * Tracking Service
 *
 * This file implements the tracking service and timeline system.
 * Handles tracking updates, timeline generation, and carrier tracking integration.
 *
 * Source: SHIPPING_DELIVERY_LOGISTICS_ARCHITECTURE.md (binding)
 */

// @ts-ignore - Prisma client will be generated after schema migration
import type { PrismaClient } from '@prisma/client';

import { CarrierRegistry } from './carrier-abstraction';
import { TrackingEventType, ActorType, ShipmentStatus } from './enums';
import { ShipmentRepository } from './repository';
import type {
  TrackingTimeline,
  TrackingUpdateInput,
  TrackingEventResult,
  ShipmentEvent,
} from './types';

/**
 * Tracking Service
 *
 * Manages shipment tracking, timeline generation, and carrier tracking updates.
 */
export class TrackingService {
  private repository: ShipmentRepository;

  constructor(prisma: PrismaClient) {
    this.repository = new ShipmentRepository(prisma);
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Tracking Timeline
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Get tracking timeline for a shipment
   */
  async getTrackingTimeline(
    shipmentId: string,
  ): Promise<TrackingTimeline | null> {
    const shipment = await this.repository.getShipmentById(shipmentId);
    if (!shipment) return null;

    const events = await this.repository.getShipmentEvents(shipmentId);

    return {
      shipmentId,
      trackingNumber: shipment.trackingNumber || '',
      carrier: shipment.carrierName || 'Unknown',
      currentStatus: shipment.status,
      customerVisibleStatus: this.getCustomerVisibleStatus(shipment.status),
      estimatedDeliveryDate: shipment.estimatedDeliveryDate,
      events,
      lastUpdated: shipment.updatedAt,
    };
  }

  /**
   * Get tracking timeline by tracking number
   */
  async getTrackingTimelineByNumber(
    trackingNumber: string,
  ): Promise<TrackingTimeline | null> {
    const shipment =
      await this.repository.getShipmentByTrackingNumber(trackingNumber);
    if (!shipment) return null;

    return this.getTrackingTimeline(shipment.id);
  }

  /**
   * Get customer-visible status for a shipment status
   */
  private getCustomerVisibleStatus(status: ShipmentStatus): string {
    const statusMap: Record<ShipmentStatus, string> = {
      [ShipmentStatus.SHIPMENT_CREATED]: 'processing',
      [ShipmentStatus.READY_TO_PACK]: 'processing',
      [ShipmentStatus.PACKED]: 'packed',
      [ShipmentStatus.READY_FOR_PICKUP]: 'shipped',
      [ShipmentStatus.PICKED_UP]: 'shipped',
      [ShipmentStatus.IN_TRANSIT]: 'in_transit',
      [ShipmentStatus.OUT_FOR_DELIVERY]: 'out_for_delivery',
      [ShipmentStatus.DELIVERED]: 'delivered',
      [ShipmentStatus.DELIVERY_FAILED]: 'delivery_failed',
      [ShipmentStatus.EXCEPTION]: 'delivery_failed',
      [ShipmentStatus.RETURNED_TO_SENDER]: 'returned',
      [ShipmentStatus.CANCELLED]: 'cancelled',
      [ShipmentStatus.CLOSED]: 'delivered',
    };

    return statusMap[status] || 'processing';
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Tracking Updates
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Add a tracking event to a shipment
   */
  async addTrackingEvent(
    shipmentId: string,
    status: TrackingEventType,
    location: string | null,
    description: string,
    actorType: ActorType,
    actorId: string | null,
    metadata?: Record<string, unknown>,
  ): Promise<TrackingEventResult> {
    const shipment = await this.repository.getShipmentById(shipmentId);
    if (!shipment) {
      return {
        success: false,
        eventId: '',
        error: 'Shipment not found',
      };
    }

    const event = await this.repository.addShipmentEvent(
      shipmentId,
      status,
      location,
      description,
      actorType,
      actorId,
      metadata,
    );

    // Update shipment status if the event corresponds to a status change
    const newStatus = this.mapTrackingEventToStatus(status);
    if (newStatus && newStatus !== shipment.status) {
      await this.repository.updateShipmentStatus(shipmentId, newStatus);
    }

    return {
      success: true,
      eventId: event.id,
    };
  }

  /**
   * Process a tracking update from carrier webhook
   */
  async processCarrierTrackingUpdate(
    update: TrackingUpdateInput,
  ): Promise<TrackingEventResult> {
    const shipment = await this.repository.getShipmentByTrackingNumber(
      update.trackingNumber,
    );
    if (!shipment) {
      return {
        success: false,
        eventId: '',
        error: 'Shipment not found for tracking number',
      };
    }

    // Add tracking event
    const event = await this.repository.addShipmentEvent(
      shipment.id,
      update.status,
      update.location || null,
      update.description,
      ActorType.COURIER,
      null,
      update.metadata,
    );

    // Update shipment status
    const newStatus = this.mapTrackingEventToStatus(update.status);
    if (newStatus && newStatus !== shipment.status) {
      await this.repository.updateShipmentStatus(shipment.id, newStatus);
    }

    return {
      success: true,
      eventId: event.id,
    };
  }

  /**
   * Map tracking event type to shipment status
   */
  private mapTrackingEventToStatus(
    eventType: TrackingEventType,
  ): ShipmentStatus | null {
    const statusMap: Record<TrackingEventType, ShipmentStatus> = {
      [TrackingEventType.SHIPMENT_CREATED]: ShipmentStatus.SHIPMENT_CREATED,
      [TrackingEventType.READY_TO_PACK]: ShipmentStatus.READY_TO_PACK,
      [TrackingEventType.PACKED]: ShipmentStatus.PACKED,
      [TrackingEventType.READY_FOR_PICKUP]: ShipmentStatus.READY_FOR_PICKUP,
      [TrackingEventType.PICKED_UP]: ShipmentStatus.PICKED_UP,
      [TrackingEventType.IN_TRANSIT]: ShipmentStatus.IN_TRANSIT,
      [TrackingEventType.OUT_FOR_DELIVERY]: ShipmentStatus.OUT_FOR_DELIVERY,
      [TrackingEventType.DELIVERED]: ShipmentStatus.DELIVERED,
      [TrackingEventType.DELIVERY_FAILED]: ShipmentStatus.DELIVERY_FAILED,
      [TrackingEventType.EXCEPTION]: ShipmentStatus.EXCEPTION,
      [TrackingEventType.RETURNED_TO_SENDER]: ShipmentStatus.RETURNED_TO_SENDER,
      [TrackingEventType.CANCELLED]: ShipmentStatus.CANCELLED,
    };

    return statusMap[eventType] || null;
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Carrier Tracking Integration
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Fetch tracking information from carrier
   */
  async fetchCarrierTracking(
    trackingNumber: string,
    carrierCode: string,
  ): Promise<TrackingUpdateInput | null> {
    const adapter = CarrierRegistry.get(carrierCode as any);
    if (!adapter) {
      return null;
    }

    return adapter.getTrackingInfo(trackingNumber);
  }

  /**
   * Sync tracking information from carrier
   */
  async syncCarrierTracking(
    trackingNumber: string,
    carrierCode: string,
  ): Promise<TrackingEventResult> {
    const trackingInfo = await this.fetchCarrierTracking(
      trackingNumber,
      carrierCode,
    );
    if (!trackingInfo) {
      return {
        success: false,
        eventId: '',
        error: 'Unable to fetch tracking information from carrier',
      };
    }

    return this.processCarrierTrackingUpdate(trackingInfo);
  }

  /**
   * Get tracking URL for a shipment
   */
  async getTrackingUrl(shipmentId: string): Promise<string> {
    const shipment = await this.repository.getShipmentById(shipmentId);
    if (!shipment || !shipment.trackingNumber || !shipment.carrierCode) {
      return '';
    }

    const adapter = CarrierRegistry.get(shipment.carrierCode as any);
    if (!adapter) {
      return '';
    }

    return adapter.getTrackingUrl(shipment.trackingNumber) || '';
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Tracking Statistics
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Get tracking statistics for a shipment
   */
  async getTrackingStatistics(shipmentId: string): Promise<{
    totalEvents: number;
    lastEvent: ShipmentEvent | null;
    daysInTransit: number | null;
    estimatedDelivery: Date | null;
    isOnTime: boolean | null;
  }> {
    const shipment = await this.repository.getShipmentById(shipmentId);
    if (!shipment) {
      return {
        totalEvents: 0,
        lastEvent: null,
        daysInTransit: null,
        estimatedDelivery: null,
        isOnTime: null,
      };
    }

    const events = await this.repository.getShipmentEvents(shipmentId);
    const lastEvent: ShipmentEvent | null =
      events.length > 0 ? events[0]! : null;

    // Calculate days in transit
    let daysInTransit: number | null = null;
    if (shipment.shippedAt) {
      const now = new Date();
      const shippedAt = new Date(shipment.shippedAt);
      daysInTransit = Math.floor(
        (now.getTime() - shippedAt.getTime()) / (1000 * 60 * 60 * 24),
      );
    }

    // Check if on time
    let isOnTime: boolean | null = null;
    if (shipment.estimatedDeliveryDate && shipment.deliveredAt) {
      isOnTime =
        new Date(shipment.deliveredAt) <=
        new Date(shipment.estimatedDeliveryDate);
    } else if (shipment.estimatedDeliveryDate && !shipment.deliveredAt) {
      isOnTime = new Date() <= new Date(shipment.estimatedDeliveryDate);
    }

    return {
      totalEvents: events.length,
      lastEvent,
      daysInTransit,
      estimatedDelivery: shipment.estimatedDeliveryDate,
      isOnTime,
    };
  }

  /**
   * Get tracking events for a date range
   */
  async getTrackingEventsForDateRange(
    shipmentId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ShipmentEvent[]> {
    const allEvents = await this.repository.getShipmentEvents(shipmentId);
    return allEvents.filter(
      (event) => event.createdAt >= startDate && event.createdAt <= endDate,
    );
  }
}

/**
 * Singleton instance of the tracking service
 * Note: In production, this would be instantiated with a Prisma client
 */
export const createTrackingService = (
  prisma: PrismaClient,
): TrackingService => {
  return new TrackingService(prisma);
};
