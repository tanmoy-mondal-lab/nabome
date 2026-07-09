/**
 * Announcements seed module
 * Seeds announcement bars
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';

export const announcementsModule: SeedModule = {
  name: 'announcements',
  dependsOn: [],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let count = 0;

    try {
      const announcements = [
        {
          text: 'Free shipping on all orders above ₹1000!',
          linkUrl: '/shipping',
          linkText: 'Learn More',
          bgColor: '#FF6B6B',
          textColor: '#FFFFFF',
          position: 'top' as const,
          isActive: true,
        },
        {
          text: 'New Summer Collection 2024 - Shop Now',
          linkUrl: '/collections/summer-2024',
          linkText: 'Shop Now',
          bgColor: '#4ECDC4',
          textColor: '#FFFFFF',
          position: 'top' as const,
          isActive: true,
        },
        {
          text: 'Festival Special - Up to 50% Off on selected items',
          linkUrl: '/sale',
          linkText: 'View Sale',
          bgColor: '#FFD93D',
          textColor: '#000000',
          position: 'top' as const,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          isActive: true,
        },
        {
          text: 'Welcome to নবME - Your destination for handcrafted fashion',
          linkUrl: '/about',
          linkText: 'About Us',
          bgColor: '#6C5CE7',
          textColor: '#FFFFFF',
          position: 'bottom' as const,
          isActive: true,
        },
      ];

      for (const announcement of announcements) {
        const existing = await context.prisma.announcementBar.findFirst({
          where: {
            text: announcement.text,
            position: announcement.position,
          },
        });

        if (existing) {
          await context.prisma.announcementBar.update({
            where: { id: existing.id },
            data: {
              linkUrl: announcement.linkUrl,
              linkText: announcement.linkText,
              bgColor: announcement.bgColor,
              textColor: announcement.textColor,
              isActive: announcement.isActive,
              startDate: announcement.startDate,
              endDate: announcement.endDate,
            },
          });
        } else {
          await context.prisma.announcementBar.create({
            data: announcement,
          });
        }
        count++;
      }

      context.logger.success(`Seeded ${count} announcement bars`);
      
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

registry.register(announcementsModule);
