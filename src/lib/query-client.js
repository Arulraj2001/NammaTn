import { QueryClient } from '@tanstack/react-query';

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      staleTime: 300_000, // 5 minutes to prevent repeated Supabase queries on navigation
      gcTime: 15 * 60_000,
    },
    mutations: {
      retry: 1,
    },
  },
});