import { type HTMLAttributes } from "react";
import { type VariantProps } from "class-variance-authority";
declare const cardVariants: (props?: ({
    variant?: "flat" | "default" | "elevated" | "minimal" | "ghost" | null | undefined;
    padding?: "none" | "sm" | "md" | "lg" | "xl" | null | undefined;
    rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface CardProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
    asChild?: boolean;
}
declare const Card: import("react").ForwardRefExoticComponent<CardProps & import("react").RefAttributes<HTMLDivElement>>;
declare const CardHeader: import("react").ForwardRefExoticComponent<HTMLAttributes<HTMLDivElement> & import("react").RefAttributes<HTMLDivElement>>;
declare const CardTitle: import("react").ForwardRefExoticComponent<HTMLAttributes<HTMLHeadingElement> & import("react").RefAttributes<HTMLParagraphElement>>;
declare const CardDescription: import("react").ForwardRefExoticComponent<HTMLAttributes<HTMLParagraphElement> & import("react").RefAttributes<HTMLParagraphElement>>;
declare const CardContent: import("react").ForwardRefExoticComponent<HTMLAttributes<HTMLDivElement> & import("react").RefAttributes<HTMLDivElement>>;
declare const CardFooter: import("react").ForwardRefExoticComponent<HTMLAttributes<HTMLDivElement> & import("react").RefAttributes<HTMLDivElement>>;
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants };
