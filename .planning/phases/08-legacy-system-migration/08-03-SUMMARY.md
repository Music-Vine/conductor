---
phase: 08-legacy-system-migration
plan: 03
subsystem: api
tags: [nextjs, proxy, bff, feature-flag, assets, workflow]

# Dependency graph
requires:
  - phase: 08-01
    provides: proxyToBackend helper in src/lib/api/proxy.ts

provides:
  - Conditional BFF proxy in 7 core asset route handlers
  - Asset list and create routes proxy to /admin/assets
  - Asset detail and update routes proxy to /admin/assets/[id]
  - Workflow history route proxies to /admin/assets/[id]/workflow
  - Activity log route proxies to /admin/assets/[id]/activity
  - Approve, reject, unpublish action routes proxy to respective backend endpoints

affects:
  - 08-04 (user routes proxy)
  - 08-05 (contributor routes proxy)
  - Backend integration testing

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Conditional proxy pattern: proxyToBackend returns null (mock) | NextResponse (error) | {data} (success)"
    - "Body read-once pattern: parse body before proxy call so same value can be passed to proxy and mock"
    - "Graceful body read pattern for no-body POSTs: request.json().catch(() => ({}))"

key-files:
  created: []
  modified:
    - src/app/api/assets/route.ts
    - src/app/api/assets/[id]/route.ts
    - src/app/api/assets/[id]/workflow/route.ts
    - src/app/api/assets/[id]/activity/route.ts
    - src/app/api/assets/[id]/approve/route.ts
    - src/app/api/assets/[id]/reject/route.ts
    - src/app/api/assets/[id]/unpublish/route.ts
    - src/app/api/collections/[id]/route.ts

key-decisions:
  - "Body read before proxyToBackend call for POST/PATCH routes so same parsed value reaches both proxy and mock paths"
  - "Workflow action routes (approve/reject/unpublish) forward full request body to backend — backend handles validation in real mode"
  - "Unpublish uses graceful body parse (catch(() => ({}))) since endpoint accepts no required body in mock mode"
  - "TODO comments mark response shape adaptation points — real backend shape unknown until integration"

patterns-established:
  - "Conditional proxy pattern applied to all 7 asset routes follows the standard established in 08-01"
  - "Collections PATCH orphaned catch block removed — confirms pattern established in earlier plan"

# Metrics
duration: 4min
completed: 2026-02-27
---

# Phase 8 Plan 03: Asset Route BFF Proxy Summary

**Conditional proxyToBackend logic added to all 7 core asset route handlers (list, detail, workflow, activity, approve, reject, unpublish) enabling real backend integration via NEXT_PUBLIC_USE_REAL_API flag**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-02-27T11:58:05Z
- **Completed:** 2026-02-27T12:05:08Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- All 7 asset route handlers import and call proxyToBackend before falling through to mock data
- GET, POST, and PATCH handlers read body once and pass to both proxy and mock paths
- Workflow action routes (approve, reject, unpublish) forward full body to backend
- Mock mode behavior completely unchanged — all mock data generation and validation preserved

## Task Commits

Each task was committed atomically:

1. **Task 1: Add proxy to asset list, detail, workflow, and activity routes** - `80ea3a6` (feat)
2. **Task 2: Add proxy to asset workflow action routes** - `13a878b` (feat)

**Plan metadata:** (pending)

## Files Created/Modified

- `src/app/api/assets/route.ts` - GET and POST handlers now proxy to /admin/assets
- `src/app/api/assets/[id]/route.ts` - GET and PATCH handlers now proxy to /admin/assets/[id]
- `src/app/api/assets/[id]/workflow/route.ts` - GET proxies to /admin/assets/[id]/workflow
- `src/app/api/assets/[id]/activity/route.ts` - GET proxies to /admin/assets/[id]/activity
- `src/app/api/assets/[id]/approve/route.ts` - POST proxies to /admin/assets/[id]/approve
- `src/app/api/assets/[id]/reject/route.ts` - POST proxies to /admin/assets/[id]/reject
- `src/app/api/assets/[id]/unpublish/route.ts` - POST proxies to /admin/assets/[id]/unpublish
- `src/app/api/collections/[id]/route.ts` - Bug fix: removed orphaned catch block from PATCH handler

## Decisions Made

- Body read before `proxyToBackend` call for POST/PATCH routes so the same parsed value is available to both the proxy and mock code paths without reading the stream twice.
- Workflow action routes forward the full request body to the backend — in real mode, the backend validates inputs (like required `comments` for rejection). Mock-mode validation is preserved in the fallthrough path.
- Unpublish uses `request.json().catch(() => ({}))` since it doesn't require a body in mock mode and avoids a parse error if the client sends no body.
- Added `// TODO: adapt response shape when real backend format is known` comments at each proxy success path to flag where response adaptation will be needed.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed orphaned catch block in collections/[id]/route.ts PATCH handler**

- **Found during:** Task 2 verification (npm run build)
- **Issue:** The PATCH handler in `src/app/api/collections/[id]/route.ts` had a `} catch (error) {` block with no matching `try`. This was a residual from an earlier plan's proxy migration that partially removed the old try/catch structure. The TypeScript compiler reported "try expected" at line 116.
- **Fix:** Removed the orphaned `} catch (error) {` block and corrected indentation of the mock code block to match function scope.
- **Files modified:** `src/app/api/collections/[id]/route.ts`
- **Verification:** `npx tsc --noEmit` passes with no errors
- **Committed in:** `13a878b` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** The bug fix was blocking the build and necessary for correctness. No scope creep.

## Issues Encountered

- `npm run build` exits with SIGTERM (143) during page data collection phase — this is an environment limitation where Next.js tries to statically render pages that call localhost APIs, causing timeouts. `npx tsc --noEmit` passes cleanly. This pre-existing limitation existed before this plan.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 7 core asset routes ready to proxy to real backend when `NEXT_PUBLIC_USE_REAL_API=true` and `BACKEND_API_BASE_URL` are set
- Response shape adaptation (TODO comments) deferred until backend API contracts are known
- Next: apply same pattern to user, contributor, and payee routes

---
*Phase: 08-legacy-system-migration*
*Completed: 2026-02-27*
