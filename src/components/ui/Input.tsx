import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";

const inputVariants = cva(
  "w-full font-body text-sm text-neutral-900 transition-all duration-200 focus-visible:outline-none disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "border border-neutral-200 px-4 py-3 hover:border-neutral-300 focus-visible:border-brand-500 focus-visible:ring-1 focus-visible:ring-brand-500/20",
        search: "pl-10 pr-4 py-2.5 bg-neutral-100 border-0 hover:bg-white focus-visible:bg-white focus-visible:shadow-sm focus-visible:ring-0",
        minimal: "border-0 border-b border-neutral-200 px-0 py-2 hover:border-neutral-300 focus-visible:border-brand-500 focus-visible:ring-0",
        ghost: "border-0 bg-transparent px-0 py-2 hover:bg-neutral-50 focus-visible:bg-neutral-50 focus-visible:ring-0",
      },
      inputSize: {
        sm: "px-3 py-2 text-[max(12px,1rem)]",
        md: "px-4 py-3",
        lg: "px-5 py-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "md",
    },
  }
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputSize, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" aria-hidden="true">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            inputVariants({ variant, inputSize }),
            error && "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500/20",
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            className
          )}
          aria-invalid={error}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" aria-hidden="true">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, inputVariants };
