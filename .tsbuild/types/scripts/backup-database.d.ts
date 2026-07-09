#!/usr/bin/env tsx
/**
 * Database Backup Script for NABOME
 *
 * This script performs automated database backups with the following features:
 * - Full database backup using pg_dump
 * - Backup encryption using pgcrypto
 * - Backup integrity verification
 * - Retention policy (30 days)
 * - Backup to local filesystem and optional cloud storage
 *
 * Usage:
 *   npx tsx scripts/backup-database.ts [options]
 *
 * Options:
 *   --full              Perform full backup (default)
 *   --schema-only       Backup schema only
 *   --data-only         Backup data only
 *   --encrypt           Encrypt backup (default)
 *   --no-encrypt        Skip encryption
 *   --compress          Compress backup (default)
 *   --no-compress       Skip compression
 *   --retention-days    Retention period in days (default: 30)
 *   --output-dir        Output directory (default: ./backups)
 *   --cloud             Upload to cloud storage (S3/GCS)
 */
interface BackupOptions {
    type: 'full' | 'schema' | 'data';
    encrypt: boolean;
    compress: boolean;
    retentionDays: number;
    outputDir: string;
    cloudUpload: boolean;
}
interface BackupResult {
    success: boolean;
    backupFile: string;
    size: number;
    checksum: string;
    duration: number;
    error?: string;
}
declare class DatabaseBackup {
    private options;
    private databaseUrl;
    constructor(options?: Partial<BackupOptions>);
    /**
     * Generate backup filename with timestamp
     */
    private generateBackupFilename;
    /**
     * Execute pg_dump command
     */
    private executePgDump;
    /**
     * Compress backup file using gzip
     */
    private compressFile;
    /**
     * Encrypt backup file using pgcrypto
     */
    private encryptFile;
    /**
     * Calculate file checksum for integrity verification
     */
    private calculateChecksum;
    /**
     * Clean up old backups based on retention policy
     */
    private cleanupOldBackups;
    /**
     * Upload backup to cloud storage (S3/GCS)
     */
    private uploadToCloud;
    /**
     * Perform the backup
     */
    performBackup(): Promise<BackupResult>;
}
export { DatabaseBackup, BackupOptions, BackupResult };
