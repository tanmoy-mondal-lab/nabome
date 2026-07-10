import { type LabelHTMLAttributes } from "react";
import { type VariantProps } from "class-variance-authority";
declare const labelVariants: (props?: ({
    variant?: "default" | "muted" | "accent" | null | undefined;
    size?: "sm" | "md" | "lg" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement>, VariantProps<typeof labelVariants> {
    required?: boolean;
}
declare const Label: import("react").ForwardRefExoticComponent<LabelProps & import("react").RefAttributes<HTMLLabelElement>>;
export { Label, labelVariants };
