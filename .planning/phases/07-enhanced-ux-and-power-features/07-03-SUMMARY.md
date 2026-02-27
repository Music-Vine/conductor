---
phase: 07-enhanced-ux-and-power-features
plan: "03"
subsystem: ui
tags: [radix-ui, tooltip, help, ux, workflow, payees]

# Dependency graph
requires:
  - phase: 06-payee-and-contributor-management
    provides: PayeesTab with percentage rate allocation UI
  - phase: 04-asset-upload-and-management
    provides: WorkflowTimeline component for asset approval stages
provides:
  - Reusable HelpTooltip component using @radix-ui/react-tooltip
  - TooltipProvider context wrapping all platform pages
  - Contextual help on workflow stages (initial_review, quality_check, platform_assignment, final_approval)
  - Contextual help on payee percentage allocation (100% constraint explanation)
affects:
  - Any future UI components needing hover tooltips

# Tech tracking
tech-stack:
  added: []
  patterns:
    - STAGE_TOOLTIPS map pattern for per-state tooltip text in WorkflowTimeline
    - HelpTooltip inline next to labels with flex gap-1.5 alignment

key-files:
  created:
    - src/components/HelpTooltip.tsx
  modified:
    - src/app/(platform)/layout-client.tsx
    - src/components/workflow/WorkflowTimeline.tsx
    - src/app/(platform)/contributors/[id]/components/PayeesTab.tsx

key-decisions:
  - "Use @radix-ui/react-tooltip directly (not Cadence - no Tooltip component in Cadence)"
  - "TooltipProvider at platform layout level covers all pages needing tooltips"
  - "STAGE_TOOLTIPS map in WorkflowTimeline for clean per-state tooltip text"
  - "Tooltip only shown for 4 approval stages (not draft/submitted/published) where explanation adds value"
  - "HelpTooltip placed on Total Payout Rate label, not Rate column header, for contextual relevance"

patterns-established:
  - "HelpTooltip: import and place inline next to any label needing contextual explanation"
  - "STAGE_TOOLTIPS partial record pattern: add tooltip for complex stages only"

# Metrics
duration: ~8min
completed: 2026-02-27
---

# Phase 7 Plan 03: Contextual Help Tooltips Summary

**Reusable HelpTooltip component via @radix-ui/react-tooltip with TooltipProvider in platform layout, placed on 4 workflow approval stages and payee percentage allocation**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-02-27T08:44:37Z
- **Completed:** 2026-02-27T08:52:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Created reusable HelpTooltip component: ? icon button with hover tooltip, accessibility attributes, and Radix UI portal rendering
- Added TooltipProvider (delayDuration=300) to platform layout so all pages share tooltip context
- Added per-stage tooltips to WorkflowTimeline for Initial Review, Quality Check, Platform Assignment, and Final Approval
- Added tooltip to PayeesTab "Total Payout Rate" label explaining the 100% allocation constraint

## Task Commits

Each task was committed atomically:

1. **Task 1: Create HelpTooltip component and add TooltipProvider** - `09edf87` (feat)
2. **Task 2: Place tooltips on workflow stages and payee allocation** - `d736d94` (feat)

**Plan metadata:** (pending docs commit)

## Files Created/Modified
- `src/components/HelpTooltip.tsx` - Reusable ? icon tooltip component using @radix-ui/react-tooltip
- `src/app/(platform)/layout-client.tsx` - Added Tooltip.Provider with delayDuration=300 wrapping platform pages
- `src/components/workflow/WorkflowTimeline.tsx` - Added STAGE_TOOLTIPS map and HelpTooltip on stage labels
- `src/app/(platform)/contributors/[id]/components/PayeesTab.tsx` - Added HelpTooltip on "Total Payout Rate" label

## Decisions Made
- Used `@radix-ui/react-tooltip` directly (not Cadence - no Tooltip component exists in Cadence)
- TooltipProvider placed at platform layout level covers all pages without needing per-page setup
- STAGE_TOOLTIPS is a partial record - only the 4 approval stages get tooltips (draft/submitted/published need no explanation)
- HelpTooltip placed on the "Total Payout Rate" label in the summary card (most contextually relevant placement)
- No new npm dependencies — @radix-ui/react-tooltip was already installed as a transitive dep at v1.2.8

## Deviations from Plan

None - plan executed exactly as written. The WorkflowTimeline was found at `src/components/workflow/WorkflowTimeline.tsx` rather than the `src/app/(platform)/assets/[id]/components/` path suggested in the plan, but this is a shared component location which is appropriate.

## Issues Encountered
None - TypeScript compiled cleanly on both tasks.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- HelpTooltip is a reusable component ready for any future UI location needing hover explanations
- TooltipProvider already in place, no additional setup needed for future tooltip placements
- No blockers for subsequent plans in Phase 7

---
*Phase: 07-enhanced-ux-and-power-features*
*Completed: 2026-02-27*
