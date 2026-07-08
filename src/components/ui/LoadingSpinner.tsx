// ─────────────────────────────────────────────────────────────
// LOADING SPINNER COMPONENT
// ─────────────────────────────────────────────────────────────
// Reusable loading spinner for various UI states
// ─────────────────────────────────────────────────────────────

import { cn } from "../../lib/utils/cn";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

interface LoadingStateProps {
  isLoading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export function LoadingState({ isLoading, children, fallback, size = "md" }: LoadingStateProps) {
  if (isLoading) {
    return fallback || <LoadingSpinner size={size} />;
  }
  return <>{children}</>;
}

interface FullPageLoadingProps {
  message?: string;
}

export function FullPageLoading({ message = "Loading..." }: FullPageLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
}
