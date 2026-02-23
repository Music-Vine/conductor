---
phase: 06-payee-and-contributor-management
plan: "04"
subsystem: ui
tags: [react, tanstack-table, radix-tabs, next-js, contributors, payees, assets]

requires:
  - phase: 06-payee-and-contributor-management
    provides: contributor and payee types, API routes for contributors/payees/assets, contributor list page
  - phase: 04-catalog-management
    provides: asset type definitions and badge color scheme

provides:
  - Contributor detail page at /contributors/[id] with server-side data fetching
  - ProfileTab with contact info, masked tax ID, address, account info, and summary stats
  - PayeesTab with rate summary card (color-coded by allocation status) and payees table
  - AssetsTab with asset list table and navigation to /assets/[assetId]
  - ContributorDetailTabs with Radix Tabs synced to URL search params

affects:
  - 06-05 (payee detail page will follow same pattern)
  - 06-06 (edit contributor/payee forms use same route)

tech-stack:
  added: []
  patterns:
    - Server component parallel fetch (fetchContributor + fetchContributorPayees + fetchContributorAssets via Promise.all)
    - ContributorDetailTabs: same Radix Tabs + URL param pattern as UserDetailTabs
    - Tax ID masking: show last 4 digits only (***-**-XXXX for SSN-style)
    - Rate summary card with color-coded total: green=100%, yellow<100%, red>100%
    - TanStack Table with getCoreRowModel only (no pagination for small contributor-scoped lists)

key-files:
  created:
    - src/app/(platform)/contributors/[id]/page.tsx
    - src/app/(platform)/contributors/[id]/loading.tsx
    - src/app/(platform)/contributors/[id]/components/ContributorDetailTabs.tsx
    - src/app/(platform)/contributors/[id]/components/ProfileTab.tsx
    - src/app/(platform)/contributors/[id]/components/PayeesTab.tsx
    - src/app/(platform)/contributors/[id]/components/AssetsTab.tsx
    - src/app/(platform)/contributors/[id]/components/index.ts
  modified: []

key-decisions:
  - "ContributorAssetListItem type defined locally in AssetsTab (API returns simplified shape without full AssetListItem fields)"
  - "Tax ID masked to last 4 digits in ProfileTab (SSN-style: ***-**-XXXX, generic: asterisks + last 4)"
  - "AssetsTab uses local ContributorAssetListItem type exported from AssetsTab.tsx (not from global types)"
  - "PayeesTab toast placeholders for edit/remove/add actions (functionality deferred to Plan 06-06)"
  - "Total rate summary card shows rateMessage: 100% = Fully allocated, <100% = X% unassigned, >100% = X% over allocated"

patterns-established:
  - "Contributor detail tabs follow UserDetailTabs pattern exactly (Radix Tabs, URL param sync, default=profile)"
  - "Small tables in detail pages use getCoreRowModel only (no virtualization, no pagination)"
  - "Action buttons in detail tables use toast.info() as placeholders for future plan functionality"

duration: 4min
completed: 2026-02-23
---

# Phase 6 Plan 4: Contributor Detail Page Summary

**Tabbed contributor detail page with masked tax ID display, color-coded payee rate allocation summary, and asset list table navigating to /assets/[id]**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-23T11:40:40Z
- **Completed:** 2026-02-23T11:44:04Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Contributor detail page at /contributors/[id] fetching data in parallel with Next.js 15 async params
- ProfileTab with four sections: contact info (masked tax ID), address, account info, summary stats
- PayeesTab with color-coded total rate card (green/yellow/red) and TanStack Table for payee relationships
- AssetsTab with TanStack Table, type/status color-coded badges, and row-click navigation to asset detail
- All tabs persist state via URL search params for shareable links

## Task Commits

Each task was committed atomically:

1. **Task 1: Create contributor detail page and tab structure** - `2b7bba0` (feat)
2. **Task 2: Create PayeesTab and AssetsTab components** - `4aa3f89` (feat)

**Plan metadata:** pending

## Files Created/Modified

- `src/app/(platform)/contributors/[id]/page.tsx` - Server component, parallel fetch, contributor header with status badge
- `src/app/(platform)/contributors/[id]/loading.tsx` - Loading skeleton matching page structure
- `src/app/(platform)/contributors/[id]/components/ContributorDetailTabs.tsx` - Radix Tabs client component, URL search param sync
- `src/app/(platform)/contributors/[id]/components/ProfileTab.tsx` - Four-section profile with masked tax ID and status badge
- `src/app/(platform)/contributors/[id]/components/PayeesTab.tsx` - Rate summary card + TanStack Table + action buttons
- `src/app/(platform)/contributors/[id]/components/AssetsTab.tsx` - Asset table with type/status badges, row-click navigation
- `src/app/(platform)/contributors/[id]/components/index.ts` - Barrel export for all components

## Decisions Made

- **ContributorAssetListItem type defined locally:** The API at /api/contributors/[id]/assets returns a simplified shape (id, title, type, status, createdAt) that does not match AssetListItem from global types. Defined a local interface in AssetsTab.tsx and exported it for use in page.tsx.
- **Tax ID masking pattern:** SSN-style (9 digits) formatted as `***-**-XXXX`; generic formats show asterisks for all but last 4 digits. This matches common financial UI conventions.
- **Toast placeholders for action buttons:** Edit Rate, Remove, and Add Payee buttons use `toast.info()` with a message pointing to Plan 06 (06-06) where the actual forms will be built.
- **Total rate message wording:** "Fully allocated" for 100%, "X% unassigned" when under, "X% over allocated" when over.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Contributor detail page complete, ready for Plan 06-05 (Payee detail page, same pattern)
- All action buttons have toast placeholders ready to be replaced with real forms in 06-06
- ContributorDetailTabs pattern established, consistent with UserDetailTabs for team familiarity

---
*Phase: 06-payee-and-contributor-management*
*Completed: 2026-02-23*
