/*
  Warnings:

  - The `status` column on the `job_queue` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `created_at` on table `dead_letter_queue` required. This step will fail if there are existing NULL values in that column.
  - Made the column `priority` on table `job_queue` required. This step will fail if there are existing NULL values in that column.
  - Made the column `max_retries` on table `job_queue` required. This step will fail if there are existing NULL values in that column.
  - Made the column `retry_count` on table `job_queue` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `job_queue` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `job_queue` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('pending', 'processing', 'retrying', 'completed', 'failed');

-- AlterTable
ALTER TABLE "dead_letter_queue" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "created_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "job_queue" ALTER COLUMN "id" DROP DEFAULT,
DROP COLUMN "status",
ADD COLUMN     "status" "JobStatus" NOT NULL DEFAULT 'pending',
ALTER COLUMN "priority" SET NOT NULL,
ALTER COLUMN "max_retries" SET NOT NULL,
ALTER COLUMN "retry_count" SET NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "job_queue_status_priority_created_at_idx" ON "job_queue"("status", "priority", "created_at");

-- CreateIndex
CREATE INDEX "job_queue_status_retry_after_idx" ON "job_queue"("status", "retry_after");

-- RenameIndex
ALTER INDEX "dead_letter_queue_type_idx" RENAME TO "dead_letter_queue_job_type_created_at_idx";

-- RenameIndex
ALTER INDEX "job_queue_status_priority_idx" RENAME TO "job_queue_status_priority_created_at_idx";

-- RenameIndex
ALTER INDEX "job_queue_type_idx" RENAME TO "job_queue_job_type_idx";
