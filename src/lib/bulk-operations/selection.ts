/**
 * Bulk selection state utilities and types
 *
 * Provides type-safe selection state management for bulk operations
 * across entity types (assets, users) with filter context tracking.
 */

/**
 * Context that identifies what the selection applies to
 */
export interface SelectionContext {
  /** Entity type being selected */
  entityType: 'asset' | 'user'
  /** Serialized filter parameters that define the selection scope */
  filterParams: URLSearchParams
}

/**
 * Core selection state structure
 */
export interface BulkSelectionState {
  /** Set of selected entity IDs */
  selectedIds: Set<string>
  /** ID of the last item selected (for range selection) */
  lastSelectedId: string | null
  /** Context defining what this selection applies to */
  context: SelectionContext | null
}

/**
 * Serializable version of BulkSelectionState for localStorage
 */
interface SerializableSelectionState {
  selectedIds: string[]
  lastSelectedId: string | null
  context: {
    entityType: 'asset' | 'user'
    filterParams: string
  } | null
}

/**
 * Serialize selection state for localStorage storage
 */
export function serializeSelection(state: BulkSelectionState): string {
  const serializable: SerializableSelectionState = {
    selectedIds: Array.from(state.selectedIds),
    lastSelectedId: state.lastSelectedId,
    context: state.context
      ? {
          entityType: state.context.entityType,
          filterParams: state.context.filterParams.toString(),
        }
      : null,
  }
  return JSON.stringify(serializable)
}

/**
 * Deserialize selection state from localStorage
 */
export function deserializeSelection(json: string): BulkSelectionState {
  try {
    const parsed = JSON.parse(json) as SerializableSelectionState
    return {
      selectedIds: new Set(parsed.selectedIds || []),
      lastSelectedId: parsed.lastSelectedId,
      context: parsed.context
        ? {
            entityType: parsed.context.entityType,
            filterParams: new URLSearchParams(parsed.context.filterParams),
          }
        : null,
    }
  } catch {
    return createEmptySelection()
  }
}

/**
 * Factory for creating an empty selection state
 */
export function createEmptySelection(): BulkSelectionState {
  return {
    selectedIds: new Set(),
    lastSelectedId: null,
    context: null,
  }
}

/**
 * Check if stored selection context matches current view
 *
 * Returns false if:
 * - Entity type has changed
 * - Filter parameters have changed
 *
 * This determines whether to clear selection on view change.
 */
export function contextMatches(
  current: SelectionContext | null,
  entityType: 'asset' | 'user',
  filterParams: URLSearchParams
): boolean {
  if (!current) {
    return false
  }

  // Entity type must match
  if (current.entityType !== entityType) {
    return false
  }

  // Filter params must match - compare stringified versions
  // Sort params for consistent comparison
  const currentParams = Array.from(current.filterParams.entries()).sort()
  const newParams = Array.from(filterParams.entries()).sort()

  return JSON.stringify(currentParams) === JSON.stringify(newParams)
}
