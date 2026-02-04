import { Suspense } from 'react'
import { fetchUsers } from '@/lib/api/users'
import type { UserStatus, SubscriptionTier } from '@/types'
import { UserFilters } from './components/UserFilters'
import { TableRowSkeleton } from '@/components/skeletons/TableRowSkeleton'

interface SearchParamsProps {
  searchParams: Promise<{
    query?: string
    page?: string
    status?: string
    tier?: string
  }>
}

/**
 * Users management page.
 * Server component that handles search and filtering via URL parameters.
 */
export default async function UsersPage({ searchParams }: SearchParamsProps) {
  // Await searchParams (Next.js 15 pattern)
  const params = await searchParams

  // Parse query parameters
  const query = params.query || ''
  const page = params.page ? parseInt(params.page, 10) : 1
  const status = params.status === 'all' ? undefined : (params.status as UserStatus | undefined)
  const tier = params.tier === 'all' ? undefined : (params.tier as SubscriptionTier | undefined)

  // Build filter params (omit 'all' values)
  const filterParams = {
    query: query || undefined,
    page,
    status,
    tier,
  }

  // Fetch users server-side
  const data = await fetchUsers(filterParams)

  // Calculate pagination display
  const startIndex = (data.pagination.page - 1) * data.pagination.pageSize + 1
  const endIndex = Math.min(
    data.pagination.page * data.pagination.pageSize,
    data.pagination.totalItems
  )

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Users
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Search and manage user accounts
        </p>
      </div>

      {/* Filters */}
      <UserFilters
        currentParams={{
          query,
          page,
          status: status || 'all',
          tier: tier || 'all',
        }}
      />

      {/* Results */}
      <Suspense fallback={<TableRowSkeleton columns={5} rows={10} />}>
        <div className="space-y-4">
          {/* Pagination info */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startIndex}–{endIndex} of {data.pagination.totalItems} users
          </div>

          {/* Table placeholder - will be built in next plan */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              User table component will be implemented in next plan
            </p>
            <pre className="mt-4 text-xs text-gray-500">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      </Suspense>
    </div>
  )
}
