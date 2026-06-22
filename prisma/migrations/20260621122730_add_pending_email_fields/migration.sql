-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "pending_email" VARCHAR(255),
ADD COLUMN     "pending_email_token" VARCHAR(255),
ADD COLUMN     "pending_email_token_expires_at" TIMESTAMPTZ;
