// ─────────────────────────────────────────────────────────────
// FILE UPLOAD SECURITY — Validation for images, videos, documents
// ─────────────────────────────────────────────────────────────

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
] as const;

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
] as const;

const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
] as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

const DANGEROUS_EXTENSIONS = [
  ".exe", ".bat", ".cmd", ".sh", ".ps1", ".vbs", ".js", ".jar",
  ".php", ".asp", ".aspx", ".jsp", ".py", ".rb", ".pl", ".cgi",
  ".dll", ".so", ".dylib", ".app", ".deb", ".rpm", ".msi",
] as const;

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate file upload for security
 */
export function validateFileUpload(
  file: File,
  options?: {
    allowedTypes?: readonly string[];
    maxSize?: number;
    checkExtension?: boolean;
  }
): FileValidationResult {
  const { allowedTypes, maxSize, checkExtension = true } = options || {};

  // Check file size
  const effectiveMaxSize = maxSize || MAX_FILE_SIZE;
  if (file.size > effectiveMaxSize) {
    return {
      valid: false,
      error: `File size exceeds ${formatBytes(effectiveMaxSize)} limit`,
    };
  }

  // Check MIME type
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  // Check file extension for dangerous files
  if (checkExtension) {
    const fileName = file.name.toLowerCase();
    for (const ext of DANGEROUS_EXTENSIONS) {
      if (fileName.endsWith(ext)) {
        return {
          valid: false,
          error: `File extension ${ext} is not allowed`,
        };
      }
    }
  }

  // Validate MIME type matches extension
  const extension = getFileExtension(file.name);
  const expectedMime = getExpectedMimeType(extension);
  if (expectedMime && !isMimeTypeCompatible(file.type, expectedMime)) {
    return {
      valid: false,
      error: `File type mismatch: extension suggests ${expectedMime} but got ${file.type}`,
    };
  }

  return { valid: true };
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): FileValidationResult {
  return validateFileUpload(file, {
    allowedTypes: ALLOWED_IMAGE_TYPES,
    maxSize: MAX_IMAGE_SIZE,
  });
}

/**
 * Validate video file
 */
export function validateVideoFile(file: File): FileValidationResult {
  return validateFileUpload(file, {
    allowedTypes: ALLOWED_VIDEO_TYPES,
    maxSize: MAX_VIDEO_SIZE,
  });
}

/**
 * Validate document file
 */
export function validateDocumentFile(file: File): FileValidationResult {
  return validateFileUpload(file, {
    allowedTypes: ALLOWED_DOCUMENT_TYPES,
    maxSize: MAX_FILE_SIZE,
  });
}

/**
 * Sanitize filename
 */
export function sanitizeFileName(fileName: string): string {
  // Remove path traversal attempts
  const sanitized = fileName.replace(/\.+\//g, "").replace(/\.\.+/g, "");
  
  // Remove non-alphanumeric characters except dots, hyphens, underscores
  return sanitized.replace(/[^a-zA-Z0-9._-]/g, "_");
}

/**
 * Get file extension
 */
function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1]!.toLowerCase() : "";
}

/**
 * Get expected MIME type for extension
 */
function getExpectedMimeType(extension: string): string | null {
  const mimeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    svg: "image/svg+xml",
    mp4: "video/mp4",
    webm: "video/webm",
    ogg: "video/ogg",
    pdf: "application/pdf",
  };
  return mimeMap[extension] || null;
}

/**
 * Check if MIME types are compatible
 */
function isMimeTypeCompatible(actual: string, expected: string): boolean {
  // Exact match
  if (actual === expected) return true;
  
  // Handle image/jpeg vs image/jpg
  if (actual === "image/jpeg" && expected === "image/jpg") return true;
  if (actual === "image/jpg" && expected === "image/jpeg") return true;
  
  return false;
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}
