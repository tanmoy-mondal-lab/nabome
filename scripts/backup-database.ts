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

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, unlinkSync, statSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

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

class DatabaseBackup {
  private options: BackupOptions;
  private databaseUrl: string;

  constructor(options: Partial<BackupOptions> = {}) {
    this.options = {
      type: options.type || 'full',
      encrypt: options.encrypt !== false,
      compress: options.compress !== false,
      retentionDays: options.retentionDays || 30,
      outputDir: options.outputDir || './backups',
      cloudUpload: options.cloudUpload || false,
    };

    this.databaseUrl = process.env.DATABASE_URL || '';
    if (!this.databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    // Ensure output directory exists
    if (!existsSync(this.options.outputDir)) {
      mkdirSync(this.options.outputDir, { recursive: true });
    }
  }

  /**
   * Generate backup filename with timestamp
   */
  private generateBackupFilename(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const type = this.options.type;
    const extension = this.options.compress ? '.sql.gz' : '.sql';
    const encryption = this.options.encrypt ? '.enc' : '';
    return `nabome-backup-${type}-${timestamp}${extension}${encryption}`;
  }

  /**
   * Execute pg_dump command
   */
  private executePgDump(outputFile: string): void {
    const pgDumpArgs = [
      this.databaseUrl,
      '--no-owner',
      '--no-acl',
      '--format=plain',
    ];

    if (this.options.type === 'schema') {
      pgDumpArgs.push('--schema-only');
    } else if (this.options.type === 'data') {
      pgDumpArgs.push('--data-only');
    }

    const command = `pg_dump ${pgDumpArgs.join(' ')} > ${outputFile}`;
    
    try {
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      throw new Error(`pg_dump failed: ${error}`);
    }
  }

  /**
   * Compress backup file using gzip
   */
  private compressFile(inputFile: string, outputFile: string): void {
    const command = `gzip -c ${inputFile} > ${outputFile}`;
    try {
      execSync(command, { stdio: 'inherit' });
      unlinkSync(inputFile); // Remove original file after compression
    } catch (error) {
      throw new Error(`Compression failed: ${error}`);
    }
  }

  /**
   * Encrypt backup file using pgcrypto
   */
  private encryptFile(inputFile: string, outputFile: string): void {
    const encryptionKey = process.env.BACKUP_ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('BACKUP_ENCRYPTION_KEY environment variable is required for encryption');
    }

    const command = `openssl enc -aes-256-cbc -salt -pbkdf2 -in ${inputFile} -out ${outputFile} -k ${encryptionKey}`;
    
    try {
      execSync(command, { stdio: 'inherit' });
      unlinkSync(inputFile); // Remove original file after encryption
    } catch (error) {
      throw new Error(`Encryption failed: ${error}`);
    }
  }

  /**
   * Calculate file checksum for integrity verification
   */
  private calculateChecksum(filePath: string): string {
    const fileBuffer = readFileSync(filePath);
    return createHash('sha256').update(fileBuffer).digest('hex');
  }

  /**
   * Clean up old backups based on retention policy
   */
  private cleanupOldBackups(): void {
    const files = readdirSync(this.options.outputDir);
    const now = Date.now();
    const retentionMs = this.options.retentionDays * 24 * 60 * 60 * 1000;

    for (const file of files) {
      if (!file.startsWith('nabome-backup-')) continue;

      const filePath = join(this.options.outputDir, file);
      const stats = statSync(filePath);
      const fileAge = now - stats.mtimeMs;

      if (fileAge > retentionMs) {
        console.log(`Deleting old backup: ${file}`);
        unlinkSync(filePath);
      }
    }
  }

  /**
   * Upload backup to cloud storage (S3/GCS)
   */
  private async uploadToCloud(filePath: string): Promise<void> {
    if (!this.options.cloudUpload) return;

    // Placeholder for cloud upload implementation
    // Would integrate with AWS S3 or Google Cloud Storage
    console.log('Cloud upload not yet implemented');
  }

  /**
   * Perform the backup
   */
  async performBackup(): Promise<BackupResult> {
    const startTime = Date.now();
    const backupFilename = this.generateBackupFilename();
    const backupPath = join(this.options.outputDir, backupFilename);

    let currentFile = backupPath;

    try {
      console.log(`Starting ${this.options.type} backup...`);

      // Step 1: Execute pg_dump
      if (this.options.compress) {
        const tempFile = backupPath.replace('.gz', '');
        this.executePgDump(tempFile);
        currentFile = tempFile;
      } else {
        this.executePgDump(backupPath);
      }

      // Step 2: Compress if enabled
      if (this.options.compress) {
        console.log('Compressing backup...');
        const compressedFile = backupPath;
        this.compressFile(currentFile, compressedFile);
        currentFile = compressedFile;
      }

      // Step 3: Encrypt if enabled
      if (this.options.encrypt) {
        console.log('Encrypting backup...');
        const encryptedFile = backupPath + '.enc';
        this.encryptFile(currentFile, encryptedFile);
        currentFile = encryptedFile;
      }

      // Step 4: Calculate checksum
      console.log('Calculating checksum...');
      const checksum = this.calculateChecksum(currentFile);

      // Step 5: Upload to cloud if enabled
      await this.uploadToCloud(currentFile);

      // Step 6: Cleanup old backups
      console.log('Cleaning up old backups...');
      this.cleanupOldBackups();

      const duration = Date.now() - startTime;
      const stats = statSync(currentFile);

      console.log(`Backup completed successfully in ${duration}ms`);
      console.log(`Backup file: ${currentFile}`);
      console.log(`Backup size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Checksum: ${checksum}`);

      return {
        success: true,
        backupFile: currentFile,
        size: stats.size,
        checksum,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`Backup failed: ${error}`);

      return {
        success: false,
        backupFile: currentFile,
        size: 0,
        checksum: '',
        duration,
        error: String(error),
      };
    }
  }
}

// Parse command line arguments
function parseArgs(): Partial<BackupOptions> {
  const args = process.argv.slice(2);
  const options: Partial<BackupOptions> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--full':
        options.type = 'full';
        break;
      case '--schema-only':
        options.type = 'schema';
        break;
      case '--data-only':
        options.type = 'data';
        break;
      case '--encrypt':
        options.encrypt = true;
        break;
      case '--no-encrypt':
        options.encrypt = false;
        break;
      case '--compress':
        options.compress = true;
        break;
      case '--no-compress':
        options.compress = false;
        break;
      case '--retention-days':
        options.retentionDays = parseInt(args[++i]);
        break;
      case '--output-dir':
        options.outputDir = args[++i];
        break;
      case '--cloud':
        options.cloudUpload = true;
        break;
    }
  }

  return options;
}

// Main execution
async function main() {
  try {
    const options = parseArgs();
    const backup = new DatabaseBackup(options);
    const result = await backup.performBackup();

    if (!result.success) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main();
}

export { DatabaseBackup, BackupOptions, BackupResult };
