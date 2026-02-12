import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@music-vine/cadence'
import { getAssets } from '@/lib/api/assets'
import type { AssetType, MusicWorkflowState, SimpleWorkflowState, Platform } from '@/types'
import { AssetFilters, AssetListClient, ExportAssetsButton } from './components'
import { TableRowSkeleton } from '@/components/skeletons/TableRowSkeleton'

interface SearchParamsProps {
  searchParams: Promise<{
    query?: string
    page?: string
    limit?: string
    type?: string
    status?: string
    platform?: string
    genre?: string
  }>
}

/**
 * Assets management page.
 * Server component that handles search and filtering via URL parameters.
 */
export default async function AssetsPage({ searchParams }: SearchParamsProps) {
  // Await searchParams (Next.js 15 pattern)
  const params = await searchParams

  // Parse query parameters
  const query = params.query || ''
  const page = params.page ? parseInt(params.page, 10) : 1
  const limit = params.limit ? parseInt(params.limit, 10) : 50
  const type = params.type === 'all' ? undefined : (params.type as AssetType | undefined)
  const status = params.status === 'all' ? undefined : (params.status as MusicWorkflowState | SimpleWorkflowState | undefined)
  const platform = params.platform === 'all' ? undefined : (params.platform as Platform | 'both' | undefined)
  const genre = params.genre === 'all' ? undefined : params.genre

  // Build filter params (omit 'all' values)
  const filterParams = {
    query: query || undefined,
    page,
    limit,
    type,
    status,
    platform,
    genre,
  }

  // Fetch assets server-side
  const data = await getAssets(filterParams)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Assets
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage submitted assets and approval workflows
          </p>
        </div>
        <Link href="/assets/upload">
          <Button variant="bold">Upload Assets</Button>
        </Link>
      </div>

      {/* Filters */}
      <AssetFilters
        currentParams={{
          query,
          page,
          limit,
          type: type || 'all',
          status: status || 'all',
          platform: platform || 'all',
          genre: genre || 'all',
        }}
      />

      {/* Export button */}
      <div className="flex justify-end">
        <ExportAssetsButton assets={data.data} />
      </div>

      {/* Results */}
      <Suspense
        key={JSON.stringify(params)}
        fallback={<TableRowSkeleton columns={8} rows={10} />}
      >
        <AssetListClient
          initialData={data.data}
          pagination={data.pagination}
        />
      </Suspense>
    </div>
  )
}
