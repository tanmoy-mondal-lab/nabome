interface SkeletonProps {
    className?: string;
    variant?: "text" | "circular" | "rectangular";
    width?: string | number;
    height?: string | number;
}
export declare function Skeleton({ className, variant, width, height }: SkeletonProps): import("react").JSX.Element;
export declare function ProductCardSkeleton(): import("react").JSX.Element;
export declare function TextSkeleton({ lines }: {
    lines?: number;
}): import("react").JSX.Element;
export {};
