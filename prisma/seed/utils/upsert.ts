/**
 * Seed Upsert Utilities
 * Idempotent upsert helpers for seed operations
 */

import { logSeed } from './helpers';

/**
 * Generic upsert helper with logging
 */
export async function safeUpsert<T>(
  operation: string,
  entityName: string,
  upsertFn: () => Promise<T>
): Promise<T> {
  logSeed('UPSERT', entityName, 'START');
  try {
    const result = await upsertFn();
    logSeed('UPSERT', entityName, 'SUCCESS');
    return result;
  } catch (error) {
    logSeed('UPSERT', entityName, 'ERROR');
    throw error;
  }
}

/**
 * Upsert by unique field
 */
export async function upsertByField<T>(
  model: any,
  where: Record<string, any>,
  data: Record<string, any>,
  entityName: string
): Promise<T> {
  return safeUpsert('UPSERT', entityName, () =>
    model.upsert({
      where,
      create: data,
      update: data,
    })
  );
}

/**
 * Create or find helper
 */
export async function createOrFind<T>(
  model: any,
  where: Record<string, any>,
  data: Record<string, any>,
  entityName: string
): Promise<T> {
  logSeed('FIND_OR_CREATE', entityName, 'START');
  try {
    const existing = await model.findUnique({ where });
    if (existing) {
      logSeed('FOUND', entityName, 'SUCCESS');
      return existing as T;
    }
    const result = await model.create({ data });
    logSeed('CREATE', entityName, 'SUCCESS');
    return result as T;
  } catch (error) {
    logSeed('FIND_OR_CREATE', entityName, 'ERROR');
    throw error;
  }
}

/**
 * Batch upsert helper
 */
export async function batchUpsert<T>(
  model: any,
  items: Array<{ where: Record<string, any>; data: Record<string, any> }>,
  entityName: string
): Promise<T[]> {
  logSeed('BATCH_UPSERT', entityName, 'START');
  const results: T[] = [];
  
  for (const item of items) {
    const result = await model.upsert({
      where: item.where,
      create: item.data,
      update: item.data,
    });
    results.push(result as T);
  }
  
  logSeed('BATCH_UPSERT', entityName, 'SUCCESS');
  return results;
}
