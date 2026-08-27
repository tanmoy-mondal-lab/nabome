/**
 * Reverse Logistics Service - Business Logic Layer
 *
 * This service handles all reverse logistics operations including pickup scheduling,
 * return shipment tracking, warehouse receipt, and disposition.
 */

import { reverseLogisticsRepository, returnsRepository } from '../repository';
import { SchedulePickupInput, ReverseLogistics } from '../types';
import { ReverseLogisticsStatus, ReturnStatus } from '../enums';

export class ReverseLogisticsService {
  /**
   * Initialize reverse logistics for a return request
   */
  async initializeReverseLogistics(
    returnRequestId: string,
    pickupAddress: SchedulePickupInput['pickupAddress'],
  ): Promise<ReverseLogistics> {
    const returnRequest = await returnsRepository.findById(returnRequestId);

    if (!returnRequest) {
      throw new Error('Return request not found');
    }

    // Check if reverse logistics already exists
    const existing =
      await reverseLogisticsRepository.findByReturnRequestId(returnRequestId);
    if (existing) {
      return existing;
    }

    // Create reverse logistics record
    const reverseLogistics =
      await reverseLogisticsRepository.createReverseLogistics(
        returnRequestId,
        pickupAddress,
      );

    // Update return request status
    await returnsRepository.updateStatus(returnRequestId, {
      returnRequestId,
      toStatus: ReturnStatus.PICKUP_SCHEDULED,
      reason: 'Reverse logistics initialized',
      actorId: 'system',
      actorType: 'system',
    });

    return reverseLogistics;
  }

  /**
   * Schedule pickup for return
   */
  async schedulePickup(
    returnRequestId: string,
    courier: string,
    trackingNumber: string,
    scheduledDate: Date,
  ): Promise<ReverseLogistics> {
    const reverseLogistics =
      await reverseLogisticsRepository.findByReturnRequestId(returnRequestId);

    if (!reverseLogistics) {
      throw new Error('Reverse logistics record not found');
    }

    const updated = await reverseLogisticsRepository.schedulePickup(
      reverseLogistics.id,
      courier,
      trackingNumber,
      scheduledDate,
    );

    // Generate return label (would integrate with Shipping module)
    await this.generateReturnLabel(returnRequestId, trackingNumber);

    return updated;
  }

  /**
   * Generate return shipping label
   * Integration point with Shipping Engine
   */
  private async generateReturnLabel(
    returnRequestId: string,
    trackingNumber: string,
  ): Promise<void> {
    console.log(
      `Generating return label for return: ${returnRequestId}, tracking: ${trackingNumber}`,
    );

    // In production, this would call:
    // await shippingService.generateReturnLabel({
    //   returnRequestId,
    //   trackingNumber,
    // });
  }

  /**
   * Mark pickup as completed
   */
  async completePickup(returnRequestId: string): Promise<ReverseLogistics> {
    const reverseLogistics =
      await reverseLogisticsRepository.findByReturnRequestId(returnRequestId);

    if (!reverseLogistics) {
      throw new Error('Reverse logistics record not found');
    }

    const updated = await reverseLogisticsRepository.completePickup(
      reverseLogistics.id,
    );

    // Update return request status
    await returnsRepository.updateStatus(returnRequestId, {
      returnRequestId,
      toStatus: ReturnStatus.PICKUP_COMPLETED,
      reason: 'Pickup completed',
      actorId: 'system',
      actorType: 'courier',
    });

    return updated;
  }

  /**
   * Mark warehouse receipt
   */
  async markWarehouseReceipt(
    returnRequestId: string,
    warehouseId: string,
  ): Promise<ReverseLogistics> {
    const reverseLogistics =
      await reverseLogisticsRepository.findByReturnRequestId(returnRequestId);

    if (!reverseLogistics) {
      throw new Error('Reverse logistics record not found');
    }

    const updated = await reverseLogisticsRepository.markWarehouseReceipt(
      reverseLogistics.id,
      warehouseId,
    );

    // Queue for inspection
    await this.queueForInspection(returnRequestId);

    return updated;
  }

  /**
   * Queue return for inspection
   */
  async queueForInspection(returnRequestId: string): Promise<ReverseLogistics> {
    const reverseLogistics =
      await reverseLogisticsRepository.findByReturnRequestId(returnRequestId);

    if (!reverseLogistics) {
      throw new Error('Reverse logistics record not found');
    }

    const updated = await reverseLogisticsRepository.queueForInspection(
      reverseLogistics.id,
    );

    // Update return request status
    await returnsRepository.updateStatus(returnRequestId, {
      returnRequestId,
      toStatus: ReturnStatus.IN_INSPECTION,
      reason: 'Queued for inspection',
      actorId: 'system',
      actorType: 'warehouse_staff',
    });

    return updated;
  }

  /**
   * Start inspection
   */
  async startInspection(returnRequestId: string): Promise<ReverseLogistics> {
    const reverseLogistics =
      await reverseLogisticsRepository.findByReturnRequestId(returnRequestId);

    if (!reverseLogistics) {
      throw new Error('Reverse logistics record not found');
    }

    return await reverseLogisticsRepository.startInspection(
      reverseLogistics.id,
    );
  }

  /**
   * Complete inspection
   */
  async completeInspection(returnRequestId: string): Promise<ReverseLogistics> {
    const reverseLogistics =
      await reverseLogisticsRepository.findByReturnRequestId(returnRequestId);

    if (!reverseLogistics) {
      throw new Error('Reverse logistics record not found');
    }

    return await reverseLogisticsRepository.completeInspection(
      reverseLogistics.id,
    );
  }

  /**
   * Start restocking
   */
  async startRestocking(returnRequestId: string): Promise<ReverseLogistics> {
    const reverseLogistics =
      await reverseLogisticsRepository.findByReturnRequestId(returnRequestId);

    if (!reverseLogistics) {
      throw new Error('Reverse logistics record not found');
    }

    return await reverseLogisticsRepository.startRestocking(
      reverseLogistics.id,
    );
  }

  /**
   * Complete restocking
   * Integration point with Inventory Engine
   */
  async completeRestocking(returnRequestId: string): Promise<ReverseLogistics> {
    const reverseLogistics =
      await reverseLogisticsRepository.findByReturnRequestId(returnRequestId);

    if (!reverseLogistics) {
      throw new Error('Reverse logistics record not found');
    }

    const updated = await reverseLogisticsRepository.completeRestocking(
      reverseLogistics.id,
    );

    // Update inventory (would integrate with Inventory module)
    await this.updateInventoryForRestocking(returnRequestId);

    return updated;
  }

  /**
   * Update inventory for restocked items
   * Integration point with Inventory Engine
   */
  private async updateInventoryForRestocking(
    returnRequestId: string,
  ): Promise<void> {
    console.log(`Updating inventory for restocked return: ${returnRequestId}`);

    // In production, this would call:
    // await inventoryService.addStockMovement({
    //   type: StockMovementType.RETURN,
    //   items: returnItems,
    //   referenceId: returnRequestId,
    //   referenceType: 'return_request',
    // });
  }

  /**
   * Process disposal of non-restockable items
   */
  async processDisposal(
    returnRequestId: string,
    reason: string,
  ): Promise<ReverseLogistics> {
    const reverseLogistics =
      await reverseLogisticsRepository.findByReturnRequestId(returnRequestId);

    if (!reverseLogistics) {
      throw new Error('Reverse logistics record not found');
    }

    const updated = await reverseLogisticsRepository.updateStatus(
      reverseLogistics.id,
      ReverseLogisticsStatus.DISPOSAL,
      {
        disposalCompletedAt: new Date(),
        completedAt: new Date(),
      },
    );

    // Log disposal in inventory (would integrate with Inventory module)
    await this.logDisposalInInventory(returnRequestId, reason);

    return updated;
  }

  /**
   * Log disposal in inventory
   * Integration point with Inventory Engine
   */
  private async logDisposalInInventory(
    returnRequestId: string,
    reason: string,
  ): Promise<void> {
    console.log(
      `Logging disposal for return: ${returnRequestId}, reason: ${reason}`,
    );

    // In production, this would call:
    // await inventoryService.addStockMovement({
    //   type: StockMovementType.DAMAGE,
    //   items: returnItems,
    //   referenceId: returnRequestId,
    //   referenceType: 'return_disposal',
    //   reason,
    // });
  }

  /**
   * Get reverse logistics by return request ID
   */
  async getReverseLogistics(
    returnRequestId: string,
  ): Promise<ReverseLogistics | null> {
    return await reverseLogisticsRepository.findByReturnRequestId(
      returnRequestId,
    );
  }

  /**
   * Get pending pickups
   */
  async getPendingPickups(): Promise<ReverseLogistics[]> {
    return await reverseLogisticsRepository.getPendingPickups();
  }

  /**
   * Get in-transit returns
   */
  async getInTransitReturns(): Promise<ReverseLogistics[]> {
    return await reverseLogisticsRepository.getInTransitReturns();
  }

  /**
   * Get warehouse pending receipts
   */
  async getWarehousePendingReceipts(
    warehouseId?: string,
  ): Promise<ReverseLogistics[]> {
    return await reverseLogisticsRepository.getWarehousePendingReceipts(
      warehouseId,
    );
  }

  /**
   * Get reverse logistics statistics
   */
  async getStatistics(startDate?: Date, endDate?: Date): Promise<any> {
    return await reverseLogisticsRepository.getStatistics(startDate, endDate);
  }
}

export const reverseLogisticsService = new ReverseLogisticsService();
