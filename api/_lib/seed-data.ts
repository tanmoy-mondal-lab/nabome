// ─────────────────────────────────────────────────────────────
// SEED DATA UTILITY
// ─────────────────────────────────────────────────────────────
// Generates and manages seed data for development/testing
// ─────────────────────────────────────────────────────────────

import { getPrisma } from "./prisma";
import type { Env } from "./env";

export interface SeedOptions {
  clearExisting?: boolean;
  categories?: number;
  products?: number;
  users?: number;
  orders?: number;
}

export class SeedDataManager {
  async seedDatabase(options: SeedOptions = {}, env?: Env): Promise<{
    success: boolean;
    seeded: Record<string, number>;
    error?: string;
  }> {
    const prisma = getPrisma(env);
    const seeded: Record<string, number> = {};

    try {
      if (options.clearExisting) {
        await this.clearDatabase(prisma);
      }

      // Seed categories
      if (options.categories && options.categories > 0) {
        const categoryCount = await this.seedCategories(prisma, options.categories);
        seeded.categories = categoryCount;
      }

      // Seed products
      if (options.products && options.products > 0) {
        const productCount = await this.seedProducts(prisma, options.products);
        seeded.products = productCount;
      }

      // Seed users
      if (options.users && options.users > 0) {
        const userCount = await this.seedUsers(prisma, options.users);
        seeded.users = userCount;
      }

      // Seed orders
      if (options.orders && options.orders > 0) {
        const orderCount = await this.seedOrders(prisma, options.orders);
        seeded.orders = orderCount;
      }

      return { success: true, seeded };
    } catch (error) {
      return {
        success: false,
        seeded,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async clearDatabase(prisma: any): Promise<void> {
    // Clear in reverse dependency order
    const tables = [
      "OrderItem",
      "Order",
      "CartItem",
      "WishlistItem",
      "Review",
      "ProductVariant",
      "Product",
      "Category",
      "Profile",
    ];

    for (const table of tables) {
      try {
        await prisma[table].deleteMany({});
      } catch (error) {
        console.warn(`Failed to clear ${table}:`, error);
      }
    }
  }

  private async seedCategories(prisma: any, count: number): Promise<number> {
    const categories = [
      { name: "Electronics", slug: "electronics", description: "Electronic devices and accessories" },
      { name: "Clothing", slug: "clothing", description: "Fashion and apparel" },
      { name: "Home & Garden", slug: "home-garden", description: "Home improvement and garden supplies" },
      { name: "Sports", slug: "sports", description: "Sports equipment and gear" },
      { name: "Books", slug: "books", description: "Books and educational materials" },
    ];

    for (const category of categories) {
      await prisma.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: category,
      });
    }

    return categories.length;
  }

  private async seedProducts(prisma: any, count: number): Promise<number> {
    const categories = await prisma.category.findMany();
    let created = 0;

    for (let i = 0; i < count; i++) {
      const category = categories[i % categories.length];
      await prisma.product.create({
        data: {
          name: `Product ${i + 1}`,
          slug: `product-${i + 1}`,
          description: `Description for product ${i + 1}`,
          price: Math.floor(Math.random() * 1000) + 10,
          categoryId: category.id,
          status: "active",
          images: [`https://via.placeholder.com/400?text=Product+${i + 1}`],
        },
      });
      created++;
    }

    return created;
  }

  private async seedUsers(prisma: any, count: number): Promise<number> {
    let created = 0;

    for (let i = 0; i < count; i++) {
      await prisma.profile.create({
        data: {
          email: `user${i + 1}@example.com`,
          firstName: `User`,
          lastName: `${i + 1}`,
        },
      });
      created++;
    }

    return created;
  }

  private async seedOrders(prisma: any, count: number): Promise<number> {
    const users = await prisma.profile.findMany();
    const products = await prisma.product.findMany();
    let created = 0;

    for (let i = 0; i < count; i++) {
      const user = users[i % users.length];
      const product = products[i % products.length];

      await prisma.order.create({
        data: {
          profileId: user.id,
          status: "confirmed",
          total: product.price,
          items: {
            create: {
              productId: product.id,
              quantity: 1,
              price: product.price,
            },
          },
        },
      });
      created++;
    }

    return created;
  }
}

export const seedDataManager = new SeedDataManager();
