'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Button } from '@music-vine/cadence/ui'

interface PayeeTablePaginationProps {
  pagination: {
    page: number
    pageSize: number
    totalPages: number
    totalItems: number
  }
}

export function PayeeTablePagination({ pagination }: PayeeTablePaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Defensive check for undefined pagination
  if (!pagination) {
    return null
  }

  const { page, pageSize, totalPages, totalItems } = pagination

  // Calculate display range
  const start = (page - 1) * pageSize + 1
  const end = Math.min(start + pageSize - 1, totalItems)

  function navigateToPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString())

    if (newPage === 1) {
      params.delete('page')
    } else {
      params.set('page', newPage.toString())
    }

    const queryString = params.toString()
    const url = queryString ? `${pathname}?${queryString}` : pathname

    startTransition(() => {
      router.push(url)
    })
  }

  function handlePageSizeChange(newPageSize: number) {
    const params = new URLSearchParams(searchParams.toString())

    // Reset to page 1 when changing page size
    params.delete('page')

    if (newPageSize === 10) {
      params.delete('limit')
    } else {
      params.set('limit', newPageSize.toString())
    }

    const queryString = params.toString()
    const url = queryString ? `${pathname}?${queryString}` : pathname

    startTransition(() => {
      router.push(url)
    })
  }

  const isFirstPage = page === 1
  const isLastPage = page === totalPages

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      {/* Results info */}
      <div className="flex flex-1 items-center justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{start}</span> to{' '}
            <span className="font-medium">{end}</span> of{' '}
            <span className="font-medium">{totalItems}</span> payees
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Page size selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="page-size-payees" className="text-sm text-gray-700">
              Per page:
            </label>
            <select
              id="page-size-payees"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(parseInt(e.target.value, 10))}
              disabled={isPending}
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:opacity-50"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
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
            <span className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>
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

      {/* Loading indicator */}
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50">
          <div className="text-sm text-gray-600">Loading...</div>
        </div>
      )}
    </div>
  )
}
