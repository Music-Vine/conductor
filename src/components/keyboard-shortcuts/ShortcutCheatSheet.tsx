'use client'

import { useState, useEffect } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { getShortcutsByCategory, getModifierDisplay, type ShortcutCategory } from './shortcuts'

interface ShortcutCheatSheetProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const categoryTitles: Record<ShortcutCategory, string> = {
  navigation: 'Navigation',
  actions: 'Actions',
  table: 'Table',
  general: 'General',
}

const categoryOrder: ShortcutCategory[] = ['general', 'navigation', 'actions', 'table']

export function ShortcutCheatSheet({ open: controlledOpen, onOpenChange }: ShortcutCheatSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = controlledOpen ?? internalOpen
  const setIsOpen = onOpenChange ?? setInternalOpen

  const shortcutsByCategory = getShortcutsByCategory()
  const modKey = getModifierDisplay()

  // Open on ? key (Shift+/)
  useHotkeys('shift+/', (e) => {
    e.preventDefault()
    setIsOpen(true)
  }, {
    enableOnFormTags: false,
  })

  // Close on Escape
  useHotkeys('escape', () => {
    if (isOpen) setIsOpen(false)
  }, {
    enabled: isOpen,
  })

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-cheat-sheet]')) {
        setIsOpen(false)
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [isOpen, setIsOpen])

  if (!isOpen) return null

  // Replace 'mod' with actual modifier key in display
  const formatDisplay = (display: string) => {
    return display.replace(/Cmd/g, modKey).replace(/⌘/g, modKey)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

      {/* Dialog */}
      <div
        data-cheat-sheet
        role="dialog"
        aria-label="Keyboard Shortcuts"
        className="relative z-10 w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Keyboard Shortcuts</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {categoryOrder.map((category) => {
            const shortcuts = shortcutsByCategory[category]
            if (!shortcuts || shortcuts.length === 0) return null

            return (
              <div key={category}>
                <h3 className="mb-3 text-sm font-medium text-gray-500 uppercase tracking-wider">
                  {categoryTitles[category]}
                </h3>
                <dl className="space-y-2">
                  {shortcuts.map((shortcut) => (
                    <div key={shortcut.key} className="flex items-center justify-between">
                      <dt className="text-sm text-gray-700">{shortcut.description}</dt>
                      <dd>
                        <kbd className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                          {formatDisplay(shortcut.display)}
                        </kbd>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
          Press <kbd className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">?</kbd> anytime to see this guide
        </div>
      </div>
    </div>
  )
}
