/**
 * Media seed module
 * Seeds media assets for products, brands, categories
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';

export const mediaModule: SeedModule = {
  name: 'media',
  dependsOn: ['products', 'brands', 'categories', 'collections'],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let count = 0;

    try {
      context.logger.debug('Media seeding not yet implemented');
      return { success: true, count, duration: Date.now() - startTime };
    } catch (error) {
      return { success: false, count, duration: Date.now() - startTime, error: error as Error };
    }
  },
};

registry.register(mediaModule);
