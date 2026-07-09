import { type HTMLAttributes } from "react";
import { type VariantProps } from "class-variance-authority";
declare const badgeVariants: (props?: ({
    variant?: "default" | "success" | "outline" | "gold" | "danger" | "primary" | "secondary" | "warning" | "outline-gold" | null | undefined;
    size?: "lg" | "sm" | "md" | null | undefined;
    rounded?: "none" | "lg" | "sm" | "md" | "full" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface BadgeProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
}
declare const Badge: import("react").ForwardRefExoticComponent<BadgeProps & import("react").RefAttributes<HTMLDivElement>>;
export { Badge, badgeVariants };
