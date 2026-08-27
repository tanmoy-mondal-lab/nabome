/**
 * Brand Service - Business Logic Layer
 * Source: CATALOG_ARCHITECTURE.md (binding)
 *
 * Provides business logic for Brand operations following the service pattern.
 */

import { createBrandSchema, updateBrandSchema } from '@nabome/validation';
import type { CreateBrandInput, UpdateBrandInput } from '@nabome/validation';

import { brandRepository } from './repository';

// ── Brand Service ─────────────────────────────────────────────────────────────

export const brandService = {
  /**
   * Get a brand by ID
   */
  async getById(id: string) {
    return brandRepository.findById(id);
  },

  /**
   * Get a brand by slug (for public facing pages)
   */
  async getBySlug(slug: string) {
    return brandRepository.findBySlug(slug);
  },

  /**
   * List brands with filtering and pagination
   */
  async list(params: { page?: number; limit?: number; isActive?: boolean }) {
    return brandRepository.findMany(params);
  },

  /**
   * Get active brands (for public display)
   */
  async getActive(limit = 20) {
    return brandRepository.findActive(limit);
  },

  /**
   * Create a new brand
   */
  async create(input: CreateBrandInput) {
    // Validate input
    const validated = createBrandSchema.parse(input);

    // Check if slug already exists
    const existing = await brandRepository.findBySlug(validated.slug);
    if (existing) {
      throw new Error('Brand with this slug already exists');
    }

    // Create brand
    return brandRepository.create({
      ...validated,
    });
  },

  /**
   * Update a brand
   */
  async update(id: string, input: UpdateBrandInput) {
    // Validate input
    const validated = updateBrandSchema.parse(input);

    // Check if brand exists
    const existing = await brandRepository.findById(id);
    if (!existing) {
      throw new Error('Brand not found');
    }

    // If slug is being changed, check if new slug already exists
    if (validated.slug && validated.slug !== existing.slug) {
      const slugExists = await brandRepository.findBySlug(validated.slug);
      if (slugExists) {
        throw new Error('Brand with this slug already exists');
      }
    }

    // Update brand
    return brandRepository.update(id, validated);
  },

  /**
   * Delete a brand (soft delete)
   */
  async delete(id: string) {
    const existing = await brandRepository.findById(id);
    if (!existing) {
      throw new Error('Brand not found');
    }

    // Check if brand has products
    const productCount = await brandRepository.countProducts(id);
    if (productCount > 0) {
      throw new Error(
        'Cannot delete brand with associated products. Please reassign or delete products first.',
      );
    }

    return brandRepository.delete(id);
  },

  /**
   * Count products in a brand
   */
  async countProducts(brandId: string) {
    return brandRepository.countProducts(brandId);
  },
};
