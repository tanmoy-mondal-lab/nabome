/**
 * Shipment Service
 *
 * This file implements the business logic for shipment operations.
 * All business logic resides in this service layer as per architecture guidelines.
 *
 * Source: SHIPPING_DELIVERY_LOGISTICS_ARCHITECTURE.md (binding)
 */

// @ts-ignore - Prisma client will be generated after schema migration
import type { PrismaClient } from '@prisma/client';

import {
  ShipmentStatus,
  TrackingEventType,
  type ActorType,
  type ShippingMethod,
  type CarrierType,
  type CustomerVisibleShipmentStatus,
} from './enums';
import { ShipmentRepository } from './repository';
import { shipmentStateMachine } from './state-machine';
import type {
  Shipment,
  CreateShipmentInput,
  UpdateShipmentStatusInput,
  StateTransitionResult,
  TrackingEventResult,
  ShipmentFilterOptions,
  TrackingTimeline,
  ShipmentSummary,
} from './types';

/**
 * Shipment Service
 *
 * Contains all business logic for shipment operations.
 * This service orchestrates repository calls, state transitions, and event publishing.
 */
export class ShipmentService {
  private repository: ShipmentRepository;

  constructor(prisma: PrismaClient) {
    this.repository = new ShipmentRepository(prisma);
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Shipment Creation
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Create a new shipment for an order
   */
  async createShipment(
    input: CreateShipmentInput,
    shippingAddress: Record<string, unknown>,
    actorType: ActorType,
    actorId: string | null,
  ): Promise<Shipment> {
    // Create the shipment
    const shipment = await this.repository.createShipment(
      input,
      shippingAddress,
    );

    // Add initial tracking event
    await this.repository.addShipmentEvent(
      shipment.id,
      TrackingEventType.SHIPMENT_CREATED,
      null,
      'Shipment created',
      actorType,
      actorId,
      { orderId: input.orderId },
    );

    return shipment;
  }

  /**
   * Create multiple shipments for an order (split shipment)
   */
  async createSplitShipments(
    orderId: string,
    shipmentGroups: Array<{
      items: CreateShipmentInput['items'];
      shippingMethod: ShippingMethod;
      carrierCode: CarrierType | null;
      shippingAddress: Record<string, unknown>;
    }>,
    actorType: ActorType,
    actorId: string | null,
  ): Promise<Shipment[]> {
    const shipments: Shipment[] = [];

    for (const group of shipmentGroups) {
      const shipment = await this.createShipment(
        {
          orderId,
          shippingMethod: group.shippingMethod,
          carrierCode: group.carrierCode,
          trackingNumber: null,
          estimatedDeliveryDate: null,
          items: group.items,
        },
        group.shippingAddress,
        actorType,
        actorId,
      );
      shipments.push(shipment);
    }

    return shipments;
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Shipment Status Management
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Update shipment status with validation
   * 1. Fetches current DB state, 2. validates via state machine (positional API with real status),
   * 3. persists atomically via conditional update (prevents TOCTOU / concurrent transitions),
   * 4. records tracking event with actor/reason metadata, 5. returns actual resulting state.
   */
  async updateShipmentStatus(
    input: UpdateShipmentStatusInput,
  ): Promise<StateTransitionResult> {
    const shipment = await this.repository.getShipmentById(input.shipmentId);
    if (!shipment) {
      return {
        success: false,
        previousStatus: ShipmentStatus.SHIPMENT_CREATED,
        newStatus: input.status,
        error: 'Shipment not found',
      };
    }

    const inputWithCurrent = {
      ...input,
      currentStatus: shipment.status as ShipmentStatus,
    } as UpdateShipmentStatusInput & { currentStatus: ShipmentStatus };

    const result = shipmentStateMachine.transition(inputWithCurrent);

    if (!result.success) {
      return result;
    }

    const shippedAt =
      input.status === ShipmentStatus.PICKED_UP ||
      input.status === ShipmentStatus.IN_TRANSIT
        ? new Date()
        : undefined;

    const deliveredAt =
      input.status === ShipmentStatus.DELIVERED ? new Date() : undefined;

    const { matched } = await this.repository.updateShipmentStatusAtomic(
      input.shipmentId,
      shipment.status as ShipmentStatus,
      input.status,
      shippedAt,
      deliveredAt,
    );

    if (!matched) {
      return {
        success: false,
        previousStatus: shipment.status as ShipmentStatus,
        newStatus: input.status,
        error:
          'Concurrent transition conflict: shipment status changed before update could be applied',
      };
    }

    await this.repository.addShipmentEvent(
      input.shipmentId,
      input.status as unknown as TrackingEventType,
      null,
      input.reason || `Status updated to ${input.status}`,
      input.actorType,
      input.actorId,
      input.metadata,
    );

    return {
      success: true,
      previousStatus: shipment.status as ShipmentStatus,
      newStatus: input.status,
    };
  }

  /**
   * Atomic transition via repository helper — single-call variant that encapsulates
   * fetch + validate + conditional persist + event recording.
   */
  async transitionShipmentAtomic(
    shipmentId: string,
    newStatus: ShipmentStatus,
    actorType: ActorType,
    actorId: string | null,
    reason?: string,
    metadata?: Record<string, unknown>,
  ): Promise<StateTransitionResult> {
    const { result } = await this.repository.transitionShipmentAtomic(
      shipmentId,
      newStatus,
      actorType,
      actorId,
      reason,
      metadata,
    );
    return result;
  }

  /**
   * Mark shipment as ready to pack
   */
  async markReadyToPack(
    shipmentId: string,
    actorType: ActorType,
    actorId: string,
  ): Promise<StateTransitionResult> {
    return this.updateShipmentStatus({
      shipmentId,
      status: ShipmentStatus.READY_TO_PACK,
      actorType,
      actorId,
    });
  }

  /**
   * Mark shipment as packed
   */
  async markPacked(
    shipmentId: string,
    actorType: ActorType,
    actorId: string,
  ): Promise<StateTransitionResult> {
    return this.updateShipmentStatus({
      shipmentId,
      status: ShipmentStatus.PACKED,
      actorType,
      actorId,
    });
  }

  /**
   * Mark shipment as ready for pickup
   */
  async markReadyForPickup(
    shipmentId: string,
    actorType: ActorType,
    actorId: string,
  ): Promise<StateTransitionResult> {
    return this.updateShipmentStatus({
      shipmentId,
      status: ShipmentStatus.READY_FOR_PICKUP,
      actorType,
      actorId,
    });
  }

  /**
   * Mark shipment as picked up by carrier
   */
  async markPickedUp(
    shipmentId: string,
    trackingNumber: string,
    carrierCode: string | null,
    actorType: ActorType,
    actorId: string,
  ): Promise<StateTransitionResult> {
    // Update tracking number first
    await this.repository.updateShipmentTrackingNumber(
      shipmentId,
      trackingNumber,
      carrierCode,
    );

    // Then update status
    return this.updateShipmentStatus({
      shipmentId,
      status: ShipmentStatus.PICKED_UP,
      actorType,
      actorId,
      metadata: { trackingNumber, carrierCode },
    });
  }

  /**
   * Mark shipment as in transit
   */
  async markInTransit(
    shipmentId: string,
    actorType: ActorType,
    actorId: string,
  ): Promise<StateTransitionResult> {
    return this.updateShipmentStatus({
      shipmentId,
      status: ShipmentStatus.IN_TRANSIT,
      actorType,
      actorId,
    });
  }

  /**
   * Mark shipment as out for delivery
   */
  async markOutForDelivery(
    shipmentId: string,
    actorType: ActorType,
    actorId: string,
  ): Promise<StateTransitionResult> {
    return this.updateShipmentStatus({
      shipmentId,
      status: ShipmentStatus.OUT_FOR_DELIVERY,
      actorType,
      actorId,
    });
  }

  /**
   * Mark shipment as delivered
   */
  async markDelivered(
    shipmentId: string,
    actorType: ActorType,
    actorId: string,
  ): Promise<StateTransitionResult> {
    return this.updateShipmentStatus({
      shipmentId,
      status: ShipmentStatus.DELIVERED,
      actorType,
      actorId,
    });
  }

  /**
   * Mark delivery as failed
   */
  async markDeliveryFailed(
    shipmentId: string,
    reason: string,
    actorType: ActorType,
    actorId: string,
  ): Promise<StateTransitionResult> {
    return this.updateShipmentStatus({
      shipmentId,
      status: ShipmentStatus.DELIVERY_FAILED,
      actorType,
      actorId,
      reason,
    });
  }

  /**
   * Mark shipment as returned to sender
   */
  async markReturnedToSender(
    shipmentId: string,
    reason: string,
    actorType: ActorType,
    actorId: string,
  ): Promise<StateTransitionResult> {
    return this.updateShipmentStatus({
      shipmentId,
      status: ShipmentStatus.RETURNED_TO_SENDER,
      actorType,
      actorId,
      reason,
    });
  }

  /**
   * Cancel a shipment
   */
  async cancelShipment(
    shipmentId: string,
    reason: string,
    actorType: ActorType,
    actorId: string,
  ): Promise<StateTransitionResult> {
    return this.updateShipmentStatus({
      shipmentId,
      status: ShipmentStatus.CANCELLED,
      actorType,
      actorId,
      reason,
    });
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Shipment Queries
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Get a shipment by ID
   */
  async getShipmentById(id: string): Promise<Shipment | null> {
    return this.repository.getShipmentById(id);
  }

  /**
   * Get a shipment by tracking number
   */
  async getShipmentByTrackingNumber(
    trackingNumber: string,
  ): Promise<Shipment | null> {
    return this.repository.getShipmentByTrackingNumber(trackingNumber);
  }

  /**
   * Get all shipments for an order
   */
  async getShipmentsByOrderId(orderId: string): Promise<Shipment[]> {
    return this.repository.getShipmentsByOrderId(orderId);
  }

  /**
   * Query shipments with filters
   */
  async queryShipments(options: ShipmentFilterOptions): Promise<Shipment[]> {
    return this.repository.queryShipments(options);
  }

  /**
   * Get shipment summary
   */
  async getShipmentSummary(id: string): Promise<ShipmentSummary | null> {
    const shipment = await this.repository.getShipmentById(id);
    if (!shipment) return null;

    return {
      id: shipment.id,
      orderNumber: '', // Would need to fetch from order
      status: shipment.status,
      customerVisibleStatus: shipmentStateMachine.getCustomerVisibleStatus(
        shipment.status,
      ) as CustomerVisibleShipmentStatus,
      trackingNumber: shipment.trackingNumber,
      carrier: shipment.carrierName,
      estimatedDeliveryDate: shipment.estimatedDeliveryDate,
      createdAt: shipment.createdAt,
    };
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
      customerVisibleStatus: shipmentStateMachine.getCustomerVisibleStatus(
        shipment.status,
      ) as CustomerVisibleShipmentStatus,
      estimatedDeliveryDate: shipment.estimatedDeliveryDate,
      events,
      lastUpdated: shipment.updatedAt,
    };
  }

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
    const statusMapping: Record<TrackingEventType, ShipmentStatus> = {
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

    const newStatus = statusMapping[status];
    if (newStatus && newStatus !== shipment.status) {
      await this.repository.updateShipmentStatus(shipmentId, newStatus);
    }

    return {
      success: true,
      eventId: event.id,
    };
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Shipment Deletion
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Soft delete a shipment
   */
  async deleteShipment(id: string): Promise<void> {
    await this.repository.deleteShipment(id);
  }
}

/**
 * Singleton instance of the shipment service
 * Note: In production, this would be instantiated with a Prisma client
 */
export const createShipmentService = (
  prisma: PrismaClient,
): ShipmentService => {
  return new ShipmentService(prisma);
};
