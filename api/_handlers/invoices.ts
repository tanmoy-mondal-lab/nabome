import { prisma } from "../_lib/prisma";
import { success, badRequest, notFound, unauthorized, serverError } from "../_lib/response";
import type { RequestContext } from "../_lib/types";

function generateInvoiceHTML(order: Record<string, unknown>): string {
  const o = order as {
    orderNumber: string;
    createdAt: Date;
    email: string;
    subtotal: number;
    shippingCost: number;
    tax: number;
    discount: number;
    total: number;
    currency: string;
    paymentMethod: string;
    paymentStatus: string;
    status: string;
    giftMessage?: string | null;
    notes?: string | null;
    items: Array<{
      productName: string;
      variantLabel: string;
      sku: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
    shippingAddress?: {
      fullName: string;
      phone: string;
      line1: string;
      line2?: string | null;
      city: string;
      state: string;
      pincode: string;
      country: string;
    } | null;
    billingAddress?: {
      fullName: string;
      phone: string;
      line1: string;
      line2?: string | null;
      city: string;
      state: string;
      pincode: string;
      country: string;
    } | null;
    profile?: {
      firstName: string;
      lastName?: string | null;
      email: string;
      phone?: string | null;
    } | null;
  };

  const fmt = (n: number) => `${o.currency} ${n.toFixed(2)}`;
  const date = new Date(o.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });

  const itemsHtml = o.items.map((item) => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
                <strong>${item.productName}</strong><br>
                <small style="color: #718096;">${item.variantLabel} | SKU: ${item.sku}</small>
              </td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">${fmt(Number(item.unitPrice))}</td>
              <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">${fmt(Number(item.totalPrice))}</td>
            </tr>`).join("");

  const addrHtml = (addr: typeof o.shippingAddress, label: string) => addr ? `
            <div style="margin-bottom: 16px;">
              <strong style="color: #4a5568; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">${label}</strong>
              <p style="margin: 4px 0; color: #2d3748;">${addr.fullName}<br>${addr.line1}${addr.line2 ? `<br>${addr.line2}` : ""}<br>${addr.city}, ${addr.state} ${addr.pincode}<br>${addr.country}<br>Phone: ${addr.phone}</p>
            </div>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice - ${o.orderNumber}</title>
  <style>
    @media print { @page { margin: 20mm; } body { -webkit-print-color-adjust: exact; } }
    body { font-family: 'Helvetica', 'Arial', sans-serif; margin: 0; padding: 0; color: #1a202c; background: #f7fafc; }
    .invoice { max-width: 800px; margin: 40px auto; background: white; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden; }
    .header { background: #1a202c; color: white; padding: 32px 40px; display: flex; justify-content: space-between; align-items: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .header .meta { text-align: right; font-size: 14px; color: #a0aec0; }
    .body { padding: 40px; }
    .section-title { font-size: 16px; font-weight: 600; color: #4a5568; text-transform: uppercase; letter-spacing: 0.05em; margin: 24px 0 12px; }
    .customer-info { display: flex; gap: 32px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th { background: #edf2f7; padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #4a5568; }
    th:last-child { text-align: right; }
    .totals { margin-top: 16px; text-align: right; }
    .totals p { margin: 4px 0; font-size: 14px; }
    .totals .grand-total { font-size: 20px; font-weight: 700; color: #2b6cb0; margin-top: 8px; padding-top: 8px; border-top: 2px solid #e2e8f0; }
    .footer { background: #f7fafc; padding: 24px 40px; text-align: center; font-size: 12px; color: #718096; border-top: 1px solid #e2e8f0; }
    .payment-info { margin-top: 16px; padding: 12px; background: #ebf8ff; border-radius: 8px; font-size: 13px; }
    .payment-info strong { color: #2b6cb0; }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div>
        <h1>নবME</h1>
        <div style="font-size: 13px; color: #a0aec0; margin-top: 4px;">Premium Fashion</div>
      </div>
      <div class="meta">
        <div><strong>INVOICE</strong></div>
        <div>${o.orderNumber}</div>
        <div>Date: ${date}</div>
      </div>
    </div>
    <div class="body">
      <div class="customer-info">
        <div style="flex: 1;">
          <div class="section-title">Customer</div>
          <p style="margin: 4px 0; color: #2d3748;">
            ${o.profile ? `${o.profile.firstName} ${o.profile.lastName ?? ""}`.trim() : "Guest"}<br>
            Email: ${o.email}<br>
            ${o.profile?.phone ? `Phone: ${o.profile.phone}` : ""}
          </p>
        </div>
        <div style="flex: 1;">
          <div class="section-title">Payment</div>
          <p style="margin: 4px 0; color: #2d3748;">
            Method: ${o.paymentMethod}<br>
            Status: ${o.paymentStatus}<br>
            Order Status: ${o.status}
          </p>
        </div>
      </div>

      <div style="display: flex; gap: 32px;">
        ${addrHtml(o.shippingAddress, "Shipping Address")}
        ${addrHtml(o.billingAddress, "Billing Address")}
      </div>

      <div class="section-title">Items</div>
      <table>
        <thead>
          <tr><th style="width: 50%;">Item</th><th style="width: 10%; text-align: center;">Qty</th><th style="width: 20%; text-align: right;">Unit Price</th><th style="width: 20%; text-align: right;">Total</th></tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <div class="totals">
        <p>Subtotal: ${fmt(Number(o.subtotal))}</p>
        <p>Shipping: ${fmt(Number(o.shippingCost))}</p>
        <p>Tax: ${fmt(Number(o.tax))}</p>
        ${Number(o.discount) > 0 ? `<p>Discount: -${fmt(Number(o.discount))}</p>` : ""}
        <p class="grand-total">Total: ${fmt(Number(o.total))}</p>
      </div>

      ${o.notes ? `<div style="margin-top: 16px; padding: 12px; background: #fffbeb; border-radius: 8px; font-size: 13px;"><strong>Notes:</strong> ${o.notes}</div>` : ""}
      ${o.giftMessage ? `<div style="margin-top: 8px; padding: 12px; background: #f0fff4; border-radius: 8px; font-size: 13px;"><strong>Gift Message:</strong> ${o.giftMessage}</div>` : ""}

      <div class="payment-info">
        <strong>Thank you for shopping with নবME!</strong><br>
        If you have any questions about this invoice, please contact our support team.
      </div>
    </div>
    <div class="footer">
      <p>নবME — Premium Fashion E-Commerce</p>
      <p>This is a computer-generated invoice and does not require a physical signature.</p>
    </div>
  </div>
</body>
</html>`;
}

export async function handleInvoiceRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action?: string
): Promise<Response> {
  switch (action) {
    case "getInvoice":
      return handleGetInvoice(ctx, params[0]);
    case "adminGetInvoice":
      return handleAdminGetInvoice(params[0]);
    case "adminGenerateInvoice":
      return handleAdminGenerateInvoice(params[0]);
    default:
      return notFound();
  }
}

async function handleGetInvoice(ctx: RequestContext, orderId: string): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        profileId: ctx.userId,
      },
      include: {
        items: true,
        shippingAddress: true,
        billingAddress: true,
        profile: { select: { firstName: true, lastName: true, email: true, phone: true } },
      },
    });

    if (!order) return notFound("Order not found");

    const html = generateInvoiceHTML(order as unknown as Record<string, unknown>);

    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleAdminGetInvoice(orderId: string): Promise<Response> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        shippingAddress: true,
        billingAddress: true,
        profile: { select: { firstName: true, lastName: true, email: true, phone: true } },
      },
    });

    if (!order) return notFound("Order not found");

    const html = generateInvoiceHTML(order as unknown as Record<string, unknown>);

    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleAdminGenerateInvoice(orderId: string): Promise<Response> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        shippingAddress: true,
        billingAddress: true,
        profile: { select: { firstName: true, lastName: true, email: true, phone: true } },
      },
    });

    if (!order) return notFound("Order not found");

    const html = generateInvoiceHTML(order as unknown as Record<string, unknown>);

    // In production, upload HTML to storage and store URL
    // For now, store a placeholder URL
    const invoiceUrl = `/invoices/${order.orderNumber}.html`;

    await prisma.order.update({
      where: { id: orderId },
      data: { invoiceUrl },
    });

    return success({
      invoiceUrl,
      message: "Invoice generated and saved",
    });
  } catch (err) {
    return serverError(err);
  }
}
