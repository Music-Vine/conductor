'use client'

import { useState, useEffect } from 'react'
import type { Asset } from '@/types/asset'
import { getAssetActivity, type ActivityEntry } from '@/lib/api/assets'
import { formatRelativeTime } from '@/lib/utils/format-relative-time'

interface ActivityTabProps {
  asset: Asset
}

export function ActivityTab({ asset }: ActivityTabProps) {
  const [activity, setActivity] = useState<ActivityEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadActivity() {
      try {
        const data = await getAssetActivity(asset.id)
        setActivity(data)
      } catch (error) {
        console.error('Failed to load activity:', error)
      } finally {
        setLoading(false)
      }
    }
    loadActivity()
  }, [asset.id])

  if (loading) {
    return <div className="text-gray-500">Loading activity...</div>
  }

  if (activity.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600">No activity recorded for this asset.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-gray-900">Activity Log</h2>

      <div className="flow-root">
        <ul className="-mb-8">
          {activity.map((entry, index) => (
            <li key={entry.id}>
              <div className="relative pb-8">
                {index !== activity.length - 1 && (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                      <ActivityIcon action={entry.action} />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium text-gray-900">{entry.actorName}</span>
                        {' '}{entry.action.toLowerCase()}
                      </p>
                      {entry.details && (
                        <p className="mt-1 text-sm text-gray-600">{entry.details}</p>
                      )}
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                      {formatRelativeTime(new Date(entry.createdAt))}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function ActivityIcon({ action }: { action: string }) {
  const iconClass = 'h-4 w-4 text-gray-500'

  if (action.includes('create') || action.includes('Created')) {
    return (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    )
  }
  if (action.includes('update') || action.includes('edit') || action.includes('Updated')) {
    return (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    )
  }
  if (action.includes('approve') || action.includes('Approved') || action.includes('publish')) {
    return (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    )
  }
  if (action.includes('reject') || action.includes('Rejected')) {
    return (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    )
  }
  if (action.includes('Changed')) {
    return (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    )
  }

  return (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

// formatRelativeTime imported from @/lib/utils/format-relative-time
