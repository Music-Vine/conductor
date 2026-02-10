---
phase: 04-catalog-management
plan: 11
subsystem: workflow
tags: [workflow, approval, timeline, react, tanstack-query]

# Dependency graph
requires:
  - phase: 04-01
    provides: Workflow types and state transitions
  - phase: 04-03
    provides: Asset API endpoints including workflow history
  - phase: 04-09
    provides: Asset detail page with tab structure
provides:
  - WorkflowTimeline component showing approval progress
  - ApprovalForm component with checklist and actions
  - Complete workflow tab for asset approval management
affects: [asset-review, approval-workflows]

# Tech tracking
tech-stack:
  added: []
  patterns: [timeline-visualization, workflow-state-ui, approval-forms]

key-files:
  created:
    - src/components/workflow/WorkflowTimeline.tsx
    - src/components/workflow/ApprovalForm.tsx
    - src/components/workflow/index.ts
  modified:
    - src/app/(platform)/assets/[id]/components/WorkflowTab.tsx

key-decisions:
  - "Timeline shows completed stages with green checkmark, current with blue indicator, rejected with red X"
  - "Checklist items are stage-specific (initial_review, quality_check, platform_assignment, final_approval, review)"
  - "Platform assignment enforced for music assets with radio buttons (music-vine, uppbeat, both)"
  - "Comments required for rejection actions, optional for approval"
  - "Router refresh after action completion to show updated asset state"

patterns-established:
  - "Workflow timeline with relative time formatting for history items"
  - "Stage-based checklist items that adapt to current workflow state"
  - "Action availability determined by getAvailableActions from transitions"
  - "Two-column layout for timeline and approval form (desktop), stacked (mobile)"

# Metrics
duration: 2.75min
completed: 2026-02-10
---

# Phase 4 Plan 11: Workflow Tab Summary

**Workflow timeline with approval progress visualization and stage-based action forms with checklist and platform assignment**

## Performance

- **Duration:** 2m 45s
- **Started:** 2026-02-10T09:21:05Z
- **Completed:** 2026-02-10T09:23:50Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Visual timeline showing all workflow stages with status indicators (completed/current/pending/rejected)
- Approval form with stage-specific checklists and action buttons (Approve/Reject)
- Platform assignment interface for music assets at platform_assignment stage
- Complete workflow tab replacing placeholder with functional approval management UI

## Task Commits

Each task was committed atomically:

1. **Task 1: Create workflow timeline component** - `8376605` (feat)
2. **Task 2: Create approval form component** - `3334dd7` (feat)
3. **Task 3: Build complete workflow tab** - `090afb2` (feat)

## Files Created/Modified
- `src/components/workflow/WorkflowTimeline.tsx` - Timeline visualization with stage status indicators, history items with reviewer/timestamp/comments/checklist, relative time formatting
- `src/components/workflow/ApprovalForm.tsx` - Stage-specific checklist, platform assignment radio buttons, comments textarea, Approve/Reject action buttons with state validation
- `src/components/workflow/index.ts` - Export barrel for workflow components
- `src/app/(platform)/assets/[id]/components/WorkflowTab.tsx` - Two-column layout with timeline and approval form, workflow history fetching, router refresh on action completion

## Decisions Made

**Timeline status determination:**
- Completed stages (before current): green checkmark icon
- Current stage: blue indicator with white dot
- Pending stages (after current): gray circle
- Rejected states: red X icon
- Proper handling of rejection paths in timeline logic

**Checklist items per stage:**
- `initial_review`: Audio quality, file format, copyright checks
- `quality_check`: Metadata accuracy, tags, BPM/Key correctness
- `platform_assignment`: Platform selection confirmation
- `final_approval`: All checks verified, ready for publication
- `review` (simple workflow): Content quality, metadata complete, no issues

**Platform assignment enforcement:**
- Radio buttons for music-vine/uppbeat/both
- Only shown when asset.status === 'platform_assignment' AND isMusicAsset(asset)
- Default selection is 'both'
- Platform value sent with approval request

**Action button states:**
- Approve button: Cadence 'bold' variant, disabled while submitting
- Reject button: Cadence 'error' variant, disabled when comments empty or submitting
- Action availability determined by getAvailableActions(status, transitions)
- Draft/Published states show informational messages instead of form

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all components integrated smoothly with existing asset detail page structure and API endpoints.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Workflow tab complete and integrated with asset detail page. Staff can:
- View complete approval history with timeline visualization
- See current workflow stage and all previous transitions
- Review checklist items and comments from past reviews
- Take approval/rejection actions with checklist and feedback
- Assign platform for music assets during platform_assignment stage

Ready for production use. Future enhancements (not required for Phase 4):
- Real-time workflow updates via WebSocket
- Email notifications for workflow transitions
- Bulk approval actions across multiple assets

---
*Phase: 04-catalog-management*
*Completed: 2026-02-10*
