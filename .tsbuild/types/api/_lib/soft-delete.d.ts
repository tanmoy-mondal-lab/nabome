import type { Env } from "./env";
export interface SoftDeleteOptions {
    deletedAtField?: string;
    deletedByField?: string;
    userId?: string;
}
export declare class SoftDeleteManager {
    softDelete(table: string, id: string, options?: SoftDeleteOptions, env?: Env): Promise<boolean>;
    restore(table: string, id: string, options?: SoftDeleteOptions, env?: Env): Promise<boolean>;
    permanentDelete(table: string, id: string, env?: Env): Promise<boolean>;
    getDeletedRecords(table: string, options?: SoftDeleteOptions, env?: Env): Promise<any[]>;
    private hasColumn;
}
export declare const softDeleteManager: SoftDeleteManager;
