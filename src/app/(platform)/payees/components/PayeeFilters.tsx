'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Input, Button } from '@music-vine/cadence/ui'
import type { PayeeStatus, PaymentMethod } from '@/types'

interface PayeeFiltersProps {
  currentParams: {
    query: string
    page: number
    status: PayeeStatus | 'all'
    paymentMethod: PaymentMethod | 'all'
  }
}

/**
 * Client component for payee search and filtering.
 * Search requires button click (not auto-search on keystroke per CONTEXT.md).
 * Filter dropdowns update URL immediately on change.
 */
export function PayeeFilters({ currentParams }: PayeeFiltersProps) {
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
    status?: PayeeStatus | 'all'
    paymentMethod?: PaymentMethod | 'all'
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

    // Update paymentMethod
    if (updates.paymentMethod !== undefined) {
      if (updates.paymentMethod === 'all') {
        params.delete('paymentMethod')
      } else {
        params.set('paymentMethod', updates.paymentMethod)
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
    updateFilters({ status: e.target.value as PayeeStatus | 'all' })
  }

  /**
   * Handle payment method filter change (immediate URL update).
   */
  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ paymentMethod: e.target.value as PaymentMethod | 'all' })
  }

  const selectStyles = {
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 0.5rem center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '1.5em 1.5em',
  } as const

  const selectClassName =
    'h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-gray-900 transition-colors hover:border-gray-300 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50'

  return (
    <div className="space-y-4">
      {/* Search bar - primary, prominent placement */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search by name or email..."
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
            Payee Status
          </label>
          <select
            id="status-filter"
            value={currentParams.status}
            onChange={handleStatusChange}
            disabled={isPending}
            className={selectClassName}
            style={selectStyles}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Payment method filter */}
        <div className="flex-1">
          <label htmlFor="payment-method-filter" className="sr-only">
            Payment Method
          </label>
          <select
            id="payment-method-filter"
            value={currentParams.paymentMethod}
            onChange={handlePaymentMethodChange}
            disabled={isPending}
            className={selectClassName}
            style={selectStyles}
          >
            <option value="all">All Methods</option>
            <option value="ach">ACH</option>
            <option value="wire">Wire</option>
            <option value="check">Check</option>
            <option value="paypal">PayPal</option>
          </select>
        </div>
      </div>
    </div>
  )
}
