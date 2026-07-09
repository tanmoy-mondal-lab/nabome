/**
 * Footer seed module
 * Seeds footer sections and columns
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';

export const footerModule: SeedModule = {
  name: 'footer',
  dependsOn: [],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let count = 0;

    try {
      const footerSections = [
        {
          column: 1,
          title: 'Company',
          contentType: 'links',
          content: {
            links: [
              { label: 'About Us', url: '/about' },
              { label: 'Careers', url: '/careers' },
              { label: 'Press', url: '/press' },
              { label: 'Blog', url: '/blog' },
            ],
          },
          isActive: true,
        },
        {
          column: 2,
          title: 'Support',
          contentType: 'links',
          content: {
            links: [
              { label: 'Help Center', url: '/help' },
              { label: 'Contact Us', url: '/contact' },
              { label: 'FAQ', url: '/faq' },
              { label: 'Shipping Info', url: '/shipping' },
              { label: 'Returns', url: '/returns' },
            ],
          },
          isActive: true,
        },
        {
          column: 3,
          title: 'Legal',
          contentType: 'links',
          content: {
            links: [
              { label: 'Privacy Policy', url: '/privacy' },
              { label: 'Terms of Service', url: '/terms' },
              { label: 'Cookie Policy', url: '/cookies' },
              { label: 'GDPR', url: '/gdpr' },
            ],
          },
          isActive: true,
        },
        {
          column: 4,
          title: 'Account',
          contentType: 'links',
          content: {
            links: [
              { label: 'My Account', url: '/account' },
              { label: 'Orders', url: '/account/orders' },
              { label: 'Wishlist', url: '/account/wishlist' },
              { label: 'Addresses', url: '/account/addresses' },
            ],
          },
          isActive: true,
        },
        {
          column: 5,
          title: 'Contact',
          contentType: 'contact',
          content: {
            email: 'support@nabome.com',
            phone: '+91 98765 43210',
            address: '123 Fashion Street, Bangalore, Karnataka 560001',
          },
          isActive: true,
        },
      ];

      for (const section of footerSections) {
        const existing = await context.prisma.footerSection.findFirst({
          where: { column: section.column },
        });

        if (existing) {
          await context.prisma.footerSection.update({
            where: { id: existing.id },
            data: {
              title: section.title,
              contentType: section.contentType,
              content: section.content,
              isActive: section.isActive,
            },
          });
        } else {
          await context.prisma.footerSection.create({
            data: section,
          });
        }
        count++;
      }

      context.logger.success(`Seeded ${count} footer sections`);
      
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

registry.register(footerModule);
