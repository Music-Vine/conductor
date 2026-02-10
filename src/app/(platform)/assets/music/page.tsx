import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@music-vine/cadence'
import { getAssets } from '@/lib/api/assets'
import type { MusicWorkflowState, Platform } from '@/types'
import { AssetFilters, AssetTable, AssetTablePagination, ExportAssetsButton } from '../components'
import { TableRowSkeleton } from '@/components/skeletons/TableRowSkeleton'

interface SearchParamsProps {
  searchParams: Promise<{
    query?: string
    page?: string
    limit?: string
    status?: string
    platform?: string
    genre?: string
  }>
}

/**
 * Music assets page.
 * Pre-filtered to show only music assets.
 */
export default async function MusicAssetsPage({ searchParams }: SearchParamsProps) {
  const params = await searchParams

  // Parse query parameters (type is fixed to 'music')
  const query = params.query || ''
  const page = params.page ? parseInt(params.page, 10) : 1
  const limit = params.limit ? parseInt(params.limit, 10) : 50
  const status = params.status === 'all' ? undefined : (params.status as MusicWorkflowState | undefined)
  const platform = params.platform === 'all' ? undefined : (params.platform as Platform | 'both' | undefined)
  const genre = params.genre === 'all' ? undefined : params.genre

  // Build filter params with type fixed to 'music'
  const filterParams = {
    query: query || undefined,
    page,
    limit,
    type: 'music' as const,
    status,
    platform,
    genre,
  }

  // Fetch music assets server-side
  const data = await getAssets(filterParams)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Music Assets
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage music tracks and approval workflows
          </p>
        </div>
        <Link href="/assets/upload">
          <Button variant="bold">Upload Music</Button>
        </Link>
      </div>

      {/* Filters (without type selector) */}
      <AssetFilters
        currentParams={{
          query,
          page,
          limit,
          type: 'music',
          status: status || 'all',
          platform: platform || 'all',
          genre: genre || 'all',
        }}
        hideTypeFilter
      />

      {/* Export button */}
      <div className="flex justify-end">
        <ExportAssetsButton />
      </div>

      {/* Assets table */}
      <Suspense fallback={<TableRowSkeleton count={10} />}>
        <AssetTable data={data.data} pagination={data.pagination} />
      </Suspense>

      {/* Pagination */}
      <AssetTablePagination
        currentPage={page}
        pageSize={limit}
        totalPages={data.pagination.totalPages}
        totalItems={data.pagination.totalItems}
      />
    </div>
  )
}
