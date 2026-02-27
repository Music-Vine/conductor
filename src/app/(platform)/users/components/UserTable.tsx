'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback, useEffect, useRef } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { UserListItem } from '@/types/user'
import { UserRowActions } from './UserRowActions'
import { useVirtualizedTable, useSmartScrollReset, VirtualizedRow, VIRTUALIZED_TABLE_DEFAULTS } from '@/hooks/useVirtualizedTable'
import { NoResultsEmptyState } from '@/components/empty-states/EmptyState'
import { useTableKeyboard } from '@/hooks/useTableKeyboard'
import { useBulkSelection } from '@/hooks/useBulkSelection'
import { InlineEditField } from '@/components/inline-editing/InlineEditField'
import { apiClient } from '@/lib/api/client'

interface UserTableProps {
  data: UserListItem[]
  pagination: {
    page: number
    pageSize: number
    totalPages: number
    totalItems: number
  }
  onSelectionChange?: (selectedIds: string[]) => void
}

const columnHelper = createColumnHelper<UserListItem>()

export function UserTable({ data, pagination, onSelectionChange }: UserTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // State for fetching all filtered IDs
  const [allFilteredIds, setAllFilteredIds] = useState<string[] | null>(null)
  const [isLoadingAllIds, setIsLoadingAllIds] = useState(false)

  // Fetch all filtered IDs from /bulk/ids endpoint
  const fetchAllFilteredIds = useCallback(async (): Promise<string[]> => {
    if (allFilteredIds) return allFilteredIds // Cache hit

    setIsLoadingAllIds(true)
    try {
      const params = new URLSearchParams(searchParams.toString())
      const response = await fetch(`/api/users/bulk/ids?${params}`)
      const { ids } = await response.json()
      setAllFilteredIds(ids)
      return ids
    } finally {
      setIsLoadingAllIds(false)
    }
  }, [searchParams, allFilteredIds])

  // Clear cached IDs when filters change
  useEffect(() => {
    setAllFilteredIds(null)
  }, [searchParams])

  // Initialize bulk selection
  const bulkSelection = useBulkSelection({
    entityType: 'user',
    filterParams: searchParams,
    totalFilteredCount: pagination.totalItems,
  })

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange?.(Array.from(bulkSelection.selectedIds))
  }, [bulkSelection.selectedIds, onSelectionChange])

  // Checkbox column
  const checkboxColumn = columnHelper.display({
    id: 'select',
    header: () => null, // Header handled separately below
    size: 48,
    cell: ({ row }) => {
      const isSelected = bulkSelection.isSelected(row.original.id)
      return (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => bulkSelection.toggle(row.original.id)}
            onClick={async (e) => {
              // Handle Shift+Click for range selection (works across pages)
              if (e.shiftKey && bulkSelection.lastSelectedId) {
                e.preventDefault()
                // Fetch all filtered IDs for cross-page range selection
                const orderedIds = await fetchAllFilteredIds()
                bulkSelection.selectRange(bulkSelection.lastSelectedId, row.original.id, orderedIds)
              }
            }}
            className="h-4 w-4 rounded border-gray-300 text-platform-primary focus:ring-platform-primary"
          />
        </div>
      )
    },
  })

  const columns = [
    checkboxColumn,
    columnHelper.accessor((row) => ({ email: row.email, name: row.name, id: row.id }), {
    id: 'user',
    header: 'User',
    size: 300,
    cell: (info) => {
      const { email, name, id } = info.getValue()
      return (
        <div className="flex flex-col min-w-0">
          <span className="font-medium text-gray-900 text-sm px-1">{email}</span>
          {/* Stop propagation so inline edit click doesn't trigger row navigation */}
          <div onClick={(e) => e.stopPropagation()}>
            <InlineEditField
              value={name ?? ''}
              queryKey={['users']}
              onSave={(v) => apiClient.patch(`/users/${id}`, { name: v })}
              placeholder="No name"
              className="text-xs w-full text-gray-500"
            />
          </div>
        </div>
      )
    },
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    size: 120,
    cell: (info) => {
      const status = info.getValue()
      const isActive = status === 'active'
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {isActive ? 'Active' : 'Suspended'}
        </span>
      )
    },
  }),
  columnHelper.accessor('subscriptionTier', {
    header: 'Subscription',
    size: 150,
    cell: (info) => {
      const tier = info.getValue()
      const tierLabels: Record<string, string> = {
        free: 'Free',
        essentials: 'Essentials',
        creator: 'Creator',
        pro: 'Pro',
        enterprise: 'Enterprise',
      }
      const tierColors: Record<string, string> = {
        free: 'text-gray-600',
        essentials: 'text-gray-500',
        creator: 'text-blue-600',
        pro: 'text-green-600',
        enterprise: 'text-gray-900',
      }
      return (
        <span className={`font-medium ${tierColors[tier] || 'text-gray-600'}`}>
          {tierLabels[tier] || tier}
        </span>
      )
    },
  }),
  columnHelper.accessor('lastLoginAt', {
    header: 'Last Login',
    size: 150,
    cell: (info) => {
      const lastLogin = info.getValue()
      if (!lastLogin) return <span className="text-gray-400">Never</span>

      const date = new Date(lastLogin)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        return <span className="text-gray-700">Today</span>
      } else if (diffDays === 1) {
        return <span className="text-gray-700">Yesterday</span>
      } else if (diffDays < 7) {
        return <span className="text-gray-700">{diffDays} days ago</span>
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7)
        return <span className="text-gray-600">{weeks} {weeks === 1 ? 'week' : 'weeks'} ago</span>
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30)
        return <span className="text-gray-600">{months} {months === 1 ? 'month' : 'months'} ago</span>
      } else {
        return (
          <span className="text-gray-500">
            {date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        )
      }
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    size: 100,
    cell: (info) => <UserRowActions user={info.row.original} />,
  }),
  ]

  // Get current filter state for scroll reset detection
  const currentQuery = searchParams.get('query') || ''
  const currentStatus = searchParams.get('status') || ''
  const currentTier = searchParams.get('tier') || ''

  // Defensive check - show empty state if no data
  if (!data || !Array.isArray(data)) {
    return <NoResultsEmptyState />
  }

  if (!pagination) {
    return <NoResultsEmptyState />
  }

  // Show empty state when no results (replaces full table per best practices)
  if (data.length === 0) {
    const hasFilters = currentQuery || currentStatus || currentTier
    return (
      <NoResultsEmptyState
        searchQuery={currentQuery || undefined}
        onClearFilters={hasFilters ? () => router.push('/users') : undefined}
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
    rowHeight: 72, // Actual row height with py-4 padding
    overscan: VIRTUALIZED_TABLE_DEFAULTS.overscan,
    containerHeight: 600,
  })

  // Smart scroll reset on filter changes
  useSmartScrollReset(virtualizedTable, [currentQuery, currentStatus, currentTier, pagination.page])

  const { parentRef, virtualRows, totalHeight, rows } = virtualizedTable

  // Keyboard navigation
  const keyboard = useTableKeyboard({
    items: data,
    onNavigate: (user, index) => {
      // Scroll focused row into view
      virtualizedTable.scrollToIndex(index)
    },
    onAction: (user) => {
      router.push(`/users/${user.id}`)
    },
    enabled: data.length > 0,
  })

  function handleRowClick(userId: string, event: React.MouseEvent) {
    // Don't navigate if clicking on actions dropdown or inline edit area
    if (
      (event.target as HTMLElement).closest('[data-actions]') ||
      (event.target as HTMLElement).closest('[data-inline-edit]')
    ) {
      return
    }
    router.push(`/users/${userId}`)
  }

  // Grid template columns for consistent layout (checkbox + existing columns)
  const gridTemplateColumns = '48px 1fr 120px 150px 150px 100px'

  // Header checkbox ref for indeterminate state
  const headerCheckboxRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = bulkSelection.selectedCount > 0 && !bulkSelection.isAllSelected
    }
  }, [bulkSelection.selectedCount, bulkSelection.isAllSelected])

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
                {header.id === 'select' ? (
                  <div className="flex items-center justify-center">
                    <input
                      ref={headerCheckboxRef}
                      type="checkbox"
                      checked={bulkSelection.isAllSelected && bulkSelection.selectedCount > 0}
                      disabled={isLoadingAllIds}
                      onChange={async () => {
                        if (bulkSelection.selectedCount > 0) {
                          bulkSelection.clearSelection()
                        } else {
                          // Select ALL filtered IDs across all pages (per CONTEXT decision)
                          const allIds = await fetchAllFilteredIds()
                          bulkSelection.selectAll(allIds)
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-platform-primary focus:ring-platform-primary disabled:opacity-50"
                    />
                  </div>
                ) : header.isPlaceholder ? null : (
                  flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )
                )}
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
            const isBulkSelected = bulkSelection.isSelected(row.original.id)
            return (
              <VirtualizedRow
                key={row.id}
                virtualRow={virtualRow}
                className={`
                  cursor-pointer transition-colors border-b border-gray-100
                  ${isFocused ? 'ring-2 ring-inset ring-platform-primary' : ''}
                  ${isBulkSelected || isKeyboardSelected ? 'bg-platform-primary/10' : 'hover:bg-gray-50'}
                `}
              >
                <div
                  onClick={(e) => handleRowClick(row.original.id, e)}
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
