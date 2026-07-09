/**
 * Dependency graph and execution order
 * Manages module dependencies and determines execution order
 */

import type { ModuleMetadata } from '../shared/types';

/**
 * Dependency graph for seed modules
 * Defines the execution order based on dependencies
 */
export const SEED_DEPENDENCY_GRAPH: ModuleMetadata[] = [
  // Level 1: Foundation (no dependencies)
  { name: 'settings', dependsOn: [], enabled: true },
  { name: 'roles', dependsOn: [], enabled: true },
  { name: 'permissions', dependsOn: [], enabled: true },
  { name: 'navigation', dependsOn: [], enabled: true },
  { name: 'footer', dependsOn: [], enabled: true },
  { name: 'notifications', dependsOn: [], enabled: true },
  
  // Level 2: Users (depends on roles, permissions)
  { name: 'users', dependsOn: ['roles', 'permissions'], enabled: true },
  { name: 'sellers', dependsOn: ['users'], enabled: true },
  { name: 'customers', dependsOn: ['users'], enabled: true },
  
  // Level 3: Product taxonomy (depends on settings)
  { name: 'brands', dependsOn: ['settings'], enabled: true },
  { name: 'categories', dependsOn: ['settings'], enabled: true },
  { name: 'collections', dependsOn: ['settings'], enabled: true },
  { name: 'labels', dependsOn: ['settings'], enabled: true },
  { name: 'sizes', dependsOn: ['settings'], enabled: true },
  { name: 'colors', dependsOn: ['settings'], enabled: true },
  { name: 'materials', dependsOn: ['settings'], enabled: true },
  
  // Level 4: Products (depends on taxonomy)
  { name: 'products', dependsOn: ['brands', 'categories', 'collections', 'labels', 'sizes', 'colors', 'materials'], enabled: true },
  { name: 'inventory', dependsOn: ['products'], enabled: true },
  
  // Level 5: Media (depends on products, brands, categories, collections)
  { name: 'media', dependsOn: ['products', 'brands', 'categories', 'collections'], enabled: true },
  
  // Level 6: Homepage (depends on media, products, collections)
  { name: 'homepage', dependsOn: ['media', 'products', 'collections'], enabled: true },
  { name: 'hero', dependsOn: ['media'], enabled: true },
  
  // Level 7: CMS (depends on media)
  { name: 'cms', dependsOn: ['media'], enabled: true },
  { name: 'faq', dependsOn: ['cms'], enabled: true },
  { name: 'announcements', dependsOn: ['cms'], enabled: true },
  { name: 'blogs', dependsOn: ['media', 'cms'], enabled: true },
  { name: 'lookbooks', dependsOn: ['media', 'products'], enabled: true },
  
  // Level 8: Orders (depends on customers, products, inventory)
  { name: 'addresses', dependsOn: ['customers'], enabled: true },
  { name: 'wishlist', dependsOn: ['customers', 'products'], enabled: true },
  { name: 'cart', dependsOn: ['customers', 'products'], enabled: true },
  { name: 'coupons', dependsOn: ['settings'], enabled: true },
  { name: 'orders', dependsOn: ['customers', 'products', 'inventory', 'addresses', 'coupons'], enabled: true },
  { name: 'payments', dependsOn: ['orders'], enabled: true },
  { name: 'shipping', dependsOn: ['orders'], enabled: true },
  { name: 'returns', dependsOn: ['orders', 'customers'], enabled: true },
  
  // Level 9: Reviews (depends on customers, products, orders)
  { name: 'reviews', dependsOn: ['customers', 'products', 'orders'], enabled: true },
  
  // Level 10: Support (depends on customers, orders)
  { name: 'support', dependsOn: ['customers', 'orders'], enabled: true },
  
  // Level 12: SEO (depends on products, categories, collections, blogs)
  { name: 'seo', dependsOn: ['products', 'categories', 'collections', 'blogs'], enabled: true },
  
  // Level 13: Search (depends on products, categories)
  { name: 'search', dependsOn: ['products', 'categories'], enabled: true },
  
  // Level 14: Analytics (depends on users, products, orders)
  { name: 'analytics', dependsOn: ['users', 'products', 'orders'], enabled: true },
  
  // Level 15: Verification (depends on users)
  { name: 'verification', dependsOn: ['users'], enabled: true },
];

/**
 * Topological sort to determine execution order
 */
export function getExecutionOrder(modules: ModuleMetadata[]): string[] {
  const visited = new Set<string>();
  const temp = new Set<string>();
  const order: string[] = [];
  const moduleMap = new Map(modules.map(m => [m.name, m]));

  function visit(name: string): void {
    if (temp.has(name)) {
      throw new Error(`Circular dependency detected involving module: ${name}`);
    }
    if (visited.has(name)) {
      return;
    }

    temp.add(name);
    const module = moduleMap.get(name);
    
    if (module) {
      for (const dep of module.dependsOn) {
        visit(dep);
      }
    }

    temp.delete(name);
    visited.add(name);
    order.push(name);
  }

  for (const module of modules) {
    if (!visited.has(module.name)) {
      visit(module.name);
    }
  }

  return order;
}

/**
 * Validate dependency graph
 */
export function validateDependencyGraph(modules: ModuleMetadata[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const moduleNames = new Set(modules.map(m => m.name));

  for (const module of modules) {
    // Check if all dependencies exist
    for (const dep of module.dependsOn) {
      if (!moduleNames.has(dep)) {
        errors.push(`Module '${module.name}' depends on non-existent module '${dep}'`);
      }
    }
  }

  // Check for circular dependencies
  try {
    getExecutionOrder(modules);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Circular dependency detected');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get enabled modules in execution order
 */
export function getEnabledModules(): string[] {
  const enabledModules = SEED_DEPENDENCY_GRAPH.filter(m => m.enabled);
  return getExecutionOrder(enabledModules);
}
