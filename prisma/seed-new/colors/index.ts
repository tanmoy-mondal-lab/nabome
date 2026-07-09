/**
 * Colors seed module
 * Seeds product color options
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';

export const colorsModule: SeedModule = {
  name: 'colors',
  dependsOn: ['settings'],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let count = 0;

    try {
      // Colors are handled as string fields in ProductVariant (color, colorHex)
      // No separate color model exists in schema
      // Colors will be seeded as part of product variants
      context.logger.info('Colors are handled as string fields in ProductVariant');
      context.logger.info('Colors will be seeded as part of product variants');
      
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

registry.register(colorsModule);
