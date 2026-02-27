'use client'

import Link from 'next/link'
import type { SystemActivityEntry, ActivityEntityType } from '@/types'
import { formatRelativeTime } from '@/lib/utils/format-relative-time'

interface ActivityFeedWidgetProps {
  entries: SystemActivityEntry[]
}

/**
 * Entity type icons for the activity feed widget.
 * asset = music note, user = person, contributor = group, payee = dollar sign
 */
function EntityTypeIcon({ entityType }: { entityType: ActivityEntityType }) {
  const iconClass = 'h-4 w-4 text-gray-500'

  if (entityType === 'asset') {
    return (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    )
  }

  if (entityType === 'user') {
    return (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  }

  if (entityType === 'contributor') {
    return (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  }

  // payee = dollar sign
  return (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
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
 * Resolve the Activity page URL pre-filtered for a specific entity click-through.
 * Links to /activity?entityId=asset-42&entityType=asset
 */
function activityFilterUrl(entityType: ActivityEntityType, entityId: string): string {
  return `/activity?entityType=${entityType}&entityId=${entityId}`
}

/**
 * Compact activity feed widget for the dashboard home page.
 * Shows last 10 entries with actor, action, entity name, and relative time.
 * Clicking an entry navigates to the entity detail page (not filtered activity).
 */
export function ActivityFeedWidget({ entries }: ActivityFeedWidgetProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      {/* Widget header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Recent Activity
        </h2>
        <Link
          href="/activity"
          className="text-sm font-medium text-platform-primary hover:underline"
        >
          View all activity
        </Link>
      </div>

      {/* Activity list */}
      {entries.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          No activity recorded yet.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-gray-100 dark:divide-gray-800">
          {entries.map((entry) => (
            <li key={entry.id} className="py-3">
              <div className="flex items-center gap-3">
                {/* Entity type icon */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  <EntityTypeIcon entityType={entry.entityType} />
                </div>

                {/* Middle: actor + action + entity (links to entity detail) */}
                <div className="min-w-0 flex-1">
                  <Link
                    href={activityFilterUrl(entry.entityType, entry.entityId)}
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    title={entry.details}
                  >
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {entry.actorName}
                    </span>
                    {' '}
                    <span className="lowercase">{entry.action}</span>
                    {' '}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {entry.entityName}
                    </span>
                  </Link>
                </div>

                {/* Right: relative time */}
                <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                  {formatRelativeTime(new Date(entry.createdAt))}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
