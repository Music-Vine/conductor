'use client'

import { useHotkeys, type Options } from 'react-hotkeys-hook'
import { useShortcutContext } from '@/components/keyboard-shortcuts/ShortcutProvider'
import { useCallback } from 'react'

interface UseKeyboardShortcutsOptions {
  scope?: string  // Only fire if this scope is active (e.g., 'table')
  enabled?: boolean
  enableOnFormTags?: boolean  // Allow in inputs (default false for safety)
}

export function useKeyboardShortcuts(
  keys: string,
  callback: (event: KeyboardEvent) => void,
  options: UseKeyboardShortcutsOptions = {}
) {
  const { activeScope, isInputFocused } = useShortcutContext()
  const { scope, enabled = true, enableOnFormTags = false } = options

  // Determine if shortcut should be active
  const isEnabled = useCallback(() => {
    if (!enabled) return false
    if (isInputFocused && !enableOnFormTags) return false
    if (scope && activeScope !== scope) return false
    return true
  }, [enabled, isInputFocused, enableOnFormTags, scope, activeScope])

  const hotkeysOptions: Options = {
    enabled: isEnabled(),
    enableOnFormTags: enableOnFormTags ? ['INPUT', 'TEXTAREA', 'SELECT'] : false,
    preventDefault: true,
  }

  useHotkeys(keys, callback, hotkeysOptions, [callback, isEnabled])
}

// Hook for setting scope when a component mounts/focuses
export function useShortcutScope(scope: string) {
  const { setActiveScope } = useShortcutContext()

  const activate = useCallback(() => {
    setActiveScope(scope)
  }, [scope, setActiveScope])

  const deactivate = useCallback(() => {
    setActiveScope(null)
  }, [setActiveScope])

  return { activate, deactivate }
}
