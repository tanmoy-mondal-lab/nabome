/**
 * Categories seed module
 * Seeds product categories and subcategories
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';

export const categoriesModule: SeedModule = {
  name: 'categories',
  dependsOn: ['settings'],
  idempotent: true,
  transactional: false,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let count = 0;

    try {
      // Main categories
      const mainCategories = [
        {
          name: 'Men',
          slug: 'men',
          description: 'Fashion for men - ethnic wear, western wear, accessories',
          sortOrder: 1,
        },
        {
          name: 'Women',
          slug: 'women',
          description: 'Fashion for women - ethnic wear, western wear, accessories',
          sortOrder: 2,
        },
        {
          name: 'Kids',
          slug: 'kids',
          description: 'Fashion for kids - boys and girls clothing and accessories',
          sortOrder: 3,
        },
        {
          name: 'Accessories',
          slug: 'accessories',
          description: 'Fashion accessories - bags, jewelry, footwear, and more',
          sortOrder: 4,
        },
        {
          name: 'Shoes',
          slug: 'shoes',
          description: 'Footwear for men, women, and kids',
          sortOrder: 5,
        },
        {
          name: 'Home & Living',
          slug: 'home-living',
          description: 'Home decor, furnishings, and lifestyle products',
          sortOrder: 6,
        },
      ];

      const categoryMap: Record<string, string> = {};

      for (const category of mainCategories) {
        const created = await context.prisma.category.upsert({
          where: { slug: category.slug },
          update: {
            name: category.name,
            description: category.description,
            sortOrder: category.sortOrder,
            isActive: true,
          },
          create: {
            ...category,
            isActive: true,
          },
        });
        categoryMap[category.slug] = created.id;
        count++;
      }

      // Subcategories for Men
      const menSubcategories = [
        { name: 'Kurtas', slug: 'men-kurtas', description: 'Traditional kurtas for men' },
        { name: 'Sherwanis', slug: 'men-sherwanis', description: 'Elegant sherwanis for special occasions' },
        { name: 'Shirts', slug: 'men-shirts', description: 'Casual and formal shirts' },
        { name: 'Trousers', slug: 'men-trousers', description: 'Formal and casual trousers' },
        { name: 'Jeans', slug: 'men-jeans', description: 'Denim jeans for men' },
        { name: 'T-Shirts', slug: 'men-tshirts', description: 'Casual t-shirts' },
      ];

      for (const sub of menSubcategories) {
        await context.prisma.subcategory.upsert({
          where: { slug: sub.slug },
          update: {
            name: sub.name,
            description: sub.description,
            categoryId: categoryMap['men'],
            sortOrder: 0,
            isActive: true,
          },
          create: {
            ...sub,
            categoryId: categoryMap['men'],
            sortOrder: 0,
            isActive: true,
          },
        });
        count++;
      }

      // Subcategories for Women
      const womenSubcategories = [
        { name: 'Sarees', slug: 'women-sarees', description: 'Traditional sarees' },
        { name: 'Kurtas & Kurtis', slug: 'women-kurtas', description: 'Ethnic kurtas and kurtis' },
        { name: 'Salwar Suits', slug: 'women-salwar-suits', description: 'Salwar kameez suits' },
        { name: 'Dresses', slug: 'women-dresses', description: 'Western and ethnic dresses' },
        { name: 'Tops', slug: 'women-tops', description: 'Casual and formal tops' },
        { name: 'Palazzos', slug: 'women-palazzos', description: 'Stylish palazzo pants' },
        { name: 'Lehengas', slug: 'women-lehengas', description: 'Traditional lehengas' },
      ];

      for (const sub of womenSubcategories) {
        await context.prisma.subcategory.upsert({
          where: { slug: sub.slug },
          update: {
            name: sub.name,
            description: sub.description,
            categoryId: categoryMap['women'],
            sortOrder: 0,
            isActive: true,
          },
          create: {
            ...sub,
            categoryId: categoryMap['women'],
            sortOrder: 0,
            isActive: true,
          },
        });
        count++;
      }

      // Subcategories for Kids
      const kidsSubcategories = [
        { name: 'Boys Clothing', slug: 'boys-clothing', description: 'Clothing for boys' },
        { name: 'Girls Clothing', slug: 'girls-clothing', description: 'Clothing for girls' },
        { name: 'Baby Clothing', slug: 'baby-clothing', description: 'Clothing for babies' },
      ];

      for (const sub of kidsSubcategories) {
        await context.prisma.subcategory.upsert({
          where: { slug: sub.slug },
          update: {
            name: sub.name,
            description: sub.description,
            categoryId: categoryMap['kids'],
            sortOrder: 0,
            isActive: true,
          },
          create: {
            ...sub,
            categoryId: categoryMap['kids'],
            sortOrder: 0,
            isActive: true,
          },
        });
        count++;
      }

      // Subcategories for Accessories
      const accessoriesSubcategories = [
        { name: 'Bags', slug: 'bags', description: 'Handbags, clutches, and backpacks' },
        { name: 'Jewelry', slug: 'jewelry', description: 'Earrings, necklaces, and bracelets' },
        { name: 'Watches', slug: 'watches', description: 'Fashion and smart watches' },
        { name: 'Sunglasses', slug: 'sunglasses', description: 'Stylish sunglasses' },
        { name: 'Belts', slug: 'belts', description: 'Fashion belts' },
      ];

      for (const sub of accessoriesSubcategories) {
        await context.prisma.subcategory.upsert({
          where: { slug: sub.slug },
          update: {
            name: sub.name,
            description: sub.description,
            categoryId: categoryMap['accessories'],
            sortOrder: 0,
            isActive: true,
          },
          create: {
            ...sub,
            categoryId: categoryMap['accessories'],
            sortOrder: 0,
            isActive: true,
          },
        });
        count++;
      }

      context.logger.success(`Seeded ${count} categories and subcategories`);
      
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

registry.register(categoriesModule);
