/**
 * Media Management Module - Cloudinary Configuration
 * 
 * This file centralizes all Cloudinary configuration.
 * All Cloudinary settings should be managed through this module.
 */

import type { CloudinaryConfig } from "./media.types";
import { CloudinaryConfigError } from "./media.errors";

/**
 * Default Cloudinary configuration
 * These values should be overridden by environment-specific configuration
 */
const DEFAULT_CONFIG: CloudinaryConfig = {
  cloudName: "",
  apiKey: "",
  apiSecret: "",
};

/**
 * Validates Cloudinary configuration
 * 
 * @param config The configuration to validate
 * @throws CloudinaryConfigError if configuration is invalid
 */
function validateConfig(config: CloudinaryConfig): void {
  if (!config.cloudName) {
    throw new CloudinaryConfigError("Cloudinary cloud name is required");
  }
  if (!config.apiKey) {
    throw new CloudinaryConfigError("Cloudinary API key is required");
  }
  if (!config.apiSecret) {
    throw new CloudinaryConfigError("Cloudinary API secret is required");
  }
}

/**
 * Creates a Cloudinary configuration object
 * 
 * @param cloudName The Cloudinary cloud name
 * @param apiKey The Cloudinary API key
 * @param apiSecret The Cloudinary API secret
 * @returns The Cloudinary configuration
 * @throws CloudinaryConfigError if any parameter is missing
 */
export function createCloudinaryConfig(
  cloudName: string,
  apiKey: string,
  apiSecret: string
): CloudinaryConfig {
  const config: CloudinaryConfig = {
    cloudName: cloudName.trim(),
    apiKey: apiKey.trim(),
    apiSecret: apiSecret.trim(),
  };

  validateConfig(config);
  return config;
}

/**
 * Gets Cloudinary configuration from environment variables
 * SERVER-ONLY: This function accesses CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET
 * and must never be imported from browser/client code.
 * In Cloudflare Workers, use the env binding instead.
 * 
 * @returns The Cloudinary configuration
 * @throws CloudinaryConfigError if environment variables are missing
 */
export function getCloudinaryConfigFromEnv(): CloudinaryConfig {
  const cloudName = typeof process !== "undefined" ? process.env.CLOUDINARY_CLOUD_NAME : undefined;
  const apiKey = typeof process !== "undefined" ? process.env.CLOUDINARY_API_KEY : undefined;
  const apiSecret = typeof process !== "undefined" ? process.env.CLOUDINARY_API_SECRET : undefined;

  if (!cloudName) {
    throw new CloudinaryConfigError("CLOUDINARY_CLOUD_NAME environment variable is not set");
  }
  if (!apiKey) {
    throw new CloudinaryConfigError("CLOUDINARY_API_KEY environment variable is not set");
  }
  if (!apiSecret) {
    throw new CloudinaryConfigError("CLOUDINARY_API_SECRET environment variable is not set");
  }

  return createCloudinaryConfig(cloudName, apiKey, apiSecret);
}

/**
 * Merges partial configuration with defaults
 * 
 * @param partialConfig Partial configuration to merge
 * @param baseConfig Base configuration to merge with (defaults to DEFAULT_CONFIG)
 * @returns The merged configuration
 * @throws CloudinaryConfigError if the merged configuration is invalid
 */
export function mergeCloudinaryConfig(
  partialConfig: Partial<CloudinaryConfig>,
  baseConfig: CloudinaryConfig = DEFAULT_CONFIG
): CloudinaryConfig {
  const config: CloudinaryConfig = {
    cloudName: partialConfig.cloudName || baseConfig.cloudName,
    apiKey: partialConfig.apiKey || baseConfig.apiKey,
    apiSecret: partialConfig.apiSecret || baseConfig.apiSecret,
  };

  validateConfig(config);
  return config;
}

/**
 * Checks if Cloudinary configuration is valid without throwing
 * 
 * @param config The configuration to check
 * @returns True if valid, false otherwise
 */
export function isValidCloudinaryConfig(config: Partial<CloudinaryConfig>): boolean {
  try {
    const fullConfig = mergeCloudinaryConfig(config, DEFAULT_CONFIG);
    validateConfig(fullConfig);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitizes Cloudinary configuration for logging
 * Removes sensitive information like API secret
 * 
 * @param config The configuration to sanitize
 * @returns Sanitized configuration safe for logging
 */
export function sanitizeCloudinaryConfig(config: CloudinaryConfig): {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  hasSecret: boolean;
} {
  return {
    cloudName: config.cloudName,
    apiKey: config.apiKey,
    apiSecret: "***",
    hasSecret: !!config.apiSecret,
  };
}

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
export const DEFAULT_UPLOAD_OPTIONS: CloudinaryUploadOptions = {
  overwrite: false,
  eager: "f_auto,q_auto",
  autoFormat: true,
  autoQuality: true,
};

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
export const DEFAULT_DELIVERY_OPTIONS: CloudinaryDeliveryOptions = {
  secureOnly: true,
  cdn: true,
};

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
export function createCompleteCloudinaryConfig(
  credentials: CloudinaryConfig,
  uploadOptions: CloudinaryUploadOptions = DEFAULT_UPLOAD_OPTIONS,
  deliveryOptions: CloudinaryDeliveryOptions = DEFAULT_DELIVERY_OPTIONS
): CompleteCloudinaryConfig {
  validateConfig(credentials);

  return {
    credentials,
    upload: { ...DEFAULT_UPLOAD_OPTIONS, ...uploadOptions },
    delivery: { ...DEFAULT_DELIVERY_OPTIONS, ...deliveryOptions },
  };
}
