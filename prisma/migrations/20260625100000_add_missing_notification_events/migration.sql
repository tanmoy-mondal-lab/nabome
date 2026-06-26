-- Add missing NotificationEvent enum values
-- These values exist in schema.prisma but were never migrated to the database.
-- Without them, prisma.notification.create() throws for email_verification, 
-- email_change, and contact_form types — blocking email sending.

ALTER TYPE "NotificationEvent" ADD VALUE IF NOT EXISTS 'email_change';
ALTER TYPE "NotificationEvent" ADD VALUE IF NOT EXISTS 'email_verification';
ALTER TYPE "NotificationEvent" ADD VALUE IF NOT EXISTS 'contact_form';
