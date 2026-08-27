import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '@nabome/utils';

/**
 * Stepper — multi-step progress indicator (COMPONENT_LIBRARY_SPECIFICATION §11).
 * Shows current step in a multi-step process. Accessible with keyboard.
 */

export const stepperVariants = cva('flex items-center gap-4', {
  variants: {
    orientation: {
      horizontal: 'flex-row',
      vertical: 'flex-col',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

export const stepVariants = cva('flex items-center gap-3', {
  variants: {
    state: {
      pending: 'text-(--text-muted)',
      current: 'text-(--text-primary)',
      completed: 'text-(--text-brand)',
    },
  },
  defaultVariants: {
    state: 'pending',
  },
});

export const stepIndicatorVariants = cva(
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 font-medium transition-colors duration-(--duration-fast) ease-(--ease-default)',
  {
    variants: {
      state: {
        pending: 'border-(--border-default) bg-transparent text-(--text-muted)',
        current: 'border-(--color-brand-500) bg-(--color-brand-500) text-white',
        completed:
          'border-(--color-brand-500) bg-(--color-brand-500) text-white',
      },
    },
    defaultVariants: {
      state: 'pending',
    },
  },
);

export interface Step {
  id: string;
  label: string;
  description?: string;
}

export interface StepperProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof stepperVariants> {
  /** Steps array */
  steps: Step[];
  /** Current step index */
  currentStep: number;
  /** Stepper orientation */
  orientation?: 'horizontal' | 'vertical';
}

export const Stepper = forwardRef<HTMLDivElement, StepperProps>(
  (
    { className, steps, currentStep, orientation = 'horizontal', ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        role="navigation"
        aria-label="Stepper"
        className={cn(stepperVariants({ orientation }), className)}
        {...props}
      >
        {steps.map((step, index) => {
          const state =
            index < currentStep
              ? 'completed'
              : index === currentStep
                ? 'current'
                : 'pending';

          return (
            <div
              key={step.id}
              className={cn(stepVariants({ state }), 'flex-1')}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(stepIndicatorVariants({ state }))}
                  aria-current={state === 'current' ? 'step' : undefined}
                >
                  {state === 'completed' ? (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{step.label}</span>
                  {step.description && (
                    <span className="text-xs text-(--text-secondary)">
                      {step.description}
                    </span>
                  )}
                </div>
              </div>
              {orientation === 'horizontal' && index < steps.length - 1 && (
                <div className="flex-1 h-px bg-(--border-default) mx-4" />
              )}
            </div>
          );
        })}
      </div>
    );
  },
);
Stepper.displayName = 'Stepper';
