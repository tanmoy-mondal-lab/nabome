import { prisma } from "../_lib/prisma";
import { success, badRequest, notFound, error, serverError } from "../_lib/response";
import type { RequestContext } from "../_lib/types";
import { createHmac } from "crypto";
import { sendEmailNotification } from "../_lib/email";
import { logAction, extractRequestMeta } from "../_lib/audit";

async function callRazorpay(
  path: string,
  method: string,
  body?: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials not configured");
  }
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
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
    return error("Method not allowed", 405);
  }

  switch (action) {
    case "verify":
      return handleVerify(req);
    case "failed":
      return handleFailed(req);
    case "retry":
      return handleRetry(req);
    case "refund":
      return handleRefund(req, ctx);
    case "webhook":
      return handleWebhook(req);
    default:
      return notFound();
  }
}

async function handleVerify(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature, orderId } = body;

    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature || !orderId) {
      return badRequest(
        "Missing required fields: razorpayPaymentId, razorpayOrderId, razorpaySignature, orderId"
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return serverError(new Error("Razorpay secret not configured"));
    }

    const expected = createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expected !== razorpaySignature) {
      return badRequest("Invalid payment signature");
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return notFound("Order not found");

    if (order.paymentStatus === "paid") {
      logAction(null, "payment.verify_duplicate", {
        entity: "order",
        entityId: orderId,
        metadata: { razorpayPaymentId },
        ...extractRequestMeta(req),
      });
      return success({ success: true, alreadyProcessed: true });
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          razorpayPaymentId,
          paymentStatus: "paid",
          status: "confirmed",
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: "confirmed",
          note: "Payment received and verified",
          createdBy: order.profileId,
        },
      });

      await tx.notification.create({
        data: {
          profileId: order.profileId!,
          orderId,
          type: "payment_success",
          channel: "in_app",
          title: "Payment Successful",
          body: `Payment of ₹${Number(order.total)} for order ${order.orderNumber} was successful.`,
          data: { orderNumber: order.orderNumber, razorpayPaymentId },
        },
      });
    });

    // ── Send payment success email ──
    try {
      await sendEmailNotification("payment_success", {
        orderNumber: order.orderNumber,
        email: order.email,
        amount: `₹${Number(order.total).toLocaleString("en-IN")}`,
        transactionId: razorpayPaymentId,
        orderId: order.id,
      }, { profileId: order.profileId, orderId: order.id });
    } catch (emailErr) {
      console.error("[EMAIL] Failed to send payment success:", (emailErr as Error).message);
    }

    logAction(order.profileId, "payment.verify", {
      entity: "order",
      entityId: order.id,
      metadata: { orderNumber: order.orderNumber, razorpayPaymentId },
      ...extractRequestMeta(req),
    });

    return success({ success: true });
  } catch (err) {
    return serverError(err);
  }
}

async function handleFailed(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { orderId, errorCode, errorDescription } = body;

    if (!orderId) return badRequest("orderId is required");

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return notFound("Order not found");

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { paymentStatus: "failed" },
      });

      await tx.notification.create({
        data: {
          profileId: order.profileId!,
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
    });

    // ── Send payment failure email ──
    try {
      await sendEmailNotification("payment_failure", {
        orderNumber: order.orderNumber,
        email: order.email,
        reason: errorDescription || "Payment was declined by the bank or card issuer.",
        orderId: order.id,
      }, { profileId: order.profileId, orderId: order.id });
    } catch (emailErr) {
      console.error("[EMAIL] Failed to send payment failure:", (emailErr as Error).message);
    }

    logAction(order.profileId, "payment.failed", {
      entity: "order",
      entityId: order.id,
      metadata: { orderNumber: order.orderNumber, errorCode, errorDescription },
      ...extractRequestMeta(req),
    });

    return success({ success: true });
  } catch (err) {
    return serverError(err);
  }
}

async function handleRetry(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) return badRequest("orderId is required");

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return notFound("Order not found");
    if (order.paymentStatus !== "failed") {
      return badRequest("Only failed payments can be retried");
    }

    const razorpayData = await callRazorpay("/orders", "POST", {
      amount: Math.round(Number(order.total) * 100),
      currency: order.currency,
      receipt: order.orderNumber,
      notes: { orderId: order.id },
    });

    const razorpayOrderId = razorpayData.id as string;

    await prisma.order.update({
      where: { id: orderId },
      data: { razorpayOrderId, paymentStatus: "pending" },
    });

    return success({ razorpayOrderId });
  } catch (err) {
    return serverError(err);
  }
}

async function handleRefund(req: Request, ctx: RequestContext): Promise<Response> {
  try {
    const body = await req.json();
    const { orderId, amount, returnRequestId } = body;

    if (!orderId) return badRequest("orderId is required");

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { refunds: true },
    });
    if (!order) return notFound("Order not found");

    if (order.paymentStatus !== "paid" && order.paymentStatus !== "partially_refunded") {
      return badRequest("Order is not eligible for refund");
    }

    const existingRefunded = order.refunds.reduce(
      (sum, r) => sum + (r.status === "completed" ? Number(r.amount) : 0),
      0
    );
    const remaining = Number(order.total) - existingRefunded;
    const refundAmount = amount ? Math.min(Number(amount), remaining) : remaining;

    if (refundAmount <= 0) {
      return badRequest("No amount available to refund");
    }

    if (!order.razorpayPaymentId) {
      return badRequest("No Razorpay payment found for this order");
    }

    const refundData = await callRazorpay("/refunds", "POST", {
      payment_id: order.razorpayPaymentId,
      amount: Math.round(refundAmount * 100),
      notes: { order_id: orderId, order_number: order.orderNumber },
    });

    const isFullRefund = refundAmount >= remaining;

    await prisma.$transaction(async (tx) => {
      // Create or reuse a return request for this refund
      let rrId = returnRequestId as string | undefined;
      if (!rrId) {
        const existingRR = await tx.returnRequest.findFirst({
          where: { orderId, status: "approved" },
        });
        if (existingRR) {
          rrId = existingRR.id;
        } else {
          const rr = await tx.returnRequest.create({
            data: {
              orderId,
              profileId: order.profileId!,
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

      await tx.refund.create({
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

      await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: isFullRefund ? "refunded" : "partially_refunded",
          ...(isFullRefund ? { refundedAt: new Date() } : {}),
        },
      });

      await tx.notification.create({
        data: {
          profileId: order.profileId!,
          orderId,
          type: "refund_processed",
          channel: "in_app",
          title: "Refund Processed",
          body: `Refund of ₹${refundAmount} for order ${order.orderNumber} has been processed.`,
          data: {
            orderNumber: order.orderNumber,
            amount: refundAmount,
            refundId: refundData.id as string,
          },
        },
      });
    });

    logAction(ctx.userId, "payment.refund", {
      entity: "order",
      entityId: orderId,
      metadata: {
        orderNumber: order.orderNumber,
        amount: refundAmount,
        refundId: refundData.id,
        isFullRefund,
      },
      ...extractRequestMeta(req),
    });

    return success({
      success: true,
      refundId: refundData.id,
      amount: refundAmount,
      type: isFullRefund ? "full" : "partial",
    });
  } catch (err) {
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
  return event.event_id || event.id || `${event.event}_${event.created_at || Date.now()}`;
}

async function findOrderByRazorpayOrderId(razorpayOrderId: string) {
  return prisma.order.findFirst({ where: { razorpayOrderId } });
}

async function findOrderByPaymentId(razorpayPaymentId: string) {
  return prisma.order.findFirst({ where: { razorpayPaymentId } });
}

function roundAmount(amount: unknown): number {
  return typeof amount === "number" ? amount / 100 : Number(amount || 0);
}

// ─────────────────────────────────────────────────────────────
// WEBHOOK EVENT HANDLERS
// ─────────────────────────────────────────────────────────────

async function handlePaymentCaptured(payload: WebhookEventPayload) {
  const payment = payload.payment?.entity as Record<string, unknown> | undefined;
  if (!payment) throw new Error("Missing payment entity in payload");

  const razorpayOrderId = payment.order_id as string;
  const razorpayPaymentId = payment.id as string;
  const amount = roundAmount(payment.amount);
  const method = payment.method as string;

  const order = await findOrderByRazorpayOrderId(razorpayOrderId);
  if (!order) throw new Error(`Order not found for razorpay_order_id: ${razorpayOrderId}`);

  const result = await prisma.$transaction(async (tx) => {
    const current = await tx.order.findUnique({ where: { id: order.id } });
    if (!current || current.paymentStatus === "paid") return { status: "already_processed", orderId: order.id, orderNumber: order.orderNumber };

    await tx.order.update({
      where: { id: order.id },
      data: {
        razorpayPaymentId,
        paymentMethod: (method as string) || current.paymentMethod,
        paymentStatus: "paid",
        status: "confirmed",
      },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: "confirmed",
        note: `Payment confirmed via Razorpay webhook (${method || "unknown"})`,
        createdBy: order.profileId,
      },
    });

    if (order.profileId) {
      await tx.notification.create({
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
      }, { profileId: order.profileId, orderId: order.id });
    } catch {}
  }

  return result;
}

async function handlePaymentFailed(payload: WebhookEventPayload) {
  const payment = payload.payment?.entity as Record<string, unknown> | undefined;
  if (!payment) throw new Error("Missing payment entity in payload");

  const razorpayOrderId = payment.order_id as string;
  const errorDescription = payment.error_description as string;
  const errorCode = payment.error_code as string;
  const errorSource = payment.error_source as string;
  const errorStep = payment.error_step as string;
  const errorReason = payment.error_reason as string;

  const order = await findOrderByRazorpayOrderId(razorpayOrderId);
  if (!order) throw new Error(`Order not found for razorpay_order_id: ${razorpayOrderId}`);

  const result = await prisma.$transaction(async (tx) => {
    const current = await tx.order.findUnique({ where: { id: order.id } });
    if (!current || current.paymentStatus === "failed") return { status: "already_processed", orderId: order.id };

    await tx.order.update({
      where: { id: order.id },
      data: { paymentStatus: "failed" },
    });

    if (order.profileId) {
      await tx.notification.create({
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
      }, { profileId: order.profileId, orderId: order.id });
    } catch {}
  }

  return result;
}

async function handleRefundCreated(payload: WebhookEventPayload) {
  const refund = payload.refund?.entity as Record<string, unknown> | undefined;
  if (!refund) throw new Error("Missing refund entity in payload");

  const refundId = refund.id as string;
  const razorpayPaymentId = refund.payment_id as string;
  const refundAmount = roundAmount(refund.amount);
  const refundStatus = refund.status as string;
  const refundCreatedAt = refund.created_at ? new Date((refund.created_at as number) * 1000) : new Date();

  let order = await findOrderByPaymentId(razorpayPaymentId);
  if (!order) {
    const paymentEntity = payload.payment?.entity as Record<string, unknown> | undefined;
    const razorpayOrderId = paymentEntity?.order_id as string || "";
    if (razorpayOrderId) {
      order = await findOrderByRazorpayOrderId(razorpayOrderId);
    }
  }
  if (!order) throw new Error(`Order not found for razorpay_payment_id: ${razorpayPaymentId}`);

  return prisma.$transaction(async (tx) => {
    const existingRefund = await tx.refund.findFirst({
      where: { transactionId: refundId },
    });
    if (existingRefund) return { status: "already_processed", refundId: existingRefund.id, orderId: order.id };

    let rrId: string | null = null;
    const existingRR = await tx.returnRequest.findFirst({
      where: { orderId: order.id, status: "approved" },
    });
    if (existingRR) {
      rrId = existingRR.id;
    } else {
      const rr = await tx.returnRequest.create({
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

    const refundRecord = await tx.refund.create({
      data: {
        returnRequestId: rrId,
        orderId: order.id,
        amount: refundAmount,
        type: "partial",
        status: refundStatus === "processed" ? "completed" : "processing",
        paymentMethod: "razorpay",
        transactionId: refundId,
        processedAt: refundStatus === "processed" ? refundCreatedAt : null,
        notes: `Refund initiated via Razorpay. Refund ID: ${refundId}`,
      },
    });

    const allRefunds = await tx.refund.findMany({
      where: { orderId: order.id, status: "completed" },
    });
    const totalRefunded = allRefunds.reduce((sum, r) => sum + Number(r.amount), 0) + (refundStatus === "processed" ? Number(refundAmount) : 0);
    const orderTotal = Number(order.total);
    const isFullRefund = totalRefunded >= orderTotal;

    await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: isFullRefund ? "refunded" : "partially_refunded",
        ...(isFullRefund ? { refundedAt: refundCreatedAt } : {}),
      },
    });

    if (order.profileId) {
      await tx.notification.create({
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

async function handleRefundProcessed(payload: WebhookEventPayload) {
  const refund = payload.refund?.entity as Record<string, unknown> | undefined;
  if (!refund) throw new Error("Missing refund entity in payload");

  const refundId = refund.id as string;
  const refundAmount = roundAmount(refund.amount);

  const existingRefund = await prisma.refund.findFirst({
    where: { transactionId: refundId },
  });
  if (!existingRefund) {
    return handleRefundCreated(payload);
  }

  return prisma.$transaction(async (tx) => {
    if (existingRefund.status === "completed") return { status: "already_processed", refundId: existingRefund.id };

    await tx.refund.update({
      where: { id: existingRefund.id },
      data: {
        status: "completed",
        processedAt: new Date(),
      },
    });

    const allRefunds = await tx.refund.findMany({
      where: { orderId: existingRefund.orderId, status: "completed" },
    });
    const totalRefunded = allRefunds.reduce((sum, r) => sum + Number(r.amount), 0) + Number(refundAmount);
    const order = await tx.order.findUnique({ where: { id: existingRefund.orderId } });
    if (!order) throw new Error(`Order not found: ${existingRefund.orderId}`);

    const isFullRefund = totalRefunded >= Number(order.total);
    await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: isFullRefund ? "refunded" : "partially_refunded",
        ...(isFullRefund ? { refundedAt: new Date() } : {}),
      },
    });

    if (order.profileId) {
      await tx.notification.create({
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

const EVENT_HANDLERS: Record<string, (payload: WebhookEventPayload) => Promise<{ status: string; [key: string]: unknown }>> = {
  "payment.captured": handlePaymentCaptured,
  "payment.failed": handlePaymentFailed,
  "refund.created": handleRefundCreated,
  "refund.processed": handleRefundProcessed,
};

// ─────────────────────────────────────────────────────────────
// WEBHOOK ENTRY POINT
// ─────────────────────────────────────────────────────────────

async function handleWebhook(req: Request): Promise<Response> {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  // ── 1. Verify secret is configured ──
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[WEBHOOK] Secret not configured");
    return success({ status: "ignored" });
  }

  // ── 2. Verify HMAC signature ──
  if (!signature) {
    console.error("[WEBHOOK] Missing x-razorpay-signature header");
    return success({ status: "invalid_signature" });
  }

  const expected = createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (expected !== signature) {
    console.error("[WEBHOOK] Invalid signature");
    return success({ status: "invalid_signature" });
  }

  // ── 3. Parse event ──
  let event: WebhookEventPayload;
  try {
    event = JSON.parse(rawBody);
  } catch {
    console.error("[WEBHOOK] Invalid JSON payload");
    return success({ status: "invalid_payload" });
  }

  const eventName = event.event;
  const eventId = getWebhookEventId(event);

  if (!eventName) {
    console.error("[WEBHOOK] Missing event name");
    return success({ status: "invalid_event" });
  }

  // ── 4. Dedup — check if we already processed this event ──
  try {
    const existing = await prisma.webhookEvent.findUnique({
      where: { source_eventId: { source: "razorpay", eventId } },
    });

    if (existing) {
      if (existing.status === "processed") {
        return success({ status: "duplicate_ignored", existingStatus: existing.status });
      }
      if (existing.status === "failed" && existing.retryCount >= 3) {
        return success({ status: "duplicate_ignored", existingStatus: existing.status, retryCount: existing.retryCount });
      }
    }
  } catch {
    // Table might not exist yet (before migration) — proceed without dedup
    console.warn("[WEBHOOK] Could not check dedup table, proceeding");
  }

  // ── 5. Create or update WebhookEvent record ──
  let webhookEventId: string;
  try {
    const record = await prisma.webhookEvent.upsert({
      where: { source_eventId: { source: "razorpay", eventId } },
      create: {
        eventId,
        source: "razorpay",
        eventType: eventName,
        status: "received",
        payload: event as unknown as Record<string, unknown>,
      },
      update: {
        retryCount: { increment: 1 },
        status: "received",
        errorMessage: null,
      },
    });
    webhookEventId = record.id;
  } catch {
    // Upsert failed — try simple create
    try {
      const record = await prisma.webhookEvent.create({
        data: {
          eventId,
          source: "razorpay",
          eventType: eventName,
          status: "received",
          payload: event as unknown as Record<string, unknown>,
        },
      });
      webhookEventId = record.id;
    } catch (createErr) {
      console.error("[WEBHOOK] Failed to create event record:", createErr);
      return success({ status: "logged", error: "Failed to persist event" });
    }
  }

  // ── 6. Route to handler ──
  const handler = EVENT_HANDLERS[eventName];
  if (!handler) {
    await prisma.webhookEvent.update({
      where: { id: webhookEventId },
      data: { status: "skipped", processedAt: new Date(), errorMessage: `No handler for event: ${eventName}` },
    }).catch(() => {});
    return success({ status: "unhandled_event", eventName });
  }

  try {
    const result = await handler(event);

    await prisma.webhookEvent.update({
      where: { id: webhookEventId },
      data: {
        status: "processed",
        processedAt: new Date(),
        orderId: (result.orderId as string) || null,
      },
    }).catch(() => {});

    logAction(null, "payment.webhook", {
      entity: "payment_webhook",
      entityId: eventId,
      metadata: { event: eventName, status: "processed" },
    });

    return success({ status: "processed", event: eventName, result });
  } catch (err) {
    const errorMessage = (err as Error).message;

    await prisma.webhookEvent.update({
      where: { id: webhookEventId },
      data: {
        status: "failed",
        errorMessage,
        processedAt: new Date(),
      },
    }).catch(() => {});

    logAction(null, "payment.webhook_error", {
      entity: "payment_webhook",
      entityId: eventId,
      metadata: { event: eventName, status: "failed", error: errorMessage },
    });

    console.error(`[WEBHOOK] Error processing ${eventName}:`, errorMessage);
    return success({ status: "error", event: eventName, error: errorMessage });
  }
}

// ─────────────────────────────────────────────────────────────
// ADMIN WEBHOOK ENDPOINTS
// ─────────────────────────────────────────────────────────────

export async function handleAdminWebhookRequest(
  _req: Request,
  _ctx: RequestContext,
  params: string[],
  action?: string
): Promise<Response> {
  switch (action) {
    case "events":
      return handleListWebhookEvents(_req);
    case "reprocess":
      return handleReprocessWebhookEvent(_req, params[0]);
    case "reconcile":
      return handleReconcileOrder(_req, params[0]);
    default:
      return notFound();
  }
}

async function handleListWebhookEvents(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 200);
  const status = url.searchParams.get("status");
  const eventType = url.searchParams.get("eventType");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (eventType) where.eventType = eventType;

  const [events, total] = await Promise.all([
    prisma.webhookEvent.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.webhookEvent.count({ where: where as any }),
  ]);

  return success({
    events,
    pagination: { page, pageSize: limit, total, totalPages: Math.ceil(total / limit) },
  });
}

async function handleReprocessWebhookEvent(req: Request, eventId: string): Promise<Response> {
  if (!eventId) return badRequest("eventId is required");

  const event = await prisma.webhookEvent.findUnique({ where: { id: eventId } });
  if (!event) return notFound("Webhook event not found");

  const handler = EVENT_HANDLERS[event.eventType];
  if (!handler) return badRequest(`No handler for event type: ${event.eventType}`);

  try {
    const result = await handler(event.payload as unknown as WebhookEventPayload);
    await prisma.webhookEvent.update({
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
    await prisma.webhookEvent.update({
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

async function handleReconcileOrder(req: Request, orderId: string): Promise<Response> {
  if (!orderId) return badRequest("orderId is required");

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return notFound("Order not found");

  if (!order.razorpayOrderId) return badRequest("Order has no Razorpay order ID");

  try {
    const razorpayOrder = await callRazorpay(`/orders/${order.razorpayOrderId}`, "GET");
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
      await prisma.order.update({
        where: { id: order.id },
        data: updates,
      });
    }

    const payments = await callRazorpay(`/orders/${order.razorpayOrderId}/payments`, "GET");
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
