import { BaseSkeleton } from '@/components/skeletons/BaseSkeleton'
import { TableRowSkeleton } from '@/components/skeletons/TableRowSkeleton'

/**
 * Loading skeleton for assets page.
 * Matches the layout of the actual page for seamless loading experience.
 */
export default function AssetsLoading() {
  return (
    <div className="space-y-6">
      {/* Page header skeleton */}
      <div>
        <BaseSkeleton height="h-8" width="w-32" />
        <div className="mt-1">
          <BaseSkeleton height="h-4" width="w-64" />
        </div>
      </div>

      {/* Filters skeleton */}
      <div className="space-y-4">
        {/* Search bar skeleton */}
        <div className="flex gap-2">
          <div className="flex-1">
            <BaseSkeleton height="h-10" width="w-full" />
          </div>
          <BaseSkeleton height="h-10" width="w-24" />
        </div>

        {/* Filter dropdowns skeleton (4 filters) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <BaseSkeleton height="h-10" width="w-full" />
          <BaseSkeleton height="h-10" width="w-full" />
          <BaseSkeleton height="h-10" width="w-full" />
          <BaseSkeleton height="h-10" width="w-full" />
        </div>
      </div>

      {/* Export button skeleton */}
      <div className="flex justify-end">
        <BaseSkeleton height="h-10" width="w-32" />
      </div>

      {/* Results skeleton */}
      <div className="space-y-4">
        {/* Table skeleton */}
        <TableRowSkeleton columns={7} rows={10} />
      </div>
    </div>
  )
}
