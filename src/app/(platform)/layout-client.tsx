'use client'

import { useState } from 'react'
import { JotaiProvider, ThemeProvider, QueryProvider } from '@/providers'
import { Sidebar, Header } from '@/components/layout'
import { CommandPalette } from '@/components/command-palette/CommandPalette'
import { ShortcutProvider } from '@/components/keyboard-shortcuts/ShortcutProvider'
import { ShortcutCheatSheet } from '@/components/keyboard-shortcuts/ShortcutCheatSheet'
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
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  return (
    <JotaiProvider>
      <QueryProvider>
        <ThemeProvider>
          <ShortcutProvider>
            <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
              <Sidebar userId={userId} />
              <div className="flex flex-1 flex-col overflow-hidden">
                <Header
                  userName={userName}
                  userEmail={userEmail}
                  onOpenCommandPalette={() => setCommandPaletteOpen(true)}
                />
                <main className="flex-1 overflow-auto p-6">
                  {children}
                </main>
              </div>
            </div>
            <CommandPalette
              open={commandPaletteOpen}
              onOpenChange={setCommandPaletteOpen}
            />
            <ShortcutCheatSheet />
          </ShortcutProvider>
        </ThemeProvider>
      </QueryProvider>
    </JotaiProvider>
  )
}
