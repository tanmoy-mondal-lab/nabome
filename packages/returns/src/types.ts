/**
 * Returns, Refunds, Reverse Logistics & Dispute Resolution Types
 *
 * This file contains all TypeScript interfaces and types for the returns system.
 * All types follow the canonical conventions per MASTER_ARCHITECTURE_BLUEPRINT.md.
 */

import {
  ReturnStatus,
  ReturnType,
  ReturnReason,
  RefundMethod,
  RefundStatus,
  InspectionResult,
  InspectionFailureReason,
  DisputeStatus,
  DisputeResolution,
  ReturnPolicyType,
  ReverseLogisticsStatus,
  RestockStatus,
  DispositionAction,
  ActorType,
  ReturnEligibilityStatus,
  ReturnIneligibilityReason,
} from './enums';

/**
 * Return Request - Main return request entity
 */
export interface ReturnRequest {
  id: string;
  orderNumber: string;
  orderId: string;
  profileId: string;
  shopId: string;
  status: ReturnStatus;
  returnType: ReturnType;
  reason: ReturnReason;
  reasonDetail?: string;
  requestedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectedReason?: string;
  approvedBy?: string;
  rejectedBy?: string;
  totalRefundAmount: number;
  refundMethod: RefundMethod;
  refundStatus: RefundStatus;
  refundCompletedAt?: Date;
  refundGatewayRef?: string;
  customerNotes?: string;
  internalNotes?: string;
  evidenceUrls?: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Return Item - Individual item within a return request
 */
export interface ReturnItem {
  id: string;
  returnRequestId: string;
  orderItemId: string;
  variantId: string;
  productId: string;
  productName: string;
  variantSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  reason: ReturnReason;
  reasonDetail?: string;
  condition: string;
  inspectionResult?: InspectionResult;
  inspectionFailureReason?: InspectionFailureReason;
  inspectedAt?: Date;
  inspectedBy?: string;
  dispositionAction?: DispositionAction;
  restockStatus?: RestockStatus;
  restockedAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Refund - Refund record (compensating financial record)
 */
export interface Refund {
  id: string;
  returnRequestId: string;
  paymentId: string;
  orderId: string;
  profileId: string;
  shopId: string;
  amount: number;
  currency: string;
  status: RefundStatus;
  method: RefundMethod;
  reason: string;
  gatewayRef?: string;
  gatewayStatus?: string;
  initiatedAt: Date;
  completedAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  initiatedBy: string;
  completedBy?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ReturnRefund - Return-specific refund record (links to ReturnRequest)
 */
export interface ReturnRefund {
  id: string;
  returnRequestId: string;
  paymentId: string;
  orderId: string;
  profileId: string;
  shopId: string;
  amount: number;
  currency: string;
  status: RefundStatus;
  method: RefundMethod;
  reason: string;
  gatewayRef?: string;
  gatewayStatus?: string;
  initiatedAt: Date;
  completedAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  initiatedBy: string;
  completedBy?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Return Status History - Audit trail for return status changes
 */
export interface ReturnStatusHistory {
  id: string;
  returnRequestId: string;
  fromStatus: ReturnStatus;
  toStatus: ReturnStatus;
  actorId: string;
  actorType: ActorType;
  reason?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

/**
 * Inspection - Return inspection record
 */
export interface Inspection {
  id: string;
  returnRequestId: string;
  returnItemId: string;
  inspectedBy: string;
  inspectedAt: Date;
  result: InspectionResult;
  failureReason?: InspectionFailureReason;
  conditionNotes?: string;
  imageUrls?: string[];
  dispositionAction: DispositionAction;
  restockable: boolean;
  refurbishable: boolean;
  repairable: boolean;
  disposalReason?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Reverse Logistics - Reverse logistics operation record
 */
export interface ReverseLogistics {
  id: string;
  returnRequestId: string;
  status: ReverseLogisticsStatus;
  pickupAddress: {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  pickupScheduledAt?: Date;
  pickupCompletedAt?: Date;
  pickupCourier?: string;
  trackingNumber?: string;
  warehouseId?: string;
  warehouseReceivedAt?: Date;
  inspectionQueuedAt?: Date;
  inspectionStartedAt?: Date;
  inspectionCompletedAt?: Date;
  restockingStartedAt?: Date;
  restockingCompletedAt?: Date;
  disposalCompletedAt?: Date;
  completedAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Dispute - Dispute resolution record
 */
export interface Dispute {
  id: string;
  returnRequestId: string;
  orderId: string;
  profileId: string;
  shopId: string;
  status: DisputeStatus;
  raisedBy: string;
  raisedAt: Date;
  reason: string;
  reasonDetail?: string;
  resolution?: DisputeResolution;
  resolvedBy?: string;
  resolvedAt?: Date;
  resolutionNotes?: string;
  escalatedBy?: string;
  escalatedAt?: Date;
  escalationReason?: string;
  internalNotes?: string;
  customerVisibleNotes?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Dispute Message - Communication within a dispute
 */
export interface DisputeMessage {
  id: string;
  disputeId: string;
  senderId: string;
  senderType: ActorType;
  message: string;
  isInternal: boolean;
  attachments?: string[];
  createdAt: Date;
}

/**
 * Return Policy - Return policy configuration
 */
export interface ReturnPolicy {
  id: string;
  shopId: string;
  policyType: ReturnPolicyType;
  name: string;
  description?: string;
  returnWindowDays: number;
  eligibleProductCategories?: string[];
  ineligibleProductCategories?: string[];
  requiresApproval: boolean;
  requiresOriginalPackaging: boolean;
  requiresProofOfPurchase: boolean;
  customerPaysReturnShipping: boolean;
  restockingFeePercentage?: number;
  maxReturnsPerOrder?: number;
  maxReturnsPerCustomer?: number;
  maxReturnsPerPeriod?: number;
  returnPeriodDays?: number;
  conditions?: string[];
  isActive: boolean;
  effectiveFrom: Date;
  effectiveUntil?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Return Eligibility Check - Result of eligibility validation
 */
export interface ReturnEligibilityCheck {
  orderId: string;
  orderItemId?: string;
  profileId: string;
  status: ReturnEligibilityStatus;
  ineligibilityReasons: ReturnIneligibilityReason[];
  eligibleItems: EligibleItem[];
  ineligibleItems: IneligibleItem[];
  returnWindowEndsAt?: Date;
  policyId?: string;
  policyName?: string;
  requiresApproval: boolean;
  estimatedRefundAmount?: number;
  metadata?: Record<string, unknown>;
  checkedAt: Date;
}

/**
 * Eligible Item - Item eligible for return
 */
export interface EligibleItem {
  orderItemId: string;
  variantId: string;
  productName: string;
  variantSku: string;
  quantity: number;
  returnableQuantity: number;
  unitPrice: number;
  totalPrice: number;
  returnWindowEndsAt: Date;
}

/**
 * Ineligible Item - Item not eligible for return
 */
export interface IneligibleItem {
  orderItemId: string;
  variantId: string;
  productName: string;
  variantSku: string;
  quantity: number;
  reason: ReturnIneligibilityReason;
  reasonDetail?: string;
}

/**
 * Return Timeline - Timeline of return events
 */
export interface ReturnTimeline {
  returnRequestId: string;
  events: TimelineEvent[];
}

/**
 * Timeline Event - Individual timeline event
 */
export interface TimelineEvent {
  id: string;
  eventType: string;
  status: ReturnStatus;
  description: string;
  actorId?: string;
  actorType?: ActorType;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Return Statistics - Aggregated return statistics
 */
export interface ReturnStatistics {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  totalReturns: number;
  approvedReturns: number;
  rejectedReturns: number;
  pendingReturns: number;
  totalRefundAmount: number;
  averageRefundAmount: number;
  averageProcessingTime: number;
  returnRate: number;
  refundRate: number;
  topReturnReasons: Array<{
    reason: ReturnReason;
    count: number;
    percentage: number;
  }>;
  topReturningProducts: Array<{
    productId: string;
    productName: string;
    returnCount: number;
  }>;
}

/**
 * Create Return Request Input
 */
export interface CreateReturnRequestInput {
  orderId: string;
  returnType: ReturnType;
  reason: ReturnReason;
  reasonDetail?: string;
  items: Array<{
    orderItemId: string;
    variantId: string;
    productId: string;
    productName: string;
    variantSku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    reason: ReturnReason;
    reasonDetail?: string;
    condition: string;
  }>;
  refundMethod: RefundMethod;
  customerNotes?: string;
  evidenceUrls?: string[];
  totalRefundAmount?: number;
}

/**
 * Update Return Status Input
 */
export interface UpdateReturnStatusInput {
  returnRequestId: string;
  toStatus: ReturnStatus;
  reason?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create Refund Input
 */
export interface CreateRefundInput {
  returnRequestId: string;
  amount: number;
  method: RefundMethod;
  reason: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create Dispute Input
 */
export interface CreateDisputeInput {
  returnRequestId: string;
  reason: string;
  reasonDetail?: string;
}

/**
 * Update Dispute Input
 */
export interface UpdateDisputeInput {
  disputeId: string;
  resolution?: DisputeResolution;
  resolutionNotes?: string;
  internalNotes?: string;
  customerVisibleNotes?: string;
}

/**
 * Inspection Input
 */
export interface InspectionInput {
  returnRequestId: string;
  returnItemId: string;
  result: InspectionResult;
  failureReason?: InspectionFailureReason;
  conditionNotes?: string;
  imageUrls?: string[];
  dispositionAction: DispositionAction;
  restockable: boolean;
  refurbishable: boolean;
  repairable: boolean;
  disposalReason?: string;
}

/**
 * Schedule Pickup Input
 */
export interface SchedulePickupInput {
  returnRequestId: string;
  pickupAddress: {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  preferredDate?: Date;
  preferredTimeSlot?: string;
}

/**
 * Return Policy Input
 */
export interface ReturnPolicyInput {
  shopId: string;
  policyType: ReturnPolicyType;
  name: string;
  description?: string;
  returnWindowDays: number;
  eligibleProductCategories?: string[];
  ineligibleProductCategories?: string[];
  requiresApproval: boolean;
  requiresOriginalPackaging: boolean;
  requiresProofOfPurchase: boolean;
  customerPaysReturnShipping: boolean;
  restockingFeePercentage?: number;
  maxReturnsPerOrder?: number;
  maxReturnsPerCustomer?: number;
  maxReturnsPerPeriod?: number;
  returnPeriodDays?: number;
  conditions?: string[];
  effectiveFrom: Date;
  effectiveUntil?: Date;
}

/**
 * Return Query Filters
 */
export interface ReturnQueryFilters {
  status?: ReturnStatus;
  profileId?: string;
  shopId?: string;
  orderId?: string;
  returnType?: ReturnType;
  reason?: ReturnReason;
  refundStatus?: RefundStatus;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

/**
 * Return Query Options
 */
export interface ReturnQueryOptions {
  filters?: ReturnQueryFilters;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Return Query Result
 */
export interface ReturnQueryResult {
  data: ReturnRequest[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Return Event Types for Event System
 */
export type ReturnEventType =
  | 'return.requested'
  | 'return.approved'
  | 'return.rejected'
  | 'pickup.scheduled'
  | 'pickup.completed'
  | 'inspection.started'
  | 'inspection.completed'
  | 'inspection.passed'
  | 'inspection.failed'
  | 'refund.initiated'
  | 'refund.approved'
  | 'refund.completed'
  | 'refund.failed'
  | 'return.closed'
  | 'dispute.raised'
  | 'dispute.escalated'
  | 'dispute.resolved'
  | 'restock.started'
  | 'restock.completed';

/**
 * Return Event Payload
 */
export interface ReturnEventPayload {
  eventType: ReturnEventType;
  returnRequestId: string;
  orderId: string;
  profileId: string;
  shopId: string;
  data: Record<string, unknown>;
  timestamp: Date;
  actorId: string;
  actorType: ActorType;
}
