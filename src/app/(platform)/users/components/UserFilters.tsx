'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Input, Button } from '@music-vine/cadence/ui'
import type { UserStatus, SubscriptionTier } from '@/types/user'

interface UserFiltersProps {
  currentParams: {
    query: string
    status: UserStatus | 'all'
    tier: SubscriptionTier | 'all'
  }
}

/**
 * Search and filter controls for the users list page.
 * Uses URL state management with search button (not auto-search).
 */
export function UserFilters({ currentParams }: UserFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Controlled search input state
  const [searchQuery, setSearchQuery] = useState(currentParams.query)

  /**
   * Update URL with new filter parameters.
   * Always resets to page 1 when filters change.
   */
  const updateFilters = (updates: {
    query?: string
    status?: UserStatus | 'all'
    tier?: SubscriptionTier | 'all'
  }) => {
    const params = new URLSearchParams(searchParams.toString())

    // Update query
    if (updates.query !== undefined) {
      if (updates.query) {
        params.set('query', updates.query)
      } else {
        params.delete('query')
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

    // Update tier
    if (updates.tier !== undefined) {
      if (updates.tier === 'all') {
        params.delete('tier')
      } else {
        params.set('tier', updates.tier)
      }
    }

    // Always reset to page 1 when filters change
    params.delete('page')

    // Navigate with transition
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  /**
   * Handle search button click.
   * Only executes search when button is clicked (not on keystroke).
   */
  const handleSearch = () => {
    updateFilters({ query: searchQuery })
  }

  /**
   * Handle Enter key in search input.
   * Alternative to clicking the search button.
   */
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  /**
   * Handle status filter change.
   * Triggers immediate URL update.
   */
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ status: e.target.value as UserStatus | 'all' })
  }

  /**
   * Handle tier filter change.
   * Triggers immediate URL update.
   */
  const handleTierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ tier: e.target.value as SubscriptionTier | 'all' })
  }

  return (
    <div className="space-y-4">
      {/* Search input with button - primary control */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search by email, name, username, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            disabled={isPending}
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={isPending}
        >
          {isPending ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {/* Filter dropdowns - secondary controls */}
      <div className="flex flex-wrap gap-4">
        {/* Account status filter */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="status-filter"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Status:
          </label>
          <select
            id="status-filter"
            value={currentParams.status}
            onChange={handleStatusChange}
            disabled={isPending}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Subscription tier filter */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="tier-filter"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Tier:
          </label>
          <select
            id="tier-filter"
            value={currentParams.tier}
            onChange={handleTierChange}
            disabled={isPending}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="all">All</option>
            <option value="free">Free</option>
            <option value="creator">Creator</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>
    </div>
  )
}
