/**
 * Media Management Module - Validation Service
 * 
 * This service centralizes all validation logic for media uploads.
 * No validation logic should be duplicated elsewhere in the application.
 */

import type { FileTypeConfig, ValidationResult, MediaType } from "./media.types";
import {
  ALLOWED_FILE_TYPES,
  ALLOWED_MIME_TYPES,
  MAX_UPLOAD_SIZE,
  MAX_UPLOAD_COUNT,
  MAX_IMAGES_PER_ENTITY,
  MAX_VIDEOS_PER_ENTITY,
  MAX_DOCUMENTS_PER_ENTITY,
} from "./media.constants";
import {
  FileSizeError,
  UnsupportedTypeError,
  FileContentMismatchError,
  ValidationError,
  UploadLimitError,
  ImageDimensionsError,
} from "./media.errors";

/**
 * Gets the file type configuration for a given MIME type
 * 
 * @param mimeType The MIME type to look up
 * @returns The file type configuration or null if not found
 */
export function getFileTypeConfig(mimeType: string): FileTypeConfig | null {
  return ALLOWED_FILE_TYPES[mimeType] ?? null;
}

/**
 * Validates a file for upload
 * Checks MIME type, file size, and basic file properties
 * 
 * @param file The file to validate
 * @returns Validation result with error details if invalid
 */
export function validateFile(file: File): ValidationResult {
  // Check if file exists
  if (!file) {
    return {
      valid: false,
      error: "No file provided",
      details: { received: file },
    };
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type}. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
      details: { mimeType: file.type, allowedTypes: ALLOWED_MIME_TYPES },
    };
  }

  // Get file type config for size validation
  const config = getFileTypeConfig(file.type);
  if (!config) {
    return {
      valid: false,
      error: `No configuration found for file type: ${file.type}`,
      details: { mimeType: file.type },
    };
  }

  // Check file size based on type
  const maxSize = config.maxSize ?? MAX_UPLOAD_SIZE;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size for ${config.type} is ${maxSize / 1024 / 1024}MB`,
      details: {
        actualSize: file.size,
        maxSize,
        type: config.type,
      },
    };
  }

  return { valid: true };
}

/**
 * Validates the actual file content against the declared MIME type
 * This prevents file type spoofing attacks
 * 
 * @param file The file to validate
 * @param declaredMimeType The declared MIME type
 * @returns Validation result with error details if invalid
 */
export async function validateFileContent(
  file: File,
  declaredMimeType: string
): Promise<ValidationResult> {
  const config = getFileTypeConfig(declaredMimeType);
  if (!config) {
    return {
      valid: false,
      error: "Unsupported file type",
      details: { mimeType: declaredMimeType },
    };
  }

  // Read first 12 bytes for signature validation
  const buffer = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Validate file signature
  const isValidSignature = config.validate(bytes);
  if (!isValidSignature) {
    return {
      valid: false,
      error: "File content does not match declared type",
      details: {
        declaredType: declaredMimeType,
        actualSignature: Array.from(bytes.slice(0, 8))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(" "),
      },
    };
  }

  return { valid: true };
}

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
export function validateImageDimensions(
  width: number,
  height: number,
  minWidth?: number,
  maxWidth?: number,
  minHeight?: number,
  maxHeight?: number
): ValidationResult {
  if (minWidth !== undefined && width < minWidth) {
    return {
      valid: false,
      error: `Image width must be at least ${minWidth}px`,
      details: { width, height, minWidth },
    };
  }

  if (maxWidth !== undefined && width > maxWidth) {
    return {
      valid: false,
      error: `Image width must not exceed ${maxWidth}px`,
      details: { width, height, maxWidth },
    };
  }

  if (minHeight !== undefined && height < minHeight) {
    return {
      valid: false,
      error: `Image height must be at least ${minHeight}px`,
      details: { width, height, minHeight },
    };
  }

  if (maxHeight !== undefined && height > maxHeight) {
    return {
      valid: false,
      error: `Image height must not exceed ${maxHeight}px`,
      details: { width, height, maxHeight },
    };
  }

  return { valid: true };
}

/**
 * Validates the number of files in an upload batch
 * 
 * @param fileCount The number of files to upload
 * @returns Validation result with error details if invalid
 */
export function validateUploadCount(fileCount: number): ValidationResult {
  if (fileCount <= 0) {
    return {
      valid: false,
      error: "At least one file must be provided",
      details: { fileCount },
    };
  }

  if (fileCount > MAX_UPLOAD_COUNT) {
    return {
      valid: false,
      error: `Too many files. Maximum is ${MAX_UPLOAD_COUNT} per upload`,
      details: { fileCount, maxCount: MAX_UPLOAD_COUNT },
    };
  }

  return { valid: true };
}

/**
 * Validates the number of media items for an entity
 * 
 * @param currentCount The current number of media items
 * @param newCount The number of new items to add
 * @param mediaType The type of media (image, video, document)
 * @returns Validation result with error details if invalid
 */
export function validateEntityMediaCount(
  currentCount: number,
  newCount: number,
  mediaType: MediaType
): ValidationResult {
  const totalCount = currentCount + newCount;

  let maxCount: number;
  switch (mediaType) {
    case "image":
      maxCount = MAX_IMAGES_PER_ENTITY;
      break;
    case "video":
      maxCount = MAX_VIDEOS_PER_ENTITY;
      break;
    case "document":
      maxCount = MAX_DOCUMENTS_PER_ENTITY;
      break;
    default:
      maxCount = MAX_UPLOAD_COUNT;
  }

  if (totalCount > maxCount) {
    return {
      valid: false,
      error: `Too many ${mediaType}s. Maximum is ${maxCount} per entity`,
      details: {
        currentCount,
        newCount,
        totalCount,
        maxCount,
        mediaType,
      },
    };
  }

  return { valid: true };
}

/**
 * Validates an image file specifically
 * 
 * @param file The file to validate
 * @returns Validation result with error details if invalid
 */
export function validateImageFile(file: File): ValidationResult {
  const basicValidation = validateFile(file);
  if (!basicValidation.valid) {
    return basicValidation;
  }

  const config = getFileTypeConfig(file.type);
  if (config?.type !== "image") {
    return {
      valid: false,
      error: `File is not an image: ${file.type}`,
      details: { mimeType: file.type },
    };
  }

  return { valid: true };
}

/**
 * Validates a video file specifically
 * 
 * @param file The file to validate
 * @returns Validation result with error details if invalid
 */
export function validateVideoFile(file: File): ValidationResult {
  const basicValidation = validateFile(file);
  if (!basicValidation.valid) {
    return basicValidation;
  }

  const config = getFileTypeConfig(file.type);
  if (config?.type !== "video") {
    return {
      valid: false,
      error: `File is not a video: ${file.type}`,
      details: { mimeType: file.type },
    };
  }

  return { valid: true };
}

/**
 * Validates a document file specifically
 * 
 * @param file The file to validate
 * @returns Validation result with error details if invalid
 */
export function validateDocumentFile(file: File): ValidationResult {
  const basicValidation = validateFile(file);
  if (!basicValidation.valid) {
    return basicValidation;
  }

  const config = getFileTypeConfig(file.type);
  if (config?.type !== "document") {
    return {
      valid: false,
      error: `File is not a document: ${file.type}`,
      details: { mimeType: file.type },
    };
  }

  return { valid: true };
}

/**
 * Validates multiple files at once
 * 
 * @param files The files to validate
 * @returns Validation result with error details if any file is invalid
 */
export async function validateFiles(files: File[]): Promise<ValidationResult> {
  const countValidation = validateUploadCount(files.length);
  if (!countValidation.valid) {
    return countValidation;
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const validation = validateFile(file);
    if (!validation.valid) {
      return {
        valid: false,
        error: `File ${i + 1} is invalid: ${validation.error}`,
        details: { fileIndex: i, fileName: file.name, ...validation.details },
      };
    }

    const contentValidation = await validateFileContent(file, file.type);
    if (!contentValidation.valid) {
      return {
        valid: false,
        error: `File ${i + 1} content validation failed: ${contentValidation.error}`,
        details: { fileIndex: i, fileName: file.name, ...contentValidation.details },
      };
    }
  }

  return { valid: true };
}

/**
 * Throws an error if validation fails
 * This is a convenience method for use in service functions
 * 
 * @param result The validation result
 * @throws InvalidFileError, FileSizeError, UnsupportedTypeError, etc.
 */
export function throwIfInvalid(result: ValidationResult): void {
  if (result.valid) {
    return;
  }

  // Determine the appropriate error type based on the error message
  const error = result.error?.toLowerCase() || "";

  if (error.includes("size") || error.includes("large")) {
    const actualSize = (result.details?.actualSize as number) || 0;
    const maxSize = (result.details?.maxSize as number) || 0;
    throw new FileSizeError(result.error || "File size exceeds limit", actualSize, maxSize);
  }

  if (error.includes("type") || error.includes("unsupported")) {
    const mimeType = (result.details?.mimeType as string) || "unknown";
    throw new UnsupportedTypeError(result.error || "Unsupported file type", mimeType);
  }

  if (error.includes("content") || error.includes("match")) {
    const declaredType = (result.details?.declaredType as string) || "unknown";
    throw new FileContentMismatchError(result.error || "File content mismatch", declaredType);
  }

  if (error.includes("dimension")) {
    const width = (result.details?.width as number) || 0;
    const height = (result.details?.height as number) || 0;
    const requirements = result.details as Record<string, number>;
    throw new ImageDimensionsError(result.error || "Invalid image dimensions", width, height, requirements);
  }

  if (error.includes("count") || error.includes("too many")) {
    const actualCount = (result.details?.fileCount as number) || (result.details?.totalCount as number) || 0;
    const maxCount = (result.details?.maxCount as number) || 0;
    throw new UploadLimitError(result.error || "Upload limit exceeded", actualCount, maxCount);
  }

  // Default to generic validation error
  throw new ValidationError(result.error || "Validation failed", result.details);
}
