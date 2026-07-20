/**
 * Security Validation Utilities
 * Provides validation and sanitization for user inputs to prevent XSS, injection attacks, and other security vulnerabilities.
 */

// Allowed file types for uploads
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGE_DIMENSION = 10000; // 10,000px

/**
 * Validates file upload for security
 */
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB` };
  }

  // Check file type
  const fileType = file.type.toLowerCase();
  const allAllowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES, ...ALLOWED_DOCUMENT_TYPES];
  
  if (!allAllowedTypes.includes(fileType)) {
    return { valid: false, error: `File type ${fileType} is not allowed` };
  }

  // Check file extension matches MIME type
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension) {
    return { valid: false, error: 'File must have an extension' };
  }

  const extensionToMime: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'ogg': 'video/ogg',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };

  const expectedMime = extensionToMime[extension];
  if (expectedMime && fileType !== expectedMime) {
    return { valid: false, error: 'File extension does not match file type' };
  }

  return { valid: true };
}

/**
 * Validates image dimensions
 */
export function validateImageDimensions(width: number, height: number): { valid: boolean; error?: string } {
  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    return { valid: false, error: `Image dimensions exceed maximum of ${MAX_IMAGE_DIMENSION}px` };
  }
  if (width <= 0 || height <= 0) {
    return { valid: false, error: 'Image dimensions must be positive' };
  }
  return { valid: true };
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Removes dangerous tags and attributes while preserving safe formatting
 * Uses DOMParser for robust parsing when available, falls back to regex for SSR
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // Use DOMParser for client-side (more robust)
  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    const BLOCKED_TAGS = new Set([
      "SCRIPT", "IFRAME", "OBJECT", "EMBED", "FORM", "INPUT", "TEXTAREA",
      "BUTTON", "LINK", "META", "BASE", "STYLE",
    ]);
    const URL_ATTRIBUTES = new Set(["href", "src", "action", "formaction", "poster", "xlink:href"]);

    function isSafeUrl(value: string): boolean {
      const normalized = value.trim().replace(/[\u0000-\u001F\u007F\s]+/g, "").toLowerCase();
      return !normalized.startsWith("javascript:")
        && !normalized.startsWith("vbscript:")
        && !normalized.startsWith("data:text/html");
    }

    const document = new DOMParser().parseFromString(`<template>${html}</template>`, "text/html");
    const template = document.querySelector("template");
    if (!template) return "";

    for (const element of Array.from(template.content.querySelectorAll("*"))) {
      if (BLOCKED_TAGS.has(element.tagName)) {
        element.remove();
        continue;
      }
      for (const attribute of Array.from(element.attributes)) {
        const name = attribute.name.toLowerCase();
        if (name.startsWith("on") || name === "srcdoc" || name === "style") {
          element.removeAttribute(attribute.name);
          continue;
        }
        if (URL_ATTRIBUTES.has(name) && !isSafeUrl(attribute.value)) {
          element.removeAttribute(attribute.name);
        }
      }
      if (element.tagName === "A" && element.getAttribute("target") === "_blank") {
        element.setAttribute("rel", "noopener noreferrer");
      }
    }

    return template.innerHTML;
  }

  // Server-side fallback using regex
  const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'link', 'style', 'meta'];
  let sanitized = html;

  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}[^>]*>.*?<\\/${tag}>`, 'gis');
    sanitized = sanitized.replace(regex, '');
    const selfClosingRegex = new RegExp(`<${tag}[^>]*\\/>`, 'gis');
    sanitized = sanitized.replace(selfClosingRegex, '');
  });

  const dangerousAttrs = ['onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout', 'onfocus', 'onblur', 'onkeydown', 'onkeyup', 'javascript:', 'data:', 'vbscript:'];
  dangerousAttrs.forEach(attr => {
    const regex = new RegExp(`\\s${attr}\\s*=\\s*["'][^"']*["']`, 'gis');
    sanitized = sanitized.replace(regex, '');
  });

  sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href=""');
  sanitized = sanitized.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src=""');
  sanitized = sanitized.replace(/href\s*=\s*["']data:[^"']*["']/gi, 'href=""');
  sanitized = sanitized.replace(/src\s*=\s*["']data:[^"']*["']/gi, 'src=""');

  return sanitized;
}

// Alias for backward compatibility
export { sanitizeHtml as sanitizeHTML };

/**
 * Sanitizes Markdown content
 * Removes potentially dangerous content while preserving Markdown formatting
 */
export function sanitizeMarkdown(markdown: string): string {
  if (!markdown) return '';

  let sanitized = markdown;

  // Remove HTML tags (Markdown can contain HTML)
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Remove javascript: and data: protocols in links
  sanitized = sanitized.replace(/\[([^\]]+)\]\(javascript:[^\)]*\)/gi, '[$1](#)');
  sanitized = sanitized.replace(/\[([^\]]+)\]\(data:[^\)]*\)/gi, '[$1](#)');

  // Remove dangerous protocols in image links
  sanitized = sanitized.replace(/!\[([^\]]*)\]\(javascript:[^\)]*\)/gi, '');
  sanitized = sanitized.replace(/!\[([^\]]*)\]\(data:[^\)]*\)/gi, '');

  return sanitized;
}

/**
 * Validates and sanitizes user input to prevent XSS
 */
export function sanitizeUserInput(input: string): string {
  if (!input) return '';

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates URL to prevent malicious redirects
 */
export function validateUrl(url: string): { valid: boolean; error?: string } {
  if (!url) return { valid: false, error: 'URL is required' };

  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
    }

    // Prevent javascript: and data: URLs
    if (url.toLowerCase().startsWith('javascript:') || url.toLowerCase().startsWith('data:')) {
      return { valid: false, error: 'Dangerous URL protocol detected' };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Validates email address format
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email) return { valid: false, error: 'Email is required' };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
}

/**
 * Validates phone number format
 */
export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone) return { valid: false, error: 'Phone number is required' };

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Check if it has reasonable length (10-15 digits)
  if (digits.length < 10 || digits.length > 15) {
    return { valid: false, error: 'Invalid phone number format' };
  }

  return { valid: true };
}

/**
 * Validates slug format for URLs
 */
export function validateSlug(slug: string): { valid: boolean; error?: string } {
  if (!slug) return { valid: false, error: 'Slug is required' };

  // Only allow lowercase letters, numbers, and hyphens
  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(slug)) {
    return { valid: false, error: 'Slug can only contain lowercase letters, numbers, and hyphens' };
  }

  // Must not start or end with hyphen
  if (slug.startsWith('-') || slug.endsWith('-')) {
    return { valid: false, error: 'Slug cannot start or end with a hyphen' };
  }

  // Must not have consecutive hyphens
  if (slug.includes('--')) {
    return { valid: false, error: 'Slug cannot have consecutive hyphens' };
  }

  return { valid: true };
}

/**
 * Checks for SQL injection patterns
 */
export function detectSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|UNION|SCRIPT)\b)/i,
    /(--|;|\/\*|\*\/|xp_|sp_)/,
    /(\bOR\b.*=.*\bOR\b)/i,
    /(\bAND\b.*=.*\bAND\b)/i,
    /('.*'=.*'.*)/,
    /(\b1\s*=\s*1\b)/i,
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Validates permission for admin actions
 */
export function validateAdminPermission(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    'super_admin': 3,
    'admin': 2,
    'content_editor': 1,
    'user': 0,
  };

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] ?? 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] ?? 0;

  return userLevel >= requiredLevel;
}

/**
 * Validates that a user can perform an action on a specific entity
 */
export function validateEntityPermission(
  userId: string,
  entityOwnerId: string | null | undefined,
  userRole: string
): boolean {
  // Super admins can do anything
  if (userRole === 'super_admin') return true;
  
  // Regular admins can do anything
  if (userRole === 'admin') return true;
  
  // Content editors can only edit their own content
  if (userRole === 'content_editor') {
    return userId === entityOwnerId;
  }
  
  return false;
}

/**
 * Rate limit check helper
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  check(identifier: string): { allowed: boolean; remainingAttempts: number } {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    
    // Remove attempts outside the time window
    const validAttempts = attempts.filter(timestamp => now - timestamp < this.windowMs);
    
    if (validAttempts.length >= this.maxAttempts) {
      return { allowed: false, remainingAttempts: 0 };
    }
    
    validAttempts.push(now);
    this.attempts.set(identifier, validAttempts);
    
    return { 
      allowed: true, 
      remainingAttempts: this.maxAttempts - validAttempts.length 
    };
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}
