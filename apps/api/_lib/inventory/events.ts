/**
 * Inventory Events
 *
 * Event definitions and handlers for inventory-related events.
 * Events are emitted for stock movements, reservations, and low stock alerts.
 */

// Event Types
export enum InventoryEventType {
  STOCK_RESERVED = 'stock.reserved',
  STOCK_RELEASED = 'stock.released',
  STOCK_CONVERTED = 'stock.converted',
  STOCK_ADDED = 'stock.added',
  STOCK_Deducted = 'stock.deducted',
  STOCK_TRANSFERRED = 'stock.transferred',
  LOW_STOCK_ALERT = 'low_stock.alert',
  OUT_OF_STOCK = 'out_of_stock',
  WAREHOUSE_CREATED = 'warehouse.created',
  WAREHOUSE_UPDATED = 'warehouse.updated',
  WAREHOUSE_DELETED = 'warehouse.deleted',
  RESERVATION_EXPIRED = 'reservation.expired',
}

// Event Payloads
export interface StockReservedEvent {
  variantId: string;
  quantity: number;
  reservationId: string;
  cartId?: string;
  orderId?: string;
  warehouseId?: string;
  userId?: string;
  timestamp: Date;
}

export interface StockReleasedEvent {
  variantId: string;
  quantity: number;
  reservationId: string;
  reason: string;
  userId?: string;
  timestamp: Date;
}

export interface StockConvertedEvent {
  variantId: string;
  quantity: number;
  reservationId: string;
  orderId: string;
  userId?: string;
  timestamp: Date;
}

export interface StockAddedEvent {
  variantId: string;
  quantity: number;
  type: string;
  reason?: string;
  warehouseId?: string;
  userId?: string;
  timestamp: Date;
}

export interface StockDeductedEvent {
  variantId: string;
  quantity: number;
  type: string;
  reason?: string;
  warehouseId?: string;
  userId?: string;
  timestamp: Date;
}

export interface StockTransferredEvent {
  variantId: string;
  quantity: number;
  fromWarehouseId: string;
  toWarehouseId: string;
  userId?: string;
  timestamp: Date;
}

export interface LowStockAlertEvent {
  variantId: string;
  currentStock: number;
  threshold: number;
  shopId?: string;
  timestamp: Date;
}

export interface OutOfStockEvent {
  variantId: string;
  shopId?: string;
  timestamp: Date;
}

export interface WarehouseCreatedEvent {
  warehouseId: string;
  name: string;
  code: string;
  userId?: string;
  timestamp: Date;
}

export interface WarehouseUpdatedEvent {
  warehouseId: string;
  changes: Record<string, unknown>;
  userId?: string;
  timestamp: Date;
}

export interface WarehouseDeletedEvent {
  warehouseId: string;
  userId?: string;
  timestamp: Date;
}

export interface ReservationExpiredEvent {
  reservationId: string;
  variantId: string;
  quantity: number;
  timestamp: Date;
}

// Event Handler Type
export type InventoryEventHandler = (event: unknown) => Promise<void> | void;

// Event Bus
class InventoryEventBus {
  private handlers: Map<InventoryEventType, Set<InventoryEventHandler>> =
    new Map();

  /**
   * Subscribe to an event
   */
  on(eventType: InventoryEventType, handler: InventoryEventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
  }

  /**
   * Unsubscribe from an event
   */
  off(eventType: InventoryEventType, handler: InventoryEventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Emit an event
   */
  async emit(eventType: InventoryEventType, event: unknown): Promise<void> {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const promises = Array.from(handlers).map((handler) => handler(event));
      await Promise.allSettled(promises);
    }
  }

  /**
   * Clear all handlers for an event type
   */
  clear(eventType: InventoryEventType): void {
    this.handlers.delete(eventType);
  }

  /**
   * Clear all handlers
   */
  clearAll(): void {
    this.handlers.clear();
  }
}

// Global event bus instance
export const inventoryEventBus = new InventoryEventBus();

// Default Event Handlers

/**
 * Handler for low stock alerts - creates notification
 */
export async function handleLowStockAlert(event: unknown): Promise<void> {
  const typedEvent = event as LowStockAlertEvent;
  // In a real implementation, this would:
  // 1. Create a notification in the notification system
  // 2. Send email to shop owner
  // 3. Potentially trigger auto-reorder if enabled
  console.log('Low stock alert:', typedEvent);
}

/**
 * Handler for out of stock events - creates urgent notification
 */
export async function handleOutOfStock(event: unknown): Promise<void> {
  const typedEvent = event as OutOfStockEvent;
  // In a real implementation, this would:
  // 1. Create urgent notification
  // 2. Send email to shop owner
  // 3. Potentially disable product on storefront
  console.log('Out of stock event:', typedEvent);
}

/**
 * Handler for stock reserved events - updates analytics
 */
export async function handleStockReserved(event: unknown): Promise<void> {
  const typedEvent = event as StockReservedEvent;
  // In a real implementation, this would:
  // 1. Update analytics
  // 2. Track conversion funnel
  console.log('Stock reserved:', typedEvent);
}

/**
 * Handler for stock converted events - updates sales analytics
 */
export async function handleStockConverted(event: unknown): Promise<void> {
  const typedEvent = event as StockConvertedEvent;
  // In a real implementation, this would:
  // 1. Update sales analytics
  // 2. Update revenue tracking
  console.log('Stock converted:', typedEvent);
}

/**
 * Handler for warehouse created events - logs to audit trail
 */
export async function handleWarehouseCreated(event: unknown): Promise<void> {
  const typedEvent = event as WarehouseCreatedEvent;
  // In a real implementation, this would:
  // 1. Log to audit trail
  // 2. Update system metrics
  console.log('Warehouse created:', typedEvent);
}

/**
 * Register default event handlers
 */
export function registerDefaultEventHandlers(): void {
  inventoryEventBus.on(InventoryEventType.LOW_STOCK_ALERT, handleLowStockAlert);
  inventoryEventBus.on(InventoryEventType.OUT_OF_STOCK, handleOutOfStock);
  inventoryEventBus.on(InventoryEventType.STOCK_RESERVED, handleStockReserved);
  inventoryEventBus.on(
    InventoryEventType.STOCK_CONVERTED,
    handleStockConverted,
  );
  inventoryEventBus.on(
    InventoryEventType.WAREHOUSE_CREATED,
    handleWarehouseCreated,
  );
}

// Helper functions to emit events

/**
 * Emit stock reserved event
 */
export async function emitStockReserved(
  event: StockReservedEvent,
): Promise<void> {
  await inventoryEventBus.emit(InventoryEventType.STOCK_RESERVED, event);
}

/**
 * Emit stock released event
 */
export async function emitStockReleased(
  event: StockReleasedEvent,
): Promise<void> {
  await inventoryEventBus.emit(InventoryEventType.STOCK_RELEASED, event);
}

/**
 * Emit stock converted event
 */
export async function emitStockConverted(
  event: StockConvertedEvent,
): Promise<void> {
  await inventoryEventBus.emit(InventoryEventType.STOCK_CONVERTED, event);
}

/**
 * Emit stock added event
 */
export async function emitStockAdded(event: StockAddedEvent): Promise<void> {
  await inventoryEventBus.emit(InventoryEventType.STOCK_ADDED, event);
}

/**
 * Emit low stock alert event
 */
export async function emitLowStockAlert(
  event: LowStockAlertEvent,
): Promise<void> {
  await inventoryEventBus.emit(InventoryEventType.LOW_STOCK_ALERT, event);
}

/**
 * Emit out of stock event
 */
export async function emitOutOfStock(event: OutOfStockEvent): Promise<void> {
  await inventoryEventBus.emit(InventoryEventType.OUT_OF_STOCK, event);
}

/**
 * Emit warehouse created event
 */
export async function emitWarehouseCreated(
  event: WarehouseCreatedEvent,
): Promise<void> {
  await inventoryEventBus.emit(InventoryEventType.WAREHOUSE_CREATED, event);
}
