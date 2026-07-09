/**
 * Sizes seed module
 * Seeds product size options
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';

export const sizesModule: SeedModule = {
  name: 'sizes',
  dependsOn: ['settings'],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let count = 0;

    try {
      // Sizes are handled as string fields in ProductVariant (size, color, colorHex)
      // No separate size model exists in schema
      // Sizes will be seeded as part of product variants
      context.logger.info('Sizes are handled as string fields in ProductVariant');
      context.logger.info('Sizes will be seeded as part of product variants');
      
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

registry.register(sizesModule);
