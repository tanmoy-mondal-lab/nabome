import type { FileTypeConfig, ValidationResult, MediaType, CloudinaryResourceType } from "./types";

const MAX_UPLOAD_SIZE = 20 * 1024 * 1024;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024;

const FTYP_MARKER = [0x66, 0x74, 0x79, 0x70];

const ALLOWED_FILE_TYPES: Record<string, FileTypeConfig> = {
  "image/jpeg": {
    type: "image" as MediaType,
    resourceType: "image" as CloudinaryResourceType,
    validate: (b) => b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF,
    maxSize: MAX_IMAGE_SIZE,
  },
  "image/png": {
    type: "image" as MediaType,
    resourceType: "image" as CloudinaryResourceType,
    validate: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47,
    maxSize: MAX_IMAGE_SIZE,
  },
  "image/webp": {
    type: "image" as MediaType,
    resourceType: "image" as CloudinaryResourceType,
    validate: (b) =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
    maxSize: MAX_IMAGE_SIZE,
  },
  "image/avif": {
    type: "image" as MediaType,
    resourceType: "image" as CloudinaryResourceType,
    validate: (b) =>
      b[4] === FTYP_MARKER[0] && b[5] === FTYP_MARKER[1] &&
      b[6] === FTYP_MARKER[2] && b[7] === FTYP_MARKER[3],
    maxSize: MAX_IMAGE_SIZE,
  },
  "image/gif": {
    type: "image" as MediaType,
    resourceType: "image" as CloudinaryResourceType,
    validate: (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38,
    maxSize: MAX_IMAGE_SIZE,
  },
  "image/bmp": {
    type: "image" as MediaType,
    resourceType: "image" as CloudinaryResourceType,
    validate: (b) => b[0] === 0x42 && b[1] === 0x4D,
    maxSize: MAX_IMAGE_SIZE,
  },
  "image/tiff": {
    type: "image" as MediaType,
    resourceType: "image" as CloudinaryResourceType,
    validate: (b) =>
      (b[0] === 0x49 && b[1] === 0x49 && b[2] === 0x2A && b[3] === 0x00) ||
      (b[0] === 0x4D && b[1] === 0x4D && b[2] === 0x00 && b[3] === 0x2A),
    maxSize: MAX_IMAGE_SIZE,
  },
  "video/mp4": {
    type: "video" as MediaType,
    resourceType: "video" as CloudinaryResourceType,
    validate: (b) =>
      b[4] === FTYP_MARKER[0] && b[5] === FTYP_MARKER[1] &&
      b[6] === FTYP_MARKER[2] && b[7] === FTYP_MARKER[3],
    maxSize: MAX_VIDEO_SIZE,
  },
  "video/webm": {
    type: "video" as MediaType,
    resourceType: "video" as CloudinaryResourceType,
    validate: (b) => b[0] === 0x1A && b[1] === 0x45 && b[2] === 0xDF && b[3] === 0xA3,
    maxSize: MAX_VIDEO_SIZE,
  },
  "video/quicktime": {
    type: "video" as MediaType,
    resourceType: "video" as CloudinaryResourceType,
    validate: (b) =>
      b[4] === FTYP_MARKER[0] && b[5] === FTYP_MARKER[1] &&
      b[6] === FTYP_MARKER[2] && b[7] === FTYP_MARKER[3],
    maxSize: MAX_VIDEO_SIZE,
  },
  "video/x-msvideo": {
    type: "video" as MediaType,
    resourceType: "video" as CloudinaryResourceType,
    validate: (b) => b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46,
    maxSize: MAX_VIDEO_SIZE,
  },
  "application/pdf": {
    type: "document" as MediaType,
    resourceType: "raw" as CloudinaryResourceType,
    validate: (b) => b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46,
    maxSize: MAX_DOCUMENT_SIZE,
  },
};

const ALLOWED_MIME_TYPES = Object.keys(ALLOWED_FILE_TYPES);

export { ALLOWED_MIME_TYPES, ALLOWED_FILE_TYPES };

export function getFileTypeConfig(mimeType: string): FileTypeConfig | null {
  return ALLOWED_FILE_TYPES[mimeType] ?? null;
}

export function validateFile(file: File): ValidationResult {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type}`,
      details: { mimeType: file.type, allowedTypes: ALLOWED_MIME_TYPES },
    };
  }

  const config = getFileTypeConfig(file.type);
  if (!config) {
    return {
      valid: false,
      error: `No configuration found for file type: ${file.type}`,
    };
  }

  const maxSize = config.maxSize ?? MAX_UPLOAD_SIZE;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size for ${config.type} is ${maxSize / 1024 / 1024}MB`,
      details: {
        actualSize: file.size,
        maxSize,
        fileType: config.type,
      },
    };
  }

  return { valid: true };
}

export async function validateFileContent(file: File, _mimeType: string): Promise<ValidationResult> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer.slice(0, 12));

  const config = getFileTypeConfig(file.type);
  if (!config) {
    return { valid: false, error: `Unknown file type: ${file.type}` };
  }

  if (!config.validate(bytes)) {
    return {
      valid: false,
      error: `File content does not match expected signature for ${file.type}`,
    };
  }

  return { valid: true };
}

export function throwIfInvalid(result: ValidationResult): void {
  if (!result.valid) {
    throw new Error(result.error ?? "Validation failed");
  }
}
