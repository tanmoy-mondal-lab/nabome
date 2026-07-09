/**
 * Media Management Module - Main Entry Point
 * 
 * This is the single entry point for the media management system.
 * All exports are centralized here for easy importing.
 * 
 * Usage:
 * import { uploadMedia, deleteMedia } from '@/lib/media';
 */

// Main service - the primary public API
export {
  uploadMedia,
  replaceMedia,
  deleteMedia,
  deleteEntityMedia,
  copyMedia,
  moveMedia,
  getMediaInfo,
  mediaExists,
  prepareUploadMetadata,
  batchUploadMedia,
} from "./media.service";

// Asset ID service - for generating unique asset IDs
export {
  generateAssetId,
  isValidAssetId,
  extractUuidFromAssetId,
  generateAssetIds,
  isCloudinarySafe,
  normalizeAssetId,
} from "./asset-id.service";

// Folder service - for generating folder paths
export {
  getRootFolder,
  getEntityFolder,
  getAssetFolder,
  getAssetFilePath,
  getSettingsFolder,
  getProductFolder,
  getBrandFolder,
  getCategoryFolder,
  getCollectionFolder,
  getHomepageFolder,
  getCmsFolder,
  getBlogFolder,
  getLookbookFolder,
  getSellerFolder,
  getUserFolder,
  getLabelFolder,
  getTempFolder,
  parseEntityFolder,
  extractEntityFolder,
  isAssetFolder,
  isValidFolder,
  normalizeFolder,
  getGenericEntityFolder,
} from "./folder.service";

// Validation service - for validating uploads
export {
  getFileTypeConfig,
  validateFile,
  validateFileContent,
  validateImageDimensions,
  validateUploadCount,
  validateEntityMediaCount,
  validateImageFile,
  validateVideoFile,
  validateDocumentFile,
  validateFiles,
  throwIfInvalid,
} from "./validation.service";

// Cloudinary service - for Cloudinary API operations
export {
  uploadAsset,
  replaceAsset as cloudinaryReplaceAsset,
  deleteAsset as cloudinaryDeleteAsset,
  deleteFolderAssets,
  deleteEntityAssets as cloudinaryDeleteEntityAssets,
  copyAsset as cloudinaryCopyAsset,
  moveAsset as cloudinaryMoveAsset,
  getAsset as cloudinaryGetAsset,
  assetExists as cloudinaryAssetExists,
} from "./cloudinary.service";

// Utilities - helper functions
export {
  sanitizeFilename,
  getFileExtension,
  getMimeTypeFromFilename,
  formatFileSize,
  formatDimensions,
  parseDimensions,
  getDisplayName,
  isValidFilename,
  normalizeSlug,
  buildCloudinaryUrl,
  extractPublicIdFromUrl,
  isCloudinaryUrl,
  truncateString,
  getMediaTypeLabel,
  getResourceTypeLabel,
  supportsDimensions,
  createSafeFilename,
} from "./media.utils";

// Types - TypeScript interfaces
export type {
  CloudinaryResourceType,
  MediaType,
  EntityType,
  UploadOptions,
  ReplaceOptions,
  UploadResult,
  ReplaceResult,
  DeleteResult,
  DeleteEntityResult,
  FolderInfo,
  MediaMetadata,
  CloudinaryAssetInfo,
  ValidationResult,
  FileTypeConfig,
  CloudinaryConfig,
  MediaEnvConfig,
} from "./media.types";

// Constants - configuration values
export {
  ROOT_FOLDER,
  MAX_UPLOAD_SIZE,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  MAX_DOCUMENT_SIZE,
  MAX_UPLOAD_COUNT,
  MAX_IMAGES_PER_ENTITY,
  MAX_VIDEOS_PER_ENTITY,
  MAX_DOCUMENTS_PER_ENTITY,
  ALLOWED_FILE_TYPES,
  ALLOWED_MIME_TYPES,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  CLOUDINARY_UPLOAD_TIMEOUT,
  CLOUDINARY_DESTROY_TIMEOUT,
  DEFAULT_IMAGE_QUALITY,
  DEFAULT_IMAGE_FORMAT,
  ASSET_ID_PREFIX,
  MAX_FILENAME_LENGTH,
  SANITIZATION_REPLACEMENT,
  FORBIDDEN_FILENAME_CHARS,
  UNSAFE_FILENAME_CHARS,
  PATH_TRAVERSAL_PATTERN,
} from "./media.constants";

// Errors - custom error classes
export {
  MediaError,
  InvalidFileError,
  FileSizeError,
  UnsupportedTypeError,
  FileContentMismatchError,
  UploadFailedError,
  DeleteFailedError,
  CloudinaryError,
  CloudinaryConfigError,
  ValidationError,
  AssetNotFoundError,
  FolderError,
  AssetIdGenerationError,
  UploadLimitError,
  EntityMediaLimitError,
  ImageDimensionsError,
  ReplaceFailedError,
  CopyFailedError,
  MoveFailedError,
  isMediaError,
  getUserErrorMessage,
  getErrorCode,
} from "./media.errors";

// Logging service - for structured persistent logging
export {
  LogLevel,
  MediaLogger,
  getLogger,
  setLogger,
  createLoggerInstance,
  logLifecycleEvent,
  logMediaOperation,
  logMediaOperationResult,
} from "./logging.service";

export type {
  LoggerConfig,
  LogEntry,
} from "./logging.service";

// Prisma middleware - for automatic media cleanup
export {
  cleanupMediaForEntity,
  cleanupMediaForEntities,
  cleanupMediaForWhereClause,
  deleteEntityWithMediaCleanup,
} from "./prisma-middleware";

export type {
  MediaCleanupOptions,
  MediaCleanupResult,
} from "./prisma-middleware";
