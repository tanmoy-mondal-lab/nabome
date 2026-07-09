/**
 * Blogs seed module
 * Seeds blog posts
 * Note: Blog model does not exist in current schema
 * This module is kept for compatibility but does nothing
 * Blog content can be managed through CMS static pages
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';

export const blogsModule: SeedModule = {
  name: 'blogs',
  dependsOn: ['media', 'cms'],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    
    try {
      context.logger.info('Blog model does not exist in current schema');
      context.logger.info('Blog content can be managed through CMS static pages');
      return { success: true, count: 0, duration: Date.now() - startTime };
    } catch (error) {
      return { success: false, count: 0, duration: Date.now() - startTime, error: error as Error };
    }
  },
};

registry.register(blogsModule);
