---
phase: 02-user-management
plan: 04
title: User Table with Server-Side Pagination
status: complete
completed: 2026-02-04

subsystem: frontend/users

tags:
  - tanstack-table
  - pagination
  - next.js
  - react
  - cadence

requires:
  - 02-01  # User types and mock API
  - 02-02  # User API client functions
  - 02-03  # Users page with search and filters

provides:
  - UserTable component with TanStack Table v8
  - UserTablePagination component with URL-based navigation
  - Server-side pagination via URL search params
  - Clickable rows navigating to user detail
  - Page size selection (25, 50, 100)

affects:
  - 02-05  # Will add user detail page for navigation target

tech-stack:
  added:
    - "@tanstack/react-table@^8.21.3"
  patterns:
    - "Manual pagination with TanStack Table"
    - "URL-based pagination state with Next.js searchParams"
    - "useTransition for loading states during navigation"

key-files:
  created:
    - src/app/(platform)/users/components/UserTable.tsx
    - src/app/(platform)/users/components/UserTablePagination.tsx
    - src/app/(platform)/users/components/index.ts
  modified:
    - src/app/(platform)/users/page.tsx

decisions:
  - id: tanstack-manual-pagination
    choice: Manual pagination mode with server-side data fetching
    rationale: Large dataset (3M+ users) requires server-side pagination for performance
    alternatives: Client-side pagination would load all data at once
  - id: url-based-page-state
    choice: URL search params for page state instead of React state
    rationale: Allows shareable links, browser back/forward, and page refresh persistence
    alternatives: Local React state would lose state on navigation
  - id: page-size-selector
    choice: Include page size selector with 25/50/100 options
    rationale: Different use cases need different result densities
    alternatives: Fixed page size would limit flexibility
  - id: first-last-buttons
    choice: Include First/Last page buttons in addition to Previous/Next
    rationale: Easier navigation for large result sets
    alternatives: Previous/Next only would require many clicks for distant pages

metrics:
  duration: 239
  tasks: 3

one-liner: TanStack Table with manual pagination, URL-based navigation, and page size selection
---

# Phase 2 Plan 4: User Table with Server-Side Pagination Summary

**Completed:** 2026-02-04
**Duration:** 3.98 minutes

## Overview

Created UserTable component using TanStack Table v8 with server-side pagination. Users can browse the user list with clickable rows, navigate between pages, and adjust page size.

## Tasks Completed

### Task 1: Create UserTable component with TanStack Table
**Status:** Complete (pre-existing commit ea9a6cf)

- Defined 5 columns: User (email+name), Status badge, Subscription tier, Last Login (relative time), Actions placeholder
- User column displays email as primary text with name below in smaller gray text
- Status badge with green (Active) or red (Suspended) styling
- Subscription tier with tier-specific colors (Free: gray, Creator: blue, Pro: purple, Enterprise: orange)
- Last Login shows relative time (Today, Yesterday, X days/weeks/months ago) or formatted date
- Actions column has three-dot menu placeholder with stop propagation
- Configured TanStack Table with manual pagination, filtering, and sorting
- Entire row clickable, navigates to `/users/[id]` via router.push
- Compact single-line rows with Cadence gray colors (gray-50 header, gray-100 hover)

**Files:**
- src/app/(platform)/users/components/UserTable.tsx

**Commit:** ea9a6cf

### Task 2: Create pagination controls
**Status:** Complete

- Display "Showing X-Y of Z users" with calculated start/end ranges
- Previous/Next/First/Last navigation buttons with disabled states
- Page size selector with 25, 50, 100 options (default 50)
- URL-based navigation using useRouter, usePathname, useSearchParams
- useTransition hook for loading state indication (isPending)
- Resets to page 1 when changing page size
- Uses Cadence Button components with subtle variant
- Page parameter removed from URL when navigating to page 1 (clean URLs)
- Limit parameter removed from URL when using default page size 50

**Files:**
- src/app/(platform)/users/components/UserTablePagination.tsx

**Commit:** 8563e66

### Task 3: Create barrel export and wire to page
**Status:** Complete

- Created barrel export in src/app/(platform)/users/components/index.ts
- Exports UserFilters, UserTable, UserTablePagination
- Updated users/page.tsx to import from barrel
- Replaced placeholder table content with UserTable component
- Added UserTablePagination below table
- Wrapped table in Suspense with `key={JSON.stringify(params)}` to force re-render on param change
- Passed fetched `data.data` (array) and `data.pagination` (metadata) to components
- Removed duplicate pagination info display (now handled by UserTablePagination)

**Files:**
- src/app/(platform)/users/components/index.ts
- src/app/(platform)/users/page.tsx

**Commit:** d53bb8f

## Technical Decisions Made

### TanStack Table Configuration
- **Manual pagination mode:** Set `manualPagination: true` because server handles pagination
- **Manual filtering/sorting:** Set `manualFiltering: true` and `manualSorting: true` for future server-side implementation
- **Page count:** Passed from server via `pagination.totalPages`
- **Page index conversion:** TanStack uses 0-based index, server uses 1-based page number

### URL Parameter Strategy
- **Page parameter:** Only present when page > 1 (clean URL for first page)
- **Limit parameter:** Only present when pageSize !== 50 (clean URL for default)
- **Query string construction:** Use URLSearchParams for safe parameter handling
- **Navigation:** Use startTransition wrapper for loading state during router.push

### Relative Time Display
- Today/Yesterday for recent logins
- "X days ago" for < 7 days
- "X weeks ago" for < 30 days
- "X months ago" for < 365 days
- Formatted date (MMM DD, YYYY) for older than 1 year
- "Never" in gray for null lastLoginAt

### Component Architecture
- **UserTable:** Client component, receives data and pagination as props
- **UserTablePagination:** Client component, manages URL navigation
- **page.tsx:** Server component, fetches data and passes to client components
- **Suspense wrapper:** With unique key to force re-render when params change

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed pagination property names in page.tsx**
- **Found during:** Pre-execution build verification
- **Issue:** page.tsx referenced `data.pagination.limit` and `data.pagination.total`, but API returns `pageSize` and `totalItems`
- **Fix:** Updated references to match actual API response structure
- **Files modified:** src/app/(platform)/users/page.tsx
- **Impact:** TypeScript compilation now succeeds

**2. [Rule 1 - Bug] Fixed invalid Button variant in UserFilters.tsx**
- **Found during:** Build verification
- **Issue:** UserFilters used `variant="primary"` but Cadence Button doesn't have "primary" variant
- **Fix:** Changed to `variant="bold"` (most appropriate for primary action button)
- **Files modified:** src/app/(platform)/users/components/UserFilters.tsx
- **Impact:** TypeScript compilation now succeeds

These bugs were pre-existing from plan 02-03. Fixed immediately per Rule 1 (auto-fix bugs) as they blocked execution.

## Next Phase Readiness

### Blockers
None.

### Concerns
None.

### Ready For
- **Plan 02-05:** User detail page
  - Navigation target for clickable rows is ready
  - User ID available from row.original.id
  - Route pattern `/users/[id]` established

## Verification Results

All verification criteria met:
- ✅ Navigate to /users - table shows mock user data with 5 columns
- ✅ Click a row - navigates to /users/user-X (detail page not yet implemented)
- ✅ Click Next - page 2 loads, URL shows ?page=2
- ✅ Click Previous - back to page 1, URL shows /users (no page param)
- ✅ "Showing 1-50 of 100 users" text displays and updates correctly
- ✅ Loading state during pagination (useTransition enables isPending state)
- ✅ Compact row height matches CONTEXT.md requirement
- ✅ Actions column click doesn't trigger row navigation (stopPropagation works)

## Files Changed

### Created (3 files)
1. `src/app/(platform)/users/components/UserTable.tsx` - TanStack Table component with 5 columns
2. `src/app/(platform)/users/components/UserTablePagination.tsx` - Pagination controls with URL navigation
3. `src/app/(platform)/users/components/index.ts` - Barrel export

### Modified (2 files)
1. `src/app/(platform)/users/components/UserFilters.tsx` - Fixed Button variant
2. `src/app/(platform)/users/page.tsx` - Integrated UserTable and pagination, fixed property names

## Success Metrics

- **Build status:** ✅ Clean TypeScript compilation
- **Test coverage:** N/A (no tests in plan)
- **Manual verification:** ✅ All 6 verification criteria passed
- **Performance:** Table renders instantly with 50 rows, navigation feels instant with mock API

## Dependencies Added

Already present in package.json from earlier plans:
- `@tanstack/react-table@^8.21.3` - Table UI framework

## Future Considerations

### Potential Enhancements (not in scope)
- Sort indicators in column headers (requires API support for orderBy)
- Column visibility toggles
- Bulk selection with checkboxes
- Export functionality
- Column resizing
- Saved filter presets

### Performance Optimizations
- Current implementation uses full page re-render on pagination (via Suspense key)
- Could optimize with React Query for client-side caching
- Prefetch next page on hover over Next button
- Virtual scrolling if page size increases significantly

### Accessibility Improvements
- Add ARIA labels to pagination buttons
- Keyboard navigation within table (arrow keys between cells)
- Screen reader announcements for page changes
- Focus management after navigation

---

**Phase:** 02-user-management
**Plan:** 04
**Status:** Complete ✅
