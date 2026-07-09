/**
 * Seed orchestrator
 * Master seed runner that coordinates all seed modules
 */

import { PrismaClient } from '@prisma/client';
import { getSeedConfig } from './config';
import { verifyEnvironment } from './config/environment';
import { getEnabledModules, validateDependencyGraph } from './config/dependencies';
import { registry } from './shared/registry';
import { logger } from './utils';
import type { SeedContext, SeedResult } from './shared/types';

/**
 * Seed orchestrator class
 */
export class SeedOrchestrator {
  private prisma: PrismaClient;
  private config: any;
  private dependencyResults: Map<string, any> = new Map();

  constructor() {
    this.prisma = new PrismaClient();
    this.config = getSeedConfig();
  }

  /**
   * Run the complete seed process
   */
  async run(): Promise<void> {
    const startTime = Date.now();

    try {
      // Verify environment
      verifyEnvironment();

      // Log configuration
      logger.info(`Seed Preset: ${this.config.preset}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Clear Before Seed: ${this.config.options.clearBeforeSeed}`);
      logger.info(`Use Transactions: ${this.config.options.useTransactions}`);
      logger.info(`Stop On Error: ${this.config.options.stopOnError}`);

      // Validate dependency graph
      const validation = validateDependencyGraph(registry.getMetadata());
      if (!validation.valid) {
        throw new Error(`Invalid dependency graph: ${validation.errors.join(', ')}`);
      }

      // Get execution order
      const executionOrder = getEnabledModules();
      logger.info(`Execution Order: ${executionOrder.join(' → ')}`);

      // Clear database if configured
      if (this.config.options.clearBeforeSeed) {
        await this.clearDatabase();
      }

      // Execute modules in dependency order
      for (const moduleName of executionOrder) {
        await this.executeModule(moduleName);
      }

      // Log summary
      const duration = Date.now() - startTime;
      logger.success(`Completed in ${(duration / 1000).toFixed(2)} seconds`);
      logger.summary();

    } catch (error) {
      logger.error(`Seed failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  /**
   * Execute a single seed module
   */
  private async executeModule(moduleName: string): Promise<void> {
    const module = registry.get(moduleName);

    if (!module) {
      logger.warning(`Module '${moduleName}' not found in registry, skipping`);
      return;
    }

    logger.startModule(moduleName);

    try {
      // Create context
      const context: SeedContext = {
        prisma: this.prisma,
        config: this.config,
        dependencies: this.dependencyResults,
        logger,
      };

      // Execute with or without transaction
      let result: SeedResult;

      if (module.transactional && this.config.options.useTransactions) {
        result = await this.prisma.$transaction(async (tx) => {
          const txContext = { ...context, prisma: tx as any };
          return await module.seed(txContext);
        });
      } else {
        result = await module.seed(context);
      }

      // Store results for dependent modules
      this.dependencyResults.set(moduleName, result);

      // Log success
      logger.endModule(moduleName);

      // Validate if configured
      if (this.config.options.validateData && module.validate) {
        const isValid = await module.validate(context);
        if (!isValid) {
          logger.warning(`Validation failed for module '${moduleName}'`);
        }
      }

    } catch (error) {
      logger.failModule(moduleName, error as Error);

      if (this.config.options.stopOnError) {
        throw error;
      }
    }
  }

  /**
   * Clear database before seeding
   */
  private async clearDatabase(): Promise<void> {
    logger.info('Clearing database...');

    // Delete in reverse dependency order to avoid foreign key violations
    const tablesToDelete = [
      'inventoryMovement',
      'inventoryAlert',
      'relatedProduct',
      'productLabelOnProduct',
      'productTagOnProduct',
      'review',
      'wishlistItem',
      'cartItem',
      'cart',
      'couponRedemption',
      'orderStatusHistory',
      'orderItem',
      'order',
      'productImage',
      'productAttribute',
      'productVariant',
      'product',
      'subcategory',
      'category',
      'collection',
      'lookbookItem',
      'lookbook',
      'pageTemplate',
      'footerSection',
      'navigationMenu',
      'homepageSection',
      'announcementBar',
      'staticPage',
      'contactSubmission',
      'newsletterSubscriber',
      'socialMediaLink',
      'siteSetting',
      'mediaAsset',
      'campaign',
      'coupon',
      'productTag',
      'productLabel',
      'sizeGuide',
      'brand',
      'notification',
      'notificationTemplate',
      'userActionLog',
      'loginAttempt',
      'authSession',
      'analyticsEvent',
      'webhookEvent',
      'returnRequest',
      'refund',
      'supportTicketReply',
      'supportTicket',
      'fAQ',
      'loyaltyTransaction',
      'loyaltyPoints',
      'loyaltyTier',
      'referral',
      'referralCode',
      'giftCard',
      'subscriptionInvoice',
      'subscription',
      'subscriptionPlan',
      'currency',
      'apiKey',
      'verificationAttempt',
      'profile',
    ];

    for (const table of tablesToDelete) {
      try {
        // @ts-ignore - Dynamic table access
        await this.prisma[table].deleteMany({});
      } catch (error) {
        // Table might not exist, ignore
        if (this.config.options.verbose) {
          logger.debug(`Could not clear ${table}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }

    logger.success('Database cleared');
  }

  /**
   * Get Prisma client
   */
  getPrisma(): PrismaClient {
    return this.prisma;
  }

  /**
   * Get seed configuration
   */
  getConfig(): any {
    return this.config;
  }
}

/**
 * Main entry point for seeding
 */
export async function main(): Promise<void> {
  const orchestrator = new SeedOrchestrator();
  await orchestrator.run();
}
