---
plan: 07-08
phase: 07-enhanced-ux-and-power-features
status: complete
completed_at: 2026-02-27
---

# 07-08: Human Verification Checkpoint

## Summary

All Phase 7 features verified working by human tester. Two pre-existing bugs were discovered and fixed during verification.

## What Was Verified

1. **Activity Feed (Dashboard Widget)** — 10 recent entries visible with actor/action/entity/time, clickable to entity detail pages, "View all" navigates to /activity ✓
2. **Activity Feed (Full Page)** — /activity page loads with pagination, entity type filter and entity search work, sidebar link present ✓
3. **Inline Editing (Detail Pages)** — Asset (title/description/genre), contributor (name/email/phone), payee (name/email/paymentMethod), user (name/username) all click-to-edit; Enter saves, Escape cancels ✓
4. **Inline Editing (Table Rows)** — Title/name columns editable in all 4 entity tables; click on editable column enters edit mode without navigating ✓
5. **CSV Export (All tables)** — Users, Assets, Contributors, Payees, Collections, Activity all have "Export filtered" and "Export all" buttons ✓
6. **Contextual Help Tooltips** — ? icons on workflow stage labels and payee allocation; hover shows 1-2 sentence explanations ✓

## Bugs Fixed During Verification

- **collections URL bug** — `src/lib/api/collections.ts` had `/api/collections` endpoints. Since `apiClient` already has `baseUrl: '/api'`, server-side requests resolved to `/api/api/collections` (404). Fixed to `/collections` across all 6 functions. Pre-existing bug from Phase 4, surfaced when collections page became server-rendered.
- **collections detail page RSC boundary** — `src/app/(platform)/collections/[id]/page.tsx` (server component) had an inline `<button onClick={...}>`. Extracted to `RemoveAssetButton.tsx` client component.

## Commits

- `b432dbf`: fix(collections): remove duplicate /api prefix from all apiClient endpoints
- `2d40b2b`: fix(collections): extract RemoveAssetButton into client component
