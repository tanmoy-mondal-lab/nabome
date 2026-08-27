/**
 * Inventory Module Enums
 *
 * This file contains all enum definitions for the inventory management system.
 * These enums align with the Prisma schema and architecture specifications.
 */

/**
 * Stock Movement Types
 * Represents all possible ways stock can move in the system.
 * Every movement must be auditable and immutable.
 */
export enum StockMovementType {
  INITIAL_STOCK = 'initial_stock',
  PURCHASE = 'purchase',
  SALE = 'sale',
  RESERVATION = 'reservation',
  RELEASE = 'release',
  RETURN = 'return',
  REFUND = 'refund',
  DAMAGE = 'damage',
  ADJUSTMENT = 'adjustment',
  TRANSFER = 'transfer',
  MANUAL_UPDATE = 'manual_update',
}

/**
 * Reservation Status
 * Tracks the lifecycle of stock reservations to prevent overselling.
 */
export enum ReservationStatus {
  ACTIVE = 'active',
  RELEASED = 'released',
  EXPIRED = 'expired',
  CONVERTED = 'converted',
}

/**
 * Warehouse Status
 * Represents the operational status of a warehouse.
 */
export enum WarehouseStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
}

/**
 * Inventory Status
 * Represents the current availability status of a variant.
 * This is calculated based on available stock and thresholds.
 */
export enum InventoryStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  BACKORDER = 'backorder',
}

/**
 * Stock Movement Source
 * Identifies who or what initiated a stock movement.
 */
export enum StockMovementSource {
  SYSTEM = 'system',
  ADMIN = 'admin',
  SHOP_OWNER = 'shop_owner',
  CUSTOMER = 'customer',
  WEBHOOK = 'webhook',
  API = 'api',
  BATCH_JOB = 'batch_job',
}

/**
 * Reference Type
 * Identifies the type of entity referenced in a stock movement.
 */
export enum ReferenceType {
  ORDER = 'order',
  CART = 'cart',
  PURCHASE_ORDER = 'purchase_order',
  RETURN_REQUEST = 'return_request',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment',
  DAMAGE_REPORT = 'damage_report',
}
