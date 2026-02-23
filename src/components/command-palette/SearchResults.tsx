'use client'

import { Command } from 'cmdk'
import type { SearchResultItem } from '@/hooks/useGlobalSearch'

interface SearchResultsProps {
  results: SearchResultItem[]
  isLoading: boolean
  onSelect: (result: SearchResultItem) => void
}

// Icons for each entity type
const entityIcons: Record<string, React.ReactNode> = {
  user: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  asset: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  ),
  payee: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  contributor: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
}

const entityLabels: Record<string, string> = {
  user: 'User',
  asset: 'Asset',
  payee: 'Payee',
  contributor: 'Contributor',
}

export function SearchResults({ results, isLoading, onSelect }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="py-6 text-center">
        <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
        <p className="mt-2 text-sm text-gray-500">Searching...</p>
      </div>
    )
  }

  if (results.length === 0) {
    return null // Let Command.Empty handle this
  }

  // IMPORTANT: Results are rendered as a FLAT LIST - no Command.Group wrapper
  // This matches user decision: "Mixed relevance - all results together sorted by relevance/recency (not grouped by type)"
  // The results array is already sorted by relevance from the useGlobalSearch hook
  return (
    <>
      {results.map((result) => (
        <Command.Item
          key={`${result.type}-${result.id}`}
          value={`${result.title} ${result.subtitle}`}
          onSelect={() => onSelect(result)}
          className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm aria-selected:bg-gray-100"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
            {entityIcons[result.type]}
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate">{result.title}</div>
            <div className="text-xs text-gray-500 truncate">{result.subtitle}</div>
          </div>
          <span className="text-xs text-gray-400 shrink-0">
            {entityLabels[result.type]}
          </span>
        </Command.Item>
      ))}
    </>
  )
}
