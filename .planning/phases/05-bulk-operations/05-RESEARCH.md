# Phase 5: Bulk Operations - Research

**Researched:** 2026-02-11
**Domain:** Bulk operations with cross-page selection, async processing, and progress tracking
**Confidence:** HIGH

## Summary

Phase 5 implements bulk operations allowing staff to select multiple items across pagination boundaries, perform large-scale actions (status changes, metadata edits, deletion), track async operation progress, and handle failures gracefully. The research focused on selection patterns, async job processing, progress visibility, and error handling for operations affecting 100+ items.

The standard approach combines **existing TanStack Table selection features** with **Server-Sent Events (SSE)** for real-time progress updates, **Next.js Route Handlers** with streaming responses for async processing, and **Sonner toast notifications** (already installed via Cadence) for non-blocking progress feedback. This stack builds directly on Phase 1-4 patterns while adding the minimal infrastructure needed for bulk operations.

**CONTEXT.md decisions:** User has specified Gmail-style floating action bar, "Select All" selects all filtered items across pages, Shift+Click range selection across pages, stop-on-first-error failure handling, progress shown in toast notifications only (no modal), and single audit log entry per bulk operation. These decisions are locked and constrain implementation choices.

**Primary recommendation:** Extend existing useTableKeyboard hook for cross-page selection state management, implement SSE route handlers for progress streaming, build floating action bar with Radix AlertDialog for confirmations, and leverage existing toast notification infrastructure (Sonner via Cadence).

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TanStack Table | v8.21.3 (installed) | Selection state management with manual control | Already implemented in Phase 3 - provides selectedIndices Set and selection helpers (selectAll, toggleSelection) ready to extend for cross-page selection |
| Server-Sent Events (SSE) | Native Web API | Real-time progress streaming from server to client | Native browser API, one-way server-to-client, perfect for progress updates, lower overhead than WebSockets, works with Next.js Route Handlers |
| Next.js Route Handlers | 16.1.6 (installed) | Streaming responses with ReadableStream | Built-in support for streaming, works with SSE, allows long-running operations with incremental updates |
| Sonner | 2.0.7 (via Cadence) | Non-blocking toast notifications with progress | Already installed, supports promise tracking, dismissable, auto-stacking, perfect for corner progress updates per CONTEXT decision |
| Radix AlertDialog | 1.1.15 (installed) | Accessible confirmation dialogs | Already used in Phase 2 for destructive actions, supports type-to-confirm pattern, WAI-ARIA compliant |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| TanStack Query | 5.90.20 (installed) | Mutation orchestration and cache invalidation | Already in project - use for bulk action mutations, optimistic updates, and automatic refetch after bulk operations complete |
| react-hotkeys-hook | 5.2.1 (installed) | Keyboard shortcuts for bulk actions | Already in project - add Cmd+Shift+A for "select all", Shift+Click for range selection detection |
| Jotai | 2.17.0 (installed) | Cross-page selection state persistence | Already in project - store selected IDs across page navigations using atomWithStorage for resilient selection state |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| SSE | WebSockets | WebSockets are bidirectional (overkill for one-way progress), require separate server infrastructure, more complex to scale. SSE works with standard HTTP, simpler for progress-only use case. |
| SSE | Polling | Polling wastes bandwidth (constant requests even when no updates), higher latency (up to poll interval delay), server load scales with client count. SSE pushes only when data changes. |
| Streaming Route Handler | Background job queue (BullMQ + Redis) | BullMQ requires Redis infrastructure, adds deployment complexity, overkill for "stop on first error" simple failure model. Route handler streaming sufficient for 100-200 item operations. |
| Jotai for selection state | React Context | Context causes re-renders on every selection change across entire tree. Jotai atomWithStorage provides granular subscriptions, persists across navigation, better performance. |
| Type-to-confirm | Simple confirmation | CONTEXT.md specifies type-to-confirm for destructive actions (delete, archive, takedown). Must implement, not optional. |

**Installation:**
```bash
# All dependencies already installed in Phase 1-4
# No new dependencies required
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── (platform)/
│   │   ├── assets/
│   │   │   ├── components/
│   │   │   │   ├── AssetTable.tsx              # Extend with bulk selection
│   │   │   │   ├── BulkActionBar.tsx           # Floating bottom bar
│   │   │   │   └── BulkConfirmDialog.tsx       # Type-to-confirm destructive actions
│   │   │   └── page.tsx                        # Add bulk action state
│   │   └── users/
│   │       └── components/                     # Same pattern for users
│   └── api/
│       ├── assets/
│       │   └── bulk/
│       │       ├── delete/route.ts             # Bulk delete with SSE progress
│       │       ├── approve/route.ts            # Bulk approve with SSE progress
│       │       └── tag/route.ts                # Bulk add/remove tags with SSE
│       └── users/
│           └── bulk/
│               └── suspend/route.ts            # Bulk suspend with SSE progress
├── hooks/
│   ├── useBulkSelection.ts                     # Cross-page selection state
│   ├── useBulkProgress.ts                      # SSE connection and progress tracking
│   └── useTableKeyboard.tsx                    # Extend for range selection
└── lib/
    └── bulk-operations/
        ├── selection.ts                        # Selection state utilities
        ├── progress.ts                         # SSE client helpers
        └── audit.ts                            # Bulk audit log creation
```

### Pattern 1: Cross-Page Selection State

**What:** Maintain selection state that persists across page navigation and filter changes using Jotai atoms.

**When to use:** For "Select All" across filtered results and Shift+Click range selection across pages per CONTEXT decisions.

**Example:**
```typescript
// Source: Jotai atomWithStorage + TanStack Table selection state pattern
// hooks/useBulkSelection.ts

import { atomWithStorage } from 'jotai/utils'
import { useAtom } from 'jotai'

// Persist selection across navigation
const selectedIdsAtom = atomWithStorage<Set<string>>(
  'bulk-selection',
  new Set(),
  {
    getItem: (key) => {
      const stored = localStorage.getItem(key)
      return stored ? new Set(JSON.parse(stored)) : new Set()
    },
    setItem: (key, value) => {
      localStorage.setItem(key, JSON.stringify([...value]))
    },
    removeItem: (key) => localStorage.removeItem(key),
  }
)

export function useBulkSelection() {
  const [selectedIds, setSelectedIds] = useAtom(selectedIdsAtom)

  const selectAll = async (filters: FilterState) => {
    // Fetch all IDs matching current filters
    const response = await fetch(`/api/assets?${new URLSearchParams({
      ...filters,
      fields: 'id', // Only fetch IDs
    })}`)
    const { data } = await response.json()
    setSelectedIds(new Set(data.map(item => item.id)))
  }

  const selectRange = (startId: string, endId: string, allItems: any[]) => {
    const startIndex = allItems.findIndex(item => item.id === startId)
    const endIndex = allItems.findIndex(item => item.id === endId)
    const [min, max] = [Math.min(startIndex, endIndex), Math.max(startIndex, endIndex)]

    const rangeIds = allItems.slice(min, max + 1).map(item => item.id)
    setSelectedIds(prev => {
      const next = new Set(prev)
      rangeIds.forEach(id => next.add(id))
      return next
    })
  }

  const clearSelection = () => setSelectedIds(new Set())

  return { selectedIds, selectAll, selectRange, clearSelection }
}
```

### Pattern 2: SSE Progress Streaming

**What:** Stream progress updates from server to client using Server-Sent Events for real-time bulk operation feedback.

**When to use:** For all bulk operations affecting 100+ items where progress visibility is required per CONTEXT decisions.

**Example:**
```typescript
// Source: https://www.pedroalonso.net/blog/sse-nextjs-real-time-notifications/
// app/api/assets/bulk/delete/route.ts

export async function POST(request: Request) {
  const { assetIds } = await request.json()

  // Create SSE stream
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      let processed = 0
      const total = assetIds.length

      for (const assetId of assetIds) {
        try {
          // Perform deletion
          await deleteAsset(assetId)
          processed++

          // Send progress update
          const progress = {
            type: 'progress',
            processed,
            total,
            percentage: Math.round((processed / total) * 100),
            currentItem: assetId,
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(progress)}\n\n`))

        } catch (error) {
          // Stop on first error per CONTEXT decision
          const errorEvent = {
            type: 'error',
            message: error.message,
            processed,
            total,
            failedItem: assetId,
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`))
          controller.close()
          return
        }
      }

      // Complete
      const complete = { type: 'complete', processed, total }
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(complete)}\n\n`))
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
```

### Pattern 3: Client-Side SSE Progress Hook

**What:** Custom hook to connect to SSE endpoint and update UI with progress notifications.

**When to use:** For tracking bulk operation progress in real-time with toast notifications.

**Example:**
```typescript
// Source: Custom pattern combining SSE + Sonner
// hooks/useBulkProgress.ts

import { toast } from 'sonner'

export function useBulkProgress() {
  const startBulkOperation = (endpoint: string, body: any) => {
    return new Promise((resolve, reject) => {
      const eventSource = new EventSource(`/api${endpoint}`)
      let toastId: string | number

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data)

        if (data.type === 'progress') {
          // Update toast with progress
          const message = `Processing ${data.processed} of ${data.total} items... (${data.percentage}%)`

          if (toastId) {
            toast.loading(message, { id: toastId })
          } else {
            toastId = toast.loading(message)
          }
        }

        if (data.type === 'error') {
          toast.error(data.message, { id: toastId })
          eventSource.close()
          reject(new Error(data.message))
        }

        if (data.type === 'complete') {
          toast.success(`Processed ${data.total} items successfully`, { id: toastId })
          eventSource.close()
          resolve(data)
        }
      }

      eventSource.onerror = () => {
        toast.error('Connection lost', { id: toastId })
        eventSource.close()
        reject(new Error('SSE connection failed'))
      }
    })
  }

  return { startBulkOperation }
}
```

### Pattern 4: Type-to-Confirm Destructive Dialog

**What:** Radix AlertDialog with text input requiring user to type action name for confirmation.

**When to use:** For destructive bulk actions (delete, archive, takedown) per CONTEXT decision.

**Example:**
```typescript
// Source: https://medium.com/design-bootcamp/a-ux-guide-to-destructive-actions-their-use-cases-and-best-practices-f1d8a9478d03
// components/BulkConfirmDialog.tsx

import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { Button } from '@music-vine/cadence'
import { useState } from 'react'

interface BulkConfirmDialogProps {
  action: 'delete' | 'archive' | 'takedown'
  itemCount: number
  onConfirm: () => void
}

export function BulkConfirmDialog({ action, itemCount, onConfirm }: BulkConfirmDialogProps) {
  const [confirmText, setConfirmText] = useState('')
  const requiredText = action.toUpperCase() // "DELETE", "ARCHIVE", "TAKEDOWN"
  const isValid = confirmText === requiredText

  return (
    <AlertDialog.Root>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg max-w-md">
          <AlertDialog.Title className="text-lg font-semibold text-gray-900">
            {action === 'delete' ? 'Delete' : action === 'archive' ? 'Archive' : 'Takedown'} {itemCount} items?
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-gray-600">
            This action cannot be undone. Type <strong>{requiredText}</strong> to confirm.
          </AlertDialog.Description>

          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
            className="mt-4 w-full px-3 py-2 border border-gray-300 rounded"
            placeholder={requiredText}
          />

          <div className="mt-6 flex gap-3 justify-end">
            <AlertDialog.Cancel asChild>
              <Button variant="subtle">Cancel</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button
                variant="error"
                disabled={!isValid}
                onClick={onConfirm}
              >
                {action === 'delete' ? 'Delete' : action === 'archive' ? 'Archive' : 'Takedown'}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
```

### Pattern 5: Floating Action Bar (Gmail-style)

**What:** Fixed bottom bar that appears when items are selected, showing count and available actions.

**When to use:** Always when selectedIds.size > 0 per CONTEXT decision for Gmail-style UX.

**Example:**
```typescript
// Source: https://www.eleken.co/blog-posts/bulk-actions-ux
// components/BulkActionBar.tsx

import { Button } from '@music-vine/cadence'

interface BulkActionBarProps {
  selectedCount: number
  onApprove?: () => void
  onReject?: () => void
  onAddTag?: () => void
  onDelete?: () => void
  onClearSelection: () => void
}

export function BulkActionBar({
  selectedCount,
  onApprove,
  onReject,
  onAddTag,
  onDelete,
  onClearSelection,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-900">
            {selectedCount} item{selectedCount === 1 ? '' : 's'} selected
          </span>
          <Button variant="subtle" size="sm" onClick={onClearSelection}>
            Clear selection
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {onApprove && (
            <Button variant="bold" size="sm" onClick={onApprove}>
              Approve
            </Button>
          )}
          {onReject && (
            <Button variant="subtle" size="sm" onClick={onReject}>
              Reject
            </Button>
          )}
          {onAddTag && (
            <Button variant="subtle" size="sm" onClick={onAddTag}>
              Add Tag
            </Button>
          )}
          {onDelete && (
            <Button variant="error" size="sm" onClick={onDelete}>
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
```

### Anti-Patterns to Avoid

- **Modal progress dialogs:** CONTEXT.md specifies toast notifications only. Don't create blocking modals for progress - staff must continue working.
- **Cancel button on progress:** CONTEXT.md specifies no cancel. Once started, operation must complete or fail.
- **Per-item audit logs:** CONTEXT.md specifies single audit log entry per bulk operation. Don't create individual logs for each item.
- **Retry mechanisms:** CONTEXT.md specifies stop on first error with no retry. Don't build retry logic - staff must fix and restart manually.
- **Replace all metadata operations:** CONTEXT.md specifies additive only. Bulk tag operations should add/remove tags, not replace entire tag list.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SSE connection management | Custom EventSource wrapper with reconnect logic | Native EventSource API with simple error handling | SSE auto-reconnects by spec. Custom reconnect logic introduces bugs (duplicate connections, memory leaks). Keep it simple. |
| Bulk operation queue | Custom job queue with worker pool | Sequential processing in Route Handler with streaming | CONTEXT specifies stop-on-first-error. No parallelization needed. Sequential is simpler and sufficient for 100-200 items. |
| Selection state sync across tabs | BroadcastChannel or SharedWorker | Jotai atomWithStorage with localStorage | Selection is per-tab intent. Cross-tab sync adds complexity for no user benefit. |
| Progress percentage calculation | Complex ETA algorithms with moving averages | Simple processed/total percentage | CONTEXT shows basic percentage + time estimate. Simple linear calculation is sufficient. Don't over-engineer. |
| Type-to-confirm validation | Custom validation with typo tolerance | Exact string match (case-insensitive) | Destructive action should require precision. Typo tolerance defeats purpose of type-to-confirm friction. |

**Key insight:** Bulk operations appear complex but CONTEXT decisions simplify significantly: no cancel, no retry, stop-on-first-error, single audit entry. This enables simple sequential processing with SSE streaming rather than full job queue infrastructure.

## Common Pitfalls

### Pitfall 1: SSE Buffering in Next.js

**What goes wrong:** SSE events arrive all at once after operation completes instead of streaming incrementally.

**Why it happens:** Next.js buffers route handler responses until function completes. Using `await` in a loop collects all data before returning Response.

**How to avoid:** Use ReadableStream with controller.enqueue() inside async start() function. Don't await the entire operation - enqueue events as they happen.

**Warning signs:** Toast shows "Processing 100 of 100" immediately instead of counting up incrementally.

**Source:** https://medium.com/@oyetoketoby80/fixing-slow-sse-server-sent-events-streaming-in-next-js-and-vercel-99f42fbdb996

### Pitfall 2: Selection State Desync on Filter Change

**What goes wrong:** Selected items remain selected after applying filters that exclude those items, causing bulk actions to affect invisible items.

**Why it happens:** Selection state (Set of IDs) is separate from visible items (filtered table rows). Filters change visible set but don't clear selection.

**How to avoid:** Clear selection automatically when filters change per CONTEXT decision: "Selection clears when staff apply new filters or navigate away."

**Warning signs:** Bulk action bar shows "5 items selected" but table shows "No results found."

```typescript
// Clear selection on filter change
useEffect(() => {
  clearSelection()
}, [searchParams]) // Trigger on any URL change
```

### Pitfall 3: Memory Leaks from Unclosed EventSource

**What goes wrong:** Browser keeps SSE connections open indefinitely, consuming memory and causing "too many connections" errors.

**Why it happens:** Forgot to call eventSource.close() in cleanup function or error handlers.

**How to avoid:** Always close EventSource in promise reject, resolve, and error handlers. Use React cleanup function.

**Warning signs:** Network tab shows multiple open SSE connections. Memory usage grows over time.

```typescript
// Always close in all code paths
useEffect(() => {
  const eventSource = new EventSource('/api/bulk/delete')

  return () => {
    eventSource.close() // Cleanup on unmount
  }
}, [])
```

### Pitfall 4: Race Conditions with Cache Invalidation

**What goes wrong:** Table shows stale data after bulk operation completes because invalidation runs before server updates propagate.

**Why it happens:** TanStack Query invalidates cache immediately when mutation resolves, but server may still be writing database changes.

**How to avoid:** Add small delay (100-200ms) before invalidation or use onSettled instead of onSuccess.

**Warning signs:** Refresh button required to see bulk operation results. "Delete 5 items" succeeds but items still visible.

```typescript
// Wait for server to propagate changes
mutationFn: async () => {
  await bulkDelete(ids)
  await new Promise(resolve => setTimeout(resolve, 200)) // Small delay
},
onSuccess: () => {
  queryClient.invalidateQueries(['assets'])
}
```

### Pitfall 5: Shift+Click Range Selection Across Loaded Pages

**What goes wrong:** Shift+Click to select range fails when start and end items are on different pages that haven't been loaded yet.

**Why it happens:** CONTEXT specifies "loads intermediate pages if needed" but implementation only checks currently loaded virtualRows.

**How to avoid:** Detect cross-page range and fetch intermediate pages before calculating selection. Show loading state during fetch.

**Warning signs:** Shift+Click selects only visible rows, skipping items on unloaded pages between start and end.

```typescript
// Detect and load intermediate pages
const selectRange = async (startId: string, endId: string) => {
  const startPage = getPageForId(startId)
  const endPage = getPageForId(endId)

  if (startPage !== endPage) {
    // Load all intermediate pages
    for (let page = Math.min(startPage, endPage); page <= Math.max(startPage, endPage); page++) {
      await loadPage(page)
    }
  }

  // Now calculate full range with all data loaded
  const allItems = getAllLoadedItems()
  const range = calculateRange(startId, endId, allItems)
  addToSelection(range)
}
```

## Code Examples

Verified patterns from official sources:

### Sonner Toast with Promise Tracking

```typescript
// Source: https://github.com/emilkowalski/sonner
import { toast } from 'sonner'

const promise = bulkDeleteAssets(selectedIds)

toast.promise(promise, {
  loading: 'Deleting assets...',
  success: (data) => `Deleted ${data.count} assets successfully`,
  error: 'Failed to delete assets',
})
```

### TanStack Table Row Selection State

```typescript
// Source: https://tanstack.com/table/v8/docs/guide/row-selection
import { useReactTable } from '@tanstack/react-table'

const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

const table = useReactTable({
  data,
  columns,
  state: {
    rowSelection,
  },
  onRowSelectionChange: setRowSelection,
  getCoreRowModel: getCoreRowModel(),
  enableRowSelection: true, // Enable row selection
  enableMultiRowSelection: true, // Enable multi-selection
})

// Access selected rows
const selectedRows = table.getSelectedRowModel().rows
const selectedIds = selectedRows.map(row => row.original.id)
```

### React Batching for Bulk Selection Performance

```typescript
// Source: https://react.dev/learn/queueing-a-series-of-state-updates
import { startTransition } from 'react'

// Batch multiple selection updates
const selectRange = (startId: string, endId: string) => {
  startTransition(() => {
    // All state updates batched - single re-render
    setSelectedIds(prev => {
      const next = new Set(prev)
      rangeIds.forEach(id => next.add(id))
      return next
    })
    setFocusedIndex(endIndex)
    updateSelectionCount()
  })
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Polling for progress | Server-Sent Events (SSE) | React 18+ era (2022+) | SSE provides real-time updates without polling overhead. Native browser support, works with Next.js Route Handlers. |
| Modal dialogs for progress | Toast notifications with progress | 2023+ (Sonner adoption) | Non-blocking UX allows staff to continue working. Toast auto-stacks for multiple operations. |
| Offset pagination for selection | ID-based selection state | TanStack Table v8 (2023+) | Selection by ID Set works across pagination changes. Offset-based selection breaks when page boundaries change. |
| Custom job queues (BullMQ) | Route handler streaming | Next.js 13+ App Router (2023+) | Route handlers with ReadableStream sufficient for medium-scale bulk ops (100-200 items). No Redis required. |
| React Context for selection | Jotai atoms | 2024+ (Jotai maturity) | Atoms prevent unnecessary re-renders. atomWithStorage persists across navigation. Better performance than Context. |

**Deprecated/outdated:**
- **WebSockets for progress updates:** Overkill for one-way communication. SSE simpler and works with standard HTTP.
- **Redux for selection state:** Too heavy for simple Set<string> state. Jotai atoms sufficient and more performant.
- **react-toastify:** Older toast library. Sonner is modern standard (7M+ weekly downloads, built-in with shadcn/ui).

## Open Questions

Things that couldn't be fully resolved:

1. **Cross-page range selection timing**
   - What we know: CONTEXT specifies "loads intermediate pages if needed" for Shift+Click range selection
   - What's unclear: Acceptable loading time before selection completes (100ms? 500ms? 1s?)
   - Recommendation: Start with 100ms debounce, show loading indicator if takes longer, provide escape hatch (ESC to cancel)

2. **Navigation during in-progress operation**
   - What we know: CONTEXT specifies no cancel button, but doesn't address navigation behavior
   - What's unclear: Should navigating away from page cancel operation or warn user?
   - Recommendation: Show "Operation in progress" toast that persists across navigation. Let operation complete in background. Toast appears on return.

3. **Selection count display for "Select All" with 10k+ items**
   - What we know: CONTEXT shows count like "Select all 1,234 assets" but doesn't specify loading pattern
   - What's unclear: Should count load eagerly (GET /assets?fields=id) or lazily (only when Select All clicked)?
   - Recommendation: Lazy load on "Select All" click. Show "Select all..." loading state, then "Select all 1,234 assets" after count fetched.

## Sources

### Primary (HIGH confidence)

- [TanStack Table v8 Row Selection Guide](https://tanstack.com/table/v8/docs/guide/row-selection) - Official docs for selection state management
- [Server-Sent Events in Next.js](https://www.pedroalonso.net/blog/sse-nextjs-real-time-notifications/) - SSE implementation patterns
- [Fixing SSE Streaming in Next.js](https://medium.com/@oyetoketoby80/fixing-slow-sse-server-sent-events-streaming-in-next-js-and-vercel-99f42fbdb996) - Next.js buffering pitfall
- [Radix UI AlertDialog](https://www.radix-ui.com/primitives/docs/components/alert-dialog) - Type-to-confirm implementation
- [Sonner GitHub](https://github.com/emilkowalski/sonner) - Toast notification API with promise support
- [React Batching State Updates](https://react.dev/learn/queueing-a-series-of-state-updates) - Performance optimization for bulk selection

### Secondary (MEDIUM confidence)

- [Bulk Actions UX Guidelines](https://www.eleken.co/blog-posts/bulk-actions-ux) - Gmail-style floating action bar patterns
- [Type-to-Confirm UX Guide](https://medium.com/design-bootcamp/a-ux-guide-to-destructive-actions-their-use-cases-and-best-practices-f1d8a9478d03) - Destructive action patterns
- [Next.js Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route) - Streaming response documentation
- [TanStack Query Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/mutations) - Mutation orchestration patterns
- [React Concurrent Mode](https://medium.com/@saachikaur19/why-react-batches-state-updates-and-why-thats-a-good-thing-a59919d05383) - Performance improvements for bulk updates
- [Audit Trail Best Practices](https://sprinto.com/blog/audit-trail/) - 2026 compliance guidelines

### Tertiary (LOW confidence)

- [BullMQ with Next.js](https://www.vishalgarg.io/articles/how-to-setup-queue-jobs-in-nextjs-with-bullmq) - Alternative job queue approach (not recommended for this use case)
- [IndexedDB for State Management](https://medium.com/@artemkhrenov/using-browser-storage-for-application-state-management-705ae125e174) - Alternative to Jotai for offline-first (not needed)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed, patterns verified in official docs, TanStack Table + SSE combination proven
- Architecture: HIGH - CONTEXT decisions constrain implementation significantly, removing architectural ambiguity
- Pitfalls: MEDIUM - SSE buffering pitfall well-documented, other pitfalls based on common patterns but not Next.js-specific

**Research date:** 2026-02-11
**Valid until:** 2026-03-11 (30 days - stable tech stack, minor version updates expected but APIs stable)

**Key constraints from CONTEXT.md:**
- Selection: Select All = all filtered items across pages, Shift+Click range selection across pages, clears on filter change
- Confirmation: Type-to-confirm for destructive (delete/archive/takedown), simple confirm for safe actions
- Progress: Toast notification only (no modal), no cancel button, show count/percentage/ETA/current item
- Failure: Stop on first error, show error in toast, no retry mechanism
- Audit: Single log entry per bulk operation with operation ID
- Actions: Status changes, metadata edits (additive only), organization, destructive
