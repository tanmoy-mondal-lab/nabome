#!/usr/bin/env tsx
/**
 * Database Restore Script for NABOME
 *
 * This script restores database backups with the following features:
 * - Decrypt backups if encrypted
 * - Decompress backups if compressed
 * - Integrity verification using checksums
 * - Dry-run mode to verify backup before restore
 * - Selective restore (schema or data only)
 *
 * Usage:
 *   npx tsx scripts/restore-database.ts <backup-file> [options]
 *
 * Options:
 *   --dry-run           Verify backup without restoring
 *   --force             Force restore without confirmation
 *   --decrypt-key       Decryption key (if not in env)
 *   --output-dir        Output directory for decrypted/decompressed files
 */
interface RestoreOptions {
    dryRun: boolean;
    force: boolean;
    decryptKey?: string;
    outputDir: string;
    verifyChecksum?: string;
}
interface RestoreResult {
    success: boolean;
    restoredFile: string;
    duration: number;
    error?: string;
}
declare class DatabaseRestore {
    private options;
    private databaseUrl;
    private backupFile;
    constructor(backupFile: string, options?: Partial<RestoreOptions>);
    /**
     * Decrypt backup file
     */
    private decryptFile;
    /**
     * Decompress backup file
     */
    private decompressFile;
    /**
     * Calculate file checksum
     */
    private calculateChecksum;
    /**
     * Verify backup integrity
     */
    private verifyBackup;
    /**
     * Restore database using psql
     */
    private restoreDatabase;
    /**
     * Prompt user for confirmation
     */
    private confirmRestore;
    /**
     * Perform the restore
     */
    performRestore(): Promise<RestoreResult>;
}
export { DatabaseRestore, RestoreOptions, RestoreResult };
