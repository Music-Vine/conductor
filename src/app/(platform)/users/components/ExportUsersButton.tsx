'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@music-vine/cadence/ui'
import { exportUsersToCSV } from '@/lib/utils/export-csv'
import { apiClient } from '@/lib/api/client'
import type { UserListItem } from '@/types'
import type { PaginatedResponse } from '@/types'

interface ExportUsersButtonProps {
  users: UserListItem[]
  disabled?: boolean
}

/**
 * Export users to CSV button.
 * Provides two options:
 * - "Export filtered" — downloads the currently displayed/filtered data
 * - "Export all" — fetches all users from the API (no filters) then downloads
 */
export function ExportUsersButton({ users, disabled }: ExportUsersButtonProps) {
  const [isExportingAll, setIsExportingAll] = useState(false)

  // Defensive check for undefined users array
  if (!users || !Array.isArray(users)) {
    return null
  }

  const handleExportFiltered = () => {
    try {
      exportUsersToCSV(users)
      toast.success(`Exported ${users.length} user${users.length === 1 ? '' : 's'} to CSV`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export users. Please try again.')
    }
  }

  const handleExportAll = async () => {
    setIsExportingAll(true)
    try {
      const response = await apiClient.get<PaginatedResponse<UserListItem>>('/users?limit=10000')
      const allUsers = response.data
      exportUsersToCSV(allUsers)
      toast.success(`Exported ${allUsers.length} user${allUsers.length === 1 ? '' : 's'} to CSV`)
    } catch (error) {
      console.error('Export all error:', error)
      toast.error('Failed to export all users. Please try again.')
    } finally {
      setIsExportingAll(false)
    }
  }

  const isFilteredDisabled = disabled || users.length === 0

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
