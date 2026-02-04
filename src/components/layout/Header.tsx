'use client'

import { UserMenu } from './UserMenu'

interface HeaderProps {
  title?: string
  userName: string
  userEmail: string
  onOpenCommandPalette?: () => void
}

export function Header({ title, userName, userEmail, onOpenCommandPalette }: HeaderProps) {
  // Get OS-aware modifier display
  const modKey = typeof window !== 'undefined' && /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform) ? '⌘' : 'Ctrl'

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-800 dark:bg-gray-900">
      <div>
        {title && (
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h1>
        )}
      </div>
      <div className="flex items-center gap-4">
        {/* Command palette trigger button */}
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-100"
            aria-label="Open command palette"
            aria-keyshortcuts="Control+k Meta+k"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Search...</span>
            <kbd className="ml-2 rounded bg-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-600">
              {modKey}K
            </kbd>
          </button>
        )}
        <UserMenu name={userName} email={userEmail} />
      </div>
    </header>
  )
}
