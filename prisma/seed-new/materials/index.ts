/**
 * Materials seed module
 * Seeds product material options
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';

export const materialsModule: SeedModule = {
  name: 'materials',
  dependsOn: ['settings'],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let count = 0;

    try {
      // Materials are handled as string field in Product (material)
      // No separate material model exists in schema
      // Materials will be seeded as part of products
      context.logger.info('Materials are handled as string field in Product');
      context.logger.info('Materials will be seeded as part of products');
      
      return {
        success: true,
        count,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        count,
        duration: Date.now() - startTime,
        error: error as Error,
      };
    }
  },
};

registry.register(materialsModule);
