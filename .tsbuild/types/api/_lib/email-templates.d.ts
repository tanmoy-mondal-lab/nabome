export type EmailType = "welcome" | "email_verification" | "email_change" | "order_confirmation" | "payment_success" | "payment_failure" | "shipping_update" | "delivery_confirmation" | "password_reset" | "admin_new_order" | "admin_refund_request" | "admin_contact_form" | "notification";
export interface EmailTemplate {
    subject: string;
    preview: string;
    html: string;
    notificationEvent: string;
    adminNotification?: EmailType;
}
export declare function getEmailTemplate(type: EmailType, data: Record<string, unknown>): EmailTemplate | null;
