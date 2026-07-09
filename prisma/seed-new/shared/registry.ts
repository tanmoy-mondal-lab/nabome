/**
 * Seed module registry
 * Manages registration and discovery of seed modules
 */

import type { SeedModule, ModuleMetadata } from './types';

class SeedModuleRegistry {
  private modules: Map<string, SeedModule> = new Map();

  /**
   * Register a seed module
   */
  register(module: SeedModule): void {
    this.modules.set(module.name, module);
  }

  /**
   * Get a seed module by name
   */
  get(name: string): SeedModule | undefined {
    return this.modules.get(name);
  }

  /**
   * Get all registered modules
   */
  getAll(): SeedModule[] {
    return Array.from(this.modules.values());
  }

  /**
   * Get module metadata for all modules
   */
  getMetadata(): ModuleMetadata[] {
    return Array.from(this.modules.values()).map(module => ({
      name: module.name,
      dependsOn: module.dependsOn,
      enabled: true,
    }));
  }

  /**
   * Check if a module is registered
   */
  has(name: string): boolean {
    return this.modules.has(name);
  }

  /**
   * Unregister a module
   */
  unregister(name: string): boolean {
    return this.modules.delete(name);
  }

  /**
   * Clear all registered modules
   */
  clear(): void {
    this.modules.clear();
  }
}

// Export singleton instance
export const registry = new SeedModuleRegistry();
