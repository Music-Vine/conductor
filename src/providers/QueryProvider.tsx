'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

interface QueryProviderProps {
  children: ReactNode
}

/**
 * React Query Provider for Next.js App Router.
 *
 * Uses useState to create a singleton QueryClient that persists
 * across re-renders but is unique per request in SSR.
 *
 * Configuration:
 * - staleTime: 60s (data considered fresh for 1 minute)
 * - refetchOnWindowFocus: false (don't refetch when tab gains focus)
 * - retry: 1 (retry failed requests once)
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is fresh for 60 seconds
            staleTime: 60 * 1000,
            // Don't refetch on window focus (admin app, explicit refreshes)
            refetchOnWindowFocus: false,
            // Retry failed requests once
            retry: 1,
            // Retry delay with exponential backoff
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            // Don't retry mutations by default
            retry: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
