import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function createQueryClientWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}
