export type ValidationRule<T> = {
  validate: (value: T) => boolean;
  message: string;
};

export type ValidationResult = {
  valid: boolean;
  errors: Record<string, string[]>;
};

export const validators = {
  required: (field: string): ValidationRule<string> => ({
    validate: (v: string) => v.trim().length > 0,
    message: `${field} is required`,
  }),

  minLength: (field: string, min: number): ValidationRule<string> => ({
    validate: (v: string) => v.trim().length >= min,
    message: `${field} must be at least ${min} characters`,
  }),

  maxLength: (field: string, max: number): ValidationRule<string> => ({
    validate: (v: string) => v.trim().length <= max,
    message: `${field} must be at most ${max} characters`,
  }),

  email: (field: string): ValidationRule<string> => ({
    validate: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    message: `${field} must be a valid email address`,
  }),

  phone: (field: string): ValidationRule<string> => ({
    validate: (v: string) => {
      const digits = v.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 15;
    },
    message: `${field} must be a valid phone number (10-15 digits)`,
  }),

  password: (field: string): ValidationRule<string> => ({
    validate: (v: string) => {
      const hasMin = v.length >= 8;
      const hasUpper = /[A-Z]/.test(v);
      const hasLower = /[a-z]/.test(v);
      const hasDigit = /\d/.test(v);
      return hasMin && hasUpper && hasLower && hasDigit;
    },
    message: `${field} must be at least 8 characters with uppercase, lowercase, and a number`,
  }),

  match: (field: string, matchField: string, matchValue: string): ValidationRule<string> => ({
    validate: (v: string) => v === matchValue,
    message: `${field} must match ${matchField}`,
  }),

  numeric: (field: string): ValidationRule<string> => ({
    validate: (v: string) => /^\d+(\.\d+)?$/.test(v),
    message: `${field} must be a valid number`,
  }),

  positive: (field: string): ValidationRule<number> => ({
    validate: (v: number) => v > 0,
    message: `${field} must be positive`,
  }),

  range: (field: string, min: number, max: number): ValidationRule<number> => ({
    validate: (v: number) => v >= min && v <= max,
    message: `${field} must be between ${min} and ${max}`,
  }),

  url: (field: string): ValidationRule<string> => ({
    validate: (v: string) => {
      try {
        new URL(v);
        return true;
      } catch {
        return false;
      }
    },
    message: `${field} must be a valid URL`,
  }),

  pincode: (field: string): ValidationRule<string> => ({
    validate: (v: string) => /^\d{6}$/.test(v),
    message: `${field} must be a valid 6-digit pincode`,
  }),

  oneOf: (field: string, allowed: string[]): ValidationRule<string> => ({
    validate: (v: string) => allowed.includes(v),
    message: `${field} must be one of: ${allowed.join(", ")}`,
  }),
};

export function validateField(value: unknown, rules: ValidationRule<any>[]): string[] {
  return rules.filter((r) => !r.validate(value)).map((r) => r.message);
}

export function validateAll(fields: Record<string, { value: unknown; rules: ValidationRule<any>[] }>): ValidationResult {
  const errors: Record<string, string[]> = {};
  for (const [key, config] of Object.entries(fields)) {
    const fieldErrors = validateField(config.value, config.rules);
    if (fieldErrors.length > 0) {
      errors[key] = fieldErrors;
    }
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function sanitizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("91")) return `+${digits}`;
  return `+91${digits}`;
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 255);
}
