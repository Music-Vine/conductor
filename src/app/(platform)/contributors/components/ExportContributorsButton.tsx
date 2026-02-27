'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@music-vine/cadence/ui'
import { exportContributorsToCSV, exportFinancialDataToCSV } from '@/lib/utils/export-csv'
import { apiClient } from '@/lib/api/client'
import type { ContributorListItem } from '@/types'
import type { PaginatedResponse } from '@/types'

interface ExportContributorsButtonProps {
  contributors: ContributorListItem[]
  disabled?: boolean
}

/**
 * Export contributors to CSV button.
 * Provides two options:
 * - "Export filtered" — downloads the currently displayed/filtered data (contributors + financial data)
 * - "Export all" — fetches all contributors from the API (no filters) then downloads
 * Also provides a dedicated "Export Financial Data" button for accounting purposes.
 */
export function ExportContributorsButton({ contributors, disabled }: ExportContributorsButtonProps) {
  const [isExportingAll, setIsExportingAll] = useState(false)

  // Defensive check for undefined contributors array
  if (!contributors || !Array.isArray(contributors)) {
    return null
  }

  const handleExportFiltered = () => {
    try {
      exportContributorsToCSV(contributors)
      toast.success(`Exported ${contributors.length} contributor${contributors.length === 1 ? '' : 's'} to CSV`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export contributors. Please try again.')
    }
  }

  const handleExportFinancial = async () => {
    try {
      const response = await fetch('/api/financials/export', {
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to fetch financial data')
      }
      const result = await response.json()
      exportFinancialDataToCSV(result.data)
      toast.success(`Exported ${result.data.length} financial relationship${result.data.length === 1 ? '' : 's'} to CSV`)
    } catch (error) {
      console.error('Financial export error:', error)
      toast.error('Failed to export financial data. Please try again.')
    }
  }

  const handleExportAll = async () => {
    setIsExportingAll(true)
    try {
      const response = await apiClient.get<PaginatedResponse<ContributorListItem>>('/contributors?limit=10000')
      const allContributors = response.data
      exportContributorsToCSV(allContributors)
      toast.success(`Exported ${allContributors.length} contributor${allContributors.length === 1 ? '' : 's'} to CSV`)
    } catch (error) {
      console.error('Export all error:', error)
      toast.error('Failed to export all contributors. Please try again.')
    } finally {
      setIsExportingAll(false)
    }
  }

  const isFilteredDisabled = disabled || contributors.length === 0

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
        onClick={handleExportFinancial}
        disabled={disabled}
        variant="subtle"
        className="flex items-center gap-2"
      >
        {/* Bank/currency icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
        >
          <path d="M10.75 10.818v2.614A3.13 3.13 0 0011.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 00-1.138-.432zM8.33 8.62c.053.055.115.11.182.155A3.13 3.13 0 009.25 9.124.975.975 0 008.33 8.62z" />
          <path
            fillRule="evenodd"
            d="M9.99 2.75a.75.75 0 00-1.5 0V3.5H7.25A2.75 2.75 0 004.5 6.25v7.5A2.75 2.75 0 007.25 16.5h5.5A2.75 2.75 0 0015.5 13.75v-7.5A2.75 2.75 0 0012.75 3.5h-1.24V2.75zm1.01 8.68c1.043.56 1.25 1.265 1.25 1.695 0 .43-.207 1.135-1.25 1.695v.58h-.75v-.562a4.678 4.678 0 01-1.69-.572l.44-.73c.337.203.764.373 1.25.44v-2.264c-1.043-.56-1.25-1.265-1.25-1.695 0-.43.207-1.135 1.25-1.695V8.25h.75v.562c.549.12 1.062.36 1.492.637l-.478.714a3.37 3.37 0 00-1.014-.46v2.177z"
            clipRule="evenodd"
          />
        </svg>
        <span>Export Financial Data</span>
      </Button>

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
