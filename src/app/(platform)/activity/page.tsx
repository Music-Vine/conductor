import type { ActivityEntityType } from '@/types'
import { getActivity } from '@/lib/api/activity'
import { ActivityFeedClient } from './components/ActivityFeedClient'

interface SearchParamsProps {
  searchParams: Promise<{
    entityType?: string
    entityId?: string
    query?: string
    page?: string
    limit?: string
  }>
}

/**
 * Full system-wide Activity page.
 *
 * Server component that resolves searchParams, fetches activity data,
 * and passes it to the ActivityFeedClient for interactive filtering and pagination.
 *
 * Supports pre-filtering via URL params:
 *   - ?entityType=asset          — filter to a specific entity type
 *   - ?entityId=asset-42         — filter to a specific entity
 *   - ?query=Thompson            — search by actor/entity name (partial)
 *
 * Dashboard widget links use ?entityType=&entityId= for click-through.
 */
export default async function ActivityPage({ searchParams }: SearchParamsProps) {
  const params = await searchParams

  const page = params.page ? Math.max(1, parseInt(params.page, 10)) : 1
  const limit = params.limit ? Math.min(100, Math.max(1, parseInt(params.limit, 10))) : 50

  // Validate entityType is one of the allowed values
  const validEntityTypes: ActivityEntityType[] = ['asset', 'user', 'contributor', 'payee']
  const entityType = validEntityTypes.includes(params.entityType as ActivityEntityType)
    ? (params.entityType as ActivityEntityType)
    : undefined

  const entityId = params.entityId || undefined

  // Fetch activity data server-side
  const data = await getActivity({
    page,
    limit,
    entityType,
    entityId,
  })

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Activity
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          System-wide activity feed — all changes made by staff across every entity
        </p>
      </div>

      {/* Client component handles filters + table + pagination */}
      <ActivityFeedClient
        entries={data.data}
        pagination={data.pagination}
        initialEntityType={params.entityType || 'all'}
        initialEntityId={params.entityId || ''}
        initialQuery={params.query || ''}
      />
    </div>
  )
}
