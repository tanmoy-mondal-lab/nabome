/**
 * Inventory Repository
 *
 * Data access layer for inventory operations.
 * This repository handles all database interactions for inventory,
 * warehouse, stock movements, and reservations.
 *
 * Business logic should NOT be here - this is purely data access.
 */

import { PrismaClient } from '@prisma/client';

// Temporarily define types inline until package is properly linked
// These will be replaced with imports from @nabome/inventory after workspace setup
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

export enum ReservationStatus {
  ACTIVE = 'active',
  RELEASED = 'released',
  EXPIRED = 'expired',
  CONVERTED = 'converted',
}

export enum WarehouseStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
}

export enum InventoryStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  BACKORDER = 'backorder',
}

// Type definitions (temporary until package linking)
export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string | null;
  email?: string | null;
  status: WarehouseStatus;
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  variantId: string;
  warehouseId?: string | null;
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

export interface StockReservation {
  id: string;
  variantId: string;
  warehouseId?: string | null;
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

export interface LowStockAlert {
  id: string;
  variantId: string;
  currentStock: number;
  threshold: number;
  isAcknowledged: boolean;
  acknowledgedBy?: string | null;
  acknowledgedAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface InventorySettings {
  id: string;
  shopId?: string | null;
  lowStockThreshold: number;
  reservationTimeout: number;
  enableAutoRestock: boolean;
  restockThreshold?: number;
  restockQuantity?: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariantWithInventory {
  id: string;
  productId: string;
  sku: string;
  name: string;
  attributes?: unknown;
  price: number | { toNumber: () => number };
  compareAtPrice?: number | { toNumber: () => number } | null;
  availableStock: number;
  reservedStock: number;
  inventoryStatus: InventoryStatus | string;
  lowStockThreshold: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  totalStock: number;
  realAvailableStock: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

export interface StockMovementCreateInput {
  variantId: string;
  warehouseId?: string | null;
  type: StockMovementType;
  quantity: number;
  reason?: string;
  referenceId?: string;
  referenceType?: string;
  performedBy?: string;
  performedByType?: string;
  metadata?: Record<string, unknown>;
}

export interface StockReservationCreateInput {
  variantId: string;
  warehouseId?: string | null;
  orderId?: string;
  cartId?: string;
  quantity: number;
  expiresAt: Date;
  metadata?: Record<string, unknown>;
}

export interface WarehouseCreateInput {
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  phone?: string | null;
  email?: string | null;
  priority?: number;
}

export interface WarehouseUpdateInput {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string | null;
  email?: string | null;
  status?: WarehouseStatus;
  priority?: number;
  isActive?: boolean;
}

export interface InventorySettingsUpdateInput {
  lowStockThreshold?: number;
  reservationTimeout?: number;
  enableAutoRestock?: boolean;
  restockThreshold?: number;
  restockQuantity?: number;
  metadata?: Record<string, unknown>;
}

export interface StockMovementQueryOptions {
  variantId?: string;
  warehouseId?: string | null;
  type?: StockMovementType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface StockReservationQueryOptions {
  variantId?: string;
  warehouseId?: string | null;
  orderId?: string;
  cartId?: string;
  status?: ReservationStatus;
  expired?: boolean;
  limit?: number;
  offset?: number;
}

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

export interface BulkStockUpdateInput {
  updates: Array<{
    variantId: string;
    quantity: number;
    type: StockMovementType;
    reason?: string;
  }>;
  performedBy?: string;
  performedByType?: string;
}

export interface StockTransferInput {
  variantId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
  reason?: string;
  performedBy?: string;
}

const prisma = new PrismaClient();

/**
 * Warehouse Repository Methods
 */
export const warehouseRepository = {
  /**
   * Get all warehouses
   */
  async findAll(): Promise<Warehouse[]> {
    return prisma.warehouse.findMany({
      where: { isActive: true },
      orderBy: [{ priority: 'desc' }, { name: 'asc' }],
    }) as unknown as Warehouse[];
  },

  /**
   * Get warehouse by ID
   */
  async findById(id: string): Promise<Warehouse | null> {
    return prisma.warehouse.findUnique({
      where: { id },
    }) as unknown as Warehouse | null;
  },

  /**
   * Get warehouse by code
   */
  async findByCode(code: string): Promise<Warehouse | null> {
    return prisma.warehouse.findUnique({
      where: { code },
    }) as unknown as Warehouse | null;
  },

  /**
   * Create new warehouse
   */
  async create(input: WarehouseCreateInput): Promise<Warehouse> {
    return prisma.warehouse.create({
      data: input,
    }) as unknown as Warehouse;
  },

  /**
   * Update warehouse
   */
  async update(id: string, input: WarehouseUpdateInput): Promise<Warehouse> {
    return prisma.warehouse.update({
      where: { id },
      data: input,
    }) as unknown as Warehouse;
  },

  /**
   * Delete warehouse (soft delete)
   */
  async delete(id: string): Promise<Warehouse> {
    return prisma.warehouse.update({
      where: { id },
      data: { isActive: false },
    }) as unknown as Warehouse;
  },

  /**
   * Get active warehouses only
   */
  async findActive(): Promise<Warehouse[]> {
    return prisma.warehouse.findMany({
      where: {
        isActive: true,
        status: WarehouseStatus.ACTIVE,
      },
      orderBy: [{ priority: 'desc' }, { name: 'asc' }],
    }) as unknown as Warehouse[];
  },
};

/**
 * Stock Movement Repository Methods
 */
export const stockMovementRepository = {
  /**
   * Create stock movement
   * Wrapped in transaction for atomicity
   */
  async create(input: StockMovementCreateInput): Promise<StockMovement> {
    return prisma.$transaction(async (tx: any) => {
      // Get current stock
      const variant = await tx.productVariant.findUnique({
        where: { id: input.variantId },
        select: { availableStock: true },
      });

      if (!variant) {
        throw new Error('Variant not found');
      }

      const previousStock = variant.availableStock;
      const newStock = previousStock + input.quantity;

      // Create movement record
      const movement = await tx.stockMovement.create({
        data: {
          variantId: input.variantId,
          warehouseId: input.warehouseId,
          type: input.type,
          quantity: input.quantity,
          previousStock,
          newStock,
          reason: input.reason,
          referenceId: input.referenceId,
          referenceType: input.referenceType,
          performedBy: input.performedBy,
          performedByType: input.performedByType,
          metadata: input.metadata,
        },
      });

      // Update variant stock
      await tx.productVariant.update({
        where: { id: input.variantId },
        data: { availableStock: newStock },
      });

      return movement;
    });
  },

  /**
   * Get stock movements with filtering
   */
  async findMany(options: StockMovementQueryOptions): Promise<StockMovement[]> {
    const where: Record<string, unknown> = {};

    if (options.variantId) where.variantId = options.variantId;
    if (options.warehouseId) where.warehouseId = options.warehouseId;
    if (options.type) where.type = options.type;
    if (options.startDate || options.endDate) {
      where.createdAt = {};
      if (options.startDate)
        (where.createdAt as Record<string, Date>).gte = options.startDate;
      if (options.endDate)
        (where.createdAt as Record<string, Date>).lte = options.endDate;
    }

    return prisma.stockMovement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options.limit,
      skip: options.offset,
    }) as unknown as StockMovement[];
  },

  /**
   * Get stock movement by ID
   */
  async findById(id: string): Promise<StockMovement | null> {
    return prisma.stockMovement.findUnique({
      where: { id },
    }) as unknown as StockMovement | null;
  },

  /**
   * Get movement history for a variant
   */
  async findByVariantId(
    variantId: string,
    limit = 50,
    offset = 0,
  ): Promise<StockMovement[]> {
    return prisma.stockMovement.findMany({
      where: { variantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }) as unknown as StockMovement[];
  },

  /**
   * Get movement history for a warehouse
   */
  async findByWarehouseId(
    warehouseId: string,
    limit = 50,
    offset = 0,
  ): Promise<StockMovement[]> {
    return prisma.stockMovement.findMany({
      where: { warehouseId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }) as unknown as StockMovement[];
  },
};

/**
 * Stock Reservation Repository Methods
 */
export const stockReservationRepository = {
  /**
   * Create stock reservation
   * Wrapped in transaction for atomicity
   */
  async create(input: StockReservationCreateInput): Promise<StockReservation> {
    return prisma.$transaction(async (tx: any) => {
      // Check variant exists and has sufficient stock
      const variant = await tx.productVariant.findUnique({
        where: { id: input.variantId },
        select: { availableStock: true, reservedStock: true },
      });

      if (!variant) {
        throw new Error('Variant not found');
      }

      const realAvailableStock = variant.availableStock - variant.reservedStock;
      if (input.quantity > realAvailableStock) {
        throw new Error('Insufficient stock available');
      }

      // Create reservation
      const reservation = await tx.stockReservation.create({
        data: input,
      });

      // Update reserved stock
      await tx.productVariant.update({
        where: { id: input.variantId },
        data: { reservedStock: { increment: input.quantity } },
      });

      return reservation;
    });
  },

  /**
   * Get reservation by ID
   */
  async findById(id: string): Promise<StockReservation | null> {
    return prisma.stockReservation.findUnique({
      where: { id },
    }) as unknown as StockReservation | null;
  },

  /**
   * Get reservations with filtering
   */
  async findMany(
    options: StockReservationQueryOptions,
  ): Promise<StockReservation[]> {
    const where: Record<string, unknown> = {};

    if (options.variantId) where.variantId = options.variantId;
    if (options.warehouseId) where.warehouseId = options.warehouseId;
    if (options.orderId) where.orderId = options.orderId;
    if (options.cartId) where.cartId = options.cartId;
    if (options.status) where.status = options.status;
    if (options.expired !== undefined) {
      if (options.expired) {
        where.expiresAt = { lt: new Date() };
      } else {
        where.expiresAt = { gte: new Date() };
      }
    }

    return prisma.stockReservation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options.limit,
      skip: options.offset,
    }) as unknown as StockReservation[];
  },

  /**
   * Update reservation status
   * Wrapped in transaction for atomicity
   */
  async updateStatus(
    id: string,
    status: ReservationStatus,
  ): Promise<StockReservation> {
    return prisma.$transaction(async (tx: any) => {
      const reservation = await tx.stockReservation.findUnique({
        where: { id },
        select: { variantId: true, quantity: true, status: true },
      });

      if (!reservation) {
        throw new Error('Reservation not found');
      }

      const updateData: Record<string, Date | ReservationStatus> = { status };

      if (status === ReservationStatus.RELEASED) {
        updateData.releasedAt = new Date();
        // Release reserved stock back to available
        await tx.productVariant.update({
          where: { id: reservation.variantId },
          data: { reservedStock: { decrement: reservation.quantity } },
        });
      } else if (status === ReservationStatus.CONVERTED) {
        updateData.convertedAt = new Date();
        // Reserved stock is already deducted when order is confirmed
      }

      return tx.stockReservation.update({
        where: { id },
        data: updateData,
      });
    });
  },

  /**
   * Get active reservations for a variant
   */
  async findActiveByVariantId(variantId: string): Promise<StockReservation[]> {
    return prisma.stockReservation.findMany({
      where: {
        variantId,
        status: ReservationStatus.ACTIVE,
        expiresAt: { gte: new Date() },
      },
    }) as unknown as StockReservation[];
  },

  /**
   * Get total reserved quantity for a variant
   */
  async getTotalReservedForVariant(variantId: string): Promise<number> {
    const reservations = await prisma.stockReservation.aggregate({
      where: {
        variantId,
        status: ReservationStatus.ACTIVE,
        expiresAt: { gte: new Date() },
      },
      _sum: { quantity: true },
    });

    return reservations._sum.quantity || 0;
  },

  /**
   * Expire old reservations
   */
  async expireOldReservations(): Promise<number> {
    const result = await prisma.stockReservation.updateMany({
      where: {
        status: ReservationStatus.ACTIVE,
        expiresAt: { lt: new Date() },
      },
      data: { status: ReservationStatus.EXPIRED },
    });

    return result.count;
  },
};

/**
 * Low Stock Alert Repository Methods
 */
export const lowStockAlertRepository = {
  /**
   * Create low stock alert
   */
  async create(
    variantId: string,
    currentStock: number,
    threshold: number,
  ): Promise<LowStockAlert> {
    return prisma.lowStockAlert.create({
      data: {
        variantId,
        currentStock,
        threshold,
      },
    }) as unknown as LowStockAlert;
  },

  /**
   * Get unacknowledged alerts
   */
  async findUnacknowledged(): Promise<LowStockAlert[]> {
    return prisma.lowStockAlert.findMany({
      where: { isAcknowledged: false },
      orderBy: { createdAt: 'desc' },
    }) as unknown as LowStockAlert[];
  },

  /**
   * Acknowledge alert
   */
  async acknowledge(
    id: string,
    acknowledgedBy: string,
  ): Promise<LowStockAlert> {
    return prisma.lowStockAlert.update({
      where: { id },
      data: {
        isAcknowledged: true,
        acknowledgedBy,
        acknowledgedAt: new Date(),
      },
    }) as unknown as LowStockAlert;
  },

  /**
   * Get alerts for a variant
   */
  async findByVariantId(variantId: string): Promise<LowStockAlert[]> {
    return prisma.lowStockAlert.findMany({
      where: { variantId },
      orderBy: { createdAt: 'desc' },
    }) as unknown as LowStockAlert[];
  },
};

/**
 * Inventory Settings Repository Methods
 */
export const inventorySettingsRepository = {
  /**
   * Get settings by shop ID
   */
  async findByShopId(shopId?: string): Promise<InventorySettings | null> {
    if (!shopId) {
      // Return default settings
      return {
        id: 'default',
        lowStockThreshold: 10,
        reservationTimeout: 15,
        enableAutoRestock: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return prisma.inventorySettings.findUnique({
      where: { shopId },
    }) as unknown as InventorySettings | null;
  },

  /**
   * Create or update settings
   */
  async upsert(
    shopId: string,
    input: InventorySettingsUpdateInput,
  ): Promise<InventorySettings> {
    return prisma.inventorySettings.upsert({
      where: { shopId },
      create: { ...input, shopId } as any,
      update: input as any,
    }) as unknown as InventorySettings;
  },
};

/**
 * Variant Inventory Repository Methods
 */
export const variantInventoryRepository = {
  /**
   * Get variant with inventory details
   */
  async findById(id: string): Promise<ProductVariantWithInventory | null> {
    const variant = await prisma.productVariant.findUnique({
      where: { id },
    });

    if (!variant) return null;

    const totalReserved =
      await stockReservationRepository.getTotalReservedForVariant(id);
    const realAvailableStock = variant.availableStock - totalReserved;

    const price =
      typeof variant.price === 'object' && 'toNumber' in variant.price
        ? variant.price.toNumber()
        : Number(variant.price);

    const compareAtPrice = variant.compareAtPrice
      ? typeof variant.compareAtPrice === 'object' &&
        'toNumber' in variant.compareAtPrice
        ? variant.compareAtPrice.toNumber()
        : Number(variant.compareAtPrice)
      : null;

    return {
      ...(variant as any),
      attributes: variant.attributes as unknown,
      price,
      compareAtPrice: compareAtPrice || undefined,
      totalStock: variant.availableStock,
      reservedStock: totalReserved,
      realAvailableStock,
      isLowStock: variant.availableStock <= variant.lowStockThreshold,
      isOutOfStock: realAvailableStock <= 0,
    };
  },

  /**
   * Get inventory summary
   */
  async getSummary(): Promise<InventorySummary> {
    const variants = await prisma.productVariant.findMany({
      where: { isActive: true },
    });

    const totalVariants = variants.length;
    const totalStock = variants.reduce((sum, v) => sum + v.availableStock, 0);
    const inStockCount = variants.filter(
      (v) => v.inventoryStatus === InventoryStatus.IN_STOCK,
    ).length;
    const lowStockCount = variants.filter(
      (v) => v.inventoryStatus === InventoryStatus.LOW_STOCK,
    ).length;
    const outOfStockCount = variants.filter(
      (v) => v.inventoryStatus === InventoryStatus.OUT_OF_STOCK,
    ).length;
    const backorderCount = variants.filter(
      (v) => v.inventoryStatus === InventoryStatus.BACKORDER,
    ).length;

    const totalReserved = await prisma.stockReservation.aggregate({
      where: { status: ReservationStatus.ACTIVE },
      _sum: { quantity: true },
    });

    return {
      totalVariants,
      totalStock,
      totalReserved: totalReserved._sum.quantity || 0,
      totalAvailable: totalStock - (totalReserved._sum.quantity || 0),
      inStockCount,
      lowStockCount,
      outOfStockCount,
      backorderCount,
    };
  },

  /**
   * Check availability for multiple variants
   */
  async checkAvailability(
    variantIds: string[],
  ): Promise<AvailabilityCheckResult[]> {
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
    });

    const results: AvailabilityCheckResult[] = [];

    for (const variant of variants) {
      const totalReserved =
        await stockReservationRepository.getTotalReservedForVariant(variant.id);
      const realAvailableStock = variant.availableStock - totalReserved;

      results.push({
        variantId: variant.id,
        sku: variant.sku,
        availableStock: variant.availableStock,
        reservedStock: totalReserved,
        realAvailableStock,
        canFulfill: realAvailableStock > 0,
        canFulfillQuantity: Math.max(0, realAvailableStock),
        inventoryStatus: variant.inventoryStatus as unknown as InventoryStatus,
        lowStockThreshold: variant.lowStockThreshold,
        isLowStock: variant.availableStock <= variant.lowStockThreshold,
      });
    }

    return results;
  },

  /**
   * Update variant stock directly (use with caution)
   */
  async updateStock(
    variantId: string,
    newStock: number,
    reason: string,
    performedBy?: string,
  ): Promise<void> {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { availableStock: true },
    });

    if (!variant) {
      throw new Error('Variant not found');
    }

    const quantity = newStock - variant.availableStock;

    await stockMovementRepository.create({
      variantId,
      type: StockMovementType.MANUAL_UPDATE,
      quantity,
      reason,
      performedBy,
      performedByType: performedBy ? 'admin' : 'system',
    });
  },
};

/**
 * Bulk Operations
 */
export const bulkInventoryRepository = {
  /**
   * Bulk stock update
   */
  async bulkUpdate(input: BulkStockUpdateInput): Promise<StockMovement[]> {
    const movements: StockMovement[] = [];

    for (const update of input.updates) {
      const movement = await stockMovementRepository.create({
        ...update,
        performedBy: input.performedBy,
        performedByType: input.performedByType,
      });
      movements.push(movement);
    }

    return movements;
  },

  /**
   * Stock transfer between warehouses
   */
  async transferStock(input: StockTransferInput): Promise<{
    fromMovement: StockMovement;
    toMovement: StockMovement;
  }> {
    // Decrement from source warehouse
    const fromMovement = await stockMovementRepository.create({
      variantId: input.variantId,
      warehouseId: input.fromWarehouseId,
      type: StockMovementType.TRANSFER,
      quantity: -input.quantity,
      reason: input.reason || `Transfer to warehouse ${input.toWarehouseId}`,
      performedBy: input.performedBy,
      performedByType: 'admin',
    });

    // Increment to destination warehouse
    const toMovement = await stockMovementRepository.create({
      variantId: input.variantId,
      warehouseId: input.toWarehouseId,
      type: StockMovementType.TRANSFER,
      quantity: input.quantity,
      reason:
        input.reason || `Transfer from warehouse ${input.fromWarehouseId}`,
      performedBy: input.performedBy,
      performedByType: 'admin',
    });

    return { fromMovement, toMovement };
  },
};
