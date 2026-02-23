'use client'

import { useRouter } from 'next/navigation'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Button } from '@music-vine/cadence/ui'

/**
 * Shape returned from GET /api/payees/[id]/contributors.
 * This is a reverse lookup with rate information.
 */
export interface PayeeContributorEntry {
  contributorId: string
  contributorName: string
  contributorEmail: string
  percentageRate: number
  effectiveDate: string
}

interface PayeeContributorsTabProps {
  contributors: PayeeContributorEntry[]
}

const columnHelper = createColumnHelper<PayeeContributorEntry>()

/**
 * Contributors tab for payee detail page.
 * Shows reverse lookup of which contributors are assigned to this payee.
 */
export function PayeeContributorsTab({ contributors }: PayeeContributorsTabProps) {
  const router = useRouter()

  const columns = [
    columnHelper.accessor((row) => ({ name: row.contributorName, email: row.contributorEmail }), {
      id: 'contributor',
      header: 'Contributor',
      size: 300,
      cell: (info) => {
        const { name, email } = info.getValue()
        return (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{name}</span>
            <span className="text-sm text-gray-500">{email}</span>
          </div>
        )
      },
    }),
    columnHelper.accessor('percentageRate', {
      header: 'Percentage Rate',
      size: 160,
      cell: (info) => (
        <span className="text-2xl font-bold text-gray-900">
          {info.getValue()}%
        </span>
      ),
    }),
    columnHelper.accessor('effectiveDate', {
      header: 'Effective Date',
      size: 150,
      cell: (info) => {
        const date = new Date(info.getValue())
        return (
          <span className="text-gray-600">
            {date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        )
      },
    }),
    columnHelper.accessor('contributorId', {
      id: 'actions',
      header: 'Actions',
      size: 180,
      cell: (info) => {
        const contributorId = info.getValue()
        return (
          <Button
            variant="subtle"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/contributors/${contributorId}`)
            }}
          >
            View Contributor
          </Button>
        )
      },
    }),
  ]

  const table = useReactTable({
    data: contributors,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (contributors.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-500">No contributors associated with this payee</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <p className="text-sm text-gray-600">
        <span className="font-medium">{contributors.length}</span>{' '}
        {contributors.length === 1 ? 'contributor' : 'contributors'} associated with this payee
      </p>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200">
          {table.getHeaderGroups().map((headerGroup) => (
            <div
              key={headerGroup.id}
              className="grid"
              style={{ gridTemplateColumns: '1fr 160px 150px 180px' }}
            >
              {headerGroup.headers.map((header) => (
                <div
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="divide-y divide-gray-100 bg-white">
          {table.getRowModel().rows.map((row) => (
            <div
              key={row.id}
              className="grid hover:bg-gray-50 transition-colors"
              style={{ gridTemplateColumns: '1fr 160px 150px 180px' }}
            >
              {row.getVisibleCells().map((cell) => (
                <div
                  key={cell.id}
                  className="px-6 py-4 text-sm flex items-center"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
