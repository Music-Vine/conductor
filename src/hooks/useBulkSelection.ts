'use client'

import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useEffect, useMemo } from 'react'
import {
  type BulkSelectionState,
  createEmptySelection,
  serializeSelection,
  deserializeSelection,
  contextMatches,
} from '@/lib/bulk-operations/selection'

/**
 * Jotai atom for bulk selection with localStorage persistence
 */
const bulkSelectionAtom = atomWithStorage<BulkSelectionState>(
  'bulk-selection',
  createEmptySelection(),
  {
    getItem: (key, initialValue) => {
      const stored = localStorage.getItem(key)
      if (!stored) return initialValue
      return deserializeSelection(stored)
    },
    setItem: (key, value) => {
      localStorage.setItem(key, serializeSelection(value))
    },
    removeItem: (key) => localStorage.removeItem(key),
  },
  { getOnInit: true }
)

/**
 * Options for useBulkSelection hook
 */
export interface UseBulkSelectionOptions {
  /** Entity type being selected */
  entityType: 'asset' | 'user'
  /** Current filter parameters */
  filterParams: URLSearchParams
  /** Total count of items matching filters (for "Select all X items" display) */
  totalFilteredCount?: number
}

/**
 * Return type for useBulkSelection hook
 */
export interface UseBulkSelectionReturn {
  /** Set of selected entity IDs */
  selectedIds: Set<string>
  /** Number of selected items */
  selectedCount: number
  /** Whether all filtered items are selected */
  isAllSelected: boolean
  /** ID of the last item selected (for range selection) */
  lastSelectedId: string | null

  // Selection actions
  /** Select a single item by ID */
  select: (id: string) => void
  /** Deselect a single item by ID */
  deselect: (id: string) => void
  /** Toggle selection state of a single item */
  toggle: (id: string) => void
  /** Select range between two items */
  selectRange: (fromId: string, toId: string, orderedIds: string[]) => void
  /** Select all items (caller must provide all IDs) */
  selectAll: (allIds: string[]) => void
  /** Clear all selections */
  clearSelection: () => void

  // State checks
  /** Check if a specific item is selected */
  isSelected: (id: string) => boolean
}

/**
 * Bulk selection hook with cross-page persistence
 *
 * Manages selection state using Jotai with localStorage persistence.
 * Selection automatically clears when filters or entity type changes.
 *
 * @example
 * ```tsx
 * const selection = useBulkSelection({
 *   entityType: 'asset',
 *   filterParams: searchParams,
 *   totalFilteredCount: 1234,
 * })
 *
 * // Select item
 * selection.select('asset-123')
 *
 * // Select range (e.g., Shift+Click)
 * selection.selectRange(lastId, clickedId, allPageIds)
 *
 * // Select all filtered items
 * const allIds = await fetchAllFilteredIds()
 * selection.selectAll(allIds)
 * ```
 */
export function useBulkSelection({
  entityType,
  filterParams,
  totalFilteredCount,
}: UseBulkSelectionOptions): UseBulkSelectionReturn {
  const [state, setState] = useAtom(bulkSelectionAtom)

  // Clear selection if context has changed (filters or entity type)
  useEffect(() => {
    if (!contextMatches(state.context, entityType, filterParams)) {
      setState(createEmptySelection())
    }
  }, [entityType, filterParams, state.context, setState])

  // Update context whenever selection changes
  const updateContext = (updater: (prev: BulkSelectionState) => BulkSelectionState) => {
    setState((prev) => {
      const next = updater(prev)
      return {
        ...next,
        context: {
          entityType,
          filterParams: new URLSearchParams(filterParams),
        },
      }
    })
  }

  // Selection actions
  const select = (id: string) => {
    updateContext((prev) => ({
      ...prev,
      selectedIds: new Set([...prev.selectedIds, id]),
      lastSelectedId: id,
    }))
  }

  const deselect = (id: string) => {
    updateContext((prev) => {
      const next = new Set(prev.selectedIds)
      next.delete(id)
      return {
        ...prev,
        selectedIds: next,
        // Clear lastSelectedId if we're deselecting it
        lastSelectedId: prev.lastSelectedId === id ? null : prev.lastSelectedId,
      }
    })
  }

  const toggle = (id: string) => {
    if (state.selectedIds.has(id)) {
      deselect(id)
    } else {
      select(id)
    }
  }

  const selectRange = (fromId: string, toId: string, orderedIds: string[]) => {
    const fromIndex = orderedIds.indexOf(fromId)
    const toIndex = orderedIds.indexOf(toId)

    if (fromIndex === -1 || toIndex === -1) {
      // If either ID not found, just select the toId
      select(toId)
      return
    }

    // Select all IDs between fromIndex and toIndex (inclusive)
    const start = Math.min(fromIndex, toIndex)
    const end = Math.max(fromIndex, toIndex)
    const rangeIds = orderedIds.slice(start, end + 1)

    updateContext((prev) => ({
      ...prev,
      selectedIds: new Set([...prev.selectedIds, ...rangeIds]),
      lastSelectedId: toId,
    }))
  }

  const selectAll = (allIds: string[]) => {
    updateContext((prev) => ({
      ...prev,
      selectedIds: new Set(allIds),
      lastSelectedId: allIds.length > 0 ? allIds[allIds.length - 1] : null,
    }))
  }

  const clearSelection = () => {
    setState(createEmptySelection())
  }

  // State checks
  const isSelected = (id: string) => state.selectedIds.has(id)

  const selectedCount = state.selectedIds.size

  const isAllSelected = useMemo(() => {
    if (!totalFilteredCount || totalFilteredCount === 0) {
      return false
    }
    return selectedCount === totalFilteredCount
  }, [selectedCount, totalFilteredCount])

  return {
    selectedIds: state.selectedIds,
    selectedCount,
    isAllSelected,
    lastSelectedId: state.lastSelectedId,
    select,
    deselect,
    toggle,
    selectRange,
    selectAll,
    clearSelection,
    isSelected,
  }
}
