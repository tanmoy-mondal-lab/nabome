import type { Env } from "./env";
export interface MigrationTestResult {
    migrationName: string;
    success: boolean;
    duration: number;
    error?: string;
    warnings?: string[];
}
export declare class MigrationTester {
    testMigration(migrationName: string, env?: Env): Promise<MigrationTestResult>;
    private tableExists;
    private checkForeignKeys;
    rollbackTest(env?: Env): Promise<boolean>;
}
export declare const migrationTester: MigrationTester;
