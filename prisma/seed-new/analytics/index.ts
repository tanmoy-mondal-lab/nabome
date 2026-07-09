/**
 * Analytics seed module
 * Seeds analytics event data
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';
import { Prisma } from '@prisma/client';

// Helper function to get random integer in range
function getRandomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to generate random IP address
function generateRandomIP(): string {
  return `${getRandomInRange(1, 255)}.${getRandomInRange(1, 255)}.${getRandomInRange(1, 255)}.${getRandomInRange(1, 255)}`;
}

// Helper function to generate random session ID
function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Analytics event types
const EVENT_TYPES = [
  'page_view',
  'product_view',
  'add_to_cart',
  'remove_from_cart',
  'checkout_start',
  'checkout_complete',
  'search',
  'filter_apply',
  'category_view',
  'collection_view',
  'wishlist_add',
  'wishlist_remove',
];

// Page URLs
const PAGE_URLS = [
  '/',
  '/products',
  '/collections/summer-2024',
  '/categories/women',
  '/categories/men',
  '/about',
  '/contact',
  '/cart',
  '/checkout',
  '/account/orders',
  '/account/wishlist',
];

// User agents
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
];

export const analyticsModule: SeedModule = {
  name: 'analytics',
  dependsOn: ['users', 'products', 'orders'],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let count = 0;

    try {
      context.logger.info('Seeding analytics events...');
      
      // Get profiles
      const profiles = await context.prisma.profile.findMany({
        select: { id: true },
        take: 20, // Limit to 20 profiles for analytics
      });
      
      // Get products for product view events
      const products = await context.prisma.product.findMany({
        where: { isActive: true },
        select: { id: true, slug: true },
        take: 30,
      });
      
      if (profiles.length === 0) {
        context.logger.warn('No profiles found for analytics events');
        return { success: true, count, duration: Date.now() - startTime };
      }
      
      context.logger.info(`Found ${profiles.length} profiles, ${products.length} products`);
      
      // Generate analytics events for the last 30 days
      const TARGET_EVENTS = 500;
      const eventsPerProfile = Math.floor(TARGET_EVENTS / profiles.length);
      
      for (const profile of profiles) {
        // Generate events for this profile
        const eventCount = getRandomInRange(eventsPerProfile - 10, eventsPerProfile + 10);
        const sessionId = generateSessionId();
        
        for (let i = 0; i < eventCount; i++) {
          // Determine event type
          const eventType = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
          
          // Generate page URL based on event type
          let pageUrl = PAGE_URLS[Math.floor(Math.random() * PAGE_URLS.length)];
          
          // Add product-specific URLs for product-related events
          if (eventType === 'product_view' && products.length > 0) {
            const product = products[Math.floor(Math.random() * products.length)];
            pageUrl = `/products/${product.slug}`;
          }
          
          // Generate payload based on event type
          let payload = null;
          if (eventType === 'product_view' && products.length > 0) {
            const product = products[Math.floor(Math.random() * products.length)];
            payload = { productId: product.id };
          } else if (eventType === 'search') {
            payload = { query: ['saree', 'kurta', 'dress', 'shirt', 'traditional'][Math.floor(Math.random() * 5)] };
          } else if (eventType === 'filter_apply') {
            payload = { filters: { category: 'women', priceRange: '1000-5000' } };
          }
          
          // Generate date within last 30 days
          const daysAgo = getRandomInRange(0, 30);
          const hoursAgo = getRandomInRange(0, 23);
          const createdAt = new Date(Date.now() - (daysAgo * 24 + hoursAgo) * 60 * 60 * 1000);
          
          // Randomly assign to profile (60% chance) or anonymous (40% chance)
          const profileId = Math.random() < 0.6 ? profile.id : null;
          
          await context.prisma.analyticsEvent.create({
            data: {
              eventType,
              profileId,
              sessionId,
              payload: payload as Prisma.InputJsonValue,
              pageUrl,
              userAgent: USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
              ipAddress: generateRandomIP(),
              createdAt,
            },
          });
          count++;
        }
      }
      
      // Generate some anonymous events (no profile)
      const anonymousEventCount = getRandomInRange(50, 100);
      for (let i = 0; i < anonymousEventCount; i++) {
        const eventType = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
        const pageUrl = PAGE_URLS[Math.floor(Math.random() * PAGE_URLS.length)];
        
        const daysAgo = getRandomInRange(0, 30);
        const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        
        await context.prisma.analyticsEvent.create({
          data: {
            eventType,
            profileId: null,
            sessionId: generateSessionId(),
            payload: Prisma.JsonNull,
            pageUrl,
            userAgent: USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
            ipAddress: generateRandomIP(),
            createdAt,
          },
        });
        count++;
      }
      
      context.logger.success(`Seeded ${count} analytics events`);
      
      return {
        success: true,
        count,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      context.logger.error('Error seeding analytics events:', error);
      return {
        success: false,
        count,
        duration: Date.now() - startTime,
        error: error as Error,
      };
    }
  },
};

registry.register(analyticsModule);
