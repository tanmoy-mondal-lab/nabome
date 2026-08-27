/**
 * Inspections Service - Business Logic Layer
 *
 * This service handles inspection of returned items, determining their condition
 * and appropriate disposition (restock, refurbish, repair, dispose).
 */

import { inspectionsRepository, returnsRepository } from '../repository';
import { InspectionInput, Inspection } from '../types';
import { InspectionResult, ReturnStatus } from '../enums';

export class InspectionsService {
  /**
   * Create inspection record
   */
  async createInspection(
    input: InspectionInput & {
      returnRequestId: string;
      inspectedBy: string;
    },
  ): Promise<Inspection> {
    const inspection = await inspectionsRepository.createInspection(input);

    // Update return item with inspection result
    await this.updateReturnItemInspection(
      input.returnItemId,
      input.result,
      input.failureReason,
    );

    return inspection;
  }

  /**
   * Update return item with inspection result
   */
  private async updateReturnItemInspection(
    returnItemId: string,
    result: InspectionResult,
    failureReason?: string,
  ): Promise<void> {
    // This would update the ReturnItem record
    console.log(
      `Updating return item ${returnItemId} with inspection result: ${result}`,
    );

    // In production, this would call:
    // await returnItemsRepository.update(returnItemId, {
    //   inspectionResult: result,
    //   inspectionFailureReason: failureReason,
    //   inspectedAt: new Date(),
    // });
  }

  /**
   * Complete inspection for all items in a return
   */
  async completeReturnInspection(
    returnRequestId: string,
    inspectedBy: string,
  ): Promise<void> {
    const returnRequest = await returnsRepository.findById(returnRequestId);

    if (!returnRequest) {
      throw new Error('Return request not found');
    }

    // Check if all items have been inspected
    const allInspected = returnRequest.items.every(
      (item) =>
        item.inspectionResult !== undefined && item.inspectionResult !== null,
    );

    if (!allInspected) {
      throw new Error('Not all items have been inspected');
    }

    // Determine overall inspection result
    const hasFailed = returnRequest.items.some(
      (item) => item.inspectionResult === InspectionResult.FAILED,
    );
    const hasPassed = returnRequest.items.some(
      (item) => item.inspectionResult === InspectionResult.PASSED,
    );

    let overallResult: ReturnStatus;
    if (hasFailed && !hasPassed) {
      overallResult = ReturnStatus.INSPECTION_FAILED;
    } else if (hasPassed && !hasFailed) {
      overallResult = ReturnStatus.INSPECTION_PASSED;
    } else {
      overallResult = ReturnStatus.INSPECTION_PASSED; // Partial pass treated as pass
    }

    // Update return request status
    await returnsRepository.updateStatus(returnRequestId, {
      returnRequestId,
      toStatus: overallResult,
      reason: 'Inspection completed',
      actorId: inspectedBy,
      actorType: 'warehouse_staff',
    });

    // If inspection passed, initiate refund process
    if (overallResult === ReturnStatus.INSPECTION_PASSED) {
      await this.initiateRefundAfterInspection(returnRequestId);
    }
  }

  /**
   * Initiate refund after successful inspection
   */
  private async initiateRefundAfterInspection(
    returnRequestId: string,
  ): Promise<void> {
    console.log(
      `Initiating refund after inspection for return: ${returnRequestId}`,
    );

    // In production, this would call:
    // await refundsService.createRefund({
    //   returnRequestId,
    //   amount: calculatedAmount,
    //   method: refundMethod,
    //   reason: 'Inspection passed',
    // });
  }

  /**
   * Get inspection by ID
   */
  async getInspection(inspectionId: string): Promise<Inspection | null> {
    return await inspectionsRepository.findById(inspectionId);
  }

  /**
   * Get inspections for return request
   */
  async getReturnInspections(returnRequestId: string): Promise<Inspection[]> {
    return await inspectionsRepository.findByReturnRequestId(returnRequestId);
  }

  /**
   * Get inspections for return item
   */
  async getItemInspections(returnItemId: string): Promise<Inspection[]> {
    return await inspectionsRepository.findByReturnItemId(returnItemId);
  }

  /**
   * Get pending inspections
   */
  async getPendingInspections(warehouseId?: string): Promise<Inspection[]> {
    return await inspectionsRepository.getPendingInspections(warehouseId);
  }

  /**
   * Get inspection statistics
   */
  async getStatistics(startDate?: Date, endDate?: Date): Promise<any> {
    return await inspectionsRepository.getStatistics(startDate, endDate);
  }

  /**
   * Determine disposition based on inspection result
   */
  determineDisposition(
    result: InspectionResult,
    restockable: boolean,
    refurbishable: boolean,
    repairable: boolean,
  ): string {
    if (result === InspectionResult.PASSED && restockable) {
      return 'restock';
    }
    if (result === InspectionResult.PASSED && refurbishable) {
      return 'refurbish';
    }
    if (result === InspectionResult.PASSED && repairable) {
      return 'repair';
    }
    if (result === InspectionResult.FAILED) {
      return 'dispose';
    }
    return 'hold';
  }
}

export const inspectionsService = new InspectionsService();
