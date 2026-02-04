// QueryClient configuration with AsyncStorage persistence
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create persister for TanStack Query cache
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'REACT_QUERY_OFFLINE_CACHE',
});

// Create QueryClient with offline-first configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data doesn't change without user action (offline-first)
      staleTime: Infinity,
      // Keep cached data for 24 hours
      gcTime: 1000 * 60 * 60 * 24,
      // Retry failed requests
      retry: 2,
      // Refetch on window focus
      refetchOnWindowFocus: false,
      // Refetch on reconnect (even though we're offline-first)
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry failed mutations
      retry: 1,
    },
  },
});
