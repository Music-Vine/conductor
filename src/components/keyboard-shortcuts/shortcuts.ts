export type ShortcutCategory = 'navigation' | 'actions' | 'table' | 'general'

export interface ShortcutDefinition {
  key: string           // Key combo for react-hotkeys-hook (e.g., 'mod+k', 'j')
  display: string       // Display string for UI (e.g., 'Cmd+K' or 'Ctrl+K')
  description: string   // Human-readable description
  category: ShortcutCategory
  scope?: string        // Optional scope (e.g., 'table') for context-aware shortcuts
}

export const shortcuts: ShortcutDefinition[] = [
  // Navigation
  { key: 'g u', display: 'G U', description: 'Go to Users', category: 'navigation' },
  { key: 'g a', display: 'G A', description: 'Go to Assets', category: 'navigation' },
  { key: 'g p', display: 'G P', description: 'Go to Payees', category: 'navigation' },

  // Actions
  { key: 'mod+k', display: 'Cmd+K', description: 'Open Command Palette', category: 'actions' },
  { key: 'mod+n', display: 'Cmd+N', description: 'Create New', category: 'actions' },
  { key: 'mod+e', display: 'Cmd+E', description: 'Export Data', category: 'actions' },

  // Table (context-aware - only active when table is focused)
  { key: 'j', display: 'J', description: 'Select Next Row', category: 'table', scope: 'table' },
  { key: 'k', display: 'K', description: 'Select Previous Row', category: 'table', scope: 'table' },
  { key: 'space', display: 'Space', description: 'Toggle Row Selection', category: 'table', scope: 'table' },
  { key: 'shift+j', display: 'Shift+J', description: 'Extend Selection Down', category: 'table', scope: 'table' },
  { key: 'shift+k', display: 'Shift+K', description: 'Extend Selection Up', category: 'table', scope: 'table' },
  { key: 'mod+a', display: 'Cmd+A', description: 'Select All Rows', category: 'table', scope: 'table' },
  { key: 'x', display: 'X', description: 'Open Actions Menu', category: 'table', scope: 'table' },

  // General
  { key: 'slash', display: '/', description: 'Focus Search', category: 'general' },
  { key: 'shift+slash', display: '?', description: 'Show Keyboard Shortcuts', category: 'general' },
  { key: 'escape', display: 'Esc', description: 'Close Modal / Clear Selection', category: 'general' },
]

// Helper to get OS-aware modifier key display
export function getModifierDisplay(): string {
  if (typeof window === 'undefined') return 'Cmd'
  return /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform) ? 'Cmd' : 'Ctrl'
}

// Get shortcuts by category
export function getShortcutsByCategory(): Record<ShortcutCategory, ShortcutDefinition[]> {
  return shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) acc[shortcut.category] = []
    acc[shortcut.category].push(shortcut)
    return acc
  }, {} as Record<ShortcutCategory, ShortcutDefinition[]>)
}
