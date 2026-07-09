/**
 * Batching utilities for bulk operations
 */

/**
 * Split an array into batches
 * @param array - The array to split
 * @param batchSize - Size of each batch
 * @returns Array of batches
 */
export function batch<T>(array: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }
  return batches;
}

/**
 * Process items in batches with async operations
 * @param items - Items to process
 * @param batchSize - Size of each batch
 * @param processor - Async function to process each batch
 * @returns Array of results
 */
export async function processInBatches<T, R>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => Promise<R[]>
): Promise<R[]> {
  const batches = batch(items, batchSize);
  const results: R[] = [];

  for (const batch of batches) {
    const batchResults = await processor(batch);
    results.push(...batchResults);
  }

  return results;
}

/**
 * Process items in parallel with concurrency limit
 * @param items - Items to process
 * @param concurrency - Maximum concurrent operations
 * @param processor - Async function to process each item
 * @returns Array of results
 */
export async function processWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  processor: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  const executing: Promise<void>[] = [];

  for (const item of items) {
    const promise = processor(item).then(result => {
      results.push(result);
    });

    executing.push(promise);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
      executing.splice(
        executing.findIndex(p => {
          // @ts-ignore - Promise state check
          return p._settled;
        }),
        1
      );
    }
  }

  await Promise.all(executing);
  return results;
}

/**
 * Chunk a large array into manageable pieces for database operations
 * @param array - The array to chunk
 * @param chunkSize - Size of each chunk (default 100)
 * @returns Array of chunks
 */
export function chunkForDatabase<T>(array: T[], chunkSize: number = 100): T[][] {
  return batch(array, chunkSize);
}
