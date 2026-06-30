export type EmailType =
  | "welcome"
  | "email_verification"
  | "email_change"
  | "order_confirmation"
  | "payment_success"
  | "payment_failure"
  | "shipping_update"
  | "delivery_confirmation"
  | "password_reset"
  | "admin_new_order"
  | "admin_refund_request"
  | "admin_contact_form";

export interface EmailTemplate {
  subject: string;
  preview: string;
  html: string;
  notificationEvent: string;
  adminNotification?: EmailType;
}

// ─── Brand Constants ───

const BRAND = {
  name: "নবME",
  tagline: "Redefining Fashion",
  primaryColor: "#B8860B",
  bgColor: "#f5f3ef",
  cardBg: "#ffffff",
  textDark: "#1a1a1a",
  textMuted: "#6b7280",
  borderColor: "#e5e2dc",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
};

const DEFAULT_SITE_URL = "https://www.nabome.online";

function siteUrl(data: Record<string, unknown>): string {
  return String(data.siteUrl || DEFAULT_SITE_URL).replace(/\/+$/, "");
}

function appUrl(data: Record<string, unknown>, path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl(data)}${cleanPath}`;
}

// ─── Base Layout ───

function baseLayout(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${BRAND.name}</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bgColor};font-family:${BRAND.fontFamily}">
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;margin:0 auto">
<tr><td style="padding:32px 24px 0;text-align:center">
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:${BRAND.cardBg};border-radius:8px;overflow:hidden">
<tr><td style="padding:32px 24px 24px;text-align:center;border-bottom:2px solid ${BRAND.primaryColor}">
<div style="font-size:24px;font-weight:700;color:${BRAND.textDark};letter-spacing:2px">${BRAND.name}</div>
<div style="font-size:11px;color:${BRAND.textMuted};letter-spacing:3px;text-transform:uppercase;margin-top:4px">${BRAND.tagline}</div>
</td></tr>
<tr><td style="padding:32px 24px;text-align:left;color:${BRAND.textDark};font-size:15px;line-height:1.6">
${body}
</td></tr>
<tr><td style="padding:24px;text-align:center;border-top:1px solid ${BRAND.borderColor};background:${BRAND.bgColor}">
<div style="font-size:12px;color:${BRAND.textMuted};line-height:1.5">
<p style="margin:0 0 4px">&copy; 2026 ${BRAND.name}. All rights reserved.</p>
<p style="margin:0">নবME — Premium Fashion</p>
</div>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function button(link: string, text: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto">
<tr><td style="background:${BRAND.primaryColor};border-radius:6px;padding:0">
<a href="${link}" target="_blank" style="display:inline-block;padding:13px 32px;font-size:13px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:1px;text-transform:uppercase">${text}</a>
</td></tr>
</table>`;
}

function orderItemRow(name: string, qty: number, price: string, image?: string): string {
  return `<tr>
${image ? `<td style="padding:8px 0;width:50px"><img src="${image}" alt="${name}" style="width:46px;height:60px;object-fit:cover;border-radius:4px" /></td>` : ""}
<td style="padding:8px 0;font-size:14px;color:${BRAND.textDark}">${name} <span style="color:${BRAND.textMuted};font-size:12px">×${qty}</span></td>
<td style="padding:8px 0;text-align:right;font-size:14px;color:${BRAND.textDark};white-space:nowrap">${price}</td>
</tr>`;
}

// ─── Template Builders ───

function orderConfirmation(data: Record<string, unknown>): EmailTemplate {
  const orderNumber = data.orderNumber as string;
  const customerName = data.customerName as string || "Valued Customer";
  const items = (data.items as Array<Record<string, unknown>>) || [];
  const total = data.total as string;
  const address = data.shippingAddress as string || "";
  const paymentMethod = data.paymentMethod as string || "";

  const itemsHtml = items.length
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%">
${items.map((i) => orderItemRow(i.name as string, i.quantity as number, i.price as string, i.image as string)).join("")}
</table>`
    : `<p style="color:${BRAND.textMuted};font-size:14px">Order items will appear here.</p>`;

  const body = `<h1 style="font-size:20px;font-weight:700;margin:0 0 4px">Thank You, ${customerName}!</h1>
<p style="color:${BRAND.textMuted};font-size:14px;margin:0 0 24px">Your order has been placed successfully.</p>

<div style="background:${BRAND.bgColor};border-radius:6px;padding:16px;margin-bottom:24px">
<p style="margin:0 0 4px;font-size:12px;color:${BRAND.textMuted};text-transform:uppercase;letter-spacing:1px">Order Number</p>
<p style="margin:0;font-size:18px;font-weight:700;color:${BRAND.primaryColor};letter-spacing:1px">${orderNumber}</p>
</div>

<h2 style="font-size:14px;font-weight:600;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;color:${BRAND.textDark}">Items Ordered</h2>
${itemsHtml}

<div style="border-top:1px solid ${BRAND.borderColor};margin-top:16px;padding-top:16px">
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px">
<tr><td style="padding:4px 0;color:${BRAND.textMuted}">Total</td><td style="padding:4px 0;text-align:right;font-weight:700;color:${BRAND.textDark}">${total}</td></tr>
${
  paymentMethod ? `<tr><td style="padding:4px 0;color:${BRAND.textMuted}">Payment</td><td style="padding:4px 0;text-align:right;color:${BRAND.textDark}">${paymentMethod}</td></tr>` : ""
}
</table>
</div>

${address ? `<h2 style="font-size:14px;font-weight:600;margin:16px 0 8px;text-transform:uppercase;letter-spacing:1px;color:${BRAND.textDark}">Shipping To</h2>
<p style="font-size:13px;color:${BRAND.textMuted};line-height:1.5;margin:0">${address.replace(/\n/g, "<br>")}</p>` : ""}

<p style="font-size:13px;color:${BRAND.textMuted};margin-top:24px">You will receive a shipping confirmation once your order is dispatched.</p>`;

  return {
    subject: `Order Confirmed — ${orderNumber}`,
    preview: `Your order ${orderNumber} has been placed successfully.`,
    html: baseLayout(body),
    notificationEvent: "order_placed",
    adminNotification: "admin_new_order",
  };
}

function paymentSuccess(data: Record<string, unknown>): EmailTemplate {
  const orderNumber = data.orderNumber as string;
  const amount = data.amount as string;
  const transactionId = data.transactionId as string || "";

  const body = `<h1 style="font-size:20px;font-weight:700;margin:0 0 4px">Payment Successful</h1>
<p style="color:${BRAND.textMuted};font-size:14px;margin:0 0 24px">Your payment has been received and verified.</p>

<div style="background:${BRAND.bgColor};border-radius:6px;padding:16px;margin-bottom:24px">
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px">
<tr><td style="padding:4px 0;color:${BRAND.textMuted}">Order</td><td style="padding:4px 0;text-align:right;color:${BRAND.textDark}">${orderNumber}</td></tr>
<tr><td style="padding:4px 0;color:${BRAND.textMuted}">Amount</td><td style="padding:4px 0;text-align:right;font-weight:700;color:${BRAND.primaryColor}">${amount}</td></tr>
${transactionId ? `<tr><td style="padding:4px 0;color:${BRAND.textMuted}">Transaction ID</td><td style="padding:4px 0;text-align:right;font-size:12px;color:${BRAND.textDark}">${transactionId}</td></tr>` : ""}
</table>
</div>

${button(appUrl(data, `/account/orders/${data.orderId || ""}`), "View Order")}

<p style="font-size:13px;color:${BRAND.textMuted};margin-top:24px">Your order is now being processed. We'll notify you when it ships.</p>`;

  return {
    subject: `Payment Received — ${orderNumber}`,
    preview: `Your payment of ${amount} for order ${orderNumber} was successful.`,
    html: baseLayout(body),
    notificationEvent: "payment_success",
  };
}

function paymentFailure(data: Record<string, unknown>): EmailTemplate {
  const orderNumber = data.orderNumber as string;
  const reason = data.reason as string || "Payment was declined by the bank or card issuer.";

  const body = `<h1 style="font-size:20px;font-weight:700;margin:0 0 4px">Payment Failed</h1>
<p style="color:${BRAND.textMuted};font-size:14px;margin:0 0 24px">We were unable to process your payment for order ${orderNumber}.</p>

<div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:6px;padding:16px;margin-bottom:24px">
<p style="margin:0 0 4px;font-size:12px;color:#dc2626;text-transform:uppercase;letter-spacing:1px">Reason</p>
<p style="margin:0;font-size:14px;color:${BRAND.textDark}">${reason}</p>
</div>

${button(appUrl(data, `/checkout?retry=${data.orderId || ""}`), "Retry Payment")}

<p style="font-size:13px;color:${BRAND.textMuted};margin-top:24px">If you need assistance, please contact our support team.</p>`;

  return {
    subject: `Payment Failed — ${orderNumber}`,
    preview: `Payment for order ${orderNumber} was not successful.`,
    html: baseLayout(body),
    notificationEvent: "payment_failed",
  };
}

function shippingUpdate(data: Record<string, unknown>): EmailTemplate {
  const orderNumber = data.orderNumber as string;
  const trackingNumber = data.trackingNumber as string || "";
  const carrier = data.carrier as string || "";
  const estimatedDelivery = data.estimatedDelivery as string || "";

  const trackingHtml = trackingNumber
    ? `<div style="background:${BRAND.bgColor};border-radius:6px;padding:16px;margin-bottom:24px">
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px">
${trackingNumber ? `<tr><td style="padding:4px 0;color:${BRAND.textMuted}">Tracking</td><td style="padding:4px 0;text-align:right;font-weight:600;color:${BRAND.textDark}">${trackingNumber}</td></tr>` : ""}
${carrier ? `<tr><td style="padding:4px 0;color:${BRAND.textMuted}">Carrier</td><td style="padding:4px 0;text-align:right;color:${BRAND.textDark}">${carrier}</td></tr>` : ""}
${estimatedDelivery ? `<tr><td style="padding:4px 0;color:${BRAND.textMuted}">Est. Delivery</td><td style="padding:4px 0;text-align:right;font-weight:600;color:${BRAND.primaryColor}">${estimatedDelivery}</td></tr>` : ""}
</table>
</div>`
    : "";

  const body = `<h1 style="font-size:20px;font-weight:700;margin:0 0 4px">Your Order Has Shipped!</h1>
<p style="color:${BRAND.textMuted};font-size:14px;margin:0 0 24px">Order ${orderNumber} is on its way.</p>

${trackingHtml}

${button(appUrl(data, `/account/orders/${data.orderId || ""}`), "Track Order")}

<p style="font-size:13px;color:${BRAND.textMuted};margin-top:24px">Thank you for shopping with নবME.</p>`;

  return {
    subject: `Shipped — ${orderNumber}`,
    preview: `Your order ${orderNumber} has been shipped.${trackingNumber ? ` Tracking: ${trackingNumber}` : ""}`,
    html: baseLayout(body),
    notificationEvent: "order_shipped",
  };
}

function deliveryConfirmation(data: Record<string, unknown>): EmailTemplate {
  const orderNumber = data.orderNumber as string;

  const body = `<h1 style="font-size:20px;font-weight:700;margin:0 0 4px">Delivered!</h1>
<p style="color:${BRAND.textMuted};font-size:14px;margin:0 0 24px">Your order ${orderNumber} has been delivered.</p>

<div style="text-align:center;margin:24px 0">
<div style="font-size:64px;line-height:1;margin-bottom:16px">📦</div>
</div>

<p style="font-size:14px;color:${BRAND.textDark};text-align:center">We hope you love your purchase. If you have any questions, our support team is here to help.</p>

${button(appUrl(data, `/account/orders/${data.orderId || ""}`), "Review Order")}

<p style="font-size:13px;color:${BRAND.textMuted};margin-top:24px">Love your new outfit? Share your style with us on social media and tag <strong>@nabme</strong></p>`;

  return {
    subject: `Delivered — ${orderNumber}`,
    preview: `Your order ${orderNumber} has been delivered.`,
    html: baseLayout(body),
    notificationEvent: "order_delivered",
  };
}

function passwordReset(data: Record<string, unknown>): EmailTemplate {
  const firstName = (data.firstName as string) || "there";
  const verificationCode = data.verificationCode as string;

  const body = `<h1 style="font-size:22px;font-weight:700;margin:0 0 8px">Reset Your Password, ${firstName}!</h1>
<p style="color:${BRAND.textMuted};font-size:14px;margin:0 0 24px">We received a request to reset the password for your নবME account.</p>

<div style="background:${BRAND.bgColor};border-radius:6px;padding:24px;margin-bottom:24px;text-align:center">
<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:${BRAND.textDark}">Use the verification code below to reset your password:</p>
<div style="background:#ffffff;border:2px dashed ${BRAND.primaryColor};border-radius:8px;padding:16px;margin:0 auto;display:inline-block;font-size:32px;font-weight:700;letter-spacing:8px;color:${BRAND.primaryColor};font-family:'Courier New',monospace">${verificationCode}</div>
</div>

<p style="font-size:13px;color:${BRAND.textMuted};line-height:1.5;margin:0 0 8px">This code will expire in 10 minutes.</p>
<p style="font-size:12px;color:${BRAND.textMuted};line-height:1.5;margin:0">If you did not request a password reset, you can safely ignore this email.</p>`;

  return {
    subject: "Reset Your নবME Password",
    preview: `${firstName}, your password reset code: ${verificationCode}`,
    html: baseLayout(body),
    notificationEvent: "password_reset",
  };
}

function adminNewOrder(data: Record<string, unknown>): EmailTemplate {
  const orderNumber = data.orderNumber as string;
  const customerName = data.customerName as string || "Guest";
  const customerEmail = data.email as string || "";
  const total = data.total as string;
  const paymentMethod = data.paymentMethod as string;
  const items = (data.items as Array<Record<string, unknown>>) || [];

  const itemsHtml = items.length
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:13px">
${items.map((i) => `<tr><td style="padding:6px 0;color:${BRAND.textDark}">${i.name as string} ×${i.quantity as number}</td><td style="padding:6px 0;text-align:right;color:${BRAND.textMuted}">${i.price as string}</td></tr>`).join("")}
</table>`
    : "";

  const body = `<div style="background:${BRAND.primaryColor};color:#ffffff;border-radius:6px;padding:12px 16px;margin-bottom:24px;text-align:center;font-size:11px;letter-spacing:2px;text-transform:uppercase">New Order Received</div>

<h1 style="font-size:20px;font-weight:700;margin:0 0 4px">${orderNumber}</h1>
<p style="color:${BRAND.textMuted};font-size:14px;margin:0 0 24px">${customerName} — ${customerEmail}</p>

<div style="background:${BRAND.bgColor};border-radius:6px;padding:16px;margin-bottom:24px">
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px">
<tr><td style="padding:4px 0;color:${BRAND.textMuted}">Total</td><td style="padding:4px 0;text-align:right;font-weight:700;color:${BRAND.textDark}">${total}</td></tr>
<tr><td style="padding:4px 0;color:${BRAND.textMuted}">Payment</td><td style="padding:4px 0;text-align:right;color:${BRAND.textDark}">${paymentMethod || "N/A"}</td></tr>
</table>
</div>

${itemsHtml}

${button(appUrl(data, `/admin/orders/${data.orderId || ""}`), "View in Admin")}`;

  return {
    subject: `[Admin] New Order — ${orderNumber}`,
    preview: `New order ${orderNumber} from ${customerName}. Total: ${total}`,
    html: baseLayout(body),
    notificationEvent: "order_placed",
  };
}

function adminRefundRequest(data: Record<string, unknown>): EmailTemplate {
  const orderNumber = data.orderNumber as string;
  const customerName = data.customerName as string || "Customer";
  const reason = data.reason as string || "Not specified";
  const amount = data.amount as string;

  const body = `<div style="background:#fef2f2;border-radius:6px;padding:12px 16px;margin-bottom:24px;text-align:center;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#dc2626;border:1px solid #fca5a5">Refund Request</div>

<h1 style="font-size:20px;font-weight:700;margin:0 0 4px">${customerName}</h1>
<p style="color:${BRAND.textMuted};font-size:14px;margin:0 0 24px">Order ${orderNumber}</p>

<div style="background:${BRAND.bgColor};border-radius:6px;padding:16px;margin-bottom:24px">
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px">
<tr><td style="padding:4px 0;color:${BRAND.textMuted}">Reason</td><td style="padding:4px 0;text-align:right;color:${BRAND.textDark}">${reason}</td></tr>
${amount ? `<tr><td style="padding:4px 0;color:${BRAND.textMuted}">Amount</td><td style="padding:4px 0;text-align:right;font-weight:700;color:${BRAND.textDark}">${amount}</td></tr>` : ""}
</table>
</div>

${button(appUrl(data, `/admin/returns/${data.returnId || ""}`), "View in Admin")}`;

  return {
    subject: `[Admin] Refund Request — Order ${orderNumber}`,
    preview: `${customerName} has requested a refund for order ${orderNumber}.`,
    html: baseLayout(body),
    notificationEvent: "return_requested",
  };
}

function adminContactForm(data: Record<string, unknown>): EmailTemplate {
  const name = data.name as string || "Anonymous";
  const email = data.email as string || "";
  const subject = data.subject as string || "No Subject";
  const message = data.message as string || "";

  const body = `<div style="background:${BRAND.primaryColor};color:#ffffff;border-radius:6px;padding:12px 16px;margin-bottom:24px;text-align:center;font-size:11px;letter-spacing:2px;text-transform:uppercase">New Contact Submission</div>

<h1 style="font-size:18px;font-weight:700;margin:0 0 4px">${subject}</h1>
<p style="color:${BRAND.textMuted};font-size:14px;margin:0 0 24px">From: ${name} — ${email}</p>

<div style="background:${BRAND.bgColor};border-radius:6px;padding:16px;margin-bottom:16px">
<p style="margin:0;font-size:14px;color:${BRAND.textDark};line-height:1.6">${message.replace(/\n/g, "<br>")}</p>
</div>

${button(appUrl(data, "/admin/contact"), "View in Admin")}`;

  return {
    subject: `[Admin] Contact Form — ${subject}`,
    preview: `New contact submission from ${name}: ${subject}`,
    html: baseLayout(body),
    notificationEvent: "contact_form",
  };
}

function welcomeEmail(data: Record<string, unknown>): EmailTemplate {
  const firstName = (data.firstName as string) || "there";

  const body = `<h1 style="font-size:22px;font-weight:700;margin:0 0 8px">Welcome to নবME, ${firstName}!</h1>
<p style="color:${BRAND.textMuted};font-size:14px;margin:0 0 24px">We're thrilled to have you join our community of fashion enthusiasts.</p>

<div style="background:${BRAND.bgColor};border-radius:6px;padding:24px;margin-bottom:24px">
<p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:${BRAND.textDark}">Your account has been created successfully. Here's what you can do now:</p>
<ul style="margin:0;padding:0 0 0 18px;font-size:14px;line-height:1.8;color:${BRAND.textDark}">
<li>Browse our latest collections</li>
<li>Save items to your wishlist</li>
<li>Track your orders in real-time</li>
<li>Enjoy exclusive member benefits</li>
</ul>
</div>

<p style="font-size:14px;color:${BRAND.textMuted};line-height:1.6;margin:0 0 24px">Start exploring — we're confident you'll find something you love.</p>

${button(appUrl(data, "/products"), "Shop Now")}

<p style="font-size:12px;color:${BRAND.textMuted};line-height:1.5;margin:0">If you didn't create this account, please ignore this email.</p>`;

  return {
    subject: "Welcome to নবME — Account Created Successfully",
    preview: `Welcome, ${firstName}! Your নবME account is ready.`,
    html: baseLayout(body),
    notificationEvent: "welcome",
  };
}

function emailChangeVerification(data: Record<string, unknown>): EmailTemplate {
  const firstName = (data.firstName as string) || "there";
  const verificationCode = data.verificationCode as string;

  const body = `<h1 style="font-size:22px;font-weight:700;margin:0 0 8px">Confirm Your New Email, ${firstName}!</h1>
<p style="color:${BRAND.textMuted};font-size:14px;margin:0 0 24px">You've requested to update the email address associated with your নবME account.</p>

<div style="background:${BRAND.bgColor};border-radius:6px;padding:24px;margin-bottom:24px;text-align:center">
<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:${BRAND.textDark}">Use the verification code below to confirm your new email:</p>
<div style="background:#ffffff;border:2px dashed ${BRAND.primaryColor};border-radius:8px;padding:16px;margin:0 auto;display:inline-block;font-size:32px;font-weight:700;letter-spacing:8px;color:${BRAND.primaryColor};font-family:'Courier New',monospace">${verificationCode}</div>
</div>

<p style="font-size:13px;color:${BRAND.textMuted};line-height:1.5;margin:0 0 8px">This code will expire in 10 minutes.</p>
<p style="font-size:12px;color:${BRAND.textMuted};line-height:1.5;margin:0">If you didn't request this change, please ignore this email or contact support.</p>`;

  return {
    subject: "Confirm Your New Email — নবME",
    preview: `${firstName}, your email change verification code: ${verificationCode}`,
    html: baseLayout(body),
    notificationEvent: "email_change",
  };
}

function emailVerification(data: Record<string, unknown>): EmailTemplate {
  const firstName = (data.firstName as string) || "there";
  const verificationCode = data.verificationCode as string;

  const body = `<h1 style="font-size:22px;font-weight:700;margin:0 0 8px">Verify Your Email, ${firstName}!</h1>
<p style="color:${BRAND.textMuted};font-size:14px;margin:0 0 24px">Thanks for joining নবME. Please verify your email address to get started.</p>

<div style="background:${BRAND.bgColor};border-radius:6px;padding:24px;margin-bottom:24px;text-align:center">
<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:${BRAND.textDark}">Use the verification code below to confirm your email address:</p>
<div style="background:#ffffff;border:2px dashed ${BRAND.primaryColor};border-radius:8px;padding:16px;margin:0 auto;display:inline-block;font-size:32px;font-weight:700;letter-spacing:8px;color:${BRAND.primaryColor};font-family:'Courier New',monospace">${verificationCode}</div>
</div>

<p style="font-size:13px;color:${BRAND.textMuted};line-height:1.5;margin:0 0 8px">This code will expire in 10 minutes.</p>
<p style="font-size:12px;color:${BRAND.textMuted};line-height:1.5;margin:0">If you didn't create this account, please ignore this email.</p>`;

  return {
    subject: "Verify Your নবME Email Address",
    preview: `Welcome, ${firstName}! Your verification code: ${verificationCode}`,
    html: baseLayout(body),
    notificationEvent: "email_verification",
  };
}

// ─── Registry ───

const TEMPLATES: Record<EmailType, (data: Record<string, unknown>) => EmailTemplate> = {
  welcome: welcomeEmail,
  email_verification: emailVerification,
  email_change: emailChangeVerification,
  order_confirmation: orderConfirmation,
  payment_success: paymentSuccess,
  payment_failure: paymentFailure,
  shipping_update: shippingUpdate,
  delivery_confirmation: deliveryConfirmation,
  password_reset: passwordReset,
  admin_new_order: adminNewOrder,
  admin_refund_request: adminRefundRequest,
  admin_contact_form: adminContactForm,
};

export function getEmailTemplate(type: EmailType, data: Record<string, unknown>): EmailTemplate | null {
  const builder = TEMPLATES[type];
  if (!builder) return null;
  return builder(data);
}
