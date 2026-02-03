import { Suspense } from 'react'
import { fetchUsers } from '@/lib/api/users'
import type { UserStatus, SubscriptionTier } from '@/types/user'
import { UserFilters } from './components/UserFilters'
import { TableRowSkeleton } from '@/components/skeletons'

interface SearchParams {
  query?: string
  status?: string
  tier?: string
  page?: string
  limit?: string
}

interface UsersPageProps {
  searchParams: Promise<SearchParams>
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams

  // Parse search parameters
  const query = params.query || ''
  const page = parseInt(params.page || '1', 10)
  const limit = parseInt(params.limit || '50', 10)
  const status = (params.status === 'active' || params.status === 'suspended')
    ? params.status
    : 'all'
  const tier = (params.tier === 'free' || params.tier === 'creator' || params.tier === 'pro' || params.tier === 'enterprise')
    ? params.tier
    : 'all'

  // Fetch users server-side
  const fetchParams: {
    query?: string
    page: number
    limit: number
    status?: UserStatus
    tier?: SubscriptionTier
  } = { page, limit }

  if (query) fetchParams.query = query
  if (status !== 'all') fetchParams.status = status as UserStatus
  if (tier !== 'all') fetchParams.tier = tier as SubscriptionTier

  const result = await fetchUsers(fetchParams)

  // Calculate range for display
  const start = (result.pagination.page - 1) * result.pagination.pageSize + 1
  const end = Math.min(start + result.pagination.pageSize - 1, result.pagination.totalItems)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Users</h1>

      <UserFilters
        currentParams={{
          query,
          status: status as UserStatus | 'all',
          tier: tier as SubscriptionTier | 'all',
        }}
      />

      <div className="rounded-lg border border-gray-200 bg-white">
        <Suspense fallback={<TableRowSkeleton columns={5} rows={10} />}>
          {/* Table placeholder - will be added in plan 02-04 */}
          <div className="p-8 text-center text-gray-500">
            <p>Table component coming in next task...</p>
            <p className="mt-2 text-sm">
              Found {result.pagination.totalItems} users
              {result.data.length > 0 && ` (showing ${start}-${end})`}
            </p>
          </div>
        </Suspense>
      </div>

      {/* Pagination info */}
      {result.pagination.totalItems > 0 && (
        <div className="text-sm text-gray-600">
          Showing {start}-{end} of {result.pagination.totalItems} users
        </div>
      )}
    </div>
  )
}
