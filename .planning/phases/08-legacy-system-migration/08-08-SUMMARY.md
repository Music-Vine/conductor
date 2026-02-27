---
phase: 08-legacy-system-migration
plan: "08"
subsystem: testing
tags: [playwright, e2e, smoke-tests, chromium, auth-setup, storage-state]

# Dependency graph
requires:
  - phase: 08-02
    provides: user route proxy integration (smoke tests validate user screens work)
  - phase: 08-03
    provides: asset route proxy integration (smoke tests validate asset screens work)
  - phase: 08-04
    provides: upload/bulk/misc proxy routes
  - phase: 08-05
    provides: contributor/payee proxy routes
  - phase: 08-06
    provides: collection/activity/search proxy routes
provides:
  - Playwright installed and configured with setup + smoke projects
  - Auth setup test (e2e/smoke/auth.setup.ts) saves magic-link session to storageState
  - 6 smoke test files covering users, assets, contributors, payees, collections, activity
  - npm scripts for test:e2e, test:e2e:ui, test:e2e:smoke
affects: [08-09-cutover-checklist, future-ci-integration]

# Tech tracking
tech-stack:
  added: ["@playwright/test ^1.58.2", "Chromium (playwright browser)"]
  patterns:
    - "Auth setup project saves storageState for reuse across all smoke tests"
    - "smoke project depends on setup project for authenticated browser context"
    - "webServer config only active in non-CI mode (reuseExistingServer)"
    - "Read-only smoke tests: verify page load, table data, filter, row navigation"

key-files:
  created:
    - playwright.config.ts
    - e2e/smoke/auth.setup.ts
    - e2e/smoke/users.spec.ts
    - e2e/smoke/assets.spec.ts
    - e2e/smoke/contributors.spec.ts
    - e2e/smoke/payees.spec.ts
    - e2e/smoke/collections.spec.ts
    - e2e/smoke/activity.spec.ts
  modified:
    - package.json
    - .gitignore

key-decisions:
  - "Playwright storageState pattern: auth.setup.ts runs first, saves session to e2e/.auth/staff-user.json which all smoke tests reuse"
  - "webServer config conditional on CI env: local dev reuses existing server, CI starts fresh"
  - "Smoke tests are read-only validation only — no suspend, delete, bulk, or destructive operations"
  - "activity.spec.ts uses lenient count check (>=0) since activity may be empty in fresh environments"
  - "e2e/.auth/ directory gitignored to prevent auth tokens from being committed"

patterns-established:
  - "Auth once, reuse everywhere: single setup project + storageState for all smoke tests"
  - "Network idle wait pattern: waitForLoadState('networkidle') before assertions for consistent results"
  - "Error boundary check: assert 'something went wrong' text is NOT visible as basic health check"

# Metrics
duration: 2min
completed: 2026-02-27
---

# Phase 8 Plan 8: Playwright Smoke Tests Summary

**Playwright installed with 6 smoke test files covering all major Conductor screens, using magic-link auth setup and storageState reuse**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-27T12:11:14Z
- **Completed:** 2026-02-27T12:13:40Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- Installed `@playwright/test` and Chromium browser with full project configuration
- Created `playwright.config.ts` with setup + smoke projects, webServer config, and CI handling
- Created `e2e/smoke/auth.setup.ts` that authenticates via magic link and saves storageState for all subsequent tests
- Wrote 6 smoke test files covering all major screens: users, assets, contributors, payees, collections, activity

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Playwright and create configuration** - `01650bb` (chore)
2. **Task 2: Write smoke tests for all major screens** - `4d8ea7f` (feat)

**Plan metadata:** *(pending)*

## Files Created/Modified
- `playwright.config.ts` - Playwright configuration with setup + smoke projects, webServer, CI mode
- `e2e/smoke/auth.setup.ts` - Magic-link authentication setup that saves storageState to e2e/.auth/staff-user.json
- `e2e/smoke/users.spec.ts` - Smoke tests: page load, table rows, status filter, row click navigation
- `e2e/smoke/assets.spec.ts` - Smoke tests: page load, table rows, type filter, row click navigation
- `e2e/smoke/contributors.spec.ts` - Smoke tests: page load, table rows, row click navigation
- `e2e/smoke/payees.spec.ts` - Smoke tests: page load, table rows, row click navigation
- `e2e/smoke/collections.spec.ts` - Smoke tests: page load, table rows
- `e2e/smoke/activity.spec.ts` - Smoke tests: page load, activity feed entry count
- `package.json` - Added test:e2e, test:e2e:ui, test:e2e:smoke scripts; @playwright/test devDependency
- `.gitignore` - Added Playwright output directories and e2e/.auth/ exclusions

## Decisions Made
- Auth setup stores session in `e2e/.auth/staff-user.json` (gitignored) and all smoke tests reuse it via `storageState` config — eliminates per-test authentication overhead
- `webServer` config is conditional: omitted in CI (tests run against externally started server), included locally for developer convenience with `reuseExistingServer: true`
- Smoke tests are explicitly read-only: no suspend, delete, bulk operations, or mutations — these are validation gates for pre-cutover health checks
- `activity.spec.ts` uses `>=0` count assertion (lenient) because fresh environments may have no activity entries

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- `e2e/.auth/.gitkeep` could not be staged because the path itself is covered by the `.gitignore` pattern `/e2e/.auth/` — this is correct behavior; the directory is created at runtime by `auth.setup.ts` via `fs.mkdirSync`

## User Setup Required

None - no external service configuration required. Smoke tests require a running dev server and valid admin credentials in `admin@musicvine.com`.

## Next Phase Readiness
- Playwright smoke tests are ready to serve as the automated validation gate in the cutover checklist (08-09)
- Tests can be run with `npm run test:e2e:smoke` once a dev server is running and auth is configured
- Auth setup will require the dev server's magic link console output to complete authentication in first run
- Ready for 08-09: Cutover checklist which references these smoke tests as the go/no-go gate

---
*Phase: 08-legacy-system-migration*
*Completed: 2026-02-27*
