/**
 * Media Management Module - Utilities
 * 
 * This file contains common helper functions for media operations.
 * These utilities are used across multiple services in the media module.
 */

import {
  MAX_FILENAME_LENGTH,
  SANITIZATION_REPLACEMENT,
  FORBIDDEN_FILENAME_CHARS,
  UNSAFE_FILENAME_CHARS,
  PATH_TRAVERSAL_PATTERN,
} from "./media.constants";

/**
 * Sanitizes a filename to make it safe for Cloudinary and file systems
 * Removes dangerous characters and prevents path traversal
 * 
 * @param filename The filename to sanitize
 * @returns The sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  let cleaned = filename;

  // Prevent path traversal
  cleaned = cleaned.replace(PATH_TRAVERSAL_PATTERN, SANITIZATION_REPLACEMENT);

  // Remove forbidden characters (slashes, backslashes)
  cleaned = cleaned.replace(FORBIDDEN_FILENAME_CHARS, SANITIZATION_REPLACEMENT);

  // Replace unsafe characters with underscore
  cleaned = cleaned.replace(UNSAFE_FILENAME_CHARS, SANITIZATION_REPLACEMENT);

  // Trim whitespace
  cleaned = cleaned.trim();

  // Enforce maximum length
  if (cleaned.length > MAX_FILENAME_LENGTH) {
    const ext = cleaned.substring(cleaned.lastIndexOf("."));
    const nameWithoutExt = cleaned.substring(0, cleaned.lastIndexOf("."));
    cleaned = nameWithoutExt.substring(0, MAX_FILENAME_LENGTH - ext.length) + ext;
  }

  // Ensure filename is not empty
  if (!cleaned) {
    cleaned = "file";
  }

  return cleaned;
}

/**
 * Extracts the file extension from a filename
 * 
 * @param filename The filename to extract from
 * @returns The file extension (without the dot), or empty string if none
 */
export function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
    return "";
  }
  return filename.slice(lastDotIndex + 1).toLowerCase();
}

/**
 * Gets the MIME type from a filename based on its extension
 * This is a basic implementation - for production, use a proper MIME type library
 * 
 * @param filename The filename to check
 * @returns The MIME type or null if unknown
 */
export function getMimeTypeFromFilename(filename: string): string | null {
  const ext = getFileExtension(filename);
  const mimeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    avif: "image/avif",
    gif: "image/gif",
    bmp: "image/bmp",
    tif: "image/tiff",
    tiff: "image/tiff",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    mkv: "video/x-matroska",
    pdf: "application/pdf",
  };

  return mimeMap[ext] || null;
}

/**
 * Formats a file size in bytes to a human-readable string
 * 
 * @param bytes The file size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Formats dimensions as a string
 * 
 * @param width The width in pixels
 * @param height The height in pixels
 * @returns Formatted string (e.g., "1920x1080")
 */
export function formatDimensions(width: number, height: number): string {
  return `${width}x${height}`;
}

/**
 * Parses a dimensions string back to width and height
 * 
 * @param dimensions The dimensions string (e.g., "1920x1080")
 * @returns Object with width and height, or null if invalid
 */
export function parseDimensions(dimensions: string): { width: number; height: number } | null {
  const parts = dimensions.split("x");
  if (parts.length !== 2) {
    return null;
  }

  const width = parseInt(parts[0], 10);
  const height = parseInt(parts[1], 10);

  if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
    return null;
  }

  return { width, height };
}

/**
 * Generates a display name from a filename
 * Removes extension and sanitizes the name
 * 
 * @param filename The filename to convert
 * @returns The display name
 */
export function getDisplayName(filename: string): string {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex > 0) {
    filename = filename.substring(0, lastDotIndex);
  }

  return sanitizeFilename(filename);
}

/**
 * Checks if a filename is valid
 * 
 * @param filename The filename to check
 * @returns True if valid, false otherwise
 */
export function isValidFilename(filename: string): boolean {
  if (!filename || filename.length === 0) {
    return false;
  }

  // Check for path traversal
  if (filename.includes("..")) {
    return false;
  }

  // Check for forbidden characters
  if (FORBIDDEN_FILENAME_CHARS.test(filename)) {
    return false;
  }

  // Check length
  if (filename.length > MAX_FILENAME_LENGTH) {
    return false;
  }

  return true;
}

/**
 * Normalizes a slug for use in folder paths
 * Ensures the slug is URL-safe and consistent
 * 
 * @param slug The slug to normalize
 * @returns The normalized slug
 */
export function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Builds a public URL from Cloudinary components
 * 
 * @param cloudName The Cloudinary cloud name
 * @param publicId The public ID
 * @param options Optional URL parameters
 * @returns The public URL
 */
export function buildCloudinaryUrl(
  cloudName: string,
  publicId: string,
  options?: {
    format?: string;
    quality?: string;
    width?: number;
    height?: number;
    crop?: string;
  }
): string {
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;

  const transformations: string[] = [];

  if (options?.width && options?.height && options?.crop) {
    transformations.push(`w_${options.width},h_${options.height},c_${options.crop}`);
  } else if (options?.width) {
    transformations.push(`w_${options.width}`);
  } else if (options?.height) {
    transformations.push(`h_${options.height}`);
  }

  if (options?.quality) {
    transformations.push(`q_${options.quality}`);
  }

  if (options?.format) {
    transformations.push(`f_${options.format}`);
  }

  const transformationString = transformations.length > 0 ? transformations.join(",") + "/" : "";

  return `${baseUrl}/${transformationString}${publicId}`;
}

/**
 * Extracts the public ID from a Cloudinary URL
 * 
 * @param url The Cloudinary URL
 * @returns The public ID or null if not found
 */
export function extractPublicIdFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");

    // Cloudinary URLs typically have the format:
    // /image/upload/v1234567890/folder/public_id.format
    // or /image/upload/folder/public_id.format

    const uploadIndex = pathParts.indexOf("upload");
    if (uploadIndex === -1 || uploadIndex === pathParts.length - 1) {
      return null;
    }

    // Get everything after "upload"
    const afterUpload = pathParts.slice(uploadIndex + 1).join("/");

    // Remove version number if present (starts with v followed by digits)
    const withoutVersion = afterUpload.replace(/^v\d+\//, "");

    // Remove file extension
    const lastDotIndex = withoutVersion.lastIndexOf(".");
    if (lastDotIndex > 0) {
      return withoutVersion.substring(0, lastDotIndex);
    }

    return withoutVersion;
  } catch {
    return null;
  }
}

/**
 * Checks if a URL is a Cloudinary URL
 * 
 * @param url The URL to check
 * @returns True if it's a Cloudinary URL, false otherwise
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes("cloudinary.com") || url.includes("res.cloudinary.com");
}

/**
 * Truncates a string to a maximum length with ellipsis
 * 
 * @param str The string to truncate
 * @param maxLength The maximum length
 * @returns The truncated string
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength - 3) + "...";
}

/**
 * Converts a media type to a human-readable label
 * 
 * @param mediaType The media type
 * @returns The human-readable label
 */
export function getMediaTypeLabel(mediaType: string): string {
  const labels: Record<string, string> = {
    image: "Image",
    video: "Video",
    document: "Document",
  };
  return labels[mediaType] || mediaType;
}

/**
 * Converts a resource type to a human-readable label
 * 
 * @param resourceType The Cloudinary resource type
 * @returns The human-readable label
 */
export function getResourceTypeLabel(resourceType: string): string {
  const labels: Record<string, string> = {
    image: "Image",
    video: "Video",
    raw: "Document",
  };
  return labels[resourceType] || resourceType;
}

/**
 * Determines if a media type supports dimensions
 * 
 * @param mediaType The media type
 * @returns True if dimensions are supported, false otherwise
 */
export function supportsDimensions(mediaType: string): boolean {
  return mediaType === "image" || mediaType === "video";
}

/**
 * Creates a safe filename from a display name and extension
 * 
 * @param displayName The display name
 * @param extension The file extension (without dot)
 * @returns The safe filename
 */
export function createSafeFilename(displayName: string, extension: string): string {
  const safeName = sanitizeFilename(displayName);
  return `${safeName}.${extension}`;
}
