---
phase: 08-legacy-system-migration
plan: "02"
subsystem: api
tags: [proxy, bff, next-js, backend-integration, users, feature-flag]

# Dependency graph
requires:
  - phase: 08-01
    provides: proxyToBackend helper, USE_REAL_API flag, NEXT_PUBLIC_USE_REAL_API pattern
provides:
  - All 10 user domain route handlers updated with conditional proxyToBackend logic
  - User list, detail, downloads, licenses, refund, suspend, unsuspend, OAuth disconnect, and bulk operations proxy-enabled
  - Mock mode preserved as fallback for all user routes
affects:
  - 08-03
  - 08-04
  - 08-05
  - 08-06

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Conditional proxy pattern: read body -> proxyToBackend -> return if non-null -> else mock fallback"
    - "POST action routes read body before proxy call so body can be used in both proxy and mock code paths"
    - "SSE bulk endpoint proxies to non-streaming JSON with TODO for stream forwarding when backend SSE format is known"

key-files:
  created: []
  modified:
    - src/app/api/users/route.ts
    - src/app/api/users/[id]/route.ts
    - src/app/api/users/[id]/downloads/route.ts
    - src/app/api/users/[id]/licenses/route.ts
    - src/app/api/users/[id]/refund/route.ts
    - src/app/api/users/[id]/suspend/route.ts
    - src/app/api/users/[id]/unsuspend/route.ts
    - src/app/api/users/[id]/disconnect-oauth/route.ts
    - src/app/api/users/bulk/route.ts
    - src/app/api/users/bulk/ids/route.ts

key-decisions:
  - "Body parsed before proxyToBackend call in POST/PATCH routes so the same variable serves both proxy and mock code paths"
  - "Bulk SSE route returns NextResponse.json(result.data) in proxy mode as SSE stream forwarding deferred until backend SSE format confirmed"
  - "refund route uses .catch(() => ({})) on request.json() since the original handler had no body - avoids breaking callers that send no body"

patterns-established:
  - "User domain proxy pattern: import proxyToBackend, check result at top of handler, fall through to mock"

# Metrics
duration: 6min
completed: 2026-02-27
---

# Phase 8 Plan 02: User Domain Proxy Routes Summary

**Conditional proxyToBackend added to all 10 user route handlers - list, detail, downloads, licenses, refund, suspend, unsuspend, OAuth disconnect, and bulk operations all proxy to /admin/users/* when NEXT_PUBLIC_USE_REAL_API=true**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-27T12:00:57Z
- **Completed:** 2026-02-27T12:06:49Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- All 4 user read routes (list, detail, downloads, licenses) have proxy logic before mock fallback
- All 6 user action/write routes (refund, suspend, unsuspend, OAuth disconnect, bulk, bulk IDs) have proxy logic
- Mock data generation code preserved entirely unchanged in all 10 routes
- App builds cleanly with all proxy imports resolved

## Task Commits

Each task was committed atomically:

1. **Task 1: Add proxy logic to user list and detail routes** - `7dbf48d` (feat)
2. **Task 2: Add proxy logic to user action and bulk routes** - `ee607ce` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/app/api/users/route.ts` - GET /api/users list with proxy to /admin/users
- `src/app/api/users/[id]/route.ts` - GET + PATCH /api/users/[id] with proxy to /admin/users/${id}
- `src/app/api/users/[id]/downloads/route.ts` - GET with proxy to /admin/users/${id}/downloads
- `src/app/api/users/[id]/licenses/route.ts` - GET with proxy to /admin/users/${id}/licenses
- `src/app/api/users/[id]/refund/route.ts` - POST with proxy to /admin/users/${id}/refund
- `src/app/api/users/[id]/suspend/route.ts` - POST with proxy to /admin/users/${id}/suspend
- `src/app/api/users/[id]/unsuspend/route.ts` - POST with proxy to /admin/users/${id}/unsuspend
- `src/app/api/users/[id]/disconnect-oauth/route.ts` - POST with proxy to /admin/users/${id}/disconnect-oauth
- `src/app/api/users/bulk/route.ts` - POST SSE with proxy to /admin/users/bulk (non-streaming)
- `src/app/api/users/bulk/ids/route.ts` - GET with proxy to /admin/users/bulk/ids

## Decisions Made
- Body parsed before proxyToBackend call in all POST/PATCH routes so the same `body` variable works in both proxy (passed as option) and mock (destructured locally) code paths
- Bulk SSE route returns `NextResponse.json(result.data)` in proxy mode - SSE stream forwarding is deferred until the backend SSE format is known (matches plan's TODO comment)
- `refund` route uses `.catch(() => ({}))` on `request.json()` since the original handler took no request body - this avoids breaking callers that don't send a body while still supplying body to proxy if needed

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed orphaned `} catch (error) {` block in src/app/api/collections/[id]/route.ts**
- **Found during:** Task 2 verification (tsc --noEmit)
- **Issue:** A previous plan (08-05) left a stale `} catch (error) { ... }` block without a matching `try` after refactoring the body parsing section. This caused TypeScript errors TS1005/TS1128.
- **Fix:** Removed the orphaned catch block and fixed indentation of the mock code block in the PATCH handler
- **Files modified:** src/app/api/collections/[id]/route.ts
- **Verification:** `npx tsc --noEmit` passes, `npm run build` succeeds
- **Committed in:** ee607ce (Task 2 commit, file staged alongside user routes)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Auto-fix resolved a pre-existing broken state from plan 08-05. No scope creep - collections proxy was already in place, only the syntax error was fixed.

## Issues Encountered
- Turbopack build was initially blocked by a corrupt `.next` lock file from a concurrent dev server. Resolved by clearing the lock and running a clean build.
- The pre-existing TypeScript error in the collections route (broken `try/catch` from 08-05) blocked the `tsc --noEmit` verification; auto-fixed per Rule 1.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 10 user domain routes ready to proxy to real backend when `NEXT_PUBLIC_USE_REAL_API=true`
- Mock mode fully preserved; local dev workflow unchanged
- Pattern established for remaining domain routes (assets, contributors, payees follow same approach)

---
*Phase: 08-legacy-system-migration*
*Completed: 2026-02-27*
