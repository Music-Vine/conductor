'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { AssetListItem } from '@/types/asset'
import { AssetRowActions } from './AssetRowActions'
import { useVirtualizedTable, useSmartScrollReset, VirtualizedRow, VIRTUALIZED_TABLE_DEFAULTS } from '@/hooks/useVirtualizedTable'
import { NoResultsEmptyState } from '@/components/empty-states/EmptyState'
import { useTableKeyboard } from '@/hooks/useTableKeyboard'
import { useBulkSelection } from '@/hooks/useBulkSelection'
import { InlineEditField } from '@/components/inline-editing/InlineEditField'
import { apiClient } from '@/lib/api/client'

interface AssetTableProps {
  data: AssetListItem[]
  pagination: {
    page: number
    pageSize: number
    totalPages: number
    totalItems: number
  }
  onSelectionChange?: (selectedIds: string[]) => void
}

const columnHelper = createColumnHelper<AssetListItem>()

// Define columns as a function to access bulkSelection in the component
function createColumns(bulkSelection: ReturnType<typeof useBulkSelection>, fetchAllFilteredIds: () => Promise<string[]>) {
  const checkboxColumn = columnHelper.display({
    id: 'select',
    header: () => null, // Header checkbox handled separately
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

  return [
    checkboxColumn,
    columnHelper.accessor((row) => ({ title: row.title, type: row.type, id: row.id }), {
      id: 'asset',
      header: 'Asset',
      size: 300,
    cell: (info) => {
      const { title, type, id } = info.getValue()
      return (
        <div className="flex items-center gap-3">
          {/* Thumbnail placeholder */}
          <div className="h-12 w-12 rounded bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
            {type === 'music' && (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            )}
            {type === 'sfx' && (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 0M4 12a8 8 0 018-8" />
              </svg>
            )}
            {(type === 'motion-graphics' || type === 'stock-footage') && (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
            {type === 'lut' && (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            )}
          </div>
          {/* Stop propagation so inline edit click doesn't trigger row navigation */}
          <div
            className="flex flex-col min-w-0"
            onClick={(e) => e.stopPropagation()}
          >
            <InlineEditField
              value={title}
              queryKey={['assets']}
              onSave={(v) => apiClient.patch(`/assets/${id}`, { title: v })}
              placeholder="Enter title"
              className="font-medium w-full"
            />
          </div>
        </div>
      )
    },
  }),
  columnHelper.accessor('type', {
    header: 'Type',
    size: 120,
    cell: (info) => {
      const type = info.getValue()
      const typeLabels: Record<string, string> = {
        music: 'Music',
        sfx: 'SFX',
        'motion-graphics': 'Motion Graphics',
        lut: 'LUT',
        'stock-footage': 'Stock Footage',
      }
      const typeColors: Record<string, string> = {
        music: 'bg-blue-100 text-blue-800',
        sfx: 'bg-green-100 text-green-800',
        'motion-graphics': 'bg-purple-100 text-purple-800',
        lut: 'bg-orange-100 text-orange-800',
        'stock-footage': 'bg-pink-100 text-pink-800',
      }
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            typeColors[type] || 'bg-gray-100 text-gray-800'
          }`}
        >
          {typeLabels[type] || type}
        </span>
      )
    },
  }),
  columnHelper.accessor('contributorName', {
    header: 'Contributor',
    size: 150,
    cell: (info) => {
      const name = info.getValue()
      return <span className="text-gray-700">{name}</span>
    },
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    size: 120,
    cell: (info) => {
      const status = info.getValue()

      // Map statuses to display labels and colors
      const statusConfig: Record<string, { label: string; color: string }> = {
        draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
        submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
        initial_review: { label: 'Initial Review', color: 'bg-yellow-100 text-yellow-800' },
        quality_check: { label: 'Quality Check', color: 'bg-yellow-100 text-yellow-800' },
        platform_assignment: { label: 'Platform Assignment', color: 'bg-yellow-100 text-yellow-800' },
        final_approval: { label: 'Final Approval', color: 'bg-yellow-100 text-yellow-800' },
        review: { label: 'Review', color: 'bg-yellow-100 text-yellow-800' },
        published: { label: 'Published', color: 'bg-green-100 text-green-800' },
        rejected_initial: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
        rejected_quality: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
        rejected_final: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
        rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
      }

      const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' }

      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}
        >
          {config.label}
        </span>
      )
    },
  }),
  columnHelper.accessor('platform', {
    header: 'Platform',
    size: 100,
    cell: (info) => {
      const platform = info.getValue()
      const platformLabels: Record<string, string> = {
        'music-vine': 'MV',
        uppbeat: 'UB',
        both: 'Both',
      }
      const platformColors: Record<string, string> = {
        'music-vine': 'bg-red-100 text-red-800',
        uppbeat: 'bg-pink-100 text-pink-800',
        both: 'bg-gray-100 text-gray-800',
      }
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            platformColors[platform] || 'bg-gray-100 text-gray-800'
          }`}
        >
          {platformLabels[platform] || platform}
        </span>
      )
    },
  }),
  columnHelper.accessor('updatedAt', {
    header: 'Updated',
    size: 120,
    cell: (info) => {
      const updatedAt = info.getValue()
      const date = new Date(updatedAt)
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
      size: 80,
      cell: (info) => <AssetRowActions asset={info.row.original} />,
    }),
  ]
}

export function AssetTable({ data, pagination, onSelectionChange }: AssetTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get current filter state for scroll reset detection
  const currentQuery = searchParams.get('query') || ''
  const currentType = searchParams.get('type') || ''
  const currentStatus = searchParams.get('status') || ''
  const currentPlatform = searchParams.get('platform') || ''
  const currentGenre = searchParams.get('genre') || ''

  // Prepare safe defaults for hooks (prevent conditional hook calls)
  const safeData = data && Array.isArray(data) ? data : []
  const safePagination = pagination || { totalPages: 0, page: 1, pageSize: 50 }

  // State for fetching all filtered IDs (for Select All and cross-page Shift+Click)
  const [allFilteredIds, setAllFilteredIds] = useState<string[] | null>(null)
  const [isLoadingAllIds, setIsLoadingAllIds] = useState(false)

  // Fetch all filtered IDs from /bulk/ids endpoint
  const fetchAllFilteredIds = useCallback(async (): Promise<string[]> => {
    if (allFilteredIds) return allFilteredIds // Cache hit

    setIsLoadingAllIds(true)
    try {
      const params = new URLSearchParams(searchParams.toString())
      const response = await fetch(`/api/assets/bulk/ids?${params}`)
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
    entityType: 'asset',
    filterParams: searchParams,
    totalFilteredCount: safePagination.totalItems,
  })

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange?.(Array.from(bulkSelection.selectedIds))
  }, [bulkSelection.selectedIds, onSelectionChange])

  // Create columns with access to bulkSelection
  const columns = createColumns(bulkSelection, fetchAllFilteredIds)

  // Ref for indeterminate checkbox state
  const headerCheckboxRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = bulkSelection.selectedCount > 0 && !bulkSelection.isAllSelected
    }
  }, [bulkSelection.selectedCount, bulkSelection.isAllSelected])

  const table = useReactTable({
    data: safeData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    pageCount: safePagination.totalPages,
    state: {
      pagination: {
        pageIndex: safePagination.page - 1,
        pageSize: safePagination.pageSize,
      },
    },
  })

  // Setup virtualization
  const virtualizedTable = useVirtualizedTable({
    table,
    rowHeight: 72, // Same as users table
    overscan: VIRTUALIZED_TABLE_DEFAULTS.overscan,
    containerHeight: 600,
  })

  // Smart scroll reset on filter changes
  useSmartScrollReset(virtualizedTable, [currentQuery, currentType, currentStatus, currentPlatform, currentGenre, pagination.page])

  const { parentRef, virtualRows, totalHeight, rows } = virtualizedTable

  // Keyboard navigation
  const keyboard = useTableKeyboard({
    items: data,
    onNavigate: (asset, index) => {
      // Scroll focused row into view
      virtualizedTable.scrollToIndex(index)
    },
    onAction: (asset) => {
      router.push(`/assets/${asset.id}`)
    },
    enabled: data.length > 0,
  })

  function handleRowClick(assetId: string, event: React.MouseEvent) {
    // Don't navigate if clicking on actions dropdown, checkbox, or inline edit area
    if (
      (event.target as HTMLElement).closest('[data-actions]') ||
      (event.target as HTMLElement).closest('input[type="checkbox"]') ||
      (event.target as HTMLElement).closest('[data-inline-edit]')
    ) {
      return
    }
    router.push(`/assets/${assetId}`)
  }

  // Grid template columns for consistent layout (Checkbox, Asset, Type, Contributor, Status, Platform, Updated, Actions)
  const gridTemplateColumns = '48px 350px 120px 1fr 140px 120px 140px 100px'

  // After all hooks are called, check for empty states
  if (!data || !Array.isArray(data) || !pagination) {
    return <NoResultsEmptyState />
  }

  if (data.length === 0) {
    const hasFilters = currentQuery || currentType || currentStatus || currentPlatform || currentGenre
    return (
      <NoResultsEmptyState
        searchQuery={currentQuery || undefined}
        onClearFilters={hasFilters ? () => router.push('/assets') : undefined}
      />
    )
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
                {header.id === 'select' ? (
                  // Custom header checkbox for select all
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
