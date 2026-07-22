// ─────────────────────────────────────────────────────────────
// BACKUP & RECOVERY ARCHITECTURE
// ─────────────────────────────────────────────────────────────
// Database backup, media backup, configuration backup, restore process
// ─────────────────────────────────────────────────────────────

import { logger } from "./logger";
import { getPrisma } from "./prisma";
import type { PrismaClient } from "@prisma/client";
import type { Env } from "./env";

type DynamicPrismaTable = {
  [K in keyof PrismaClient]: PrismaClient[K] extends {
    findMany: (...args: unknown[]) => Promise<unknown>;
    deleteMany: (...args: unknown[]) => Promise<unknown>;
    createMany: (...args: unknown[]) => Promise<unknown>;
  } ? PrismaClient[K] : never;
}[keyof PrismaClient];

// Dynamic table access helper - cast prisma to access tables by string name
function tableAccess(prisma: PrismaClient): Record<string, DynamicPrismaTable> {
  return prisma as unknown as Record<string, DynamicPrismaTable>;
}

export interface BackupConfig {
  database: boolean;
  media: boolean;
  configuration: boolean;
  retentionDays: number;
  compression: boolean;
}

export interface BackupResult {
  success: boolean;
  timestamp: string;
  type: 'database' | 'media' | 'configuration' | 'full';
  size?: number;
  duration?: number;
  location?: string;
  error?: string;
}

export interface RestoreResult {
  success: boolean;
  timestamp: string;
  type: 'database' | 'media' | 'configuration' | 'full';
  duration?: number;
  error?: string;
}

export class BackupRecoveryService {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  async createDatabaseBackup(): Promise<BackupResult> {
    const startTime = Date.now();
    logger.info("Starting database backup");

    try {
      const prisma = getPrisma(this.env);
      
      // Get all data from critical tables
      const tables = [
        'profiles',
        'auth_sessions',
        'products',
        'product_variants',
        'orders',
        'order_items',
        'carts',
        'cart_items',
        'categories',
        'brands',
        'collections',
        'coupons',
        'reviews',
        'notifications',
        'support_tickets',
        'site_settings',
        'homepage_sections',
        'navigation_items',
        'footer_items',
        'announcements',
      ];

      const backupData: Record<string, unknown[]> = {};

      for (const table of tables) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data = await (tableAccess(prisma) as any)[table].findMany();
          backupData[table] = data;
          logger.debug(`Backed up table: ${table}`, { count: data.length });
        } catch (error) {
          logger.warn(`Failed to backup table: ${table}`, { error });
        }
      }

      const backupJson = JSON.stringify(backupData);
      const size = Buffer.byteLength(backupJson);
      const duration = Date.now() - startTime;

      // In production, this would upload to Cloudflare R2 or similar
      const backupLocation = `backups/database/${Date.now()}.json`;

      logger.info("Database backup completed", { 
        size, 
        duration, 
        location: backupLocation,
        tables: Object.keys(backupData).length 
      });

      return {
        success: true,
        timestamp: new Date().toISOString(),
        type: 'database',
        size,
        duration,
        location: backupLocation,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error("Database backup failed", { error: errorMessage });
      
      return {
        success: false,
        timestamp: new Date().toISOString(),
        type: 'database',
        duration,
        error: errorMessage,
      };
    }
  }

  async createMediaBackup(): Promise<BackupResult> {
    const startTime = Date.now();
    logger.info("Starting media backup");

    try {
      const prisma = getPrisma(this.env);
      
      // Backup media metadata from database
      const mediaAssets = await prisma.media_assets.findMany();

      const backupData = {
        mediaAssets,
      };

      const backupJson = JSON.stringify(backupData);
      const size = Buffer.byteLength(backupJson);
      const duration = Date.now() - startTime;

      // In production, this would sync media assets to backup storage
      const backupLocation = `backups/media/${Date.now()}.json`;

      logger.info("Media backup completed", { 
        size, 
        duration, 
        location: backupLocation,
        assets: mediaAssets.length
      });

      return {
        success: true,
        timestamp: new Date().toISOString(),
        type: 'media',
        size,
        duration,
        location: backupLocation,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error("Media backup failed", { error: errorMessage });
      
      return {
        success: false,
        timestamp: new Date().toISOString(),
        type: 'media',
        duration,
        error: errorMessage,
      };
    }
  }

  async createConfigurationBackup(): Promise<BackupResult> {
    const startTime = Date.now();
    logger.info("Starting configuration backup");

    try {
      const prisma = getPrisma(this.env);
      
      // Backup configuration data
      const siteSettings = await prisma.site_settings.findMany();
      const navigationMenus = await prisma.navigation_menus.findMany();
      const homepageSections = await prisma.homepage_sections.findMany();
      const announcementBars = await prisma.announcement_bars.findMany();

      const backupData = {
        siteSettings,
        navigationMenus,
        homepageSections,
        announcementBars,
      };

      const backupJson = JSON.stringify(backupData);
      const size = Buffer.byteLength(backupJson);
      const duration = Date.now() - startTime;

      const backupLocation = `backups/configuration/${Date.now()}.json`;

      logger.info("Configuration backup completed", { 
        size, 
        duration, 
        location: backupLocation 
      });

      return {
        success: true,
        timestamp: new Date().toISOString(),
        type: 'configuration',
        size,
        duration,
        location: backupLocation,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error("Configuration backup failed", { error: errorMessage });
      
      return {
        success: false,
        timestamp: new Date().toISOString(),
        type: 'configuration',
        duration,
        error: errorMessage,
      };
    }
  }

  async createFullBackup(config: BackupConfig): Promise<BackupResult[]> {
    logger.info("Starting full backup", { database: config.database, media: config.media, configuration: config.configuration });

    const results: BackupResult[] = [];

    if (config.database) {
      results.push(await this.createDatabaseBackup());
    }

    if (config.media) {
      results.push(await this.createMediaBackup());
    }

    if (config.configuration) {
      results.push(await this.createConfigurationBackup());
    }

    const successCount = results.filter(r => r.success).length;
    logger.info("Full backup completed", { 
      total: results.length, 
      successful: successCount,
      failed: results.length - successCount
    });

    return results;
  }

  async restoreDatabase(backupData: Record<string, unknown[]>): Promise<RestoreResult> {
    const startTime = Date.now();
    logger.info("Starting database restore");

    try {
      const prisma = getPrisma(this.env);

      for (const [table, data] of Object.entries(backupData)) {
        try {
          logger.info(`Restoring table: ${table}`, { count: data.length });
          
          // Clear existing data
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (tableAccess(prisma) as any)[table].deleteMany({});
          
          // Restore data
          if (data.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (tableAccess(prisma) as any)[table].createMany({
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data: data as any,
              skipDuplicates: true,
            });
          }
          
          logger.info(`Restored table: ${table}`, { count: data.length });
        } catch (error) {
          logger.error(`Failed to restore table: ${table}`, { error });
          throw error;
        }
      }

      const duration = Date.now() - startTime;

      logger.info("Database restore completed", { 
        duration,
        tables: Object.keys(backupData).length
      });

      return {
        success: true,
        timestamp: new Date().toISOString(),
        type: 'database',
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error("Database restore failed", { error: errorMessage });
      
      return {
        success: false,
        timestamp: new Date().toISOString(),
        type: 'database',
        duration,
        error: errorMessage,
      };
    }
  }

  async restoreMedia(backupData: Record<string, unknown>): Promise<RestoreResult> {
    const startTime = Date.now();
    logger.info("Starting media restore");

    try {
      const prisma = getPrisma(this.env);

      // Restore media metadata
      if (backupData.mediaAssets) {
        await prisma.media_assets.deleteMany({});
        await prisma.media_assets.createMany({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: backupData.mediaAssets as any,
          skipDuplicates: true,
        });
      }

      const duration = Date.now() - startTime;

      logger.info("Media restore completed", { duration });

      return {
        success: true,
        timestamp: new Date().toISOString(),
        type: 'media',
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error("Media restore failed", { error: errorMessage });
      
      return {
        success: false,
        timestamp: new Date().toISOString(),
        type: 'media',
        duration,
        error: errorMessage,
      };
    }
  }

  async restoreConfiguration(backupData: Record<string, unknown>): Promise<RestoreResult> {
    const startTime = Date.now();
    logger.info("Starting configuration restore");

    try {
      const prisma = getPrisma(this.env);

      // Restore configuration data
      const tables = [
        'siteSettings',
        'featureFlags',
        'navigationItems',
        'footerItems',
        'homepageSections',
        'announcements',
      ];

      for (const table of tables) {
        if (backupData[table]) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (tableAccess(prisma) as any)[table].deleteMany({});
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (tableAccess(prisma) as any)[table].createMany({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: backupData[table] as any,
            skipDuplicates: true,
          });
        }
      }

      const duration = Date.now() - startTime;

      logger.info("Configuration restore completed", { duration });

      return {
        success: true,
        timestamp: new Date().toISOString(),
        type: 'configuration',
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error("Configuration restore failed", { error: errorMessage });
      
      return {
        success: false,
        timestamp: new Date().toISOString(),
        type: 'configuration',
        duration,
        error: errorMessage,
      };
    }
  }

  async verifyBackup(backupData: Record<string, unknown>): Promise<boolean> {
    try {
      // Verify backup data integrity
      for (const [table, data] of Object.entries(backupData)) {
        if (!Array.isArray(data)) {
          logger.warn(`Invalid backup data for table: ${table}`);
          return false;
        }
        
        // Verify data structure
        if (data.length > 0) {
          const sample = data[0];
          if (typeof sample !== 'object' || sample === null) {
            logger.warn(`Invalid data structure for table: ${table}`);
            return false;
          }
        }
      }

      logger.info("Backup verification passed");
      return true;
    } catch (error) {
      logger.error("Backup verification failed", { error });
      return false;
    }
  }

  async getBackupHistory(): Promise<BackupResult[]> {
    // In production, this would query the backup storage
    // For now, return empty array
    logger.info("Retrieving backup history");
    return [];
  }

  async cleanupOldBackups(retentionDays: number): Promise<number> {
    logger.info("Cleaning up old backups", { retentionDays });
    
    // In production, this would delete old backups from storage
    // For now, return 0
    return 0;
  }
}

// Global backup service instance
let backupService: BackupRecoveryService | null = null;

export function getBackupService(env: Env): BackupRecoveryService {
  if (!backupService) {
    backupService = new BackupRecoveryService(env);
  }
  return backupService;
}
