import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

import { createBrowserLogger } from '@nabome/logging';
import { Button } from '@nabome/ui';

const logger = createBrowserLogger({ service: 'customer', level: 'error' });

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * ErrorBoundary — catches render-phase errors, logs them, and shows a
 * recoverable error page (ERROR_HANDLING_LOADING_STATES...SPECIFICATION).
 */
export class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error('Render error', {
      error: error.message,
      componentStack: info.componentStack,
    });
  }

  private readonly reset = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  override render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }
    return (
      <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="font-display text-2xl">Something went wrong</p>
        <p className="max-w-md text-sm text-(--text-secondary)">
          An unexpected error occurred. Please try again.
        </p>
        <Button onClick={this.reset}>Try again</Button>
      </div>
    );
  }
}
