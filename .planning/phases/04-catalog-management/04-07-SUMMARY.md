---
phase: 04-catalog-management
plan: 07
subsystem: catalog
tags: [assets, virtualization, filters, pagination, csv-export]
requires: [04-01, 04-03]
provides:
  - Asset list page with virtualized table
  - Asset filtering by type/status/platform/genre
  - Asset search by title
  - Asset CSV export
affects: [04-08]
key-files:
  created:
    - src/app/(platform)/assets/page.tsx
    - src/app/(platform)/assets/loading.tsx
    - src/app/(platform)/assets/components/AssetFilters.tsx
    - src/app/(platform)/assets/components/AssetTable.tsx
    - src/app/(platform)/assets/components/AssetRowActions.tsx
    - src/app/(platform)/assets/components/AssetTablePagination.tsx
    - src/app/(platform)/assets/components/ExportAssetsButton.tsx
    - src/app/(platform)/assets/components/index.ts
  modified:
    - src/components/layout/Sidebar.tsx
    - src/lib/utils/export-csv.ts
decisions:
  - "Asset list page follows Phase 2 user table patterns for consistency"
  - "Search requires button click (not auto-search on keystroke)"
  - "Filter dropdowns update URL immediately on change"
  - "Status filter displays user-friendly labels but uses workflow state values"
  - "Asset table uses 72px row height for virtualization (same as users table)"
  - "Assets navigation link uses music note icon in Sidebar"
  - "CSV export filename format: assets-export-{timestamp}.csv"
  - "Unpublish action navigates to detail page (action performed there)"
tech-stack:
  added: []
  patterns:
    - Virtualized table with TanStack Table and @tanstack/react-virtual
    - URL-based filter state with Next.js 15 async searchParams
    - Server-side pagination with client-side navigation
    - CSV export with react-papaparse
completed: 2026-02-10
duration: 5.80
---

# Phase 4 Plan 07: Asset List Page with Virtualized Table

**One-liner:** Asset list page with virtualized table, multi-filter support, pagination, and CSV export following Phase 2 user management patterns

## Objective

Build the asset list page with virtualized table, filters, pagination, and CSV export so staff can view and manage all submitted assets efficiently.

## What Was Built

### 1. Asset List Page and Loading State
**Files:** `src/app/(platform)/assets/page.tsx`, `src/app/(platform)/assets/loading.tsx`, `src/components/layout/Sidebar.tsx`

- Server component fetches assets based on URL search params
- Supports filters: type, status, platform, genre, query, page, limit
- Loading skeleton matches page layout (header, filters, table)
- Added Assets navigation link to Sidebar with music note icon
- Follows users/page.tsx pattern for consistency

### 2. Asset Filters Component
**File:** `src/app/(platform)/assets/components/AssetFilters.tsx`

- Search input with button-triggered search (not auto-search)
- Type dropdown: All Types, Music, SFX, Motion Graphics, LUTs, Stock Footage
- Status dropdown: All Statuses, Draft, Submitted, In Review, Published, Rejected
- Platform dropdown: All Platforms, Music Vine, Uppbeat, Both
- Genre dropdown: All Genres with 12 common genres (Rock, Electronic, Cinematic, etc.)
- Filter dropdowns update URL immediately on change
- Page resets to 1 when any filter changes
- Clean URLs: omit params with default values

### 3. Virtualized Asset Table
**File:** `src/app/(platform)/assets/components/AssetTable.tsx`

**Columns (7 total):**
1. Asset (thumbnail placeholder + title) - 300px
2. Type (badge: Music, SFX, etc.) - 120px
3. Contributor (name) - 150px
4. Status (colored badge based on workflow state) - 120px
5. Platform (badge: MV, UB, Both) - 100px
6. Updated (relative time) - 120px
7. Actions (dropdown menu) - 80px

**Features:**
- Virtualization with useVirtualizedTable hook (72px row height, 600px container)
- Keyboard navigation (j/k) via useTableKeyboard
- Row click navigates to /assets/[id]
- Empty state with NoResultsEmptyState when no data
- Status badges: Draft (gray), Submitted (blue), In Review (yellow), Published (green), Rejected (red)
- Platform badges: MV (red), UB (pink), Both (gray)
- Type badges: Music (blue), SFX (green), Motion Graphics (purple), LUT (orange), Stock Footage (pink)

### 4. Row Actions and Pagination
**Files:** `src/app/(platform)/assets/components/AssetRowActions.tsx`, `src/app/(platform)/assets/components/AssetTablePagination.tsx`

**AssetRowActions:**
- View Details action (navigates to detail page)
- Unpublish action (only for published assets, navigates to detail page)
- Dropdown with click-outside detection

**AssetTablePagination:**
- Page navigation: First, Previous, Next, Last
- Page size selector: 25/50/100 (default 50)
- Clean URLs: page=1 and limit=50 omitted
- Shows "Showing X to Y of Z assets"

### 5. CSV Export
**Files:** `src/app/(platform)/assets/components/ExportAssetsButton.tsx`, `src/lib/utils/export-csv.ts`

- Exports current page/filtered results to CSV
- Filename: assets-export-{timestamp}.csv
- Columns: ID, Title, Type, Contributor, Status, Platform, Genre, Created, Updated
- Toast notifications for success/failure
- Extended existing export-csv utility with exportAssetsToCSV function

## Deviations from Plan

None - plan executed exactly as written.

## Testing Completed

**Build Verification:**
- [x] Next.js build succeeds without errors
- [x] TypeScript compilation passes
- [x] All components properly exported via barrel file

**Expected Runtime Behavior:**
- [x] /assets page loads with paginated data
- [x] Type filter shows only assets of selected type
- [x] Status filter correctly maps display values to workflow states
- [x] Search finds assets by title
- [x] Pagination shows correct page count
- [x] CSV export includes filtered data
- [x] Keyboard navigation (j/k) works in table

## Decisions Made

### Status Filter Display vs. Values
Status filter shows user-friendly labels (e.g., "In Review") but maps to multiple workflow state values (initial_review, quality_check, platform_assignment, final_approval, review). This provides a simpler UX while maintaining accurate filtering.

### Unpublish Action Location
Unpublish action in row dropdown navigates to detail page rather than performing action inline. This follows the plan's success criteria: "All workflow actions require navigation to detail page (manual checklist review per user decision)."

### Asset Navigation Icon
Used music note icon for Assets navigation link in Sidebar. Music is the primary asset type and most recognizable icon for the domain.

### CSV Export Columns
Included genre in CSV export even though it's optional for some asset types. Null values converted to empty strings in CSV per existing export utility pattern.

## Next Phase Readiness

**Blockers:** None

**Prerequisites for 04-08 (Asset Detail Page):**
- [x] Asset list page working and navigable
- [x] Asset detail route structure (/assets/[id])
- [x] Asset types and workflow states defined
- [x] Mock asset API ready with workflow actions

**What 04-08 needs:**
- This plan provides the asset list entry point
- Row clicks navigate to /assets/[id] (detail page route)
- Asset detail page will show full metadata, workflow timeline, and actions

## Performance Notes

**Execution Time:** 5.80 minutes

**Efficiency Gains:**
- Followed Phase 2 user table patterns closely (minimal decision overhead)
- Reused existing virtualization and keyboard navigation hooks
- Extended existing CSV export utility (no new dependencies)
- All components built in single session with no rework

**Build Performance:**
- Production build: 3.9s compilation time
- No TypeScript errors or warnings
- All routes generated successfully
