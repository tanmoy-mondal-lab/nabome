/**
 * Media Management Module - Cloudinary Configuration
 *
 * This file centralizes all Cloudinary configuration.
 * All Cloudinary settings should be managed through this module.
 */
import type { CloudinaryConfig } from "./media.types";
/**
 * Creates a Cloudinary configuration object
 *
 * @param cloudName The Cloudinary cloud name
 * @param apiKey The Cloudinary API key
 * @param apiSecret The Cloudinary API secret
 * @returns The Cloudinary configuration
 * @throws CloudinaryConfigError if any parameter is missing
 */
export declare function createCloudinaryConfig(cloudName: string, apiKey: string, apiSecret: string): CloudinaryConfig;
/**
 * Gets Cloudinary configuration from environment variables
 * SERVER-ONLY: This function accesses CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET
 * and must never be imported from browser/client code.
 * In Cloudflare Workers, use the env binding instead.
 *
 * @returns The Cloudinary configuration
 * @throws CloudinaryConfigError if environment variables are missing
 */
export declare function getCloudinaryConfigFromEnv(): CloudinaryConfig;
/**
 * Merges partial configuration with defaults
 *
 * @param partialConfig Partial configuration to merge
 * @param baseConfig Base configuration to merge with (defaults to DEFAULT_CONFIG)
 * @returns The merged configuration
 * @throws CloudinaryConfigError if the merged configuration is invalid
 */
export declare function mergeCloudinaryConfig(partialConfig: Partial<CloudinaryConfig>, baseConfig?: CloudinaryConfig): CloudinaryConfig;
/**
 * Checks if Cloudinary configuration is valid without throwing
 *
 * @param config The configuration to check
 * @returns True if valid, false otherwise
 */
export declare function isValidCloudinaryConfig(config: Partial<CloudinaryConfig>): boolean;
/**
 * Sanitizes Cloudinary configuration for logging
 * Removes sensitive information like API secret
 *
 * @param config The configuration to sanitize
 * @returns Sanitized configuration safe for logging
 */
export declare function sanitizeCloudinaryConfig(config: CloudinaryConfig): {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
    hasSecret: boolean;
};
/**
 * Upload options that can be configured globally
 */
export interface CloudinaryUploadOptions {
    /** Whether to overwrite existing files */
    overwrite?: boolean;
    /** Eager transformations to apply */
    eager?: string;
    /** Custom transformation string */
    transformation?: string;
    /** Whether to use auto format */
    autoFormat?: boolean;
    /** Whether to use auto quality */
    autoQuality?: boolean;
    /** Quality level (if autoQuality is false) */
    quality?: string;
}
/**
 * Default upload options
 */
export declare const DEFAULT_UPLOAD_OPTIONS: CloudinaryUploadOptions;
/**
 * Delivery options that can be configured globally
 */
export interface CloudinaryDeliveryOptions {
    /** Whether to use secure URLs only */
    secureOnly?: boolean;
    /** Default transformation for delivery */
    defaultTransformation?: string;
    /** Whether to enable CDN */
    cdn?: boolean;
}
/**
 * Default delivery options
 */
export declare const DEFAULT_DELIVERY_OPTIONS: CloudinaryDeliveryOptions;
/**
 * Complete Cloudinary configuration including upload and delivery options
 */
export interface CompleteCloudinaryConfig {
    /** Core Cloudinary credentials */
    credentials: CloudinaryConfig;
    /** Upload options */
    upload: CloudinaryUploadOptions;
    /** Delivery options */
    delivery: CloudinaryDeliveryOptions;
}
/**
 * Creates a complete Cloudinary configuration
 *
 * @param credentials Cloudinary credentials
 * @param uploadOptions Upload options (defaults to DEFAULT_UPLOAD_OPTIONS)
 * @param deliveryOptions Delivery options (defaults to DEFAULT_DELIVERY_OPTIONS)
 * @returns Complete configuration
 */
export declare function createCompleteCloudinaryConfig(credentials: CloudinaryConfig, uploadOptions?: CloudinaryUploadOptions, deliveryOptions?: CloudinaryDeliveryOptions): CompleteCloudinaryConfig;
