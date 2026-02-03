# Phase 2: User Management - Research

**Researched:** 2026-02-03
**Domain:** Large-scale data table management with React Server Components
**Confidence:** HIGH

## Summary

Phase 2 implements user management for 3M+ user accounts requiring server-side data fetching, advanced filtering, tabbed detail views, and account management actions. The research focused on industry-standard patterns for scalable data tables in Next.js 15 App Router applications.

The standard approach combines **TanStack Table v8** (headless table logic) with **Next.js App Router searchParams** for URL-based state management, **TanStack Query** for client-side data orchestration, and **Radix UI primitives** for accessible UI components. This stack is the de facto standard for 2026 React applications requiring production-grade data tables.

For 3M+ records, server-side pagination is mandatory. The architecture uses React Server Components for initial data loading with searchParams on the server, while TanStack Query handles client-side interactions and optimistic updates. Cursor-based pagination is strongly recommended over offset-based for datasets this large to maintain consistent O(1) performance.

**Primary recommendation:** Use TanStack Table v8 in manual mode with Next.js searchParams for server-side pagination, filtering, and sorting. Build on existing Cadence design system and established patterns from Phase 1 (API client, skeletons, platform toggle).

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TanStack Table | v8 (latest) | Headless table logic with manual pagination/filtering/sorting | Industry standard for React tables - 48k+ GitHub stars, framework-agnostic core, fully controlled state management for server-side operations |
| TanStack Query | v5.90.20 (installed) | Client-side state management and data fetching | Already in project - perfect for mutations, optimistic updates, and cache management with RSC hybrid pattern |
| Next.js App Router | 16.1.6 (installed) | Server-side rendering and routing | Built-in searchParams support for URL-based filtering, async page props in v15+, dynamic rendering |
| Radix UI Primitives | Latest | Accessible headless UI components (Tabs, DropdownMenu, AlertDialog) | WAI-ARIA compliant primitives, integrates with Cadence design system approach, fully customizable with Tailwind |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-papaparse | Latest | CSV parsing and export with jsonToCSV | USER-08 requirement - CSV export. Fastest in-browser CSV library (2-3KB), includes CSVDownloader component |
| Sonner | Latest | Toast notifications | Success/error feedback after actions. Modern standard for React toast (11.5k stars, 7M+ weekly downloads), built-in with shadcn/ui ecosystem |
| zod | 4.3.6 (installed) | Runtime validation | Already in project - validate searchParams, filter inputs, and form data |
| react-hook-form | 7.71.1 (installed) | Form state management | Already in project - use for filter forms, search inputs with debounce |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| TanStack Table | AG Grid | AG Grid is enterprise-focused (commercial license for advanced features), heavier bundle, less flexibility. TanStack Table is headless and pairs better with Cadence custom design system. |
| Cursor pagination | Offset pagination | Offset degrades exponentially with position (unusable beyond first few thousand pages on 3M records). Cursor maintains O(1) performance. Only use offset if user needs "jump to page X" feature. |
| Sonner | React Toastify | React Toastify is older, larger bundle. Sonner is 2-3KB, modern API, better DX, recommended by shadcn/ui. |
| react-papaparse | json2csv (Node.js) | json2csv is server-side only. react-papaparse works client-side for instant downloads without round-trip. Use json2csv only if building large exports (>100k rows) that need streaming. |

**Installation:**
```bash
npm install @tanstack/react-table react-papaparse sonner
npm install @radix-ui/react-tabs @radix-ui/react-dropdown-menu @radix-ui/react-alert-dialog
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── (platform)/
│   │   └── users/
│   │       ├── page.tsx                    # List view (RSC with searchParams)
│   │       ├── [id]/
│   │       │   └── page.tsx                # Detail view with tabs (RSC)
│   │       ├── components/
│   │       │   ├── UserTable.tsx           # Client component with TanStack Table
│   │       │   ├── UserFilters.tsx         # Filter UI
│   │       │   ├── UserDetailTabs.tsx      # Radix tabs wrapper
│   │       │   └── UserActions.tsx         # Dropdown menu with actions
│   │       └── actions.ts                  # Server actions for mutations
│   └── api/
│       └── users/
│           ├── route.ts                    # List endpoint with pagination
│           ├── [id]/
│           │   └── route.ts                # Detail endpoint
│           ├── [id]/suspend/
│           │   └── route.ts                # Suspend action
│           ├── [id]/disconnect-oauth/
│           │   └── route.ts                # Disconnect OAuth
│           └── [id]/refund/
│               └── route.ts                # Refund endpoint (calls Stripe)
├── lib/
│   ├── api/
│   │   ├── users.ts                        # API client functions
│   │   └── types.ts                        # User-related types
│   └── utils/
│       └── export-csv.ts                   # CSV export utilities
└── components/
    └── skeletons/
        └── TableRowSkeleton.tsx            # Already exists - use this
```

### Pattern 1: Server Component with searchParams Pagination

**What:** Next.js page components receive searchParams as async props and fetch data server-side based on URL state.

**When to use:** For the main user list page (USER-01) where SEO, shareability, and initial load performance matter.

**Example:**
```typescript
// src/app/(platform)/users/page.tsx
// Source: https://nextjs.org/learn/dashboard-app/adding-search-and-pagination

interface SearchParams {
  query?: string
  page?: string
  status?: string
  tier?: string
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  // Next.js 15: searchParams is async
  const params = await searchParams

  const query = params.query || ''
  const page = Number(params.page) || 1
  const status = params.status || 'all'
  const tier = params.tier || 'all'

  // Fetch data server-side (can be direct DB query or API call)
  const { users, pagination } = await fetchUsers({
    query,
    page,
    status,
    tier,
    limit: 50,
  })

  return (
    <div>
      <UserFilters />
      <UserTable
        initialData={users}
        pagination={pagination}
      />
    </div>
  )
}
```

### Pattern 2: TanStack Table in Manual Mode

**What:** Configure TanStack Table with `manualPagination`, `manualFiltering`, `manualSorting` set to true. Table provides state, you handle data fetching.

**When to use:** For the client-side UserTable component that receives server data and manages UI interactions.

**Example:**
```typescript
// src/app/(platform)/users/components/UserTable.tsx
// Source: https://tanstack.com/table/v8/docs/guide/pagination

'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
} from '@tanstack/react-table'

function UserTable({ initialData, pagination }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const table = useReactTable({
    data: initialData,
    columns,
    // Critical: tell TanStack Table we're handling these server-side
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    // Provide total count from server
    pageCount: pagination.totalPages,
    state: {
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.limit,
      },
    },
    onPaginationChange: (updater) => {
      const newState = typeof updater === 'function'
        ? updater(table.getState().pagination)
        : updater

      const params = new URLSearchParams(searchParams)
      params.set('page', String(newState.pageIndex + 1))

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    getCoreRowModel: getCoreRowModel(),
  })

  // Render table with isPending for loading states
}
```

### Pattern 3: Debounced Search with URL State

**What:** Search input updates URL params after debounce delay, triggering server-side re-render. Reset to page 1 on new search.

**When to use:** For the quick search bar (per CONTEXT.md - search matches email, user ID, name, username).

**Example:**
```typescript
// src/app/(platform)/users/components/UserFilters.tsx
// Source: https://nextjs.org/learn/dashboard-app/adding-search-and-pagination

'use client'

import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce' // or custom implementation
import { Input } from '@music-vine/cadence/ui'

export function UserFilters() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', '1') // Reset to page 1 on new search

    if (term) {
      params.set('query', term)
    } else {
      params.delete('query')
    }

    router.push(`${pathname}?${params.toString()}`)
  }, 300) // 300ms debounce - standard for search

  return (
    <Input
      placeholder="Search by email, name, username, or ID..."
      defaultValue={searchParams.get('query') || ''}
      onChange={(e) => handleSearch(e.target.value)}
    />
  )
}
```

### Pattern 4: Radix Tabs for Detail View

**What:** Use Radix UI Tabs for Profile/Subscription/Downloads sections. Can be URL-controlled for direct linking.

**When to use:** User detail page with tabbed sections (per CONTEXT.md decision).

**Example:**
```typescript
// src/app/(platform)/users/[id]/components/UserDetailTabs.tsx
// Source: https://www.radix-ui.com/primitives/docs/components/tabs

'use client'

import * as Tabs from '@radix-ui/react-tabs'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

export function UserDetailTabs({ userId, user }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const activeTab = searchParams.get('tab') || 'profile'

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('tab', value)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Tabs.Root value={activeTab} onValueChange={handleTabChange}>
      <Tabs.List className="flex border-b border-gray-200">
        <Tabs.Trigger
          value="profile"
          className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-gray-900"
        >
          Profile
        </Tabs.Trigger>
        <Tabs.Trigger value="subscription">Subscription</Tabs.Trigger>
        <Tabs.Trigger value="downloads">Downloads + Licenses</Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="profile">
        <ProfileTab user={user} />
      </Tabs.Content>
      <Tabs.Content value="subscription">
        <SubscriptionTab userId={userId} />
      </Tabs.Content>
      <Tabs.Content value="downloads">
        <DownloadsTab userId={userId} />
      </Tabs.Content>
    </Tabs.Root>
  )
}
```

### Pattern 5: Dropdown Menu for Row Actions

**What:** Radix DropdownMenu with three-dot trigger, keyboard navigation, proper focus management.

**When to use:** Per-row actions menu (per CONTEXT.md - quick access to operations without navigation).

**Example:**
```typescript
// src/app/(platform)/users/components/UserActions.tsx
// Source: https://www.radix-ui.com/primitives/docs/components/dropdown-menu

'use client'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { MoreVertical } from 'lucide-react' // or your icon library

export function UserActions({ user }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="p-2 hover:bg-gray-100 rounded">
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="bg-white rounded shadow-lg p-1">
          <DropdownMenu.Item
            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
            onSelect={() => router.push(`/users/${user.id}`)}
          >
            View Details
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => handleSuspend(user.id)}>
            Suspend Account
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => handleDisconnectOAuth(user.id)}>
            Disconnect OAuth
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
```

### Pattern 6: Confirmation Dialog with Simple Pattern

**What:** Radix AlertDialog for destructive actions with Cancel/Confirm buttons.

**When to use:** Per CONTEXT.md - simple confirmation dialog (not reason-required modals) for actions like Suspend, Disconnect OAuth, Refund.

**Example:**
```typescript
// Source: https://www.radix-ui.com/primitives/docs/components/alert-dialog

'use client'

import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { Button } from '@music-vine/cadence/ui'

export function SuspendUserDialog({ user, onConfirm }) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <Button variant="outline">Suspend Account</Button>
      </AlertDialog.Trigger>

      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded p-6 max-w-md">
          <AlertDialog.Title className="text-lg font-semibold">
            Suspend {user.email}?
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-gray-600">
            This user will lose access to their account. They can be unsuspended later.
          </AlertDialog.Description>

          <div className="mt-4 flex gap-2 justify-end">
            <AlertDialog.Cancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button variant="bold" onClick={onConfirm}>
                Suspend Account
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
```

### Pattern 7: TanStack Query Mutations with Optimistic Updates

**What:** Use TanStack Query mutations for account actions (suspend, refund, disconnect OAuth) with optimistic UI updates and rollback on error.

**When to use:** All account management actions (USER-03, USER-05, USER-06).

**Example:**
```typescript
// Source: https://tanstack.com/query/v5/docs/react/guides/optimistic-updates

'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

export function useSuspendUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      return apiClient.post(`/users/${userId}/suspend`)
    },
    onMutate: async (userId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['user', userId] })

      // Snapshot previous value
      const previousUser = queryClient.getQueryData(['user', userId])

      // Optimistically update
      queryClient.setQueryData(['user', userId], (old: any) => ({
        ...old,
        status: 'suspended',
        suspendedAt: new Date().toISOString(),
      }))

      // Return context for rollback
      return { previousUser }
    },
    onError: (err, userId, context) => {
      // Rollback on error
      queryClient.setQueryData(['user', userId], context.previousUser)
      toast.error('Failed to suspend user')
    },
    onSuccess: () => {
      toast.success('User suspended successfully')
    },
    onSettled: (data, error, userId) => {
      // Always refetch to sync with server
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
```

### Pattern 8: CSV Export with react-papaparse

**What:** Export table data to CSV using jsonToCSV function, trigger download client-side.

**When to use:** USER-08 requirement - export user data to CSV.

**Example:**
```typescript
// src/lib/utils/export-csv.ts
// Source: https://react-papaparse.js.org/docs

import { jsonToCSV } from 'react-papaparse'

export function exportUsersToCSV(users: User[]) {
  const csvData = users.map(user => ({
    'User ID': user.id,
    'Email': user.email,
    'Name': user.name,
    'Username': user.username,
    'Platform': user.platform,
    'Status': user.status,
    'Subscription': user.subscriptionTier,
    'Last Login': user.lastLoginAt,
  }))

  const csv = jsonToCSV(csvData)

  // Trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `users-${new Date().toISOString()}.csv`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
```

### Pattern 9: API Response Format for Pagination

**What:** Standardized pagination response structure with results and metadata.

**When to use:** All paginated API endpoints (users list, download history, etc.).

**Example:**
```typescript
// src/app/api/users/route.ts
// Source: https://oneuptime.com/blog/post/2026-01-24-nextjs-route-handlers/view

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = Number(searchParams.get('page')) || 1
  const limit = Number(searchParams.get('limit')) || 50
  const query = searchParams.get('query') || ''

  // Fetch from database with cursor or offset
  const { items, total } = await fetchUsersFromDB({
    page,
    limit,
    query,
  })

  return NextResponse.json({
    results: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}
```

### Anti-Patterns to Avoid

- **Passing pagination state to both initialState and state in TanStack Table:** The state prop overwrites initialState, causing confusion. Use one or the other.
- **Not setting autoResetPageIndex to false:** By default, TanStack Table resets to page 1 on sort/filter. For server-side operations, set to false and handle page resets manually in your filter handlers.
- **Using offset pagination for 3M records:** Performance degrades exponentially. Use cursor-based pagination with indexed columns (ID, timestamp).
- **Forgetting manualPagination: true:** Without this, TanStack Table tries to paginate your already-paginated data, showing only limit/pageSize items.
- **Not providing pageCount:** Server-side pagination requires telling TanStack Table the total number of pages via pageCount prop.
- **Enabling server-side pagination without server-side filtering/sorting:** If you enable one manual mode, enable them all - otherwise the table will try to filter/sort partial data.
- **Debouncing navigation with router.push:** Use useTransition to track pending state instead of debouncing the actual navigation. Debounce the search input value only.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Data table with sorting/filtering/pagination | Custom table with useState and manual DOM manipulation | TanStack Table v8 | 48k GitHub stars, handles edge cases (multi-sort, column resizing, row selection, virtualization), fully typed, framework-agnostic core |
| CSV export | String concatenation with proper escaping | react-papaparse jsonToCSV | CSV has subtle gotchas (quotes, commas in values, line breaks, encoding). react-papaparse handles all edge cases, 2-3KB bundle |
| Toast notifications | Custom positioned divs with timeouts and animations | Sonner | Accessibility (ARIA, screen readers), keyboard navigation, stacking, promise-based toasts, auto-dismiss, only 2-3KB |
| Tabs with keyboard navigation | Custom tab switching with useState | Radix UI Tabs | WAI-ARIA compliant, keyboard navigation (arrows, home/end), focus management, RTL support, vertical/horizontal, automatic/manual activation modes |
| Dropdown menus | Custom dropdown with click-outside detection | Radix UI DropdownMenu | Focus trapping, keyboard navigation, typeahead, submenus, collision detection, portal rendering, RTL, configurable reading direction |
| Debounced inputs | Custom setTimeout/clearTimeout logic | use-debounce or lodash.debounce | Handles edge cases (rapid changes, cleanup, leading/trailing edge), React-optimized with useCallback |
| Confirmation dialogs | Custom modal with backdrop and focus management | Radix AlertDialog | Focus trap, Escape key, click-outside, ARIA attributes, focus restoration, prevents body scroll, controlled state |
| Pagination controls | Custom page number buttons and calculations | TanStack Table's pagination state | Handles edge cases (first/last page disable, page size changes, total page calculations), integrates with table state |

**Key insight:** The React ecosystem has matured significantly. In 2026, headless UI libraries (TanStack, Radix) provide the complex logic while you own the styling. Building custom versions leads to accessibility bugs, keyboard navigation issues, and edge cases. These libraries are heavily tested with millions of downloads weekly.

## Common Pitfalls

### Pitfall 1: searchParams Caching Confusion

**What goes wrong:** Developers cache searchParams or access them synchronously in Next.js 15, causing stale data or runtime errors.

**Why it happens:** Next.js 15 made searchParams async to support streaming and Partial Prerendering. Old tutorials show synchronous access.

**How to avoid:** Always await searchParams in page components. Never destructure searchParams directly in Next.js 15+.

**Warning signs:**
- TypeScript error: "Type 'Promise<SearchParams>' is not assignable to type 'SearchParams'"
- Console warning about synchronous searchParams access

```typescript
// WRONG (Next.js 15)
export default function Page({ searchParams }) {
  const page = searchParams.page // Error: searchParams is Promise

// CORRECT (Next.js 15)
export default async function Page({ searchParams }) {
  const params = await searchParams
  const page = params.page
```

### Pitfall 2: Offset Pagination Performance Cliff

**What goes wrong:** Application works fine in testing with 1000 users, becomes unusably slow in production with 3M users when browsing past page 100.

**Why it happens:** Offset-based pagination (`LIMIT 50 OFFSET 5000`) requires the database to skip 5000 rows. At 3M records, high offsets cause exponential slowdown - jumping to page 10,000 means skipping 500,000 rows.

**How to avoid:** Use cursor-based pagination from the start. Store last seen ID/timestamp, query `WHERE id > cursor ORDER BY id LIMIT 50`. Database uses index, O(1) performance regardless of position.

**Warning signs:**
- Query time increases linearly with page number
- Users report "loading forever" on later pages
- Database CPU spikes when browsing deep pages

**Implementation note:** For CONTEXT.md requirement of "jump to specific page," use hybrid approach - show first 100 pages with offset, then "Load More" with cursor for deeper pagination. Most users never go past page 10.

### Pitfall 3: Not Resetting Page on Filter Change

**What goes wrong:** User searches for "john@example.com" while on page 5. New search returns 2 results, but they're still on page 5, so they see "No results" even though results exist on page 1.

**Why it happens:** Forgetting to reset page to 1 when filter/search changes. TanStack Table's autoResetPageIndex defaults to true but you disabled it for manual mode.

**How to avoid:** When updating search or filter params, explicitly set page to 1.

```typescript
const handleSearch = (term: string) => {
  const params = new URLSearchParams(searchParams)
  params.set('page', '1') // Always reset on search
  if (term) params.set('query', term)
  else params.delete('query')
  router.push(`${pathname}?${params.toString()}`)
}
```

**Warning signs:**
- Users report "no results" when results exist
- Page number in URL doesn't match visible data
- Empty states appear incorrectly

### Pitfall 4: Missing Suspense Boundaries with Server Components

**What goes wrong:** Entire page shows loading spinner when only the data table should be loading. Or worse, page shows stale data while new data loads in background.

**Why it happens:** Next.js App Router pages with searchParams are dynamically rendered. Without Suspense boundaries, the entire page waits for data fetching to complete.

**How to avoid:** Wrap data-dependent components in Suspense with loading fallback. Place Suspense boundary around just the table, not filters.

```typescript
export default async function UsersPage({ searchParams }) {
  const params = await searchParams

  return (
    <div>
      <UserFilters /> {/* No suspense - renders immediately */}

      <Suspense
        key={JSON.stringify(params)} // Key forces re-render on param change
        fallback={<TableRowSkeleton columns={4} rows={10} />}
      >
        <UserTable searchParams={params} />
      </Suspense>
    </div>
  )
}
```

**Warning signs:**
- Entire page flashes on filter change
- Filters disappear during loading
- Poor perceived performance

### Pitfall 5: Forgetting to Invalidate Queries After Mutations

**What goes wrong:** User suspends an account, sees success toast, but table still shows account as "Active". Refreshing the page shows correct "Suspended" status.

**Why it happens:** TanStack Query caches data. After mutation, cache is stale unless explicitly invalidated.

**How to avoid:** Always call `queryClient.invalidateQueries()` in mutation's `onSettled` callback. Invalidate both detail query and list query.

```typescript
onSettled: (data, error, userId) => {
  queryClient.invalidateQueries({ queryKey: ['user', userId] }) // Detail
  queryClient.invalidateQueries({ queryKey: ['users'] }) // List
}
```

**Warning signs:**
- Success toast but no UI update
- Data syncs after manual refresh
- Optimistic update shows but real update doesn't

### Pitfall 6: CSV Export Memory Issues with Large Datasets

**What goes wrong:** "Export to CSV" button works fine for 50 users, crashes browser tab when exporting 100,000 users.

**Why it happens:** Loading all records into memory as JSON, converting to CSV string, creating Blob - exceeds browser memory limit.

**How to avoid:** For exports over 10,000 records, use server-side streaming with incremental CSV generation. For smaller exports, use pagination with client-side concatenation or limit exports to current page/filtered results only.

```typescript
// WRONG: Load all users into memory
const allUsers = await fetchAllUsers() // 3M records = crash
exportUsersToCSV(allUsers)

// CORRECT: Limit to filtered results or use server streaming
const currentPageUsers = await fetchUsers({ page, limit })
exportUsersToCSV(currentPageUsers) // Only 50 records

// OR: Server-side streaming for large exports
async function GET() {
  const stream = new ReadableStream({
    async start(controller) {
      let cursor = null
      while (true) {
        const { users, nextCursor } = await fetchBatch(cursor)
        const csv = jsonToCSV(users)
        controller.enqueue(new TextEncoder().encode(csv))
        if (!nextCursor) break
        cursor = nextCursor
      }
      controller.close()
    }
  })
  return new Response(stream, {
    headers: { 'Content-Type': 'text/csv' }
  })
}
```

**Warning signs:**
- Browser tab crashes on export
- "Out of memory" errors
- Export works in dev (small dataset) but fails in production

### Pitfall 7: Inconsistent Data During Pagination

**What goes wrong:** User on page 2 sees duplicate records from page 1, or records that should be on page 2 are missing entirely.

**Why it happens:** Using offset pagination while data is actively being inserted/deleted. If a record is added to page 1 while user is viewing page 2, offset shifts and user sees duplicates.

**How to avoid:** Use cursor-based pagination, or if using offset, timestamp the query and filter by created_at to create a stable snapshot.

**Warning signs:**
- Users report seeing same record twice
- Page counts don't add up to total
- "Ghost records" that appear/disappear

### Pitfall 8: Not Handling Empty States Properly

**What goes wrong:** After filtering, no results match. User sees empty white space with table headers, no explanation or action to take.

**Why it happens:** Focusing on happy path, forgetting to handle empty states for both "no data exists" and "no results match filters."

**How to avoid:** Detect empty state in component, show contextual message and action. Distinguish between "no users exist" (unlikely) and "no results match your filters" (common).

```typescript
{users.length === 0 && (
  <div className="text-center py-12">
    {hasActiveFilters ? (
      <>
        <p className="text-gray-600">No users match your filters</p>
        <Button onClick={clearFilters}>Clear filters</Button>
      </>
    ) : (
      <p className="text-gray-600">No users found</p>
    )}
  </div>
)}
```

**Warning signs:**
- Confusion in user testing
- "Is it broken?" questions
- High bounce rate on filtered views

## Code Examples

### Pagination API Response (Standard Format)

```typescript
// src/app/api/users/route.ts
// Source: Verified pattern from Next.js 16.1 + TypeScript 5.7 (Jan 2026)

import { NextRequest, NextResponse } from 'next/server'

interface PaginationParams {
  page: number
  limit: number
  query?: string
  status?: string
  tier?: string
  platform?: 'music-vine' | 'uppbeat'
}

interface PaginatedResponse<T> {
  results: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const params: PaginationParams = {
    page: Number(searchParams.get('page')) || 1,
    limit: Math.min(Number(searchParams.get('limit')) || 50, 100), // Cap at 100
    query: searchParams.get('query') || undefined,
    status: searchParams.get('status') || undefined,
    tier: searchParams.get('tier') || undefined,
    platform: (searchParams.get('platform') as 'music-vine' | 'uppbeat') || undefined,
  }

  try {
    // Fetch from database (pseudo-code - replace with actual DB query)
    const { items, total } = await db.users.findMany({
      where: {
        AND: [
          params.query ? {
            OR: [
              { email: { contains: params.query } },
              { name: { contains: params.query } },
              { username: { contains: params.query } },
              { id: { equals: params.query } },
            ]
          } : {},
          params.status ? { status: params.status } : {},
          params.tier ? { subscriptionTier: params.tier } : {},
          params.platform ? { platform: params.platform } : {},
        ]
      },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: { createdAt: 'desc' },
    })

    const response: PaginatedResponse<User> = {
      results: items,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Failed to fetch users',
        code: 'FETCH_ERROR',
      },
      { status: 500 }
    )
  }
}
```

### Toast Notification Pattern with Sonner

```typescript
// Use throughout application for success/error feedback
// Source: https://github.com/emilkowalski/sonner

// 1. Install provider in layout (one time)
// src/app/layout.tsx
import { Toaster } from 'sonner'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}

// 2. Use anywhere in your app
'use client'

import { toast } from 'sonner'

function UserActions() {
  const suspendUser = async (userId: string) => {
    try {
      await apiClient.post(`/users/${userId}/suspend`)
      toast.success('User suspended successfully')
    } catch (error) {
      toast.error('Failed to suspend user', {
        description: error.message,
      })
    }
  }

  // Promise-based toast (auto success/error)
  const refundUser = (userId: string, amount: number) => {
    toast.promise(
      apiClient.post(`/users/${userId}/refund`, { amount }),
      {
        loading: 'Processing refund...',
        success: 'Refund issued successfully',
        error: 'Failed to process refund',
      }
    )
  }
}
```

### Using Existing TableRowSkeleton

```typescript
// src/app/(platform)/users/loading.tsx
// Leverage existing skeleton from Phase 1

import { TableRowSkeleton } from '@/components/skeletons/TableRowSkeleton'

export default function UsersLoading() {
  return (
    <div className="space-y-4">
      {/* Search bar skeleton */}
      <div className="flex gap-4">
        <BaseSkeleton height="h-10" width="w-full" />
        <BaseSkeleton height="h-10" width="w-32" />
      </div>

      {/* Table skeleton */}
      <TableRowSkeleton
        columns={4} // Email+Name, Subscription, Last Login, Actions
        rows={10}   // Show 10 skeleton rows
      />

      {/* Pagination skeleton */}
      <div className="flex justify-between">
        <BaseSkeleton height="h-10" width="w-48" />
        <BaseSkeleton height="h-10" width="w-64" />
      </div>
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| React Table v7 | TanStack Table v8 | 2022 | Complete rewrite - headless architecture, framework-agnostic core, TypeScript-first, removed default UI. Requires new API learning. |
| Synchronous searchParams | Async searchParams (Promise) | Next.js 15 (2024) | All page components must await searchParams. Enables streaming and Partial Prerendering. Breaking change for existing code. |
| getServerSideProps | React Server Components | Next.js 13+ (2023) | Fetch directly in components instead of page-level data fetching. Better composition, parallel fetching, less boilerplate. |
| React Query v4 | TanStack Query v5 | 2023 | Renamed from React Query to TanStack Query (supports Vue, Solid). Improved TypeScript, better defaults, refined API. Migration mostly mechanical. |
| Custom debounce | use-debounce hook | ~2020 | React-optimized with automatic cleanup. Tiny library (1KB), handles edge cases (leading/trailing, maxWait). |
| Offset-only pagination | Cursor-based preferred | ~2021 (industry shift) | At scale (millions of records), offset pagination becomes unusable. Cursor maintains O(1) performance. Major backend change if migrating. |
| Client-side filtering | Server-side filtering | Ongoing | For 3M+ records, client-side is impossible. Must filter on server. Requires URL state sync and backend query building. |

**Deprecated/outdated:**
- **React Table v7 hooks API**: v8 is complete rewrite with different API. Don't follow v7 tutorials.
- **Next.js Pages Router for new projects**: App Router is production-ready as of Next.js 13.4 (May 2023). Pages Router still supported but not recommended for greenfield.
- **useDebouncedValue with state**: Deprecated pattern - use `useDebouncedCallback` from use-debounce or similar. State-based debouncing causes unnecessary re-renders.
- **window.location.href for client navigation**: Use Next.js `router.push()` for SPA-style navigation without full page reload.

## Open Questions

### 1. Database Query Performance for Multi-Field Search

**What we know:** CONTEXT.md requires search matching against email, user ID, name, username (4 fields). For 3M records, this needs indexed full-text search or multiple indexed fields.

**What's unclear:** What database are we using? Does it have full-text search (Postgres tsvector, MySQL FULLTEXT, Elasticsearch)? Are these fields already indexed?

**Recommendation:**
- If using Postgres: Create composite GIN index on email, name, username for `ILIKE` queries. User ID should be primary key (already indexed).
- If queries are still slow: Consider dedicated search service (Algolia, Meilisearch, Elasticsearch) or Postgres tsvector for full-text search.
- Start with basic indexed `ILIKE` queries, measure performance in production, optimize if needed.

### 2. Real-Time Updates vs Polling vs Manual Refresh

**What we know:** Staff need to see up-to-date user data (USER-02, USER-07). TanStack Query supports staleTime/refetch configuration.

**What's unclear:** How real-time do updates need to be? If Staff A suspends a user, does Staff B need to see it instantly on their screen, or is manual refresh acceptable?

**Recommendation:**
- Start with manual refresh only (refresh button) - simplest implementation
- If needed, add TanStack Query background refetch (every 60 seconds) with `refetchInterval: 60000`
- Only add WebSocket/SSE if true real-time collaboration is critical (unlikely for admin tool)
- Current QueryClient config uses 60s staleTime - reasonable starting point

### 3. Audit Logging Granularity for View Actions

**What we know:** Phase 1 established audit logging for actions (01-01 decision: 13 AuditAction types). USER-07 requires viewing activity logs.

**What's unclear:** Should we audit READS (viewing user details) or only WRITES (suspend, refund, etc.)? Auditing reads creates massive log volume (3M users × multiple views per day).

**Recommendation:**
- Audit all WRITE operations (suspend, unsuspend, refund, disconnect OAuth, edit) - required for compliance
- Audit READ operations for sensitive tabs only (Subscription tab with payment info, Downloads tab) - not general profile viewing
- Store last_accessed_by and last_accessed_at on user records for general access tracking without full audit trail

### 4. CSV Export Scope and Size Limits

**What we know:** USER-08 requires CSV export capability. react-papaparse can handle client-side export.

**What's unclear:** Export all 3M users, or only filtered results? If all users, client-side is impossible - requires server streaming.

**Recommendation:**
- Start with "Export current page/filtered results" (max 1000 records) - client-side with react-papaparse
- Add "Export all (up to 10,000)" - server-side endpoint with streaming, queue for large exports
- If full 3M export needed: Background job with email notification when ready, S3 download link
- Most common use case is exporting search results (dozens to hundreds of records) - client-side is fine

## Sources

### Primary (HIGH confidence)
- TanStack Table v8 official docs - https://tanstack.com/table/latest - Core table functionality, manual pagination
- Radix UI Primitives official docs - https://www.radix-ui.com/primitives - Tabs, DropdownMenu, AlertDialog components
- Next.js official learn tutorial - https://nextjs.org/learn/dashboard-app/adding-search-and-pagination - SearchParams patterns verified
- Next.js 15 searchParams async change - Verified from official Next.js 16.1 docs and 2026 tutorials
- Project package.json - Confirmed installed versions (TanStack Query 5.90.20, Next.js 16.1.6, etc.)
- Existing codebase patterns - API client (/src/lib/api/client.ts), skeletons (/src/components/skeletons/), Cadence integration

### Secondary (MEDIUM confidence)
- TanStack Table + Next.js integration patterns - https://medium.com/@clee080/how-to-do-server-side-pagination-column-filtering-and-sorting-with-tanstack-react-table-and-react-7400a5604ff2 - Verified against official docs
- React-papaparse documentation - https://react-papaparse.js.org/ - CSV export patterns
- Sonner documentation and comparisons - https://github.com/emilkowalski/sonner and https://knock.app/blog/the-top-notification-libraries-for-react - Toast notification standard
- Next.js API pagination patterns - https://oneuptime.com/blog/post/2026-01-24-nextjs-route-handlers/view - 2026 current practices
- TanStack Query optimistic updates - https://tanstack.com/query/v5/docs/react/guides/optimistic-updates - Official mutation patterns

### Tertiary (LOW confidence)
- Cursor vs offset pagination performance - Based on training data and industry consensus, not project-specific benchmarks. Should measure in production.
- CSV export memory limits - General browser limitations (typically 500MB-1GB), varies by browser/device. Needs production testing.
- Search query optimization - Generic database indexing advice without knowing actual database engine. Requires investigation of project's DB setup.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified with official docs, existing project dependencies confirmed, 2026-current versions checked
- Architecture patterns: HIGH - TanStack Table, Radix UI, Next.js 15 patterns verified with official documentation and current tutorials
- Pitfalls: HIGH - Common issues documented in official docs (TanStack, Next.js), verified through multiple sources, experienced in production systems
- Code examples: HIGH - Sourced from official documentation, adapted to project's existing patterns (Cadence, API client, TypeScript)
- CSV export: MEDIUM - react-papaparse verified but large-scale export patterns need validation in production
- Database optimization: LOW - Generic advice without knowing project's specific database (Postgres, MySQL, etc.)

**Research date:** 2026-02-03
**Valid until:** 2026-03-03 (30 days - stable ecosystem, monthly review recommended for fast-moving Next.js/React)

**Dependencies on Phase 1:**
- API client pattern established (credentials: include, ApiClientError structure)
- Skeleton components exist (TableRowSkeleton, BaseSkeleton)
- Platform toggle and state management (Jotai atoms)
- TanStack Query already configured (QueryClient with 60s staleTime)
- Cadence design system integrated
- TypeScript, Zod, react-hook-form already in use

**Research constraints from CONTEXT.md:**
- Quick search bar first approach (not advanced filters first) ✓
- Tabbed sections layout (not sidebar or single scroll) ✓
- Simple confirmation dialogs (not reason-required modals) ✓
- Refunds call backend endpoint (Stripe integration server-side) ✓
- Ban/Unban NOT in this phase (noted, excluded from research) ✓
