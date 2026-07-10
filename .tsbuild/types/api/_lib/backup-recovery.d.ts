import type { Env } from "./env";
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
export declare class BackupRecoveryService {
    private env;
    constructor(env: Env);
    createDatabaseBackup(): Promise<BackupResult>;
    createMediaBackup(): Promise<BackupResult>;
    createConfigurationBackup(): Promise<BackupResult>;
    createFullBackup(config: BackupConfig): Promise<BackupResult[]>;
    restoreDatabase(backupData: Record<string, unknown[]>): Promise<RestoreResult>;
    restoreMedia(backupData: Record<string, unknown>): Promise<RestoreResult>;
    restoreConfiguration(backupData: Record<string, unknown>): Promise<RestoreResult>;
    verifyBackup(backupData: Record<string, unknown>): Promise<boolean>;
    getBackupHistory(): Promise<BackupResult[]>;
    cleanupOldBackups(retentionDays: number): Promise<number>;
}
export declare function getBackupService(env: Env): BackupRecoveryService;
