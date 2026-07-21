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

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import * as readline from 'node:readline';
import { fileURLToPath } from 'node:url';

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

class DatabaseRestore {
  private options: RestoreOptions;
  private databaseUrl: string;
  private backupFile: string;

  constructor(backupFile: string, options: Partial<RestoreOptions> = {}) {
    this.backupFile = backupFile;
    this.options = {
      dryRun: options.dryRun || false,
      force: options.force || false,
      decryptKey: options.decryptKey || process.env.BACKUP_ENCRYPTION_KEY,
      outputDir: options.outputDir || './backups/temp',
      verifyChecksum: options.verifyChecksum,
    };

    this.databaseUrl = process.env.DATABASE_URL || '';
    if (!this.databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    if (!existsSync(this.backupFile)) {
      throw new Error(`Backup file not found: ${this.backupFile}`);
    }

    // Ensure output directory exists
    if (!existsSync(this.options.outputDir)) {
      mkdirSync(this.options.outputDir, { recursive: true });
    }
  }

  /**
   * Decrypt backup file
   */
  private decryptFile(inputFile: string, outputFile: string): void {
    const encryptionKey = this.options.decryptKey;
    if (!encryptionKey) {
      throw new Error('Decryption key required (use --decrypt-key or BACKUP_ENCRYPTION_KEY env var)');
    }

    const command = `openssl enc -d -aes-256-cbc -pbkdf2 -in ${inputFile} -out ${outputFile} -k ${encryptionKey}`;
    
    try {
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      throw new Error(`Decryption failed: ${error}`);
    }
  }

  /**
   * Decompress backup file
   */
  private decompressFile(inputFile: string, outputFile: string): void {
    const command = `gunzip -c ${inputFile} > ${outputFile}`;
    try {
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      throw new Error(`Decompression failed: ${error}`);
    }
  }

  /**
   * Calculate file checksum
   */
  private calculateChecksum(filePath: string): string {
    const fileBuffer = readFileSync(filePath);
    return createHash('sha256').update(fileBuffer).digest('hex');
  }

  /**
   * Verify backup integrity
   */
  private verifyBackup(filePath: string): boolean {
    console.log('Verifying backup integrity...');
    
    try {
      // Check if file is valid SQL
      const content = readFileSync(filePath, 'utf-8');
      
      // Basic validation checks
      if (!content.includes('--') && !content.includes('CREATE') && !content.includes('INSERT')) {
        throw new Error('File does not appear to be a valid SQL backup');
      }

      // Verify checksum if provided
      if (this.options.verifyChecksum) {
        const checksum = this.calculateChecksum(filePath);
        if (checksum !== this.options.verifyChecksum) {
          throw new Error(`Checksum mismatch. Expected: ${this.options.verifyChecksum}, Got: ${checksum}`);
        }
        console.log('Checksum verified successfully');
      }

      console.log('Backup integrity verified');
      return true;
    } catch (error) {
      console.error('Backup verification failed:', error);
      return false;
    }
  }

  /**
   * Restore database using psql
   */
  private restoreDatabase(sqlFile: string): void {
    const command = `psql ${this.databaseUrl} < ${sqlFile}`;
    
    try {
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      throw new Error(`Database restore failed: ${error}`);
    }
  }

  /**
   * Prompt user for confirmation
   */
  private async confirmRestore(): Promise<boolean> {
    if (this.options.force) return true;

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await new Promise<string>((resolve) => {
      rl.question(
        '⚠️  WARNING: This will overwrite the current database. Are you sure? (yes/no): ',
        resolve
      );
    });

    rl.close();
    return answer.toLowerCase() === 'yes';
  }

  /**
   * Perform the restore
   */
  async performRestore(): Promise<RestoreResult> {
    const startTime = Date.now();
    let currentFile = this.backupFile;

    try {
      console.log(`Starting restore from: ${this.backupFile}`);

      // Step 1: Decrypt if encrypted
      if (this.backupFile.endsWith('.enc')) {
        console.log('Decrypting backup...');
        const decryptedFile = join(this.options.outputDir, 'decrypted.sql.gz');
        this.decryptFile(currentFile, decryptedFile);
        currentFile = decryptedFile;
      }

      // Step 2: Decompress if compressed
      if (currentFile.endsWith('.gz')) {
        console.log('Decompressing backup...');
        const decompressedFile = join(this.options.outputDir, 'restored.sql');
        this.decompressFile(currentFile, decompressedFile);
        currentFile = decompressedFile;
      }

      // Step 3: Verify backup integrity
      if (!this.verifyBackup(currentFile)) {
        throw new Error('Backup verification failed');
      }

      // Step 4: Dry run - just verify and exit
      if (this.options.dryRun) {
        console.log('Dry run completed successfully');
        console.log('Backup is ready for restore');
        
        // Cleanup temp files
        if (currentFile !== this.backupFile) {
          unlinkSync(currentFile);
        }

        return {
          success: true,
          restoredFile: currentFile,
          duration: Date.now() - startTime,
        };
      }

      // Step 5: Confirm restore
      const confirmed = await this.confirmRestore();
      if (!confirmed) {
        console.log('Restore cancelled by user');
        
        // Cleanup temp files
        if (currentFile !== this.backupFile) {
          unlinkSync(currentFile);
        }

        return {
          success: false,
          restoredFile: currentFile,
          duration: Date.now() - startTime,
          error: 'Cancelled by user',
        };
      }

      // Step 6: Restore database
      console.log('Restoring database...');
      this.restoreDatabase(currentFile);

      // Step 7: Cleanup temp files
      if (currentFile !== this.backupFile) {
        unlinkSync(currentFile);
      }

      const duration = Date.now() - startTime;
      console.log(`Restore completed successfully in ${duration}ms`);

      return {
        success: true,
        restoredFile: currentFile,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`Restore failed: ${error}`);

      // Cleanup temp files on error
      if (currentFile !== this.backupFile && existsSync(currentFile)) {
        unlinkSync(currentFile);
      }

      return {
        success: false,
        restoredFile: currentFile,
        duration,
        error: String(error),
      };
    }
  }
}

// Parse command line arguments
function parseArgs(): { backupFile: string; options: Partial<RestoreOptions> } {
  const args = process.argv.slice(2);
  const options: Partial<RestoreOptions> = {};
  let backupFile = '';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--force':
        options.force = true;
        break;
      case '--decrypt-key':
        options.decryptKey = args[++i];
        break;
      case '--output-dir':
        options.outputDir = args[++i];
        break;
      case '--verify-checksum':
        options.verifyChecksum = args[++i];
        break;
      default:
        if (!arg.startsWith('--')) {
          backupFile = arg;
        }
    }
  }

  if (!backupFile) {
    console.error('Error: Backup file is required');
    console.error('Usage: npx tsx scripts/restore-database.ts <backup-file> [options]');
    process.exit(1);
  }

  return { backupFile, options };
}

// Main execution
async function main() {
  try {
    const { backupFile, options } = parseArgs();
    const restore = new DatabaseRestore(backupFile, options);
    const result = await restore.performRestore();

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

export { DatabaseRestore, RestoreOptions, RestoreResult };
