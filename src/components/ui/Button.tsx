import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-body text-sm font-medium uppercase tracking-wider transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-40 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary: "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 active:scale-[0.98] rounded-sm",
        secondary: "border-2 border-brand-500 text-brand-500 hover:bg-brand-500 hover:text-white active:bg-brand-600 active:border-brand-600 active:scale-[0.98] rounded-sm",
        ghost: "text-neutral-700 hover:text-brand-500",
        outline: "border border-neutral-200 text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 rounded-sm",
        gold: "bg-accent-gold text-white hover:bg-accent-goldDark rounded-sm",
        "gold-outline": "border border-accent-gold text-accent-gold hover:bg-accent-gold hover:text-white rounded-sm",
        link: "text-neutral-900 underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900 p-0",
      },
      size: {
        sm: "px-4 py-2 text-xs",
        md: "px-8 py-3",
        lg: "px-10 py-3.5 tracking-[0.2em]",
        xl: "px-12 py-4 text-sm",
        icon: "p-2",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!loading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
