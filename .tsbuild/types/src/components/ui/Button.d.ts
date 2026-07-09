import { type ButtonHTMLAttributes } from "react";
import { type VariantProps } from "class-variance-authority";
declare const buttonVariants: (props?: ({
    variant?: "link" | "ghost" | "primary" | "secondary" | "outline" | "gold" | "gold-outline" | null | undefined;
    size?: "sm" | "md" | "lg" | "xl" | "icon" | null | undefined;
    fullWidth?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}
declare const Button: import("react").ForwardRefExoticComponent<ButtonProps & import("react").RefAttributes<HTMLButtonElement>>;
export { Button, buttonVariants };
