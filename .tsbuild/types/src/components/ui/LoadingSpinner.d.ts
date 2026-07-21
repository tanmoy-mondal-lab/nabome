interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}
export declare function LoadingSpinner({ size, className }: LoadingSpinnerProps): import("react").JSX.Element;
interface LoadingStateProps {
    isLoading: boolean;
    children: React.ReactNode;
    fallback?: React.ReactNode;
    size?: "sm" | "md" | "lg";
}
export declare function LoadingState({ isLoading, children, fallback, size }: LoadingStateProps): string | number | bigint | true | import("react").JSX.Element | Iterable<import("react").ReactNode> | Promise<string | number | bigint | boolean | import("react").ReactPortal | import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | Iterable<import("react").ReactNode> | null | undefined>;
interface FullPageLoadingProps {
    message?: string;
}
export declare function FullPageLoading({ message }: FullPageLoadingProps): import("react").JSX.Element;
export {};
