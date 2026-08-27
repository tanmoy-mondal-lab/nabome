/**
 * Shipping & Fulfillment Management System
 *
 * This is the main entry point for the Shipping & Fulfillment Management System.
 * It exports all enums, types, state machine, repository, and carrier abstraction.
 *
 * Source: SHIPPING_DELIVERY_LOGISTICS_ARCHITECTURE.md (binding)
 */

// Enums
export * from './enums';

// Types
export type * from './types';

// State Machine
export { ShipmentStateMachine, shipmentStateMachine } from './state-machine';

// Repository
export { ShipmentRepository } from './repository';

// Carrier Abstraction
export { CarrierRegistry, ManualCarrierAdapter } from './carrier-abstraction';

export type {
  CarrierAdapter,
  RateCalculationRequest,
  ShipmentBookingRequest,
  ShipmentBookingResult,
  LabelGenerationRequest,
  LabelGenerationResult,
  TrackingUpdateResult,
  CarrierHealthCheckResult,
} from './carrier-abstraction';

// Service
export { ShipmentService, createShipmentService } from './service';

// Fulfillment Service
export { FulfillmentService, createFulfillmentService } from './fulfillment';

// Tracking Service
export { TrackingService, createTrackingService } from './tracking';

// Carrier Service
export { CarrierService, createCarrierService } from './carrier';

// Event Publisher
export {
  LogisticsEventPublisher,
  logisticsEventPublisher,
} from './event-publisher';
export {
  createShipmentCreatedEvent,
  createShipmentStatusChangedEvent,
  createTrackingEventAddedEvent,
  createFulfillmentCompletedEvent,
  createDeliveryConfirmedEvent,
  createShippingExceptionEvent,
} from './event-publisher';

// Hooks
export {
  useShipments,
  useTracking,
  useFulfillment,
  useCarriers,
} from './hooks';

// Document Generation
export {
  DocumentGenerationService,
  createDocumentGenerationService,
} from './document-generation';

// Notification Service
export {
  ShipmentNotificationService,
  createShipmentNotificationService,
} from './notification-service';

// Analytics Service
export {
  ShippingAnalyticsService,
  createShippingAnalyticsService,
} from './analytics-service';
