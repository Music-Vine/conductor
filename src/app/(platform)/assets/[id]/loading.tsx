import { BaseSkeleton } from '@/components/skeletons'

export default function AssetDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Back link skeleton */}
      <BaseSkeleton width="w-32" height="h-4" />

      {/* Header skeleton */}
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <BaseSkeleton width="w-64" height="h-8" />
            <BaseSkeleton width="w-16" height="h-6" />
            <BaseSkeleton width="w-24" height="h-6" />
          </div>
          <BaseSkeleton width="w-48" height="h-4" />
        </div>
        <BaseSkeleton width="w-24" height="h-6" />
      </div>

      {/* Tabs skeleton */}
      <div className="space-y-6">
        <div className="flex gap-4 border-b border-gray-200 pb-3">
          <BaseSkeleton width="w-24" height="h-8" />
          <BaseSkeleton width="w-24" height="h-8" />
          <BaseSkeleton width="w-24" height="h-8" />
          <BaseSkeleton width="w-24" height="h-8" />
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BaseSkeleton width="w-full" height="h-96" />
          </div>
          <div className="space-y-6">
            <BaseSkeleton width="w-full" height="h-64" />
            <BaseSkeleton width="w-full" height="h-32" />
          </div>
        </div>
      </div>
    </div>
  )
}
