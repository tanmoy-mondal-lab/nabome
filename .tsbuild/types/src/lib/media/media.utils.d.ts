/**
 * Media Management Module - Utilities
 *
 * This file contains common helper functions for media operations.
 * These utilities are used across multiple services in the media module.
 */
/**
 * Sanitizes a filename to make it safe for Cloudinary and file systems
 * Removes dangerous characters and prevents path traversal
 *
 * @param filename The filename to sanitize
 * @returns The sanitized filename
 */
export declare function sanitizeFilename(filename: string): string;
/**
 * Extracts the file extension from a filename
 *
 * @param filename The filename to extract from
 * @returns The file extension (without the dot), or empty string if none
 */
export declare function getFileExtension(filename: string): string;
/**
 * Gets the MIME type from a filename based on its extension
 * This is a basic implementation - for production, use a proper MIME type library
 *
 * @param filename The filename to check
 * @returns The MIME type or null if unknown
 */
export declare function getMimeTypeFromFilename(filename: string): string | null;
/**
 * Formats a file size in bytes to a human-readable string
 *
 * @param bytes The file size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export declare function formatFileSize(bytes: number): string;
/**
 * Formats dimensions as a string
 *
 * @param width The width in pixels
 * @param height The height in pixels
 * @returns Formatted string (e.g., "1920x1080")
 */
export declare function formatDimensions(width: number, height: number): string;
/**
 * Parses a dimensions string back to width and height
 *
 * @param dimensions The dimensions string (e.g., "1920x1080")
 * @returns Object with width and height, or null if invalid
 */
export declare function parseDimensions(dimensions: string): {
    width: number;
    height: number;
} | null;
/**
 * Generates a display name from a filename
 * Removes extension and sanitizes the name
 *
 * @param filename The filename to convert
 * @returns The display name
 */
export declare function getDisplayName(filename: string): string;
/**
 * Checks if a filename is valid
 *
 * @param filename The filename to check
 * @returns True if valid, false otherwise
 */
export declare function isValidFilename(filename: string): boolean;
/**
 * Normalizes a slug for use in folder paths
 * Ensures the slug is URL-safe and consistent
 *
 * @param slug The slug to normalize
 * @returns The normalized slug
 */
export declare function normalizeSlug(slug: string): string;
/**
 * Builds a public URL from Cloudinary components
 *
 * @param cloudName The Cloudinary cloud name
 * @param publicId The public ID
 * @param options Optional URL parameters
 * @returns The public URL
 */
export declare function buildCloudinaryUrl(cloudName: string, publicId: string, options?: {
    format?: string;
    quality?: string;
    width?: number;
    height?: number;
    crop?: string;
}): string;
/**
 * Extracts the public ID from a Cloudinary URL
 *
 * @param url The Cloudinary URL
 * @returns The public ID or null if not found
 */
export declare function extractPublicIdFromUrl(url: string): string | null;
/**
 * Checks if a URL is a Cloudinary URL
 *
 * @param url The URL to check
 * @returns True if it's a Cloudinary URL, false otherwise
 */
export declare function isCloudinaryUrl(url: string): boolean;
/**
 * Truncates a string to a maximum length with ellipsis
 *
 * @param str The string to truncate
 * @param maxLength The maximum length
 * @returns The truncated string
 */
export declare function truncateString(str: string, maxLength: number): string;
/**
 * Converts a media type to a human-readable label
 *
 * @param mediaType The media type
 * @returns The human-readable label
 */
export declare function getMediaTypeLabel(mediaType: string): string;
/**
 * Converts a resource type to a human-readable label
 *
 * @param resourceType The Cloudinary resource type
 * @returns The human-readable label
 */
export declare function getResourceTypeLabel(resourceType: string): string;
/**
 * Determines if a media type supports dimensions
 *
 * @param mediaType The media type
 * @returns True if dimensions are supported, false otherwise
 */
export declare function supportsDimensions(mediaType: string): boolean;
/**
 * Creates a safe filename from a display name and extension
 *
 * @param displayName The display name
 * @param extension The file extension (without dot)
 * @returns The safe filename
 */
export declare function createSafeFilename(displayName: string, extension: string): string;
