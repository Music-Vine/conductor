'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Input, Button } from '@music-vine/cadence/ui'
import type { AssetType, MusicWorkflowState, SimpleWorkflowState, Platform } from '@/types'

interface AssetFiltersProps {
  currentParams: {
    query: string
    page: number
    limit: number
    type: AssetType | 'all'
    status: MusicWorkflowState | SimpleWorkflowState | 'all'
    platform: Platform | 'both' | 'all'
    genre: string | 'all'
  }
  hideTypeFilter?: boolean
  hidePlatformFilter?: boolean
  hideGenreFilter?: boolean
}

/**
 * Client component for asset search and filtering.
 * Search requires button click (not auto-search on keystroke per CONTEXT.md).
 * Filter dropdowns update URL immediately on change.
 */
export function AssetFilters({
  currentParams,
  hideTypeFilter = false,
  hidePlatformFilter = false,
  hideGenreFilter = false,
}: AssetFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Controlled search input (NOT debounced)
  const [searchInput, setSearchInput] = useState(currentParams.query)

  /**
   * Update URL with new filter parameters.
   * Always resets page to 1 when filters change.
   */
  const updateFilters = (updates: {
    query?: string
    type?: AssetType | 'all'
    status?: MusicWorkflowState | SimpleWorkflowState | 'all'
    platform?: Platform | 'both' | 'all'
    genre?: string | 'all'
  }) => {
    const params = new URLSearchParams(searchParams)

    // Update query
    if (updates.query !== undefined) {
      if (updates.query) {
        params.set('query', updates.query)
      } else {
        params.delete('query')
      }
    }

    // Update type
    if (updates.type !== undefined) {
      if (updates.type === 'all') {
        params.delete('type')
      } else {
        params.set('type', updates.type)
      }
    }

    // Update status
    if (updates.status !== undefined) {
      if (updates.status === 'all') {
        params.delete('status')
      } else {
        params.set('status', updates.status)
      }
    }

    // Update platform
    if (updates.platform !== undefined) {
      if (updates.platform === 'all') {
        params.delete('platform')
      } else {
        params.set('platform', updates.platform)
      }
    }

    // Update genre
    if (updates.genre !== undefined) {
      if (updates.genre === 'all') {
        params.delete('genre')
      } else {
        params.set('genre', updates.genre)
      }
    }

    // Always reset to page 1 when filters change
    params.delete('page')

    const queryString = params.toString()
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname

    startTransition(() => {
      router.push(newUrl)
    })
  }

  /**
   * Handle search button click.
   * CRITICAL: Search only executes when button is clicked (per CONTEXT.md).
   */
  const handleSearch = () => {
    updateFilters({ query: searchInput })
  }

  /**
   * Handle Enter key in search input (alternative to button click).
   */
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  /**
   * Handle type filter change (immediate URL update).
   */
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ type: e.target.value as AssetType | 'all' })
  }

  /**
   * Handle status filter change (immediate URL update).
   */
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ status: e.target.value as MusicWorkflowState | SimpleWorkflowState | 'all' })
  }

  /**
   * Handle platform filter change (immediate URL update).
   */
  const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ platform: e.target.value as Platform | 'both' | 'all' })
  }

  /**
   * Handle genre filter change (immediate URL update).
   */
  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ genre: e.target.value })
  }

  return (
    <div className="space-y-4">
      {/* Search bar - primary, prominent placement */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search assets..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            disabled={isPending}
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={isPending}
          variant="bold"
          className="h-full"
        >
          {isPending ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {/* Filter dropdowns - secondary, less prominent */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Type filter */}
        {!hideTypeFilter && (
          <div>
            <label htmlFor="type-filter" className="sr-only">
              Asset Type
            </label>
            <select
              id="type-filter"
              value={currentParams.type}
              onChange={handleTypeChange}
              disabled={isPending}
              className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-gray-900 transition-colors hover:border-gray-300 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
              }}
            >
              <option value="all">All Types</option>
              <option value="music">Music</option>
              <option value="sfx">SFX</option>
              <option value="motion-graphics">Motion Graphics</option>
              <option value="lut">LUTs</option>
              <option value="stock-footage">Stock Footage</option>
            </select>
          </div>
        )}

        {/* Status filter */}
        <div>
          <label htmlFor="status-filter" className="sr-only">
            Workflow Status
          </label>
          <select
            id="status-filter"
            value={currentParams.status}
            onChange={handleStatusChange}
            disabled={isPending}
            className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-gray-900 transition-colors hover:border-gray-300 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em',
            }}
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="initial_review">In Review</option>
            <option value="quality_check">In Review</option>
            <option value="platform_assignment">In Review</option>
            <option value="final_approval">In Review</option>
            <option value="review">In Review</option>
            <option value="published">Published</option>
            <option value="rejected_initial">Rejected</option>
            <option value="rejected_quality">Rejected</option>
            <option value="rejected_final">Rejected</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Platform filter */}
        {!hidePlatformFilter && (
          <div>
            <label htmlFor="platform-filter" className="sr-only">
              Platform
            </label>
            <select
              id="platform-filter"
              value={currentParams.platform}
              onChange={handlePlatformChange}
              disabled={isPending}
              className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-gray-900 transition-colors hover:border-gray-300 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
              }}
            >
              <option value="all">All Platforms</option>
              <option value="music-vine">Music Vine</option>
              <option value="uppbeat">Uppbeat</option>
              <option value="both">Both</option>
            </select>
          </div>
        )}

        {/* Genre filter */}
        {!hideGenreFilter && (
          <div>
            <label htmlFor="genre-filter" className="sr-only">
              Genre
            </label>
            <select
              id="genre-filter"
              value={currentParams.genre}
              onChange={handleGenreChange}
              disabled={isPending}
              className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-gray-900 transition-colors hover:border-gray-300 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
              }}
            >
              <option value="all">All Genres</option>
              <option value="Rock">Rock</option>
              <option value="Electronic">Electronic</option>
              <option value="Cinematic">Cinematic</option>
              <option value="Pop">Pop</option>
              <option value="Hip Hop">Hip Hop</option>
              <option value="Jazz">Jazz</option>
              <option value="Classical">Classical</option>
              <option value="Ambient">Ambient</option>
              <option value="Folk">Folk</option>
              <option value="Country">Country</option>
              <option value="R&B">R&B</option>
              <option value="Reggae">Reggae</option>
            </select>
          </div>
        )}
      </div>
    </div>
  )
}
