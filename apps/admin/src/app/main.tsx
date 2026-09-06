import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

import { createQueryClient } from '@/lib/query-client';

import { initSessionListener, bootstrapSession } from '@/lib/api/session';
import { useUiStore } from '@/stores/ui-store';

import { App } from './App';

function bootstrap(): void {
  initSessionListener();
  void bootstrapSession();

  const savedTheme = useUiStore.getState().theme;
  document.documentElement.dataset.theme = savedTheme;

  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Root container #root not found');
  }

  const queryClient = createQueryClient();

  const Providers = (): ReactNode => (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );

  createRoot(container).render(
    <StrictMode>
      <Providers />
    </StrictMode>,
  );
}

bootstrap();
