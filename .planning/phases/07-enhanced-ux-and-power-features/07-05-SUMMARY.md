---
phase: 07-enhanced-ux-and-power-features
plan: 05
subsystem: ui
tags: [next.js, activity-feed, dashboard, server-component, client-component, url-state]

# Dependency graph
requires:
  - phase: 07-01
    provides: "SystemActivityEntry type, getActivity/getRecentActivity API functions, /api/activity route"
provides:
  - "Dashboard home page with compact 10-entry activity feed widget"
  - "Full /activity page with entity type filter, entity ID search, and pagination"
  - "ActivityFeedWidget client component with entity-type icons and click-through links"
  - "ActivityTable non-TanStack table with entity type badges and detail links"
  - "ActivityFeedClient with URL-based filter state for shareable/pre-filtered navigation"
  - "Shared formatRelativeTime utility extracted from ActivityTab"
  - "Sidebar Activity navigation link with clock icon"
affects:
  - "future phases referencing activity feed patterns"
  - "07-06 and beyond if activity filtering is expanded"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server component page + client ActivityFeedClient pattern (same as payees/users)"
    - "URL-based filter state: entityType immediate, entityId search-on-click"
    - "Pre-filtered navigation via ?entityType=&entityId= query params"
    - "Simple list table for activity (no TanStack/virtualization needed)"
    - "Shared utility extraction for formatRelativeTime"

key-files:
  created:
    - src/lib/utils/format-relative-time.ts
    - src/app/(platform)/components/ActivityFeedWidget.tsx
    - src/app/(platform)/activity/page.tsx
    - src/app/(platform)/activity/components/ActivityFeedClient.tsx
    - src/app/(platform)/activity/components/ActivityTable.tsx
  modified:
    - src/app/(platform)/page.tsx
    - src/app/(platform)/assets/[id]/components/ActivityTab.tsx
    - src/components/layout/Sidebar.tsx

key-decisions:
  - "formatRelativeTime extracted to shared util (src/lib/utils/format-relative-time.ts) — was duplicated in ActivityTab"
  - "Dashboard widget click-through links to /activity?entityType=&entityId= (pre-filtered activity view, not entity detail)"
  - "ActivityTable is a simple CSS grid list, not TanStack Table — no sorting/bulk selection needed for activity"
  - "Entity type filter dropdown updates URL immediately; entity ID search requires button click (consistent with other pages)"
  - "Active filter badges shown inline with clear-filters button for transparency"
  - "Sidebar Activity link placed between Dashboard and Users (clock icon)"
  - "Dashboard Phase 1 Complete placeholder removed — replaced by activity widget"

patterns-established:
  - "Pre-filtered page navigation: encode filter params in href for cross-page context passing"
  - "Simple activity list: use CSS grid div rows instead of TanStack for read-only tabular data"

# Metrics
duration: 3min
completed: 2026-02-27
---

# Phase 7 Plan 5: Activity Dashboard Widget and Full Activity Page Summary

**Dashboard activity feed widget showing last 10 entries plus full /activity page with entity type filter, entity ID search, URL-based state, and sidebar navigation**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-27T08:49:35Z
- **Completed:** 2026-02-27T08:52:57Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Dashboard home page now shows a compact ActivityFeedWidget with the last 10 system activity entries, each linking to pre-filtered activity view
- Full `/activity` page with entity type dropdown filter (immediate), entity ID search (button-click), active filter badges, and pagination
- Sidebar gains an Activity navigation link (clock icon) between Dashboard and Users
- `formatRelativeTime` extracted from per-file duplication into a shared util at `src/lib/utils/format-relative-time.ts`

## Task Commits

Each task was committed atomically:

1. **Task 1: Add activity feed widget to dashboard** - `2f0e8f1` (feat)
2. **Task 2: Create full Activity page with entity search** - `fb09412` (feat)

**Plan metadata:** (docs commit to follow)

## Files Created/Modified

- `src/lib/utils/format-relative-time.ts` — Shared relative time formatting utility (extracted from ActivityTab)
- `src/app/(platform)/components/ActivityFeedWidget.tsx` — Compact dashboard widget with entity-type icons and "View all" link
- `src/app/(platform)/page.tsx` — Dashboard rewritten to fetch and render ActivityFeedWidget; Phase 1 placeholder removed
- `src/app/(platform)/assets/[id]/components/ActivityTab.tsx` — Updated to import shared formatRelativeTime util
- `src/app/(platform)/activity/page.tsx` — Server component; resolves searchParams and fetches activity data
- `src/app/(platform)/activity/components/ActivityFeedClient.tsx` — Client component; entity type filter, entity ID search, URL state, pagination
- `src/app/(platform)/activity/components/ActivityTable.tsx` — Simple CSS grid table; entity type badges, entity detail links, relative time
- `src/components/layout/Sidebar.tsx` — Activity nav link added between Dashboard and Users

## Decisions Made

- `formatRelativeTime` extracted to `src/lib/utils/format-relative-time.ts` to eliminate duplication between ActivityTab and new components
- Dashboard widget entries link to `/activity?entityType=&entityId=` (pre-filtered activity view) rather than directly to entity detail, making it easy to see full context around the event
- `ActivityTable` uses a simple CSS grid list (not TanStack Table) — no sorting, virtualization, or bulk selection needed for a read-only activity feed
- Entity type filter dropdown updates URL immediately on change; entity ID input requires button click — consistent with the pattern established in Phase 2 (payees, users, assets)
- Active filter state surfaced as pill badges with a "Clear filters" link for UX transparency
- Sidebar Activity link placed between Dashboard and Users using a clock SVG icon

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Extracted formatRelativeTime to shared utility**

- **Found during:** Task 1 (dashboard widget)
- **Issue:** Plan noted to check if `formatRelativeTime` exists and extract if so. It existed locally in ActivityTab.tsx with no shared version.
- **Fix:** Created `src/lib/utils/format-relative-time.ts` and updated ActivityTab to import from it, eliminating the duplication.
- **Files modified:** `src/lib/utils/format-relative-time.ts` (created), `src/app/(platform)/assets/[id]/components/ActivityTab.tsx` (updated import)
- **Verification:** TypeScript compiles cleanly; function signature unchanged
- **Committed in:** `2f0e8f1` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical — utility extraction)
**Impact on plan:** Planned as a conditional action in the task spec. No scope creep.

## Issues Encountered

None — both tasks completed cleanly with no TypeScript errors or unexpected blockers.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Activity feed infrastructure (widget + full page + sidebar link) is complete
- Pre-filtered navigation pattern established for cross-entity click-throughs
- `formatRelativeTime` now available as shared util for any future component

---
*Phase: 07-enhanced-ux-and-power-features*
*Completed: 2026-02-27*
