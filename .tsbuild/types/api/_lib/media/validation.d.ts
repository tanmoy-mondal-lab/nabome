import type { FileTypeConfig, ValidationResult } from "./types";
declare const ALLOWED_FILE_TYPES: Record<string, FileTypeConfig>;
declare const ALLOWED_MIME_TYPES: string[];
export { ALLOWED_MIME_TYPES, ALLOWED_FILE_TYPES };
export declare function getFileTypeConfig(mimeType: string): FileTypeConfig | null;
export declare function validateFile(file: File): ValidationResult;
export declare function validateFileContent(file: File, _mimeType: string): Promise<ValidationResult>;
export declare function throwIfInvalid(result: ValidationResult): void;
