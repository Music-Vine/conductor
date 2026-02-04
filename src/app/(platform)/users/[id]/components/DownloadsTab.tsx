'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import type { Download, License, ActivityItem, PaginatedResponse } from '@/types'

interface DownloadsTabProps {
  userId: string
  downloadCount: number
  licenseCount: number
}

/**
 * Downloads + Licenses tab showing combined activity timeline.
 */
export function DownloadsTab({
  userId,
  downloadCount,
  licenseCount,
}: DownloadsTabProps) {
  const [page, setPage] = useState(1)
  const [allActivity, setAllActivity] = useState<ActivityItem[]>([])

  // Fetch downloads
  const downloadsQuery = useQuery({
    queryKey: ['user', userId, 'downloads', page],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Download>>(
        `/api/users/${userId}/downloads?page=${page}&limit=20`
      )
      return response
    },
  })

  // Fetch licenses
  const licensesQuery = useQuery({
    queryKey: ['user', userId, 'licenses', page],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<License>>(
        `/api/users/${userId}/licenses?page=${page}&limit=20`
      )
      return response
    },
  })

  // Combine downloads and licenses into timeline
  const combineActivity = (): ActivityItem[] => {
    const downloads = downloadsQuery.data?.data || []
    const licenses = licensesQuery.data?.data || []

    const downloadItems: ActivityItem[] = downloads.map((download) => ({
      type: 'download' as const,
      timestamp: download.downloadedAt,
      data: download,
    }))

    const licenseItems: ActivityItem[] = licenses.map((license) => ({
      type: 'license' as const,
      timestamp: license.grantedAt,
      data: license,
    }))

    // Combine and sort by timestamp (newest first)
    const combined = [...downloadItems, ...licenseItems].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    return combined
  }

  // When both queries succeed, combine and store activity
  const activity = combineActivity()
  const isLoading = downloadsQuery.isLoading || licensesQuery.isLoading
  const hasMore =
    (downloadsQuery.data?.pagination.page || 0) <
      (downloadsQuery.data?.pagination.totalPages || 0) ||
    (licensesQuery.data?.pagination.page || 0) <
      (licensesQuery.data?.pagination.totalPages || 0)

  /**
   * Load more activity (next page)
   */
  const handleLoadMore = () => {
    setPage((prev) => prev + 1)
  }

  /**
   * Group activity by date category
   */
  const groupByDate = (items: ActivityItem[]) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const thisWeek = new Date(today)
    thisWeek.setDate(thisWeek.getDate() - 7)

    const groups: { [key: string]: ActivityItem[] } = {
      Today: [],
      Yesterday: [],
      'This Week': [],
      Older: [],
    }

    items.forEach((item) => {
      const itemDate = new Date(item.timestamp)
      const itemDay = new Date(
        itemDate.getFullYear(),
        itemDate.getMonth(),
        itemDate.getDate()
      )

      if (itemDay.getTime() === today.getTime()) {
        groups.Today.push(item)
      } else if (itemDay.getTime() === yesterday.getTime()) {
        groups.Yesterday.push(item)
      } else if (itemDate >= thisWeek) {
        groups['This Week'].push(item)
      } else {
        groups.Older.push(item)
      }
    })

    // Remove empty groups
    return Object.entries(groups).filter(([_, items]) => items.length > 0)
  }

  /**
   * Format timestamp as relative time
   */
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const groupedActivity = groupByDate(activity)

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm text-gray-600">Total Downloads</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {downloadCount}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm text-gray-600">Active Licenses</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {licenseCount}
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-lg border border-gray-200 bg-white">
        {isLoading && page === 1 ? (
          // Loading skeleton
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 rounded bg-gray-200 animate-pulse" />
                    <div className="h-3 w-1/4 rounded bg-gray-200 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activity.length === 0 ? (
          // Empty state
          <div className="p-12 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
              <svg
                className="h-6 w-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="mt-4 text-sm font-medium text-gray-900">
              No activity yet
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Downloads and licenses will appear here
            </p>
          </div>
        ) : (
          // Timeline content
          <div className="divide-y divide-gray-200">
            {groupedActivity.map(([groupName, items]) => (
              <div key={groupName} className="p-6">
                <h3 className="mb-4 text-sm font-semibold text-gray-900">
                  {groupName}
                </h3>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      {/* Icon */}
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          item.type === 'download'
                            ? 'bg-blue-100'
                            : 'bg-green-100'
                        }`}
                      >
                        {item.type === 'download' ? (
                          <svg
                            className="h-5 w-5 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="h-5 w-5 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                          </svg>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {item.type === 'download'
                            ? (item.data as Download).assetName
                            : (item.data as License).assetName}
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                          <span>{formatTimestamp(item.timestamp)}</span>
                          <span>•</span>
                          {item.type === 'download' ? (
                            <>
                              <span className="capitalize">
                                {(item.data as Download).assetType}
                              </span>
                              <span>•</span>
                              <span className="uppercase">
                                {(item.data as Download).format}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="capitalize">
                                {(item.data as License).licenseType} License
                              </span>
                              {(item.data as License).expiresAt && (
                                <>
                                  <span>•</span>
                                  <span>
                                    Expires{' '}
                                    {new Date(
                                      (item.data as License).expiresAt!
                                    ).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </span>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load more button */}
        {hasMore && !isLoading && (
          <div className="border-t border-gray-200 p-4">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isLoading}
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Load more'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
