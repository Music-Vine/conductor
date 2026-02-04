import { jsonToCSV } from 'react-papaparse'
import type { UserListItem } from '@/types'

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

  exportToCSV(users, filename, columns)
}
