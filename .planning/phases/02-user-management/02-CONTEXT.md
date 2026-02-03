# Phase 2: User Management - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Staff can search, view, and manage all 3M+ user accounts with full CRUD operations through the admin interface. This covers user account operations including search, filtering, viewing details, and performing account management actions. Content management (catalog), payees, and contributors are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Search & Filtering UX
- Quick search bar first approach (single search box at top)
- Search matches against: email address, user ID, name, username
- Immediately visible filters: Account status, Subscription tier
- Search button required to execute (not debounced auto-search or keystroke search)
- Other filters (Platform, Date ranges) available but not prominently displayed

### User List Display
- Essential columns visible: Email + Name, Subscription status
- Compact single-line rows to maximize users visible per screen
- Secondary metadata shown: Last login date
- Row interaction: Both clickable rows (opens detail view) AND actions menu per row (three-dot menu)
- Actions menu provides quick access to common operations without full navigation

### User Detail View
- Tabbed sections layout (not single scroll or sidebar panel)
- **Profile tab:** Basic identity (email, name, username, user ID, platform), Account status (active/suspended with reason/timestamp), OAuth connections (Google/Facebook with disconnect option)
- **Subscription tab:** Current plan details, Billing history, Subscription timeline, Entitlements
- **Downloads + Licenses tab:** Combined view showing both license grants and actual downloads together
- Activity logs and download history presented in integrated timeline

### Account Actions
- Contextual placement per section (Refund in Subscription, Disconnect OAuth in Profile, etc.)
- Simple confirmation dialog for destructive actions (not reason-required modals)
- Available actions: Suspend/Unsuspend, Issue refunds, Disconnect OAuth
- Ban/Unban explicitly NOT included in this phase
- Refunds trigger backend endpoint that handles Stripe payment processing

### Claude's Discretion
- Exact pagination implementation (page size, controls)
- Loading skeleton design for search results
- Error state handling and messaging
- Table sorting behavior (client vs server-side)
- Empty state illustrations and copy
- Exact layout of tabbed content sections
- Success/error toast messages after actions

</decisions>

<specifics>
## Specific Ideas

- Refunds must call backend endpoint for Stripe integration (not handled in frontend)
- Search should support technical lookups (user ID) alongside user-facing identifiers (email, name)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-user-management*
*Context gathered: 2026-02-03*
