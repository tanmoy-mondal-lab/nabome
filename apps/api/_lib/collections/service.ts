/**
 * Collection Service - Business Logic Layer
 * Source: CATALOG_ARCHITECTURE.md (binding)
 *
 * Provides business logic for Collection operations following the service pattern.
 */

import type { CollectionType } from '@nabome/types';
import {
  createCollectionSchema,
  updateCollectionSchema,
} from '@nabome/validation';
import type {
  CreateCollectionInput,
  UpdateCollectionInput,
} from '@nabome/validation';

import { collectionRepository } from './repository';

// ── Collection Service ────────────────────────────────────────────────────────

export const collectionService = {
  /**
   * Get a collection by ID
   */
  async getById(id: string) {
    return collectionRepository.findById(id);
  },

  /**
   * Get a collection by slug (for public facing pages)
   */
  async getBySlug(slug: string) {
    return collectionRepository.findBySlug(slug);
  },

  /**
   * List collections with filtering and pagination
   */
  async list(params: {
    page?: number;
    limit?: number;
    type?: CollectionType;
    isActive?: boolean;
    isFeatured?: boolean;
  }) {
    return collectionRepository.findMany(params);
  },

  /**
   * Get featured collections
   */
  async getFeatured(limit = 10) {
    return collectionRepository.findFeatured(limit);
  },

  /**
   * Get active collections (for public display)
   */
  async getActive(limit = 20) {
    return collectionRepository.findActive(limit);
  },

  /**
   * Create a new collection
   */
  async create(input: CreateCollectionInput) {
    // Validate input
    const validated = createCollectionSchema.parse(input);

    // Check if slug already exists
    const existing = await collectionRepository.findBySlug(validated.slug);
    if (existing) {
      throw new Error('Collection with this slug already exists');
    }

    // Validate date range if provided
    if (validated.startsAt && validated.endsAt) {
      const startDate = new Date(validated.startsAt);
      const endDate = new Date(validated.endsAt);
      if (startDate >= endDate) {
        throw new Error('End date must be after start date');
      }
    }

    // Create collection
    return collectionRepository.create({
      ...validated,
      type: validated.type as any,
      startsAt: validated.startsAt ? new Date(validated.startsAt) : null,
      endsAt: validated.endsAt ? new Date(validated.endsAt) : null,
    } as any);
  },

  /**
   * Update a collection
   */
  async update(id: string, input: UpdateCollectionInput) {
    // Validate input
    const validated = updateCollectionSchema.parse(input);

    // Check if collection exists
    const existing = await collectionRepository.findById(id);
    if (!existing) {
      throw new Error('Collection not found');
    }

    // If slug is being changed, check if new slug already exists
    if (validated.slug && validated.slug !== existing.slug) {
      const slugExists = await collectionRepository.findBySlug(validated.slug);
      if (slugExists) {
        throw new Error('Collection with this slug already exists');
      }
    }

    // Validate date range if provided
    const startsAt = validated.startsAt
      ? new Date(validated.startsAt)
      : (existing as any).startsAt;
    const endsAt = validated.endsAt
      ? new Date(validated.endsAt)
      : (existing as any).endsAt;
    if (startsAt && endsAt && startsAt >= endsAt) {
      throw new Error('End date must be after start date');
    }

    // Update collection
    return collectionRepository.update(id, {
      ...validated,
      type: validated.type as any,
      startsAt: validated.startsAt ? new Date(validated.startsAt) : undefined,
      endsAt: validated.endsAt ? new Date(validated.endsAt) : undefined,
    } as any);
  },

  /**
   * Delete a collection (soft delete)
   */
  async delete(id: string) {
    const existing = await collectionRepository.findById(id);
    if (!existing) {
      throw new Error('Collection not found');
    }

    return collectionRepository.delete(id);
  },

  /**
   * Count products in a collection
   */
  async countProducts(collectionId: string) {
    return collectionRepository.countProducts(collectionId);
  },

  /**
   * Update collection sort order
   */
  async updateSortOrder(
    collectionUpdates: Array<{ id: string; sortOrder: number }>,
  ) {
    return collectionRepository.updateSortOrder(collectionUpdates);
  },

  /**
   * Add product to collection
   */
  async addProduct(collectionId: string, productId: string) {
    // Check if collection exists
    const collection = await collectionRepository.findById(collectionId);
    if (!collection) {
      throw new Error('Collection not found');
    }

    // Check if product exists
    const { productRepository } = await import('../products/repository');
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Add product to collection
    const { productCollectionRepository } =
      await import('../products/repository');
    return productCollectionRepository.addProductToCollection(
      productId,
      collectionId,
    );
  },

  /**
   * Remove product from collection
   */
  async removeProduct(collectionId: string, productId: string) {
    const { productCollectionRepository } =
      await import('../products/repository');
    return productCollectionRepository.removeProductFromCollection(
      productId,
      collectionId,
    );
  },
};
