'use client'

import { toast } from 'sonner'
import { Button } from '@music-vine/cadence'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ContributorPayee, PaymentMethod } from '@/types'
import { EmptyState } from '@/components/empty-states/EmptyState'

interface PayeesTabProps {
  payees: ContributorPayee[]
}

/**
 * Payment method display labels.
 */
const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  ach: 'ACH',
  wire: 'Wire',
  check: 'Check',
  paypal: 'PayPal',
}

const columnHelper = createColumnHelper<ContributorPayee>()

/**
 * Payees tab displaying assigned payees with percentage rates.
 * Shows a summary card with total allocation and color-coded status.
 */
export function PayeesTab({ payees }: PayeesTabProps) {
  const totalRate = payees.reduce((sum, p) => sum + p.percentageRate, 0)

  // Determine color and message for total rate summary
  const rateColorClass =
    totalRate === 100
      ? 'text-green-600'
      : totalRate < 100
        ? 'text-yellow-600'
        : 'text-red-600'

  const rateMessage =
    totalRate === 100
      ? 'Fully allocated'
      : totalRate < 100
        ? `${100 - totalRate}% unassigned`
        : `${totalRate - 100}% over allocated`

  const columns = [
    columnHelper.accessor('payeeName', {
      header: 'Payee',
      cell: (info) => (
        <div>
          <div className="font-medium text-gray-900">{info.getValue()}</div>
          <div className="text-xs text-gray-500">
            {info.row.original.payeeEmail}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('percentageRate', {
      header: 'Rate',
      cell: (info) => (
        <span className="text-lg font-semibold text-gray-900">
          {info.getValue()}%
        </span>
      ),
    }),
    columnHelper.accessor('effectiveDate', {
      header: 'Effective Date',
      cell: (info) =>
        new Date(info.getValue()).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
    }),
    columnHelper.accessor('paymentMethod', {
      header: 'Payment Method',
      cell: (info) => {
        const method = info.getValue()
        return (
          <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium uppercase text-gray-700">
            {PAYMENT_METHOD_LABELS[method]}
          </span>
        )
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: () => (
        <div className="flex items-center gap-2">
          <Button
            variant="subtle"
            size="sm"
            onClick={() =>
              toast.info('Edit rate functionality coming in Plan 06')
            }
          >
            Edit Rate
          </Button>
          <Button
            variant="error"
            size="sm"
            onClick={() =>
              toast.info('Remove payee functionality coming in Plan 06')
            }
          >
            Remove
          </Button>
        </div>
      ),
    }),
  ]

  const table = useReactTable({
    data: payees,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (payees.length === 0) {
    return (
      <EmptyState
        type="first-use"
        title="No payees assigned"
        description="This contributor has no payees assigned yet."
        action={{
          label: 'Assign Payee',
          onClick: () =>
            toast.info('Add payee functionality coming in Plan 06'),
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Total payout rate summary card */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Total Payout Rate
            </p>
            <p className={`mt-1 text-2xl font-bold ${rateColorClass}`}>
              {totalRate}%
            </p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-medium ${rateColorClass}`}>
              {rateMessage}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {payees.length} payee{payees.length !== 1 ? 's' : ''} assigned
            </p>
          </div>
        </div>
      </div>

      {/* Payees table */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 text-sm text-gray-700"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add payee button */}
      <div className="flex justify-start">
        <Button
          variant="bold"
          onClick={() => toast.info('Add payee functionality coming in Plan 06')}
        >
          Add Payee
        </Button>
      </div>
    </div>
  )
}
