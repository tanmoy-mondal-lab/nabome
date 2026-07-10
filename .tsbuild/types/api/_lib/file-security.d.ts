export interface FileValidationResult {
    valid: boolean;
    error?: string;
}
/**
 * Validate file upload for security
 */
export declare function validateFileUpload(file: File, options?: {
    allowedTypes?: readonly string[];
    maxSize?: number;
    checkExtension?: boolean;
}): FileValidationResult;
/**
 * Validate image file
 */
export declare function validateImageFile(file: File): FileValidationResult;
/**
 * Validate video file
 */
export declare function validateVideoFile(file: File): FileValidationResult;
/**
 * Validate document file
 */
export declare function validateDocumentFile(file: File): FileValidationResult;
/**
 * Sanitize filename
 */
export declare function sanitizeFileName(fileName: string): string;
