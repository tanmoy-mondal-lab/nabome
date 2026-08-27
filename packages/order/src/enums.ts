/**
 * Order Module Enums
 *
 * This file contains all enum definitions for the Order Management System.
 * These enums align with the ORDER_MANAGEMENT_ARCHITECTURE.md and resolve
 * the canonical order-status enum conflict from MASTER_ARCHITECTURE_BLUEPRINT.md.
 *
 * Source: ORDER_MANAGEMENT_ARCHITECTURE.md (binding)
 */

/**
 * Order Status Enum (16 states)
 * This is the canonical order status enum for the entire Nabome system.
 * Resolves CC-27 and UX-11 from MASTER_ARCHITECTURE_BLUEPRINT.md.
 *
 * Lifecycle Flow:
 * Draft → Pending Payment → Payment Authorized → Confirmed → Processing →
 * Packed → Ready For Shipment → Shipped → Delivered → Completed
 *
 * Alternative flows:
 * - Payment Failed → Cancelled
 * - Confirmed → Cancelled
 * - Delivered → Returned → Refunded → Closed
 * - Delivered → Refunded → Closed
 * - Any state → Cancelled (with restrictions)
 */
export enum OrderStatus {
  DRAFT = 'draft',
  PENDING_PAYMENT = 'pending_payment',
  PAYMENT_AUTHORIZED = 'payment_authorized',
  PAYMENT_FAILED = 'payment_failed',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  PACKED = 'packed',
  READY_FOR_SHIPMENT = 'ready_for_shipment',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  RETURNED = 'returned',
  CLOSED = 'closed',
}

/**
 * Customer-Visible Order Status (10 states)
 * Simplified view for customers to avoid confusion.
 * Maps internal states to customer-friendly statuses.
 */
export enum CustomerVisibleOrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  PACKING = 'packing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
  REFUNDED = 'refunded',
  COMPLETED = 'completed',
}

/**
 * Order Item Fulfillment Status
 * Tracks the fulfillment status of individual order items.
 */
export enum OrderItemFulfillmentStatus {
  PENDING = 'pending',
  RESERVED = 'reserved',
  PACKED = 'packed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
}

/**
 * Order Item Refund Status
 * Tracks the refund status of individual order items.
 */
export enum OrderItemRefundStatus {
  NONE = 'none',
  REQUESTED = 'requested',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}

/**
 * Order Item Return Status
 * Tracks the return status of individual order items.
 */
export enum OrderItemReturnStatus {
  NONE = 'none',
  REQUESTED = 'requested',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IN_TRANSIT = 'in_transit',
  RECEIVED = 'received',
  PROCESSED = 'processed',
}

/**
 * Timeline Event Type
 * Types of events that can appear in the order timeline.
 */
export enum TimelineEventType {
  ORDER_CREATED = 'order_created',
  PAYMENT_INITIATED = 'payment_initiated',
  PAYMENT_AUTHORIZED = 'payment_authorized',
  PAYMENT_CAPTURED = 'payment_captured',
  PAYMENT_FAILED = 'payment_failed',
  ORDER_CONFIRMED = 'order_confirmed',
  INVENTORY_RESERVED = 'inventory_reserved',
  ORDER_PROCESSING = 'order_processing',
  ORDER_PACKED = 'order_packed',
  READY_FOR_SHIPMENT = 'ready_for_shipment',
  ORDER_SHIPPED = 'order_shipped',
  ORDER_DELIVERED = 'order_delivered',
  ORDER_CANCELLED = 'order_cancelled',
  REFUND_INITIATED = 'refund_initiated',
  REFUND_COMPLETED = 'refund_completed',
  RETURN_REQUESTED = 'return_requested',
  RETURN_APPROVED = 'return_approved',
  RETURN_RECEIVED = 'return_received',
  RETURN_PROCESSED = 'return_processed',
  ORDER_COMPLETED = 'order_completed',
  ORDER_CLOSED = 'order_closed',
  NOTE_ADDED = 'note_added',
  STATUS_UPDATED = 'status_updated',
  ADDRESS_UPDATED = 'address_updated',
  MANUAL_OVERRIDE = 'manual_override',
}

/**
 * Transition Result
 * Result of a state transition attempt.
 */
export enum TransitionResult {
  SUCCESS = 'success',
  INVALID_TRANSITION = 'invalid_transition',
  PERMISSION_DENIED = 'permission_denied',
  BUSINESS_RULE_VIOLATION = 'business_rule_violation',
  SYSTEM_ERROR = 'system_error',
}

/**
 * Event Priority
 * Priority level for order events.
 */
export enum EventPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Order Source
 * Where the order originated from.
 */
export enum OrderSource {
  WEBSITE = 'website',
  MOBILE_APP = 'mobile_app',
  ADMIN = 'admin',
  API = 'api',
  MARKETPLACE = 'marketplace',
}

/**
 * Cancel Reason
 * Standardized reasons for order cancellation.
 */
export enum CancelReason {
  CUSTOMER_REQUEST = 'customer_request',
  PAYMENT_FAILED = 'payment_failed',
  OUT_OF_STOCK = 'out_of_stock',
  FRAUD_SUSPECTED = 'fraud_suspected',
  PAYMENT_TIMEOUT = 'payment_timeout',
  SYSTEM_ERROR = 'system_error',
  DUPLICATE_ORDER = 'duplicate_order',
  OTHER = 'other',
}

/**
 * Return Reason
 * Standardized reasons for order returns.
 */
export enum ReturnReason {
  DAMAGED = 'damaged',
  DEFECTIVE = 'defective',
  WRONG_ITEM = 'wrong_item',
  NOT_AS_DESCRIBED = 'not_as_described',
  NO_LONGER_NEEDED = 'no_longer_needed',
  BETTER_PRICE_AVAILABLE = 'better_price_available',
  QUALITY_ISSUE = 'quality_issue',
  SIZE_FIT_ISSUE = 'size_fit_issue',
  OTHER = 'other',
}

/**
 * Refund Reason
 * Standardized reasons for order refunds.
 */
export enum RefundReason {
  CUSTOMER_REQUEST = 'customer_request',
  DAMAGED = 'damaged',
  DEFECTIVE = 'defective',
  WRONG_ITEM = 'wrong_item',
  LATE_DELIVERY = 'late_delivery',
  SERVICE_ISSUE = 'service_issue',
  PAYMENT_ERROR = 'payment_error',
  OTHER = 'other',
}
