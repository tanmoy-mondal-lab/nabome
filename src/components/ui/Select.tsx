import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "../../lib/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";

const selectVariants = cva(
  "w-full font-body text-sm text-neutral-900 transition-all duration-200 focus-visible:outline-none disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed appearance-none bg-white",
  {
    variants: {
      variant: {
        default: "border border-neutral-200 px-4 py-3 hover:border-neutral-300 focus-visible:border-brand-500 focus-visible:ring-1 focus-visible:ring-brand-500/20",
        minimal: "border-0 border-b border-neutral-200 px-0 py-2 hover:border-neutral-300 focus-visible:border-brand-500 focus-visible:ring-0",
      },
      selectSize: {
        sm: "px-3 py-2 text-xs",
        md: "px-4 py-3",
        lg: "px-5 py-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      selectSize: "md",
    },
  }
);

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size">,
    VariantProps<typeof selectVariants> {
  error?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant, selectSize, error, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            selectVariants({ variant, selectSize }),
            error && "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500/20",
            "pr-10",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select, selectVariants };
