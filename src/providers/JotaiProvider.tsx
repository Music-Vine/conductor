'use client'

import { Provider } from 'jotai'
import type { ReactNode } from 'react'

interface JotaiProviderProps {
  children: ReactNode
}

/**
 * Jotai Provider wrapper for Next.js App Router.
 *
 * IMPORTANT: Per research, this should NOT be placed in root layout.tsx
 * to avoid hydration issues with Suspense boundaries.
 * Use it in page.tsx or per-route layouts instead.
 */
export function JotaiProvider({ children }: JotaiProviderProps) {
  return <Provider>{children}</Provider>
}
