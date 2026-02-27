'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Input, Button } from '@music-vine/cadence/ui'
import type { SystemActivityEntry, ActivityEntityType } from '@/types'
import { ActivityTable } from './ActivityTable'
import { ExportActivityButton } from './ExportActivityButton'

interface PaginationInfo {
  page: number
  pageSize: number
  totalPages: number
  totalItems: number
}

interface ActivityFeedClientProps {
  entries: SystemActivityEntry[]
  pagination: PaginationInfo
  initialEntityType: string
  initialEntityId: string
  initialQuery: string
}

const selectStyles = {
  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
  backgroundPosition: 'right 0.5rem center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '1.5em 1.5em',
} as const

const selectClassName =
  'h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-gray-900 transition-colors hover:border-gray-300 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100'

const ENTITY_TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All Types' },
  { value: 'asset', label: 'Assets' },
  { value: 'user', label: 'Users' },
  { value: 'contributor', label: 'Contributors' },
  { value: 'payee', label: 'Payees' },
]

/**
 * Client component for the full Activity page.
 *
 * - Entity ID search input (requires button click to apply)
 * - Entity type filter dropdown (immediate URL update on change)
 * - URL-based state so pre-filtered navigation from the dashboard widget works
 * - Pagination via URL params
 */
export function ActivityFeedClient({
  entries,
  pagination,
  initialEntityType,
  initialEntityId,
  initialQuery,
}: ActivityFeedClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Controlled input values (not applied until Search is clicked)
  const [entityIdInput, setEntityIdInput] = useState(initialEntityId)
  const [queryInput, setQueryInput] = useState(initialQuery)

  /**
   * Update URL with new filter parameters.
   * Always resets page to 1 when filters change.
   */
  function updateFilters(updates: {
    entityType?: string
    entityId?: string
    query?: string
    page?: number
  }) {
    const params = new URLSearchParams(searchParams)

    if (updates.entityType !== undefined) {
      if (updates.entityType === 'all') {
        params.delete('entityType')
      } else {
        params.set('entityType', updates.entityType)
      }
    }

    if (updates.entityId !== undefined) {
      if (updates.entityId) {
        params.set('entityId', updates.entityId)
      } else {
        params.delete('entityId')
      }
    }

    if (updates.query !== undefined) {
      if (updates.query) {
        params.set('query', updates.query)
      } else {
        params.delete('query')
      }
    }

    if (updates.page !== undefined) {
      if (updates.page === 1) {
        params.delete('page')
      } else {
        params.set('page', updates.page.toString())
      }
    } else {
      // Changing filters resets to page 1
      params.delete('page')
    }

    const queryString = params.toString()
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname

    startTransition(() => {
      router.push(newUrl)
    })
  }

  /** Apply text search via button click (consistent with other pages). */
  function handleSearch() {
    updateFilters({ entityId: entityIdInput, query: queryInput })
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  /** Entity type dropdown updates URL immediately on change. */
  function handleEntityTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    updateFilters({ entityType: e.target.value })
  }

  /** Clear all filters and reset to page 1. */
  function handleClearFilters() {
    setEntityIdInput('')
    setQueryInput('')
    startTransition(() => {
      router.push(pathname)
    })
  }

  const hasActiveFilters = initialEntityType !== 'all' || initialEntityId || initialQuery

  // Pagination navigation
  function navigateToPage(newPage: number) {
    updateFilters({ page: newPage })
  }

  function handlePageSizeChange(newSize: number) {
    const params = new URLSearchParams(searchParams)
    params.delete('page')
    if (newSize === 50) {
      params.delete('limit')
    } else {
      params.set('limit', newSize.toString())
    }
    const queryString = params.toString()
    const url = queryString ? `${pathname}?${queryString}` : pathname
    startTransition(() => router.push(url))
  }

  const { page, pageSize, totalPages, totalItems } = pagination
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(start + pageSize - 1, totalItems)
  const isFirstPage = page === 1
  const isLastPage = page === totalPages

  return (
    <div className="space-y-4">
      {/* Filters bar */}
      <div className="space-y-3">
        {/* Entity ID / query search + entity type filter on same row */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Free-text entity search */}
          <div className="flex flex-1 gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by entity ID or name..."
                value={entityIdInput}
                onChange={(e) => setEntityIdInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                disabled={isPending}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isPending}
              variant="bold"
              className="shrink-0"
            >
              {isPending ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Entity type dropdown (immediate) */}
          <div className="sm:w-48">
            <label htmlFor="entity-type-filter" className="sr-only">
              Entity Type
            </label>
            <select
              id="entity-type-filter"
              value={initialEntityType || 'all'}
              onChange={handleEntityTypeChange}
              disabled={isPending}
              className={selectClassName}
              style={selectStyles}
            >
              {ENTITY_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active filter summary + clear link */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Filtered by:</span>
            {initialEntityType && initialEntityType !== 'all' && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 capitalize dark:bg-gray-800 dark:text-gray-300">
                Type: {initialEntityType}
              </span>
            )}
            {initialEntityId && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                ID: {initialEntityId}
              </span>
            )}
            {initialQuery && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                Search: {initialQuery}
              </span>
            )}
            <button
              onClick={handleClearFilters}
              className="ml-1 text-gray-500 underline hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Export */}
      <div className="flex justify-end">
        <ExportActivityButton activity={entries} />
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {totalItems === 0
          ? 'No activity entries found'
          : `Showing ${start}–${end} of ${totalItems} entries`}
      </p>

      {/* Activity table */}
      <ActivityTable entries={entries} />

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900 sm:px-6">
          <div className="flex flex-1 items-center justify-between">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Page <span className="font-medium">{page}</span> of{' '}
              <span className="font-medium">{totalPages}</span>
            </p>

            <div className="flex items-center gap-4">
              {/* Page size selector */}
              <div className="flex items-center gap-2">
                <label htmlFor="activity-page-size" className="text-sm text-gray-700 dark:text-gray-300">
                  Per page:
                </label>
                <select
                  id="activity-page-size"
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(parseInt(e.target.value, 10))}
                  disabled={isPending}
                  className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                >
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => navigateToPage(1)}
                  disabled={isFirstPage || isPending}
                  variant="subtle"
                  size="sm"
                >
                  First
                </Button>
                <Button
                  onClick={() => navigateToPage(page - 1)}
                  disabled={isFirstPage || isPending}
                  variant="subtle"
                  size="sm"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => navigateToPage(page + 1)}
                  disabled={isLastPage || isPending}
                  variant="subtle"
                  size="sm"
                >
                  Next
                </Button>
                <Button
                  onClick={() => navigateToPage(totalPages)}
                  disabled={isLastPage || isPending}
                  variant="subtle"
                  size="sm"
                >
                  Last
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
