/**
 * Shipping Module Types
 *
 * This file contains all TypeScript interfaces and types for the Shipping & Fulfillment Management System.
 * These types align with the SHIPPING_DELIVERY_LOGISTICS_ARCHITECTURE.md.
 *
 * Source: SHIPPING_DELIVERY_LOGISTICS_ARCHITECTURE.md (binding)
 */

import type { Id } from '@nabome/types';

import type {
  ShipmentStatus,
  ShippingMethod,
  CarrierType,
  TrackingEventType,
  ActorType,
  FulfillmentStatus,
  PackageType,
  DeliveryConfirmationType,
  ExceptionType,
  ReturnReason,
  CarrierStatus,
  RateCalculationStatus,
  LabelGenerationStatus,
  CustomerVisibleShipmentStatus,
} from './enums';

/**
 * Shipment Entity
 * Represents a shipment in the system.
 */
export interface Shipment {
  id: Id;
  orderId: Id;
  status: ShipmentStatus;
  trackingNumber: string | null;
  carrierCode: string | null;
  carrierName: string | null;
  shippingMethod: ShippingMethod;
  estimatedDeliveryDate: Date | null;
  actualDeliveryDate: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  weight: number; // in grams
  dimensions: {
    length: number; // in cm
    width: number; // in cm
    height: number; // in cm
  };
  shippingAddress: ShippingAddress;
  shippingCost: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Shipment Item
 * Represents an item within a shipment.
 */
export interface ShipmentItem {
  id: Id;
  shipmentId: Id;
  orderItemId: Id;
  variantId: Id;
  productName: string;
  variantSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  packageType: PackageType;
  isFragile: boolean;
  createdAt: Date;
}

/**
 * Shipment Event
 * Represents a tracking event in the shipment timeline.
 */
export interface ShipmentEvent {
  id: Id;
  shipmentId: Id;
  status: TrackingEventType;
  location: string | null;
  description: string;
  actorType: ActorType;
  actorId: Id | null;
  metadata: Record<string, unknown> | null | undefined;
  createdAt: Date;
}

/**
 * Carrier Entity
 * Represents a logistics provider.
 */
export interface Carrier {
  id: Id;
  code: CarrierType;
  name: string;
  displayName: string;
  status: CarrierStatus;
  apiEnabled: boolean;
  config: CarrierConfig;
  trackingUrlTemplate: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Carrier Configuration
 * Configuration for carrier integration.
 */
export interface CarrierConfig {
  apiKey?: string;
  apiSecret?: string;
  apiEndpoint?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  sandboxMode?: boolean;
  customConfig?: Record<string, unknown>;
}

/**
 * Shipping Rate
 * Represents a shipping rate quote.
 */
export interface ShippingRate {
  carrierCode: CarrierType;
  carrierName: string;
  method: ShippingMethod;
  cost: number;
  currency: string;
  estimatedDays: {
    min: number;
    max: number;
  };
  estimatedDeliveryDate: Date;
  status: RateCalculationStatus;
  metadata?: Record<string, unknown>;
}

/**
 * Shipping Address
 * Represents a shipping address.
 */
export interface ShippingAddress {
  recipientName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email?: string;
}

/**
 * Fulfillment Queue Item
 * Represents an item in the fulfillment queue.
 */
export interface FulfillmentQueueItem {
  id: Id;
  orderId: Id;
  shipmentId: Id | null;
  status: FulfillmentStatus;
  priority: number;
  assignedTo: Id | null;
  assignedAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Pick List Item
 * Represents an item in a pick list.
 */
export interface PickListItem {
  id: Id;
  fulfillmentQueueId: Id;
  variantId: Id;
  variantSku: string;
  productName: string;
  quantity: number;
  location: string; // warehouse location
  picked: boolean;
  pickedAt: Date | null;
  pickedBy: Id | null;
  createdAt: Date;
}

/**
 * Packing Slip
 * Represents a packing slip document.
 */
export interface PackingSlip {
  id: Id;
  shipmentId: Id;
  orderNumber: string;
  items: PackingSlipItem[];
  shippingAddress: ShippingAddress;
  carrier: string;
  trackingNumber: string | null;
  generatedAt: Date;
  generatedBy: Id;
}

/**
 * Packing Slip Item
 * Represents an item on a packing slip.
 */
export interface PackingSlipItem {
  productName: string;
  variantSku: string;
  quantity: number;
  location: string;
}

/**
 * Shipping Label
 * Represents a shipping label.
 */
export interface ShippingLabel {
  id: Id;
  shipmentId: Id;
  carrierCode: CarrierType;
  trackingNumber: string;
  labelUrl: string;
  labelData: string; // base64 encoded PDF
  status: LabelGenerationStatus;
  generatedAt: Date;
  generatedBy: Id;
}

/**
 * Delivery Confirmation
 * Represents delivery confirmation details.
 */
export interface DeliveryConfirmation {
  id: Id;
  shipmentId: Id;
  confirmationType: DeliveryConfirmationType;
  confirmedAt: Date;
  confirmedBy: Id;
  signature?: string; // base64 encoded signature
  photoUrl?: string;
  otp?: string;
  metadata: Record<string, unknown> | null | undefined;
}

/**
 * Shipping Exception
 * Represents a shipping exception.
 */
export interface ShippingException {
  id: Id;
  shipmentId: Id;
  exceptionType: ExceptionType;
  description: string;
  resolved: boolean;
  resolvedAt: Date | null;
  resolvedBy: Id | null;
  resolution?: string;
  metadata: Record<string, unknown> | null | undefined;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Return Request (Shipping)
 * Represents a return request for shipment.
 */
export interface ShipmentReturn {
  id: Id;
  shipmentId: Id;
  returnReason: ReturnReason;
  returnStatus: string;
  initiatedAt: Date;
  completedAt: Date | null;
  refundAmount: number;
  metadata: Record<string, unknown> | null | undefined;
  updatedAt: Date;
}

/**
 * Tracking Timeline
 * Represents the complete tracking timeline for a shipment.
 */
export interface TrackingTimeline {
  shipmentId: Id;
  trackingNumber: string;
  carrier: string;
  currentStatus: ShipmentStatus;
  customerVisibleStatus: string;
  estimatedDeliveryDate: Date | null;
  events: ShipmentEvent[];
  lastUpdated: Date;
}

/**
 * Shipment Summary
 * Represents a summary of shipment information.
 */
export interface ShipmentSummary {
  id: Id;
  orderNumber: string;
  status: ShipmentStatus;
  customerVisibleStatus: CustomerVisibleShipmentStatus;
  trackingNumber: string | null;
  carrier: string | null;
  estimatedDeliveryDate: Date | null;
  createdAt: Date;
}

/**
 * Fulfillment Metrics
 * Represents fulfillment performance metrics.
 */
export interface FulfillmentMetrics {
  totalShipments: number;
  shippedToday: number;
  inTransit: number;
  deliveredToday: number;
  failedDeliveries: number;
  averageFulfillmentTime: number; // in hours
  averageTransitTime: number; // in days
  onTimeDeliveryRate: number; // percentage
  carrierPerformance: CarrierPerformance[];
}

/**
 * Carrier Performance
 * Represents performance metrics for a carrier.
 */
export interface CarrierPerformance {
  carrierCode: CarrierType;
  carrierName: string;
  totalShipments: number;
  onTimeDeliveries: number;
  failedDeliveries: number;
  averageTransitTime: number; // in days
  onTimeRate: number; // percentage
}

/**
 * Create Shipment Input
 * Input for creating a shipment.
 */
export interface CreateShipmentInput {
  orderId: Id;
  shippingMethod: ShippingMethod;
  carrierCode: CarrierType | null;
  trackingNumber: string | null;
  estimatedDeliveryDate: Date | null;
  items: Omit<ShipmentItem, 'id' | 'shipmentId' | 'createdAt'>[];
}

/**
 * Update Shipment Status Input
 * Input for updating shipment status.
 */
export interface UpdateShipmentStatusInput {
  shipmentId: Id;
  status: ShipmentStatus;
  actorType: ActorType;
  actorId: Id | null;
  reason?: string;
  metadata?: Record<string, unknown>;
  currentStatus?: ShipmentStatus;
}

/**
 * Get Shipping Rates Input
 * Input for getting shipping rates.
 */
export interface GetShippingRatesInput {
  origin: ShippingAddress;
  destination: ShippingAddress;
  weight: number; // in grams
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  shippingMethods?: ShippingMethod[];
}

/**
 * Create Carrier Input
 * Input for creating a carrier.
 */
export interface CreateCarrierInput {
  code: CarrierType;
  name: string;
  displayName: string;
  config: CarrierConfig;
  trackingUrlTemplate?: string;
}

/**
 * Fulfillment Workflow Input
 * Input for fulfillment workflow.
 */
export interface FulfillmentWorkflowInput {
  orderId: Id;
  items: Omit<ShipmentItem, 'id' | 'shipmentId' | 'createdAt'>[];
  shippingMethod: ShippingMethod;
  shippingAddress: ShippingAddress;
}

/**
 * Tracking Update Input
 * Input for tracking updates from carrier webhooks.
 */
export interface TrackingUpdateInput {
  trackingNumber: string;
  carrierCode: CarrierType;
  status: TrackingEventType;
  location?: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Shipment Filter Options
 * Filter options for querying shipments.
 */
export interface ShipmentFilterOptions {
  orderId?: Id;
  status?: ShipmentStatus;
  carrierCode?: CarrierType;
  trackingNumber?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Fulfillment Filter Options
 * Filter options for querying fulfillment queue.
 */
export interface FulfillmentFilterOptions {
  status?: FulfillmentStatus;
  assignedTo?: Id;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

/**
 * State Transition Result
 * Result of a state transition.
 */
export interface StateTransitionResult {
  success: boolean;
  previousStatus: ShipmentStatus;
  newStatus: ShipmentStatus;
  error?: string;
}

/**
 * Tracking Event Result
 * Result of adding a tracking event.
 */
export interface TrackingEventResult {
  success: boolean;
  eventId: Id;
  error?: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Logistics Events
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Base Logistics Event
 */
export interface LogisticsEvent {
  type: string;
  timestamp: Date;
  data: unknown;
}

/**
 * Shipment Created Event
 */
export interface ShipmentCreatedEvent {
  shipmentId: Id;
  orderId: Id;
  carrierCode: string | null;
  status: ShipmentStatus;
}

/**
 * Shipment Status Changed Event
 */
export interface ShipmentStatusChangedEvent {
  shipmentId: Id;
  orderId: Id;
  previousStatus: ShipmentStatus;
  newStatus: ShipmentStatus;
  actorType: string;
  actorId: Id | null;
}

/**
 * Tracking Event Added Event
 */
export interface TrackingEventAddedEvent {
  shipmentId: Id;
  trackingNumber: string;
  status: TrackingEventType;
  location: string | null;
  description: string;
}

/**
 * Fulfillment Completed Event
 */
export interface FulfillmentCompletedEvent {
  fulfillmentId: Id;
  orderId: Id;
  shipmentId: Id | null;
  completedBy: Id;
}

/**
 * Delivery Confirmed Event
 */
export interface DeliveryConfirmedEvent {
  shipmentId: Id;
  orderId: Id;
  confirmationType: string;
  confirmedBy: Id;
}

/**
 * Shipping Exception Event
 */
export interface ShippingExceptionEvent {
  exceptionId: Id;
  shipmentId: Id;
  exceptionType: ExceptionType;
  description: string;
}
