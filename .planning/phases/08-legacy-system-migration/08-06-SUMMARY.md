---
phase: 08-legacy-system-migration
plan: 06
subsystem: api
tags: [proxy, bff, collections, activity, search, audit, financials, nextjs]

# Dependency graph
requires:
  - phase: 08-01
    provides: proxyToBackend utility in src/lib/api/proxy.ts

provides:
  - Conditional proxy for collection list/create (GET + POST /api/collections)
  - Conditional proxy for collection CRUD (GET + PATCH + DELETE /api/collections/[id])
  - Conditional proxy for collection asset membership (POST + DELETE /api/collections/[id]/assets/*)
  - Conditional proxy for activity feed (GET /api/activity)
  - Conditional proxy for global search (GET /api/search)
  - Conditional proxy for audit log (GET + POST /api/audit)
  - Conditional proxy for financial export (GET /api/financials/export)

affects: [08-07, 08-08, 08-09]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Body pre-read pattern for POST/PATCH routes: parse body once before proxy call, use same value in mock fallback"
    - "DELETE proxy with explicit method option: proxyToBackend(request, path, { method: 'DELETE' })"
    - "TODO comments on cross-cutting routes for backend response shape adaptation"

key-files:
  created: []
  modified:
    - src/app/api/collections/route.ts
    - src/app/api/collections/[id]/route.ts
    - src/app/api/collections/[id]/assets/route.ts
    - src/app/api/collections/[id]/assets/[assetId]/route.ts
    - src/app/api/activity/route.ts
    - src/app/api/search/route.ts
    - src/app/api/audit/route.ts
    - src/app/api/financials/export/route.ts

key-decisions:
  - "Body pre-read for POST/PATCH routes: call request.json() before proxyToBackend so body is available in both proxy call and mock fallback"
  - "Activity, search, audit, and financials routes include TODO comments for response shape adaptation when real backend format is known"
  - "Financial export TODO notes two backend response scenarios: raw JSON (convert to CSV) vs CSV directly (pipe through with Content-Type)"

patterns-established:
  - "Body pre-read pattern: let body = await request.json(); then pass to proxy and use in mock"

# Metrics
duration: 6min
completed: 2026-02-27
---

# Phase 8 Plan 6: Remaining Routes BFF Proxy Summary

**Conditional proxy added to 8 route handlers (4 collection + activity + search + audit + financial export), completing 100% proxy coverage of Conductor API**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-27T12:02:27Z
- **Completed:** 2026-02-27T12:08:33Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- All 4 collection route handlers proxy to /admin/collections backend paths (GET/POST list, GET/PATCH/DELETE item, POST/DELETE assets membership)
- Activity, search, audit, and financial export routes proxy to corresponding /admin/* backend paths
- Mock data unchanged and preserved as fallback for all routes across all 8 handlers
- 40 route files total now have proxyToBackend (complete API proxy coverage)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add proxy to collection routes** - `a561758` (feat)
2. **Task 2: Add proxy to cross-cutting routes (activity, search, audit, financials)** - previously committed in 08-04/08-05

**Plan metadata:** (see below - docs commit)

## Files Created/Modified
- `src/app/api/collections/route.ts` - GET + POST proxy to /admin/collections
- `src/app/api/collections/[id]/route.ts` - GET + PATCH + DELETE proxy to /admin/collections/:id
- `src/app/api/collections/[id]/assets/route.ts` - POST proxy to /admin/collections/:id/assets
- `src/app/api/collections/[id]/assets/[assetId]/route.ts` - DELETE proxy to /admin/collections/:id/assets/:assetId
- `src/app/api/activity/route.ts` - GET proxy to /admin/activity (committed in 08-04)
- `src/app/api/search/route.ts` - GET proxy to /admin/search (committed in 08-04)
- `src/app/api/audit/route.ts` - GET + POST proxy to /admin/audit (committed in 08-04)
- `src/app/api/financials/export/route.ts` - GET proxy to /admin/financials/export (committed in 08-04)

## Decisions Made
- Body pre-read pattern for POST/PATCH routes: parse `request.json()` once before calling `proxyToBackend`, then use same parsed body in mock fallback code (avoids calling `request.json()` twice which would fail on the second call)
- TODO comments added to activity, search, audit, and financial export routes to note adaptation points when real backend response format is known
- Financial export route notes two scenarios for backend integration: raw JSON data (convert to CSV) vs CSV-direct response (pipe through with Content-Type header)

## Deviations from Plan

### Observations

The 4 cross-cutting routes (activity, search, audit, financials) were already updated with proxy logic in plan 08-04 as part of that plan's scope. The collection nested routes ([id], [id]/assets, [id]/assets/[assetId]) were the primary new work in this plan.

None - plan executed exactly as specified. All 8 routes have proxyToBackend with mock fallback preserved.

## Issues Encountered
- Python-based file writing introduced `\!` escape sequences for `!=` and `!` operators. Fixed via replace_all Edit operations before TypeScript verification.
- IDE linter occasionally auto-reverted mid-edit changes; final state verified via TypeScript check (npx tsc --noEmit passes) and build (npm run build succeeds).

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All Conductor API endpoints now have conditional proxy coverage (40 route files total)
- Setting NEXT_PUBLIC_USE_REAL_API=true and BACKEND_API_BASE_URL will enable real backend data for any route
- Response shape adaptation TODOs remain for: activity, search, audit, financials export routes
- Ready for 08-07 (feature parity audit) and 08-08/08-09 (decommission runbooks)

---
*Phase: 08-legacy-system-migration*
*Completed: 2026-02-27*
