---
phase: 06-payee-and-contributor-management
plan: "03"
subsystem: ui
tags: [tanstack-table, react-virtual, contributors, api-client, next-js, server-components]

# Dependency graph
requires:
  - phase: 06-01
    provides: Financial types (ContributorListItem, ContributorSearchParams, ContributorStatus, PayeeListItem, PayeeSearchParams, Payee)
  - phase: 06-02
    provides: Mock API routes for /api/contributors and /api/payees with pagination support
  - phase: 02-03
    provides: URL-based filter patterns, search button pattern, UserFilters template
  - phase: 03-05
    provides: useVirtualizedTable hook, VirtualizedRow component, VIRTUALIZED_TABLE_DEFAULTS
provides:
  - fetchContributors, fetchContributor, fetchContributorPayees, fetchContributorAssets, createContributor, updateContributor, saveContributorPayees API functions
  - fetchPayees, fetchPayee, fetchPayeeContributors, createPayee, updatePayee API functions
  - Contributor list page at /contributors with search, status filter, and pagination
  - ContributorTable with TanStack Table virtualization and row click navigation
  - ContributorFilters with search button and status dropdown
  - ContributorTablePagination with page size selector
affects:
  - 06-04 (contributor detail page - uses fetchContributor, fetchContributorPayees)
  - 06-05 (payee list page - uses fetchPayees)
  - 06-06 (payee detail page - uses fetchPayee, fetchPayeeContributors)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Contributor API client follows users.ts URLSearchParams pattern"
    - "Contributor list page follows users/page.tsx server component pattern"
    - "ContributorTable follows UserTable virtualization and keyboard nav pattern"
    - "ContributorFilters follows UserFilters button-triggered search pattern"

key-files:
  created:
    - src/lib/api/contributors.ts
    - src/lib/api/payees.ts
    - src/app/(platform)/contributors/page.tsx
    - src/app/(platform)/contributors/loading.tsx
    - src/app/(platform)/contributors/components/ContributorTable.tsx
    - src/app/(platform)/contributors/components/ContributorFilters.tsx
    - src/app/(platform)/contributors/components/ContributorTablePagination.tsx
    - src/app/(platform)/contributors/components/index.ts
  modified:
    - src/lib/api/index.ts
    - src/components/layout/Sidebar.tsx

key-decisions:
  - "ContributorTablePagination default page size is 20 (not 50) matching the 20 mock contributors in development data"
  - "Contributors link added to Sidebar between Collections and any future entries"
  - "Status badges: active=green-100/green-800, inactive=red-100/red-800, pending=yellow-100/yellow-800"

patterns-established:
  - "Contributor API pattern: matches users.ts exactly with URLSearchParams building"
  - "Payee API pattern: extends contributor pattern with additional paymentMethod filter param"

# Metrics
duration: 2min
completed: 2026-02-23
---

# Phase 6 Plan 03: Contributor List Page Summary

**TanStack Table contributor list page with URL-based search/filter/pagination and API clients for contributors and payees**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-23T11:35:54Z
- **Completed:** 2026-02-23T11:38:35Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Created fully-typed API client functions for contributors (7 functions) and payees (5 functions) following users.ts pattern
- Built contributor list page at /contributors with server-side data fetching, URL-based filter state, and Next.js 15 async searchParams pattern
- Implemented ContributorTable with TanStack Table virtualization (600px container, 72px rows, 10-row overscan), keyboard navigation, and row click to detail
- Added Contributors link to Sidebar navigation between Collections and other entries

## Task Commits

Each task was committed atomically:

1. **Task 1: Create API client functions for contributors and payees** - `4ed819c` (feat)
2. **Task 2: Create contributor list page with table and filters** - `d220ae6` (feat)

**Plan metadata:** (docs: complete plan)

## Files Created/Modified

- `src/lib/api/contributors.ts` - fetchContributors, fetchContributor, fetchContributorPayees, fetchContributorAssets, createContributor, updateContributor, saveContributorPayees
- `src/lib/api/payees.ts` - fetchPayees, fetchPayee, fetchPayeeContributors, createPayee, updatePayee
- `src/lib/api/index.ts` - Re-exports for all new contributor and payee API functions
- `src/app/(platform)/contributors/page.tsx` - Server component, fetches contributors, renders filters and table in Suspense
- `src/app/(platform)/contributors/loading.tsx` - Skeleton matching page layout
- `src/app/(platform)/contributors/components/ContributorTable.tsx` - TanStack Table with virtualization, status badges, keyboard nav, row click navigation
- `src/app/(platform)/contributors/components/ContributorFilters.tsx` - Search button + status dropdown with URL-based state
- `src/app/(platform)/contributors/components/ContributorTablePagination.tsx` - Page size selector (20/50/100) and First/Previous/Next/Last buttons
- `src/app/(platform)/contributors/components/index.ts` - Barrel exports
- `src/components/layout/Sidebar.tsx` - Added Contributors nav link with group-of-people icon

## Decisions Made

- ContributorTablePagination uses 20 as default page size to match the 20 mock contributors in development data, making the first page show all entries naturally
- Contributors Sidebar link uses a group icon (different from Users single-person icon) for visual distinction
- ContributorTable omits bulk selection (no checkbox column) since contributor bulk operations are not planned for Phase 6 - keeps the component simpler

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added Contributors link to Sidebar navigation**
- **Found during:** Task 2 (Create contributor list page)
- **Issue:** /contributors page would be inaccessible from navigation without a Sidebar link - users would need to type the URL directly
- **Fix:** Added Contributors NavItem with group-of-people SVG icon to navItems array in Sidebar.tsx
- **Files modified:** src/components/layout/Sidebar.tsx
- **Verification:** TypeScript passes, link renders in sidebar
- **Committed in:** d220ae6 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Navigation fix necessary for page accessibility. No scope creep.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Contributor list page fully functional with search, status filter, and pagination
- API client functions ready for use in contributor detail page (06-04)
- Payee API functions ready for payee list page (06-05) and payee detail page (06-06)
- /contributors/new will 404 until 06-07 (contributor create form) - expected behavior documented in plan

---
*Phase: 06-payee-and-contributor-management*
*Completed: 2026-02-23*
