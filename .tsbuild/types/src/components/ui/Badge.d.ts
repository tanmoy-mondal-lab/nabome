import { HTMLAttributes } from "react";
import { type VariantProps } from "class-variance-authority";
declare const badgeVariants: (props?: ({
    variant?: "default" | "outline" | "success" | "warning" | "primary" | "gold" | "danger" | "secondary" | "outline-gold" | null | undefined;
    size?: "sm" | "md" | "lg" | null | undefined;
    rounded?: "none" | "sm" | "md" | "lg" | "full" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface BadgeProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
}
declare const Badge: import("react").ForwardRefExoticComponent<BadgeProps & import("react").RefAttributes<HTMLDivElement>>;
export { Badge, badgeVariants };
