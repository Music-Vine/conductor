'use client'

import { Command } from 'cmdk'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { useGlobalSearch } from '@/hooks/useGlobalSearch'
import { SearchResults } from './SearchResults'

interface CommandPaletteProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CommandPalette({ open: controlledOpen, onOpenChange }: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const { results, isLoading, isSearching } = useGlobalSearch(searchQuery)

  // Handle Cmd+K to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(!open)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, setOpen])

  // Clear search query when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('')
    }
  }, [open])

  const handleSelect = useCallback((path: string) => {
    setOpen(false)
    router.push(path)
  }, [router, setOpen])

  // Get OS-aware modifier display
  const modKey = typeof window !== 'undefined' && /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform) ? '⌘' : 'Ctrl'

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command Palette"
      className="fixed inset-0 z-50"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      {/* Dialog container */}
      <div className="fixed inset-0 flex items-start justify-center pt-[20vh]">
        <div className="w-full max-w-lg overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
          <Command.Input
            placeholder="Search for actions or pages..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="w-full border-b border-gray-200 px-4 py-3 text-base outline-none placeholder:text-gray-400"
          />

          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-gray-500">
              No results found.
            </Command.Empty>

            {/* Search Results - appears when query is >= 2 chars */}
            {searchQuery.length >= 2 && (
              <SearchResults
                results={results}
                isLoading={isLoading || isSearching}
                onSelect={(result) => {
                  setOpen(false)
                  setSearchQuery('')
                  router.push(result.url)
                }}
              />
            )}

            {/* Separator between search results and navigation */}
            {searchQuery.length >= 2 && results.length > 0 && (
              <Command.Separator className="my-2 h-px bg-gray-200" />
            )}

            <Command.Group heading="Navigation" className="px-2 py-1.5">
              <span className="text-xs font-medium text-gray-500">Navigation</span>
              <CommandItem
                onSelect={() => handleSelect('/dashboard')}
                shortcut="G D"
              >
                Dashboard
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelect('/users')}
                shortcut="G U"
              >
                Users
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelect('/assets')}
                shortcut="G A"
              >
                Assets
              </CommandItem>
              <CommandItem
                onSelect={() => handleSelect('/payees')}
                shortcut="G P"
              >
                Payees
              </CommandItem>
            </Command.Group>

            <Command.Group heading="Actions" className="px-2 py-1.5">
              <span className="text-xs font-medium text-gray-500">Actions</span>
              <CommandItem
                onSelect={() => {/* Will be wired later */}}
                shortcut={`${modKey}N`}
              >
                Create New...
              </CommandItem>
              <CommandItem
                onSelect={() => {/* Will be wired later */}}
                shortcut={`${modKey}E`}
              >
                Export Data
              </CommandItem>
            </Command.Group>
          </Command.List>

          {/* Footer with keyboard hints */}
          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span><kbd className="rounded bg-gray-200 px-1.5 py-0.5">↑↓</kbd> to navigate</span>
              <span><kbd className="rounded bg-gray-200 px-1.5 py-0.5">↵</kbd> to select</span>
              <span><kbd className="rounded bg-gray-200 px-1.5 py-0.5">esc</kbd> to close</span>
            </div>
          </div>
        </div>
      </div>
    </Command.Dialog>
  )
}

// Styled command item with shortcut display
function CommandItem({
  children,
  onSelect,
  shortcut,
}: {
  children: React.ReactNode
  onSelect: () => void
  shortcut?: string
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-700 aria-selected:bg-gray-100"
    >
      <span>{children}</span>
      {shortcut && (
        <kbd className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
          {shortcut}
        </kbd>
      )}
    </Command.Item>
  )
}
