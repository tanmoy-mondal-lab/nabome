/**
 * Invoice API Handlers
 * Source: REST_API_SPECIFICATION.md
 *
 * Invoice endpoints for generating and viewing customer invoices.
 */

import type { RequestContext } from '../../_lib/http/context.ts';
import { ApiError } from '../../_lib/http/errors.ts';
import { okJson, errorJson } from '../../_lib/http/response.ts';
import { OrderService } from '../../_lib/order/service.ts';
import { register } from '../register.ts';

/**
 * GET /api/v1/orders/{id}/invoice — Get invoice for order
 */
export async function handleGetOrderInvoice(
  _request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    const { id } = params;

    if (!userId) {
      return errorJson(
        ApiError.unauthorized('Authentication required'),
        context.requestId,
      );
    }

    const order = await OrderService.getOrderById(id || '');

    if (!order) {
      return errorJson(ApiError.notFound('Order not found'), context.requestId);
    }

    // Verify customer owns this order
    if (order.userId !== userId) {
      return errorJson(ApiError.forbidden('Access denied'), context.requestId);
    }

    // Generate invoice data from order
    const invoice = {
      invoiceNumber: `INV-${order.orderNumber}`,
      orderNumber: order.orderNumber,
      orderDate: order.placedAt,
      customer: {
        name: order.billingSnapshot?.name || order.user?.name,
        email: order.billingSnapshot?.email || order.user?.email,
        phone: order.billingSnapshot?.phone,
      },
      billingAddress: order.billingSnapshot,
      shippingAddress: order.shippingSnapshot,
      items: order.items.map((item: any) => ({
        productName: item.productName,
        variantName: item.variantName,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
      })),
      amounts: {
        itemsSubtotal: order.itemsSubtotal,
        shippingTotal: order.shippingTotal,
        discountTotal: order.discountTotal,
        taxTotal: order.taxTotal,
        grandTotal: order.grandTotal,
        currency: order.currency,
      },
      payment: {
        method: order.paymentMethod,
        status: order.paymentStatus,
      },
      status: order.status,
      generatedAt: new Date(),
    };

    return okJson({ invoice }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to generate invoice'),
      context.requestId,
    );
  }
}

// Register routes
register('GET', 'orders/{id}/invoice', handleGetOrderInvoice);
