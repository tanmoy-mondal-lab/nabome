/**
 * Navigation seed module
 * Seeds navigation menus for different locations
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';

export const navigationModule: SeedModule = {
  name: 'navigation',
  dependsOn: [],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let count = 0;

    try {
      // Header navigation
      const headerMenu = {
        name: 'Main Menu',
        location: 'header' as const,
        items: [
          { label: 'New Arrivals', url: '/new-arrivals', order: 1 },
          { label: 'Collections', url: '/collections', order: 2 },
          { label: 'Men', url: '/men', order: 3 },
          { label: 'Women', url: '/women', order: 4 },
          { label: 'Accessories', url: '/accessories', order: 5 },
          { label: 'Sale', url: '/sale', order: 6 },
          { label: 'Lookbook', url: '/lookbook', order: 7 },
        ],
        isActive: true,
      };

      await context.prisma.navigationMenu.upsert({
        where: { name_location: { name: headerMenu.name, location: headerMenu.location } },
        update: { items: headerMenu.items, isActive: headerMenu.isActive },
        create: headerMenu,
      });
      count++;

      // Mobile navigation
      const mobileMenu = {
        name: 'Mobile Menu',
        location: 'mobile' as const,
        items: [
          { label: 'Home', url: '/', order: 1 },
          { label: 'Shop', url: '/shop', order: 2 },
          { label: 'Collections', url: '/collections', order: 3 },
          { label: 'Men', url: '/men', order: 4 },
          { label: 'Women', url: '/women', order: 5 },
          { label: 'Accessories', url: '/accessories', order: 6 },
          { label: 'Sale', url: '/sale', order: 7 },
          { label: 'Account', url: '/account', order: 8 },
        ],
        isActive: true,
      };

      await context.prisma.navigationMenu.upsert({
        where: { name_location: { name: mobileMenu.name, location: mobileMenu.location } },
        update: { items: mobileMenu.items, isActive: mobileMenu.isActive },
        create: mobileMenu,
      });
      count++;

      // Footer navigation
      const footerMenu = {
        name: 'Footer Menu',
        location: 'footer' as const,
        items: [
          { label: 'About Us', url: '/about', order: 1 },
          { label: 'Contact', url: '/contact', order: 2 },
          { label: 'FAQ', url: '/faq', order: 3 },
          { label: 'Shipping', url: '/shipping', order: 4 },
          { label: 'Returns', url: '/returns', order: 5 },
          { label: 'Privacy Policy', url: '/privacy', order: 6 },
          { label: 'Terms of Service', url: '/terms', order: 7 },
        ],
        isActive: true,
      };

      await context.prisma.navigationMenu.upsert({
        where: { name_location: { name: footerMenu.name, location: footerMenu.location } },
        update: { items: footerMenu.items, isActive: footerMenu.isActive },
        create: footerMenu,
      });
      count++;

      // Account navigation (using header location for account menu)
      const accountMenu = {
        name: 'Account Menu',
        location: 'header' as const,
        items: [
          { label: 'My Orders', url: '/account/orders', order: 1 },
          { label: 'Wishlist', url: '/account/wishlist', order: 2 },
          { label: 'Addresses', url: '/account/addresses', order: 3 },
          { label: 'Profile', url: '/account/profile', order: 4 },
          { label: 'Settings', url: '/account/settings', order: 5 },
        ],
        isActive: true,
      };

      await context.prisma.navigationMenu.upsert({
        where: { name_location: { name: accountMenu.name, location: accountMenu.location } },
        update: { items: accountMenu.items, isActive: accountMenu.isActive },
        create: accountMenu,
      });
      count++;

      // Seller navigation (using header location for seller menu)
      const sellerMenu = {
        name: 'Seller Menu',
        location: 'header' as const,
        items: [
          { label: 'Dashboard', url: '/seller/dashboard', order: 1 },
          { label: 'Products', url: '/seller/products', order: 2 },
          { label: 'Orders', url: '/seller/orders', order: 3 },
          { label: 'Analytics', url: '/seller/analytics', order: 4 },
          { label: 'Settings', url: '/seller/settings', order: 5 },
        ],
        isActive: true,
      };

      await context.prisma.navigationMenu.upsert({
        where: { name_location: { name: sellerMenu.name, location: sellerMenu.location } },
        update: { items: sellerMenu.items, isActive: sellerMenu.isActive },
        create: sellerMenu,
      });
      count++;

      // Admin navigation (using header location for admin menu)
      const adminMenu = {
        name: 'Admin Menu',
        location: 'header' as const,
        items: [
          { label: 'Dashboard', url: '/admin/dashboard', order: 1 },
          { label: 'Products', url: '/admin/products', order: 2 },
          { label: 'Orders', url: '/admin/orders', order: 3 },
          { label: 'Customers', url: '/admin/customers', order: 4 },
          { label: 'Sellers', url: '/admin/sellers', order: 5 },
          { label: 'Content', url: '/admin/content', order: 6 },
          { label: 'Settings', url: '/admin/settings', order: 7 },
          { label: 'Analytics', url: '/admin/analytics', order: 8 },
        ],
        isActive: true,
      };

      await context.prisma.navigationMenu.upsert({
        where: { name_location: { name: adminMenu.name, location: adminMenu.location } },
        update: { items: adminMenu.items, isActive: adminMenu.isActive },
        create: adminMenu,
      });
      count++;

      context.logger.success(`Seeded ${count} navigation menus`);
      
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

registry.register(navigationModule);
