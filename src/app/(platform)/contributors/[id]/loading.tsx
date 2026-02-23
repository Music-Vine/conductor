import { BaseSkeleton } from '@/components/skeletons'

/**
 * Loading skeleton for contributor detail page.
 * Matches the structure of the actual page.
 */
export default function ContributorDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Back link skeleton */}
      <BaseSkeleton width="w-36" height="h-4" />

      {/* Contributor header skeleton */}
      <div className="space-y-2">
        {/* Name skeleton */}
        <BaseSkeleton width="w-48" height="h-7" />

        {/* Email skeleton */}
        <BaseSkeleton width="w-64" height="h-4" />

        {/* Status badge skeleton */}
        <div className="flex items-center gap-4">
          <BaseSkeleton width="w-20" height="h-6" />
          <BaseSkeleton width="w-32" height="h-4" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="space-y-6">
        {/* Tab bar skeleton */}
        <div className="flex gap-4 border-b border-gray-200 pb-3">
          <BaseSkeleton width="w-20" height="h-8" />
          <BaseSkeleton width="w-20" height="h-8" />
          <BaseSkeleton width="w-20" height="h-8" />
        </div>

        {/* Content area skeleton */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="space-y-3">
            <BaseSkeleton width="w-full" height="h-4" />
            <BaseSkeleton width="w-3/4" height="h-4" />
            <BaseSkeleton width="w-5/6" height="h-4" />
            <BaseSkeleton width="w-2/3" height="h-4" />
          </div>
        </div>
      </div>
    </div>
  )
}
