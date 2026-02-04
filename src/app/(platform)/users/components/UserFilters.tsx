'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Input, Button, Select } from '@music-vine/cadence/ui'
import type { UserStatus, SubscriptionTier } from '@/types'

interface UserFiltersProps {
  currentParams: {
    query: string
    page: number
    status: UserStatus | 'all'
    tier: SubscriptionTier | 'all'
  }
}

/**
 * Client component for user search and filtering.
 * Search requires button click (not auto-search on keystroke per CONTEXT.md).
 * Filter dropdowns update URL immediately on change.
 */
export function UserFilters({ currentParams }: UserFiltersProps) {
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
    status?: UserStatus | 'all'
    tier?: SubscriptionTier | 'all'
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
   * Handle status filter change (immediate URL update).
   */
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ status: e.target.value as UserStatus | 'all' })
  }

  /**
   * Handle tier filter change (immediate URL update).
   */
  const handleTierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ tier: e.target.value as SubscriptionTier | 'all' })
  }

  return (
    <div className="space-y-4">
      {/* Search bar - primary, prominent placement */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search by email, name, username, or ID..."
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
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-2">
        {/* Status filter */}
        <div className="flex-1">
          <label htmlFor="status-filter" className="sr-only">
            Account Status
          </label>
          <Select
            id="status-filter"
            value={currentParams.status}
            onChange={handleStatusChange}
            disabled={isPending}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </Select>
        </div>

        {/* Tier filter */}
        <div className="flex-1">
          <label htmlFor="tier-filter" className="sr-only">
            Subscription Tier
          </label>
          <Select
            id="tier-filter"
            value={currentParams.tier}
            onChange={handleTierChange}
            disabled={isPending}
          >
            <option value="all">All Tiers</option>
            <option value="free">Free</option>
            <option value="creator">Creator</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </Select>
        </div>
      </div>
    </div>
  )
}
