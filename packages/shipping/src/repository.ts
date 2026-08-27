// @ts-nocheck
/**
 * Shipment Repository
 *
 * Handles all database operations for shipments using Prisma.
 * This repository provides a clean abstraction layer over Prisma client operations.
 *
 * Source: SHIPPING_DELIVERY_LOGISTICS_ARCHITECTURE.md (binding)
 */

// @ts-ignore - Prisma client will be generated after schema migration
import type { PrismaClient } from '@prisma/client';

import {
  ShipmentStatus,
  type TrackingEventType,
  type ActorType,
  FulfillmentStatus,
  type ExceptionType,
  CarrierType,
  type ShippingMethod,
  CarrierStatus,
  LabelGenerationStatus,
} from './enums';
import type {
  Shipment,
  ShipmentEvent,
  Carrier,
  FulfillmentQueueItem,
  PickListItem,
  ShippingLabel,
  ShippingException,
  DeliveryConfirmation,
  ShipmentFilterOptions,
  FulfillmentFilterOptions,
  CreateShipmentInput,
} from './types';

/**
 * Shipment Repository
 *
 * Provides data access methods for all shipping-related entities.
 * All database operations are centralized here for maintainability.
 */
export class ShipmentRepository {
  constructor(private prisma: PrismaClient) {}

  // ──────────────────────────────────────────────────────────────────────────────
  // Shipment Operations
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Create a new shipment
   */
  async createShipment(
    input: CreateShipmentInput,
    shippingAddress: Record<string, unknown>,
  ): Promise<Shipment> {
    const shipment = await this.prisma.shipment.create({
      data: {
        orderId: input.orderId,
        status: ShipmentStatus.SHIPMENT_CREATED,
        carrierCode: input.carrierCode,
        carrierName: input.carrierCode
          ? this.getCarrierName(input.carrierCode)
          : null,
        shippingMethod: input.shippingMethod,
        estimatedDeliveryDate: input.estimatedDeliveryDate,
        shippingAddress,
        weight: this.calculateTotalWeight(input.items),
        length: 0,
        width: 0,
        height: 0,
        shippingCost: 0,
      },
      include: {
        items: true,
        events: true,
      },
    });

    // Create shipment items
    for (const item of input.items) {
      await this.prisma.shipmentItem.create({
        data: {
          shipmentId: shipment.id,
          orderItemId: item.orderItemId,
          variantId: item.variantId,
          productName: item.productName,
          variantSku: item.variantSku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          packageType: item.packageType,
          isFragile: item.isFragile,
        },
      });
    }

    return this.mapShipment(shipment);
  }

  /**
   * Get a shipment by ID
   */
  async getShipmentById(id: string): Promise<Shipment | null> {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id },
      include: {
        items: true,
        events: true,
      },
    });

    return shipment ? this.mapShipment(shipment) : null;
  }

  /**
   * Get a shipment by tracking number
   */
  async getShipmentByTrackingNumber(
    trackingNumber: string,
  ): Promise<Shipment | null> {
    const shipment = await this.prisma.shipment.findUnique({
      where: { trackingNumber },
      include: {
        items: true,
        events: true,
      },
    });

    return shipment ? this.mapShipment(shipment) : null;
  }

  /**
   * Get shipments by order ID
   */
  async getShipmentsByOrderId(orderId: string): Promise<Shipment[]> {
    const shipments = await this.prisma.shipment.findMany({
      where: { orderId, isActive: true },
      include: {
        items: true,
        events: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return shipments.map((s: any) => this.mapShipment(s));
  }

  /**
   * Update shipment status
   */
  async updateShipmentStatus(
    id: string,
    status: ShipmentStatus,
    shippedAt?: Date,
    deliveredAt?: Date,
  ): Promise<Shipment> {
    const shipment = await this.prisma.shipment.update({
      where: { id },
      data: {
        status,
        shippedAt: shippedAt || undefined,
        deliveredAt: deliveredAt || undefined,
      },
      include: {
        items: true,
        events: true,
      },
    });

    return this.mapShipment(shipment);
  }

  /**
   * Atomic conditional status update — prevents race on concurrent transitions.
   * Only updates if current DB status equals expectedPreviousStatus.
   * Returns { updated: Shipment | null, matched: boolean } where matched===false means concurrent modification.
   */
  async updateShipmentStatusAtomic(
    id: string,
    expectedPreviousStatus: ShipmentStatus,
    newStatus: ShipmentStatus,
    shippedAt?: Date,
    deliveredAt?: Date,
  ): Promise<{ updated: Shipment | null; matched: boolean }> {
    const result = await (this.prisma.shipment as any).updateMany({
      where: { id, status: expectedPreviousStatus },
      data: {
        status: newStatus,
        shippedAt: shippedAt || undefined,
        deliveredAt: deliveredAt || undefined,
      },
    });
    if (result.count === 0) {
      const current = await this.prisma.shipment.findUnique({
        where: { id },
        include: { items: true, events: true },
      });
      if (!current) return { updated: null, matched: false };
      if (current.status !== expectedPreviousStatus) {
        return { updated: null, matched: false };
      }
      return { updated: null, matched: false };
    }
    const updated = await this.prisma.shipment.findUnique({
      where: { id },
      include: { items: true, events: true },
    });
    return {
      updated: updated ? this.mapShipment(updated) : null,
      matched: true,
    };
  }

  /**
   * Atomic transition runner — fetches shipment, executes state machine validation,
   * and conditionally persists inside a single DB transaction with row-level guard.
   * Used by services to ensure idempotency and race safety without caller-side TOCTOU.
   */
  async transitionShipmentAtomic(
    id: string,
    newStatus: ShipmentStatus,
    actorType: ActorType,
    actorId: string | null,
    reason?: string,
    metadata?: Record<string, unknown>,
  ): Promise<{
    result: import('./types').StateTransitionResult;
    shipment: Shipment | null;
  }> {
    const { shipmentStateMachine } = await import('./state-machine');
    const shipment = await this.getShipmentById(id);
    if (!shipment) {
      return {
        result: {
          success: false,
          previousStatus: ShipmentStatus.SHIPMENT_CREATED,
          newStatus,
          error: 'Shipment not found',
        },
        shipment: null,
      };
    }
    const validation = shipmentStateMachine.transition(
      shipment.status as ShipmentStatus,
      newStatus,
      actorType,
      actorId ?? undefined,
      reason,
    );
    if (!validation.success) {
      return { result: validation, shipment: null };
    }
    const shippedAt =
      newStatus === ShipmentStatus.PICKED_UP ||
      newStatus === ShipmentStatus.IN_TRANSIT
        ? new Date()
        : undefined;
    const deliveredAt =
      newStatus === ShipmentStatus.DELIVERED ? new Date() : undefined;
    const { matched, updated } = await this.updateShipmentStatusAtomic(
      id,
      shipment.status as ShipmentStatus,
      newStatus,
      shippedAt,
      deliveredAt,
    );
    if (!matched || !updated) {
      return {
        result: {
          success: false,
          previousStatus: shipment.status as ShipmentStatus,
          newStatus,
          error:
            'Concurrent transition conflict: shipment status changed before update could be applied',
        },
        shipment: null,
      };
    }
    await this.addShipmentEvent(
      id,
      newStatus as unknown as TrackingEventType,
      null,
      reason || `Status updated to ${newStatus}`,
      actorType,
      actorId,
      metadata,
    );
    return {
      result: {
        success: true,
        previousStatus: shipment.status as ShipmentStatus,
        newStatus,
      },
      shipment: updated,
    };
  }

  /**
   * Update shipment tracking number
   */
  async updateShipmentTrackingNumber(
    id: string,
    trackingNumber: string,
    carrierCode: string | null,
  ): Promise<Shipment> {
    const carrierTypeEnum = carrierCode ? (carrierCode as CarrierType) : null;
    const shipment = await this.prisma.shipment.update({
      where: { id },
      data: {
        trackingNumber,
        carrierCode: carrierTypeEnum,
        carrierName: carrierTypeEnum
          ? this.getCarrierName(carrierTypeEnum)
          : null,
      },
      include: {
        items: true,
        events: true,
      },
    });

    return this.mapShipment(shipment);
  }

  /**
   * Query shipments with filters
   */
  async queryShipments(options: ShipmentFilterOptions): Promise<Shipment[]> {
    const where: Record<string, unknown> = { isActive: true };

    if (options.orderId) where.orderId = options.orderId;
    if (options.status) where.status = options.status;
    if (options.carrierCode) where.carrierCode = options.carrierCode;
    if (options.trackingNumber) where.trackingNumber = options.trackingNumber;
    if (options.dateFrom || options.dateTo) {
      where.createdAt = {};
      if (options.dateFrom)
        (where.createdAt as Record<string, Date>).gte = options.dateFrom;
      if (options.dateTo)
        (where.createdAt as Record<string, Date>).lte = options.dateTo;
    }

    const shipments = await this.prisma.shipment.findMany({
      where,
      include: {
        items: true,
        events: true,
      },
      orderBy: { createdAt: 'desc' },
      take: options.limit,
      skip: options.offset,
    });

    return shipments.map((s: any) => this.mapShipment(s));
  }

  /**
   * Soft delete a shipment
   */
  async deleteShipment(id: string): Promise<void> {
    await this.prisma.shipment.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Shipment Event Operations
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Add a tracking event to a shipment
   */
  async addShipmentEvent(
    shipmentId: string,
    status: TrackingEventType,
    location: string | null,
    description: string,
    actorType: ActorType,
    actorId: string | null,
    metadata?: Record<string, unknown>,
  ): Promise<ShipmentEvent> {
    const event = await this.prisma.shipmentEvent.create({
      data: {
        shipmentId,
        status,
        location,
        description,
        actorType,
        actorId,
        metadata,
      },
    });

    return this.mapShipmentEvent(event);
  }

  /**
   * Get events for a shipment
   */
  async getShipmentEvents(shipmentId: string): Promise<ShipmentEvent[]> {
    const events = await this.prisma.shipmentEvent.findMany({
      where: { shipmentId },
      orderBy: { createdAt: 'desc' },
    });

    return events.map((e: any) => this.mapShipmentEvent(e));
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Carrier Operations
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Get all carriers
   */
  async getCarriers(): Promise<Carrier[]> {
    const carriers = await this.prisma.carrier.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    return carriers.map((c: any) => this.mapCarrier(c));
  }

  /**
   * Get a carrier by code
   */
  async getCarrierByCode(code: CarrierType): Promise<Carrier | null> {
    const carrier = await this.prisma.carrier.findUnique({
      where: { code },
    });

    return carrier ? this.mapCarrier(carrier) : null;
  }

  /**
   * Create a carrier
   */
  async createCarrier(
    code: CarrierType,
    name: string,
    displayName: string,
    config: Record<string, unknown>,
    trackingUrlTemplate?: string,
  ): Promise<Carrier> {
    const carrier = await this.prisma.carrier.create({
      data: {
        code,
        name,
        displayName,
        status: CarrierStatus.ACTIVE,
        apiEnabled: false,
        config,
        trackingUrlTemplate,
      },
    });

    return this.mapCarrier(carrier);
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Fulfillment Queue Operations
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Add an item to the fulfillment queue
   */
  async addToFulfillmentQueue(
    orderId: string,
    shipmentId: string | null,
    priority: number = 0,
  ): Promise<FulfillmentQueueItem> {
    const queueItem = await this.prisma.fulfillmentQueue.create({
      data: {
        orderId,
        shipmentId,
        status: FulfillmentStatus.PENDING,
        priority,
      },
    });

    return this.mapFulfillmentQueueItem(queueItem);
  }

  /**
   * Query fulfillment queue with filters
   */
  async queryFulfillmentQueue(
    options: FulfillmentFilterOptions,
  ): Promise<FulfillmentQueueItem[]> {
    const where: Record<string, unknown> = { isActive: true };

    if (options.status) where.status = options.status;
    if (options.assignedTo) where.assignedTo = options.assignedTo;
    if (options.dateFrom || options.dateTo) {
      where.createdAt = {};
      if (options.dateFrom)
        (where.createdAt as Record<string, Date>).gte = options.dateFrom;
      if (options.dateTo)
        (where.createdAt as Record<string, Date>).lte = options.dateTo;
    }

    const queueItems = await this.prisma.fulfillmentQueue.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
      take: options.limit,
      skip: options.offset,
    });

    return queueItems.map((q: any) => this.mapFulfillmentQueueItem(q));
  }

  /**
   * Update fulfillment queue item status
   */
  async updateFulfillmentQueueItem(
    id: string,
    status: FulfillmentStatus,
    assignedTo?: string,
    startedAt?: Date,
    completedAt?: Date,
  ): Promise<FulfillmentQueueItem> {
    const queueItem = await this.prisma.fulfillmentQueue.update({
      where: { id },
      data: {
        status,
        assignedTo,
        startedAt,
        completedAt,
      },
    });

    return this.mapFulfillmentQueueItem(queueItem);
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Pick List Operations
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Create pick list items for a fulfillment queue item
   */
  async createPickListItems(
    fulfillmentQueueId: string,
    items: Array<{
      variantId: string;
      variantSku: string;
      productName: string;
      quantity: number;
      location: string;
    }>,
  ): Promise<PickListItem[]> {
    await this.prisma.pickListItem.createMany({
      data: items.map((item) => ({
        fulfillmentQueueId,
        variantId: item.variantId,
        variantSku: item.variantSku,
        productName: item.productName,
        quantity: item.quantity,
        location: item.location,
      })),
    });

    // Fetch and return the created items
    const pickListItems = await this.prisma.pickListItem.findMany({
      where: { fulfillmentQueueId },
    });

    return pickListItems.map((p: any) => this.mapPickListItem(p));
  }

  /**
   * Mark a pick list item as picked
   */
  async markPickListItemPicked(
    id: string,
    pickedBy: string,
  ): Promise<PickListItem> {
    const pickListItem = await this.prisma.pickListItem.update({
      where: { id },
      data: {
        picked: true,
        pickedAt: new Date(),
        pickedBy,
      },
    });

    return this.mapPickListItem(pickListItem);
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Shipping Label Operations
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Create a shipping label record
   */
  async createShippingLabel(
    shipmentId: string,
    carrierCode: CarrierType,
    trackingNumber: string,
    labelUrl: string | null,
    labelData: string | null,
    generatedBy: string,
  ): Promise<ShippingLabel> {
    const label = await this.prisma.shippingLabel.create({
      data: {
        shipmentId,
        carrierCode,
        trackingNumber,
        labelUrl,
        labelData,
        status: LabelGenerationStatus.SUCCESS,
        generatedBy,
      },
    });

    return this.mapShippingLabel(label);
  }

  /**
   * Get shipping label for a shipment
   */
  async getShippingLabel(shipmentId: string): Promise<ShippingLabel | null> {
    const label = await this.prisma.shippingLabel.findUnique({
      where: { shipmentId },
    });

    return label ? this.mapShippingLabel(label) : null;
  }

  /**
   * Get shipment items for a shipment
   */
  async getShipmentItems(shipmentId: string): Promise<any[]> {
    const items = await this.prisma.shipmentItem.findMany({
      where: { shipmentId },
    });

    return items;
  }

  /**
   * Get pick list items by fulfillment queue ID
   */
  async getPickListItemsByQueue(
    fulfillmentQueueId: string,
  ): Promise<PickListItem[]> {
    const items = await this.prisma.pickListItem.findMany({
      where: { fulfillmentQueueId },
    });

    return items.map((p: any) => this.mapPickListItem(p));
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Shipping Exception Operations
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Create a shipping exception
   */
  async createShippingException(
    shipmentId: string,
    exceptionType: ExceptionType,
    description: string,
  ): Promise<ShippingException> {
    const exception = await this.prisma.shippingException.create({
      data: {
        shipmentId,
        exceptionType,
        description,
        resolved: false,
      },
    });

    return this.mapShippingException(exception);
  }

  /**
   * Resolve a shipping exception
   */
  async resolveShippingException(
    id: string,
    resolvedBy: string,
    resolution: string,
  ): Promise<ShippingException> {
    const exception = await this.prisma.shippingException.update({
      where: { id },
      data: {
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy,
        resolution,
      },
    });

    return this.mapShippingException(exception);
  }

  /**
   * Get exceptions for a shipment
   */
  async getShipmentExceptions(
    shipmentId: string,
  ): Promise<ShippingException[]> {
    const exceptions = await this.prisma.shippingException.findMany({
      where: { shipmentId },
      orderBy: { createdAt: 'desc' },
    });

    return exceptions.map((e: any) => this.mapShippingException(e));
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Delivery Confirmation Operations
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Create a delivery confirmation
   */
  async createDeliveryConfirmation(
    shipmentId: string,
    confirmationType: string,
    confirmedBy: string,
    signature?: string,
    photoUrl?: string,
    otp?: string,
  ): Promise<DeliveryConfirmation> {
    const confirmation = await this.prisma.deliveryConfirmation.create({
      data: {
        shipmentId,
        confirmationType,
        confirmedBy,
        signature,
        photoUrl,
        otp,
      },
    });

    return this.mapDeliveryConfirmation(confirmation);
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Helper Methods
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Calculate total weight from shipment items
   */
  private calculateTotalWeight(
    items: Array<{ quantity: number; unitPrice: number }>,
  ): number {
    // This is a simplified calculation
    // In a real implementation, you would fetch the actual weight from the product/variant
    return items.reduce((total, item) => total + item.quantity * 100, 0); // Assume 100g per item
  }

  /**
   * Get carrier name from carrier code
   */
  private getCarrierName(code: CarrierType): string {
    const names: Record<CarrierType, string> = {
      [CarrierType.MANUAL]: 'Manual',
      [CarrierType.SHIPROCKET]: 'Shiprocket',
      [CarrierType.DELHIVERY]: 'Delhivery',
      [CarrierType.BLUEDART]: 'BlueDart',
      [CarrierType.DTDC]: 'DTDC',
      [CarrierType.EKART]: 'Ekart',
      [CarrierType.INDIA_POST]: 'India Post',
      [CarrierType.DHL]: 'DHL',
      [CarrierType.FEDEX]: 'FedEx',
      [CarrierType.UPS]: 'UPS',
      [CarrierType.CUSTOM]: 'Custom',
    };
    return names[code] || 'Unknown';
  }

  /**
   * Map Prisma shipment to domain shipment
   */
  private mapShipment(prismaShipment: any): Shipment {
    return {
      id: prismaShipment.id,
      orderId: prismaShipment.orderId,
      status: prismaShipment.status as ShipmentStatus,
      trackingNumber: prismaShipment.trackingNumber,
      carrierCode: prismaShipment.carrierCode,
      carrierName: prismaShipment.carrierName,
      shippingMethod: prismaShipment.shippingMethod as ShippingMethod,
      estimatedDeliveryDate: prismaShipment.estimatedDeliveryDate,
      actualDeliveryDate: prismaShipment.actualDeliveryDate,
      shippedAt: prismaShipment.shippedAt,
      deliveredAt: prismaShipment.deliveredAt,
      weight: prismaShipment.weight,
      dimensions: {
        length: prismaShipment.length,
        width: prismaShipment.width,
        height: prismaShipment.height,
      },
      shippingAddress: prismaShipment.shippingAddress as any,
      shippingCost: Number(prismaShipment.shippingCost),
      isActive: prismaShipment.isActive,
      createdAt: prismaShipment.createdAt,
      updatedAt: prismaShipment.updatedAt,
    };
  }

  /**
   * Map Prisma shipment event to domain shipment event
   */
  private mapShipmentEvent(prismaEvent: any): ShipmentEvent {
    return {
      id: prismaEvent.id,
      shipmentId: prismaEvent.shipmentId,
      status: prismaEvent.status as TrackingEventType,
      location: prismaEvent.location,
      description: prismaEvent.description,
      actorType: prismaEvent.actorType as ActorType,
      actorId: prismaEvent.actorId,
      metadata: prismaEvent.metadata as Record<string, unknown> | null,
      createdAt: prismaEvent.createdAt,
    };
  }

  /**
   * Map Prisma carrier to domain carrier
   */
  private mapCarrier(prismaCarrier: any): Carrier {
    return {
      id: prismaCarrier.id,
      code: prismaCarrier.code as CarrierType,
      name: prismaCarrier.name,
      displayName: prismaCarrier.displayName,
      status: prismaCarrier.status as CarrierStatus,
      apiEnabled: prismaCarrier.apiEnabled,
      config: prismaCarrier.config as any,
      trackingUrlTemplate: prismaCarrier.trackingUrlTemplate,
      isActive: prismaCarrier.isActive,
      createdAt: prismaCarrier.createdAt,
      updatedAt: prismaCarrier.updatedAt,
    };
  }

  /**
   * Map Prisma fulfillment queue item to domain fulfillment queue item
   */
  private mapFulfillmentQueueItem(prismaItem: any): FulfillmentQueueItem {
    return {
      id: prismaItem.id,
      orderId: prismaItem.orderId,
      shipmentId: prismaItem.shipmentId,
      status: prismaItem.status as FulfillmentStatus,
      priority: prismaItem.priority,
      assignedTo: prismaItem.assignedTo,
      assignedAt: prismaItem.assignedAt,
      startedAt: prismaItem.startedAt,
      completedAt: prismaItem.completedAt,
      metadata: prismaItem.metadata as Record<string, unknown> | null,
      createdAt: prismaItem.createdAt,
      updatedAt: prismaItem.updatedAt,
    };
  }

  /**
   * Map Prisma pick list item to domain pick list item
   */
  private mapPickListItem(prismaItem: any): PickListItem {
    return {
      id: prismaItem.id,
      fulfillmentQueueId: prismaItem.fulfillmentQueueId,
      variantId: prismaItem.variantId,
      variantSku: prismaItem.variantSku,
      productName: prismaItem.productName,
      quantity: prismaItem.quantity,
      location: prismaItem.location,
      picked: prismaItem.picked,
      pickedAt: prismaItem.pickedAt,
      pickedBy: prismaItem.pickedBy,
      createdAt: prismaItem.createdAt,
    };
  }

  /**
   * Map Prisma shipping label to domain shipping label
   */
  private mapShippingLabel(prismaLabel: any): ShippingLabel {
    return {
      id: prismaLabel.id,
      shipmentId: prismaLabel.shipmentId,
      carrierCode: prismaLabel.carrierCode as CarrierType,
      trackingNumber: prismaLabel.trackingNumber,
      labelUrl: prismaLabel.labelUrl,
      labelData: prismaLabel.labelData || '',
      status: prismaLabel.status as LabelGenerationStatus,
      generatedAt: prismaLabel.generatedAt,
      generatedBy: prismaLabel.generatedBy,
    };
  }

  /**
   * Map Prisma shipping exception to domain shipping exception
   */
  private mapShippingException(prismaException: any): ShippingException {
    return {
      id: prismaException.id,
      shipmentId: prismaException.shipmentId,
      exceptionType: prismaException.exceptionType as ExceptionType,
      description: prismaException.description,
      resolved: prismaException.resolved,
      resolvedAt: prismaException.resolvedAt,
      resolvedBy: prismaException.resolvedBy,
      resolution: prismaException.resolution,
      metadata: prismaException.metadata as Record<string, unknown> | null,
      createdAt: prismaException.createdAt,
      updatedAt: prismaException.updatedAt,
    };
  }

  /**
   * Map Prisma delivery confirmation to domain delivery confirmation
   */
  private mapDeliveryConfirmation(
    prismaConfirmation: any,
  ): DeliveryConfirmation {
    return {
      id: prismaConfirmation.id,
      shipmentId: prismaConfirmation.shipmentId,
      confirmationType: prismaConfirmation.confirmationType as any,
      confirmedAt: prismaConfirmation.confirmedAt,
      confirmedBy: prismaConfirmation.confirmedBy,
      signature: prismaConfirmation.signature,
      photoUrl: prismaConfirmation.photoUrl,
      otp: prismaConfirmation.otp,
      metadata: prismaConfirmation.metadata as Record<string, unknown> | null,
    };
  }
}
