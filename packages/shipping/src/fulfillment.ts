/**
 * Fulfillment Service
 *
 * This file implements the fulfillment service with queue and workflows.
 * Handles packing workflows, pick lists, and fulfillment queue management.
 *
 * Source: SHIPPING_DELIVERY_LOGISTICS_ARCHITECTURE.md (binding)
 */

// @ts-ignore - Prisma client will be generated after schema migration
import type { PrismaClient } from '@prisma/client';

import { FulfillmentStatus, type ActorType } from './enums';
import { ShipmentRepository } from './repository';
import type {
  FulfillmentQueueItem,
  PickListItem,
  FulfillmentFilterOptions,
  PackingSlip,
  PackingSlipItem,
} from './types';

/**
 * Fulfillment Service
 *
 * Manages the fulfillment workflow including queue management, pick lists,
 * and packing operations.
 */
export class FulfillmentService {
  private repository: ShipmentRepository;

  constructor(prisma: PrismaClient) {
    this.repository = new ShipmentRepository(prisma);
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Fulfillment Queue Management
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Add an order to the fulfillment queue
   */
  async addToFulfillmentQueue(
    orderId: string,
    shipmentId: string | null,
    priority: number = 0,
  ): Promise<FulfillmentQueueItem> {
    return this.repository.addToFulfillmentQueue(orderId, shipmentId, priority);
  }

  /**
   * Get pending fulfillment queue items
   */
  async getPendingFulfillmentQueue(
    options?: FulfillmentFilterOptions,
  ): Promise<FulfillmentQueueItem[]> {
    return this.repository.queryFulfillmentQueue({
      ...options,
      status: FulfillmentStatus.PENDING,
    });
  }

  /**
   * Get in-progress fulfillment queue items
   */
  async getInProgressFulfillmentQueue(
    options?: FulfillmentFilterOptions,
  ): Promise<FulfillmentQueueItem[]> {
    return this.repository.queryFulfillmentQueue({
      ...options,
      status: FulfillmentStatus.IN_PROGRESS,
    });
  }

  /**
   * Get completed fulfillment queue items
   */
  async getCompletedFulfillmentQueue(
    options?: FulfillmentFilterOptions,
  ): Promise<FulfillmentQueueItem[]> {
    return this.repository.queryFulfillmentQueue({
      ...options,
      status: FulfillmentStatus.COMPLETED,
    });
  }

  /**
   * Assign fulfillment queue item to a user
   */
  async assignFulfillmentItem(
    id: string,
    assignedTo: string,
  ): Promise<FulfillmentQueueItem> {
    return this.repository.updateFulfillmentQueueItem(
      id,
      FulfillmentStatus.IN_PROGRESS,
      assignedTo,
      new Date(),
    );
  }

  /**
   * Start fulfillment for a queue item
   */
  async startFulfillment(
    id: string,
    assignedTo: string,
  ): Promise<FulfillmentQueueItem> {
    return this.repository.updateFulfillmentQueueItem(
      id,
      FulfillmentStatus.IN_PROGRESS,
      assignedTo,
      new Date(),
    );
  }

  /**
   * Complete fulfillment for a queue item
   */
  async completeFulfillment(id: string): Promise<FulfillmentQueueItem> {
    return this.repository.updateFulfillmentQueueItem(
      id,
      FulfillmentStatus.COMPLETED,
      undefined,
      undefined,
      new Date(),
    );
  }

  /**
   * Fail fulfillment for a queue item
   */
  async failFulfillment(id: string): Promise<FulfillmentQueueItem> {
    return this.repository.updateFulfillmentQueueItem(
      id,
      FulfillmentStatus.FAILED,
    );
  }

  /**
   * Cancel fulfillment for a queue item
   */
  async cancelFulfillment(id: string): Promise<FulfillmentQueueItem> {
    return this.repository.updateFulfillmentQueueItem(
      id,
      FulfillmentStatus.CANCELLED,
    );
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Pick List Management
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Create pick list items for a fulfillment queue item
   */
  async createPickList(
    fulfillmentQueueId: string,
    items: Array<{
      variantId: string;
      variantSku: string;
      productName: string;
      quantity: number;
      location: string;
    }>,
  ): Promise<PickListItem[]> {
    return this.repository.createPickListItems(fulfillmentQueueId, items);
  }

  /**
   * Mark a pick list item as picked
   */
  async markItemPicked(id: string, pickedBy: string): Promise<PickListItem> {
    return this.repository.markPickListItemPicked(id, pickedBy);
  }

  /**
   * Check if all items in a pick list are picked
   */
  async isPickListComplete(fulfillmentQueueId: string): Promise<boolean> {
    const pickListItems =
      await this.getPickListItemsByQueue(fulfillmentQueueId);
    return pickListItems.every((item: PickListItem) => item.picked);
  }

  /**
   * Get pick list progress for a fulfillment queue item
   */
  async getPickListProgress(fulfillmentQueueId: string): Promise<{
    total: number;
    picked: number;
    percentage: number;
  }> {
    const pickListItems =
      await this.getPickListItemsByQueue(fulfillmentQueueId);
    const total = pickListItems.length;
    const picked = pickListItems.filter(
      (item: PickListItem) => item.picked,
    ).length;
    const percentage = total > 0 ? (picked / total) * 100 : 0;

    return { total, picked, percentage };
  }

  /**
   * Helper method to get pick list items by queue ID
   */
  private async getPickListItemsByQueue(
    fulfillmentQueueId: string,
  ): Promise<PickListItem[]> {
    return this.repository.getPickListItemsByQueue(fulfillmentQueueId);
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Packing Workflow
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Generate a packing slip for a shipment
   */
  async generatePackingSlip(
    shipmentId: string,
    generatedBy: string,
  ): Promise<PackingSlip> {
    const shipment = await this.repository.getShipmentById(shipmentId);
    if (!shipment) {
      throw new Error('Shipment not found');
    }

    // Get shipment items separately
    const shipmentItems = await this.repository.getShipmentItems(shipmentId);

    const items: PackingSlipItem[] = shipmentItems.map((item: any) => ({
      productName: item.productName,
      variantSku: item.variantSku,
      quantity: item.quantity,
      location: 'A1', // Would be fetched from inventory
    }));

    return {
      id: shipment.id,
      shipmentId: shipment.id,
      orderNumber: '', // Would be fetched from order
      items,
      shippingAddress: shipment.shippingAddress as any,
      carrier: shipment.carrierName || 'Manual',
      trackingNumber: shipment.trackingNumber || '',
      generatedAt: new Date(),
      generatedBy,
    };
  }

  /**
   * Complete packing workflow
   */
  async completePackingWorkflow(
    fulfillmentQueueId: string,
    _shipmentId: string,
    _actorType: ActorType,
    _actorId: string,
  ): Promise<void> {
    // Mark fulfillment as complete
    await this.completeFulfillment(fulfillmentQueueId);

    // Mark shipment as packed
    // This would integrate with ShipmentService
    // await shipmentService.markPacked(_shipmentId, _actorType, _actorId);
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Bulk Operations
  // ──────────────────────────────────────────────────────────────────────────────

  /**
   * Bulk assign fulfillment items to a user
   */
  async bulkAssignFulfillmentItems(
    ids: string[],
    assignedTo: string,
  ): Promise<FulfillmentQueueItem[]> {
    const results: FulfillmentQueueItem[] = [];
    for (const id of ids) {
      const item = await this.assignFulfillmentItem(id, assignedTo);
      results.push(item);
    }
    return results;
  }

  /**
   * Bulk complete fulfillment items
   */
  async bulkCompleteFulfillment(
    ids: string[],
  ): Promise<FulfillmentQueueItem[]> {
    const results: FulfillmentQueueItem[] = [];
    for (const id of ids) {
      const item = await this.completeFulfillment(id);
      results.push(item);
    }
    return results;
  }

  /**
   * Get fulfillment statistics
   */
  async getFulfillmentStatistics(): Promise<{
    pending: number;
    inProgress: number;
    completed: number;
    failed: number;
    cancelled: number;
  }> {
    const [pending, inProgress, completed, failed, cancelled] =
      await Promise.all([
        this.repository.queryFulfillmentQueue({
          status: FulfillmentStatus.PENDING,
          limit: 1000,
        }),
        this.repository.queryFulfillmentQueue({
          status: FulfillmentStatus.IN_PROGRESS,
          limit: 1000,
        }),
        this.repository.queryFulfillmentQueue({
          status: FulfillmentStatus.COMPLETED,
          limit: 1000,
        }),
        this.repository.queryFulfillmentQueue({
          status: FulfillmentStatus.FAILED,
          limit: 1000,
        }),
        this.repository.queryFulfillmentQueue({
          status: FulfillmentStatus.CANCELLED,
          limit: 1000,
        }),
      ]);

    return {
      pending: pending.length,
      inProgress: inProgress.length,
      completed: completed.length,
      failed: failed.length,
      cancelled: cancelled.length,
    };
  }
}

/**
 * Singleton instance of the fulfillment service
 * Note: In production, this would be instantiated with a Prisma client
 */
export const createFulfillmentService = (
  prisma: PrismaClient,
): FulfillmentService => {
  return new FulfillmentService(prisma);
};
