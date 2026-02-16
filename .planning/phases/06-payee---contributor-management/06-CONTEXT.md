# Phase 6: Payee & Contributor Management - Context

**Gathered:** 2026-02-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Staff can manage complete financial relationships between contributors (content creators) and payees (payment recipients). This includes creating contributors with profile information, assigning payees to contributors, setting payout percentage rates, viewing relationships with filtering/search, and exporting financial data to CSV.

Scope: Relationship management, rate tracking, and basic earnings visibility. Does not include automated payout processing (handled by Tipalti) or contributor self-service portals (future phase).

</domain>

<decisions>
## Implementation Decisions

### Payout Split Mechanics
- Rates have two levels: default rate per contributor, with ability to override per contributor-payee relationship
- Validation allows less than 100% total (remainder goes to company/platform)
- Rate history tracked with effective dates - changes create new rate record starting today
- Staff-only management - contributors cannot self-manage relationships in this phase

### Profile Requirements
- Contributors mandatory fields: name, email, default payout rate, payment details
- Payees have two entity types: individual and company (different required fields per type)
- Payment processing handled by Tipalti - admin stores basic contact info and address only
- Payee IDs in Conductor link directly to Tipalti (same ID, no separate Tipalti-specific field)

### Financial Visibility
- Display earnings calculations with multiple views:
  - Summary totals (e.g., "Total earnings: $X")
  - Pending vs historical split (unpaid vs paid amounts)
  - Per-asset breakdown (earnings per song/asset)
- Date filtering with both custom date picker and preset periods (This month, Last quarter, etc.)
- Phase 6 uses mock earnings data - real data integration deferred to later phase
- Real earnings data source: In-house attribution calculation system (not Tipalti)
- Tipalti receives payout amounts from Conductor but doesn't calculate earnings

### Management Workflow
- Contributor-first workflow: Create contributor, then assign payees to them
- Payee assignment via modal: "Add Payee" button → modal with search/select → set rate
- Inline editing for rates directly in payee table on contributor detail page
- Inline rate edit creates new rate effective today, preserving historical rate records

### Claude's Discretion
- Empty state designs for lists with no data
- Exact table column layout and widths
- Loading states and error messages
- CSV export filename format and column ordering

</decisions>

<specifics>
## Specific Ideas

- Follow Phase 2 user management patterns for contributor/payee list pages (virtualized tables, search, filters)
- Inline editing pattern similar to Phase 7 power features (if available), or simple edit-in-place with save/cancel
- Rate validation should show warning if total < 100% but allow saving (informational, not blocking)
- Modal for payee assignment should support both selecting existing payee and creating new one inline

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

*Phase: 06-payee---contributor-management*
*Context gathered: 2026-02-16*
