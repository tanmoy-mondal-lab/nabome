/**
 * Homepage seed module
 * Seeds homepage sections and layout with product references
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';
import { getRandomItems } from '../products/data';

export const homepageModule: SeedModule = {
  name: 'homepage',
  dependsOn: ['media', 'products', 'collections'],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let count = 0;

    try {
      // Get products and collections for homepage sections
      const featuredProducts = await context.prisma.product.findMany({
        where: { isActive: true, isFeatured: true },
        take: 8,
        select: { id: true, name: true, slug: true, basePrice: true, images: { take: 1 } },
      });

      const newProducts = await context.prisma.product.findMany({
        where: { isActive: true, isNew: true },
        take: 8,
        select: { id: true, name: true, slug: true, basePrice: true, images: { take: 1 } },
      });

      const trendingProducts = await context.prisma.product.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: { id: true, name: true, slug: true, basePrice: true, images: { take: 1 } },
      });

      const collections = await context.prisma.collection.findMany({
        where: { isActive: true, isFeatured: true },
        take: 4,
        select: { id: true, name: true, slug: true, heroImageUrl: true },
      });

      const categories = await context.prisma.category.findMany({
        where: { isActive: true },
        take: 6,
        select: { id: true, name: true, slug: true, imageUrl: true },
      });

      context.logger.info(`Found ${featuredProducts.length} featured, ${newProducts.length} new, ${trendingProducts.length} trending products`);
      context.logger.info(`Found ${collections.length} collections, ${categories.length} categories`);

      // Seed homepage sections with product references
      const sections = [
        {
          sectionType: 'banner_promo' as const,
          title: 'Flash Sale Banner',
          content: {
            banner: {
              title: 'Flash Sale - Up to 50% Off',
              subtitle: 'Limited time offer on selected items',
              imageUrl: null,
              link: '/sale',
              bgColor: '#FF6B6B',
              textColor: '#FFFFFF',
              isActive: true,
            },
          },
          sortOrder: 0,
          isActive: true,
        },
        {
          sectionType: 'hero_slider' as const,
          title: 'Hero Slider',
          content: {
            slides: featuredProducts.slice(0, 4).map(p => ({
              productId: p.id,
              title: p.name,
              subtitle: 'New Collection',
              imageUrl: p.images[0]?.url || null,
              link: `/products/${p.slug}`,
            })),
          },
          sortOrder: 1,
          isActive: true,
        },
        {
          sectionType: 'featured_collections' as const,
          title: 'Featured Collections',
          content: {
            collections: collections.map(c => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              imageUrl: c.heroImageUrl,
            })),
          },
          sortOrder: 2,
          isActive: true,
        },
        {
          sectionType: 'new_arrivals' as const,
          title: 'New Arrivals',
          content: {
            products: newProducts.map(p => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              price: p.basePrice.toString(),
              imageUrl: p.images[0]?.url || null,
            })),
          },
          sortOrder: 3,
          isActive: true,
        },
        {
          sectionType: 'product_grid' as const,
          title: 'Trending Products',
          content: {
            products: trendingProducts.map(p => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              price: p.basePrice.toString(),
              imageUrl: p.images[0]?.url || null,
            })),
          },
          sortOrder: 4,
          isActive: true,
        },
        {
          sectionType: 'categories_grid' as const,
          title: 'Featured Categories',
          content: {
            categories: categories.map(c => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              imageUrl: c.imageUrl,
            })),
          },
          sortOrder: 5,
          isActive: true,
        },
        {
          sectionType: 'brand_story' as const,
          title: 'Brand Story',
          content: {
            body: 'নবME was born from a vision to blend traditional Indian craftsmanship with contemporary design.',
          },
          sortOrder: 6,
          isActive: true,
        },
        {
          sectionType: 'newsletter' as const,
          title: 'Newsletter',
          content: {
            heading: 'Stay Updated',
            subheading: 'Subscribe to our newsletter for exclusive offers and new arrivals.',
          },
          sortOrder: 7,
          isActive: true,
        },
        {
          sectionType: 'testimonials' as const,
          title: 'Customer Reviews',
          content: {
            testimonials: [
              {
                name: 'Priya Sharma',
                rating: 5,
                text: 'Absolutely love the quality and craftsmanship. Will definitely order again!',
              },
              {
                name: 'Rahul Verma',
                rating: 5,
                text: 'Fast delivery and excellent customer service. The products exceeded my expectations.',
              },
              {
                name: 'Ananya Patel',
                rating: 4,
                text: 'Beautiful designs that celebrate our traditions. Highly recommended!',
              },
            ],
          },
          sortOrder: 8,
          isActive: true,
        },
        {
          sectionType: 'trust_bar' as const,
          title: 'Trust Badges',
          content: {
            badges: [
              { icon: 'truck', text: 'Free Shipping on orders above ₹1000' },
              { icon: 'shield', text: '100% Secure Payments' },
              { icon: 'refresh', text: 'Easy 30-day Returns' },
              { icon: 'star', text: 'Quality Assured Products' },
            ],
          },
          sortOrder: 9,
          isActive: true,
        },
      ];

      for (const section of sections) {
        const existing = await context.prisma.homepageSection.findFirst({
          where: {
            sectionType: section.sectionType,
            sortOrder: section.sortOrder,
          },
        });

        if (existing) {
          await context.prisma.homepageSection.update({
            where: { id: existing.id },
            data: {
              title: section.title,
              content: section.content,
              isActive: section.isActive,
            },
          });
        } else {
          await context.prisma.homepageSection.create({
            data: section,
          });
        }
        count++;
      }

      context.logger.success(`Seeded ${count} homepage sections with product references`);
      
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

registry.register(homepageModule);
