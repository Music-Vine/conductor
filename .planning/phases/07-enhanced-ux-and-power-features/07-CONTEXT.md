# Phase 7: Enhanced UX & Power Features - Context

**Gathered:** 2026-02-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Power-user features and polish for daily staff workflows: a system-wide activity feed, inline field editing across all entity types, CSV export gap-filling for remaining tables, and contextual help tooltips on complex fields. This phase improves efficiency of existing features — it does not add new entity types or workflows.

</domain>

<decisions>
## Implementation Decisions

### Activity Feed
- Lives in **two places**: a compact widget on the dashboard home page linking through to a full dedicated Activity page
- Scope: **system-wide** — all changes by all staff, not personal history
- Event types covered: asset changes (approvals, rejections, uploads, workflow transitions), user account actions (suspensions, refunds, OAuth disconnects), financial operations (contributor/payee assignments, rate changes)
- Staff logins and bulk operation events are excluded from the feed
- Full Activity page filtering: **entity search** — look up a specific user, asset, or contributor and see all activity related to that entity

### Inline Editing
- Supported on: **Assets, Contributors, Payees, and Users**
- Activation: **click the field value** to enter edit mode (Notion/Linear pattern — no hover icon required)
- Save behaviour: **Enter to confirm, Escape to cancel** — no accidental saves on blur
- Location: **both table rows and detail pages** — quick edits on list view without navigating away

### CSV Export (Gap-Fill)
- Goal: ensure every data table has export — fill the tables that don't have it yet
- Tables needing export added: **Payees list, Collections list, Activity feed**
- Export scope: **offer both options** — "Export filtered" (current search/filter state) and "Export all" — per table
- Existing exports (users, assets, contributors/financials) are already in place and not being reworked

### Contextual Help & Tooltips
- Pattern: **? icon** placed next to fields/sections that need explanation
- Behaviour: **tooltip on hover** — appears on mouse-over, disappears when mouse moves away (no click to persist)
- Complex areas getting help text:
  - Workflow approval stages (what each stage means, what to check)
  - Payee percentage allocation (the 100% constraint, how rates distribute)
- Content depth: **short — 1-2 sentence explanations only**, no examples or lengthy guidance

### Claude's Discretion
- Dashboard widget layout and size (compact feed, number of entries shown)
- Activity feed entry format (icon, timestamp, actor, action description)
- Which specific fields are editable inline per entity type
- CSV column selection for new exports (follow existing conventions)
- ? icon placement and visual styling within Cadence component system

</decisions>

<specifics>
## Specific Ideas

- Activity feed click-through from dashboard widget to full page with entity pre-filtered
- Inline editing should feel like Linear — click directly on a value, it becomes an input, Enter saves
- "Export filtered" and "Export all" as two distinct buttons or a split-button dropdown per table

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 07-enhanced-ux-and-power-features*
*Context gathered: 2026-02-27*
