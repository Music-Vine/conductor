'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { PayeeListItem, PayeeStatus, PaymentMethod } from '@/types'
import {
  useVirtualizedTable,
  useSmartScrollReset,
  VirtualizedRow,
  VIRTUALIZED_TABLE_DEFAULTS,
} from '@/hooks/useVirtualizedTable'
import { NoResultsEmptyState } from '@/components/empty-states/EmptyState'
import { useTableKeyboard } from '@/hooks/useTableKeyboard'

interface PayeeTableProps {
  data: PayeeListItem[]
  pagination: {
    page: number
    pageSize: number
    totalPages: number
    totalItems: number
  }
}

const columnHelper = createColumnHelper<PayeeListItem>()

const statusBadgeClasses: Record<PayeeStatus, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-red-100 text-red-800',
}

const statusLabels: Record<PayeeStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
}

const paymentMethodBadgeClasses: Record<PaymentMethod, string> = {
  ach: 'bg-blue-100 text-blue-800',
  wire: 'bg-purple-100 text-purple-800',
  check: 'bg-gray-100 text-gray-800',
  paypal: 'bg-indigo-100 text-indigo-800',
}

const paymentMethodLabels: Record<PaymentMethod, string> = {
  ach: 'ACH',
  wire: 'Wire',
  check: 'Check',
  paypal: 'PayPal',
}

const columns = [
  columnHelper.accessor((row) => ({ name: row.name, email: row.email }), {
    id: 'payee',
    header: 'Name',
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
  columnHelper.accessor('paymentMethod', {
    header: 'Payment Method',
    size: 150,
    cell: (info) => {
      const method = info.getValue()
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide ${paymentMethodBadgeClasses[method] || 'bg-gray-100 text-gray-800'}`}
        >
          {paymentMethodLabels[method] || method}
        </span>
      )
    },
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    size: 120,
    cell: (info) => {
      const status = info.getValue()
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClasses[status] || 'bg-gray-100 text-gray-800'}`}
        >
          {statusLabels[status] || status}
        </span>
      )
    },
  }),
  columnHelper.accessor('totalContributors', {
    header: 'Contributors',
    size: 120,
    cell: (info) => (
      <span className="text-gray-700">{info.getValue().toLocaleString()}</span>
    ),
  }),
  columnHelper.accessor('createdAt', {
    header: 'Created',
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
]

// Grid template columns for consistent layout
const gridTemplateColumns = '1fr 150px 120px 120px 150px'

export function PayeeTable({ data, pagination }: PayeeTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get current filter state for scroll reset detection
  const currentQuery = searchParams.get('query') || ''
  const currentStatus = searchParams.get('status') || ''
  const currentPaymentMethod = searchParams.get('paymentMethod') || ''

  // Defensive checks - show empty state if no data or pagination
  if (!data || !Array.isArray(data) || !pagination) {
    return <NoResultsEmptyState />
  }

  // Show empty state when no results (replaces full table per best practices)
  if (data.length === 0) {
    const hasFilters = currentQuery || currentStatus || currentPaymentMethod
    return (
      <NoResultsEmptyState
        searchQuery={currentQuery || undefined}
        onClearFilters={hasFilters ? () => router.push('/payees') : undefined}
      />
    )
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    pageCount: pagination.totalPages,
    state: {
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.pageSize,
      },
    },
  })

  // Setup virtualization
  const virtualizedTable = useVirtualizedTable({
    table,
    rowHeight: 72,
    overscan: VIRTUALIZED_TABLE_DEFAULTS.overscan,
    containerHeight: 600,
  })

  // Smart scroll reset on filter changes
  useSmartScrollReset(virtualizedTable, [
    currentQuery,
    currentStatus,
    currentPaymentMethod,
    pagination.page,
  ])

  const { parentRef, virtualRows, totalHeight, rows } = virtualizedTable

  // Keyboard navigation
  const keyboard = useTableKeyboard({
    items: data,
    onNavigate: (_payee, index) => {
      virtualizedTable.scrollToIndex(index)
    },
    onAction: (payee) => {
      router.push(`/payees/${payee.id}`)
    },
    enabled: data.length > 0,
  })

  function handleRowClick(payeeId: string) {
    router.push(`/payees/${payeeId}`)
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      {/* Fixed header */}
      <div className="bg-gray-50 border-b border-gray-200">
        {table.getHeaderGroups().map((headerGroup) => (
          <div
            key={headerGroup.id}
            className="grid"
            style={{ gridTemplateColumns }}
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

      {/* Virtualized body */}
      <div
        ref={(el) => {
          // Merge refs for both virtualization and keyboard navigation
          ;(parentRef as React.MutableRefObject<HTMLDivElement | null>).current = el
          ;(keyboard.tableRef as React.MutableRefObject<HTMLDivElement | null>).current = el
        }}
        tabIndex={0}
        className="overflow-auto bg-white focus:outline-none focus:ring-2 focus:ring-platform-primary focus:ring-inset"
        style={{ height: '600px' }}
      >
        <div
          style={{
            height: `${totalHeight}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index]
            const isFocused = keyboard.focusedIndex === virtualRow.index
            const isKeyboardSelected = keyboard.selectedIndices.has(virtualRow.index)
            return (
              <VirtualizedRow
                key={row.id}
                virtualRow={virtualRow}
                className={`
                  cursor-pointer transition-colors border-b border-gray-100
                  ${isFocused ? 'ring-2 ring-inset ring-platform-primary' : ''}
                  ${isKeyboardSelected ? 'bg-platform-primary/10' : 'hover:bg-gray-50'}
                `}
              >
                <div
                  onClick={() => handleRowClick(row.original.id)}
                  className="grid h-full"
                  style={{ gridTemplateColumns }}
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
              </VirtualizedRow>
            )
          })}
        </div>
      </div>
    </div>
  )
}
