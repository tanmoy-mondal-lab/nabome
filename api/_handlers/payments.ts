import type { Env } from "../_lib/env";
import { getPrisma } from "../_lib/prisma";
import { success, badRequest, notFound, error, serverError, unauthorized } from "../_lib/response";
import type { RequestContext } from "../_lib/types";
import { sendEmailNotification } from "../_lib/email";
import { logAction, extractRequestMeta } from "../_lib/audit";
import { cleanSecret } from "../_lib/secrets";
import { requireAdmin } from "../_lib/auth-middleware";
import { withRateLimit } from "../_lib/rate-limit";
import { ErrorCode } from "../_lib/types";
import { validateBody, paymentVerifySchema, paymentFailedSchema, paymentRetrySchema, refundSchema } from "../_lib/validate";

async function createHMACSHA256(secret: string, data: string, _env: Env): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualHex(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

async function callRazorpay(
  path: string,
  method: string,
  body?: Record<string, unknown>,
  env?: Env
): Promise<Record<string, unknown>> {
  const fallbackKeyId = typeof process !== "undefined" ? process.env?.RAZORPAY_KEY_ID : undefined;
  const fallbackKeySecret = typeof process !== "undefined" ? process.env?.RAZORPAY_KEY_SECRET : undefined;
  const keyId = cleanSecret(env?.RAZORPAY_KEY_ID || fallbackKeyId);
  const keySecret = cleanSecret(env?.RAZORPAY_KEY_SECRET || fallbackKeySecret);
  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials not configured");
  }
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + btoa(`${keyId}:${keySecret}`),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Razorpay error: ${errBody}`);
  }
  return res.json() as Promise<Record<string, unknown>>;
}

export async function handlePaymentRequest(
  req: Request,
  ctx: RequestContext,
  _params: string[],
  action?: string
): Promise<Response> {
  if (req.method !== "POST") {
    return error(ErrorCode.INVALID_INPUT, "Method not allowed", 405);
  }

  switch (action) {
    case "verify":
      return handleVerify(req, ctx, ctx.env!);
    case "failed":
      return handleFailed(req, ctx, ctx.env!);
    case "retry":
      return handleRetry(req, ctx, ctx.env!);
    case "refund":
      return handleRefund(req, ctx, ctx.env!);
    case "webhook":
      return handleWebhook(req, ctx.env!);
    default:
      return notFound();
  }
}

async function handleVerify(req: Request, ctx: RequestContext, env: Env): Promise<Response> {
  try {
    const parsed = await validateBody(req, paymentVerifySchema);
    if ("response" in parsed) return parsed.response;
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature, orderId } = parsed.data;

    const prisma = getPrisma(env);

    const fallbackKeySecret = typeof process !== "undefined" ? process.env?.RAZORPAY_KEY_SECRET : undefined;
    const keySecret = cleanSecret(env?.RAZORPAY_KEY_SECRET || fallbackKeySecret);
    if (!keySecret) {
      return serverError(new Error("Razorpay secret not configured"));
    }

    const order = await prisma.orders.findUnique({ where: { id: orderId } });
    if (!order) return notFound("Order not found");
    
    // Ownership validation: only the order owner can verify payment
    if (!ctx.userId || order.profileId !== ctx.userId) {
      return notFound("Order not found");
    }
    
    if (!order.razorpayOrderId || order.razorpayOrderId !== razorpayOrderId) {
      return badRequest("Payment order does not match this order");
    }

    const expected = await createHMACSHA256(keySecret, `${razorpayOrderId}|${razorpayPaymentId}`, env);
    if (!timingSafeEqualHex(expected, razorpaySignature)) {
      return badRequest("Invalid payment signature");
    }

    // Verify the actual payment amount from Razorpay matches the order total.
    // The HMAC covers only (orderId|paymentId), not the amount, so a client
    // could submit a valid signature for a lesser payment against a larger order.
    let paymentAmount: number;
    try {
      const payment = await callRazorpay(`/payments/${razorpayPaymentId}`, "GET", undefined, env);
      const actualAmount = payment.amount as number;
      const paymentOrderId = payment.order_id as string;
      if (paymentOrderId !== razorpayOrderId) {
        return badRequest("Payment does not belong to this order");
      }
      paymentAmount = roundAmount(actualAmount);
    } catch {
      return serverError(new Error("Failed to verify payment amount with Razorpay"));
    }
    const orderTotal = Number(order.total);
    if (Math.abs(paymentAmount - orderTotal) > 0.01) {
      void logAction(null, "payment.amount_mismatch", {
        entity: "order",
        entityId: orderId,
        metadata: { expected: orderTotal, actual: paymentAmount, razorpayPaymentId },
        ...extractRequestMeta(req),
      }, env);
      return badRequest("Payment amount does not match order total");
    }

    if (order.paymentStatus === "paid") {
      void logAction(null, "payment.verify_duplicate", {
        entity: "order",
        entityId: orderId,
        metadata: { razorpayPaymentId },
        ...extractRequestMeta(req),
      }, env);
      return success({ success: true, alreadyProcessed: true });
    }
    if (!["pending", "failed"].includes(order.paymentStatus)) {
      return badRequest("Order is not awaiting payment");
    }

    await prisma.$transaction(async (tx) => {
      // Check for duplicate payment inside transaction to prevent race condition (R3)
      const paymentAlreadyUsed = await tx.orders.findFirst({
        where: {
          razorpayPaymentId,
          id: { not: orderId },
        },
        select: { id: true },
      });
      if (paymentAlreadyUsed) throw new Error("Payment has already been applied to another order");
      await tx.orders.update({
        where: { id: orderId },
        data: {
          razorpayPaymentId,
          paymentStatus: "paid",
          status: "confirmed",
        },
      });

      await tx.order_status_history.create({
        data: {
          orderId,
          status: "confirmed",
          note: "Payment received and verified",
          createdBy: order.profileId,
        },
      });

      if (order.profileId) {
        await tx.notifications.create({
          data: {
            profileId: order.profileId,
            orderId,
            type: "payment_success",
            channel: "in_app",
            title: "Payment Successful",
            body: `Payment of ₹${Number(order.total)} for order ${order.orderNumber} was successful.`,
            data: { orderNumber: order.orderNumber, razorpayPaymentId },
          },
        });
      }
    });

    // ── Send payment success email ──
    try {
      await sendEmailNotification("payment_success", {
        orderNumber: order.orderNumber,
        email: order.email,
        amount: `₹${Number(order.total).toLocaleString("en-IN")}`,
        transactionId: razorpayPaymentId,
        orderId: order.id,
      }, env);
    } catch (emailErr) {
      // Silent failure - email send error
    }

    void logAction(null, "payment.verify", {
      entity: "order",
      entityId: order.id,
      metadata: { orderNumber: order.orderNumber, razorpayPaymentId },
      ...extractRequestMeta(req),
    }, env);

    return success({ success: true });
  } catch (err) {
    return serverError(err);
  }
}

async function releaseReservedInventory(
  tx: any,
  order: { id: string; orderNumber: string; items: Array<{ variantId: string | null; quantity: number }> }
): Promise<void> {
  const orderItems = (order.items || []).filter((i) => i.variantId) as Array<{ variantId: string; quantity: number }>;
  const variantIds = orderItems.map((i) => i.variantId);
  if (variantIds.length === 0) return;
  const variants = (await tx.product_variants.findMany({ where: { id: { in: variantIds } } })) as Array<{ id: string; stock: number }>;
  const variantMap = new Map<string, { id: string; stock: number }>(variants.map((v) => [v.id, v]));
  const items = orderItems.filter((i) => variantMap.has(i.variantId));
  await Promise.all(
    items.map((item) =>
      tx.product_variants.update({
        where: { id: item.variantId },
        data: { stock: { increment: item.quantity }, reservedStock: { decrement: item.quantity } },
      })
    )
  );
  if (items.length > 0) {
    await tx.inventory_movements.createMany({
      data: items.map((item) => {
        const variant = variantMap.get(item.variantId)!;
        return {
          variantId: item.variantId,
          quantityChange: item.quantity,
          stockAfter: variant.stock + item.quantity,
          reason: "payment_failed",
          referenceId: order.orderNumber,
        };
      }),
    });
  }
}

async function handleFailed(req: Request, ctx: RequestContext, env: Env): Promise<Response> {
  try {
    const parsed = await validateBody(req, paymentFailedSchema);
    if ("response" in parsed) return parsed.response;
    const { orderId, razorpayOrderId, errorCode, errorDescription } = parsed.data;

    const prisma = getPrisma(env);

    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) return notFound("Order not found");
    if (order.razorpayOrderId !== razorpayOrderId) {
      return badRequest("Payment order does not match this order");
    }
    if (order.paymentStatus === "paid") {
      return success({ success: true, ignored: true });
    }
    if (order.paymentStatus !== "pending") {
      return badRequest("Order is not awaiting payment");
    }

    // Ownership validation: only the order owner can mark payment as failed
    if (!ctx.userId || order.profileId !== ctx.userId) {
      return notFound("Order not found");
    }

    await prisma.$transaction(async (tx) => {
      await tx.orders.update({
        where: { id: orderId },
        data: { paymentStatus: "failed" },
      });

      // Release stock that was reserved when the order was placed.
      await releaseReservedInventory(tx, order);

      if (order.profileId) {
        await tx.notifications.create({
          data: {
            profileId: order.profileId,
            orderId,
            type: "payment_failed",
            channel: "in_app",
            title: "Payment Failed",
            body: errorDescription
              ? `Payment failed: ${errorDescription}`
              : "Payment failed. Please try again.",
            data: { errorCode, errorDescription, orderNumber: order.orderNumber },
          },
        });
      }
    });

    // ── Send payment failure email ──
    try {
      await sendEmailNotification("payment_failure", {
        orderNumber: order.orderNumber,
        email: order.email,
        reason: errorDescription || "Payment was declined by the bank or card issuer.",
        orderId: order.id,
      }, env);
    } catch (emailErr) {
      // Silent failure - email send error
    }

    void logAction(null, "payment.failed", {
      entity: "order",
      entityId: order.id,
      metadata: { orderNumber: order.orderNumber, errorCode, errorDescription },
      ...extractRequestMeta(req),
    }, env);

    return success({ success: true });
  } catch (err) {
    return serverError(err);
  }
}

async function handleRetry(req: Request, ctx: RequestContext, env: Env): Promise<Response> {
  try {
    const parsed = await validateBody(req, paymentRetrySchema);
    if ("response" in parsed) return parsed.response;
    const { orderId } = parsed.data;

    const prisma = getPrisma(env);

    const order = await prisma.orders.findUnique({ where: { id: orderId } });
    if (!order) return notFound("Order not found");
    if (!ctx.userId || order.profileId !== ctx.userId) {
      return notFound("Order not found");
    }
    if (order.paymentStatus !== "failed") {
      return badRequest("Only failed payments can be retried");
    }

    const razorpayData = await callRazorpay("/orders", "POST", {
      amount: Math.round(Number(order.total) * 100),
      currency: order.currency,
      receipt: order.orderNumber,
      notes: { orderId: order.id },
    }, env);

    const razorpayOrderId = razorpayData.id as string;

    await prisma.orders.update({
      where: { id: orderId },
      data: { razorpayOrderId, paymentStatus: "pending" },
    });

    return success({ razorpayOrderId });
  } catch (err) {
    return serverError(err);
  }
}

async function handleRefund(req: Request, ctx: RequestContext, env: Env): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;
  try {
    const parsed = await validateBody(req, refundSchema);
    if ("response" in parsed) return parsed.response;
    const { orderId, amount, returnRequestId } = parsed.data;

    const prisma = getPrisma(env);

    const result = await prisma.$transaction(async (tx) => {
      // Re-read order and refunds inside the transaction to prevent TOCTOU
      // between amount computation and DB write (the previous code read refunds
      // outside the transaction, allowing concurrent over-refund).
      const currentOrder = await tx.orders.findUnique({
        where: { id: orderId },
        include: { refunds: true },
      });
      if (!currentOrder) throw Object.assign(new Error("Order not found"), { statusCode: 404 });

      if (currentOrder.paymentStatus !== "paid" && currentOrder.paymentStatus !== "partially_refunded") {
        throw Object.assign(new Error("Order is not eligible for refund"), { statusCode: 400 });
      }

      const existingRefunded = currentOrder.refunds.reduce(
        (sum, r) => sum + (r.status === "completed" ? Number(r.amount) : 0),
        0
      );
      const remaining = Number(currentOrder.total) - existingRefunded;
      const refundAmount = amount ? Math.min(Number(amount), remaining) : remaining;

      if (refundAmount <= 0) {
        throw Object.assign(new Error("No amount available to refund"), { statusCode: 400 });
      }

      if (!currentOrder.razorpayPaymentId) {
        throw Object.assign(new Error("No Razorpay payment found for this order"), { statusCode: 400 });
      }

      const isFullRefund = refundAmount >= remaining;

      // Call Razorpay inside the transaction. If the API call fails, the
      // transaction rolls back and no DB changes are committed. Idempotency
      // key prevents duplicate refunds on network retry.
      const refundData = await callRazorpay(
        `/payments/${encodeURIComponent(currentOrder.razorpayPaymentId)}/refund`,
        "POST",
        {
          amount: Math.round(refundAmount * 100),
          notes: { order_id: orderId, order_number: currentOrder.orderNumber },
        },
        env
      );

      // Create or reuse a return request for this refund
      let rrId = returnRequestId as string | undefined;
      if (!rrId) {
        const existingRR = await tx.return_requests.findFirst({
          where: { orderId, status: "approved" },
        });
        if (existingRR) {
          rrId = existingRR.id;
        } else {
          const rr = await tx.return_requests.create({
            data: {
              orderId,
              profileId: currentOrder.profileId!,
              reason: "other",
              status: "approved",
              adminNote: "Direct refund processed via Razorpay",
              reviewedBy: ctx.userId,
              reviewedAt: new Date(),
            },
          });
          rrId = rr.id;
        }
      }

      // Check for duplicate razorpay refund idempotency
      const existingRefundWithTxnId = await tx.refunds.findFirst({
        where: { transactionId: refundData.id as string },
      });
      if (existingRefundWithTxnId) {
        return { status: "already_processed", refundId: existingRefundWithTxnId.id, orderNumber: currentOrder.orderNumber };
      }

      await tx.refunds.create({
        data: {
          returnRequestId: rrId,
          orderId,
          amount: refundAmount,
          type: isFullRefund ? "full" : "partial",
          status: "completed",
          paymentMethod: "razorpay",
          transactionId: refundData.id as string,
          initiatedBy: ctx.userId,
          processedAt: new Date(),
        },
      });

      await tx.orders.update({
        where: { id: orderId },
        data: {
          paymentStatus: isFullRefund ? "refunded" : "partially_refunded",
          ...(isFullRefund ? { refundedAt: new Date() } : {}),
        },
      });

      await tx.notifications.create({
        data: {
          profileId: currentOrder.profileId!,
          orderId,
          type: "refund_processed",
          channel: "in_app",
          title: "Refund Processed",
          body: `Refund of ₹${refundAmount} for order ${currentOrder.orderNumber} has been processed.`,
          data: {
            orderNumber: currentOrder.orderNumber,
            amount: refundAmount,
            refundId: refundData.id as string,
          },
        },
      });

      return { refundAmount, refundId: refundData.id as string, orderNumber: currentOrder.orderNumber };
    });

    if (result.status === "already_processed") {
      return success({ success: true, alreadyProcessed: true, refundId: result.refundId });
    }

    void logAction(ctx.userId, "payment.refund", {
      entity: "order",
      entityId: orderId,
      metadata: {
        orderNumber: result.orderNumber,
        amount: result.refundAmount,
        refundId: result.refundId,
      },
      ...extractRequestMeta(req),
    }, env);

    return success({
      success: true,
      refundId: result.refundId,
      amount: result.refundAmount,
    });
  } catch (err) {
    const statusCode = (err as Error & { statusCode?: number }).statusCode || 500;
    if (statusCode === 400) return badRequest((err as Error).message);
    if (statusCode === 404) return notFound((err as Error).message);
    return serverError(err);
  }
}

// ─────────────────────────────────────────────────────────────
// WEBHOOK HELPERS
// ─────────────────────────────────────────────────────────────

interface WebhookEventPayload {
  event: string;
  event_id?: string;
  id?: string;
  payload: {
    payment?: { entity: Record<string, unknown> };
    refund?: { entity: Record<string, unknown> };
    order?: { entity: Record<string, unknown> };
    [key: string]: unknown;
  };
  created_at?: number;
}

function getWebhookEventId(event: WebhookEventPayload): string {
  return event.event_id || event.id || `${event.event}_${event.created_at || Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
}

async function findOrderByRazorpayOrderId(razorpayOrderId: string, env: Env) {
  const prisma = getPrisma(env);
  return prisma.orders.findFirst({ where: { razorpayOrderId } });
}

async function findOrderByPaymentId(razorpayPaymentId: string, env: Env) {
  const prisma = getPrisma(env);
  return prisma.orders.findFirst({ where: { razorpayPaymentId } });
}

function roundAmount(amount: unknown): number {
  return typeof amount === "number" ? amount / 100 : Number(amount || 0);
}

// ─────────────────────────────────────────────────────────────
// WEBHOOK EVENT HANDLERS
// ─────────────────────────────────────────────────────────────

async function handlePaymentCaptured(event: WebhookEventPayload, ctx: { env: Env }) {
  const prisma = getPrisma(ctx.env!);
  const payment = event.payload.payment?.entity as Record<string, unknown> | undefined;
  if (!payment) return { status: "skipped", reason: "Missing payment entity in payload" };

  const razorpayOrderId = payment.order_id as string;
  const razorpayPaymentId = payment.id as string;
  const amount = roundAmount(payment.amount);
  const method = payment.method as string;

  const order = await findOrderByRazorpayOrderId(razorpayOrderId, ctx.env!);
  if (!order) return { status: "skipped", reason: `Order not found for razorpay_order_id: ${razorpayOrderId}` };

  // Verify webhook payment amount matches order total
  const orderTotal = Number(order.total);
  if (Math.abs(amount - orderTotal) > 0.01) {
    void logAction(null, "payment.webhook_amount_mismatch", {
      entity: "order",
      entityId: order.id,
      metadata: { expected: orderTotal, actual: amount, razorpayPaymentId, razorpayOrderId },
    }, ctx.env!);
    return { status: "skipped", reason: `Payment amount (${amount}) does not match order total (${orderTotal})` };
  }

  const result = await prisma.$transaction(async (tx) => {
    const current = await tx.orders.findUnique({ where: { id: order.id } });
    if (!current || current.paymentStatus === "paid") return { status: "already_processed", orderId: order.id, orderNumber: order.orderNumber };

    await tx.orders.update({
      where: { id: order.id },
      data: {
        razorpayPaymentId,
        paymentMethod: (method as string) || current.paymentMethod,
        paymentStatus: "paid",
        status: "confirmed",
      },
    });

    await tx.order_status_history.create({
      data: {
        orderId: order.id,
        status: "confirmed",
        note: `Payment confirmed via Razorpay webhook (${method || "unknown"})`,
        createdBy: order.profileId,
      },
    });

    if (order.profileId) {
      await tx.notifications.create({
        data: {
          profileId: order.profileId,
          orderId: order.id,
          type: "payment_success",
          channel: "in_app",
          title: "Payment Successful",
          body: `Payment of ₹${amount} for order ${order.orderNumber} was successful.`,
          data: { orderNumber: order.orderNumber, razorpayPaymentId, method },
        },
      });
    }

    return { status: "processed", orderId: order.id, orderNumber: order.orderNumber };
  });

  if (result.status === "processed") {
    try {
      await sendEmailNotification("payment_success", {
        orderNumber: order.orderNumber,
        email: order.email,
        amount: `₹${amount.toLocaleString("en-IN")}`,
        transactionId: razorpayPaymentId,
        orderId: order.id,
      }, ctx.env!);
    } catch {}
  }

  return result;
}

async function handlePaymentFailed(event: WebhookEventPayload, ctx: { env: Env }) {
  const prisma = getPrisma(ctx.env!);
  const payment = event.payload.payment?.entity as Record<string, unknown> | undefined;
  if (!payment) return { status: "skipped", reason: "Missing payment entity in payload" };

  const razorpayOrderId = payment.order_id as string;
  const errorDescription = payment.error_description as string;
  const errorCode = payment.error_code as string;
  const errorSource = payment.error_source as string;
  const errorStep = payment.error_step as string;
  const errorReason = payment.error_reason as string;

  const order = await findOrderByRazorpayOrderId(razorpayOrderId, ctx.env!);
  if (!order) return { status: "skipped", reason: `Order not found for razorpay_order_id: ${razorpayOrderId}` };

  const orderWithItems = await prisma.orders.findUnique({
    where: { id: order.id },
    include: { items: true },
  });

  const result = await prisma.$transaction(async (tx) => {
    const current = await tx.orders.findUnique({ where: { id: order.id } });
    if (!current || current.paymentStatus === "failed") return { status: "already_processed", orderId: order.id };

    await tx.orders.update({
      where: { id: order.id },
      data: { paymentStatus: "failed" },
    });

    // Release stock that was reserved when the order was placed.
    if (orderWithItems) await releaseReservedInventory(tx, orderWithItems);

    if (order.profileId) {
      await tx.notifications.create({
        data: {
          profileId: order.profileId,
          orderId: order.id,
          type: "payment_failed",
          channel: "in_app",
          title: "Payment Failed",
          body: errorDescription || "Payment failed",
          data: { orderNumber: order.orderNumber, errorCode, errorDescription, errorSource, errorStep, errorReason },
        },
      });
    }

    return { status: "processed", orderId: order.id };
  });

  if (result.status === "processed") {
    try {
      await sendEmailNotification("payment_failure", {
        orderNumber: order.orderNumber,
        email: order.email,
        reason: errorDescription || "Payment was declined.",
        orderId: order.id,
      }, ctx.env!);
    } catch {}
  }

  return result;
}

async function handleRefundCreated(event: WebhookEventPayload, ctx: { env: Env }) {
  const prisma = getPrisma(ctx.env!);
  const refund = event.payload.refund?.entity as Record<string, unknown> | undefined;
  if (!refund) return { status: "skipped", reason: "Missing refund entity in payload" };

  const refundId = refund.id as string;
  const razorpayPaymentId = refund.payment_id as string;
  const refundAmount = roundAmount(refund.amount);
  const refundStatus = refund.status as string;
  const refundCreatedAt = refund.created_at ? new Date((refund.created_at as number) * 1000) : new Date();

  let order = await findOrderByPaymentId(razorpayPaymentId, ctx.env!);
  if (!order) {
    const paymentEntity = event.payload.payment?.entity as Record<string, unknown> | undefined;
    const razorpayOrderId = paymentEntity?.order_id as string || "";
    if (razorpayOrderId) {
      order = await findOrderByRazorpayOrderId(razorpayOrderId, ctx.env!);
    }
  }
  if (!order) return { status: "skipped", reason: `Order not found for razorpay_payment_id: ${razorpayPaymentId}` };

  return prisma.$transaction(async (tx) => {
    const existingRefund = await tx.refunds.findFirst({
      where: { transactionId: refundId },
    });
    if (existingRefund) return { status: "already_processed", refundId: existingRefund.id, orderId: order.id };

    let rrId: string | null = null;
    const existingRR = await tx.return_requests.findFirst({
      where: { orderId: order.id, status: "approved" },
    });
    if (existingRR) {
      rrId = existingRR.id;
    } else {
      const rr = await tx.return_requests.create({
        data: {
          orderId: order.id,
          profileId: order.profileId!,
          reason: "other",
          status: "approved",
          adminNote: "Auto-created via Razorpay refund webhook",
          reviewedAt: new Date(),
        },
      });
      rrId = rr.id;
    }

    const allRefunds = await tx.refunds.findMany({
      where: { orderId: order.id, status: "completed" },
    });
    const otherRefunded = allRefunds.reduce((sum, r) => sum + Number(r.amount), 0);
    const orderTotal = Number(order.total);
    const isFullRefund = otherRefunded + Number(refundAmount) >= orderTotal;

    const refundRecord = await tx.refunds.create({
      data: {
        returnRequestId: rrId,
        orderId: order.id,
        amount: refundAmount,
        type: isFullRefund ? "full" : "partial",
        status: refundStatus === "processed" ? "completed" : "processing",
        paymentMethod: "razorpay",
        transactionId: refundId,
        processedAt: refundStatus === "processed" ? refundCreatedAt : null,
        notes: `Refund initiated via Razorpay. Refund ID: ${refundId}`,
      },
    });

    await tx.orders.update({
      where: { id: order.id },
      data: {
        paymentStatus: isFullRefund ? "refunded" : "partially_refunded",
        ...(isFullRefund ? { refundedAt: refundCreatedAt } : {}),
      },
    });

    if (order.profileId) {
      await tx.notifications.create({
        data: {
          profileId: order.profileId,
          orderId: order.id,
          type: "refund_processed",
          channel: "in_app",
          title: "Refund Initiated",
          body: `Refund of ₹${refundAmount} for order ${order.orderNumber} has been initiated.`,
          data: { orderNumber: order.orderNumber, amount: refundAmount, refundId },
        },
      });
    }

    return { status: "processed", refundId: refundRecord.id, orderId: order.id };
  });
}

async function handleRefundProcessed(event: WebhookEventPayload, ctx: { env: Env }) {
  const prisma = getPrisma(ctx.env!);
  const refund = event.payload.refund?.entity as Record<string, unknown> | undefined;
  if (!refund) throw new Error("Missing refund entity in payload");

  const refundId = refund.id as string;
  const refundAmount = roundAmount(refund.amount);

  const existingRefund = await prisma.refunds.findFirst({
    where: { transactionId: refundId },
  });
  if (!existingRefund) {
    return handleRefundCreated(event, ctx);
  }

  return prisma.$transaction(async (tx) => {
    if (existingRefund.status === "completed") return { status: "already_processed", refundId: existingRefund.id };

    await tx.refunds.update({
      where: { id: existingRefund.id },
      data: {
        status: "completed",
        processedAt: new Date(),
      },
    });

    const allRefunds = await tx.refunds.findMany({
      where: { orderId: existingRefund.orderId, status: "completed" },
    });
    // Note: allRefunds already includes the current refund (just marked completed above),
    // so we must NOT add refundAmount again to avoid double-counting.
    const totalRefunded = allRefunds.reduce((sum, r) => sum + Number(r.amount), 0);
    const order = await tx.orders.findUnique({ where: { id: existingRefund.orderId } });
    if (!order) throw new Error(`Order not found: ${existingRefund.orderId}`);

    const isFullRefund = totalRefunded >= Number(order.total);
    await tx.orders.update({
      where: { id: order.id },
      data: {
        paymentStatus: isFullRefund ? "refunded" : "partially_refunded",
        ...(isFullRefund ? { refundedAt: new Date() } : {}),
      },
    });

    if (order.profileId) {
      await tx.notifications.create({
        data: {
          profileId: order.profileId,
          orderId: order.id,
          type: "refund_processed",
          channel: "in_app",
          title: "Refund Completed",
          body: `Refund of ₹${refundAmount} for order ${order.orderNumber} has been completed.`,
          data: { orderNumber: order.orderNumber, amount: refundAmount, refundId },
        },
      });
    }

    return { status: "processed", refundId: existingRefund.id };
  });
}

const EVENT_HANDLERS: Record<string, (event: WebhookEventPayload, ctx: { env: Env }) => Promise<{ status: string; [key: string]: unknown }>> = {
  "payment.captured": handlePaymentCaptured,
  "payment.failed": handlePaymentFailed,
  "refund.created": handleRefundCreated,
  "refund.processed": handleRefundProcessed,
};

// ─────────────────────────────────────────────────────────────
// WEBHOOK ENTRY POINT
// ─────────────────────────────────────────────────────────────

const WEBHOOK_MAX_BODY_SIZE = 256_000;

async function handleWebhook(req: Request, env: Env): Promise<Response> {
  const prisma = getPrisma(env);

  const clientIp = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimitResponse = await withRateLimit(
    `${clientIp}:webhook`,
    { windowMs: 60_000, maxRequests: 30, message: "Too many webhook requests. Slow down." },
    env
  );
  if (rateLimitResponse) return rateLimitResponse;

  const contentLength = parseInt(req.headers.get("content-length") || "0", 10);
  if (contentLength > WEBHOOK_MAX_BODY_SIZE) {
    return badRequest("Webhook payload too large");
  }

  const rawBody = await req.text();
  if (rawBody.length > WEBHOOK_MAX_BODY_SIZE) {
    return badRequest("Webhook payload too large");
  }

  const signature = req.headers.get("x-razorpay-signature");

  // ── 1. Verify secret is configured ──
  const fallbackWebhookSecret = typeof process !== "undefined" ? process.env?.RAZORPAY_WEBHOOK_SECRET : undefined;
  const webhookSecret = cleanSecret(env?.RAZORPAY_WEBHOOK_SECRET || fallbackWebhookSecret);
  if (!webhookSecret) {
    return serverError(new Error("Razorpay webhook secret not configured"));
  }

  // ── 2. Verify HMAC signature ──
  if (!signature) {
    return unauthorized("Missing Razorpay webhook signature");
  }

  const expected = await createHMACSHA256(webhookSecret, rawBody, env);

  if (!timingSafeEqualHex(expected, signature)) {
    return unauthorized("Invalid Razorpay webhook signature");
  }

  // ── 3. Parse event ──
  let event: WebhookEventPayload;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return badRequest("Invalid webhook payload");
  }

  const eventName = event.event;
  const eventId = getWebhookEventId(event);

  if (!eventName) {
    return badRequest("Invalid webhook event");
  }

  // ── 4. Dedup + persist atomically (inside transaction to prevent
  //       race between two concurrent webhook deliveries). ──
  let webhookEventId: string;
  try {
    const record = await prisma.$transaction(async (tx) => {
      const existing = await tx.webhook_events.findUnique({
        where: { source_eventId: { source: "razorpay", eventId } },
      });

      if (existing) {
        if (existing.status === "processed") {
          throw Object.assign(new Error("DUPLICATE_PROCESSED"), { existingRecord: existing });
        }
        if (existing.status === "failed" && existing.retryCount >= 3) {
          throw Object.assign(new Error("DUPLICATE_EXHAUSTED"), { existingRecord: existing });
        }
      }

      return tx.webhook_events.upsert({
        where: { source_eventId: { source: "razorpay", eventId } },
        create: {
          eventId,
          source: "razorpay",
          eventType: eventName,
          status: "received",
          payload: event as never,
        },
        update: {
          retryCount: { increment: 1 },
          status: "received",
          errorMessage: null,
        },
      });
    });
    webhookEventId = record.id;
  } catch (err) {
    const dupErr = err as Error & { existingRecord?: { id: string; status: string; retryCount: number } };
    if (dupErr.message === "DUPLICATE_PROCESSED") {
      return success({ status: "duplicate_ignored", existingStatus: dupErr.existingRecord?.status });
    }
    if (dupErr.message === "DUPLICATE_EXHAUSTED") {
      return success({ status: "duplicate_ignored", existingStatus: dupErr.existingRecord?.status, retryCount: dupErr.existingRecord?.retryCount });
    }
    // Unexpected error — try simple create as fallback
    try {
      const record = await prisma.webhook_events.create({
        data: {
          eventId,
          source: "razorpay",
          eventType: eventName,
          status: "received",
          payload: event as never,
        },
      });
      webhookEventId = record.id;
    } catch (createErr) {
      return serverError(new Error("Failed to persist webhook event"));
    }
  }

  // ── 6. Route to handler ──
  const handler = EVENT_HANDLERS[eventName];
  if (!handler) {
    await prisma.webhook_events.update({
      where: { id: webhookEventId },
      data: { status: "skipped", processedAt: new Date(), errorMessage: `No handler for event: ${eventName}` },
    }).catch(() => {});
    return success({ status: "unhandled_event", eventName });
  }

  try {
    const result = await handler(event, { env });
    const webhookStatus = (result as Record<string, unknown>)?.status === "skipped" ? "skipped" : "processed";

    await prisma.webhook_events.update({
      where: { id: webhookEventId },
      data: {
        status: webhookStatus,
        processedAt: new Date(),
        orderId: (result as Record<string, unknown>)?.orderId as string || null,
        errorMessage: webhookStatus === "skipped" ? String((result as Record<string, unknown>)?.reason || "") : undefined,
      },
    }).catch(() => {});

    void logAction(null, "payment.webhook", {
      entity: "payment_webhook",
      entityId: eventId,
      metadata: { event: eventName, status: webhookStatus },
    }, env);

    return success({ status: webhookStatus, event: eventName, result });
  } catch (err) {
    const errorMessage = (err as Error).message;

    await prisma.webhook_events.update({
      where: { id: webhookEventId },
      data: {
        status: "failed",
        errorMessage,
        processedAt: new Date(),
      },
    }).catch(() => {});

    void logAction(null, "payment.webhook_error", {
      entity: "payment_webhook",
      entityId: eventId,
      metadata: { event: eventName, status: "failed", error: errorMessage },
    }, env);

    return success({ status: "event_failed", event: eventName, error: errorMessage });
  }
}

// ─────────────────────────────────────────────────────────────
// ADMIN WEBHOOK ENDPOINTS
// ─────────────────────────────────────────────────────────────

export async function handleAdminWebhookRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action?: string
): Promise<Response> {
  switch (action) {
    case "events":
      return handleListWebhookEvents(req, ctx.env!);
    case "reprocess":
      return handleReprocessWebhookEvent(req, params[0], ctx.env!);
    case "reconcile":
      return handleReconcileOrder(req, params[0], ctx.env!);
    default:
      return notFound();
  }
}

async function handleListWebhookEvents(req: Request, env: Env): Promise<Response> {
  const prisma = getPrisma(env);
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 200);
  const status = url.searchParams.get("status");
  const eventType = url.searchParams.get("eventType");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (eventType) where.eventType = eventType;

  const [events, total] = await Promise.all([
    prisma.webhook_events.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.webhook_events.count({ where: where as any }),
  ]);

  return success({
    events,
    pagination: { page, pageSize: limit, total, totalPages: Math.ceil(total / limit) },
  });
}

async function handleReprocessWebhookEvent(_req: Request, eventId: string, env: Env): Promise<Response> {
  if (!eventId) return badRequest("eventId is required");

  const prisma = getPrisma(env);
  const event = await prisma.webhook_events.findUnique({ where: { id: eventId } });
  if (!event) return notFound("Webhook event not found");

  const handler = EVENT_HANDLERS[event.eventType];
  if (!handler) return badRequest(`No handler for event type: ${event.eventType}`);

  try {
    const result = await handler(event.payload as unknown as WebhookEventPayload, { env });
    await prisma.webhook_events.update({
      where: { id: eventId },
      data: {
        status: "processed",
        processedAt: new Date(),
        orderId: (result.orderId as string) || event.orderId,
        errorMessage: null,
      },
    });
    return success({ status: "reprocessed", result });
  } catch (err) {
    await prisma.webhook_events.update({
      where: { id: eventId },
      data: {
        status: "failed",
        errorMessage: (err as Error).message,
        retryCount: { increment: 1 },
      },
    });
    return serverError(err);
  }
}

async function handleReconcileOrder(_req: Request, orderId: string, env: Env): Promise<Response> {
  if (!orderId) return badRequest("orderId is required");

  const prisma = getPrisma(env);
  const order = await prisma.orders.findUnique({ where: { id: orderId } });
  if (!order) return notFound("Order not found");

  if (!order.razorpayOrderId) return badRequest("Order has no Razorpay order ID");

  try {
    const razorpayOrder = await callRazorpay(`/orders/${order.razorpayOrderId}`, "GET", undefined, env);
    const razorpayStatus = razorpayOrder.status as string;
    const razorpayAmountDue = Number(razorpayOrder.amount_due || 0);

    const updates: Record<string, unknown> = {};

    if (razorpayStatus === "paid" && order.paymentStatus !== "paid") {
      updates.paymentStatus = "paid";
      updates.status = "confirmed";
    } else if (razorpayStatus === "attempted" && razorpayAmountDue > 0 && order.paymentStatus !== "failed") {
      updates.paymentStatus = "failed";
    }

    if (Object.keys(updates).length > 0) {
      await prisma.orders.update({
        where: { id: order.id },
        data: updates,
      });
    }

    const payments = await callRazorpay(`/orders/${order.razorpayOrderId}/payments`, "GET", undefined, env);
    const paymentEntities = payments.items as Array<Record<string, unknown>> || [];

    const reconciliation = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpayStatus,
      ourPaymentStatus: order.paymentStatus,
      ourOrderStatus: order.status,
      correctionsApplied: Object.keys(updates).length > 0,
      corrections: updates,
      paymentCount: paymentEntities.length,
    };

    return success(reconciliation);
  } catch (err) {
    return serverError(err);
  }
}
