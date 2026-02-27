'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@music-vine/cadence/ui'
import { exportActivityToCSV } from '@/lib/utils/export-csv'
import { apiClient } from '@/lib/api/client'
import type { SystemActivityEntry } from '@/types/activity'
import type { PaginatedResponse } from '@/types'

interface ExportActivityButtonProps {
  activity: SystemActivityEntry[]
  disabled?: boolean
}

/**
 * Export activity feed to CSV button.
 * Provides two options:
 * - "Export filtered" — downloads the currently displayed activity entries
 * - "Export all" — fetches all activity from the API (no filters) then downloads
 */
export function ExportActivityButton({ activity, disabled }: ExportActivityButtonProps) {
  const [isExportingAll, setIsExportingAll] = useState(false)

  // Defensive check for undefined activity array
  if (!activity || !Array.isArray(activity)) {
    return null
  }

  const handleExportFiltered = () => {
    try {
      exportActivityToCSV(activity)
      toast.success(`Exported ${activity.length} activit${activity.length === 1 ? 'y' : 'ies'} to CSV`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export activity. Please try again.')
    }
  }

  const handleExportAll = async () => {
    setIsExportingAll(true)
    try {
      const response = await apiClient.get<PaginatedResponse<SystemActivityEntry>>('/activity?limit=10000')
      const allActivity = response.data
      exportActivityToCSV(allActivity)
      toast.success(`Exported ${allActivity.length} activit${allActivity.length === 1 ? 'y' : 'ies'} to CSV`)
    } catch (error) {
      console.error('Export all error:', error)
      toast.error('Failed to export all activity. Please try again.')
    } finally {
      setIsExportingAll(false)
    }
  }

  const isFilteredDisabled = disabled || activity.length === 0

  const downloadIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
      <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
    </svg>
  )

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleExportFiltered}
        disabled={isFilteredDisabled}
        variant="subtle"
        className="flex items-center gap-2"
      >
        {downloadIcon}
        <span>Export filtered</span>
      </Button>

      <Button
        onClick={handleExportAll}
        disabled={isExportingAll}
        variant="subtle"
        className="flex items-center gap-2"
      >
        {downloadIcon}
        <span>{isExportingAll ? 'Exporting...' : 'Export all'}</span>
      </Button>
    </div>
  )
}
