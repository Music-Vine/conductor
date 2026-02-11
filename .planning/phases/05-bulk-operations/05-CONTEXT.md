# Phase 5: Bulk Operations - Context

**Gathered:** 2026-02-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Enable staff to perform large-scale operations on multiple items (users, assets, contributors, payees) with async processing and progress tracking. Supports selection mechanisms, bulk actions, error handling, and audit trails for operations affecting many items at once.

</domain>

<decisions>
## Implementation Decisions

### Selection patterns
- Select All selects all items matching current filters across all pages (not just current page)
- Show count of selected items (e.g., 'Select all 1,234 assets')
- Shift+Click range selection works across pages (loads intermediate pages if needed)
- Selection clears when staff apply new filters or navigate away

### Action execution flow
- Confirmation level depends on action type:
  - Destructive actions (delete, archive, takedown) get strong confirmation (type-to-confirm)
  - Safe actions (add tag, add to collection) get simple confirmation dialog
- Bulk action toolbar appears as floating bottom bar (Gmail style)
- Available actions:
  - Status changes: approve, reject, publish, unpublish workflow actions
  - Metadata edits: add/remove tags, change genre, set contributor, update platform
  - Organization: add to collection, remove from collection
  - Destructive: delete, archive, takedown
- Metadata operations are additive only (can add tags, not replace all existing tags)

### Progress visibility
- Progress shows in non-blocking toast notification in corner
- Staff can continue working while operation runs
- Progress indicator shows:
  - Item count: "Processing 45 of 234 items..."
  - Percentage: "19% complete"
  - Time estimate: "~2 minutes remaining"
  - Current item: "Processing: 'Summer Vibes.mp3'"
- No cancel button (once started, must complete)

### Failure handling
- Stop on first error (first failure stops everything)
- Show error message in toast notification only
- No retry mechanism (staff must fix issue and restart manually)
- Single audit log entry per bulk operation: "Bulk deleted 234 assets" with operation ID

### Claude's Discretion
- Selection feedback mechanism (count badge vs preview + count)
- Navigation behavior during operation (given no cancel, determine if warn or continue)
- Exact layout and styling of floating bottom bar
- Timing for intermediate page loading during cross-page range selection
- Toast notification duration and dismiss behavior
- Error message formatting and detail level

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches following established patterns from Phases 1-4.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 05-bulk-operations*
*Context gathered: 2026-02-11*
