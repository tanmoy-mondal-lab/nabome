/**
 * Shipment State Machine
 *
 * This file implements the complete shipment state machine with lifecycle transitions.
 * All transitions are validated according to the SHIPPING_DELIVERY_LOGISTICS_ARCHITECTURE.md.
 *
 * Source: SHIPPING_DELIVERY_LOGISTICS_ARCHITECTURE.md (binding)
 */

import { ShipmentStatus, ActorType } from './enums';
import type { StateTransitionResult, UpdateShipmentStatusInput } from './types';

/**
 * Shipment State Machine
 *
 * Manages all valid state transitions for shipments according to the approved architecture.
 * Every transition is validated and logged with actor information.
 */
export class ShipmentStateMachine {
  /**
   * Valid state transitions map
   * Key: current state, Value: array of allowed next states
   */
  private static readonly TRANSITIONS: Record<
    ShipmentStatus,
    ShipmentStatus[]
  > = {
    [ShipmentStatus.SHIPMENT_CREATED]: [
      ShipmentStatus.READY_TO_PACK,
      ShipmentStatus.CANCELLED,
    ],
    [ShipmentStatus.READY_TO_PACK]: [
      ShipmentStatus.PACKED,
      ShipmentStatus.CANCELLED,
    ],
    [ShipmentStatus.PACKED]: [
      ShipmentStatus.READY_FOR_PICKUP,
      ShipmentStatus.CANCELLED,
    ],
    [ShipmentStatus.READY_FOR_PICKUP]: [
      ShipmentStatus.PICKED_UP,
      ShipmentStatus.CANCELLED,
    ],
    [ShipmentStatus.PICKED_UP]: [
      ShipmentStatus.IN_TRANSIT,
      ShipmentStatus.EXCEPTION,
    ],
    [ShipmentStatus.IN_TRANSIT]: [
      ShipmentStatus.OUT_FOR_DELIVERY,
      ShipmentStatus.DELIVERY_FAILED,
      ShipmentStatus.EXCEPTION,
    ],
    [ShipmentStatus.OUT_FOR_DELIVERY]: [
      ShipmentStatus.DELIVERED,
      ShipmentStatus.DELIVERY_FAILED,
    ],
    [ShipmentStatus.DELIVERED]: [
      ShipmentStatus.CLOSED,
      ShipmentStatus.RETURNED_TO_SENDER,
    ],
    [ShipmentStatus.DELIVERY_FAILED]: [
      ShipmentStatus.OUT_FOR_DELIVERY,
      ShipmentStatus.RETURNED_TO_SENDER,
    ],
    [ShipmentStatus.EXCEPTION]: [ShipmentStatus.IN_TRANSIT],
    [ShipmentStatus.RETURNED_TO_SENDER]: [ShipmentStatus.CLOSED],
    [ShipmentStatus.CANCELLED]: [], // Terminal state
    [ShipmentStatus.CLOSED]: [], // Terminal state
  };

  /**
   * Actor requirements for transitions
   * Key: transition (from->to), Value: required actor type
   */
  private static readonly ACTOR_REQUIREMENTS: Record<string, ActorType[]> = {
    [`${ShipmentStatus.SHIPMENT_CREATED}->${ShipmentStatus.READY_TO_PACK}`]: [
      ActorType.SHOP_OWNER,
      ActorType.ADMIN,
    ],
    [`${ShipmentStatus.READY_TO_PACK}->${ShipmentStatus.PACKED}`]: [
      ActorType.SHOP_OWNER,
      ActorType.ADMIN,
    ],
    [`${ShipmentStatus.PACKED}->${ShipmentStatus.READY_FOR_PICKUP}`]: [
      ActorType.SHOP_OWNER,
      ActorType.ADMIN,
    ],
    [`${ShipmentStatus.READY_FOR_PICKUP}->${ShipmentStatus.PICKED_UP}`]: [
      ActorType.SHOP_OWNER,
      ActorType.ADMIN,
      ActorType.COURIER,
    ],
    [`${ShipmentStatus.PICKED_UP}->${ShipmentStatus.IN_TRANSIT}`]: [
      ActorType.SHOP_OWNER,
      ActorType.ADMIN,
      ActorType.COURIER,
      ActorType.SYSTEM,
    ],
    [`${ShipmentStatus.IN_TRANSIT}->${ShipmentStatus.OUT_FOR_DELIVERY}`]: [
      ActorType.COURIER,
      ActorType.SYSTEM,
    ],
    [`${ShipmentStatus.IN_TRANSIT}->${ShipmentStatus.DELIVERY_FAILED}`]: [
      ActorType.COURIER,
      ActorType.SYSTEM,
    ],
    [`${ShipmentStatus.IN_TRANSIT}->${ShipmentStatus.EXCEPTION}`]: [
      ActorType.COURIER,
      ActorType.SYSTEM,
    ],
    [`${ShipmentStatus.OUT_FOR_DELIVERY}->${ShipmentStatus.DELIVERED}`]: [
      ActorType.COURIER,
      ActorType.SYSTEM,
    ],
    [`${ShipmentStatus.OUT_FOR_DELIVERY}->${ShipmentStatus.DELIVERY_FAILED}`]: [
      ActorType.COURIER,
      ActorType.SYSTEM,
    ],
    [`${ShipmentStatus.DELIVERED}->${ShipmentStatus.CLOSED}`]: [
      ActorType.SYSTEM,
    ],
    [`${ShipmentStatus.DELIVERED}->${ShipmentStatus.RETURNED_TO_SENDER}`]: [
      ActorType.ADMIN,
      ActorType.SYSTEM,
    ],
    [`${ShipmentStatus.DELIVERY_FAILED}->${ShipmentStatus.OUT_FOR_DELIVERY}`]: [
      ActorType.ADMIN,
      ActorType.SYSTEM,
    ],
    [`${ShipmentStatus.DELIVERY_FAILED}->${ShipmentStatus.RETURNED_TO_SENDER}`]:
      [ActorType.ADMIN, ActorType.SYSTEM],
    [`${ShipmentStatus.EXCEPTION}->${ShipmentStatus.IN_TRANSIT}`]: [
      ActorType.COURIER,
      ActorType.SYSTEM,
    ],
    [`${ShipmentStatus.RETURNED_TO_SENDER}->${ShipmentStatus.CLOSED}`]: [
      ActorType.SYSTEM,
    ],
  };

  /**
   * Reason requirements for transitions
   * Key: transition (from->to), Value: whether reason is required
   */
  private static readonly REASON_REQUIREMENTS: Record<string, boolean> = {
    [`${ShipmentStatus.IN_TRANSIT}->${ShipmentStatus.DELIVERY_FAILED}`]: true,
    [`${ShipmentStatus.IN_TRANSIT}->${ShipmentStatus.EXCEPTION}`]: true,
    [`${ShipmentStatus.OUT_FOR_DELIVERY}->${ShipmentStatus.DELIVERY_FAILED}`]: true,
    [`${ShipmentStatus.DELIVERY_FAILED}->${ShipmentStatus.RETURNED_TO_SENDER}`]: true,
    [`${ShipmentStatus.EXCEPTION}->${ShipmentStatus.IN_TRANSIT}`]: true,
    [`${ShipmentStatus.DELIVERED}->${ShipmentStatus.RETURNED_TO_SENDER}`]: true,
  };

  /**
   * Check if a transition is valid
   */
  canTransition(from: ShipmentStatus, to: ShipmentStatus): boolean {
    const allowedTransitions = ShipmentStateMachine.TRANSITIONS[from];
    return allowedTransitions.includes(to);
  }

  /**
   * Get allowed next states for a given current state
   */
  getAllowedTransitions(from: ShipmentStatus): ShipmentStatus[] {
    return ShipmentStateMachine.TRANSITIONS[from] ?? [];
  }

  /**
   * Check if actor is authorized for a transition
   */
  isActorAuthorized(
    from: ShipmentStatus,
    to: ShipmentStatus,
    actorType: ActorType,
  ): boolean {
    const transitionKey = `${from}->${to}`;
    const requiredActors =
      ShipmentStateMachine.ACTOR_REQUIREMENTS[transitionKey];

    if (!requiredActors) {
      // If no specific requirement, allow any actor
      return true;
    }

    return requiredActors.includes(actorType);
  }

  /**
   * Check if reason is required for a transition
   */
  isReasonRequired(from: ShipmentStatus, to: ShipmentStatus): boolean {
    const transitionKey = `${from}->${to}`;
    return ShipmentStateMachine.REASON_REQUIREMENTS[transitionKey] || false;
  }

  /**
   * Validate and execute a state transition
   *
   * Positional API: transition(fromStatus, toStatus, actorType, actorId, reason)
   * Object API:     transition({ shipmentId, status: newStatus, currentStatus, actorType, actorId, reason })
   *                 currentStatus is REQUIRED for object API — caller must load it from DB.
   *                 This prevents silent hardcoding of SHIPMENT_CREATED and enforces real state validation.
   */
  transition(
    input: UpdateShipmentStatusInput | ShipmentStatus,
    toStatus?: ShipmentStatus,
    actorType?: ActorType,
    actorId?: string,
    reason?: string,
  ): StateTransitionResult {
    let currentStatus: ShipmentStatus;
    let newStatus: ShipmentStatus;
    let actor: ActorType;
    let reasonVal: string | undefined;

    if (typeof input === 'string' && toStatus) {
      currentStatus = input as ShipmentStatus;
      newStatus = toStatus;
      actor = actorType as ActorType;
      reasonVal = reason;
    } else {
      const obj = input as UpdateShipmentStatusInput & {
        currentStatus?: ShipmentStatus;
        previousStatus?: ShipmentStatus;
        fromStatus?: ShipmentStatus;
      };
      newStatus = obj.status;
      actor = obj.actorType;
      reasonVal = obj.reason;
      const resolvedCurrent =
        obj.currentStatus ?? obj.previousStatus ?? obj.fromStatus;
      if (!resolvedCurrent) {
        return {
          success: false,
          previousStatus: ShipmentStatus.SHIPMENT_CREATED,
          newStatus,
          error:
            'Current shipment status is required for object API transition. Provide currentStatus (loaded from DB).',
        };
      }
      currentStatus = resolvedCurrent;
    }

    // Check if transition is valid
    if (!this.canTransition(currentStatus, newStatus)) {
      return {
        success: false,
        previousStatus: currentStatus,
        newStatus,
        error: `Invalid state transition from ${currentStatus} to ${newStatus}`,
      };
    }

    // Check if actor is authorized
    if (!this.isActorAuthorized(currentStatus, newStatus, actor)) {
      return {
        success: false,
        previousStatus: currentStatus,
        newStatus,
        error: `Actor ${actor} is not authorized for transition from ${currentStatus} to ${newStatus}`,
      };
    }

    // Check if reason is required
    if (this.isReasonRequired(currentStatus, newStatus) && !reasonVal) {
      return {
        success: false,
        previousStatus: currentStatus,
        newStatus,
        error: `Reason is required for transition from ${currentStatus} to ${newStatus}`,
      };
    }

    // Transition is valid
    return {
      success: true,
      previousStatus: currentStatus,
      newStatus,
    };
  }

  /**
   * Get customer-visible status for a given shipment status
   */
  getCustomerVisibleStatus(status: ShipmentStatus): string {
    const statusMap: Record<ShipmentStatus, string> = {
      [ShipmentStatus.SHIPMENT_CREATED]: 'processing',
      [ShipmentStatus.READY_TO_PACK]: 'processing',
      [ShipmentStatus.PACKED]: 'packed',
      [ShipmentStatus.READY_FOR_PICKUP]: 'shipped',
      [ShipmentStatus.PICKED_UP]: 'shipped',
      [ShipmentStatus.IN_TRANSIT]: 'in_transit',
      [ShipmentStatus.OUT_FOR_DELIVERY]: 'out_for_delivery',
      [ShipmentStatus.DELIVERED]: 'delivered',
      [ShipmentStatus.DELIVERY_FAILED]: 'delivery_failed',
      [ShipmentStatus.EXCEPTION]: 'delivery_failed',
      [ShipmentStatus.RETURNED_TO_SENDER]: 'returned',
      [ShipmentStatus.CANCELLED]: 'cancelled',
      [ShipmentStatus.CLOSED]: 'delivered',
    };

    return statusMap[status] || 'processing';
  }

  /**
   * Check if status is terminal (no further transitions allowed)
   */
  isTerminalStatus(status: ShipmentStatus): boolean {
    return (
      status === ShipmentStatus.CANCELLED || status === ShipmentStatus.CLOSED
    );
  }

  /**
   * Get all terminal statuses
   */
  getTerminalStatuses(): ShipmentStatus[] {
    return [ShipmentStatus.CANCELLED, ShipmentStatus.CLOSED];
  }

  /**
   * Get all active (non-terminal) statuses
   */
  getActiveStatuses(): ShipmentStatus[] {
    return Object.values(ShipmentStatus).filter(
      (status) => !this.isTerminalStatus(status),
    );
  }
}

/**
 * Singleton instance of the shipment state machine
 */
export const shipmentStateMachine = new ShipmentStateMachine();
