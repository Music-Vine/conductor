'use client'

import { JotaiProvider, ThemeProvider, QueryProvider } from '@/providers'
import { Sidebar, Header } from '@/components/layout'
import type { Platform } from '@/types'

interface PlatformLayoutClientProps {
  children: React.ReactNode
  initialPlatform: Platform
  userName: string
  userEmail: string
  userId: string
}

/**
 * Client layout with providers for authenticated pages.
 */
export function PlatformLayoutClient({
  children,
  initialPlatform,
  userName,
  userEmail,
  userId,
}: PlatformLayoutClientProps) {
  return (
    <JotaiProvider>
      <QueryProvider>
        <ThemeProvider>
          <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
            <Sidebar userId={userId} />
            <div className="flex flex-1 flex-col overflow-hidden">
              <Header userName={userName} userEmail={userEmail} />
              <main className="flex-1 overflow-auto p-6">
                {children}
              </main>
            </div>
          </div>
        </ThemeProvider>
      </QueryProvider>
    </JotaiProvider>
  )
}
