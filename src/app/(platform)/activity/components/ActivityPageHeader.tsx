'use client'

import type { SystemActivityEntry } from '@/types/activity'
import { ExportActivityButton } from './ExportActivityButton'

interface ActivityPageHeaderProps {
  activity: SystemActivityEntry[]
}

/**
 * Activity page header with export buttons.
 * Designed to be integrated into ActivityFeedClient once that component is created.
 */
export function ActivityPageHeader({ activity }: ActivityPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Activity</h1>
        <p className="mt-1 text-sm text-gray-600">
          System-wide audit trail of all staff actions
        </p>
      </div>
      <ExportActivityButton activity={activity} />
    </div>
  )
}
