/**
 * Permissions seed module
 * Seeds user permissions and access control
 * Note: Permissions are handled through role enum in schema
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';

export const permissionsModule: SeedModule = {
  name: 'permissions',
  dependsOn: [],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let count = 0;

    try {
      // Permissions are handled through role enum (customer, admin) in schema
      // No separate permission model exists
      context.logger.info('Permissions are handled through role enum in schema');
      context.logger.info('No separate permission model to seed');
      
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

registry.register(permissionsModule);
