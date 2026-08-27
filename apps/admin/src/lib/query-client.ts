import { QueryClient } from '@tanstack/react-query';

import { QUERY_DEFAULTS } from '@nabome/constants';

/** Single QueryClient factory — defaults from @nabome/constants. */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_DEFAULTS.staleTime,
        gcTime: QUERY_DEFAULTS.gcTime,
        retry: QUERY_DEFAULTS.retry,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
