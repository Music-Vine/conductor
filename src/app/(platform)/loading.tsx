import { Card, CardHeader, CardContent, Skeleton } from '@music-vine/cadence/ui'

/**
 * Dashboard loading state - shows Cadence Skeleton components matching dashboard layout.
 * Uses Next.js loading.tsx convention for automatic Suspense boundary.
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-5 w-64" />
      </div>

      {/* Card grid skeleton - matches DashboardCard layout */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-2 h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info section skeleton */}
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-40" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
