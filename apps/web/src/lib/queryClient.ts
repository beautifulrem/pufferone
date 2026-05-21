import { QueryClient } from '@tanstack/react-query'

/// Global React Query client. Defaults:
/// - 60s staleTime — Puffer mainnet API rate limit is 100req/15min per IP.
/// - 2 retries with exponential backoff
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})
