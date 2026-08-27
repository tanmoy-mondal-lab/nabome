/**
 * Order Management System
 *
 * This is the main entry point for the Order Management System.
 * It exports all enums, types, state machine, timeline service, repository, service, and event publisher.
 *
 * Source: ORDER_MANAGEMENT_ARCHITECTURE.md (binding)
 */

// Enums
export * from './enums';

// Types
export type * from './types';

// State Machine
export { OrderStateMachine, orderStateMachine } from './state-machine';

// Timeline Service
export { TimelineService, timelineService } from './timeline';

// Repository
export { OrderRepository } from './repository';

// Service
export { OrderService } from './service';

// Event Publisher
export type { EventSubscriber } from './event-publisher';
export {
  EventPublisher,
  eventPublisher,
  InventorySubscriber,
  ShippingSubscriber,
  PaymentSubscriber,
  NotificationSubscriber,
  AnalyticsSubscriber,
  FinanceSubscriber,
} from './event-publisher';
