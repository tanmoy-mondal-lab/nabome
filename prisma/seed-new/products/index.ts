/**
 * Products seed module
 * Seeds products with variants, attributes, tags, and media
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';
import {
  getRandomItem,
  getRandomItems,
  getRandomInRange,
  generateSlug,
  generateProductName,
  generateDescription,
  generatePrice,
  generateSalePrice,
  generateCostPrice,
  generateGender,
  generateVariantCount,
  generateStock,
  generateSku,
  generateAttributes,
  generateSeoTitle,
  generateSeoDescription,
  SIZES,
  COLORS,
  MATERIALS,
} from './data';
import { uploadSeedMedia, generateMockMediaUrl } from '../shared/media-hooks';
import { seedRelatedProducts } from './related';
import { Gender } from '@prisma/client';

// Product distribution configuration
const PRODUCT_COUNT = 200; // Target: 150-250 products
const PRODUCTS_PER_CATEGORY_MIN = 15;
const PRODUCTS_PER_CATEGORY_MAX = 35;

// Status distribution
const STATUS_DISTRIBUTION = {
  active: 0.85,    // 85% active
  draft: 0.10,     // 10% draft
  outOfStock: 0.05, // 5% out of stock
};

// Flag distribution
const FLAG_DISTRIBUTION = {
  featured: 0.15,  // 15% featured
  new: 0.20,       // 20% new arrivals
};

export const productsModule: SeedModule = {
  name: 'products',
  dependsOn: ['brands', 'categories', 'collections', 'labels', 'sizes', 'colors', 'materials'],
  idempotent: true,
  transactional: false,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let productCount = 0;
    let variantCount = 0;
    let attributeCount = 0;
    let imageCount = 0;

    try {
      context.logger.info('Starting product seeding...');

      // Get existing data from dependencies
      const brands = await context.prisma.brand.findMany({ where: { isActive: true } });
      const categories = await context.prisma.category.findMany({ where: { isActive: true } });
      const subcategories = await context.prisma.subcategory.findMany({ where: { isActive: true } });
      const collections = await context.prisma.collection.findMany({ where: { isActive: true } });
      const labels = await context.prisma.productLabel.findMany();

      if (brands.length === 0 || categories.length === 0) {
        throw new Error('Required dependencies (brands, categories) not found');
      }

      context.logger.info(`Found ${brands.length} brands, ${categories.length} categories, ${subcategories.length} subcategories, ${collections.length} collections, ${labels.length} labels`);

      // Map subcategories by category for easy lookup
      const subcategoriesByCategory = new Map<string, typeof subcategories>();
      for (const sub of subcategories) {
        if (!subcategoriesByCategory.has(sub.categoryId)) {
          subcategoriesByCategory.set(sub.categoryId, []);
        }
        subcategoriesByCategory.get(sub.categoryId)!.push(sub);
      }

      // Generate products for each category
      for (const category of categories) {
        const categorySubcategories = subcategoriesByCategory.get(category.id) || [];
        
        // Skip categories with no subcategories
        if (categorySubcategories.length === 0) {
          context.logger.debug(`Skipping category ${category.name} - no subcategories`);
          continue;
        }

        // Distribute products across subcategories
        const productsForCategory = getRandomInRange(PRODUCTS_PER_CATEGORY_MIN, PRODUCTS_PER_CATEGORY_MAX);
        const productsPerSubcategory = Math.floor(productsForCategory / categorySubcategories.length);

        for (const subcategory of categorySubcategories) {
          const actualProductCount = productsPerSubcategory + getRandomInRange(-2, 2);
          
          for (let i = 0; i < actualProductCount; i++) {
            const product = await createProduct(
              context,
              brands,
              collections,
              labels,
              category,
              subcategory,
              productCount
            );
            
            if (product) {
              productCount++;
              variantCount += product.variantCount;
              attributeCount += product.attributeCount;
              imageCount += product.imageCount;
            }
          }
        }
      }

      context.logger.success(`Seeded ${productCount} products`);
      context.logger.success(`Created ${variantCount} variants`);
      context.logger.success(`Added ${attributeCount} attributes`);
      context.logger.success(`Uploaded ${imageCount} images`);

      // Generate related product relationships
      context.logger.info('Generating related product relationships...');
      const relatedCount = await seedRelatedProducts(context.prisma, Math.floor(productCount * 1.5));
      context.logger.success(`Created ${relatedCount} related product relationships`);

      return {
        success: true,
        count: productCount,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      context.logger.error('Error seeding products:', error);
      return {
        success: false,
        count: productCount,
        duration: Date.now() - startTime,
        error: error as Error,
      };
    }
  },
};

interface ProductCreationResult {
  variantCount: number;
  attributeCount: number;
  imageCount: number;
}

async function createProduct(
  context: SeedContext,
  brands: any[],
  collections: any[],
  labels: any[],
  category: any,
  subcategory: any,
  index: number
): Promise<ProductCreationResult | null> {
  try {
    const brand = getRandomItem(brands);
    const material = getRandomItem(MATERIALS);
    const basePrice = generatePrice(subcategory.slug);
    const salePrice = generateSalePrice(basePrice);
    const costPrice = generateCostPrice(basePrice);
    const gender = generateGender(subcategory.slug);
    const name = generateProductName(subcategory.slug, brand.name);
    const slug = generateSlug(`${name}-${index}`);
    const description = generateDescription(material);
    const shortDescription = description.substring(0, 150) + '...';
    
    // Determine status
    const statusRoll = Math.random();
    let isActive = true;
    let stock = 0;
    
    if (statusRoll < STATUS_DISTRIBUTION.active) {
      stock = generateStock();
      if (stock === 0) {
        isActive = false; // Out of stock
      }
    } else if (statusRoll < STATUS_DISTRIBUTION.active + STATUS_DISTRIBUTION.draft) {
      isActive = false; // Draft
    } else {
      stock = 0; // Out of stock
      isActive = false;
    }

    // Determine flags
    const isFeatured = Math.random() < FLAG_DISTRIBUTION.featured;
    const isNew = Math.random() < FLAG_DISTRIBUTION.new;

    // Select collection (30% chance)
    const collection = Math.random() < 0.3 ? getRandomItem(collections) : null;

    // Create product
    const product = await context.prisma.product.create({
      data: {
        name,
        slug,
        description,
        shortDescription,
        categoryId: category.id,
        subcategoryId: subcategory.id,
        brandId: brand.id,
        collectionId: collection?.id,
        basePrice,
        compareAtPrice: salePrice ? basePrice : null,
        salePrice,
        costPrice,
        discountPercent: salePrice ? Math.round(((basePrice - salePrice) / basePrice) * 100) : null,
        material,
        gender,
        isActive,
        isFeatured,
        isNew,
        sortOrder: index,
        publishedAt: isActive ? new Date() : null,
        metaTitle: generateSeoTitle(name, brand.name),
        metaDesc: generateSeoDescription(name, shortDescription),
      },
    });

    let variantCount = 0;
    let attributeCount = 0;
    let imageCount = 0;

    // Create variants
    const variantCountTotal = generateVariantCount(subcategory.slug);
    const selectedSizes = getRandomItems(SIZES, Math.min(4, variantCountTotal));
    const selectedColors = getRandomItems(COLORS, Math.min(3, variantCountTotal));

    for (const size of selectedSizes) {
      for (const color of selectedColors) {
        if (variantCount >= variantCountTotal) break;

        const sku = generateSku(product.id, size, color.name);
        const variantStock = isActive ? getRandomInRange(5, 50) : 0;
        const priceAdjustment = size === 'XXL' || size === '3XL' ? 100 : 0;

        const variant = await context.prisma.productVariant.create({
          data: {
            productId: product.id,
            sku,
            size,
            color: color.name,
            colorHex: color.hex,
            priceAdjustment,
            stock: variantStock,
            reservedStock: 0,
            isActive: isActive && variantStock > 0,
          },
        });

        variantCount++;

        // Add images for variant (2-4 images per variant)
        const imageCountPerVariant = getRandomInRange(2, 4);
        for (let imgIndex = 0; imgIndex < imageCountPerVariant; imgIndex++) {
          const isPrimary = imgIndex === 0;
          const sortOrder = imgIndex;
          
          // Use mock media URL for development (in production, use actual MediaService)
          const mockUrl = generateMockMediaUrl('product', product.id, imgIndex);
          
          await context.prisma.productImage.create({
            data: {
              productId: product.id,
              variantId: variant.id,
              url: mockUrl,
              altText: `${name} in ${color.name} ${size}`,
              sortOrder,
              isPrimary: isPrimary && imgIndex === 0 && variantCount === 1,
              type: 'image',
            },
          });

          imageCount++;
        }
      }
    }

    // Add product-level attributes
    const attributes = generateAttributes(subcategory.slug, material);
    for (const attr of attributes) {
      await context.prisma.productAttribute.create({
        data: {
          productId: product.id,
          name: attr.name,
          value: attr.value,
        },
      });
      attributeCount++;
    }

    // Add labels (0-2 labels per product)
 const selectedLabels = getRandomItems(labels, getRandomInRange(0, 2));
    for (const label of selectedLabels) {
      await context.prisma.productLabelOnProduct.create({
        data: {
          productId: product.id,
          labelId: label.id,
        },
      });
    }

    return {
      variantCount,
      attributeCount,
      imageCount,
    };
  } catch (error) {
    context.logger.error(`Error creating product for ${subcategory.slug}:`, error);
    return null;
  }
}

registry.register(productsModule);
