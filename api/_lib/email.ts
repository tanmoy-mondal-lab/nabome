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
  const maxRetries = 2;
  let lastError: string | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      const delay = Math.pow(2, attempt) * 200;
      await new Promise(r => setTimeout(r, delay));
    }

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

      if (res.ok) {
        const data = JSON.parse(body) as { id: string };
        return { success: true, messageId: data.id };
      }

      lastError = `Resend API error HTTP ${status}: ${body}`;

      if (status < 500 && status !== 429) {
        return { success: false, error: lastError };
      }
    } catch (err) {
      lastError = `Network error: ${(err as Error).message}`;
    }
  }

  return { success: false, error: lastError ?? "Email send failed after retries" };
}

/**
 * Send an email notification.
 *
 * Flow:
 *   1. Build HTML template from type
 *   2. Resolve recipients
 *   3. Enqueue job for async processing (non-blocking)
 *   4. Return immediately
 *
 * @param type - Email type (e.g. "email_verification", "order_confirmation")
 * @param data - Template data (must include `email` for customer emails)
 * @param env - Environment with RESEND_API_KEY, EMAIL_FROM, ADMIN_EMAILS
 * @param sync - If true, send synchronously (for critical emails like password reset)
 */
export async function sendEmailNotification(
  type: EmailType,
  data: Record<string, unknown>,
  env?: { RESEND_API_KEY?: string; EMAIL_FROM?: string; ADMIN_EMAILS?: string; SITE_URL?: string; VITE_SITE_URL?: string },
  sync: boolean = false
): Promise<{ success: boolean; error?: string }> {
  // ── 1. Validate env ──
  const resendApiKey = cleanSecret(env?.RESEND_API_KEY);
  if (!resendApiKey) {
    console.error(`[EMAIL] RESEND_API_KEY not configured for email type: ${type}`);
    return { success: false, error: "Email service not configured" };
  }

  // ── 2. Build template ──
  const templateData = {
    ...data,
    siteUrl: data.siteUrl ?? env?.SITE_URL ?? env?.VITE_SITE_URL,
  };
  const template = getEmailTemplate(type, templateData);
  if (!template) {
    console.error(`[EMAIL] No template found for email type: ${type}`);
    return { success: false, error: "Email template not found" };
  }

  // ── 3. Resolve recipients ──
  const from = cleanSecret(env?.EMAIL_FROM) || "noreply@nabome.online";
  const isAdminEmail = type.startsWith("admin_");
  let recipients: string[];

  if (isAdminEmail) {
    const raw = cleanSecret(env?.ADMIN_EMAILS);
    recipients = raw.split(",").map((e) => e.trim()).filter(Boolean);
    if (recipients.length === 0) {
      console.error(`[EMAIL] No admin emails configured for type: ${type}`);
      return { success: false, error: "No admin recipients configured" };
    }
  } else {
    const email = data.email as string | undefined;
    if (!email) {
      console.error(`[EMAIL] No email address provided for type: ${type}`);
      return { success: false, error: "No email address provided" };
    }
    recipients = [email];
  }

  // ── 4. Send emails (sync or async) ──
  if (sync) {
    // Critical emails: send synchronously
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

    const failed = results.filter((r) => !r.success);
    if (failed.length > 0) {
      console.error(`[EMAIL] Failed to send ${failed.length} email(s) for type: ${type}`, failed);
      return { success: false, error: `Failed to send ${failed.length} email(s)` };
    }

    // Send admin notifications for customer events
    const adminEmails = cleanSecret(env?.ADMIN_EMAILS);
    if (!isAdminEmail && template.adminNotification && adminEmails) {
      const adminType = template.adminNotification as EmailType;
      const adminTemplate = getEmailTemplate(adminType, { ...templateData, email: recipients[0] });
      if (adminTemplate) {
        const adminRecipients = adminEmails.split(",").map((e) => e.trim()).filter(Boolean);
        const adminResults = await Promise.all(adminRecipients.map((adminEmail) =>
          sendViaResend(resendApiKey, from, adminEmail, adminTemplate.subject, adminTemplate.html)
            .then((result) => ({ adminEmail, result }))
        ));
        for (const { adminEmail, result } of adminResults) {
          if (!result.success) {
            console.error(`[EMAIL] Failed to send admin notification to ${adminEmail}:`, result.error);
          }
        }
      }
    }

    return { success: true };
  } else {
    // Non-critical emails: enqueue for async processing
    try {
      const { enqueueJob } = await import("./job-queue");
      
      for (const to of recipients) {
        await enqueueJob("send_email", {
          type,
          data: { ...templateData, email: to, from, replyTo: data.replyTo },
        }, { priority: 5 }, env as any);
      }

      // Enqueue admin notifications if needed
      const adminEmails = cleanSecret(env?.ADMIN_EMAILS);
      if (!isAdminEmail && template.adminNotification && adminEmails) {
        const adminType = template.adminNotification as EmailType;
        const adminTemplate = getEmailTemplate(adminType, { ...templateData, email: recipients[0] });
        if (adminTemplate) {
          const adminRecipients = adminEmails.split(",").map((e) => e.trim()).filter(Boolean);
          for (const adminEmail of adminRecipients) {
            await enqueueJob("send_email", {
              type: adminType,
              data: { ...templateData, email: adminEmail, from },
            }, { priority: 3 }, env as any);
          }
        }
      }

      return { success: true };
    } catch (err) {
      console.error(`[EMAIL] Failed to enqueue email job:`, err);
      // Fallback to sync send if queue fails
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

      const failed = results.filter((r) => !r.success);
      return failed.length > 0 
        ? { success: false, error: `Failed to send ${failed.length} email(s)` }
        : { success: true };
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
