/**
 * Customers seed module
 * Note: Customer accounts are seeded in the users module
 * This module is kept for compatibility but does nothing
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';

export const customersModule: SeedModule = {
  name: 'customers',
  dependsOn: ['users'],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    
    try {
      context.logger.info('Customer accounts are seeded in the users module');
      return { success: true, count: 0, duration: Date.now() - startTime };
    } catch (error) {
      return { success: false, count: 0, duration: Date.now() - startTime, error: error as Error };
    }
  },
};

registry.register(customersModule);
