/**
 * Seed module template
 * Copy this template to create new seed modules
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';

export const createSeedModule = (
  name: string,
  dependsOn: string[],
  seedFn: (context: SeedContext) => Promise<SeedResult>
): SeedModule => ({
  name,
  dependsOn,
  idempotent: true,
  transactional: true,
  seed: seedFn,
});

/**
 * Example seed module implementation
 */
export const exampleModule: SeedModule = {
  name: 'example',
  dependsOn: [],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let count = 0;

    try {
      // Your seeding logic here
      // Example:
      // await context.prisma.example.createMany({
      //   data: [...],
      // });

      count = 0; // Update with actual count

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

// Register the module
// registry.register(exampleModule);
