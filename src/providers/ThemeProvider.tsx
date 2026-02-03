'use client'

import { useAtom } from 'jotai'
import { useEffect, type ReactNode } from 'react'
import { platformAtom } from '@/atoms'

interface ThemeProviderProps {
  children: ReactNode
}

/**
 * Theme Provider that applies platform-specific styling.
 * Sets data-platform attribute on document element for CSS theming.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [platform] = useAtom(platformAtom)

  useEffect(() => {
    // Set data-platform attribute for CSS theming
    document.documentElement.setAttribute('data-platform', platform)

    // Also update CSS custom properties directly for components
    // that need JS access to colors
    const config = platform === 'music-vine'
      ? { primary: '#1a1a2e', accent: '#16213e' }
      : { primary: '#0f3460', accent: '#533483' }

    document.documentElement.style.setProperty('--platform-primary', config.primary)
    document.documentElement.style.setProperty('--platform-accent', config.accent)
  }, [platform])

  return <>{children}</>
}
