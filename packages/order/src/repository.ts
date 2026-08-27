/**
 * Order Repository
 *
 * Handles all database operations for orders using Prisma.
 * This repository provides a clean abstraction layer over Prisma client operations.
 *
 * Source: DATABASE_ARCHITECTURE.md (binding)
 */

import type { PrismaClient } from '@prisma/client';

import { OrderStatus, CustomerVisibleOrderStatus, OrderSource } from './enums';
import type {
  Order,
  OrderQueryOptions,
  OrderSummary,
  OrderDashboardStats,
} from './types';

// ──────────────────────────────────────────────────────────────────────────────
// Enum Mappings (Database ↔ Package)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Maps package OrderStatus to database OrderStatus.
 * The database schema uses different enum values than the OMS architecture.
 * This mapping reconciles the two.
 */
const PACKAGE_TO_DB_STATUS: Record<OrderStatus, string> = {
  [OrderStatus.DRAFT]: 'pending',
  [OrderStatus.PENDING_PAYMENT]: 'awaiting_payment',
  [OrderStatus.PAYMENT_AUTHORIZED]: 'pending',
  [OrderStatus.PAYMENT_FAILED]: 'failed_delivery',
  [OrderStatus.CONFIRMED]: 'confirmed',
  [OrderStatus.PROCESSING]: 'processing',
  [OrderStatus.PACKED]: 'processing',
  [OrderStatus.READY_FOR_SHIPMENT]: 'ready_for_pickup',
  [OrderStatus.SHIPPED]: 'shipped',
  [OrderStatus.DELIVERED]: 'delivered',
  [OrderStatus.COMPLETED]: 'archived',
  [OrderStatus.CANCELLED]: 'cancelled',
  [OrderStatus.REFUNDED]: 'refunded',
  [OrderStatus.PARTIALLY_REFUNDED]: 'partially_refunded',
  [OrderStatus.RETURNED]: 'returned',
  [OrderStatus.CLOSED]: 'archived',
};

/**
 * Maps database OrderStatus to package OrderStatus.
 */
const DB_TO_PACKAGE_STATUS: Record<string, OrderStatus> = {
  pending: OrderStatus.PENDING_PAYMENT,
  confirmed: OrderStatus.CONFIRMED,
  processing: OrderStatus.PROCESSING,
  shipped: OrderStatus.SHIPPED,
  delivered: OrderStatus.DELIVERED,
  cancelled: OrderStatus.CANCELLED,
  refunded: OrderStatus.REFUNDED,
  returned: OrderStatus.RETURNED,
  archived: OrderStatus.CLOSED,
  failed_delivery: OrderStatus.PAYMENT_FAILED,
  held: OrderStatus.PROCESSING,
  awaiting_payment: OrderStatus.PENDING_PAYMENT,
  partially_shipped: OrderStatus.SHIPPED,
  partially_delivered: OrderStatus.DELIVERED,
  partially_cancelled: OrderStatus.CANCELLED,
  partially_returned: OrderStatus.RETURNED,
  partially_refunded: OrderStatus.PARTIALLY_REFUNDED,
  ready_for_pickup: OrderStatus.READY_FOR_SHIPMENT,
};

/**
 * Maps package CustomerVisibleOrderStatus to database CustomerVisibleOrderStatus.
 */
const PACKAGE_TO_DB_CUSTOMER_STATUS: Record<
  CustomerVisibleOrderStatus,
  string
> = {
  [CustomerVisibleOrderStatus.PENDING]: 'pending',
  [CustomerVisibleOrderStatus.CONFIRMED]: 'confirmed',
  [CustomerVisibleOrderStatus.PROCESSING]: 'processing',
  [CustomerVisibleOrderStatus.PACKING]: 'processing',
  [CustomerVisibleOrderStatus.SHIPPED]: 'shipped',
  [CustomerVisibleOrderStatus.DELIVERED]: 'delivered',
  [CustomerVisibleOrderStatus.CANCELLED]: 'cancelled',
  [CustomerVisibleOrderStatus.RETURNED]: 'returned',
  [CustomerVisibleOrderStatus.REFUNDED]: 'refunded',
  [CustomerVisibleOrderStatus.COMPLETED]: 'archived',
};

/**
 * Maps database CustomerVisibleOrderStatus to package CustomerVisibleOrderStatus.
 */
const DB_TO_PACKAGE_CUSTOMER_STATUS: Record<
  string,
  CustomerVisibleOrderStatus
> = {
  pending: CustomerVisibleOrderStatus.PENDING,
  confirmed: CustomerVisibleOrderStatus.CONFIRMED,
  processing: CustomerVisibleOrderStatus.PROCESSING,
  shipped: CustomerVisibleOrderStatus.SHIPPED,
  delivered: CustomerVisibleOrderStatus.DELIVERED,
  cancelled: CustomerVisibleOrderStatus.CANCELLED,
  refunded: CustomerVisibleOrderStatus.REFUNDED,
  returned: CustomerVisibleOrderStatus.RETURNED,
  held: CustomerVisibleOrderStatus.PROCESSING,
  failed_delivery: CustomerVisibleOrderStatus.CANCELLED,
  archived: CustomerVisibleOrderStatus.COMPLETED,
};

// ──────────────────────────────────────────────────────────────────────────────
// Order Repository Class
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Order Repository
 *
 * Provides database operations for orders, order items, and related entities.
 */
export class OrderRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find an order by ID.
   */
  async findById(id: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { id, isActive: true },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        payments: true,
        shipments: true,
      },
    });

    if (!order) return null;

    return this.mapToDomain(order);
  }

  /**
   * Find an order by order number.
   */
  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber, isActive: true },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        payments: true,
        shipments: true,
      },
    });

    if (!order) return null;

    return this.mapToDomain(order);
  }

  /**
   * Find orders by user ID.
   */
  async findByUserId(
    userId: string,
    options?: OrderQueryOptions,
  ): Promise<Order[]> {
    const {
      limit = 50,
      offset = 0,
      sortBy = 'createdAt',
      sortDirection = 'desc',
    } = options || {};

    const orders = await this.prisma.order.findMany({
      where: {
        userId,
        isActive: true,
        ...(options?.status && { status: options.status as any }),
        ...(options?.startDate && {
          placedAt: { gte: new Date(options.startDate) },
        }),
        ...(options?.endDate && {
          placedAt: { lte: new Date(options.endDate) },
        }),
        ...(options?.search && {
          OR: [
            { orderNumber: { contains: options.search, mode: 'insensitive' } },
            {
              user: {
                email: { contains: options.search, mode: 'insensitive' },
              },
            },
          ],
        }),
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        payments: true,
        shipments: true,
      },
      orderBy: { [sortBy]: sortDirection },
      take: limit,
      skip: offset,
    });

    return orders.map((order) => this.mapToDomain(order));
  }

  /**
   * Find orders with query options.
   */
  async findMany(options?: OrderQueryOptions): Promise<Order[]> {
    const {
      limit = 50,
      offset = 0,
      sortBy = 'createdAt',
      sortDirection = 'desc',
    } = options || {};

    const orders = await this.prisma.order.findMany({
      where: {
        isActive: true,
        ...(options?.userId && { userId: options.userId }),
        ...(options?.status && { status: options.status as any }),
        ...(options?.startDate && {
          placedAt: { gte: new Date(options.startDate) },
        }),
        ...(options?.endDate && {
          placedAt: { lte: new Date(options.endDate) },
        }),
        ...(options?.search && {
          OR: [
            { orderNumber: { contains: options.search, mode: 'insensitive' } },
            {
              user: {
                email: { contains: options.search, mode: 'insensitive' },
              },
            },
          ],
        }),
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        payments: true,
        shipments: true,
      },
      orderBy: { [sortBy]: sortDirection },
      take: limit,
      skip: offset,
    });

    return orders.map((order) => this.mapToDomain(order));
  }

  /**
   * Count orders with query options.
   */
  async count(options?: OrderQueryOptions): Promise<number> {
    return this.prisma.order.count({
      where: {
        isActive: true,
        ...(options?.userId && { userId: options.userId }),
        ...(options?.status && { status: options.status as any }),
        ...(options?.startDate && {
          placedAt: { gte: new Date(options.startDate) },
        }),
        ...(options?.endDate && {
          placedAt: { lte: new Date(options.endDate) },
        }),
        ...(options?.search && {
          OR: [
            { orderNumber: { contains: options.search, mode: 'insensitive' } },
            {
              user: {
                email: { contains: options.search, mode: 'insensitive' },
              },
            },
          ],
        }),
      },
    });
  }

  /**
   * Create a new order.
   */
  async create(
    data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Order> {
    const order = await this.prisma.order.create({
      data: {
        orderNumber: data.orderNumber,
        userId: data.userId || undefined,
        status: PACKAGE_TO_DB_STATUS[data.status],
        customerVisibleStatus:
          PACKAGE_TO_DB_CUSTOMER_STATUS[data.customerVisibleStatus],
        paymentStatus: data.paymentStatus as any,
        paymentSubStatus: data.paymentStatus as any,
        itemsSubtotal: data.amounts.subtotal.amount,
        shippingTotal: data.amounts.shippingTotal.amount,
        discountTotal: data.amounts.discountTotal.amount,
        taxTotal: data.amounts.taxTotal.amount,
        grandTotal: data.amounts.grandTotal.amount,
        currency: data.amounts.grandTotal.currency,
        billingSnapshot: data.billingAddress as any,
        shippingSnapshot: data.shippingAddress as any,
        couponCode: data.couponCode,
        notes: data.notes,
        paymentMethod: 'card' as any, // TODO: Get from payment data
        razorpayOrderId: data.paymentId,
        razorpayPaymentId: data.paymentId,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            variantName: item.sku,
            sku: item.sku,
            unitPrice: item.unitPrice.amount,
            quantity: item.quantity,
            lineTotal: item.lineTotal.amount,
            discountTotal: '0',
            imageUrl: item.imageUrl,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        payments: true,
        shipments: true,
      },
    });

    return this.mapToDomain(order);
  }

  /**
   * Update an order.
   */
  async update(
    id: string,
    data: Partial<
      Omit<
        Order,
        | 'id'
        | 'createdAt'
        | 'updatedAt'
        | 'orderNumber'
        | 'userId'
        | 'items'
        | 'amounts'
      >
    >,
  ): Promise<Order> {
    const order = await this.prisma.order.update({
      where: { id },
      data: {
        ...(data.status && { status: PACKAGE_TO_DB_STATUS[data.status] }),
        ...(data.customerVisibleStatus && {
          customerVisibleStatus:
            PACKAGE_TO_DB_CUSTOMER_STATUS[data.customerVisibleStatus],
        }),
        ...(data.paymentStatus && { paymentStatus: data.paymentStatus as any }),
        ...(data.couponCode && { couponCode: data.couponCode }),
        ...(data.notes && { notes: data.notes }),
        ...(data.paymentId && { razorpayPaymentId: data.paymentId }),
        ...(data.shipmentId && { razorpayOrderId: data.shipmentId }),
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        payments: true,
        shipments: true,
      },
    });

    return this.mapToDomain(order);
  }

  /**
   * Delete (soft delete) an order.
   */
  async delete(id: string): Promise<void> {
    await this.prisma.order.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Get order summary statistics.
   */
  async getSummary(options?: OrderQueryOptions): Promise<OrderSummary> {
    const orders = await this.prisma.order.findMany({
      where: {
        isActive: true,
        ...(options?.startDate && {
          placedAt: { gte: new Date(options.startDate) },
        }),
        ...(options?.endDate && {
          placedAt: { lte: new Date(options.endDate) },
        }),
      },
    });

    const totalOrders = orders.length;
    const totalValue = orders.reduce(
      (sum: number, order: any) => sum + Number(order.grandTotal),
      0,
    );
    const ordersByStatus = orders.reduce(
      (acc: Record<OrderStatus, number>, order: any) => {
        const status = DB_TO_PACKAGE_STATUS[order.status] || OrderStatus.DRAFT;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<OrderStatus, number>,
    );

    const ordersByCustomerStatus = orders.reduce(
      (acc: Record<CustomerVisibleOrderStatus, number>, order: any) => {
        const status =
          DB_TO_PACKAGE_CUSTOMER_STATUS[order.customerVisibleStatus] ||
          CustomerVisibleOrderStatus.PENDING;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<CustomerVisibleOrderStatus, number>,
    );

    const cancelledCount = ordersByStatus[OrderStatus.CANCELLED] || 0;
    const refundCount = ordersByStatus[OrderStatus.REFUNDED] || 0;
    const deliveredCount = ordersByStatus[OrderStatus.DELIVERED] || 0;

    return {
      totalOrders,
      totalValue: { amount: totalValue.toString(), currency: 'INR' },
      ordersByStatus,
      ordersByCustomerStatus,
      averageOrderValue: {
        amount: (totalValue / totalOrders || 0).toString(),
        currency: 'INR',
      },
      cancellationRate: totalOrders > 0 ? cancelledCount / totalOrders : 0,
      refundRate: totalOrders > 0 ? refundCount / totalOrders : 0,
      deliveryRate: totalOrders > 0 ? deliveredCount / totalOrders : 0,
    };
  }

  /**
   * Get dashboard statistics.
   */
  async getDashboardStats(): Promise<OrderDashboardStats> {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      todayOrders,
      todayRevenue,
      pendingOrders,
      processingOrders,
      readyToPickupOrders,
      shippedToday,
      deliveredToday,
      last7DaysOrders,
      last7DaysCancelled,
      last7DaysRefunded,
    ] = await Promise.all([
      this.prisma.order.count({
        where: {
          isActive: true,
          placedAt: { gte: todayStart },
        },
      }),
      this.prisma.order.aggregate({
        where: {
          isActive: true,
          placedAt: { gte: todayStart },
        },
        _sum: { grandTotal: true },
      }),
      this.prisma.order.count({
        where: {
          isActive: true,
          status: { in: ['pending', 'awaiting_payment'] },
        },
      }),
      this.prisma.order.count({
        where: {
          isActive: true,
          status: 'processing',
        },
      }),
      this.prisma.order.count({
        where: {
          isActive: true,
          status: 'ready_for_pickup',
        },
      }),
      this.prisma.order.count({
        where: {
          isActive: true,
          status: 'shipped',
          placedAt: { gte: todayStart },
        },
      }),
      this.prisma.order.count({
        where: {
          isActive: true,
          status: 'delivered',
          updatedAt: { gte: todayStart },
        },
      }),
      this.prisma.order.count({
        where: {
          isActive: true,
          placedAt: { gte: sevenDaysAgo },
        },
      }),
      this.prisma.order.count({
        where: {
          isActive: true,
          status: 'cancelled',
          updatedAt: { gte: sevenDaysAgo },
        },
      }),
      this.prisma.order.count({
        where: {
          isActive: true,
          status: { in: ['refunded', 'partially_refunded'] },
          updatedAt: { gte: sevenDaysAgo },
        },
      }),
    ]);

    const total7Days = last7DaysOrders || 0;

    return {
      todayOrders,
      todayRevenue: {
        amount: todayRevenue._sum.grandTotal?.toString() || '0',
        currency: 'INR',
      },
      pendingOrders,
      processingOrders,
      readyToShip: readyToPickupOrders,
      shippedToday,
      deliveredToday,
      cancellationRate7d:
        total7Days > 0 ? (last7DaysCancelled || 0) / total7Days : 0,
      refundRate7d: total7Days > 0 ? (last7DaysRefunded || 0) / total7Days : 0,
    };
  }

  /**
   * Map Prisma order to domain Order.
   */
  private mapToDomain(order: any): Order {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      guestToken: null, // TODO: Add to schema if needed
      status: DB_TO_PACKAGE_STATUS[order.status] || OrderStatus.DRAFT,
      customerVisibleStatus:
        DB_TO_PACKAGE_CUSTOMER_STATUS[order.customerVisibleStatus] ||
        CustomerVisibleOrderStatus.PENDING,
      paymentStatus: order.paymentSubStatus || 'pending',
      source: OrderSource.WEBSITE, // TODO: Add to schema
      items: order.items.map((item: any) => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        sku: item.sku,
        attributes: item.variant?.attributes || {},
        unitPrice: { amount: item.unitPrice.toString(), currency: 'INR' },
        quantity: item.quantity,
        lineTotal: { amount: item.lineTotal.toString(), currency: 'INR' },
        imageUrl: item.imageUrl,
        fulfillmentStatus: 'pending',
        refundStatus: 'none',
        returnStatus: 'none',
        refundedQuantity: 0,
        returnedQuantity: 0,
        warehouseId: null,
        reservationId: null,
        metadata: null,
      })),
      amounts: {
        subtotal: { amount: order.itemsSubtotal.toString(), currency: 'INR' },
        discountTotal: {
          amount: order.discountTotal.toString(),
          currency: 'INR',
        },
        shippingTotal: {
          amount: order.shippingTotal.toString(),
          currency: 'INR',
        },
        taxTotal: { amount: order.taxTotal.toString(), currency: 'INR' },
        grandTotal: { amount: order.grandTotal.toString(), currency: 'INR' },
      },
      shippingAddress: order.shippingSnapshot as any,
      billingAddress: order.billingSnapshot as any,
      couponCode: order.couponCode,
      paymentId: order.razorpayPaymentId,
      shipmentId: order.shipments?.[0]?.id || null,
      shopOwnerId: null, // TODO: Add to schema
      cancelledAt: null, // TODO: Add to schema
      deliveredAt: order.shipments?.[0]?.deliveredAt?.toISOString() || null,
      completedAt: null, // TODO: Add to schema
      closedAt: null, // TODO: Add to schema
      customerEmail: order.user?.email || '',
      customerPhone: order.user?.phone || null,
      customerName:
        `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim(),
      notes: order.notes,
      metadata: null,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }

  /**
   * Get the next sequential order number for a given date
   */
  async getNextOrderSequence(datePart: string): Promise<number> {
    // Find the highest order number for today
    const todayPrefix = `NAB-${datePart}-`;
    const latestOrder = await this.prisma.order.findFirst({
      where: {
        orderNumber: {
          startsWith: todayPrefix,
        },
      },
      orderBy: {
        orderNumber: 'desc',
      },
      select: {
        orderNumber: true,
      },
    });

    if (!latestOrder) {
      return 1; // First order of the day
    }

    // Extract the sequence part and increment
    const sequencePart = latestOrder.orderNumber.replace(todayPrefix, '');
    const sequence = parseInt(sequencePart, 10);
    return sequence + 1;
  }

  /**
   * Create a timeline event
   */
  async createTimelineEvent(event: any): Promise<void> {
    await this.prisma.timelineEvent.create({
      data: {
        orderId: event.orderId,
        type: event.type as any,
        description: event.description,
        priority: event.priority as any,
        customerVisible: event.customerVisible,
        metadata: event.metadata,
        performedBy: event.performedBy,
        performedByType: event.performedByType,
        occurredAt: new Date(event.occurredAt),
      },
    });
  }

  /**
   * Get timeline events for an order
   */
  async getTimelineEvents(orderId: string): Promise<any[]> {
    const events = await this.prisma.timelineEvent.findMany({
      where: {
        orderId,
        isActive: true,
      },
      orderBy: {
        occurredAt: 'desc',
      },
    });

    return events.map((event) => ({
      id: event.id,
      orderId: event.orderId,
      type: event.type,
      description: event.description,
      priority: event.priority,
      customerVisible: event.customerVisible,
      metadata: event.metadata,
      performedBy: event.performedBy,
      performedByType: event.performedByType,
      occurredAt: event.occurredAt.toISOString(),
      createdAt: event.createdAt.toISOString(),
    }));
  }
}
