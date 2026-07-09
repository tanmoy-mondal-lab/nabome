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
export declare function useFormValidation(schema: ValidationSchema): {
    errors: ValidationError[];
    touched: Set<string>;
    validateField: (field: string, value: string) => string | null;
    validateForm: (data: Record<string, string>) => boolean;
    clearErrors: () => void;
    clearFieldError: (field: string) => void;
    markTouched: (field: string) => void;
    getFieldError: (field: string) => string | null;
    isFieldTouched: (field: string) => boolean;
};
export declare function useAsyncValidation<T>(validator: (value: T) => Promise<string | null>): {
    isValidating: boolean;
    error: string | null;
    validate: (value: T) => Promise<boolean>;
    setError: import("react").Dispatch<import("react").SetStateAction<string | null>>;
};
