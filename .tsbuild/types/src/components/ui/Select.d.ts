import { type SelectHTMLAttributes } from "react";
import { type VariantProps } from "class-variance-authority";
declare const selectVariants: (props?: ({
    variant?: "default" | "minimal" | null | undefined;
    selectSize?: "lg" | "sm" | "md" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size">, VariantProps<typeof selectVariants> {
    error?: boolean;
}
declare const Select: import("react").ForwardRefExoticComponent<SelectProps & import("react").RefAttributes<HTMLSelectElement>>;
export { Select, selectVariants };
