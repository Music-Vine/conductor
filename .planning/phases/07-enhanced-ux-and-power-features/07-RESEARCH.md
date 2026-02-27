# Phase 7: Enhanced UX & Power Features - Research

**Researched:** 2026-02-27
**Domain:** Activity feed, inline editing, CSV export gap-fill, contextual help tooltips
**Confidence:** HIGH — all findings from direct codebase inspection

## Summary

Phase 7 is a polish and power-user features phase that extends the existing system without introducing new entity types. All four features (activity feed, inline editing, CSV export, contextual help) have clear implementation paths that follow established patterns already in the codebase.

The biggest architectural decision is the system-wide activity feed: the `/api/audit` endpoint already stores events in memory with GET support, but it lacks mock seeding for historical data, system-wide entity coverage, and a `/api/activity` dedicated route. Inline editing is the only genuinely new UI pattern — no similar pattern exists in the codebase. The Cadence design system has no Tooltip component but `@radix-ui/react-tooltip` is already installed as a transitive dependency and can be used directly.

CSV export is the most straightforward of the four features: the utility infrastructure (`exportToCSV`, `react-papaparse`) is complete. Collections needs a Table component first (currently renders a card grid). Payees already has both an ExportPayeesButton component AND an `exportPayeesToCSV` utility function — the export utility exists but the button needs "Export filtered" vs "Export all" variants. The Activity feed export is purely new.

**Primary recommendation:** Build the activity feed API route first (it gates the dashboard widget, the full Activity page, and the activity export). Then inline editing, then the remaining CSV exports, then tooltips.

## Standard Stack

No new packages needed. Phase 7 uses only existing dependencies.

### Core (already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@radix-ui/react-tooltip` | 1.2.8 | Hover tooltip primitives | Already installed as transitive dep, used for ? icon tooltips |
| `react-papaparse` | 4.4.0 | CSV generation | Already used for all existing exports via `jsonToCSV` |
| `@tanstack/react-query` | 5.90.20 | Mutations for inline edit saves | Already used for user suspend/unsuspend pattern |
| `sonner` (via Cadence) | bundled | Toast notifications | Used for all export success/error feedback |
| `@tanstack/react-table` | 8.21.3 | Table infrastructure | All list views use this |
| `jotai` | 2.17.0 | Client-side state if needed | Available but likely not needed for this phase |

### Cadence Components Available

The Cadence design system (`@music-vine/cadence`) exports:
- `Button` (bold/subtle/error variants) — use for export buttons
- `Popover`, `PopoverTrigger`, `PopoverContent` — use for ? icon tooltips
- `Input` — use for inline edit inputs
- `Skeleton`, `SkeletonFragment` — use for activity feed loading states

**Important:** Cadence has NO `Tooltip` component. Use either:
1. `@radix-ui/react-tooltip` directly (already installed, v1.2.8) — recommended for hover-only tooltips
2. Cadence `Popover` — only if richer interaction needed

### No New Installs Required

```bash
# No npm installs needed — all dependencies already present
# @radix-ui/react-tooltip@1.2.8 is a transitive dependency
```

## Architecture Patterns

### Recommended File Structure

```
src/
├── app/
│   ├── api/
│   │   └── activity/
│   │       └── route.ts              # New: system-wide activity API
│   └── (platform)/
│       ├── page.tsx                  # Update: add ActivityFeedWidget
│       ├── activity/
│       │   ├── page.tsx              # New: full Activity page (server)
│       │   └── components/
│       │       ├── ActivityFeedClient.tsx    # New: client with entity search
│       │       └── ActivityFeedTable.tsx     # New: activity table
│       ├── collections/
│       │   └── components/           # New: CollectionTable.tsx + ExportCollectionsButton.tsx
│       └── assets/[id]/components/
│           └── OverviewTab.tsx       # Update: add inline editing to fields
├── components/
│   └── inline-editing/
│       └── InlineEditField.tsx       # New: shared inline edit component
├── lib/
│   ├── api/
│   │   └── activity.ts               # New: client-side activity API calls
│   └── utils/
│       └── export-csv.ts             # Update: add exportCollectionsToCSV, exportActivityToCSV
└── types/
    └── activity.ts                   # New: SystemActivityEntry type
```

### Pattern 1: System-Wide Activity Feed API

**What:** A new `/api/activity` route that generates mock system-wide events across all entity types, with filtering by entity type, entity ID, actor, and date range.

**When to use:** Dashboard widget (compact, last N entries) and full Activity page (filterable).

The existing `/api/audit` stores actual in-session events but starts empty on server restart. For the activity feed, generate seeded mock data like the per-asset activity route does.

```typescript
// /api/activity/route.ts pattern
// Source: Direct inspection of /src/app/api/assets/[id]/activity/route.ts

export interface SystemActivityEntry {
  id: string
  entityType: 'asset' | 'user' | 'contributor' | 'payee'
  entityId: string
  entityName: string    // human-readable: "Music Track 42", "james@example.com"
  action: string        // "Approved", "Rejected", "Suspended", "Rate changed"
  actorId: string
  actorName: string
  details: string
  createdAt: string
}

// GET /api/activity supports:
// ?limit=10           - for dashboard widget (default 10)
// ?entityType=asset   - filter by entity type
// ?entityId=asset-42  - filter to one entity (full page entity search)
// ?page=1             - pagination for full page
```

### Pattern 2: Inline Editing (InlineEditField Component)

**What:** Click-to-edit field wrapper. Value displays as text; clicking turns it into an input. Enter confirms, Escape cancels. No save on blur.

**When to use:** Any editable field on detail pages and table rows for Assets, Contributors, Payees, Users.

The pattern must handle:
- Controlled mode: tracks local edit value separately from committed value
- Escape restores original value (reset local state)
- Enter triggers PATCH mutation
- Visual distinction: cursor-text, subtle underline or ring on hover

```typescript
// Source: Codebase pattern — useMutation from @tanstack/react-query
// Pattern confirmed in SuspendUserDialog.tsx

interface InlineEditFieldProps {
  value: string | number
  onSave: (newValue: string) => Promise<void>
  type?: 'text' | 'number'
  className?: string
}

// Internal state machine:
// idle → editing (on click) → saving (on Enter) → idle (on success)
//                           → idle (on Escape, discard)
```

**Save via useMutation:** Follow the `SuspendUserDialog` pattern — use `useMutation` + `useQueryClient().invalidateQueries()` on success, `toast.error()` on failure.

**PATCH endpoints needed:** Assets and Collections already have PATCH. Contributors, Payees, and Users do NOT have PATCH routes — these need to be added.

```
Existing PATCH:  /api/assets/[id]      ✓
                 /api/collections/[id]  ✓
Missing PATCH:   /api/contributors/[id] ✗ — needs adding
                 /api/payees/[id]       ✗ — needs adding
                 /api/users/[id]        ✗ — needs adding
```

### Pattern 3: Activity Feed Dashboard Widget

**What:** Compact card on the dashboard home page showing last N activity entries with a "View all" link to `/activity`.

**When to use:** Dashboard home page (`/app/(platform)/page.tsx`).

The dashboard page is currently a basic server component. The widget should be a server component that fetches the last 10 activity entries and renders them. Clicking "View all" navigates to `/activity`. Clicking an entry navigates to the relevant entity detail page.

```typescript
// Source: /src/app/(platform)/page.tsx (dashboard — currently placeholder)
// Follow existing DashboardCard pattern but with real data

// Dashboard is a server component — fetch directly, no useEffect needed
async function ActivityFeedWidget() {
  const activity = await getSystemActivity({ limit: 10 })
  return (
    <div>
      {activity.map(entry => <ActivityEntry key={entry.id} entry={entry} />)}
      <Link href="/activity">View all activity</Link>
    </div>
  )
}
```

### Pattern 4: Full Activity Page with Entity Search

**What:** A page at `/activity` that lists all system activity with a search field for entity lookup. Searching for a user/asset/contributor filters the feed to only show that entity's events.

**Key decision:** Entity search is a URL param (`?entityId=user-42&entityType=user`). The dashboard widget links to `/activity?entityId=...&entityType=...` for pre-filtered view.

```typescript
// Source: URL-based state pattern from /src/app/(platform)/payees/components/PayeeTable.tsx
// searchParams pattern from /src/app/(platform)/collections/page.tsx

// Page props: searchParams: Promise<{ entityId?: string; entityType?: string; page?: string }>
```

### Pattern 5: CSV Export with Filtered vs All Options

**What:** Two distinct export actions per table — "Export filtered" exports current search/filter state, "Export all" exports without filters.

**Implementation:** Pass the current filtered data (already fetched for display) for "Export filtered". For "Export all", make a separate API call with `limit=10000` (or a dedicated export endpoint) to get all records.

The existing export button pattern (single button, passes current data) needs to be wrapped in a component that offers both options. Use a dropdown or two separate buttons.

```typescript
// Source: /src/app/(platform)/payees/components/ExportPayeesButton.tsx pattern
// ExportPayeesButton already exists for payees — needs to add "Export all" variant

// For "Export all": call the API without current filters but with high limit
// For "Export filtered": use the data already rendered in the table (existing pattern)
```

**New CSV functions needed in `/src/lib/utils/export-csv.ts`:**
- `exportCollectionsToCSV(collections: CollectionListItem[])` — new
- `exportActivityToCSV(activity: SystemActivityEntry[])` — new

### Pattern 6: Contextual Help Tooltips

**What:** A `?` icon button next to a field label. On hover, a tooltip appears with 1-2 sentence explanation. Disappears on mouse-leave.

**Use `@radix-ui/react-tooltip` directly** (already installed at v1.2.8, Cadence has no Tooltip component).

```typescript
// Source: @radix-ui/react-tooltip v1.2.8 — transitive dependency confirmed in node_modules

import * as Tooltip from '@radix-ui/react-tooltip'

// Wrap app in TooltipProvider (can be added to providers/index.tsx)
// <Tooltip.Provider>

function HelpTooltip({ text }: { text: string }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          type="button"
          className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-gray-400 text-xs text-gray-500 hover:border-gray-600 hover:text-gray-700"
          aria-label="Help"
        >
          ?
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="z-50 max-w-xs rounded bg-gray-900 px-3 py-1.5 text-xs text-white shadow"
          sideOffset={4}
        >
          {text}
          <Tooltip.Arrow className="fill-gray-900" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
```

**TooltipProvider must be added** to the app providers. Check `/src/providers/` for the right location.

### Anti-Patterns to Avoid

- **useEffect for data fetching in activity feed:** Use server components with direct API calls where possible (like the existing collections/assets pages). Only go client-side when interactivity is required.
- **Save on blur in inline editing:** The decision is Enter to confirm, Escape to cancel. Never save on blur — this matches the Linear/Notion pattern and prevents accidental saves when tabbing.
- **Separate page renders for inline edit:** Inline editing happens in-place via optimistic updates + mutation invalidation. Don't navigate away.
- **Re-implementing the CSV export utility:** `exportToCSV` in `/src/lib/utils/export-csv.ts` is the established pattern. Add new entity-specific functions there, don't write a new utility.
- **Using Popover for simple hover tooltips:** Popover is click-to-open. Use `@radix-ui/react-tooltip` for hover-only behaviour.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tooltip behaviour | Custom hover state + absolute positioning | `@radix-ui/react-tooltip` | Handles focus trapping, aria, portal positioning, collision detection |
| CSV generation | Manual string concatenation | `jsonToCSV` from `react-papaparse` (already used) | Handles quoting, special chars, encoding |
| Inline edit state | Custom reducer/context | Local `useState` + `useMutation` per field | Simpler — inline editing is field-local state, not shared |
| Relative timestamps | Manual date math | Reuse the `formatRelativeTime()` from `ActivityTab.tsx` | Already exists, just extract to a shared utility |
| Activity mock data | Complex seeded generator | Simple deterministic array indexed by hash | Follow the `/api/assets/[id]/activity` pattern |

**Key insight:** All infrastructure (CSV utils, mutation pattern, URL state, table pattern) already exists. Phase 7 is wiring new UI to existing infrastructure, not building new infrastructure.

## Common Pitfalls

### Pitfall 1: TooltipProvider Missing

**What goes wrong:** Radix Tooltip throws a runtime error: "A Tooltip component must be used within a TooltipProvider."
**Why it happens:** `@radix-ui/react-tooltip` requires a `TooltipProvider` ancestor. If placed ad-hoc without provider, it crashes.
**How to avoid:** Add `<Tooltip.Provider delayDuration={300}>` to the platform layout or providers file. Do this once, globally.
**Warning signs:** Error on first render of any page using HelpTooltip.

### Pitfall 2: Inline Edit Lost on Optimistic Update Race

**What goes wrong:** User edits a field, presses Enter. Before the mutation resolves, the parent component re-renders (e.g. from a query invalidation) and resets the display value.
**Why it happens:** If the field re-reads from the query cache during the pending mutation, it may flicker back to old value.
**How to avoid:** Track edit state locally (separate from displayed value). Only reset to "idle" on mutation success/error. Do NOT re-read from the original prop during the saving state.
**Warning signs:** Field value flickers during save.

### Pitfall 3: "Export All" Fetches Too Slowly

**What goes wrong:** "Export all" on a large dataset makes the user wait several seconds with no feedback.
**Why it happens:** No loading state on the export button.
**How to avoid:** Disable the button and show loading text (or spinner) while the fetch is in progress. Follow the existing mutation pattern's `isPending` state.
**Warning signs:** Button stays clickable after first click.

### Pitfall 4: Collections Table Missing Before Export

**What goes wrong:** The collections page currently renders a card grid — there's no TanStack Table component for collections. "Export Collections" needs a table to export FROM.
**Why it happens:** Collections was built with a card layout, not a table layout.
**How to avoid:** The planner should note that the Collections page needs a TanStack Table component added (following PayeeTable pattern) before an export button can be added to it. This is a prerequisite dependency within the phase.
**Warning signs:** Trying to add an export button to a card-grid layout will produce inconsistent UX.

### Pitfall 5: Activity Feed API Returns Empty on Cold Start

**What goes wrong:** The `/api/audit` in-memory store starts empty (resets on server restart). If the activity feed reads from audit events, it shows nothing on first load.
**Why it happens:** Mock data pattern — the audit store is write-only during a session.
**How to avoid:** Create a dedicated `/api/activity` route with seeded mock data (deterministic generation, not dependent on runtime audit events). The audit store can be a separate concern. Follow the `/api/assets/[id]/activity` pattern for seeded generation.
**Warning signs:** Activity feed shows "No activity" on first page load in development.

### Pitfall 6: Missing PATCH Routes for Inline Editing

**What goes wrong:** Inline editing on Contributors, Payees, and Users fails because there are no PATCH endpoints.
**Why it happens:** Only Assets and Collections have PATCH routes. Contributors, Payees, and Users only have GET routes.
**How to avoid:** Add PATCH handlers to `/api/contributors/[id]/route.ts`, `/api/payees/[id]/route.ts`, and `/api/users/[id]/route.ts` following the established pattern from `/api/assets/[id]/route.ts`.
**Warning signs:** 405 Method Not Allowed errors when inline edit saves.

## Code Examples

### Radix Tooltip (verified from installed package)

```typescript
// Source: @radix-ui/react-tooltip v1.2.8 — confirmed in node_modules
// Provider goes in /src/providers/ or /src/app/(platform)/layout.tsx

import * as Tooltip from '@radix-ui/react-tooltip'

// In layout or providers:
<Tooltip.Provider delayDuration={300}>
  {children}
</Tooltip.Provider>

// HelpTooltip component:
function HelpTooltip({ text }: { text: string }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          type="button"
          className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-gray-400 text-[10px] text-gray-500 hover:border-gray-600 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
          aria-label="Learn more"
        >
          ?
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="z-50 max-w-xs rounded-md bg-gray-900 px-3 py-2 text-xs leading-relaxed text-white shadow-lg"
          sideOffset={5}
        >
          {text}
          <Tooltip.Arrow className="fill-gray-900" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
```

### Inline Edit Field Pattern

```typescript
// Source: Pattern derived from SuspendUserDialog.tsx (useMutation pattern)
// and verified against @tanstack/react-query v5 API

'use client'

import { useState, useRef, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface InlineEditFieldProps {
  value: string
  onSave: (newValue: string) => Promise<void>
  queryKey: unknown[]  // for cache invalidation after save
  className?: string
}

export function InlineEditField({
  value,
  onSave,
  queryKey,
  className,
}: InlineEditFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [localValue, setLocalValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const mutation = useMutation({
    mutationFn: () => onSave(localValue),
    onSuccess: () => {
      setIsEditing(false)
      queryClient.invalidateQueries({ queryKey })
      toast.success('Saved')
    },
    onError: () => {
      toast.error('Failed to save')
      setLocalValue(value) // reset on error
      setIsEditing(false)
    },
  })

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      mutation.mutate()
    }
    if (e.key === 'Escape') {
      setLocalValue(value) // discard
      setIsEditing(false)
    }
  }

  if (!isEditing) {
    return (
      <span
        className={`cursor-text rounded px-1 hover:bg-gray-100 ${className}`}
        onClick={() => setIsEditing(true)}
      >
        {value}
      </span>
    )
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onKeyDown={handleKeyDown}
      disabled={mutation.isPending}
      className="w-full rounded border border-platform-primary px-1 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-platform-primary"
    />
  )
}
```

### CSV Export with Filtered vs All

```typescript
// Source: Extends existing /src/app/(platform)/payees/components/ExportPayeesButton.tsx
// Follow the established button + toast pattern

'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@music-vine/cadence/ui'
import { exportPayeesToCSV } from '@/lib/utils/export-csv'

interface ExportWithOptionsButtonProps {
  filteredData: PayeeListItem[]
  onExportAll: () => Promise<PayeeListItem[]>
  disabled?: boolean
}

export function ExportWithOptionsButton({
  filteredData,
  onExportAll,
  disabled,
}: ExportWithOptionsButtonProps) {
  const [isExportingAll, setIsExportingAll] = useState(false)

  async function handleExportAll() {
    setIsExportingAll(true)
    try {
      const allData = await onExportAll()
      exportPayeesToCSV(allData)
      toast.success(`Exported all ${allData.length} payees to CSV`)
    } catch {
      toast.error('Failed to export. Please try again.')
    } finally {
      setIsExportingAll(false)
    }
  }

  function handleExportFiltered() {
    try {
      exportPayeesToCSV(filteredData)
      toast.success(`Exported ${filteredData.length} payees to CSV`)
    } catch {
      toast.error('Failed to export. Please try again.')
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleExportFiltered}
        disabled={disabled || filteredData.length === 0}
        variant="subtle"
      >
        Export filtered
      </Button>
      <Button
        onClick={handleExportAll}
        disabled={disabled || isExportingAll}
        variant="subtle"
      >
        {isExportingAll ? 'Exporting...' : 'Export all'}
      </Button>
    </div>
  )
}
```

### Activity Feed Entry Format

```typescript
// Source: Pattern from /src/app/(platform)/assets/[id]/components/ActivityTab.tsx
// Reuse the timeline list-item pattern and formatRelativeTime

// Entry display format per CONTEXT decision:
// [Icon] [Actor name] [Action] [Entity name] · [Relative time]
// Example: "Sarah Johnson approved Music Track 42 · 2h ago"
// Example: "Alex Thompson suspended james@example.com · 3d ago"

// Action → entity navigation:
// entityType: 'asset' → /assets/[entityId]
// entityType: 'user' → /users/[entityId]
// entityType: 'contributor' → /contributors/[entityId]
// entityType: 'payee' → /payees/[entityId]
```

### Adding PATCH to Contributors Route

```typescript
// Source: Pattern from /src/app/api/assets/[id]/route.ts PATCH handler

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100))
  const { id } = await params
  const contributor = generateMockContributorDetail(parseInt(id.replace('contributor-', '')))

  try {
    const updates = await request.json()
    const updatedContributor = {
      ...contributor,
      ...updates,
      id: contributor.id,        // prevent ID change
      updatedAt: new Date().toISOString(),
    }
    return NextResponse.json({ data: updatedContributor })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
```

## State of the Art

| Old Approach | Current Approach | Status | Impact |
|--------------|------------------|--------|--------|
| Per-entity activity tabs | System-wide feed | Phase 7 adds this | Enables cross-entity audit trail view |
| Single "Export CSV" button | "Export filtered" + "Export all" | Phase 7 adds this | Users can export current view OR everything |
| Read-only detail fields | Inline editing | Phase 7 adds this | Eliminates navigation to edit forms for quick changes |
| No help text | ? icon tooltips | Phase 7 adds this | Reduces confusion on complex fields |

**Already complete (not being reworked):**
- Users export: `ExportUsersButton.tsx` + `exportUsersToCSV()` — add "Export all" variant only
- Assets export: `ExportAssetsButton.tsx` + `exportAssetsToCSV()` — add "Export all" variant only
- Contributors export: `ExportContributorsButton.tsx` + `exportContributorsToCSV()` — add "Export all" variant only
- Payees export: `ExportPayeesButton.tsx` + `exportPayeesToCSV()` — add "Export all" variant only (note: button exists but only does "filtered" currently)

## Open Questions

1. **Collections table vs card grid**
   - What we know: Collections currently renders a card grid, not a TanStack Table
   - What's unclear: Should Phase 7 add a full table layout, or add export to the card grid?
   - Recommendation: Add a basic `CollectionTable.tsx` (following PayeeTable pattern) to the collections page before the export button. The table layout is more consistent with other list pages. This is a non-trivial task within the phase — the planner should treat it as a prerequisite task.

2. **Which specific fields to enable inline editing on**
   - What we know: CONTEXT says "Claude's Discretion" for which specific fields per entity
   - Recommendation per entity:
     - **Assets:** title, description, genre, tags (metadata fields; NOT status — status is controlled by workflow)
     - **Contributors:** name, email, phone (contact details; NOT status — use existing status controls)
     - **Payees:** name, email, paymentMethod (contact/payment; NOT status)
     - **Users:** display name, username (NOT email or status — security-sensitive)

3. **Dashboard widget entry count**
   - What we know: CONTEXT says "Claude's Discretion" for compact feed size
   - Recommendation: Show 10 entries in the widget. This matches the typical dashboard widget convention and fits without excessive scrolling.

4. **Activity feed entity search UX**
   - What we know: Entity search filters the feed to show all activity related to that entity
   - What's unclear: Is search a free-text lookup or a structured entity picker?
   - Recommendation: Simple text input filtered by URL param. If user types "asset-42" or "user-12", the API filters by entityId. For usability, also accept partial name matches. Keep it simple — no fancy combobox needed.

## Sources

### Primary (HIGH confidence)

- Direct codebase inspection — `/src/lib/utils/export-csv.ts` — CSV infrastructure confirmed
- Direct codebase inspection — `/src/app/api/audit/route.ts` — Audit store pattern confirmed
- Direct codebase inspection — `/src/app/api/assets/[id]/activity/route.ts` — Per-entity activity mock pattern confirmed
- Direct codebase inspection — `/node_modules/@music-vine/cadence/dist/components/index.d.ts` — Cadence exports confirmed (no Tooltip)
- Direct codebase inspection — `/node_modules/@radix-ui/react-tooltip/package.json` — v1.2.8 confirmed installed
- Direct codebase inspection — `package.json` — all dependency versions confirmed
- Direct codebase inspection — `/src/app/(platform)/payees/components/ExportPayeesButton.tsx` — payees export already exists
- Direct codebase inspection — PATCH endpoint inventory — Assets and Collections have PATCH; Contributors, Payees, Users do not

### Secondary (MEDIUM confidence)

- `@radix-ui/react-tooltip` API — standard Radix primitive pattern, follows same structure as `@radix-ui/react-dropdown-menu` which is used in `UserRowActions.tsx`

### Tertiary (LOW confidence)

- None — all findings from direct codebase inspection

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified from package.json and node_modules
- Architecture: HIGH — derived from direct codebase inspection of existing patterns
- Pitfalls: HIGH — derived from gap analysis of what exists vs what is needed

**Research date:** 2026-02-27
**Valid until:** 2026-03-27 (stable codebase, 30-day window)
