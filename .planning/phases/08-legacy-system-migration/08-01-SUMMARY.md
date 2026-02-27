---
phase: 08-legacy-system-migration
plan: 01
subsystem: api
tags: [proxy, backend-integration, middleware, next.js, environment-variables, feature-flag]

# Dependency graph
requires:
  - phase: 07-enhanced-ux-and-power-features
    provides: Complete frontend with all mock API routes established
provides:
  - Shared proxyToBackend helper for all route handlers to conditionally forward to real backend
  - USE_REAL_API feature flag constant for mock/real mode switching
  - Documented env var template (BACKEND_API_BASE_URL, BACKEND_API_SECRET, NEXT_PUBLIC_USE_REAL_API)
  - Migrated src/proxy.ts (Next.js 16 convention, renamed from middleware.ts)
affects:
  - 08-02 through 08-09 (all subsequent route handler integration plans import from src/lib/api/proxy.ts)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "proxyToBackend null-return pattern: null=mock mode, NextResponse=error, {data}=success"
    - "Feature flag via NEXT_PUBLIC_USE_REAL_API for zero-downtime mode switching"
    - "AbortSignal.timeout for fetch timeout management without external libraries"

key-files:
  created:
    - src/lib/api/proxy.ts
    - src/proxy.ts
    - .env.example
  modified:
    - .env.local.example
    - .env.local (gitignored, not committed)

key-decisions:
  - "proxyToBackend returns null in mock mode so callers fall through to existing mock data"
  - "Return type { data: unknown } | NextResponse | null — caller adapts shape (not proxy)"
  - "BACKEND_API_SECRET forwarded as Bearer token for backend-to-backend auth"
  - "Manual rename of middleware.ts to proxy.ts (codemod skipped — uncommitted changes in tree)"
  - ".env.example added with -f force flag since .env* is gitignored (documentation value)"

patterns-established:
  - "Route handler proxy pattern: null check → NextResponse check → { data } shape adaptation"
  - "USE_REAL_API constant imported alongside proxyToBackend for guard clauses in routes"

# Metrics
duration: 2min
completed: 2026-02-27
---

# Phase 8 Plan 01: Proxy Infrastructure Summary

**Shared proxyToBackend helper with feature flag, auth header forwarding, and middleware renamed to proxy.ts per Next.js 16 convention**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-02-27T11:54:31Z
- **Completed:** 2026-02-27T11:56:51Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Created `src/lib/api/proxy.ts` with `proxyToBackend` helper and `USE_REAL_API` constant — the foundation all 08-02 through 08-09 plans will import
- Documented backend integration env vars in `.env.example` and `.env.local.example` with safe defaults (mock mode off by default)
- Migrated `src/middleware.ts` to `src/proxy.ts` per Next.js 16 convention — build verified with "ƒ Proxy (Middleware)" confirmation

## Task Commits

Each task was committed atomically:

1. **Task 1: Create shared proxyToBackend helper** - `1ede609` (feat)
2. **Task 2: Add environment variables and migrate middleware to proxy** - `e11ced4` (feat)

## Files Created/Modified
- `src/lib/api/proxy.ts` - proxyToBackend helper and USE_REAL_API constant
- `src/proxy.ts` - Renamed from middleware.ts with `middleware` -> `proxy` function rename
- `.env.example` - New env var template with backend integration vars (force-committed)
- `.env.local.example` - Updated with Phase 8 backend integration section
- `.env.local` - Updated with Phase 8 vars (gitignored, not committed)

## Decisions Made
- `proxyToBackend` returns `null` in mock mode so callers can fall through to existing mock data without any structural changes — the cleanest migration path
- Return type is `{ data: unknown } | NextResponse | null` — the proxy does not adapt response shape, each caller adapts to its own API contract
- `BACKEND_API_SECRET` forwarded as `Authorization: Bearer` header for standard backend-to-backend auth
- Manual rename used for middleware → proxy migration (the `@next/codemod` required a clean git tree, which we couldn't satisfy mid-execution)
- `.env.example` added with `git add -f` since the project's `.gitignore` matches `.env*` — the template has documentation value and must be committed per plan `must_haves`

## Deviations from Plan

None - plan executed exactly as written. The codemod fallback to manual rename was explicitly anticipated in the plan's task instructions.

## Issues Encountered
- `@next/codemod middleware-to-proxy` refused to run due to uncommitted changes in the working tree. The plan explicitly provided manual fallback instructions which were followed.
- `.env.example` was gitignored by the `.env*` pattern in `.gitignore`. Used `git add -f` to force-track it since it's a documentation template, not a secrets file.

## User Setup Required
None - environment variables default to mock mode (`NEXT_PUBLIC_USE_REAL_API=false`). No external service configuration required to run the app.

## Next Phase Readiness
- `proxyToBackend` and `USE_REAL_API` are ready for all route handlers (plans 08-02 through 08-09) to import
- App runs in mock mode without any behavior change — safe to deploy immediately
- When ready to go live: set `NEXT_PUBLIC_USE_REAL_API=true`, `BACKEND_API_BASE_URL`, and `BACKEND_API_SECRET` in production environment

---
*Phase: 08-legacy-system-migration*
*Completed: 2026-02-27*
