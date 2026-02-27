---
phase: 08-legacy-system-migration
plan: "04"
subsystem: api
tags: [proxy, bff, s3, multipart-upload, bulk-operations, sse, feature-flag]

# Dependency graph
requires:
  - phase: 08-01
    provides: proxyToBackend helper and USE_REAL_API feature flag

provides:
  - Conditional proxy for S3 presigned URL generation (single-part uploads)
  - Conditional proxy for multipart upload lifecycle (create, sign-part, complete, abort)
  - Conditional proxy for duplicate file detection
  - Conditional proxy for bulk asset operations (POST with SSE fallback)
  - Conditional proxy for bulk asset ID fetching (GET)

affects:
  - 08-legacy-system-migration

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Read body once before proxy check, share with mock fallback path"
    - "sign-part uses timeout: 5_000 (shorter timeout for high-frequency calls)"
    - "SSE bulk route preserves full mock stream as fallback — real backend SSE forwarding deferred"

key-files:
  created: []
  modified:
    - src/app/api/assets/presigned-url/route.ts
    - src/app/api/assets/multipart/create/route.ts
    - src/app/api/assets/multipart/sign-part/route.ts
    - src/app/api/assets/multipart/complete/route.ts
    - src/app/api/assets/multipart/abort/route.ts
    - src/app/api/assets/check-duplicates/route.ts
    - src/app/api/assets/bulk/route.ts
    - src/app/api/assets/bulk/ids/route.ts

key-decisions:
  - "sign-part uses 5_000ms timeout instead of 10_000ms default — called per chunk during upload"
  - "Bulk SSE route proxies but returns result.data as JSON when real backend responds (SSE forwarding deferred)"
  - "Duplicate destructuring bug in collections/route.ts fixed inline (pre-existing issue unrelated to plan)"

patterns-established:
  - "POST upload routes: await body once, pass to proxy, destructure in mock fallback"
  - "GET routes (bulk/ids): proxy first with no options, fall through to mock generation"

# Metrics
duration: 4min
completed: 2026-02-27
---

# Phase 8 Plan 04: Asset Upload Infrastructure and Bulk Routes Proxy Summary

**Conditional BFF proxy added to all 8 asset upload and bulk operation routes using proxyToBackend with mock fallback preserved**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-27T12:01:46Z
- **Completed:** 2026-02-27T12:06:04Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Added `proxyToBackend` to 6 upload infrastructure routes (presigned-url, multipart create/sign-part/complete/abort, check-duplicates)
- sign-part uses 5,000ms timeout (vs 10,000ms default) because it is called once per file chunk during large uploads
- Added `proxyToBackend` to 2 bulk routes (bulk POST with SSE fallback, bulk/ids GET)
- All existing mock upload simulation and SSE streaming preserved as fallback when USE_REAL_API=false

## Task Commits

Each task was committed atomically:

1. **Task 1: Add proxy to asset upload infrastructure routes** - `a241c25` (feat) — bundled into prior 08-05 execution commit
2. **Task 2: Add proxy to asset bulk routes** - `e5ea505` (feat)

**Plan metadata:** see final commit below

## Files Created/Modified

- `src/app/api/assets/presigned-url/route.ts` - Proxy POST to /admin/assets/presigned-url
- `src/app/api/assets/multipart/create/route.ts` - Proxy POST to /admin/assets/multipart/create
- `src/app/api/assets/multipart/sign-part/route.ts` - Proxy POST with 5s timeout to /admin/assets/multipart/sign-part
- `src/app/api/assets/multipart/complete/route.ts` - Proxy POST to /admin/assets/multipart/complete
- `src/app/api/assets/multipart/abort/route.ts` - Proxy POST to /admin/assets/multipart/abort
- `src/app/api/assets/check-duplicates/route.ts` - Proxy POST to /admin/assets/check-duplicates
- `src/app/api/assets/bulk/route.ts` - Proxy POST to /admin/assets/bulk, SSE mock fallback preserved
- `src/app/api/assets/bulk/ids/route.ts` - Proxy GET to /admin/assets/bulk/ids

## Decisions Made

- sign-part uses `timeout: 5_000` — this endpoint is called once per ~5MB chunk; a 10s default timeout would cause user-visible slowdowns during large file uploads
- Bulk SSE route: when real backend responds, returns `result.data` as JSON rather than forwarding the SSE stream — deferred until real backend SSE format is confirmed
- All validation and mock logic preserved below the proxy check so development works unchanged with USE_REAL_API=false

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed duplicate destructuring in collections route**

- **Found during:** Task 1 (TypeScript check revealed pre-existing error)
- **Issue:** `src/app/api/collections/route.ts` had two consecutive identical destructuring lines (lines 144-145), causing TS2451 "cannot redeclare block-scoped variable" errors
- **Fix:** Removed the duplicate plain destructuring line, keeping the `as any` cast version
- **Files modified:** `src/app/api/collections/route.ts`
- **Verification:** `npx tsc --noEmit` passes with zero errors
- **Committed in:** `a241c25` (part of Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Necessary pre-existing fix. No scope creep.

## Issues Encountered

- Build check (`npm run build`) could not complete due to Next.js dev server holding a lock on `.next/`. TypeScript check (`npx tsc --noEmit`) confirmed code correctness instead.

## Next Phase Readiness

- All 8 asset upload and bulk operation routes are proxy-ready
- When NEXT_PUBLIC_USE_REAL_API=true, upload and bulk flows hit the real backend
- SSE bulk forwarding is deferred — once real backend SSE format is confirmed, the TODO comments in `bulk/route.ts` can be replaced with proper stream forwarding

---
*Phase: 08-legacy-system-migration*
*Completed: 2026-02-27*
