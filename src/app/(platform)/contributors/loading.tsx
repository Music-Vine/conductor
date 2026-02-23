import { BaseSkeleton } from '@/components/skeletons/BaseSkeleton'
import { TableRowSkeleton } from '@/components/skeletons/TableRowSkeleton'

/**
 * Loading skeleton for contributors page.
 * Matches the layout of the actual page for seamless loading experience.
 */
export default function ContributorsLoading() {
  return (
    <div className="space-y-6">
      {/* Page header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <BaseSkeleton height="h-8" width="w-40" />
          <div className="mt-1">
            <BaseSkeleton height="h-4" width="w-72" />
          </div>
        </div>
        <BaseSkeleton height="h-10" width="w-36" />
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

        {/* Filter dropdowns skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-2">
          <div className="flex-1">
            <BaseSkeleton height="h-10" width="w-full" />
          </div>
        </div>
      </div>

      {/* Results skeleton */}
      <div className="space-y-4">
        {/* Pagination info skeleton */}
        <BaseSkeleton height="h-4" width="w-48" />

        {/* Table skeleton */}
        <TableRowSkeleton columns={5} rows={10} />
      </div>
    </div>
  )
}
