---
phase: 08-legacy-system-migration
plan: "07"
subsystem: docs
tags: [decommission, migration, documentation, runbooks, feature-parity]

# Dependency graph
requires:
  - phase: 08-legacy-system-migration
    provides: Migration strategy, legacy system inventory, Conductor feature completeness across phases 1-7

provides:
  - Feature parity audit checklist mapping all legacy workflows to Conductor equivalents
  - Decommission runbooks for all 4 legacy systems with step-by-step shutdown procedures
  - Documented decommission order: Jordan's Admin -> Retool -> Music Vine PHP -> Uppbeat PHP
  - Gaps Identified table to block decommission if any workflow lacks Conductor equivalent

affects:
  - cutover process
  - staff training
  - legacy system shutdown

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created:
    - docs/decommission/feature-parity-audit.md
    - docs/decommission/jordans-admin.md
    - docs/decommission/retool.md
    - docs/decommission/musicvine-php.md
    - docs/decommission/uppbeat-php.md
  modified: []

key-decisions:
  - "Decommission order: Jordan's Admin (Low) -> Retool (Low) -> Music Vine PHP (High) -> Uppbeat PHP (High)"
  - "Jordan's Admin and Retool sections use placeholder rows with fill-in-during-audit instructions"
  - "High-risk systems (Music Vine PHP, Uppbeat PHP) require 10 business day notice and extended monitoring"
  - "Uppbeat PHP requires 7-day monitoring period vs 5-day for others due to 3M+ user scale"
  - "Retool runbook includes explicit subscription cancellation step to eliminate SaaS cost"
  - "Feature parity audit Gaps Identified table acts as decommission gate — any gap blocks proceeding"
  - "Uppbeat PHP database backup retained 60 days post-decommission vs 30 days for Music Vine PHP"

patterns-established: []

# Metrics
duration: 3min
completed: 2026-02-27
---

# Phase 8 Plan 7: Decommission Documentation Summary

**Feature parity audit checklist (100 checkbox rows) and 4 system-specific decommission runbooks covering step-by-step shutdown of Jordan's Admin, Retool, Music Vine PHP admin, and Uppbeat PHP admin**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-02-27T11:55:03Z
- **Completed:** 2026-02-27T11:58:10Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Created comprehensive feature parity audit checklist with 100 checkbox rows spanning all 4 legacy systems: user management, asset/catalog, collections, contributors/payees, activity/audit, and cross-cutting features (keyboard shortcuts, inline editing, contextual help, global search)
- Created 4 decommission runbooks following a consistent structure (Prerequisites, Pre-Decommission Checks, Decommission Steps, Rollback Plan) with system-specific risk calibration
- Documented formal decommission order (Jordan's Admin -> Retool -> Music Vine PHP -> Uppbeat PHP) with rationale for each system's placement

## Task Commits

Each task was committed atomically:

1. **Task 1: Create feature parity audit checklist** - `685c54a` (docs)
2. **Task 2: Create decommission runbooks for all 4 legacy systems** - `3f229be` (docs)

**Plan metadata:** *(docs commit to follow)*

## Files Created/Modified

- `docs/decommission/feature-parity-audit.md` - 250-line checklist mapping all legacy workflows to Conductor equivalents, with sign-off table and Gaps Identified gate
- `docs/decommission/jordans-admin.md` - Runbook for Secondary Uppbeat PHP/JS admin (Priority 1, Low risk)
- `docs/decommission/retool.md` - Runbook for Retool admin (Priority 2, Low risk, includes subscription cancellation step)
- `docs/decommission/musicvine-php.md` - Runbook for primary Music Vine PHP admin (Priority 3, High risk, extended notice)
- `docs/decommission/uppbeat-php.md` - Runbook for primary Uppbeat PHP admin (Priority 4, High risk, 3M+ users, 7-day monitoring)

## Decisions Made

- Decommission order reflects risk profile: low-risk systems first to build operational confidence before high-risk systems
- Jordan's Admin and Retool sections in the audit use placeholder rows because the specific workflows in these systems need to be enumerated during an audit walkthrough (not pre-knowable from code)
- High-risk runbooks (Music Vine PHP, Uppbeat PHP) include 10-day notice periods vs 5-day for low-risk systems
- Uppbeat PHP extended to 7-day monitoring period (vs 5-day) and 60-day backup retention (vs 30-day) given 3M+ user scale
- Retool runbook includes an explicit "Cancel Retool Subscription" step as a tracked checkbox — eliminating the recurring SaaS cost is a key reason for decommissioning Retool second
- The feature parity audit Gaps Identified table acts as a formal gate: any row with content blocks decommission from proceeding

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

All 7 plans in Phase 8 are now complete:
- Phase 8 Plan 1-6: Research, context capture, planning artifacts
- Phase 8 Plan 7: Operational decommission documentation

Conductor is ready for production cutover. The decommission runbooks in `docs/decommission/` provide the step-by-step operational procedures to safely retire each legacy system in sequence.

Next step for the team: conduct the feature parity audit (have staff work through `docs/decommission/feature-parity-audit.md` with `NEXT_PUBLIC_USE_REAL_API=true`), then follow each runbook in order.

---
*Phase: 08-legacy-system-migration*
*Completed: 2026-02-27*
