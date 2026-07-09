/**
 * Roles seed module
 * Seeds user roles (admin, seller, customer, etc.)
 * Note: Roles are defined as enum in schema, so we seed users with roles instead
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';

export const rolesModule: SeedModule = {
  name: 'roles',
  dependsOn: [],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let count = 0;

    try {
      // Roles are defined as enum in schema (customer, admin)
      // We don't need to seed roles separately
      // Users will be seeded with appropriate roles in the users module
      context.logger.info('Roles are defined as enum in schema (customer, admin)');
      context.logger.info('Users will be assigned roles in the users module');
      
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

registry.register(rolesModule);
