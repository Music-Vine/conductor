import { BaseSkeleton } from '@/components/skeletons/BaseSkeleton'

export default function CollectionsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <BaseSkeleton className="h-8 w-48" />
          <BaseSkeleton className="h-4 w-64" />
        </div>
        <BaseSkeleton className="h-10 w-40" />
      </div>

      {/* Collection grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <BaseSkeleton className="h-6 w-3/4 mb-3" />
            <BaseSkeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}
