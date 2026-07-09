import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center font-bold tracking-wider uppercase",
  {
    variants: {
      variant: {
        default: "bg-neutral-900 text-white",
        primary: "bg-brand-500 text-white",
        secondary: "bg-brand-100 text-brand-700",
        success: "bg-green-500 text-white",
        warning: "bg-amber-500 text-white",
        danger: "bg-red-500 text-white",
        gold: "bg-accent-gold text-white",
        outline: "bg-transparent border border-neutral-200 text-neutral-700",
        "outline-gold": "bg-transparent border border-accent-gold text-accent-gold",
      },
      size: {
        sm: "px-2 py-0.5 text-[9px]",
        md: "px-2.5 py-1 text-[10px]",
        lg: "px-3 py-1.5 text-xs",
      },
      rounded: {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      rounded: "md",
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, rounded, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(badgeVariants({ variant, size, rounded }), className)} {...props} />
    );
  }
);

Badge.displayName = "Badge";

export { Badge, badgeVariants };
