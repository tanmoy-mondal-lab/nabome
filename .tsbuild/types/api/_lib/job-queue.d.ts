import type { Prisma } from "@prisma/client";
import type { Env } from "./env";
export type JobType = "send_email" | "newsletter_subscribe" | "newsletter_unsubscribe" | "process_analytics" | "cleanup_media" | "generate_report";
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
export declare function enqueueJob(jobType: JobType, payload: JobPayload, options: {
    priority?: number;
    maxRetries?: number;
    delay?: number;
} | undefined, env: Env): Promise<JobResult>;
/**
 * Process a single job by ID
 */
export declare function processJob(jobId: string, env: Env): Promise<JobResult>;
/**
 * Get next pending jobs for processing
 */
export declare function getNextJobs(limit: number | undefined, env: Env): Promise<{
    status: import("@prisma/client").$Enums.JobStatus;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    payload: Prisma.JsonValue;
    errorMessage: string | null;
    retryCount: number;
    priority: number;
    jobType: string;
    maxRetries: number;
    retryAfter: Date | null;
    startedAt: Date | null;
    completedAt: Date | null;
}[]>;
/**
 * Process batch of jobs
 */
export declare function processJobBatch(limit: number | undefined, env: Env): Promise<{
    processed: number;
    succeeded: number;
    failed: number;
}>;
/**
 * Get job queue statistics
 */
export declare function getJobQueueStats(env: Env): Promise<{
    pending: number;
    processing: number;
    retrying: number;
    completed: number;
    failed: number;
    deadLetter: number;
}>;
