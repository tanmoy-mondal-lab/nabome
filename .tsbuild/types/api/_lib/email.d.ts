import type { EmailType } from "./email-templates";
export interface EmailSendResult {
    success: boolean;
    messageId?: string;
    error?: string;
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
export declare function sendEmailNotification(type: EmailType, data: Record<string, unknown>, env?: {
    RESEND_API_KEY?: string;
    EMAIL_FROM?: string;
    ADMIN_EMAILS?: string;
    SITE_URL?: string;
    VITE_SITE_URL?: string;
}, sync?: boolean): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Test email sending — call this to verify email config works.
 * Returns the raw result for debugging.
 */
export declare function testEmail(env: {
    RESEND_API_KEY?: string;
    EMAIL_FROM?: string;
}, to: string): Promise<EmailSendResult>;
