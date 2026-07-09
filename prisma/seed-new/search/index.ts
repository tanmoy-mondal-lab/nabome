/**
 * Search seed module
 * Seeds search index data
 * Note: Search functionality is handled by PostgreSQL full-text search
 * This module is kept for compatibility but does nothing
 * Search indexing is managed dynamically by the application
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';

export const searchModule: SeedModule = {
  name: 'search',
  dependsOn: ['products', 'categories'],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    
    try {
      context.logger.info('Search functionality is handled by PostgreSQL full-text search');
      context.logger.info('Search indexing is managed dynamically by the application');
      return { success: true, count: 0, duration: Date.now() - startTime };
    } catch (error) {
      return { success: false, count: 0, duration: Date.now() - startTime, error: error as Error };
    }
  },
};

registry.register(searchModule);
