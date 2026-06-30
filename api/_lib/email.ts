// ─────────────────────────────────────────────────────────────
// EMAIL MODULE — Send transactional emails via Resend
// ─────────────────────────────────────────────────────────────
// This module is SELF-CONTAINED. It does NOT import Prisma.
// Email sending is a standalone operation that cannot fail
// due to database issues, enum mismatches, or Prisma errors.
// ─────────────────────────────────────────────────────────────

import { getEmailTemplate } from "./email-templates";
import type { EmailType } from "./email-templates";
import { cleanSecret } from "./secrets";

const RESEND_API_URL = "https://api.resend.com/emails";

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send a single email via Resend API.
 * This is the ONLY function that touches the network.
 * No DB, no Prisma, no side effects.
 */
async function sendViaResend(
  apiKey: string,
  from: string,
  to: string,
  subject: string,
  html: string,
  replyTo?: string
): Promise<EmailSendResult> {
  console.log(`[EMAIL] → Sending "${subject}" to ${to} from ${from}`);

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `NabME <${from}>`,
        to: [to],
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    const status = res.status;
    const body = await res.text();

    if (!res.ok) {
      const msg = `Resend API error HTTP ${status}: ${body}`;
      console.error(`[EMAIL] ✗ ${msg}`);
      return { success: false, error: msg };
    }

    const data = JSON.parse(body) as { id: string };
    console.log(`[EMAIL] ✓ Resend accepted — id=${data.id}`);
    return { success: true, messageId: data.id };
  } catch (err) {
    const msg = `Network error: ${(err as Error).message}`;
    console.error(`[EMAIL] ✗ ${msg}`);
    return { success: false, error: msg };
  }
}

/**
 * Send an email notification.
 *
 * Flow:
 *   1. Build HTML template from type
 *   2. Resolve recipients
 *   3. Send email(s) via Resend — THIS IS THE CRITICAL PATH
 *   4. Record in DB (fire-and-forget, non-blocking)
 *
 * @param type - Email type (e.g. "email_verification", "order_confirmation")
 * @param data - Template data (must include `email` for customer emails)
 * @param env - Environment with RESEND_API_KEY, EMAIL_FROM, ADMIN_EMAILS
 */
export async function sendEmailNotification(
  type: EmailType,
  data: Record<string, unknown>,
  env?: { RESEND_API_KEY?: string; EMAIL_FROM?: string; ADMIN_EMAILS?: string; SITE_URL?: string; VITE_SITE_URL?: string }
): Promise<void> {
  console.log(`[EMAIL] sendEmailNotification(type=${type})`);

  // ── 1. Validate env ──
  const resendApiKey = cleanSecret(env?.RESEND_API_KEY);
  if (!resendApiKey) {
    console.error("[EMAIL] ✗ RESEND_API_KEY is not set. Emails will NOT be sent.");
    console.error("[EMAIL] Check: wrangler pages secret put RESEND_API_KEY --project-name=nabome --env production");
    return;
  }

  // ── 2. Build template ──
  const templateData = {
    ...data,
    siteUrl: data.siteUrl ?? env?.SITE_URL ?? env?.VITE_SITE_URL,
  };
  const template = getEmailTemplate(type, templateData);
  if (!template) {
    console.error(`[EMAIL] ✗ No template for type="${type}". Check email-templates.ts TEMPLATES registry.`);
    return;
  }

  // ── 3. Resolve recipients ──
  const from = cleanSecret(env?.EMAIL_FROM) || "noreply@nabome.online";
  const isAdminEmail = type.startsWith("admin_");
  let recipients: string[];

  if (isAdminEmail) {
    const raw = cleanSecret(env?.ADMIN_EMAILS);
    recipients = raw.split(",").map((e) => e.trim()).filter(Boolean);
    if (recipients.length === 0) {
      console.error("[EMAIL] ✗ No admin recipients. Set ADMIN_EMAILS env var.");
      return;
    }
  } else {
    const email = data.email as string | undefined;
    if (!email) {
      console.error(`[EMAIL] ✗ No recipient email in data.email for type="${type}".`);
      return;
    }
    recipients = [email];
  }

  console.log(`[EMAIL] Recipients: ${recipients.join(", ")}`);

  // ── 4. Send emails (CRITICAL PATH — must succeed) ──
  const results: EmailSendResult[] = [];
  for (const to of recipients) {
    const result = await sendViaResend(
      resendApiKey,
      from,
      to,
      template.subject,
      template.html,
      data.replyTo as string | undefined
    );
    results.push(result);
  }

  // ── 5. Log results ──
  const succeeded = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  if (failed.length > 0) {
    console.error(`[EMAIL] ✗ ${type}: ${failed.length}/${results.length} emails FAILED`);
    for (const f of failed) {
      console.error(`[EMAIL]   Error: ${f.error}`);
    }
  } else {
    console.log(`[EMAIL] ✓ ${type}: All ${results.length} emails sent successfully`);
  }

  // ── 6. Send admin notifications for customer events (fire-and-forget) ──
  const adminEmails = cleanSecret(env?.ADMIN_EMAILS);
  if (!isAdminEmail && template.adminNotification && adminEmails) {
    const adminType = template.adminNotification as EmailType;
    const adminTemplate = getEmailTemplate(adminType, { ...templateData, email: recipients[0] });
    if (adminTemplate) {
      const adminRecipients = adminEmails.split(",").map((e) => e.trim()).filter(Boolean);
      for (const adminEmail of adminRecipients) {
        // Fire-and-forget — don't await, don't block
        sendViaResend(resendApiKey, from, adminEmail, adminTemplate.subject, adminTemplate.html)
          .then((r) => {
            if (!r.success) console.error(`[EMAIL] ✗ Admin ${adminType} to ${adminEmail}: ${r.error}`);
            else console.log(`[EMAIL] ✓ Admin ${adminType} sent to ${adminEmail}`);
          })
          .catch(() => {});
      }
    }
  }
}

/**
 * Test email sending — call this to verify email config works.
 * Returns the raw result for debugging.
 */
export async function testEmail(
  env: { RESEND_API_KEY?: string; EMAIL_FROM?: string },
  to: string
): Promise<EmailSendResult> {
  const resendApiKey = cleanSecret(env.RESEND_API_KEY);
  if (!resendApiKey) {
    return { success: false, error: "RESEND_API_KEY not set" };
  }
  const from = cleanSecret(env.EMAIL_FROM) || "noreply@nabome.online";
  return sendViaResend(
    resendApiKey,
    from,
    to,
    "নবME — Test Email",
    "<h1>Email is working!</h1><p>If you received this, the Resend integration is configured correctly.</p>"
  );
}
