import { getPrisma } from "./prisma";
import { getEmailTemplate } from "./email-templates";
import type { EmailType } from "./email-templates";
import type { NotificationEvent } from "@prisma/client";
import type { Env } from "./env";

const RESEND_API_URL = "https://api.resend.com/emails";

function getAdminEmails(env?: Env): string[] {
  const raw = env?.ADMIN_EMAILS || env?.ADMIN_EMAIL;
  if (!raw) return [];
  return raw.split(",").map((e) => e.trim()).filter(Boolean);
}

interface SendEmailResult {
  messageId: string | null;
  error: string | null;
}

async function sendViaResend(
  to: string,
  subject: string,
  html: string,
  replyTo: string | undefined,
  env?: Env
): Promise<{ messageId: string | null; error: string | null }> {
  const apiKey = env?.RESEND_API_KEY;
  if (!apiKey) {
    return { messageId: null, error: "RESEND_API_KEY not configured" };
  }

  const from = env?.EMAIL_FROM || "noreply@nabome.online";

  try {
    const res = await fetch("https://api.resend.com/emails", {
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

    if (!res.ok) {
      const errBody = await res.text();
      return { messageId: null, error: `Resend API error: ${errBody}` };
    }

    const data = (await res.json()) as { id: string };
    return { messageId: data.id, error: null };
  } catch (err) {
    return { messageId: null, error: (err as Error).message };
  }
}

export async function sendEmailNotification(
  type: EmailType,
  data: Record<string, unknown>,
  options?: { profileId?: string | null; orderId?: string | null },
  env?: Env
): Promise<void> {
  const template = getEmailTemplate(type, data);
  if (!template) return;

  const prisma = getPrisma(env);

  const isAdminEmail = type.startsWith("admin_");
  const recipients = isAdminEmail
    ? getAdminEmails(env)
    : data.email
      ? [data.email as string]
      : [];

  if (recipients.length === 0) return;

  // Create notification record
  const notification = await prisma.notification.create({
    data: {
      profileId: options?.profileId || null,
      orderId: options?.orderId || null,
      type: template.notificationEvent as NotificationEvent,
      channel: "email",
      title: template.subject,
      body: template.preview,
      data: { emailType: type, ...data },
      emailTo: recipients.join(", "),
    },
  });

  for (const to of recipients) {
    const { messageId, error } = await sendViaResend(
      to,
      template.subject,
      template.html,
      data.replyTo as string | undefined,
      env
    );

    if (messageId) {
      await prisma.notification.update({
        where: { id: notification.id },
        data: { sentAt: new Date() },
      });
    } else {
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          errorMessage: error,
          retryCount: { increment: 1 },
        },
      });
      console.error(`[EMAIL] Failed to send ${type} to ${to}: ${error}`);
    }
  }

  // Send admin notifications for customer events
  if (!isAdminEmail && template.adminNotification) {
    const adminType = template.adminNotification as EmailType;
    const adminTemplate = getEmailTemplate(adminType, {
      ...data,
      email: recipients[0],
    });
    if (adminTemplate) {
      for (const adminEmail of getAdminEmails(env)) {
        const { error } = await sendViaResend(
          adminEmail,
          adminTemplate.subject,
          adminTemplate.html,
          undefined,
          env
        );
        if (error) {
          console.error(`[EMAIL] Failed to send admin ${adminType} to ${adminEmail}: ${error}`);
        }
      }
    }
  }
}