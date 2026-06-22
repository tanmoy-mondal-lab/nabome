-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "reset_password_token" VARCHAR(255),
ADD COLUMN     "reset_password_token_expires_at" TIMESTAMPTZ;
