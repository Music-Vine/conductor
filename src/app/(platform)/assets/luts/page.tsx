import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@music-vine/cadence'
import { getAssets } from '@/lib/api/assets'
import type { SimpleWorkflowState } from '@/types'
import { AssetFilters, AssetTable, AssetTablePagination, ExportAssetsButton } from '../components'
import { TableRowSkeleton } from '@/components/skeletons/TableRowSkeleton'

interface SearchParamsProps {
  searchParams: Promise<{
    query?: string
    page?: string
    limit?: string
    status?: string
  }>
}

export default async function LutsAssetsPage({ searchParams }: SearchParamsProps) {
  const params = await searchParams

  const query = params.query || ''
  const page = params.page ? parseInt(params.page, 10) : 1
  const limit = params.limit ? parseInt(params.limit, 10) : 50
  const status = params.status === 'all' ? undefined : (params.status as SimpleWorkflowState | undefined)

  const filterParams = {
    query: query || undefined,
    page,
    limit,
    type: 'lut' as const,
    platform: 'uppbeat' as const,
    status,
  }

  const data = await getAssets(filterParams)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            LUT Assets
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage color grading LUTs for Uppbeat
          </p>
        </div>
        <Link href="/assets/upload">
          <Button variant="bold">Upload LUTs</Button>
        </Link>
      </div>

      <AssetFilters
        currentParams={{
          query,
          page,
          limit,
          type: 'lut',
          status: status || 'all',
          platform: 'uppbeat',
          genre: 'all',
        }}
        hideTypeFilter
        hidePlatformFilter
        hideGenreFilter
      />

      <div className="flex justify-end">
        <ExportAssetsButton />
      </div>

      <Suspense fallback={<TableRowSkeleton count={10} />}>
        <AssetTable data={data.data} pagination={data.pagination} />
      </Suspense>

      <AssetTablePagination
        currentPage={page}
        pageSize={limit}
        totalPages={data.pagination.totalPages}
        totalItems={data.pagination.totalItems}
      />
    </div>
  )
}
