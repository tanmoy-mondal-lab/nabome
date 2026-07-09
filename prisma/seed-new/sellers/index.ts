/**
 * Sellers seed module
 * Note: Seller role does not exist in current schema
 * Only customer and admin roles are available
 * This module is kept for compatibility but does nothing
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';

export const sellersModule: SeedModule = {
  name: 'sellers',
  dependsOn: ['users'],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    
    try {
      context.logger.info('Seller role does not exist in current schema');
      context.logger.info('Only customer and admin roles are available');
      return { success: true, count: 0, duration: Date.now() - startTime };
    } catch (error) {
      return { success: false, count: 0, duration: Date.now() - startTime, error: error as Error };
    }
  },
};

registry.register(sellersModule);
