/**
 * Order Service (API Layer)
 *
 * Business logic layer for order operations.
 * This service provides API-specific functionality following ORDER_MANAGEMENT_ARCHITECTURE.md
 *
 * Note: This is a placeholder implementation. The full implementation will integrate with
 * the @nabome/order package once it's properly configured in the workspace.
 */

import type { PrismaClient } from '@prisma/client';

import { getPrisma } from '../prisma.ts';

const prisma = new Proxy({} as unknown as PrismaClient, {
  get(_target: unknown, prop: string | symbol) {
    return (getPrisma() as any)[prop];
  },
}) as unknown as PrismaClient;

// ── Order Service ─────────────────────────────────────────────────────────────

export class OrderService {
  /**
   * Create order from checkout snapshot
   * Wrapped in transaction for atomicity
   */
  static async createFromCheckout(snapshot: any): Promise<any> {
    return prisma.$transaction(async (tx: any) => {
      // Generate sequential order number
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const todayPrefix = `NAB-${datePart}-`;
      const latestOrder = await tx.order.findFirst({
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

      let sequence = 1;
      if (latestOrder) {
        const sequencePart = latestOrder.orderNumber.replace(todayPrefix, '');
        sequence = parseInt(sequencePart, 10) + 1;
      }
      const orderNumber = `${todayPrefix}${sequence.toString().padStart(6, '0')}`;

      // Create order with items
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: snapshot.customer.userId || null,
          status: 'pending',
          customerVisibleStatus: 'pending',
          paymentStatus: 'pending',
          itemsSubtotal: snapshot.totals.itemsSubtotal,
          shippingTotal: snapshot.totals.shippingTotal,
          discountTotal: snapshot.totals.discountTotal,
          taxTotal: snapshot.totals.taxTotal,
          grandTotal: snapshot.totals.grandTotal,
          currency: snapshot.currency,
          billingSnapshot: snapshot.addresses.billing,
          shippingSnapshot: snapshot.addresses.shipping,
          paymentMethod: snapshot.paymentMethod,
          razorpayOrderId: snapshot.paymentToken,
          couponCode: snapshot.discount.couponCode,
          placedAt: new Date(),
        },
      });

      // Create order items
      for (const item of snapshot.items) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            variantName: item.variantName,
            sku: item.sku,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            lineTotal: item.lineTotal,
            imageUrl: item.imageUrl,
          },
        });
      }

      // TODO: Create timeline event after Prisma schema is regenerated
      // await tx.timelineEvent.create({...});

      // Reserve inventory for order items (within transaction)
      await this.reserveInventoryInTransaction(tx, order.id, snapshot.items);

      return order;
    });
  }

  /**
   * Reserve inventory for order items (transaction-aware version)
   */
  static async reserveInventory(orderId: string, items: any[]): Promise<void> {
    const reservationTimeoutMinutes = 15;
    const expiresAt = new Date(
      Date.now() + reservationTimeoutMinutes * 60 * 1000,
    );

    for (const item of items) {
      // Check if item has reservation from checkout
      if (item.reservedStockId) {
        // Convert existing cart reservation to order reservation
        await prisma.stockReservation.update({
          where: { id: item.reservedStockId },
          data: {
            orderId,
            cartId: null,
            status: 'active',
            expiresAt,
          },
        });
      } else {
        // Create new reservation
        await prisma.stockReservation.create({
          data: {
            variantId: item.variantId,
            orderId,
            quantity: item.quantity,
            status: 'active',
            expiresAt,
          },
        });

        // Create stock movement for reservation
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
        });

        if (variant) {
          await prisma.stockMovement.create({
            data: {
              variantId: item.variantId,
              type: 'reservation',
              quantity: item.quantity,
              previousStock: variant.availableStock,
              newStock: variant.availableStock,
              referenceId: orderId,
              referenceType: 'order',
            },
          });
        }
      }
    }
  }

  /**
   * Reserve inventory for order items (within transaction)
   */
  static async reserveInventoryInTransaction(
    tx: any,
    orderId: string,
    items: any[],
  ): Promise<void> {
    const reservationTimeoutMinutes = 15;
    const expiresAt = new Date(
      Date.now() + reservationTimeoutMinutes * 60 * 1000,
    );

    for (const item of items) {
      // Check if item has reservation from checkout
      if (item.reservedStockId) {
        // Convert existing cart reservation to order reservation
        await tx.stockReservation.update({
          where: { id: item.reservedStockId },
          data: {
            orderId,
            cartId: null,
            status: 'active',
            expiresAt,
          },
        });
      } else {
        // Create new reservation
        await tx.stockReservation.create({
          data: {
            variantId: item.variantId,
            orderId,
            quantity: item.quantity,
            status: 'active',
            expiresAt,
          },
        });

        // Create stock movement for reservation
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
        });

        if (variant) {
          await tx.stockMovement.create({
            data: {
              variantId: item.variantId,
              type: 'reservation',
              quantity: item.quantity,
              previousStock: variant.availableStock,
              newStock: variant.availableStock,
              referenceId: orderId,
              referenceType: 'order',
            },
          });
        }
      }
    }
  }

  /**
   * Deduct inventory when order is confirmed/shipped
   * Wrapped in transaction for atomicity
   */
  static async deductInventory(orderId: string, items: any[]): Promise<void> {
    await prisma.$transaction(async (tx: any) => {
      for (const item of items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
        });

        if (variant) {
          const newStock = Math.max(0, variant.availableStock - item.quantity);

          // Update variant stock
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              availableStock: newStock,
              reservedStock: Math.max(0, variant.reservedStock - item.quantity),
              inventoryStatus:
                newStock === 0
                  ? 'out_of_stock'
                  : newStock <= variant.lowStockThreshold
                    ? 'low_stock'
                    : 'in_stock',
            },
          });

          // Create stock movement for sale
          await tx.stockMovement.create({
            data: {
              variantId: item.variantId,
              type: 'sale',
              quantity: item.quantity,
              previousStock: variant.availableStock,
              newStock,
              referenceId: orderId,
              referenceType: 'order',
            },
          });

          // Convert reservation to converted status
          const reservation = await tx.stockReservation.findFirst({
            where: {
              orderId,
              variantId: item.variantId,
              status: 'active',
            },
          });

          if (reservation) {
            await tx.stockReservation.update({
              where: { id: reservation.id },
              data: {
                status: 'converted',
                convertedAt: new Date(),
              },
            });
          }
        }
      }
    });
  }

  /**
   * Release inventory when order is cancelled
   */
  static async releaseInventory(orderId: string, items: any[]): Promise<void> {
    for (const item of items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
      });

      if (variant) {
        // Release reserved stock
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            reservedStock: Math.max(0, variant.reservedStock - item.quantity),
          },
        });

        // Create stock movement for release
        await prisma.stockMovement.create({
          data: {
            variantId: item.variantId,
            type: 'release',
            quantity: item.quantity,
            previousStock: variant.availableStock,
            newStock: variant.availableStock,
            referenceId: orderId,
            referenceType: 'order',
          },
        });

        // Release reservation
        const reservation = await prisma.stockReservation.findFirst({
          where: {
            orderId,
            variantId: item.variantId,
            status: 'active',
          },
        });

        if (reservation) {
          await prisma.stockReservation.update({
            where: { id: reservation.id },
            data: {
              status: 'released',
              releasedAt: new Date(),
            },
          });
        }
      }
    }
  }

  /**
   * Restock inventory when order is returned
   */
  static async restockInventory(orderId: string, items: any[]): Promise<void> {
    for (const item of items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
      });

      if (variant) {
        const newStock = variant.availableStock + item.quantity;

        // Update variant stock
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            availableStock: newStock,
            inventoryStatus: newStock > 0 ? 'in_stock' : 'out_of_stock',
          },
        });

        // Create stock movement for return
        await prisma.stockMovement.create({
          data: {
            variantId: item.variantId,
            type: 'return',
            quantity: item.quantity,
            previousStock: variant.availableStock,
            newStock,
            referenceId: orderId,
            referenceType: 'order',
          },
        });
      }
    }
  }

  /**
   * Update payment status
   */
  static async updatePaymentStatus(
    orderId: string,
    paymentId: string,
    status: string,
  ): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Update order payment status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: status as any,
        razorpayPaymentId: paymentId,
      },
    });

    // Create or update payment record
    const existingPayment = await prisma.payment.findFirst({
      where: { orderId },
    });

    if (existingPayment) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: status as any,
        },
      });
    } else {
      await prisma.payment.create({
        data: {
          orderId,
          amount: order.grandTotal,
          currency: order.currency,
          status: status as any,
          method: 'razorpay' as any,
        },
      });
    }

    // Auto-transition order based on payment status
    if (status === 'completed' || status === 'authorized') {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'confirmed',
          customerVisibleStatus: 'confirmed',
        },
      });
    } else if (status === 'failed') {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'cancelled',
          customerVisibleStatus: 'cancelled',
        },
      });
    }
  }

  /**
   * Authorize payment (pre-authorization)
   */
  static async authorizePayment(
    orderId: string,
    paymentId: string,
    _amount: number,
  ): Promise<void> {
    await this.updatePaymentStatus(orderId, paymentId, 'authorized');
  }

  /**
   * Capture payment (finalize authorized payment)
   * Wrapped in transaction for atomicity
   */
  static async capturePayment(
    orderId: string,
    paymentId: string,
    _amount: number,
  ): Promise<void> {
    await prisma.$transaction(async (tx: any) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Update payment status
      await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'completed',
          razorpayPaymentId: paymentId,
          status: 'confirmed',
          customerVisibleStatus: 'confirmed',
        },
      });

      // Update payment record
      const existingPayment = await tx.payment.findFirst({
        where: { orderId },
      });

      if (existingPayment) {
        await tx.payment.update({
          where: { id: existingPayment.id },
          data: {
            status: 'completed',
          },
        });
      } else {
        await tx.payment.create({
          data: {
            orderId,
            amount: order.grandTotal,
            currency: order.currency,
            status: 'completed',
            method: 'razorpay' as any,
          },
        });
      }

      // Deduct inventory when payment is captured (within transaction)
      for (const item of order.items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
        });

        if (variant) {
          const newStock = Math.max(0, variant.availableStock - item.quantity);

          // Update variant stock
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              availableStock: newStock,
              reservedStock: Math.max(0, variant.reservedStock - item.quantity),
              inventoryStatus:
                newStock === 0
                  ? 'out_of_stock'
                  : newStock <= variant.lowStockThreshold
                    ? 'low_stock'
                    : 'in_stock',
            },
          });

          // Create stock movement for sale
          await tx.stockMovement.create({
            data: {
              variantId: item.variantId,
              type: 'sale',
              quantity: item.quantity,
              previousStock: variant.availableStock,
              newStock,
              referenceId: orderId,
              referenceType: 'order',
            },
          });

          // Convert reservation to converted status
          const reservation = await tx.stockReservation.findFirst({
            where: {
              orderId,
              variantId: item.variantId,
              status: 'active',
            },
          });

          if (reservation) {
            await tx.stockReservation.update({
              where: { id: reservation.id },
              data: {
                status: 'converted',
                convertedAt: new Date(),
              },
            });
          }
        }
      }
    });
  }

  /**
   * Process refund (full or partial)
   * Wrapped in transaction for atomicity
   */
  static async processRefund(
    orderId: string,
    amount: number,
    reason: string,
  ): Promise<any> {
    return prisma.$transaction(async (tx: any) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Create refund record
      const refund = await tx.refund.create({
        data: {
          orderId,
          amount,
          currency: order.currency,
          reason,
          status: 'pending',
        },
      });

      // Update order status if full refund
      const orderTotal = parseFloat(order.grandTotal.toString());
      if (amount >= orderTotal) {
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: 'refunded',
            customerVisibleStatus: 'refunded',
          },
        });
      } else {
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: 'partially_refunded',
            customerVisibleStatus: 'refunded',
          },
        });
      }

      return { success: true, refundId: refund.id };
    });
  }

  /**
   * Assign shipment to order
   */
  static async assignShipment(
    orderId: string,
    carrier: string,
    trackingNumber: string,
    _estimatedDelivery?: Date,
  ): Promise<any> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Create shipment record
    const shipment = await prisma.shipment.create({
      data: {
        orderId,
        carrierCode: carrier,
        trackingNumber,
        status: 'in_transit' as any,
        shippedAt: new Date(),
        shippingAddress: (order as any).shippingAddress ?? {},
        shippingCost: 0,
        weight: 0,
        length: 0,
        width: 0,
        height: 0,
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'shipped',
        customerVisibleStatus: 'shipped',
      },
    });

    return { success: true, shipmentId: shipment.id };
  }

  /**
   * Update shipment tracking
   */
  static async updateShipmentTracking(
    shipmentId: string,
    trackingNumber: string,
    status: string,
  ): Promise<void> {
    await prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        trackingNumber,
        status: status as any,
      },
    });
  }

  /**
   * Confirm delivery
   */
  static async confirmDelivery(shipmentId: string): Promise<void> {
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: { order: true },
    });

    if (!shipment) {
      throw new Error('Shipment not found');
    }

    // Update shipment
    await prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        status: 'delivered' as any,
        deliveredAt: new Date(),
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: shipment.orderId },
      data: {
        status: 'delivered',
        customerVisibleStatus: 'delivered',
      },
    });
  }

  /**
   * Get order by ID
   */
  static async getOrderById(id: string): Promise<any> {
    const order = await prisma.order.findUnique({
      where: { id, isActive: true },
      include: {
        shop: true,
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

    return order;
  }

  /**
   * Get order by order number
   */
  static async getOrderByNumber(orderNumber: string): Promise<any> {
    const order = await prisma.order.findUnique({
      where: { orderNumber, isActive: true },
      include: {
        shop: true,
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

    return order;
  }

  /**
   * Get orders for a user
   */
  static async getUserOrders(userId: string, options?: any): Promise<any[]> {
    const {
      limit = 50,
      offset = 0,
      sortBy = 'createdAt',
      sortDirection = 'desc',
    } = options || {};

    const orders = await prisma.order.findMany({
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
        shop: true,
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

    return orders;
  }

  /**
   * Get orders with query options
   */
  static async getOrders(options?: any): Promise<any[]> {
    const {
      limit = 50,
      offset = 0,
      sortBy = 'createdAt',
      sortDirection = 'desc',
    } = options || {};

    let shopIdFilter: string | undefined;
    if (options?.shopOwnerId) {
      const shop = await prisma.shop.findFirst({
        where: { ownerId: options.shopOwnerId, isActive: true },
        select: { id: true },
      });
      if (!shop) return [];
      shopIdFilter = shop.id;
    }

    const orders = await prisma.order.findMany({
      where: {
        isActive: true,
        ...(shopIdFilter && { shopId: shopIdFilter }),
        ...(options?.shopId && { shopId: options.shopId }),
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
        shop: true,
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

    return orders;
  }

  /**
   * Get orders count
   */
  static async getOrdersCount(options?: any): Promise<number> {
    const count = await prisma.order.count({
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

    return count;
  }

  /**
   * Get order timeline (placeholder)
   */
  static async getOrderTimeline(orderId: string): Promise<any> {
    // TODO: Implement timeline retrieval from database
    return {
      orderId,
      events: [],
      totalEvents: 0,
    };
  }

  /**
   * Cancel order
   */
  static async cancelOrder(
    orderId: string,
    _reason: string,
    _userId: string,
  ): Promise<any> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Release inventory
    await this.releaseInventory(orderId, order.items);

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'cancelled',
        customerVisibleStatus: 'cancelled',
      },
    });

    return updatedOrder;
  }

  /**
   * Add note to order
   */
  static async addNote(
    orderId: string,
    note: string,
    _performedBy: string,
    _performedByType: string,
  ): Promise<any> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Update order notes (append)
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        notes: order.notes ? `${order.notes}\n${note}` : note,
      },
    });

    return updatedOrder;
  }

  static async transitionOrder(request: any): Promise<any> {
    const order = await prisma.order.findUnique({
      where: { id: request.orderId },
    });
    if (!order) throw new Error('Order not found');
    const from = order.status as string;
    const to = request.to as string;
    const validStatuses = [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded',
      'returned',
      'archived',
      'failed_delivery',
      'held',
      'awaiting_payment',
      'partially_shipped',
      'partially_delivered',
      'partially_cancelled',
      'partially_returned',
      'partially_refunded',
      'ready_for_pickup',
      'draft',
      'pending_payment',
      'payment_authorized',
      'payment_failed',
      'packed',
      'ready_for_shipment',
      'completed',
      'closed',
    ];
    if (!validStatuses.includes(to)) throw new Error(`Invalid status: ${to}`);
    const invalidJumps: Record<string, string[]> = {
      pending: ['delivered', 'shipped', 'refunded', 'returned'],
      draft: ['delivered', 'shipped', 'completed', 'cancelled'],
      cancelled: ['delivered', 'confirmed', 'processing', 'shipped', 'pending'],
      delivered: ['pending', 'draft', 'processing', 'cancelled'],
      shipped: ['pending', 'draft'],
      refunded: ['pending', 'confirmed', 'processing', 'shipped', 'delivered'],
    };
    if (invalidJumps[from]?.includes(to))
      throw new Error(`Invalid transition: ${from} → ${to}`);
    if (from === to) throw new Error(`Already in status: ${from}`);
    const updated = await prisma.order.update({
      where: { id: request.orderId },
      data: { status: request.to },
    });
    return { success: true, newStatus: request.to, order: updated };
  }

  /**
   * Get order summary (placeholder)
   */
  static async getSummary(options?: any): Promise<any> {
    const orders = await prisma.order.findMany({
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

    return {
      totalOrders,
      totalValue: { amount: totalValue.toString(), currency: 'INR' },
      averageOrderValue: {
        amount: (totalValue / totalOrders || 0).toString(),
        currency: 'INR',
      },
    };
  }

  /**
   * Get dashboard statistics (placeholder)
   */
  static async getDashboardStats(): Promise<any> {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const todayOrders = await prisma.order.count({
      where: {
        isActive: true,
        placedAt: { gte: todayStart },
      },
    });

    const todayRevenue = await prisma.order.aggregate({
      where: {
        isActive: true,
        placedAt: { gte: todayStart },
      },
      _sum: { grandTotal: true },
    });

    return {
      todayOrders,
      todayRevenue: {
        amount: todayRevenue._sum.grandTotal?.toString() || '0',
        currency: 'INR',
      },
      pendingOrders: 0,
      processingOrders: 0,
      readyToShip: 0,
      shippedToday: 0,
      deliveredToday: 0,
      cancellationRate7d: 0,
      refundRate7d: 0,
    };
  }
}
