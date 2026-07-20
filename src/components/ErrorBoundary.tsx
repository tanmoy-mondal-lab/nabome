import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log error details for debugging
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    };

    // In production, send to error tracking service
    if (import.meta.env.PROD && typeof window !== 'undefined') {
      // Error tracking integration pending - storing in sessionStorage for debugging
      try {
        const errors = JSON.parse(sessionStorage.getItem('error-log') || '[]');
        errors.push(errorDetails);
        sessionStorage.setItem('error-log', JSON.stringify(errors.slice(-10))); // Keep last 10 errors
      } catch {
        // SessionStorage unavailable
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-[400px] flex items-center justify-center bg-white px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">Something went wrong</h2>
            <p className="text-sm text-neutral-500 mb-6">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-sm hover:bg-brand-600 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.location.reload();
                  }
                }}
                className="px-5 py-2.5 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-sm hover:bg-neutral-200 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
