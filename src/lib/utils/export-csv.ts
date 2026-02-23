import { jsonToCSV } from 'react-papaparse'
import type { UserListItem, ContributorListItem, PayeeListItem } from '@/types'
import type { AssetListItem } from '@/types/asset'

/**
 * Financial export row shape returned by /api/financials/export.
 * Uses decimal percentage rates (0.00-1.00) for accounting compatibility.
 */
interface FinancialExportRow {
  contributorId: string
  contributorName: string
  contributorEmail: string
  contributorStatus: string
  payeeId: string
  payeeName: string
  payeeEmail: string
  payeePaymentMethod: string
  payeeStatus: string
  percentageRate: number
  effectiveDate: string
  createdAt: string
  updatedAt: string
}

/**
 * Generic CSV export function.
 * Creates a CSV file from an array of objects and triggers browser download.
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; header: string }[]
) {
  // Transform data if columns are provided
  const transformedData = columns
    ? data.map((row) => {
        const transformedRow: Record<string, unknown> = {}
        columns.forEach(({ key, header }) => {
          const value = row[key]
          // Convert null/undefined to empty string for CSV
          transformedRow[header] = value === null || value === undefined ? '' : value
        })
        return transformedRow
      })
    : data.map((row) => {
        // Convert null values to empty strings
        const cleanedRow: Record<string, unknown> = {}
        Object.entries(row).forEach(([key, value]) => {
          cleanedRow[key] = value === null || value === undefined ? '' : value
        })
        return cleanedRow
      })

  // Generate CSV string
  const csvString = jsonToCSV(transformedData)

  // Create Blob with CSV MIME type
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })

  // Create temporary download link
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  // Trigger download
  document.body.appendChild(link)
  link.click()

  // Clean up
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export user list to CSV.
 * Generates a timestamped CSV file with formatted column headers.
 */
export function exportUsersToCSV(users: UserListItem[]) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const filename = `users-${timestamp}.csv`

  const columns: { key: keyof UserListItem; header: string }[] = [
    { key: 'id', header: 'User ID' },
    { key: 'email', header: 'Email' },
    { key: 'name', header: 'Name' },
    { key: 'username', header: 'Username' },
    { key: 'platform', header: 'Platform' },
    { key: 'status', header: 'Status' },
    { key: 'subscriptionTier', header: 'Subscription' },
    { key: 'lastLoginAt', header: 'Last Login' },
    { key: 'createdAt', header: 'Created' },
  ]

  exportToCSV(users as unknown as Record<string, unknown>[], filename, columns as { key: string; header: string }[])
}

/**
 * Export contributor list to CSV.
 * Generates a timestamped CSV file with formatted column headers.
 */
export function exportContributorsToCSV(contributors: ContributorListItem[]) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const filename = `contributors-${timestamp}.csv`

  const columns: { key: keyof ContributorListItem; header: string }[] = [
    { key: 'id', header: 'Contributor ID' },
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'status', header: 'Status' },
    { key: 'totalAssets', header: 'Total Assets' },
    { key: 'totalPayees', header: 'Total Payees' },
    { key: 'createdAt', header: 'Created' },
  ]

  exportToCSV(contributors as unknown as Record<string, unknown>[], filename, columns as { key: string; header: string }[])
}

/**
 * Export payee list to CSV.
 * Generates a timestamped CSV file with formatted column headers.
 */
export function exportPayeesToCSV(payees: PayeeListItem[]) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const filename = `payees-${timestamp}.csv`

  const columns: { key: keyof PayeeListItem; header: string }[] = [
    { key: 'id', header: 'Payee ID' },
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'paymentMethod', header: 'Payment Method' },
    { key: 'status', header: 'Status' },
    { key: 'totalContributors', header: 'Total Contributors' },
    { key: 'createdAt', header: 'Created' },
  ]

  exportToCSV(payees as unknown as Record<string, unknown>[], filename, columns as { key: string; header: string }[])
}

/**
 * Export financial relationship data to CSV.
 * Uses decimal percentage rates (0.00-1.00) for accounting system compatibility.
 */
export function exportFinancialDataToCSV(relationships: FinancialExportRow[]) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const filename = `financial-data-${timestamp}.csv`

  const columns: { key: keyof FinancialExportRow; header: string }[] = [
    { key: 'contributorId', header: 'Contributor ID' },
    { key: 'contributorName', header: 'Contributor Name' },
    { key: 'contributorEmail', header: 'Contributor Email' },
    { key: 'contributorStatus', header: 'Contributor Status' },
    { key: 'payeeId', header: 'Payee ID' },
    { key: 'payeeName', header: 'Payee Name' },
    { key: 'payeeEmail', header: 'Payee Email' },
    { key: 'payeePaymentMethod', header: 'Payment Method' },
    { key: 'payeeStatus', header: 'Payee Status' },
    { key: 'percentageRate', header: 'Percentage Rate' },
    { key: 'effectiveDate', header: 'Effective Date' },
    { key: 'createdAt', header: 'Created' },
    { key: 'updatedAt', header: 'Updated' },
  ]

  exportToCSV(relationships as unknown as Record<string, unknown>[], filename, columns as { key: string; header: string }[])
}

/**
 * Export asset list to CSV.
 * Generates a timestamped CSV file with formatted column headers.
 */
export function exportAssetsToCSV(assets: AssetListItem[]) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const filename = `assets-export-${timestamp}.csv`

  const columns: { key: keyof AssetListItem; header: string }[] = [
    { key: 'id', header: 'ID' },
    { key: 'title', header: 'Title' },
    { key: 'type', header: 'Type' },
    { key: 'contributorName', header: 'Contributor' },
    { key: 'status', header: 'Status' },
    { key: 'platform', header: 'Platform' },
    { key: 'genre', header: 'Genre' },
    { key: 'createdAt', header: 'Created' },
    { key: 'updatedAt', header: 'Updated' },
  ]

  exportToCSV(assets as unknown as Record<string, unknown>[], filename, columns as { key: string; header: string }[])
}
