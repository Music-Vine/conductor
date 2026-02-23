import { BaseSkeleton } from '@/components/skeletons/BaseSkeleton'

/**
 * Loading skeleton for payee detail page.
 * Matches the layout of the actual page for seamless loading experience.
 */
export default function PayeeDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Back link skeleton */}
      <BaseSkeleton height="h-5" width="w-28" />

      {/* Payee header skeleton */}
      <div className="flex items-start gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <BaseSkeleton height="h-8" width="w-64" />
            <BaseSkeleton height="h-6" width="w-16" circle />
          </div>
          <BaseSkeleton height="h-5" width="w-48" />
          <BaseSkeleton height="h-4" width="w-32" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div>
        {/* Tab list skeleton */}
        <div className="flex border-b border-gray-200 gap-1">
          <BaseSkeleton height="h-10" width="w-20" />
          <BaseSkeleton height="h-10" width="w-28" />
        </div>

        {/* Tab content skeleton */}
        <div className="mt-6 space-y-6">
          {/* Section skeleton */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-white p-6 space-y-3">
              <BaseSkeleton height="h-4" width="w-32" />
              <div className="divide-y divide-gray-100">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="grid grid-cols-3 gap-4 py-3">
                    <BaseSkeleton height="h-4" width="w-full" />
                    <div className="col-span-2">
                      <BaseSkeleton height="h-4" width="w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
