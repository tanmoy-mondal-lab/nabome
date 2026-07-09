import type { Env } from "./env";
export interface BackupOptions {
    includeSchema?: boolean;
    includeData?: boolean;
    compress?: boolean;
    encryptionKey?: string;
}
export interface BackupResult {
    success: boolean;
    backupId?: string;
    size?: number;
    duration?: number;
    error?: string;
}
export declare class BackupManager {
    createBackup(options?: BackupOptions, env?: Env): Promise<BackupResult>;
    restoreBackup(backupId: string, _env?: Env): Promise<BackupResult>;
    listBackups(_env?: Env): Promise<string[]>;
    deleteBackup(backupId: string, _env?: Env): Promise<boolean>;
    private getTableNames;
    private getSchema;
    scheduleBackup(interval: number, options?: BackupOptions, env?: Env): Promise<void>;
}
export declare const backupManager: BackupManager;
