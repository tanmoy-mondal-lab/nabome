import type { CartItem } from "../context/CartContext";
import type { CustomerData } from "./db";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const SENDER_NAME = "নবME";
const SENDER_EMAIL =
  import.meta.env.VITE_BREVO_SENDER_EMAIL || "nabome.official@gmail.com";
const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY as string | undefined;

export type BillData = {
  billNo: string;
  date: string;
  customer: CustomerData;
  items: CartItem[];
  shipping: number;
  taxLabel: string;
  total: number;
  paymentMethod: string;
};

const fmtINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function escapeHtml(input: string | undefined | null): string {
  if (!input) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function itemsHtml(items: CartItem[]): string {
  return items
    .map((item) => {
      const variant = [item.selectedSize, item.selectedColor]
        .filter(Boolean)
        .join(" · ");
      return `
        <tr>
          <td style="padding:14px 12px;border-bottom:1px solid #2a2a2a;color:#e8e8e8;font-size:14px;">
            <div style="font-weight:600;margin-bottom:4px;">${escapeHtml(item.name)}</div>
            ${variant ? `<div style="color:#888;font-size:12px;">${escapeHtml(variant)}</div>` : ""}
          </td>
          <td align="center" style="padding:14px 12px;border-bottom:1px solid #2a2a2a;color:#e8e8e8;font-size:14px;">${item.quantity}</td>
          <td align="right" style="padding:14px 12px;border-bottom:1px solid #2a2a2a;color:#e8e8e8;font-size:14px;">${fmtINR(item.price * item.quantity)}</td>
        </tr>`;
    })
    .join("");
}

function buildOrderConfirmationHtml(bill: BillData): string {
  const customer = bill.customer;
  const c = escapeHtml;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e8e8e8;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#121212;border:1px solid #2a2a2a;">

          <!-- HEADER -->
          <tr>
            <td style="background:#050505;padding:36px 40px;text-align:center;border-bottom:1px solid #d4af37;">
              <div style="font-family:'Georgia',serif;font-size:36px;font-weight:700;letter-spacing:6px;color:#d4af37;margin-bottom:6px;">নবME</div>
              <div style="color:#888;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Premium Bengali Streetwear</div>
            </td>
          </tr>

          <!-- HERO -->
          <tr>
            <td style="padding:40px 40px 20px;text-align:center;">
              <div style="display:inline-block;padding:6px 14px;background:#d4af37;color:#050505;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">Order Confirmed</div>
              <h1 style="margin:0 0 12px;color:#fff;font-size:28px;font-weight:300;letter-spacing:-0.5px;">Thank you, ${c(customer.name)}!</h1>
              <p style="margin:0;color:#888;font-size:14px;line-height:1.6;">Your order has been received and is being prepared. We'll notify you when it ships.</p>
            </td>
          </tr>

          <!-- BILL INFO -->
          <tr>
            <td style="padding:0 40px 30px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border:1px solid #2a2a2a;">
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid #2a2a2a;">
                    <div style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;">Order Number</div>
                    <div style="color:#d4af37;font-size:16px;font-weight:600;font-family:'Courier New',monospace;">${c(bill.billNo)}</div>
                  </td>
                  <td style="padding:16px 20px;border-bottom:1px solid #2a2a2a;">
                    <div style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;">Date</div>
                    <div style="color:#e8e8e8;font-size:14px;">${c(bill.date)}</div>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:16px 20px;">
                    <div style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;">Payment Method</div>
                    <div style="color:#e8e8e8;font-size:14px;">${c(bill.paymentMethod)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ITEMS -->
          <tr>
            <td style="padding:0 40px;">
              <h2 style="margin:0 0 12px;color:#fff;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:2px;">Order Items</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border:1px solid #2a2a2a;border-bottom:none;">
                <thead>
                  <tr style="background:#0f0f0f;">
                    <th align="left" style="padding:12px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;">Item</th>
                    <th align="center" style="padding:12px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;">Qty</th>
                    <th align="right" style="padding:12px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;">Total</th>
                  </tr>
                </thead>
                <tbody>${itemsHtml(bill.items)}</tbody>
              </table>
            </td>
          </tr>

          <!-- TOTALS -->
          <tr>
            <td style="padding:0 40px 30px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border:1px solid #2a2a2a;">
                <tr>
                  <td style="padding:12px 20px;color:#888;font-size:13px;">Shipping</td>
                  <td align="right" style="padding:12px 20px;color:#e8e8e8;font-size:13px;">${bill.shipping === 0 ? "Free" : fmtINR(bill.shipping)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 20px;color:#888;font-size:13px;">Tax (${c(bill.taxLabel)})</td>
                  <td align="right" style="padding:12px 20px;color:#e8e8e8;font-size:13px;">—</td>
                </tr>
                <tr style="border-top:1px solid #2a2a2a;">
                  <td style="padding:16px 20px;color:#fff;font-size:14px;font-weight:600;">Total</td>
                  <td align="right" style="padding:16px 20px;color:#d4af37;font-size:20px;font-weight:700;">${fmtINR(bill.total)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CUSTOMER DETAILS -->
          <tr>
            <td style="padding:0 40px 30px;">
              <h2 style="margin:0 0 12px;color:#fff;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:2px;">Shipping To</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border:1px solid #2a2a2a;">
                <tr>
                  <td style="padding:18px 20px;color:#e8e8e8;font-size:13px;line-height:1.7;">
                    <div style="font-weight:600;color:#fff;margin-bottom:6px;">${c(customer.name)}</div>
                    <div>${c(customer.address)}</div>
                    <div>${c(customer.city)}${customer.state ? `, ${c(customer.state)}` : ""} ${c(customer.pincode)}</div>
                    <div style="margin-top:8px;color:#888;">${c(customer.phone)} · ${c(customer.email)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 40px;text-align:center;">
              <a href="https://www.nabome.online/order-tracking" style="display:inline-block;padding:14px 36px;background:#d4af37;color:#050505;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Track Your Order</a>
              <p style="margin:16px 0 0;color:#666;font-size:12px;">Use your order number to check status anytime</p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#050505;padding:30px 40px;text-align:center;border-top:1px solid #2a2a2a;">
              <p style="margin:0 0 8px;color:#d4af37;font-size:13px;font-weight:600;">নবME — Designed in Bengal, Built for Everywhere</p>
              <p style="margin:0 0 4px;color:#666;font-size:12px;">Questions? WhatsApp us at <a href="https://wa.me/919163854706" style="color:#d4af37;text-decoration:none;">+91 9163854706</a></p>
              <p style="margin:12px 0 0;color:#444;font-size:11px;">© 2026 নবME. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildOrderConfirmationText(bill: BillData): string {
  const lines: string[] = [
    `নবME — Order Confirmed`,
    ``,
    `Hi ${bill.customer.name},`,
    ``,
    `Thank you for your order! Here are the details:`,
    ``,
    `Order Number: ${bill.billNo}`,
    `Date: ${bill.date}`,
    `Payment: ${bill.paymentMethod}`,
    ``,
    `ITEMS:`,
    ...bill.items.map((i) => {
      const variant = [i.selectedSize, i.selectedColor].filter(Boolean).join(" / ");
      return `  - ${i.name}${variant ? ` (${variant})` : ""} × ${i.quantity} = ${fmtINR(i.price * i.quantity)}`;
    }),
    ``,
    `Shipping: ${bill.shipping === 0 ? "Free" : fmtINR(bill.shipping)}`,
    `Tax: ${bill.taxLabel}`,
    `TOTAL: ${fmtINR(bill.total)}`,
    ``,
    `SHIPPING TO:`,
    `  ${bill.customer.name}`,
    `  ${bill.customer.address}`,
    `  ${bill.customer.city}${bill.customer.state ? `, ${bill.customer.state}` : ""} ${bill.customer.pincode}`,
    `  ${bill.customer.phone} · ${bill.customer.email}`,
    ``,
    `Track your order: https://www.nabome.online/order-tracking`,
    ``,
    `Questions? WhatsApp: +91 9163854706`,
    ``,
    `© 2026 নবME. All rights reserved.`,
  ];
  return lines.join("\n");
}

export type SendEmailResult = { ok: true } | { ok: false; error: string; skipped?: boolean };

export async function sendOrderConfirmation(bill: BillData): Promise<SendEmailResult> {
  if (!BREVO_API_KEY) {
    console.warn("[email] VITE_BREVO_API_KEY not set — skipping email send");
    return { ok: false, error: "Email service not configured", skipped: true };
  }

  if (!bill.customer.email) {
    return { ok: false, error: "No customer email" };
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: bill.customer.email, name: bill.customer.name }],
        subject: `Order Confirmed — ${bill.billNo} | নবME`,
        htmlContent: buildOrderConfirmationHtml(bill),
        textContent: buildOrderConfirmationText(bill),
        tags: ["order-confirmation"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[email] Brevo API error:", response.status, errorText);
      return { ok: false, error: `Brevo API ${response.status}: ${errorText}` };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[email] Failed to send order confirmation:", message);
    return { ok: false, error: message };
  }
}

export async function sendAdminOrderNotification(
  bill: BillData,
  adminEmail: string
): Promise<SendEmailResult> {
  if (!BREVO_API_KEY) {
    return { ok: false, error: "Email service not configured", skipped: true };
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: adminEmail, name: "Admin" }],
        subject: `🔔 New Order — ${bill.billNo} · ${fmtINR(bill.total)}`,
        htmlContent: `<p>New order from <strong>${escapeHtml(bill.customer.name)}</strong> (${escapeHtml(bill.customer.phone)}) for <strong style="color:#d4af37;">${fmtINR(bill.total)}</strong> via ${escapeHtml(bill.paymentMethod)}.</p><p>View in admin: <a href="https://www.nabome.online/admin">nabome.online/admin</a></p>`,
        tags: ["admin-notification"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { ok: false, error: `Brevo API ${response.status}: ${errorText}` };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: message };
  }
}
