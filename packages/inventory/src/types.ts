/**
 * Inventory Module Types
 *
 * This file contains all TypeScript interfaces and types for the inventory management system.
 * These types align with the Prisma schema and architecture specifications.
 */

import type {
  StockMovementType,
  ReservationStatus,
  WarehouseStatus,
  InventoryStatus,
  StockMovementSource,
  ReferenceType,
} from './enums';

/**
 * Warehouse Entity
 * Represents a physical or virtual warehouse location.
 */
export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
  status: WarehouseStatus;
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Stock Movement Entity
 * Represents an immutable record of stock change.
 * Every movement is auditable and cannot be modified after creation.
 */
export interface StockMovement {
  id: string;
  variantId: string;
  warehouseId?: string;
  type: StockMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  referenceId?: string;
  referenceType?: string;
  performedBy?: string;
  performedByType?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

/**
 * Stock Reservation Entity
 * Represents a temporary reservation of stock to prevent overselling.
 */
export interface StockReservation {
  id: string;
  variantId: string;
  warehouseId?: string;
  orderId?: string;
  cartId?: string;
  quantity: number;
  status: ReservationStatus;
  expiresAt: Date;
  releasedAt?: Date;
  convertedAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Low Stock Alert Entity
 * Represents an alert when stock falls below threshold.
 */
export interface LowStockAlert {
  id: string;
  variantId: string;
  currentStock: number;
  threshold: number;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

/**
 * Inventory Settings Entity
 * Represents shop-level inventory configuration.
 */
export interface InventorySettings {
  id: string;
  shopId?: string;
  lowStockThreshold: number;
  reservationTimeout: number;
  enableAutoRestock: boolean;
  restockThreshold?: number;
  restockQuantity?: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Product Variant with Inventory
 * Extends the base variant with inventory-specific computed fields.
 */
export interface ProductVariantWithInventory {
  id: string;
  productId: string;
  sku: string;
  name: string;
  attributes?: Record<string, unknown>;
  price: number;
  compareAtPrice?: number;
  availableStock: number;
  reservedStock: number;
  inventoryStatus: InventoryStatus;
  lowStockThreshold: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;

  // Computed fields
  totalStock: number;
  realAvailableStock: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

/**
 * Stock Movement Create Input
 * Input for creating a new stock movement.
 */
export interface StockMovementCreateInput {
  variantId: string;
  warehouseId?: string;
  type: StockMovementType;
  quantity: number;
  reason?: string;
  referenceId?: string;
  referenceType?: ReferenceType;
  performedBy?: string;
  performedByType?: StockMovementSource;
  metadata?: Record<string, unknown>;
}

/**
 * Stock Reservation Create Input
 * Input for creating a new stock reservation.
 */
export interface StockReservationCreateInput {
  variantId: string;
  warehouseId?: string;
  orderId?: string;
  cartId?: string;
  quantity: number;
  expiresAt: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Warehouse Create Input
 * Input for creating a new warehouse.
 */
export interface WarehouseCreateInput {
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  phone?: string;
  email?: string;
  priority?: number;
}

/**
 * Warehouse Update Input
 * Input for updating an existing warehouse.
 */
export interface WarehouseUpdateInput {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  status?: WarehouseStatus;
  priority?: number;
  isActive?: boolean;
}

/**
 * Inventory Settings Update Input
 * Input for updating inventory settings.
 */
export interface InventorySettingsUpdateInput {
  lowStockThreshold?: number;
  reservationTimeout?: number;
  enableAutoRestock?: boolean;
  restockThreshold?: number;
  restockQuantity?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Stock Movement Query Options
 * Options for querying stock movements.
 */
export interface StockMovementQueryOptions {
  variantId?: string;
  warehouseId?: string;
  type?: StockMovementType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Stock Reservation Query Options
 * Options for querying stock reservations.
 */
export interface StockReservationQueryOptions {
  variantId?: string;
  warehouseId?: string;
  orderId?: string;
  cartId?: string;
  status?: ReservationStatus;
  expired?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Inventory Summary
 * Summary statistics for inventory.
 */
export interface InventorySummary {
  totalVariants: number;
  totalStock: number;
  totalReserved: number;
  totalAvailable: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  backorderCount: number;
}

/**
 * Warehouse Stock Summary
 * Stock summary for a specific warehouse.
 */
export interface WarehouseStockSummary {
  warehouseId: string;
  warehouseName: string;
  totalVariants: number;
  totalStock: number;
  totalReserved: number;
  totalAvailable: number;
}

/**
 * Bulk Stock Update Input
 * Input for bulk stock updates.
 */
export interface BulkStockUpdateInput {
  updates: Array<{
    variantId: string;
    quantity: number;
    type: StockMovementType;
    reason?: string;
  }>;
  performedBy?: string;
  performedByType?: StockMovementSource;
}

/**
 * Stock Transfer Input
 * Input for transferring stock between warehouses.
 */
export interface StockTransferInput {
  variantId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
  reason?: string;
  performedBy?: string;
}

/**
 * Availability Check Result
 * Result of checking stock availability.
 */
export interface AvailabilityCheckResult {
  variantId: string;
  sku: string;
  availableStock: number;
  reservedStock: number;
  realAvailableStock: number;
  canFulfill: boolean;
  canFulfillQuantity: number;
  inventoryStatus: InventoryStatus;
  lowStockThreshold: number;
  isLowStock: boolean;
}
