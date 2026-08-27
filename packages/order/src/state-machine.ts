/**
 * Order State Machine
 *
 * Implements the complete order lifecycle state machine with 16 states.
 * All transitions are validated according to business rules defined in
 * ORDER_MANAGEMENT_ARCHITECTURE.md.
 *
 * This is the canonical source of truth for order state transitions.
 * Resolves CC-27 and UX-11 from MASTER_ARCHITECTURE_BLUEPRINT.md.
 */

import {
  OrderStatus,
  CustomerVisibleOrderStatus,
  TransitionResult,
} from './enums';
import type {
  Order,
  TransitionRequest,
  TransitionResponse,
  StateTransition,
  ValidationResult,
} from './types';

// ──────────────────────────────────────────────────────────────────────────────
// State Transition Definitions
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Valid state transitions for the order lifecycle.
 * Each transition defines the from state, to state, whether it's automatic,
 * whether it requires admin permission, and any validation rules.
 */
const STATE_TRANSITIONS: StateTransition[] = [
  // Draft → Pending Payment (automatic when checkout is submitted)
  {
    from: OrderStatus.DRAFT,
    to: OrderStatus.PENDING_PAYMENT,
    automatic: true,
    requiresAdmin: false,
    description: 'Order submitted and awaiting payment',
  },
  // Pending Payment → Payment Authorized (automatic when payment is authorized)
  {
    from: OrderStatus.PENDING_PAYMENT,
    to: OrderStatus.PAYMENT_AUTHORIZED,
    automatic: true,
    requiresAdmin: false,
    description: 'Payment authorized by gateway',
  },
  // Pending Payment → Payment Failed (automatic when payment fails)
  {
    from: OrderStatus.PENDING_PAYMENT,
    to: OrderStatus.PAYMENT_FAILED,
    automatic: true,
    requiresAdmin: false,
    description: 'Payment attempt failed',
  },
  // Payment Authorized → Confirmed (automatic when payment is captured)
  {
    from: OrderStatus.PAYMENT_AUTHORIZED,
    to: OrderStatus.CONFIRMED,
    automatic: true,
    requiresAdmin: false,
    description: 'Payment captured and order confirmed',
  },
  // Payment Failed → Cancelled (automatic after max retry attempts)
  {
    from: OrderStatus.PAYMENT_FAILED,
    to: OrderStatus.CANCELLED,
    automatic: true,
    requiresAdmin: false,
    description: 'Order cancelled due to payment failure',
  },
  // Confirmed → Processing (automatic when order processing starts)
  {
    from: OrderStatus.CONFIRMED,
    to: OrderStatus.PROCESSING,
    automatic: true,
    requiresAdmin: false,
    description: 'Order processing started',
  },
  // Confirmed → Cancelled (manual by customer or admin, within time window)
  {
    from: OrderStatus.CONFIRMED,
    to: OrderStatus.CANCELLED,
    automatic: false,
    requiresAdmin: false,
    validationRule: 'validateCancellationWindow',
    description: 'Order cancelled by customer or admin',
  },
  // Processing → Packed (manual by shop owner)
  {
    from: OrderStatus.PROCESSING,
    to: OrderStatus.PACKED,
    automatic: false,
    requiresAdmin: false,
    description: 'Order items packed',
  },
  // Processing → Cancelled (manual by admin only)
  {
    from: OrderStatus.PROCESSING,
    to: OrderStatus.CANCELLED,
    automatic: false,
    requiresAdmin: true,
    description: 'Order cancelled by admin',
  },
  // Packed → Ready For Shipment (manual by shop owner)
  {
    from: OrderStatus.PACKED,
    to: OrderStatus.READY_FOR_SHIPMENT,
    automatic: false,
    requiresAdmin: false,
    description: 'Order ready for shipment',
  },
  // Ready For Shipment → Shipped (manual by shop owner with tracking)
  {
    from: OrderStatus.READY_FOR_SHIPMENT,
    to: OrderStatus.SHIPPED,
    automatic: false,
    requiresAdmin: false,
    validationRule: 'validateShipmentAssignment',
    description: 'Order shipped with tracking',
  },
  // Shipped → Delivered (automatic when delivery confirmed)
  {
    from: OrderStatus.SHIPPED,
    to: OrderStatus.DELIVERED,
    automatic: true,
    requiresAdmin: false,
    description: 'Order delivered to customer',
  },
  // Delivered → Completed (automatic after confirmation period)
  {
    from: OrderStatus.DELIVERED,
    to: OrderStatus.COMPLETED,
    automatic: true,
    requiresAdmin: false,
    description: 'Order completed after confirmation period',
  },
  // Delivered → Returned (manual by customer)
  {
    from: OrderStatus.DELIVERED,
    to: OrderStatus.RETURNED,
    automatic: false,
    requiresAdmin: false,
    validationRule: 'validateReturnWindow',
    description: 'Return requested by customer',
  },
  // Delivered → Refunded (manual by admin)
  {
    from: OrderStatus.DELIVERED,
    to: OrderStatus.REFUNDED,
    automatic: false,
    requiresAdmin: true,
    description: 'Order refunded by admin',
  },
  // Returned → Refunded (automatic when return is processed)
  {
    from: OrderStatus.RETURNED,
    to: OrderStatus.REFUNDED,
    automatic: true,
    requiresAdmin: false,
    description: 'Refund processed after return',
  },
  // Refunded → Closed (automatic after refund settlement)
  {
    from: OrderStatus.REFUNDED,
    to: OrderStatus.CLOSED,
    automatic: true,
    requiresAdmin: false,
    description: 'Order closed after refund settlement',
  },
  // Completed → Closed (automatic after archiving period)
  {
    from: OrderStatus.COMPLETED,
    to: OrderStatus.CLOSED,
    automatic: true,
    requiresAdmin: false,
    description: 'Order archived and closed',
  },
  // Cancelled → Closed (automatic after cancellation processing)
  {
    from: OrderStatus.CANCELLED,
    to: OrderStatus.CLOSED,
    automatic: true,
    requiresAdmin: false,
    description: 'Order closed after cancellation',
  },
  // Any state → Cancelled (admin override for exceptional cases)
  {
    from: OrderStatus.DRAFT,
    to: OrderStatus.CANCELLED,
    automatic: false,
    requiresAdmin: true,
    description: 'Draft cancelled by admin',
  },
  {
    from: OrderStatus.PAYMENT_AUTHORIZED,
    to: OrderStatus.CANCELLED,
    automatic: false,
    requiresAdmin: true,
    description: 'Authorized payment cancelled by admin',
  },
  {
    from: OrderStatus.PACKED,
    to: OrderStatus.CANCELLED,
    automatic: false,
    requiresAdmin: true,
    description: 'Packed order cancelled by admin',
  },
  {
    from: OrderStatus.READY_FOR_SHIPMENT,
    to: OrderStatus.CANCELLED,
    automatic: false,
    requiresAdmin: true,
    description: 'Ready-to-ship order cancelled by admin',
  },
  {
    from: OrderStatus.SHIPPED,
    to: OrderStatus.CANCELLED,
    automatic: false,
    requiresAdmin: true,
    description: 'Shipped order cancelled by admin (exceptional)',
  },
  // Partial Refund (admin only)
  {
    from: OrderStatus.DELIVERED,
    to: OrderStatus.PARTIALLY_REFUNDED,
    automatic: false,
    requiresAdmin: true,
    description: 'Partial refund processed by admin',
  },
  {
    from: OrderStatus.COMPLETED,
    to: OrderStatus.PARTIALLY_REFUNDED,
    automatic: false,
    requiresAdmin: true,
    description: 'Partial refund for completed order',
  },
  {
    from: OrderStatus.PARTIALLY_REFUNDED,
    to: OrderStatus.REFUNDED,
    automatic: false,
    requiresAdmin: true,
    description: 'Remaining refund processed',
  },
  {
    from: OrderStatus.PARTIALLY_REFUNDED,
    to: OrderStatus.CLOSED,
    automatic: true,
    requiresAdmin: false,
    description: 'Partially refunded order closed',
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Validation Rules
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Validation rule: Cancellation Window
 * Orders can only be cancelled within a specific time window after confirmation.
 */
const validateCancellationWindow = (order: Order): boolean => {
  const CANCELLATION_WINDOW_HOURS = 24; // 24 hours from confirmation
  const confirmedAt = order.createdAt; // Use createdAt as proxy for now
  const now = new Date().toISOString();
  const hoursSinceConfirmation =
    (new Date(now).getTime() - new Date(confirmedAt).getTime()) /
    (1000 * 60 * 60);

  return hoursSinceConfirmation <= CANCELLATION_WINDOW_HOURS;
};

/**
 * Validation rule: Return Window
 * Returns can only be requested within a specific time window after delivery.
 */
const validateReturnWindow = (order: Order): boolean => {
  const RETURN_WINDOW_DAYS = 14; // 14 days from delivery
  const deliveredAt = order.deliveredAt;
  if (!deliveredAt) return false;

  const now = new Date().toISOString();
  const daysSinceDelivery =
    (new Date(now).getTime() - new Date(deliveredAt).getTime()) /
    (1000 * 60 * 60 * 24);

  return daysSinceDelivery <= RETURN_WINDOW_DAYS;
};

/**
 * Validation rule: Shipment Assignment
 * Shipment must be assigned before marking as shipped.
 */
const validateShipmentAssignment = (order: Order): boolean => {
  // Check if shipment is assigned
  return !!order.shipmentId;
};

// Validation rule registry
const VALIDATION_RULES = {
  validateCancellationWindow,
  validateReturnWindow,
  validateShipmentAssignment,
};

// ──────────────────────────────────────────────────────────────────────────────
// Customer-Visible Status Mapping
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Maps internal order status to customer-visible status.
 * This simplifies the 16 internal states to 10 customer-friendly states.
 */
const CUSTOMER_VISIBLE_STATUS_MAP: Record<
  OrderStatus,
  CustomerVisibleOrderStatus
> = {
  [OrderStatus.DRAFT]: CustomerVisibleOrderStatus.PENDING,
  [OrderStatus.PENDING_PAYMENT]: CustomerVisibleOrderStatus.PENDING,
  [OrderStatus.PAYMENT_AUTHORIZED]: CustomerVisibleOrderStatus.PENDING,
  [OrderStatus.PAYMENT_FAILED]: CustomerVisibleOrderStatus.PENDING,
  [OrderStatus.CONFIRMED]: CustomerVisibleOrderStatus.CONFIRMED,
  [OrderStatus.PROCESSING]: CustomerVisibleOrderStatus.PROCESSING,
  [OrderStatus.PACKED]: CustomerVisibleOrderStatus.PACKING,
  [OrderStatus.READY_FOR_SHIPMENT]: CustomerVisibleOrderStatus.PACKING,
  [OrderStatus.SHIPPED]: CustomerVisibleOrderStatus.SHIPPED,
  [OrderStatus.DELIVERED]: CustomerVisibleOrderStatus.DELIVERED,
  [OrderStatus.COMPLETED]: CustomerVisibleOrderStatus.COMPLETED,
  [OrderStatus.CANCELLED]: CustomerVisibleOrderStatus.CANCELLED,
  [OrderStatus.REFUNDED]: CustomerVisibleOrderStatus.REFUNDED,
  [OrderStatus.PARTIALLY_REFUNDED]: CustomerVisibleOrderStatus.REFUNDED,
  [OrderStatus.RETURNED]: CustomerVisibleOrderStatus.RETURNED,
  [OrderStatus.CLOSED]: CustomerVisibleOrderStatus.COMPLETED,
};

// ──────────────────────────────────────────────────────────────────────────────
// State Machine Class
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Order State Machine
 *
 * Manages order state transitions with validation, permission checks,
 * and business rule enforcement.
 */
export class OrderStateMachine {
  /**
   * Check if a transition is valid.
   */
  canTransition(from: OrderStatus, to: OrderStatus): boolean {
    return STATE_TRANSITIONS.some(
      (transition) => transition.from === from && transition.to === to,
    );
  }

  /**
   * Get transition definition.
   */
  getTransition(
    from: OrderStatus,
    to: OrderStatus,
  ): StateTransition | undefined {
    return STATE_TRANSITIONS.find(
      (transition) => transition.from === from && transition.to === to,
    );
  }

  /**
   * Get all valid transitions from a given state.
   */
  getValidTransitions(from: OrderStatus): StateTransition[] {
    return STATE_TRANSITIONS.filter((transition) => transition.from === from);
  }

  /**
   * Get all possible transitions (for admin reference).
   */
  getAllTransitions(): StateTransition[] {
    return [...STATE_TRANSITIONS];
  }

  /**
   * Validate a transition request.
   */
  validate(order: Order, request: TransitionRequest): ValidationResult {
    const errors: string[] = [];

    // Check if transition is valid
    if (!this.canTransition(order.status, request.to)) {
      errors.push(`Invalid transition from ${order.status} to ${request.to}`);
      return { valid: false, errors };
    }

    // Get transition definition
    const transition = this.getTransition(order.status, request.to);
    if (!transition) {
      errors.push('Transition definition not found');
      return { valid: false, errors };
    }

    // Check admin permission
    if (transition.requiresAdmin && request.performedByType !== 'admin') {
      errors.push('This transition requires admin permission');
    }

    // Run validation rule if defined
    if (transition.validationRule) {
      const validationFn =
        VALIDATION_RULES[
          transition.validationRule as keyof typeof VALIDATION_RULES
        ];
      if (validationFn && !validationFn(order)) {
        errors.push(`Validation rule failed: ${transition.validationRule}`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Execute a state transition.
   */
  async transition(
    order: Order,
    request: TransitionRequest,
  ): Promise<TransitionResponse> {
    // Validate the transition
    const validation = this.validate(order, request);
    if (!validation.valid) {
      return {
        success: false,
        result: TransitionResult.BUSINESS_RULE_VIOLATION,
        error: validation.errors.join(', '),
        validationErrors: validation.errors,
      };
    }

    // Get transition definition
    const transition = this.getTransition(order.status, request.to);
    if (!transition) {
      return {
        success: false,
        result: TransitionResult.INVALID_TRANSITION,
        error: 'Transition definition not found',
      };
    }

    // Check permission
    if (transition.requiresAdmin && request.performedByType !== 'admin') {
      return {
        success: false,
        result: TransitionResult.PERMISSION_DENIED,
        error: 'This transition requires admin permission',
      };
    }

    // Transition is valid - return success
    // The actual state update will be handled by the Order Service
    return {
      success: true,
      result: TransitionResult.SUCCESS,
      newStatus: request.to,
    };
  }

  /**
   * Get customer-visible status for an internal status.
   */
  getCustomerVisibleStatus(status: OrderStatus): CustomerVisibleOrderStatus {
    return CUSTOMER_VISIBLE_STATUS_MAP[status];
  }

  /**
   * Check if a status is a terminal state.
   */
  isTerminalStatus(status: OrderStatus): boolean {
    return status === OrderStatus.CLOSED || status === OrderStatus.CANCELLED;
  }

  /**
   * Check if a status allows cancellation.
   */
  canCancel(status: OrderStatus): boolean {
    const cancellableStates = [
      OrderStatus.DRAFT,
      OrderStatus.PENDING_PAYMENT,
      OrderStatus.PAYMENT_AUTHORIZED,
      OrderStatus.CONFIRMED,
      OrderStatus.PROCESSING,
    ];
    return cancellableStates.includes(status);
  }

  /**
   * Check if a status allows returns.
   */
  canReturn(status: OrderStatus): boolean {
    const returnableStates = [OrderStatus.DELIVERED, OrderStatus.COMPLETED];
    return returnableStates.includes(status);
  }

  /**
   * Check if a status allows refunds.
   */
  canRefund(status: OrderStatus): boolean {
    const refundableStates = [
      OrderStatus.DELIVERED,
      OrderStatus.COMPLETED,
      OrderStatus.RETURNED,
    ];
    return refundableStates.includes(status);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Singleton Instance
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Singleton instance of the Order State Machine.
 * Use this instance throughout the application.
 */
export const orderStateMachine = new OrderStateMachine();
