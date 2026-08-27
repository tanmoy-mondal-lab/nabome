/**
 * Category Service - Business Logic Layer
 * Source: CATALOG_ARCHITECTURE.md (binding)
 *
 * Provides business logic for Category operations following the service pattern.
 */

import { createCategorySchema, updateCategorySchema } from '@nabome/validation';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@nabome/validation';

import { categoryRepository } from './repository';

// ── Category Service ───────────────────────────────────────────────────────────

export const categoryService = {
  /**
   * Get a category by ID
   */
  async getById(id: string) {
    return categoryRepository.findById(id);
  },

  /**
   * Get a category by slug (for public facing pages)
   */
  async getBySlug(slug: string) {
    return categoryRepository.findBySlug(slug);
  },

  /**
   * List categories with filtering and pagination
   */
  async list(params: {
    page?: number;
    limit?: number;
    parentId?: string;
    isActive?: boolean;
    isHidden?: boolean;
  }) {
    return categoryRepository.findMany(params);
  },

  /**
   * Get category tree (hierarchical structure)
   */
  async getTree(parentId?: string | null) {
    return categoryRepository.findTree(parentId);
  },

  /**
   * Get root categories (no parent)
   */
  async getRoot() {
    return categoryRepository.findRoot();
  },

  /**
   * Create a new category
   */
  async create(input: CreateCategoryInput) {
    // Validate input
    const validated = createCategorySchema.parse(input);

    // Check if slug already exists
    const existing = await categoryRepository.findBySlug(validated.slug);
    if (existing) {
      throw new Error('Category with this slug already exists');
    }

    // If parentId is provided, check if parent exists
    if (validated.parentId) {
      const parent = await categoryRepository.findById(validated.parentId);
      if (!parent) {
        throw new Error('Parent category not found');
      }
    }

    // Create category
    return categoryRepository.create({
      ...validated,
      parent: validated.parentId
        ? {
            connect: { id: validated.parentId },
          }
        : undefined,
    } as any);
  },

  /**
   * Update a category
   */
  async update(id: string, input: UpdateCategoryInput) {
    // Validate input
    const validated = updateCategorySchema.parse(input);

    // Check if category exists
    const existing = await categoryRepository.findById(id);
    if (!existing) {
      throw new Error('Category not found');
    }

    // If slug is being changed, check if new slug already exists
    if (validated.slug && validated.slug !== existing.slug) {
      const slugExists = await categoryRepository.findBySlug(validated.slug);
      if (slugExists) {
        throw new Error('Category with this slug already exists');
      }
    }

    // If parentId is being changed, check if new parent exists
    if (
      validated.parentId !== undefined &&
      validated.parentId !== existing.parentId
    ) {
      if (validated.parentId) {
        const parent = await categoryRepository.findById(validated.parentId);
        if (!parent) {
          throw new Error('Parent category not found');
        }
      }
    }

    // Update category
    return categoryRepository.update(id, {
      ...validated,
      parent:
        validated.parentId !== undefined
          ? validated.parentId
            ? {
                connect: { id: validated.parentId },
              }
            : {
                disconnect: true,
              }
          : undefined,
    } as any);
  },

  /**
   * Delete a category (soft delete)
   */
  async delete(id: string) {
    const existing = await categoryRepository.findById(id);
    if (!existing) {
      throw new Error('Category not found');
    }

    // Check if category has children by querying directly
    const children = await categoryRepository.findByParentId(id);
    if (children.length > 0) {
      throw new Error(
        'Cannot delete category with child categories. Please delete or reassign children first.',
      );
    }

    return categoryRepository.delete(id);
  },

  /**
   * Count products in a category
   */
  async countProducts(categoryId: string) {
    return categoryRepository.countProducts(categoryId);
  },

  /**
   * Update category sort order
   */
  async updateSortOrder(
    categoryUpdates: Array<{ id: string; sortOrder: number }>,
  ) {
    return categoryRepository.updateSortOrder(categoryUpdates);
  },
};
