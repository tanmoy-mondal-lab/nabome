import type { FileTypeConfig, ValidationResult } from "./types";
declare const ALLOWED_FILE_TYPES: Record<string, FileTypeConfig>;
declare const ALLOWED_MIME_TYPES: string[];
export { ALLOWED_MIME_TYPES, ALLOWED_FILE_TYPES };
export declare function getFileTypeConfig(mimeType: string): FileTypeConfig | null;
export declare function validateFile(file: File): ValidationResult;
export declare function validateFileContent(file: File, _mimeType: string): Promise<ValidationResult>;
export declare function throwIfInvalid(result: ValidationResult): void;
/**
 * Sanitize a folder path to prevent path-traversal attacks.
 * Allows only alphanumeric characters, hyphens, underscores, dots, and single slashes.
 * Rejects '..', absolute paths, and empty segments.
 */
export declare function sanitizeFolderPath(input: string): string;
