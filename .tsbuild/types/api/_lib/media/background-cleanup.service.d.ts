/**
 * Media Background Cleanup Service
 *
 * Provides background cleanup for Cloudinary operations to keep APIs responsive.
 * Instead of deleting derived assets synchronously, enqueues cleanup tasks.
 */
import type { CloudinaryConfig } from './types';
export interface CleanupTask {
    publicId: string;
    resourceType: string;
    priority: 'high' | 'low';
    createdAt: number;
}
/**
 * Enqueues a cleanup task for background processing
 */
export declare function enqueueCleanup(publicId: string, resourceType: string, priority?: 'high' | 'low'): void;
/**
 * Gets cleanup queue statistics
 */
export declare function getCleanupStats(): {
    queueLength: number;
    processing: boolean;
    currentConcurrent: number;
};
/**
 * Performs immediate cleanup (synchronous, for critical operations)
 */
export declare function immediateCleanup(publicId: string, resourceType: string, config: CloudinaryConfig): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Performs bulk cleanup with rate limiting
 */
export declare function bulkCleanup(publicIds: string[], resourceType: string, config: CloudinaryConfig, options?: {
    batchSize?: number;
    delayBetweenBatches?: number;
}): Promise<{
    success: boolean;
    deleted: string[];
    failed: Array<{
        id: string;
        error: string;
    }>;
}>;
