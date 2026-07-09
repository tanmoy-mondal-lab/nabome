import { forwardRef, type LabelHTMLAttributes } from "react";
import { cn } from "../../lib/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";

const labelVariants = cva(
  "font-body font-medium",
  {
    variants: {
      variant: {
        default: "text-neutral-700",
        muted: "text-neutral-500",
        accent: "text-brand-600",
      },
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
);

export interface LabelProps
  extends LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {
  required?: boolean;
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, variant, size, required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(labelVariants({ variant, size }), "block mb-1.5", className)}
        {...props}
      >
        {children}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    );
  }
);

Label.displayName = "Label";

export { Label, labelVariants };
