import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

import { ErrorBoundary } from '@/shared/feedback/ErrorBoundary';
import { ToastProvider } from '@/shared/feedback/Toast';

import { initAnalytics } from '@/lib/analytics';
import { initSessionListener, bootstrapSession } from '@/lib/api/session';
import { createQueryClient } from '@/lib/query-client';

import { useUiStore } from '@/stores/ui-store';

import { App } from './App';
import '../styles/globals.css';

function bootstrap(): void {
  // Initialize analytics early for session tracking
  initAnalytics();

  // Clear auth state and redirect when the session is genuinely expired
  initSessionListener();

  // Restore a persisted cookie session before first render so a reload
  // is never mistaken for a logout (guards render Loading… meanwhile)
  void bootstrapSession();

  // Apply saved theme before render to prevent flash
  const savedTheme = useUiStore.getState().theme;
  document.documentElement.dataset.theme = savedTheme;

  // Set up viewport meta tag for mobile devices
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute(
      'content',
      'width=device-width, initial-scale=1.0, viewport-fit=cover',
    );
  }

  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Root container #root not found');
  }

  const queryClient = createQueryClient();

  const Providers = (): ReactNode => (
    <ErrorBoundary>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ToastProvider>
    </ErrorBoundary>
  );

  createRoot(container).render(
    <StrictMode>
      <Providers />
    </StrictMode>,
  );
}

bootstrap();
