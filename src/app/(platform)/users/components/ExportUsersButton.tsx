'use client'

import { toast } from 'sonner'
import { Button } from '@music-vine/cadence/ui'
import { exportUsersToCSV } from '@/lib/utils/export-csv'
import type { UserListItem } from '@/types'

interface ExportUsersButtonProps {
  users: UserListItem[]
  disabled?: boolean
}

/**
 * Export users to CSV button.
 * Downloads current page/filtered results as CSV file with formatted headers.
 */
export function ExportUsersButton({ users, disabled }: ExportUsersButtonProps) {
  // Defensive check for undefined users array
  if (!users || !Array.isArray(users)) {
    return null
  }

  const handleExport = () => {
    try {
      exportUsersToCSV(users)
      toast.success(`Exported ${users.length} user${users.length === 1 ? '' : 's'} to CSV`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export users. Please try again.')
    }
  }

  const isDisabled = disabled || users.length === 0

  return (
    <Button
      onClick={handleExport}
      disabled={isDisabled}
      variant="outline"
      className="flex items-center gap-2"
    >
      {/* Download icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4"
      >
        <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
        <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
      </svg>
      <span>Export CSV</span>
    </Button>
  )
}
