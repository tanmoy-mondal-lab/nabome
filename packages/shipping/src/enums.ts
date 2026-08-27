/**
 * Shipping Module Enums
 *
 * This file contains all enum definitions for the Shipping & Fulfillment Management System.
 * These enums align with the SHIPPING_DELIVERY_LOGISTICS_ARCHITECTURE.md and resolve
 * the canonical shipment-status enum from MASTER_ARCHITECTURE_BLUEPRINT.md.
 *
 * Source: SHIPPING_DELIVERY_LOGISTICS_ARCHITECTURE.md (binding)
 */

/**
 * Shipment Status Enum (12 states)
 * This is the canonical shipment status enum for the entire Nabome system.
 *
 * Lifecycle Flow:
 * Created → Ready To Pack → Packed → Ready For Pickup → Picked Up →
 * In Transit → Out For Delivery → Delivered → Closed
 *
 * Alternative flows:
 * - In Transit → Delivery Failed → Out For Delivery (retry) → Returned To Sender
 * - In Transit → Exception → In Transit (resolved)
 * - Delivered → Returned To Sender → Closed
 * - Any state → Cancelled (with restrictions)
 */
export enum ShipmentStatus {
  SHIPMENT_CREATED = 'shipment_created',
  READY_TO_PACK = 'ready_to_pack',
  PACKED = 'packed',
  READY_FOR_PICKUP = 'ready_for_pickup',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  DELIVERY_FAILED = 'delivery_failed',
  EXCEPTION = 'exception',
  RETURNED_TO_SENDER = 'returned_to_sender',
  CANCELLED = 'cancelled',
  CLOSED = 'closed',
  AWAITING_PICKUP = 'ready_for_pickup',
}

/**
 * Customer-Visible Shipment Status (8 states)
 * Simplified view for customers to avoid confusion.
 * Maps internal states to customer-friendly statuses.
 */
export enum CustomerVisibleShipmentStatus {
  PROCESSING = 'processing',
  PACKED = 'packed',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  DELIVERY_FAILED = 'delivery_failed',
  RETURNED = 'returned',
}

/**
 * Shipping Method Enum
 * Available shipping methods for customers.
 */
export enum ShippingMethod {
  STANDARD = 'standard',
  EXPRESS = 'express',
  SAME_DAY = 'same_day',
  PICKUP = 'pickup',
  INTERNATIONAL = 'international',
}

/**
 * Carrier Type Enum
 * Types of logistics providers supported.
 */
export enum CarrierType {
  MANUAL = 'manual',
  SHIPROCKET = 'shiprocket',
  DELHIVERY = 'delhivery',
  BLUEDART = 'bluedart',
  DTDC = 'dtdc',
  EKART = 'ekart',
  INDIA_POST = 'india_post',
  DHL = 'dhl',
  FEDEX = 'fedex',
  UPS = 'ups',
  CUSTOM = 'custom',
}

/**
 * Tracking Event Type Enum
 * Types of tracking events that can occur during shipment.
 */
export enum TrackingEventType {
  SHIPMENT_CREATED = 'shipment_created',
  READY_TO_PACK = 'ready_to_pack',
  PACKED = 'packed',
  READY_FOR_PICKUP = 'ready_for_pickup',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  DELIVERY_FAILED = 'delivery_failed',
  EXCEPTION = 'exception',
  RETURNED_TO_SENDER = 'returned_to_sender',
  CANCELLED = 'cancelled',
}

/**
 * Actor Type Enum
 * Who performed a shipment action.
 */
export enum ActorType {
  CUSTOMER = 'customer',
  SHOP_OWNER = 'shop_owner',
  ADMIN = 'admin',
  COURIER = 'courier',
  CARRIER = 'courier',
  SYSTEM = 'system',
}

/**
 * Fulfillment Status Enum
 * Status of fulfillment operations.
 */
export enum FulfillmentStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * Package Type Enum
 * Types of packages in a shipment.
 */
export enum PackageType {
  STANDARD = 'standard',
  FRAGILE = 'fragile',
  OVERSIZED = 'oversized',
  LIQUID = 'liquid',
  PERISHABLE = 'perishable',
}

/**
 * Delivery Confirmation Type Enum
 * Methods of delivery confirmation.
 */
export enum DeliveryConfirmationType {
  SIGNATURE = 'signature',
  PHOTO = 'photo',
  OTP = 'otp',
  NONE = 'none',
}

/**
 * Exception Type Enum
 * Types of shipping exceptions.
 */
export enum ExceptionType {
  WEATHER = 'weather',
  ADDRESS_ISSUE = 'address_issue',
  CUSTOMS_HOLD = 'customs_hold',
  DAMAGE = 'damage',
  LOST = 'lost',
  DELAYED = 'delayed',
  RECIPIENT_UNAVAILABLE = 'recipient_unavailable',
  OTHER = 'other',
}

/**
 * Return Reason Enum
 * Reasons for shipment returns.
 */
export enum ReturnReason {
  DAMAGED = 'damaged',
  WRONG_ITEM = 'wrong_item',
  NOT_AS_DESCRIBED = 'not_as_described',
  NO_LONGER_NEEDED = 'no_longer_needed',
  DEFECTIVE = 'defective',
  ARRIVED_LATE = 'arrived_late',
  OTHER = 'other',
}

/**
 * Document Type Enum
 * Types of shipping documents.
 */
export enum DocumentType {
  PACKING_SLIP = 'packing_slip',
  SHIPPING_LABEL = 'shipping_label',
  COMMERCIAL_INVOICE = 'commercial_invoice',
  CUSTOMS_DECLARATION = 'customs_declaration',
  DELIVERY_RECEIPT = 'delivery_receipt',
  RETURN_LABEL = 'return_label',
}

/**
 * Carrier Status Enum
 * Status of carrier integration.
 */
export enum CarrierStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  DISABLED = 'disabled',
}

/**
 * Rate Calculation Status Enum
 * Status of shipping rate calculations.
 */
export enum RateCalculationStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending',
}

/**
 * Label Generation Status Enum
 * Status of shipping label generation.
 */
export enum LabelGenerationStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending',
}
