---
phase: 08-legacy-system-migration
plan: "05"
subsystem: api
tags: [proxy, bff, contributors, payees, next.js, route-handlers]

# Dependency graph
requires:
  - phase: 08-01
    provides: proxyToBackend utility with null/NextResponse/{data} return contract
provides:
  - Conditional proxy logic in all 7 contributor and payee route handlers
  - GET/POST /api/contributors -> /admin/contributors
  - GET/PATCH /api/contributors/[id] -> /admin/contributors/${id}
  - GET/POST /api/contributors/[id]/payees -> /admin/contributors/${id}/payees
  - GET /api/contributors/[id]/assets -> /admin/contributors/${id}/assets
  - GET/POST /api/payees -> /admin/payees
  - GET/PATCH /api/payees/[id] -> /admin/payees/${id}
  - GET /api/payees/[id]/contributors -> /admin/payees/${id}/contributors
affects:
  - 08-08 (final integration plan may test these routes in real mode)
  - 08-09 (decommission depends on all routes being proxy-ready)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Read body before proxyToBackend call for POST/PATCH so body is available in mock fallback path"
    - "Switch Request to NextRequest in route handlers that need proxyToBackend support"
    - "Collections routes fixed from \\!== to !== (linter cleaned backslash-escaped operators)"

key-files:
  created: []
  modified:
    - src/app/api/contributors/route.ts
    - src/app/api/contributors/[id]/route.ts
    - src/app/api/contributors/[id]/payees/route.ts
    - src/app/api/contributors/[id]/assets/route.ts
    - src/app/api/payees/route.ts
    - src/app/api/payees/[id]/route.ts
    - src/app/api/payees/[id]/contributors/route.ts
    - src/app/api/collections/[id]/route.ts
    - src/app/api/collections/[id]/assets/route.ts

key-decisions:
  - "Body parsed before proxyToBackend for POST/PATCH routes so mock fallback can use already-consumed body"
  - "Route handlers upgraded from Request to NextRequest for proxy compatibility"
  - "Collections files with backslash-escaped operators fixed as part of build unblocking"

patterns-established:
  - "Body-first pattern: parse request.json() before calling proxyToBackend for mutation routes"
  - "NextRequest required: all proxied handlers need NextRequest (not Request) for nextUrl.searchParams forwarding"

# Metrics
duration: 5min
completed: 2026-02-27
---

# Phase 8 Plan 05: Contributor and Payee Route Proxy Summary

**All 7 contributor and payee BFF route handlers wired with conditional proxyToBackend, enabling real backend data when NEXT_PUBLIC_USE_REAL_API=true**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-27T12:01:54Z
- **Completed:** 2026-02-27T12:06:25Z
- **Tasks:** 2
- **Files modified:** 9 (7 planned + 2 bug fix)

## Accomplishments
- All 4 contributor route handlers now proxy to `/admin/contributors` backend paths
- All 3 payee route handlers now proxy to `/admin/payees` backend paths
- Mock data generation preserved as fallback in all 7 handlers when USE_REAL_API=false
- Fixed pre-existing build-blocking parse errors in 2 collections route files

## Task Commits

Each task was committed atomically:

1. **Task 1: Add proxy to contributor routes** - `a241c25` (feat)
2. **Task 2: Add proxy to payee routes, fix collections parse errors** - `4b2f0f0` (feat)

## Files Created/Modified
- `src/app/api/contributors/route.ts` - Added proxyToBackend for GET (list) and POST (create)
- `src/app/api/contributors/[id]/route.ts` - Added proxyToBackend for GET (detail) and PATCH (update); upgraded Request to NextRequest
- `src/app/api/contributors/[id]/payees/route.ts` - Added proxyToBackend for GET (list) and POST (save assignments)
- `src/app/api/contributors/[id]/assets/route.ts` - Added proxyToBackend for GET (list contributor assets)
- `src/app/api/payees/route.ts` - Added proxyToBackend for GET (list) and POST (create)
- `src/app/api/payees/[id]/route.ts` - Added proxyToBackend for GET (detail) and PATCH (update); upgraded Request to NextRequest
- `src/app/api/payees/[id]/contributors/route.ts` - Added proxyToBackend for GET (reverse lookup)
- `src/app/api/collections/[id]/route.ts` - Fixed backslash-escaped `\!==` operators (Rule 1 bug fix)
- `src/app/api/collections/[id]/assets/route.ts` - Fixed backslash-escaped `\!==` and `\!Array` operators (Rule 1 bug fix)

## Decisions Made
- Body parsed before proxyToBackend for POST/PATCH routes: request body can only be consumed once, so it must be read before the proxy check, then passed as `body` option to proxy AND available in mock fallback path
- Route handlers upgraded from `Request` to `NextRequest`: proxyToBackend needs `request.nextUrl.searchParams` which only exists on NextRequest

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed backslash-escaped operators in collections routes causing Turbopack parse errors**
- **Found during:** Task 2 verification (npm run build)
- **Issue:** `src/app/api/collections/[id]/route.ts` and `src/app/api/collections/[id]/assets/route.ts` contained `\!==` and `\!Array` (backslash-escaped operators) from a prior plan execution, causing Turbopack to fail with "Expected unicode escape" and "Return statement is not allowed here" parse errors
- **Fix:** Linter automatically corrected the escape sequences to `!==` and `!Array` when files were read; verified fix was applied by re-reading files before build
- **Files modified:** `src/app/api/collections/[id]/route.ts`, `src/app/api/collections/[id]/assets/route.ts`
- **Verification:** `npm run build` succeeded after fix
- **Committed in:** `4b2f0f0` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 Rule 1 - Bug)
**Impact on plan:** Bug fix was necessary to unblock build verification. No scope creep.

## Issues Encountered
- Turbopack internal panic on first clean build attempt (ENOTEMPTY during .next directory cleanup) - resolved by removing .next directory and rebuilding
- Build lock file (`/.next/lock`) prevented concurrent builds - resolved by removing stale lock file

## Next Phase Readiness
- All contributor and payee routes are now proxy-ready
- Together with plans 08-02 through 08-04 and 08-06, all major API domains now have BFF proxy logic
- Ready for 08-08 (integration testing) and 08-09 (decommission execution)

---
*Phase: 08-legacy-system-migration*
*Completed: 2026-02-27*
