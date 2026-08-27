import React, { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * FormField — form field wrapper with label and error (COMPONENT_LIBRARY_SPECIFICATION §4).
 * Provides consistent spacing and error display for form inputs.
 */

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  /** Field label */
  label?: string;
  /** Required indicator */
  required?: boolean;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Field ID for label association */
  id?: string;
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  (
    {
      className,
      label,
      required = false,
      error,
      helperText,
      id,
      children,
      ...props
    },
    ref,
  ) => {
    const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${fieldId}-error` : undefined;
    const helperId = helperText ? `${fieldId}-helper` : undefined;

    return (
      <div
        ref={ref}
        className={cn('flex flex-col gap-1.5', className)}
        {...props}
      >
        {label && (
          <label
            htmlFor={fieldId}
            className="text-sm font-medium text-(--text-primary)"
          >
            {label}
            {required && <span className="text-(--text-error) ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                id: fieldId,
                'aria-invalid': !!error,
                'aria-describedby': cn(errorId, helperId),
              } as any);
            }
            return child;
          })}
        </div>
        {error && (
          <p id={errorId} className="text-sm text-(--text-error)">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-sm text-(--text-tertiary)">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);
FormField.displayName = 'FormField';
