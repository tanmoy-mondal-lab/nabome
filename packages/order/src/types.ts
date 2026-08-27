/**
 * Order Module Types
 *
 * This file contains all TypeScript interfaces and types for the Order Management System.
 * These types align with the ORDER_MANAGEMENT_ARCHITECTURE.md, DATABASE_ARCHITECTURE.md,
 * and the canonical types from @nabome/types.
 */

import type {
  Id,
  Money,
  Timestamps,
  OrderPaymentSubStatus,
  OrderItem as CanonicalOrderItem,
  OrderLineAmounts,
  OrderAddress,
} from '@nabome/types';

import type {
  OrderStatus,
  CustomerVisibleOrderStatus,
  OrderItemFulfillmentStatus,
  OrderItemRefundStatus,
  OrderItemReturnStatus,
  TimelineEventType,
  TransitionResult,
  EventPriority,
  OrderSource,
  ReturnReason,
  RefundReason,
} from './enums';

// ──────────────────────────────────────────────────────────────────────────────
// Order Core Types
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Order Entity
 * Core order entity with all fields as defined in DATABASE_ARCHITECTURE.md.
 * Order core data is immutable once created (except status and timestamps).
 */
export interface Order extends Timestamps {
  id: Id;
  /** Display number: NAB-YYYYMMDD-XXXXXX */
  orderNumber: string;
  userId?: Id | null;
  /** Guest cart token for guest orders */
  guestToken?: string | null;
  /** Internal order status (16 states) */
  status: OrderStatus;
  /** Customer-visible status (10 states) */
  customerVisibleStatus: CustomerVisibleOrderStatus;
  /** Payment sub-status */
  paymentStatus: OrderPaymentSubStatus;
  /** Order source channel */
  source: OrderSource;
  /** Order items (immutable snapshot) */
  items: OrderItem[];
  /** Order amounts (immutable snapshot) */
  amounts: OrderLineAmounts;
  /** Shipping address (immutable snapshot) */
  shippingAddress?: OrderAddress | null;
  /** Billing address (immutable snapshot) */
  billingAddress?: OrderAddress | null;
  /** Applied coupon code */
  couponCode?: string | null;
  /** Payment ID reference */
  paymentId?: Id | null;
  /** Shipment ID reference */
  shipmentId?: Id | null;
  /** Assigned shop owner ID (for multi-tenant) */
  shopOwnerId?: Id | null;
  /** When order was cancelled */
  cancelledAt?: string | null;
  /** When order was delivered */
  deliveredAt?: string | null;
  /** When order was completed */
  completedAt?: string | null;
  /** When order was closed */
  closedAt?: string | null;
  /** Customer email at time of order (immutable) */
  customerEmail: string;
  /** Customer phone at time of order (immutable) */
  customerPhone?: string | null;
  /** Customer name at time of order (immutable) */
  customerName: string;
  /** Internal notes (admin/shop owner only) */
  notes?: string | null;
  /** Metadata for extensibility */
  metadata?: Record<string, unknown> | null;
}

/**
 * Order Item
 * Extended order item with fulfillment, refund, and return status tracking.
 * Core item data is immutable once created.
 */
export interface OrderItem extends CanonicalOrderItem {
  /** Fulfillment status for this item */
  fulfillmentStatus: OrderItemFulfillmentStatus;
  /** Refund status for this item */
  refundStatus: OrderItemRefundStatus;
  /** Return status for this item */
  returnStatus: OrderItemReturnStatus;
  /** Quantity refunded */
  refundedQuantity: number;
  /** Quantity returned */
  returnedQuantity: number;
  /** Warehouse ID where stock was reserved */
  warehouseId?: Id | null;
  /** Stock reservation ID */
  reservationId?: Id | null;
  /** Metadata for extensibility */
  metadata?: Record<string, unknown> | null;
}

/**
 * Order Snapshot
 * Immutable snapshot created from checkout.
 * This becomes the source of truth for the order.
 */
export interface OrderSnapshot {
  /** Customer ID */
  customerId?: Id | null;
  /** Guest token */
  guestToken?: string | null;
  /** Customer email */
  customerEmail: string;
  /** Customer phone */
  customerPhone?: string | null;
  /** Customer name */
  customerName: string;
  /** Order items */
  items: OrderItem[];
  /** Order amounts */
  amounts: OrderLineAmounts;
  /** Shipping address */
  shippingAddress: OrderAddress;
  /** Billing address */
  billingAddress: OrderAddress;
  /** Coupon code */
  couponCode?: string | null;
  /** Order source */
  source: OrderSource;
  /** Metadata */
  metadata?: Record<string, unknown> | null;
}

// ──────────────────────────────────────────────────────────────────────────────
// State Machine Types
// ──────────────────────────────────────────────────────────────────────────────

/**
 * State Transition Definition
 * Defines a valid transition between order states.
 */
export interface StateTransition {
  /** Current state */
  from: OrderStatus;
  /** Target state */
  to: OrderStatus;
  /** Whether this transition is automatic */
  automatic: boolean;
  /** Whether this transition requires admin permission */
  requiresAdmin: boolean;
  /** Business rule validation function name */
  validationRule?: string;
  /** Description of the transition */
  description: string;
}

/**
 * Transition Request
 * Request to transition an order to a new state.
 */
export interface TransitionRequest {
  /** Order ID */
  orderId: Id;
  /** Target state */
  to: OrderStatus;
  /** Reason for transition */
  reason?: string;
  /** Who performed the transition */
  performedBy: Id;
  /** Type of performer */
  performedByType: 'customer' | 'shop_owner' | 'admin' | 'system';
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Transition Result
 * Result of a state transition attempt.
 */
export interface TransitionResponse {
  /** Whether transition succeeded */
  success: boolean;
  /** Result type */
  result: TransitionResult;
  /** New status (if successful) */
  newStatus?: OrderStatus;
  /** Error message (if failed) */
  error?: string;
  /** Validation errors (if any) */
  validationErrors?: string[];
}

// ──────────────────────────────────────────────────────────────────────────────
// Timeline Types
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Timeline Event
 * Represents a single event in the order timeline.
 */
export interface TimelineEvent {
  id: Id;
  /** Order ID */
  orderId: Id;
  /** Event type */
  type: TimelineEventType;
  /** Event description */
  description: string;
  /** When the event occurred */
  occurredAt: string;
  /** Who triggered the event */
  performedBy?: Id | null;
  /** Type of performer */
  performedByType?: 'customer' | 'shop_owner' | 'admin' | 'system' | null;
  /** Previous status (if applicable) */
  previousStatus?: OrderStatus | null;
  /** New status (if applicable) */
  newStatus?: OrderStatus | null;
  /** Event priority */
  priority: EventPriority;
  /** Additional data */
  data?: Record<string, unknown> | null;
  /** Whether this is visible to customers */
  customerVisible: boolean;
}

/**
 * Timeline
 * Complete chronological history of order events.
 */
export interface Timeline {
  orderId: Id;
  events: TimelineEvent[];
  totalEvents: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// Event Types
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Order Event Base
 * Base interface for all order events.
 */
export interface OrderEvent {
  /** Event ID */
  id: Id;
  /** Event type */
  type: string;
  /** Order ID */
  orderId: Id;
  /** Event data */
  data: Record<string, unknown>;
  /** When event was created */
  createdAt: string;
  /** Event priority */
  priority: EventPriority;
  /** Whether event has been processed */
  processed: boolean;
  /** Processing attempts */
  processingAttempts: number;
  /** Error message (if processing failed) */
  error?: string | null;
}

/**
 * Order Created Event
 */
export interface OrderCreatedEvent extends OrderEvent {
  type: 'order.created';
  data: {
    orderId: Id;
    orderNumber: string;
    userId?: Id | null;
    customerEmail: string;
    totalAmount: Money;
    itemCount: number;
  };
}

/**
 * Payment Status Changed Event
 */
export interface PaymentStatusChangedEvent extends OrderEvent {
  type: 'payment.status_changed';
  data: {
    orderId: Id;
    paymentId: Id;
    previousStatus: string;
    newStatus: string;
    amount?: Money;
  };
}

/**
 * Order Status Changed Event
 */
export interface OrderStatusChangedEvent extends OrderEvent {
  type: 'order.status_changed';
  data: {
    orderId: Id;
    orderNumber: string;
    previousStatus: OrderStatus;
    newStatus: OrderStatus;
    performedBy: Id;
    performedByType: string;
    reason?: string;
  };
}

/**
 * Inventory Reserved Event
 */
export interface InventoryReservedEvent extends OrderEvent {
  type: 'inventory.reserved';
  data: {
    orderId: Id;
    reservationId: Id;
    items: Array<{
      variantId: Id;
      quantity: number;
      warehouseId?: Id;
    }>;
  };
}

/**
 * Inventory Released Event
 */
export interface InventoryReleasedEvent extends OrderEvent {
  type: 'inventory.released';
  data: {
    orderId: Id;
    reservationId?: Id;
    items: Array<{
      variantId: Id;
      quantity: number;
    }>;
    reason: string;
  };
}

/**
 * Shipment Created Event
 */
export interface ShipmentCreatedEvent extends OrderEvent {
  type: 'shipment.created';
  data: {
    orderId: Id;
    shipmentId: Id;
    trackingNumber?: string;
    carrier?: string;
  };
}

/**
 * Shipment Delivered Event
 */
export interface ShipmentDeliveredEvent extends OrderEvent {
  type: 'shipment.delivered';
  data: {
    orderId: Id;
    shipmentId: Id;
    deliveredAt: string;
  };
}

/**
 * Refund Initiated Event
 */
export interface RefundInitiatedEvent extends OrderEvent {
  type: 'refund.initiated';
  data: {
    orderId: Id;
    refundId: Id;
    paymentId: Id;
    amount: Money;
    reason: RefundReason;
  };
}

/**
 * Return Requested Event
 */
export interface ReturnRequestedEvent extends OrderEvent {
  type: 'return.requested';
  data: {
    orderId: Id;
    returnId: Id;
    userId: Id;
    items: Array<{
      orderItemId: Id;
      quantity: number;
    }>;
    reason: ReturnReason;
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Integration Types
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Checkout Snapshot
 * Immutable snapshot from checkout engine.
 * This is the input for order creation.
 */
export interface CheckoutSnapshot {
  /** Checkout ID */
  checkoutId: Id;
  /** Customer ID */
  customerId?: Id | null;
  /** Guest token */
  guestToken?: string | null;
  /** Customer email */
  customerEmail: string;
  /** Customer phone */
  customerPhone?: string | null;
  /** Customer name */
  customerName: string;
  /** Cart items */
  items: Array<{
    productId: Id;
    variantId: Id;
    productName: string;
    sku: string;
    attributes: Record<string, unknown>;
    unitPrice: Money;
    quantity: number;
    lineTotal: Money;
    imageUrl?: string;
  }>;
  /** Order amounts */
  amounts: OrderLineAmounts;
  /** Shipping address */
  shippingAddress: OrderAddress;
  /** Billing address */
  billingAddress: OrderAddress;
  /** Coupon code */
  couponCode?: string | null;
  /** Shipping method */
  shippingMethod?: string;
  /** Payment method */
  paymentMethod?: string;
  /** Metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Inventory Reservation Request
 * Request to reserve inventory for an order.
 */
export interface InventoryReservationRequest {
  /** Order ID */
  orderId: Id;
  /** Items to reserve */
  items: Array<{
    variantId: Id;
    quantity: number;
    warehouseId?: Id;
  }>;
  /** Reservation expiration (minutes) */
  expiresAt: string;
}

/**
 * Inventory Reservation Response
 * Response from inventory reservation.
 */
export interface InventoryReservationResponse {
  /** Whether reservation succeeded */
  success: boolean;
  /** Reservation ID */
  reservationId?: Id;
  /** Failed items (if any) */
  failedItems?: Array<{
    variantId: Id;
    requestedQuantity: number;
    availableQuantity: number;
    reason: string;
  }>;
  /** Error message (if failed) */
  error?: string;
}

/**
 * Payment Status Update
 * Update payment status from payment gateway.
 */
export interface PaymentStatusUpdate {
  /** Order ID */
  orderId: Id;
  /** Payment ID */
  paymentId: Id;
  /** New payment status */
  status: string;
  /** Payment amount */
  amount?: Money;
  /** Transaction ID from gateway */
  transactionId?: string;
  /** Failure reason (if failed) */
  failureReason?: string;
  /** Gateway metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Shipment Assignment Request
 * Request to assign shipment to order.
 */
export interface ShipmentAssignmentRequest {
  /** Order ID */
  orderId: Id;
  /** Carrier */
  carrier: string;
  /** Shipping method */
  shippingMethod: string;
  /** Estimated delivery date */
  estimatedDelivery?: string;
  /** Metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Shipment Assignment Response
 * Response from shipment assignment.
 */
export interface ShipmentAssignmentResponse {
  /** Whether assignment succeeded */
  success: boolean;
  /** Shipment ID */
  shipmentId?: Id;
  /** Tracking number */
  trackingNumber?: string;
  /** Error message (if failed) */
  error?: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Query & Filter Types
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Order Query Options
 * Options for querying orders.
 */
export interface OrderQueryOptions {
  /** User ID (for customer orders) */
  userId?: Id;
  /** Shop owner ID (for shop orders) */
  shopOwnerId?: Id;
  /** Order status filter */
  status?: OrderStatus | OrderStatus[];
  /** Customer-visible status filter */
  customerVisibleStatus?:
    CustomerVisibleOrderStatus | CustomerVisibleOrderStatus[];
  /** Payment status filter */
  paymentStatus?: OrderPaymentSubStatus;
  /** Order source filter */
  source?: OrderSource;
  /** Date range start */
  startDate?: string;
  /** Date range end */
  endDate?: string;
  /** Search term (order number, email, name) */
  search?: string;
  /** Pagination offset */
  offset?: number;
  /** Pagination limit */
  limit?: number;
  /** Sort field */
  sortBy?: 'createdAt' | 'updatedAt' | 'orderNumber' | 'amounts.grandTotal';
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
}

/**
 * Order Summary
 * Summary statistics for orders.
 */
export interface OrderSummary {
  /** Total orders */
  totalOrders: number;
  /** Total order value */
  totalValue: Money;
  /** Orders by status */
  ordersByStatus: Record<OrderStatus, number>;
  /** Orders by customer-visible status */
  ordersByCustomerStatus: Record<CustomerVisibleOrderStatus, number>;
  /** Average order value */
  averageOrderValue: Money;
  /** Cancellation rate */
  cancellationRate: number;
  /** Refund rate */
  refundRate: number;
  /** Delivery rate */
  deliveryRate: number;
}

/**
 * Order Dashboard Stats
 * Statistics for order dashboard.
 */
export interface OrderDashboardStats {
  /** Today's orders */
  todayOrders: number;
  /** Today's revenue */
  todayRevenue: Money;
  /** Pending orders */
  pendingOrders: number;
  /** Processing orders */
  processingOrders: number;
  /** Ready to ship */
  readyToShip: number;
  /** Shipped today */
  shippedToday: number;
  /** Delivered today */
  deliveredToday: number;
  /** Cancellation rate (7 days) */
  cancellationRate7d: number;
  /** Refund rate (7 days) */
  refundRate7d: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// Validation Types
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Validation Rule
 * Business rule for validating state transitions.
 */
export interface ValidationRule {
  /** Rule name */
  name: string;
  /** Rule description */
  description: string;
  /** Validation function */
  validate: (order: Order, request: TransitionRequest) => boolean;
  /** Error message if validation fails */
  errorMessage: string;
}

/**
 * Validation Result
 * Result of validation.
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Error messages (if any) */
  errors: string[];
}
