/**
 * Media Management Module - Constants
 * 
 * This file contains all configuration constants for the media management system.
 * Centralized configuration prevents magic strings and makes the system easier to maintain.
 */

import type { FileTypeConfig } from "./media.types";

/**
 * Root folder for all Cloudinary uploads
 * All media assets must be stored under this hierarchy
 */
export const ROOT_FOLDER = "nabome";

/**
 * Maximum file size for uploads (20MB)
 */
export const MAX_UPLOAD_SIZE = 20 * 1024 * 1024;

/**
 * Maximum file size for images (10MB)
 */
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

/**
 * Maximum file size for videos (100MB)
 */
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

/**
 * Maximum file size for documents (5MB)
 */
export const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024;

/**
 * Maximum number of files per upload batch
 */
export const MAX_UPLOAD_COUNT = 10;

/**
 * Maximum number of images per entity
 */
export const MAX_IMAGES_PER_ENTITY = 20;

/**
 * Maximum number of videos per entity
 */
export const MAX_VIDEOS_PER_ENTITY = 5;

/**
 * Maximum number of documents per entity
 */
export const MAX_DOCUMENTS_PER_ENTITY = 10;

/**
 * File signature markers for validation
 */
const FTYP_MARKER = [0x66, 0x74, 0x79, 0x70];

/**
 * Allowed file types with their validation configurations
 */
export const ALLOWED_FILE_TYPES: Record<string, FileTypeConfig> = {
  // Images
  "image/jpeg": {
    type: "image",
    resourceType: "image",
    validate: (b) => b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF,
    maxSize: MAX_IMAGE_SIZE,
  },
  "image/png": {
    type: "image",
    resourceType: "image",
    validate: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47,
    maxSize: MAX_IMAGE_SIZE,
  },
  "image/webp": {
    type: "image",
    resourceType: "image",
    validate: (b) =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
    maxSize: MAX_IMAGE_SIZE,
  },
  "image/avif": {
    type: "image",
    resourceType: "image",
    validate: (b) =>
      b[4] === FTYP_MARKER[0] && b[5] === FTYP_MARKER[1] &&
      b[6] === FTYP_MARKER[2] && b[7] === FTYP_MARKER[3],
    maxSize: MAX_IMAGE_SIZE,
  },
  "image/gif": {
    type: "image",
    resourceType: "image",
    validate: (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38,
    maxSize: MAX_IMAGE_SIZE,
  },
  "image/bmp": {
    type: "image",
    resourceType: "image",
    validate: (b) => b[0] === 0x42 && b[1] === 0x4D,
    maxSize: MAX_IMAGE_SIZE,
  },
  "image/tiff": {
    type: "image",
    resourceType: "image",
    validate: (b) =>
      (b[0] === 0x49 && b[1] === 0x49 && b[2] === 0x2A && b[3] === 0x00) ||
      (b[0] === 0x4D && b[1] === 0x4D && b[2] === 0x00 && b[3] === 0x2A),
    maxSize: MAX_IMAGE_SIZE,
  },

  // Videos
  "video/mp4": {
    type: "video",
    resourceType: "video",
    validate: (b) =>
      b[4] === FTYP_MARKER[0] && b[5] === FTYP_MARKER[1] &&
      b[6] === FTYP_MARKER[2] && b[7] === FTYP_MARKER[3],
    maxSize: MAX_VIDEO_SIZE,
  },
  "video/webm": {
    type: "video",
    resourceType: "video",
    validate: (b) => b[0] === 0x1A && b[1] === 0x45 && b[2] === 0xDF && b[3] === 0xA3,
    maxSize: MAX_VIDEO_SIZE,
  },
  "video/quicktime": {
    type: "video",
    resourceType: "video",
    validate: (b) =>
      b[4] === FTYP_MARKER[0] && b[5] === FTYP_MARKER[1] &&
      b[6] === FTYP_MARKER[2] && b[7] === FTYP_MARKER[3],
    maxSize: MAX_VIDEO_SIZE,
  },
  "video/x-msvideo": {
    type: "video",
    resourceType: "video",
    validate: (b) => b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46,
    maxSize: MAX_VIDEO_SIZE,
  },
  "video/x-matroska": {
    type: "video",
    resourceType: "video",
    validate: (b) => b[0] === 0x1A && b[1] === 0x45 && b[2] === 0xDF && b[3] === 0xA3,
    maxSize: MAX_VIDEO_SIZE,
  },

  // Documents
  "application/pdf": {
    type: "document",
    resourceType: "raw",
    validate: (b) => b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46,
    maxSize: MAX_DOCUMENT_SIZE,
  },
};

/**
 * Allowed MIME types for uploads
 */
export const ALLOWED_MIME_TYPES = Object.keys(ALLOWED_FILE_TYPES);

/**
 * Allowed image MIME types
 */
export const ALLOWED_IMAGE_TYPES = ALLOWED_MIME_TYPES.filter(
  (type) => ALLOWED_FILE_TYPES[type].type === "image"
);

/**
 * Allowed video MIME types
 */
export const ALLOWED_VIDEO_TYPES = ALLOWED_MIME_TYPES.filter(
  (type) => ALLOWED_FILE_TYPES[type].type === "video"
);

/**
 * Allowed document MIME types
 */
export const ALLOWED_DOCUMENT_TYPES = ALLOWED_MIME_TYPES.filter(
  (type) => ALLOWED_FILE_TYPES[type].type === "document"
);

/**
 * Cloudinary API timeout in milliseconds
 */
export const CLOUDINARY_UPLOAD_TIMEOUT = 30000;

/**
 * Cloudinary destroy timeout in milliseconds
 */
export const CLOUDINARY_DESTROY_TIMEOUT = 10000;

/**
 * Default image quality for automatic optimization
 */
export const DEFAULT_IMAGE_QUALITY = "auto";

/**
 * Default image format for automatic format selection
 */
export const DEFAULT_IMAGE_FORMAT = "auto";

/**
 * Asset ID prefix
 */
export const ASSET_ID_PREFIX = "asset_";

/**
 * Maximum filename length
 */
export const MAX_FILENAME_LENGTH = 100;

/**
 * Sanitized filename replacement character
 */
export const SANITIZATION_REPLACEMENT = "_";

/**
 * Characters to remove from filenames
 */
export const FORBIDDEN_FILENAME_CHARS = /[\/\\]/g;

/**
 * Characters to replace in filenames
 */
export const UNSAFE_FILENAME_CHARS = /[^\w\-_.]/g;

/**
 * Double-dot sequence to prevent path traversal
 */
export const PATH_TRAVERSAL_PATTERN = /\.\./g;
