import Link from 'next/link'
import type { SystemActivityEntry, ActivityEntityType } from '@/types'
import { formatRelativeTime } from '@/lib/utils/format-relative-time'

interface ActivityTableProps {
  entries: SystemActivityEntry[]
}

/**
 * Badge colours for each entity type in the activity table.
 */
const entityTypeBadgeClasses: Record<ActivityEntityType, string> = {
  asset: 'bg-purple-100 text-purple-800',
  user: 'bg-blue-100 text-blue-800',
  contributor: 'bg-green-100 text-green-800',
  payee: 'bg-amber-100 text-amber-800',
}

const entityTypeLabels: Record<ActivityEntityType, string> = {
  asset: 'Asset',
  user: 'User',
  contributor: 'Contributor',
  payee: 'Payee',
}

/**
 * Resolve an entity detail URL from its type and ID.
 */
function entityDetailUrl(entityType: ActivityEntityType, entityId: string): string {
  switch (entityType) {
    case 'asset': return `/assets/${entityId}`
    case 'user': return `/users/${entityId}`
    case 'contributor': return `/contributors/${entityId}`
    case 'payee': return `/payees/${entityId}`
  }
}

/**
 * Activity entries table.
 *
 * NOT a TanStack Table - simpler list since there is no sorting or bulk selection needed.
 * Columns: Time, Actor, Action, Entity (with link), Entity Type badge.
 */
export function ActivityTable({ entries }: ActivityTableProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white py-12 text-center dark:border-gray-800 dark:bg-gray-900">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No activity found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          No activity entries match the current filters.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
      {/* Table header */}
      <div className="grid bg-gray-50 dark:bg-gray-800" style={{ gridTemplateColumns: '160px 140px 160px 1fr 120px' }}>
        {['Time', 'Actor', 'Action', 'Entity', 'Type'].map((col) => (
          <div
            key={col}
            className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300"
          >
            {col}
          </div>
        ))}
      </div>

      {/* Table body */}
      <div className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="grid items-center py-3 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
            style={{ gridTemplateColumns: '160px 140px 160px 1fr 120px' }}
          >
            {/* Time */}
            <div className="px-4 text-xs text-gray-500 dark:text-gray-400">
              {formatRelativeTime(new Date(entry.createdAt))}
            </div>

            {/* Actor */}
            <div className="px-4 font-medium text-gray-700 dark:text-gray-300">
              {entry.actorName}
            </div>

            {/* Action */}
            <div className="px-4 text-gray-600 dark:text-gray-400">
              {entry.action}
            </div>

            {/* Entity name (linked to detail page) */}
            <div className="px-4">
              <Link
                href={entityDetailUrl(entry.entityType, entry.entityId)}
                className="font-medium text-gray-900 hover:underline dark:text-gray-100"
                title={entry.details}
              >
                {entry.entityName}
              </Link>
              {entry.details && (
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate">
                  {entry.details}
                </p>
              )}
            </div>

            {/* Entity type badge */}
            <div className="px-4">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${entityTypeBadgeClasses[entry.entityType]}`}
              >
                {entityTypeLabels[entry.entityType]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
