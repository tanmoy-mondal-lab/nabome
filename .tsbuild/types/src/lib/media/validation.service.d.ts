/**
 * Media Management Module - Validation Service
 *
 * This service centralizes all validation logic for media uploads.
 * No validation logic should be duplicated elsewhere in the application.
 */
import type { FileTypeConfig, ValidationResult, MediaType } from "./media.types";
/**
 * Gets the file type configuration for a given MIME type
 *
 * @param mimeType The MIME type to look up
 * @returns The file type configuration or null if not found
 */
export declare function getFileTypeConfig(mimeType: string): FileTypeConfig | null;
/**
 * Validates a file for upload
 * Checks MIME type, file size, and basic file properties
 *
 * @param file The file to validate
 * @returns Validation result with error details if invalid
 */
export declare function validateFile(file: File): ValidationResult;
/**
 * Validates the actual file content against the declared MIME type
 * This prevents file type spoofing attacks
 *
 * @param file The file to validate
 * @param declaredMimeType The declared MIME type
 * @returns Validation result with error details if invalid
 */
export declare function validateFileContent(file: File, declaredMimeType: string): Promise<ValidationResult>;
/**
 * Validates image dimensions
 *
 * @param width The image width
 * @param height The image height
 * @param minWidth Optional minimum width
 * @param maxWidth Optional maximum width
 * @param minHeight Optional minimum height
 * @param maxHeight Optional maximum height
 * @returns Validation result with error details if invalid
 */
export declare function validateImageDimensions(width: number, height: number, minWidth?: number, maxWidth?: number, minHeight?: number, maxHeight?: number): ValidationResult;
/**
 * Validates the number of files in an upload batch
 *
 * @param fileCount The number of files to upload
 * @returns Validation result with error details if invalid
 */
export declare function validateUploadCount(fileCount: number): ValidationResult;
/**
 * Validates the number of media items for an entity
 *
 * @param currentCount The current number of media items
 * @param newCount The number of new items to add
 * @param mediaType The type of media (image, video, document)
 * @returns Validation result with error details if invalid
 */
export declare function validateEntityMediaCount(currentCount: number, newCount: number, mediaType: MediaType): ValidationResult;
/**
 * Validates an image file specifically
 *
 * @param file The file to validate
 * @returns Validation result with error details if invalid
 */
export declare function validateImageFile(file: File): ValidationResult;
/**
 * Validates a video file specifically
 *
 * @param file The file to validate
 * @returns Validation result with error details if invalid
 */
export declare function validateVideoFile(file: File): ValidationResult;
/**
 * Validates a document file specifically
 *
 * @param file The file to validate
 * @returns Validation result with error details if invalid
 */
export declare function validateDocumentFile(file: File): ValidationResult;
/**
 * Validates multiple files at once
 *
 * @param files The files to validate
 * @returns Validation result with error details if any file is invalid
 */
export declare function validateFiles(files: File[]): Promise<ValidationResult>;
/**
 * Throws an error if validation fails
 * This is a convenience method for use in service functions
 *
 * @param result The validation result
 * @throws InvalidFileError, FileSizeError, UnsupportedTypeError, etc.
 */
export declare function throwIfInvalid(result: ValidationResult): void;
