import { Suspense } from 'react'
import { fetchUsers } from '@/lib/api/users'
import type { UserStatus, SubscriptionTier } from '@/types'
import { UserFilters, UserTable, UserTablePagination, ExportUsersButton } from './components'
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

      {/* Export button */}
      <div className="flex justify-end">
        <ExportUsersButton users={data.data} />
      </div>

      {/* Results */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <Suspense
          key={JSON.stringify(params)}
          fallback={<TableRowSkeleton columns={5} rows={10} />}
        >
          <UserTable data={data.data} pagination={data.pagination} />
        </Suspense>
        <UserTablePagination pagination={data.pagination} />
      </div>
    </div>
  )
}
