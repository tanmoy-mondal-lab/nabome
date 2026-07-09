// ─────────────────────────────────────────────────────────────
// FORM VALIDATION HOOK
// ─────────────────────────────────────────────────────────────
// Provides form validation utilities with error handling
// ─────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

export interface ValidationSchema {
  [field: string]: ValidationRule;
}

export function useFormValidation(schema: ValidationSchema) {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const validateField = useCallback(
    (field: string, value: string): string | null => {
      const rule = schema[field];
      if (!rule) return null;

      if (rule.required && !value.trim()) {
        return `${field} is required`;
      }

      if (rule.minLength && value.length < rule.minLength) {
        return `${field} must be at least ${rule.minLength} characters`;
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        return `${field} must not exceed ${rule.maxLength} characters`;
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        return `${field} format is invalid`;
      }

      if (rule.custom) {
        return rule.custom(value);
      }

      return null;
    },
    [schema]
  );

  const validateForm = useCallback(
    (data: Record<string, string>): boolean => {
      const newErrors: ValidationError[] = [];

      for (const [field, value] of Object.entries(data)) {
        const error = validateField(field, value);
        if (error) {
          newErrors.push({ field, message: error });
        }
      }

      setErrors(newErrors);
      return newErrors.length === 0;
    },
    [validateField]
  );

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors((prev) => prev.filter((e) => e.field !== field));
  }, []);

  const markTouched = useCallback((field: string) => {
    setTouched((prev) => new Set([...prev, field]));
  }, []);

  const getFieldError = useCallback(
    (field: string): string | null => {
      return errors.find((e) => e.field === field)?.message || null;
    },
    [errors]
  );

  const isFieldTouched = useCallback(
    (field: string): boolean => {
      return touched.has(field);
    },
    [touched]
  );

  return {
    errors,
    touched,
    validateField,
    validateForm,
    clearErrors,
    clearFieldError,
    markTouched,
    getFieldError,
    isFieldTouched,
  };
}

export function useAsyncValidation<T>(
  validator: (value: T) => Promise<string | null>
) {
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(
    async (value: T): Promise<boolean> => {
      setIsValidating(true);
      setError(null);

      try {
        const validationError = await validator(value);
        setError(validationError);
        return !validationError;
      } catch {
        setError("Validation failed");
        return false;
      } finally {
        setIsValidating(false);
      }
    },
    [validator]
  );

  return { isValidating, error, validate, setError };
}
