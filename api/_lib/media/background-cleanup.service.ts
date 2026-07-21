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

class BackgroundCleanupQueue {
  private queue: CleanupTask[] = [];
  private processing = false;
  private maxConcurrent = 3;
  private currentConcurrent = 0;

  /**
   * Adds a cleanup task to the queue
   */
  enqueue(task: CleanupTask): void {
    this.queue.push(task);
    this.queue.sort((a, b) => {
      // High priority first
      if (a.priority === 'high' && b.priority === 'low') return -1;
      if (a.priority === 'low' && b.priority === 'high') return 1;
      // Then by creation time (oldest first)
      return a.createdAt - b.createdAt;
    });
    void this.process();
  }

  /**
   * Processes the queue
   */
  private async process(): Promise<void> {
    if (this.processing || this.currentConcurrent >= this.maxConcurrent) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 && this.currentConcurrent < this.maxConcurrent) {
      const task = this.queue.shift();
      if (!task) break;

      this.currentConcurrent++;
      
      // Process task in background
      void this.processTask(task).finally(() => {
        this.currentConcurrent--;
      });
    }

    this.processing = false;
  }

  /**
   * Processes a single cleanup task
   */
  private async processTask(task: CleanupTask): Promise<void> {
    try {
      await this.deleteDerivedAssets(task.publicId, task.resourceType);
    } catch (error) {
      console.error('[BackgroundCleanup] Task failed:', task, error);
    }
  }

  /**
   * Deletes derived assets (transformations, cached versions)
   */
  private async deleteDerivedAssets(
    publicId: string,
    _resourceType: string
  ): Promise<void> {
    // In a real implementation, this would:
    // 1. List all derived assets for the public ID
    // 2. Delete them asynchronously
    // 3. Handle rate limiting
    
    // For now, this is a placeholder
    // Cloudinary API doesn't provide a direct way to delete derived assets
    // They are automatically cleaned up after a period of inactivity
    console.log('[BackgroundCleanup] Cleaning up derived assets for:', publicId);
  }

  /**
   * Gets queue statistics
   */
  getStats(): { queueLength: number; processing: boolean; currentConcurrent: number } {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      currentConcurrent: this.currentConcurrent,
    };
  }
}

// Global queue instance
const cleanupQueue = new BackgroundCleanupQueue();

/**
 * Enqueues a cleanup task for background processing
 */
export function enqueueCleanup(
  publicId: string,
  resourceType: string,
  priority: 'high' | 'low' = 'low'
): void {
  cleanupQueue.enqueue({
    publicId,
    resourceType,
    priority,
    createdAt: Date.now(),
  });
}

/**
 * Gets cleanup queue statistics
 */
export function getCleanupStats(): {
  queueLength: number;
  processing: boolean;
  currentConcurrent: number;
} {
  return cleanupQueue.getStats();
}

/**
 * Performs immediate cleanup (synchronous, for critical operations)
 */
export async function immediateCleanup(
  publicId: string,
  resourceType: string,
  config: CloudinaryConfig
): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete the original asset synchronously
    const { deleteAsset } = await import('./cloudinary');
    const success = await deleteAsset(publicId, resourceType as any, config);

    if (!success) {
      return { success: false, error: 'Cloudinary deletion failed' };
    }

    // Enqueue derived asset cleanup for background processing
    enqueueCleanup(publicId, resourceType, 'high');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Performs bulk cleanup with rate limiting
 */
export async function bulkCleanup(
  publicIds: string[],
  resourceType: string,
  config: CloudinaryConfig,
  options: {
    batchSize?: number;
    delayBetweenBatches?: number;
  } = {}
): Promise<{
  success: boolean;
  deleted: string[];
  failed: Array<{ id: string; error: string }>;
}> {
  const { batchSize = 10, delayBetweenBatches = 1000 } = options;
  const deleted: string[] = [];
  const failed: Array<{ id: string; error: string }> = [];

  const { deleteAsset } = await import('./cloudinary');

  for (let i = 0; i < publicIds.length; i += batchSize) {
    const batch = publicIds.slice(i, i + batchSize);

    await Promise.allSettled(
      batch.map(async (publicId) => {
        try {
          const success = await deleteAsset(publicId, resourceType as any, config);
          if (success) {
            deleted.push(publicId);
            // Enqueue derived cleanup
            enqueueCleanup(publicId, resourceType, 'low');
          } else {
            failed.push({ id: publicId, error: 'Deletion failed' });
          }
        } catch (error) {
          failed.push({
            id: publicId,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      })
    );

    // Delay between batches to respect rate limits
    if (i + batchSize < publicIds.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }

  return {
    success: failed.length === 0,
    deleted,
    failed,
  };
}
