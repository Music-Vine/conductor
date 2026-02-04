'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

interface ShortcutContextValue {
  activeScope: string | null
  setActiveScope: (scope: string | null) => void
  isInputFocused: boolean
  setInputFocused: (focused: boolean) => void
}

const ShortcutContext = createContext<ShortcutContextValue | null>(null)

export function ShortcutProvider({ children }: { children: ReactNode }) {
  const [activeScope, setActiveScope] = useState<string | null>(null)
  const [isInputFocused, setInputFocused] = useState(false)

  return (
    <ShortcutContext.Provider
      value={{
        activeScope,
        setActiveScope,
        isInputFocused,
        setInputFocused,
      }}
    >
      {children}
    </ShortcutContext.Provider>
  )
}

export function useShortcutContext() {
  const context = useContext(ShortcutContext)
  if (!context) {
    throw new Error('useShortcutContext must be used within ShortcutProvider')
  }
  return context
}
