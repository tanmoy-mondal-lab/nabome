/**
 * Inventory Service
 *
 * Business logic layer for inventory operations.
 * This service implements business rules, validations, and workflows.
 * It uses the repository for data access.
 *
 * All business logic belongs here - NOT in the repository or API handlers.
 */

import {
  warehouseRepository,
  stockMovementRepository,
  stockReservationRepository,
  lowStockAlertRepository,
  inventorySettingsRepository,
  variantInventoryRepository,
  bulkInventoryRepository,
} from './repository';
import {
  StockMovementType,
  ReservationStatus,
  WarehouseStatus,
  InventoryStatus,
} from './repository';
import type {
  StockMovementCreateInput,
  StockReservationCreateInput,
  WarehouseCreateInput,
  WarehouseUpdateInput,
  InventorySettingsUpdateInput,
  AvailabilityCheckResult,
  BulkStockUpdateInput,
  StockTransferInput,
  ProductVariantWithInventory,
  InventorySummary,
} from './repository';

/**
 * Inventory Service
 */
export const inventoryService = {
  /**
   * Reserve stock for a variant
   * This prevents overselling by temporarily reserving stock
   */
  async reserveStock(
    variantId: string,
    quantity: number,
    cartId?: string,
    orderId?: string,
    warehouseId?: string,
  ): Promise<{ success: boolean; reservationId?: string; error?: string }> {
    // Validate quantity
    if (quantity <= 0) {
      return { success: false, error: 'Quantity must be positive' };
    }

    // Get current variant stock
    const variant = await variantInventoryRepository.findById(variantId);
    if (!variant) {
      return { success: false, error: 'Variant not found' };
    }

    // Check if enough stock is available
    if (variant.realAvailableStock < quantity) {
      return {
        success: false,
        error: `Insufficient stock. Available: ${variant.realAvailableStock}, Requested: ${quantity}`,
      };
    }

    // Get inventory settings for timeout
    const settings = await inventorySettingsRepository.findByShopId();
    const timeoutMinutes = settings?.reservationTimeout || 15;
    const expiresAt = new Date(Date.now() + timeoutMinutes * 60 * 1000);

    // Create reservation
    const reservation = await stockReservationRepository.create({
      variantId,
      warehouseId,
      orderId,
      cartId,
      quantity,
      expiresAt,
    });

    // Update variant reserved stock
    // Note: This is handled by the availability calculation, not by updating reservedStock directly
    // The reservedStock field on ProductVariant is a cache that should be updated periodically

    return { success: true, reservationId: reservation.id };
  },

  /**
   * Release a stock reservation
   * This is called when checkout is abandoned or order is cancelled
   */
  async releaseReservation(reservationId: string): Promise<boolean> {
    const reservation =
      await stockReservationRepository.findById(reservationId);
    if (!reservation) {
      return false;
    }

    if (reservation.status !== ReservationStatus.ACTIVE) {
      return false;
    }

    await stockReservationRepository.updateStatus(
      reservationId,
      ReservationStatus.RELEASED,
    );
    return true;
  },

  /**
   * Convert reservation to actual stock deduction
   * This is called when order is confirmed
   */
  async convertReservation(reservationId: string): Promise<boolean> {
    const reservation =
      await stockReservationRepository.findById(reservationId);
    if (!reservation) {
      return false;
    }

    if (reservation.status !== ReservationStatus.ACTIVE) {
      return false;
    }

    // Create stock movement for the sale
    await stockMovementRepository.create({
      variantId: reservation.variantId,
      warehouseId: reservation.warehouseId,
      type: StockMovementType.SALE,
      quantity: -reservation.quantity,
      reason: 'Order confirmed',
      referenceId: reservation.orderId,
      referenceType: 'order',
    });

    // Update reservation status
    await stockReservationRepository.updateStatus(
      reservationId,
      ReservationStatus.CONVERTED,
    );

    return true;
  },

  /**
   * Add stock to a variant (purchase, restock, etc.)
   */
  async addStock(
    variantId: string,
    quantity: number,
    type: StockMovementType,
    reason?: string,
    performedBy?: string,
    warehouseId?: string,
  ): Promise<{ success: boolean; error?: string }> {
    if (quantity <= 0) {
      return { success: false, error: 'Quantity must be positive' };
    }

    const variant = await variantInventoryRepository.findById(variantId);
    if (!variant) {
      return { success: false, error: 'Variant not found' };
    }

    await stockMovementRepository.create({
      variantId,
      warehouseId,
      type,
      quantity,
      reason: reason || 'Stock addition',
      performedBy,
      performedByType: performedBy ? 'admin' : 'system',
    });

    // Check if this brings variant out of low stock
    if (
      variant.isLowStock &&
      variant.availableStock + quantity > variant.lowStockThreshold
    ) {
      // Could trigger a "back in stock" notification here
    }

    return { success: true };
  },

  /**
   * Check availability for multiple variants
   * Returns detailed including whether each can be fulfilled
   */
  async checkAvailability(
    variantIds: string[],
  ): Promise<AvailabilityCheckResult[]> {
    return variantInventoryRepository.checkAvailability(variantIds);
  },

  /**
   * Check if a single variant can fulfill a quantity
   */
  async canFulfill(variantId: string, quantity: number): Promise<boolean> {
    const results = await this.checkAvailability([variantId]);
    const result = results[0];
    return result ? result.canFulfillQuantity >= quantity : false;
  },

  /**
   * Calculate inventory status based on stock levels
   */
  calculateInventoryStatus(
    availableStock: number,
    lowStockThreshold: number,
  ): InventoryStatus {
    if (availableStock <= 0) {
      return InventoryStatus.OUT_OF_STOCK;
    }
    if (availableStock <= lowStockThreshold) {
      return InventoryStatus.LOW_STOCK;
    }
    return InventoryStatus.IN_STOCK;
  },

  /**
   * Update inventory status for a variant
   */
  async updateInventoryStatus(variantId: string): Promise<void> {
    const variant = await variantInventoryRepository.findById(variantId);
    if (!variant) {
      return;
    }

    const newStatus = this.calculateInventoryStatus(
      variant.realAvailableStock,
      variant.lowStockThreshold,
    );

    // Update the variant's inventory status in the database
    // This would require a direct update to ProductVariant table
    // For now, this is a placeholder for the actual implementation
  },

  /**
   * Check for low stock and create alerts if needed
   */
  async checkLowStock(variantId: string): Promise<void> {
    const variant = await variantInventoryRepository.findById(variantId);
    if (!variant) {
      return;
    }

    if (variant.isLowStock) {
      // Check if alert already exists and is unacknowledged
      const existingAlerts =
        await lowStockAlertRepository.findByVariantId(variantId);
      const unacknowledgedAlert = existingAlerts.find((a) => !a.isAcknowledged);

      if (!unacknowledgedAlert) {
        // Create new alert
        await lowStockAlertRepository.create(
          variantId,
          variant.availableStock,
          variant.lowStockThreshold,
        );
      }
    }
  },

  /**
   * Get inventory summary
   */
  async getSummary(): Promise<InventorySummary> {
    return variantInventoryRepository.getSummary();
  },

  /**
   * Bulk stock update
   */
  async bulkUpdate(
    input: BulkStockUpdateInput,
  ): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];

    for (const update of input.updates) {
      try {
        const variant = await variantInventoryRepository.findById(
          update.variantId,
        );
        if (!variant) {
          errors.push(`Variant ${update.variantId} not found`);
          continue;
        }

        // Validate the update won't cause negative stock
        if (
          update.type === StockMovementType.SALE &&
          variant.availableStock < update.quantity
        ) {
          errors.push(`Insufficient stock for variant ${update.variantId}`);
          continue;
        }

        await stockMovementRepository.create({
          ...update,
          performedBy: input.performedBy,
          performedByType: input.performedByType,
        });
      } catch (error) {
        errors.push(`Failed to update variant ${update.variantId}: ${error}`);
      }
    }

    return { success: errors.length === 0, errors };
  },

  /**
   * Transfer stock between warehouses
   */
  async transferStock(
    input: StockTransferInput,
  ): Promise<{ success: boolean; error?: string }> {
    // Validate source warehouse has enough stock
    const sourceVariant = await variantInventoryRepository.findById(
      input.variantId,
    );
    if (!sourceVariant) {
      return { success: false, error: 'Variant not found' };
    }

    if (sourceVariant.availableStock < input.quantity) {
      return {
        success: false,
        error: `Insufficient stock in source warehouse. Available: ${sourceVariant.availableStock}, Requested: ${input.quantity}`,
      };
    }

    // Validate warehouses exist
    const sourceWarehouse = await warehouseRepository.findById(
      input.fromWarehouseId,
    );
    const destWarehouse = await warehouseRepository.findById(
      input.toWarehouseId,
    );

    if (!sourceWarehouse || !destWarehouse) {
      return { success: false, error: 'One or both warehouses not found' };
    }

    if (!sourceWarehouse.isActive || !destWarehouse.isActive) {
      return { success: false, error: 'One or both warehouses are inactive' };
    }

    // Perform transfer
    await bulkInventoryRepository.transferStock(input);

    return { success: true };
  },

  /**
   * Expire old reservations
   * This should be called periodically (e.g., via cron job)
   */
  async expireOldReservations(): Promise<number> {
    return stockReservationRepository.expireOldReservations();
  },

  /**
   * Get stock movement history for a variant
   */
  async getMovementHistory(variantId: string, limit = 50, offset = 0) {
    return stockMovementRepository.findByVariantId(variantId, limit, offset);
  },

  /**
   * Get active reservations for a variant
   */
  async getActiveReservations(variantId: string) {
    return stockReservationRepository.findActiveByVariantId(variantId);
  },
};

/**
 * Warehouse Service
 */
export const warehouseService = {
  /**
   * Create a new warehouse
   */
  async create(
    input: WarehouseCreateInput,
  ): Promise<{ success: boolean; warehouse?: any; error?: string }> {
    // Check if code is unique
    const existing = await warehouseRepository.findByCode(input.code);
    if (existing) {
      return { success: false, error: 'Warehouse code already exists' };
    }

    const warehouse = await warehouseRepository.create(input);
    return { success: true, warehouse };
  },

  /**
   * Update warehouse
   */
  async update(
    id: string,
    input: WarehouseUpdateInput,
  ): Promise<{ success: boolean; warehouse?: any; error?: string }> {
    const existing = await warehouseRepository.findById(id);
    if (!existing) {
      return { success: false, error: 'Warehouse not found' };
    }

    const warehouse = await warehouseRepository.update(id, input);
    return { success: true, warehouse };
  },

  /**
   * Delete warehouse (soft delete)
   */
  async delete(id: string): Promise<{ success: boolean; error?: string }> {
    const existing = await warehouseRepository.findById(id);
    if (!existing) {
      return { success: false, error: 'Warehouse not found' };
    }

    // Check if warehouse has stock
    // This would require checking stock movements or reservations
    // For now, we'll allow deletion but should add validation

    await warehouseRepository.delete(id);
    return { success: true };
  },

  /**
   * Get all warehouses
   */
  async findAll() {
    return warehouseRepository.findAll();
  },

  /**
   * Get active warehouses only
   */
  async findActive() {
    return warehouseRepository.findActive();
  },

  /**
   * Get warehouse by ID
   */
  async findById(id: string) {
    return warehouseRepository.findById(id);
  },
};

/**
 * Inventory Settings Service
 */
export const inventorySettingsService = {
  /**
   * Get settings for a shop
   */
  async getSettings(shopId?: string) {
    return inventorySettingsRepository.findByShopId(shopId);
  },

  /**
   * Update settings for a shop
   */
  async updateSettings(shopId: string, input: InventorySettingsUpdateInput) {
    return inventorySettingsRepository.upsert(shopId, input);
  },
};

/**
 * Low Stock Alert Service
 */
export const lowStockAlertService = {
  /**
   * Get unacknowledged alerts
   */
  async getUnacknowledged() {
    return lowStockAlertRepository.findUnacknowledged();
  },

  /**
   * Acknowledge an alert
   */
  async acknowledge(alertId: string, acknowledgedBy: string) {
    return lowStockAlertRepository.acknowledge(alertId, acknowledgedBy);
  },

  /**
   * Get alerts for a variant
   */
  async getByVariant(variantId: string) {
    return lowStockAlertRepository.findByVariantId(variantId);
  },
};
