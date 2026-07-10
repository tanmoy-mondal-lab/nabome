// ─────────────────────────────────────────────────────────────
// JOB QUEUE SERVICE — Background job processing with retry logic
// ─────────────────────────────────────────────────────────────
// Provides a database-backed job queue for async operations:
// - Email sending (non-blocking)
// - Newsletter subscriptions
// - Background data processing
// - Retry with exponential backoff
// - Dead-letter queue for failed jobs
// ─────────────────────────────────────────────────────────────

import { getPrisma } from "./prisma";
import type { Prisma } from "@prisma/client";
import type { Env } from "./env";

export type JobType = 
  | "send_email"
  | "newsletter_subscribe"
  | "newsletter_unsubscribe"
  | "process_analytics"
  | "cleanup_media"
  | "generate_report";

export interface JobPayload {
  [key: string]: unknown;
}

export interface JobResult {
  success: boolean;
  jobId?: string;
  error?: string;
}

/**
 * Enqueue a job for background processing
 */
export async function enqueueJob(
  jobType: JobType,
  payload: JobPayload,
  options: {
    priority?: number;
    maxRetries?: number;
    delay?: number; // seconds
  } = {},
  env: Env
): Promise<JobResult> {
  try {
    const prisma = getPrisma(env);
    
    const retryAfter = options.delay 
      ? new Date(Date.now() + options.delay * 1000)
      : undefined;

    const job = await prisma.job_queue.create({
      data: {
        jobType,
        payload: payload as Prisma.InputJsonValue,
        priority: options.priority ?? 0,
        maxRetries: options.maxRetries ?? 3,
        retryAfter,
      },
    });

    return { success: true, jobId: job.id };
  } catch (err) {
    return { 
      success: false, 
      error: (err as Error).message 
    };
  }
}

/**
 * Process a single job by ID
 */
export async function processJob(jobId: string, env: Env): Promise<JobResult> {
  const prisma = getPrisma(env);

  try {
    // Mark job as processing
    const job = await prisma.job_queue.update({
      where: { id: jobId },
      data: {
        status: "processing",
        startedAt: new Date(),
      },
    });

    // Execute job based on type
    const result = await executeJob(job.jobType as JobType, job.payload as JobPayload, env);

    if (result.success) {
      // Mark as completed
      await prisma.job_queue.update({
        where: { id: jobId },
        data: {
          status: "completed",
          completedAt: new Date(),
        },
      });
    } else {
      // Handle failure with retry logic
      await handleJobFailure(jobId, job, result.error ?? "Unknown error", env);
    }

    return result;
  } catch (err) {
    const error = (err as Error).message;
    const job = await prisma.job_queue.findUnique({ where: { id: jobId } });
    
    if (job) {
      await handleJobFailure(jobId, job, error, env);
    }

    return { success: false, error };
  }
}

/**
 * Execute job logic based on type
 */
async function executeJob(jobType: JobType, payload: JobPayload, env: Env): Promise<JobResult> {
  switch (jobType) {
    case "send_email":
      return await executeEmailJob(payload, env);
    
    case "newsletter_subscribe":
      return await executeNewsletterSubscribe(payload, env);
    
    case "newsletter_unsubscribe":
      return await executeNewsletterUnsubscribe(payload, env);
    
    default:
      return { success: false, error: `Unknown job type: ${jobType}` };
  }
}

/**
 * Execute email job
 */
async function executeEmailJob(payload: JobPayload, env: Env): Promise<JobResult> {
  const { sendEmailNotification } = await import("./email");
  const { type, data } = payload as { type: string; data: Record<string, unknown> };

  const result = await sendEmailNotification(type as any, data, env);
  return result;
}

/**
 * Execute newsletter subscribe job
 */
async function executeNewsletterSubscribe(payload: JobPayload, env: Env): Promise<JobResult> {
  const prisma = getPrisma(env);
  const { email } = payload as { email: string };

  try {
    await prisma.newsletter_subscribers.upsert({
      where: { email },
      create: { email },
      update: {},
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Execute newsletter unsubscribe job
 */
async function executeNewsletterUnsubscribe(payload: JobPayload, env: Env): Promise<JobResult> {
  const prisma = getPrisma(env);
  const { email } = payload as { email: string };

  try {
    const subscriber = await prisma.newsletter_subscribers.findUnique({ where: { email } });
    if (subscriber) {
      await prisma.newsletter_subscribers.delete({ where: { email } });
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Handle job failure with retry logic
 */
async function handleJobFailure(
  jobId: string,
  job: { jobType: string; retryCount: number; maxRetries: number; payload: Prisma.JsonValue },
  error: string,
  env: Env
): Promise<void> {
  const prisma = getPrisma(env);
  const newRetryCount = job.retryCount + 1;

  if (newRetryCount >= job.maxRetries) {
    // Move to dead-letter queue
    await prisma.$transaction([
      prisma.job_queue.update({
        where: { id: jobId },
        data: {
          status: "failed",
          errorMessage: error,
          completedAt: new Date(),
        },
      }),
      prisma.dead_letter_queue.create({
        data: {
          jobType: job.jobType,
          payload: job.payload as Prisma.InputJsonValue,
          errorMessage: error,
          retryCount: newRetryCount,
          originalJobId: jobId,
        },
      }),
    ]);
  } else {
    // Schedule retry with exponential backoff
    const retryDelay = Math.pow(2, newRetryCount) * 60; // 2^n minutes
    const retryAfter = new Date(Date.now() + retryDelay * 1000);

    await prisma.job_queue.update({
      where: { id: jobId },
      data: {
        status: "retrying",
        retryCount: newRetryCount,
        retryAfter,
        errorMessage: error,
      },
    });
  }
}

/**
 * Get next pending jobs for processing
 */
export async function getNextJobs(limit: number = 10, env: Env) {
  const prisma = getPrisma(env);

  return prisma.job_queue.findMany({
    where: {
      OR: [
        { status: "pending" },
        { 
          status: "retrying",
          retryAfter: { lte: new Date() }
        },
      ],
    },
    orderBy: [
      { priority: "desc" },
      { createdAt: "asc" },
    ],
    take: limit,
  });
}

/**
 * Process batch of jobs
 */
export async function processJobBatch(limit: number = 10, env: Env): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
}> {
  const jobs = await getNextJobs(limit, env);
  
  let succeeded = 0;
  let failed = 0;

  for (const job of jobs) {
    const result = await processJob(job.id, env);
    if (result.success) {
      succeeded++;
    } else {
      failed++;
    }
  }

  return {
    processed: jobs.length,
    succeeded,
    failed,
  };
}

/**
 * Get job queue statistics
 */
export async function getJobQueueStats(env: Env) {
  const prisma = getPrisma(env);

  const [pending, processing, retrying, completed, failed, deadLetter] = await Promise.all([
    prisma.job_queue.count({ where: { status: "pending" } }),
    prisma.job_queue.count({ where: { status: "processing" } }),
    prisma.job_queue.count({ where: { status: "retrying" } }),
    prisma.job_queue.count({ where: { status: "completed" } }),
    prisma.job_queue.count({ where: { status: "failed" } }),
    prisma.dead_letter_queue.count(),
  ]);

  return {
    pending,
    processing,
    retrying,
    completed,
    failed,
    deadLetter,
  };
}
