import { Suspense } from 'react'
import Link from 'next/link'
import { fetchContributors } from '@/lib/api/contributors'
import type { ContributorStatus } from '@/types'
import { ContributorFilters, ContributorTable, ContributorTablePagination, ExportContributorsButton } from './components'
import { TableRowSkeleton } from '@/components/skeletons/TableRowSkeleton'
import { Button } from '@music-vine/cadence/ui'

interface SearchParamsProps {
  searchParams: Promise<{
    query?: string
    page?: string
    status?: string
    limit?: string
  }>
}

/**
 * Contributors management page.
 * Server component that handles search and filtering via URL parameters.
 */
export default async function ContributorsPage({ searchParams }: SearchParamsProps) {
  // Await searchParams (Next.js 15 pattern)
  const params = await searchParams

  // Parse query parameters
  const query = params.query || ''
  const page = params.page ? parseInt(params.page, 10) : 1
  const limit = params.limit ? parseInt(params.limit, 10) : 20
  const status =
    params.status === 'all' ? undefined : (params.status as ContributorStatus | undefined)

  // Build filter params (omit 'all' values)
  const filterParams = {
    query: query || undefined,
    page,
    limit,
    status,
  }

  // Fetch contributors server-side
  const data = await fetchContributors(filterParams)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Contributors
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage contributor profiles and payee assignments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportContributorsButton contributors={data.data} />
          <Button variant="bold" asChild>
            <Link href="/contributors/new">Add Contributor</Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <ContributorFilters
        currentParams={{
          query,
          page,
          status: status || 'all',
        }}
      />

      {/* Results */}
      <Suspense
        key={JSON.stringify(params)}
        fallback={<TableRowSkeleton columns={5} rows={10} />}
      >
        <ContributorTable
          data={data.data}
          pagination={data.pagination}
        />
        <ContributorTablePagination pagination={data.pagination} />
      </Suspense>
    </div>
  )
}
