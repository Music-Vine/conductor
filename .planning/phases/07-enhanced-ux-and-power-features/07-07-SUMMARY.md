---
phase: 07-enhanced-ux-and-power-features
plan: 07
subsystem: ui
tags: [tanstack-table, csv-export, collections, activity, react, typescript]

# Dependency graph
requires:
  - phase: 07-01
    provides: SystemActivityEntry type and /api/activity endpoint
  - phase: 04-12
    provides: CollectionListItem type and collections API
  - phase: 07-04
    provides: dual export button pattern (Export filtered + Export all)
provides:
  - CollectionTable component (TanStack Table, non-virtualized)
  - exportCollectionsToCSV function (id, title, platform, assetCount, createdAt)
  - exportActivityToCSV function (timestamp, actor, action, entityType, entityName, entityId, details)
  - ExportCollectionsButton with dual export options
  - ExportActivityButton with dual export options
  - ActivityPageHeader for 07-05 ActivityFeedClient integration
affects:
  - 07-05 (ActivityFeedClient should integrate ActivityPageHeader or ExportActivityButton)
  - 08 (any phase building on collections or activity export)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Non-virtualized TanStack Table for small datasets (collections typically <100 items)
    - Dual export pattern reused from 07-04: Export filtered (current page) + Export all (fetch limit=10000)
    - ActivityPageHeader wrapper component pattern for forward-compatible integration with future ActivityFeedClient

key-files:
  created:
    - src/app/(platform)/collections/components/CollectionTable.tsx
    - src/app/(platform)/collections/components/ExportCollectionsButton.tsx
    - src/app/(platform)/activity/components/ExportActivityButton.tsx
    - src/app/(platform)/activity/components/ActivityPageHeader.tsx
  modified:
    - src/lib/utils/export-csv.ts
    - src/app/(platform)/collections/page.tsx

key-decisions:
  - "CollectionTable uses non-virtualized TanStack Table (no useVirtualizedTable) since collections are small datasets"
  - "ActivityPageHeader wraps ExportActivityButton for forward-compatible integration with ActivityFeedClient (07-05)"
  - "exportActivityToCSV column order: Timestamp, Actor, Action, Entity Type, Entity, Entity ID, Details"
  - "exportCollectionsToCSV column order: Collection ID, Title, Platform, Asset Count, Created"

patterns-established:
  - "Non-virtualized TanStack Table: use getCoreRowModel only, simple div-based rows, no useVirtualizedTable hook"
  - "Forward-compatible wrapper components: ActivityPageHeader can be imported by ActivityFeedClient without modification"

# Metrics
duration: 2min
completed: 2026-02-27
---

# Phase 7 Plan 7: Collections Table and Activity CSV Export Summary

**TanStack Table added to collections page (replacing card grid) with exportCollectionsToCSV and exportActivityToCSV functions plus dual-option export buttons on both pages.**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-27T08:50:31Z
- **Completed:** 2026-02-27T08:52:55Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Added exportCollectionsToCSV and exportActivityToCSV to src/lib/utils/export-csv.ts following established patterns
- Created CollectionTable using TanStack Table (non-virtualized) with title, platform badge, asset count, and created date columns
- Replaced card grid in collections page with CollectionTable plus ExportCollectionsButton in header
- Created ExportActivityButton and ActivityPageHeader for the activity page (ready for 07-05 integration)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add CSV export functions and create CollectionTable** - `1d54305` (feat)
2. **Task 2: Update Collections page and add export buttons** - `fb09412` (feat)

**Plan metadata:** (docs commit pending)

## Files Created/Modified
- `src/lib/utils/export-csv.ts` - Added exportCollectionsToCSV and exportActivityToCSV functions
- `src/app/(platform)/collections/components/CollectionTable.tsx` - New TanStack Table for collections
- `src/app/(platform)/collections/components/ExportCollectionsButton.tsx` - Dual export button (filtered + all)
- `src/app/(platform)/collections/page.tsx` - Updated to use CollectionTable with ExportCollectionsButton
- `src/app/(platform)/activity/components/ExportActivityButton.tsx` - Dual export button for activity
- `src/app/(platform)/activity/components/ActivityPageHeader.tsx` - Header wrapper for ActivityFeedClient integration

## Decisions Made
- CollectionTable uses non-virtualized TanStack Table since collections are typically small datasets (no need for useVirtualizedTable/react-virtual overhead)
- ActivityPageHeader created as forward-compatible wrapper: 07-05 can import and integrate it into ActivityFeedClient without modification
- Platform badge colors match existing convention: Music Vine = red, Uppbeat = pink, Both = gray

## Deviations from Plan

None - plan executed exactly as written. ActivityFeedClient check confirmed it didn't exist (07-05 not yet run), so ActivityPageHeader was created as the minimal integration wrapper as specified.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Collections page now has a proper table view with CSV export for both filtered and all data
- Activity export functions and button are ready for 07-05 to integrate into ActivityFeedClient
- TypeScript compilation clean (verified with npx tsc --noEmit)
- 07-05 should import ExportActivityButton or ActivityPageHeader into ActivityFeedClient

---
*Phase: 07-enhanced-ux-and-power-features*
*Completed: 2026-02-27*
