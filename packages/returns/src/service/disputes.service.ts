/**
 * Disputes Service - Business Logic Layer
 *
 * This service handles dispute resolution for returns, including escalation
 * workflows and final decision making.
 */

import { disputesRepository, returnsRepository } from '../repository';
import { CreateDisputeInput, UpdateDisputeInput, Dispute } from '../types';
import { DisputeStatus, ActorType } from '../enums';

export class DisputesService {
  /**
   * Create a new dispute
   */
  async createDispute(
    input: CreateDisputeInput & {
      orderId: string;
      profileId: string;
      shopId: string;
      raisedBy: string;
    },
  ): Promise<Dispute> {
    const returnRequest = await returnsRepository.findById(
      input.returnRequestId,
    );

    if (!returnRequest) {
      throw new Error('Return request not found');
    }

    // Check if dispute already exists for this return
    const existingDisputes = await disputesRepository.findByReturnRequestId(
      input.returnRequestId,
    );
    const openDispute = existingDisputes.find(
      (d) => d.status === DisputeStatus.OPEN,
    );

    if (openDispute) {
      throw new Error('An open dispute already exists for this return');
    }

    const dispute = await disputesRepository.createDispute(input);

    // Notify relevant parties (would integrate with Notification module)
    await this.notifyDisputeCreated(dispute);

    return dispute;
  }

  /**
   * Notify parties of dispute creation
   */
  private async notifyDisputeCreated(dispute: Dispute): Promise<void> {
    console.log(`Notifying parties of dispute creation: ${dispute.id}`);

    // In production, this would call:
    // await notificationService.send({
    //   type: 'dispute_created',
    //   recipients: [dispute.profileId, dispute.shopId],
    //   data: { disputeId: dispute.id },
    // });
  }

  /**
   * Update dispute
   */
  async updateDispute(
    disputeId: string,
    input: UpdateDisputeInput,
  ): Promise<Dispute> {
    const dispute = await disputesRepository.findById(disputeId);

    if (!dispute) {
      throw new Error('Dispute not found');
    }

    const updated = await disputesRepository.updateDispute(disputeId, input);

    // If resolved, notify parties
    if (input.resolution) {
      await this.notifyDisputeResolved(updated);
    }

    return updated;
  }

  /**
   * Notify parties of dispute resolution
   */
  private async notifyDisputeResolved(dispute: Dispute): Promise<void> {
    console.log(`Notifying parties of dispute resolution: ${dispute.id}`);

    // In production, this would call:
    // await notificationService.send({
    //   type: 'dispute_resolved',
    //   recipients: [dispute.profileId, dispute.shopId],
    //   data: { disputeId: dispute.id, resolution: dispute.resolution },
    // });
  }

  /**
   * Escalate dispute
   */
  async escalateDispute(
    disputeId: string,
    escalatedBy: string,
    escalationReason: string,
  ): Promise<Dispute> {
    const dispute = await disputesRepository.findById(disputeId);

    if (!dispute) {
      throw new Error('Dispute not found');
    }

    if (dispute.status === DisputeStatus.ESCALATED) {
      throw new Error('Dispute is already escalated');
    }

    const updated = await disputesRepository.escalateDispute(
      disputeId,
      escalatedBy,
      escalationReason,
    );

    // Notify admin team
    await this.notifyDisputeEscalated(updated);

    return updated;
  }

  /**
   * Notify admin team of escalation
   */
  private async notifyDisputeEscalated(dispute: Dispute): Promise<void> {
    console.log(`Notifying admin team of dispute escalation: ${dispute.id}`);

    // In production, this would call:
    // await notificationService.send({
    //   type: 'dispute_escalated',
    //   recipients: ['admin_team'],
    //   data: { disputeId: dispute.id },
    // });
  }

  /**
   * Add message to dispute
   */
  async addMessage(
    disputeId: string,
    senderId: string,
    senderType: ActorType,
    message: string,
    isInternal: boolean = false,
    attachments: string[] = [],
  ): Promise<any> {
    const dispute = await disputesRepository.findById(disputeId);

    if (!dispute) {
      throw new Error('Dispute not found');
    }

    if (dispute.status === DisputeStatus.CLOSED) {
      throw new Error('Cannot add messages to closed disputes');
    }

    const disputeMessage = await disputesRepository.addMessage(
      disputeId,
      senderId,
      senderType,
      message,
      isInternal,
      attachments,
    );

    // Notify relevant parties if not internal
    if (!isInternal) {
      await this.notifyDisputeMessage(dispute, senderId, senderType);
    }

    return disputeMessage;
  }

  /**
   * Notify parties of new dispute message
   */
  private async notifyDisputeMessage(
    dispute: Dispute,
    senderId: string,
    senderType: ActorType,
  ): Promise<void> {
    console.log(`Notifying parties of new message in dispute: ${dispute.id}`);

    // In production, this would call:
    // await notificationService.send({
    //   type: 'dispute_message',
    //   recipients: senderType === ActorType.CUSTOMER ? [dispute.shopId] : [dispute.profileId],
    //   data: { disputeId: dispute.id, senderId },
    // });
  }

  /**
   * Get dispute by ID
   */
  async getDispute(disputeId: string): Promise<Dispute | null> {
    return await disputesRepository.findById(disputeId);
  }

  /**
   * Get disputes for return request
   */
  async getReturnDisputes(returnRequestId: string): Promise<Dispute[]> {
    return await disputesRepository.findByReturnRequestId(returnRequestId);
  }

  /**
   * Get disputes for profile
   */
  async getProfileDisputes(profileId: string): Promise<Dispute[]> {
    return await disputesRepository.findByProfileId(profileId);
  }

  /**
   * Get disputes for shop
   */
  async getShopDisputes(shopId: string): Promise<Dispute[]> {
    return await disputesRepository.findByShopId(shopId);
  }

  /**
   * Get open disputes
   */
  async getOpenDisputes(shopId?: string): Promise<Dispute[]> {
    return await disputesRepository.getOpenDisputes(shopId);
  }

  /**
   * Get escalated disputes
   */
  async getEscalatedDisputes(): Promise<Dispute[]> {
    return await disputesRepository.getEscalatedDisputes();
  }

  /**
   * Get dispute statistics
   */
  async getStatistics(
    shopId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    return await disputesRepository.getStatistics(shopId, startDate, endDate);
  }
}

export const disputesService = new DisputesService();
