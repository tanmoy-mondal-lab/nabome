/**
 * Returns, Refunds, Reverse Logistics & Dispute Resolution Enums
 *
 * This file contains all enum definitions for the returns system.
 * All enums follow the canonical snake_case convention per MASTER_ARCHITECTURE_BLUEPRINT.md Appendix B.
 */

/**
 * Return Request Status - Complete lifecycle states for return requests
 */
export enum ReturnStatus {
  RETURN_REQUESTED = 'return_requested',
  RETURN_APPROVED = 'return_approved',
  RETURN_REJECTED = 'return_rejected',
  PICKUP_SCHEDULED = 'pickup_scheduled',
  PICKUP_COMPLETED = 'pickup_completed',
  IN_INSPECTION = 'in_inspection',
  INSPECTION_PASSED = 'inspection_passed',
  INSPECTION_FAILED = 'inspection_failed',
  REFUND_PENDING = 'refund_pending',
  REFUND_APPROVED = 'refund_approved',
  REFUND_COMPLETED = 'refund_completed',
  RETURN_CLOSED = 'return_closed',
}

/**
 * Return Type - Types of return requests supported
 */
export enum ReturnType {
  FULL_ORDER = 'full_order',
  PARTIAL_RETURN = 'partial_return',
  VARIANT_RETURN = 'variant_return',
  QUANTITY_RETURN = 'quantity_return',
  EXCHANGE = 'exchange',
  REPLACEMENT = 'replacement',
}

/**
 * Return Reason - Customer-provided reasons for returns
 */
export enum ReturnReason {
  DAMAGED = 'damaged',
  DEFECTIVE = 'defective',
  WRONG_ITEM = 'wrong_item',
  NOT_AS_DESCRIBED = 'not_as_described',
  SIZE_MISMATCH = 'size_mismatch',
  COLOR_MISMATCH = 'color_mismatch',
  QUALITY_ISSUE = 'quality_issue',
  CHANGED_MIND = 'changed_mind',
  NO_LONGER_NEEDED = 'no_longer_needed',
  BETTER_PRICE_AVAILABLE = 'better_price_available',
  ARRIVED_LATE = 'arrived_late',
  OTHER = 'other',
}

/**
 * Refund Method - How refunds are processed
 */
export enum RefundMethod {
  ORIGINAL_PAYMENT = 'original_payment',
  STORE_CREDIT = 'store_credit',
  BANK_TRANSFER = 'bank_transfer',
  UPI = 'upi',
  WALLET = 'wallet',
}

/**
 * Refund Status - Status of refund processing
 */
export enum RefundStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * Inspection Result - Outcome of return inspection
 */
export enum InspectionResult {
  PASSED = 'passed',
  FAILED = 'failed',
  PARTIAL = 'partial',
  PENDING = 'pending',
}

/**
 * Inspection Failure Reason - Reasons for inspection failure
 */
export enum InspectionFailureReason {
  DAMAGED_BEYOND_REPAIR = 'damaged_beyond_repair',
  MISSING_PARTS = 'missing_parts',
  USED_WORN = 'used_worn',
  DIFFERENT_ITEM = 'different_item',
  COUNTERFEIT = 'counterfeit',
  TAMPERED = 'tampered',
  EXCEEDED_RETURN_WINDOW = 'exceeded_return_window',
  NO_PROOF_OF_PURCHASE = 'no_proof_of_purchase',
  OTHER = 'other',
}

/**
 * Dispute Status - Status of dispute resolution
 */
export enum DisputeStatus {
  OPEN = 'open',
  UNDER_REVIEW = 'under_review',
  ESCALATED = 'escalated',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

/**
 * Dispute Resolution - Final resolution of dispute
 */
export enum DisputeResolution {
  CUSTOMER_FAVORED = 'customer_favored',
  SELLER_FAVORED = 'seller_favored',
  PARTIAL_REFUND = 'partial_refund',
  FULL_REFUND = 'full_refund',
  REPLACEMENT = 'replacement',
  EXCHANGE = 'exchange',
  REJECTED = 'rejected',
}

/**
 * Return Policy Type - Types of return policies
 */
export enum ReturnPolicyType {
  STANDARD = 'standard',
  EXTENDED = 'extended',
  NO_RETURNS = 'no_returns',
  FINAL_SALE = 'final_sale',
}

/**
 * Reverse Logistics Status - Status of reverse logistics operations
 */
export enum ReverseLogisticsStatus {
  AWAITING_PICKUP = 'awaiting_pickup',
  PICKUP_SCHEDULED = 'pickup_scheduled',
  PICKUP_ASSIGNED = 'pickup_assigned',
  IN_TRANSIT = 'in_transit',
  WAREHOUSE_RECEIVED = 'warehouse_received',
  INSPECTION_QUEUED = 'inspection_queued',
  INSPECTION_IN_PROGRESS = 'inspection_in_progress',
  INSPECTION_COMPLETED = 'inspection_completed',
  RESTOCKING = 'restocking',
  DISPOSAL = 'disposal',
  COMPLETED = 'completed',
}

/**
 * Restock Status - Status of item restocking
 */
export enum RestockStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANNOT_RESTOCK = 'cannot_restock',
}

/**
 * Disposition Action - What happens to returned items
 */
export enum DispositionAction {
  RESTOCK = 'restock',
  REFURBISH = 'refurbish',
  REPAIR = 'repair',
  DISPOSE = 'dispose',
  RETURN_TO_VENDOR = 'return_to_vendor',
  DONATE = 'donate',
  HOLD = 'hold',
}

/**
 * Actor Type - Who performed an action
 */
export enum ActorType {
  CUSTOMER = 'customer',
  SHOP_OWNER = 'shop_owner',
  ADMIN = 'admin',
  SYSTEM = 'system',
  WAREHOUSE_STAFF = 'warehouse_staff',
  COURIER = 'courier',
}

/**
 * Return Eligibility Status - Result of eligibility check
 */
export enum ReturnEligibilityStatus {
  ELIGIBLE = 'eligible',
  INELIGIBLE = 'ineligible',
  PARTIALLY_ELIGIBLE = 'partially_eligible',
  REQUIRES_APPROVAL = 'requires_approval',
}

/**
 * Return Ineligibility Reason - Why a return is not eligible
 */
export enum ReturnIneligibilityReason {
  EXCEEDED_RETURN_WINDOW = 'exceeded_return_window',
  PRODUCT_NOT_ELIGIBLE = 'product_not_eligible',
  ORDER_NOT_DELIVERED = 'order_not_delivered',
  ALREADY_RETURNED = 'already_returned',
  FINAL_SALE = 'final_sale',
  MISSING_PROOF = 'missing_proof',
  DAMAGED_BY_CUSTOMER = 'damaged_by_customer',
  USED_BEYOND_REASONABLE = 'used_beyond_reasonable',
  MISSING_ITEMS = 'missing_items',
  RETURN_LIMIT_EXCEEDED = 'return_limit_exceeded',
  FRAUD_SUSPECTED = 'fraud_suspected',
  OTHER = 'other',
}
