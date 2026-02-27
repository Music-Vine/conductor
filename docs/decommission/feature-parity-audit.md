# Feature Parity Audit

**Status:** [ ] INCOMPLETE
**Auditor:** _______________
**Date:** _______________
**Sign-off:** Team Lead: _______________ Date: _______________

---

## How to Use This Checklist

For each legacy workflow listed below, verify that the equivalent Conductor feature:

1. Exists and is accessible from the navigation
2. Works with real data (not just mock data, i.e. `NEXT_PUBLIC_USE_REAL_API=true`)
3. Produces the same outcome as the legacy system

Mark each item with `[x]` when verified. Add notes for any discrepancies.

**Complete all sections before signing off on decommission.**

---

## Music Vine PHP Admin Workflows

### User Management

| Legacy Workflow | Conductor Equivalent | Verified | Notes |
|----------------|---------------------|----------|-------|
| Search users by email | /users -> search bar -> click Search | [ ] | |
| Filter users by status (active/suspended) | /users -> Status filter dropdown | [ ] | |
| Filter users by subscription tier | /users -> Tier filter dropdown | [ ] | |
| View user profile (name, email, join date) | /users/[id] -> Profile tab | [ ] | |
| View subscription details | /users/[id] -> Subscription tab | [ ] | |
| View download history | /users/[id] -> Downloads tab | [ ] | |
| Suspend a user account | /users/[id] -> Profile tab -> Actions dropdown -> Suspend | [ ] | |
| Unsuspend a user account | /users/[id] -> Profile tab -> Actions dropdown -> Unsuspend | [ ] | |
| Disconnect OAuth provider | /users/[id] -> Profile tab -> OAuth section -> Disconnect | [ ] | |
| Issue a refund | /users/[id] -> Subscription tab -> Refund button | [ ] | |
| Export user data to CSV | /users -> Export CSV button (respects current filters) | [ ] | |
| Bulk suspend users | /users -> select users -> Bulk Actions -> Suspend | [ ] | |
| Bulk unsuspend users | /users -> select users -> Bulk Actions -> Unsuspend | [ ] | |
| Bulk delete users | /users -> select users -> Bulk Actions -> Delete (type to confirm) | [ ] | |

### Asset / Catalog Management

| Legacy Workflow | Conductor Equivalent | Verified | Notes |
|----------------|---------------------|----------|-------|
| Search assets by title | /assets -> search bar -> click Search | [ ] | |
| Filter assets by type (music/sfx/etc.) | /assets -> Type filter dropdown | [ ] | |
| Filter assets by workflow status | /assets -> Status filter dropdown | [ ] | |
| View asset detail (metadata, type, platform) | /assets/[id] -> Overview tab | [ ] | |
| Preview audio/video asset | /assets/[id] -> Overview tab -> Preview player | [ ] | |
| View asset workflow history | /assets/[id] -> Workflow tab | [ ] | |
| Approve asset in workflow | /assets/[id] -> Workflow tab -> Approve | [ ] | |
| Reject asset in workflow (with comments) | /assets/[id] -> Workflow tab -> Reject | [ ] | |
| Assign platform (Music Vine/Uppbeat/Both) | /assets/[id] -> Workflow tab -> Platform assignment | [ ] | |
| Unpublish a published asset | /assets/[id] -> Unpublish button | [ ] | |
| Upload new assets | /assets -> Upload Assets button | [ ] | |
| Export asset list to CSV | /assets -> Export CSV button (respects current filters) | [ ] | |
| Bulk approve assets | /assets -> select assets -> Bulk Actions -> Approve | [ ] | |
| Bulk reject assets | /assets -> select assets -> Bulk Actions -> Reject | [ ] | |
| Bulk archive assets | /assets -> select assets -> Bulk Actions -> Archive (type to confirm) | [ ] | |
| Bulk delete assets | /assets -> select assets -> Bulk Actions -> Delete (type to confirm) | [ ] | |
| Bulk tag assets | /assets -> select assets -> Bulk Actions -> Add Tags | [ ] | |
| Bulk assign to collection | /assets -> select assets -> Bulk Actions -> Add to Collection | [ ] | |
| Inline edit asset title | /assets -> click asset title cell -> type -> Enter | [ ] | |

### Collections Management

| Legacy Workflow | Conductor Equivalent | Verified | Notes |
|----------------|---------------------|----------|-------|
| View all collections | /collections | [ ] | |
| View collection detail and assets | /collections/[id] | [ ] | |
| Add asset to collection | /assets/[id] -> Overview tab -> Add to Collection | [ ] | |
| Remove asset from collection | /collections/[id] -> asset row -> Remove | [ ] | |

### Contributor / Payee Management

| Legacy Workflow | Conductor Equivalent | Verified | Notes |
|----------------|---------------------|----------|-------|
| View contributor list | /contributors | [ ] | |
| View contributor profile | /contributors/[id] -> Profile tab | [ ] | |
| View contributor assets | /contributors/[id] -> Assets tab | [ ] | |
| View contributor payee assignments | /contributors/[id] -> Payees tab | [ ] | |
| Assign payee to contributor with rate | /contributors/[id] -> Payees tab -> Add Payee | [ ] | |
| Edit payee rate for contributor | /contributors/[id] -> Payees tab -> Edit Rate | [ ] | |
| Remove payee from contributor | /contributors/[id] -> Payees tab -> Remove | [ ] | |
| View payee list | /payees | [ ] | |
| View payee profile (payment method, tax info) | /payees/[id] -> Profile tab | [ ] | |
| View payee contributor relationships | /payees/[id] -> Contributors tab | [ ] | |
| Export contributor data to CSV | /contributors -> Export Filtered or Export All | [ ] | |
| Export financial data to CSV | /contributors -> Export Financial Data button | [ ] | |

### Activity / Audit

| Legacy Workflow | Conductor Equivalent | Verified | Notes |
|----------------|---------------------|----------|-------|
| View platform activity log | /activity | [ ] | |
| Filter activity by entity type | /activity -> Entity Type filter | [ ] | |
| Search activity by entity ID | /activity -> Entity ID search | [ ] | |
| Export activity log to CSV | /activity -> Export CSV button | [ ] | |
| View recent activity on dashboard | / (dashboard) -> Recent Activity widget | [ ] | |

---

## Uppbeat PHP Admin Workflows

### User Management

| Legacy Workflow | Conductor Equivalent | Verified | Notes |
|----------------|---------------------|----------|-------|
| Search users by email | /users -> search bar -> click Search (select Uppbeat platform) | [ ] | |
| Filter users by status | /users -> Status filter dropdown | [ ] | |
| Filter users by subscription tier | /users -> Tier filter dropdown | [ ] | |
| View user profile | /users/[id] -> Profile tab | [ ] | |
| View subscription details | /users/[id] -> Subscription tab | [ ] | |
| View download history | /users/[id] -> Downloads tab | [ ] | |
| Suspend / Unsuspend user | /users/[id] -> Profile tab -> Actions dropdown | [ ] | |
| Issue a refund | /users/[id] -> Subscription tab -> Refund button | [ ] | |
| Export user data to CSV | /users -> Export CSV button | [ ] | |
| Bulk user operations | /users -> select users -> Bulk Actions menu | [ ] | |

### Asset / Catalog Management

| Legacy Workflow | Conductor Equivalent | Verified | Notes |
|----------------|---------------------|----------|-------|
| Search and filter assets | /assets (with Uppbeat platform selected in toggle) | [ ] | |
| Asset approval workflow | /assets/[id] -> Workflow tab | [ ] | |
| Upload new assets | /assets -> Upload Assets button | [ ] | |
| Bulk asset operations | /assets -> select assets -> Bulk Actions menu | [ ] | |

### Contributor / Payee Management

| Legacy Workflow | Conductor Equivalent | Verified | Notes |
|----------------|---------------------|----------|-------|
| Manage contributors | /contributors (with Uppbeat platform selected) | [ ] | |
| Manage payee assignments and rates | /contributors/[id] -> Payees tab | [ ] | |
| Export financial data | /contributors -> Export Financial Data button | [ ] | |

---

## Jordan's Admin (Secondary Uppbeat) Workflows

> **Note:** Jordan's Admin is a secondary Uppbeat PHP/JS admin used for specific admin tasks. During the audit, work with Jordan or the team lead to enumerate the specific workflows used in this system. Use the rows below as a starting template and add/remove as needed.

| Legacy Workflow | Conductor Equivalent | Verified | Notes |
|----------------|---------------------|----------|-------|
| [Workflow 1 — fill in during audit] | [Conductor page/action] | [ ] | |
| [Workflow 2 — fill in during audit] | [Conductor page/action] | [ ] | |
| [Workflow 3 — fill in during audit] | [Conductor page/action] | [ ] | |
| [Workflow 4 — fill in during audit] | [Conductor page/action] | [ ] | |
| [Workflow 5 — fill in during audit] | [Conductor page/action] | [ ] | |

**Instructions:** Before conducting the Jordan's Admin audit:
1. Schedule a walkthrough session with Jordan to identify all workflows actively used
2. Document each workflow in the table above
3. Map each to its Conductor equivalent or flag as a gap
4. Update the "Gaps Identified" section below if any workflow has no Conductor equivalent

---

## Retool Admin Workflows

> **Note:** Retool is used for custom admin tooling. During the audit, review the active Retool apps/dashboards and enumerate what each one does. Use the rows below as a starting template.

| Legacy Workflow | Retool App/Dashboard | Conductor Equivalent | Verified | Notes |
|----------------|---------------------|---------------------|----------|-------|
| [Workflow 1 — fill in during audit] | [App name] | [Conductor page/action] | [ ] | |
| [Workflow 2 — fill in during audit] | [App name] | [Conductor page/action] | [ ] | |
| [Workflow 3 — fill in during audit] | [App name] | [Conductor page/action] | [ ] | |
| [Workflow 4 — fill in during audit] | [App name] | [Conductor page/action] | [ ] | |
| [Workflow 5 — fill in during audit] | [App name] | [Conductor page/action] | [ ] | |

**Instructions:** Before conducting the Retool audit:
1. List all active Retool apps by going to the Retool dashboard
2. For each app, document what business workflow it supports
3. Map each to its Conductor equivalent or flag as a gap
4. Cancelling the Retool subscription is blocked until all workflows are covered

---

## Cross-Cutting Features

These features apply across all platforms and should be verified once (not per-system):

### Global Search & Navigation

| Feature | Conductor Equivalent | Verified | Notes |
|---------|---------------------|----------|-------|
| Search across all entity types at once | Cmd+K (or Search button in header) | [ ] | |
| Navigate directly to a user by ID/email | Cmd+K -> type user email | [ ] | |
| Navigate directly to an asset by title | Cmd+K -> type asset title | [ ] | |
| Navigate directly to a contributor | Cmd+K -> type contributor name | [ ] | |
| View keyboard shortcut reference | Press ? anywhere | [ ] | |
| Switch between Music Vine and Uppbeat | Platform toggle in header | [ ] | |

### Keyboard Shortcuts

| Feature | Shortcut | Verified | Notes |
|---------|----------|----------|-------|
| Open command palette | Cmd+K | [ ] | |
| Go to Dashboard | G D | [ ] | |
| Go to Users | G U | [ ] | |
| Go to Assets | G A | [ ] | |
| Go to Contributors | G C | [ ] | |
| Navigate table rows down | J | [ ] | |
| Navigate table rows up | K | [ ] | |
| Open keyboard shortcut cheat sheet | ? | [ ] | |

### Inline Editing

| Feature | Conductor Equivalent | Verified | Notes |
|---------|---------------------|----------|-------|
| Edit user display name inline in table | /users -> click name cell | [ ] | |
| Edit asset title inline in table | /assets -> click title cell | [ ] | |
| Save edit with Enter, cancel with Escape | Standard inline edit behaviour | [ ] | |

### Contextual Help

| Feature | Conductor Equivalent | Verified | Notes |
|---------|---------------------|----------|-------|
| Tooltips on workflow stage labels | /assets/[id] -> Workflow tab -> hover stage name | [ ] | |
| Help indicators on complex fields | Various forms — look for ? icons | [ ] | |

---

## Gaps Identified

List any legacy workflows that do NOT have a Conductor equivalent. These must be resolved before decommission.

| Gap | Legacy System | Legacy Workflow | Resolution Needed |
|-----|--------------|-----------------|-------------------|
| | | | |

> **If this table has any entries, decommission is BLOCKED until gaps are resolved.**

---

## Sign-Off

All sections above must be fully checked before decommission proceeds.

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Auditor | | | |
| Team Lead | | | |
| Engineering | | | |

Once signed off, update the status at the top of this document from `[ ] INCOMPLETE` to `[x] COMPLETE` and proceed to the decommission runbooks.
