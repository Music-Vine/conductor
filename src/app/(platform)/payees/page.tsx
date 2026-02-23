import { Suspense } from 'react'
import Link from 'next/link'
import { fetchPayees } from '@/lib/api/payees'
import type { PayeeStatus, PaymentMethod } from '@/types'
import { PayeeFilters, PayeeTable, PayeeTablePagination, ExportPayeesButton } from './components'
import { TableRowSkeleton } from '@/components/skeletons/TableRowSkeleton'
import { Button } from '@music-vine/cadence/ui'

interface SearchParamsProps {
  searchParams: Promise<{
    query?: string
    page?: string
    status?: string
    paymentMethod?: string
    limit?: string
  }>
}

/**
 * Payees management page.
 * Server component that handles search and filtering via URL parameters.
 */
export default async function PayeesPage({ searchParams }: SearchParamsProps) {
  // Await searchParams (Next.js 15 pattern)
  const params = await searchParams

  // Parse query parameters
  const query = params.query || ''
  const page = params.page ? parseInt(params.page, 10) : 1
  const limit = params.limit ? parseInt(params.limit, 10) : 10
  const status =
    params.status === 'all' ? undefined : (params.status as PayeeStatus | undefined)
  const paymentMethod =
    params.paymentMethod === 'all'
      ? undefined
      : (params.paymentMethod as PaymentMethod | undefined)

  // Build filter params (omit 'all' values)
  const filterParams = {
    query: query || undefined,
    page,
    limit,
    status,
    paymentMethod,
  }

  // Fetch payees server-side
  const data = await fetchPayees(filterParams)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Payees
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage payment recipients and financial details
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportPayeesButton payees={data.data} />
          <Button variant="bold" asChild>
            <Link href="/payees/new">Add Payee</Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <PayeeFilters
        currentParams={{
          query,
          page,
          status: status || 'all',
          paymentMethod: paymentMethod || 'all',
        }}
      />

      {/* Results */}
      <Suspense
        key={JSON.stringify(params)}
        fallback={<TableRowSkeleton columns={5} rows={10} />}
      >
        <PayeeTable data={data.data} pagination={data.pagination} />
        <PayeeTablePagination pagination={data.pagination} />
      </Suspense>
    </div>
  )
}
