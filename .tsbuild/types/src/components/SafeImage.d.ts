import { type ImgHTMLAttributes } from "react";
interface SafeImageProps extends ImgHTMLAttributes<HTMLImageElement> {
    src?: string;
    alt: string;
    fallback?: string;
    useTransform?: boolean;
    transformWidth?: number;
    responsive?: boolean;
    priority?: boolean;
    showSkeleton?: boolean;
    premium?: boolean;
}
export declare function SafeImage({ src, alt, fallback, useTransform, transformWidth, responsive, priority, showSkeleton, premium, className, onLoad: externalOnLoad, onError: externalOnError, ...props }: SafeImageProps): import("react").JSX.Element;
export {};
