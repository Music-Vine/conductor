---
phase: 07-enhanced-ux-and-power-features
plan: 01
subsystem: api
tags: [activity-feed, mock-api, typescript, next-js, pagination]

# Dependency graph
requires:
  - phase: 06-payee---contributor-management
    provides: contributor/payee entity types referenced in activity feed
  - phase: 04-asset-management
    provides: asset entity type and PaginatedResponse pattern
provides:
  - SystemActivityEntry type definition (id, entityType, entityId, entityName, action, actorId, actorName, details, createdAt)
  - ActivityEntityType union ('asset' | 'user' | 'contributor' | 'payee')
  - GET /api/activity route with 200 seeded deterministic entries, filtering, pagination
  - getActivity(params) client-side function
  - getRecentActivity(limit?) convenience wrapper for dashboard widget
affects:
  - 07-02-dashboard-activity-widget (uses getRecentActivity)
  - 07-03-activity-page (uses getActivity with filtering)
  - 07-04-activity-csv-export (fetches from /api/activity)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Deterministic seeded mock data with fixed BASE_EPOCH (no Math.random) for stable cold-start data
    - Entity type rotation pattern for realistic distribution across asset/user/contributor/payee
    - ActivityParams interface for typed query parameter objects

key-files:
  created:
    - src/types/activity.ts
    - src/app/api/activity/route.ts
    - src/lib/api/activity.ts
  modified:
    - src/types/index.ts
    - src/lib/api/index.ts
    - src/middleware.ts

key-decisions:
  - "SystemActivityEntry covers all 4 entity types in a single unified type (no discriminated union needed at API level)"
  - "200 deterministic entries generated with fixed BASE_EPOCH (1772100000000) so data never drifts between cold starts"
  - "Entity type distribution weighted: asset 60%, user 20%, contributor 10%, payee 10% (reflects real-world frequency)"
  - "getRecentActivity defaults to limit=10 for dashboard widget use case"
  - "/api/activity added to middleware PUBLIC_PATHS for frontend development without auth"

patterns-established:
  - "ActivityParams interface pattern for typed query params mirrors UserSearchParams from users.ts"
  - "getRecentActivity convenience wrapper pattern for dashboard widgets"

# Metrics
duration: 3min
completed: 2026-02-27
---

# Phase 7 Plan 1: Activity Feed API Foundation Summary

**Deterministic 200-entry system-wide activity mock API covering asset/user/contributor/payee events with pagination, filtering, and typed client functions**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-02-27T08:43:31Z
- **Completed:** 2026-02-27T08:46:05Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Created `SystemActivityEntry` interface and `ActivityEntityType` union in `src/types/activity.ts`, exported via barrel
- Built GET `/api/activity` route with 200 deterministic seeded entries spanning all 4 entity types — never empty on cold start
- Implemented full filtering (entityType, entityId) and pagination (page, limit) in the route
- Created `getActivity()` and `getRecentActivity()` client-side functions typed as `PaginatedResponse<SystemActivityEntry>`
- Added `/api/activity` to middleware public paths and exported functions from `src/lib/api/index.ts`

## Task Commits

Each task was committed atomically:

1. **Task 1: Create activity types and mock API route** - `635b036` (feat) — included in 07-02 pre-req commit
2. **Task 2: Create client-side activity API functions** - `7859413` (feat)

**Plan metadata:** (see final commit below)

## Files Created/Modified

- `src/types/activity.ts` — SystemActivityEntry interface, ActivityEntityType union type
- `src/app/api/activity/route.ts` — GET /api/activity with seeded mock data, filtering, pagination
- `src/lib/api/activity.ts` — getActivity(), getRecentActivity() client functions
- `src/types/index.ts` — re-exports activity types via barrel
- `src/lib/api/index.ts` — re-exports getActivity, getRecentActivity, ActivityParams
- `src/middleware.ts` — /api/activity added to PUBLIC_PATHS

## Decisions Made

- **Fixed BASE_EPOCH for deterministic data:** Used `1772100000000` (pinned to 2026-02-27) so mock data timestamps don't drift between server restarts. This ensures stable UI rendering during development.
- **Entity distribution 60/20/10/10:** Assets dominate because asset approval/rejection workflows are the highest-frequency staff actions in the system.
- **Single flat SystemActivityEntry type:** No discriminated union needed at the API level — all 4 entity types share the same fields. Callers can narrow on `entityType` when they need type-specific rendering.
- **getRecentActivity defaults to limit=10:** Matches the dashboard widget requirement (last 10 entries) specified in the plan.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

The 07-02 agent had already committed Task 1 files (`src/types/activity.ts`, `src/app/api/activity/route.ts`, middleware update) as part of its own pre-req work in commit `635b036`. This was detected during Task 1 execution — the files were already present in git HEAD and identical to what was produced. No re-commit was needed; Task 1 was recorded as complete from `635b036`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `/api/activity` route is live and returns realistic seeded data immediately
- `getRecentActivity(10)` ready for dashboard widget (07-02)
- `getActivity({ entityType, entityId })` ready for full Activity page (07-03)
- `getActivity({ limit: 'all' })` pattern available for CSV export (07-04)
- TypeScript compilation clean — no blockers for downstream plans

---
*Phase: 07-enhanced-ux-and-power-features*
*Completed: 2026-02-27*
