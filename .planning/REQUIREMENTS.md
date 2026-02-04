# Requirements: Conductor Admin

**Defined:** 2026-02-03
**Core Value:** Enable staff to add and manage assets quickly and reliably through a single admin interface

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication & Audit

- [x] **AUTH-01**: Staff can log in with individual credentials (not shared login)
- [x] **AUTH-02**: Staff sessions persist for 8 hours and auto-refresh
- [x] **AUTH-03**: Staff can log out from any page
- [x] **AUTH-04**: All staff actions are logged with audit trail (actor, action, timestamp, resource, before/after state)
- [x] **AUTH-05**: Platform context (Music Vine vs Uppbeat) is set at session level and persists
- [x] **AUTH-06**: Staff can switch between Music Vine and Uppbeat contexts via toggle

### User Management

- [x] **USER-01**: Staff can search and filter user accounts (3M+ users with server-side pagination)
- [x] **USER-02**: Staff can view user account details and subscription status
- [x] **USER-03**: Staff can handle refunds and billing issues for users
- [x] **USER-04**: Staff can manage user licenses and download history
- [x] **USER-05**: Staff can ban or suspend user accounts
- [x] **USER-06**: Staff can disconnect Google OAuth from user accounts ("Un-Google")
- [x] **USER-07**: Staff can view user activity logs
- [x] **USER-08**: Staff can export user data to CSV

### Catalog Management

- [ ] **CATA-01**: Contributors can upload assets via UI (→ S3 → ingestion pipeline)
- [ ] **CATA-02**: Staff can view all submitted assets with server-side pagination and filtering
- [ ] **CATA-03**: Staff can approve assets through multi-stage workflow for music (multiple reviewers, feedback rounds)
- [ ] **CATA-04**: Staff can approve assets through single-stage workflow for SFX, motion graphics, LUTs, stock footage
- [ ] **CATA-05**: Staff can provide reviewer feedback to contributors for resubmission
- [ ] **CATA-06**: Staff can edit asset metadata (titles, tags, genres, descriptions)
- [ ] **CATA-07**: Staff can set platform exclusivity (Music Vine exclusive, Uppbeat exclusive, or shared)
- [ ] **CATA-08**: Staff can organize assets into collections and playlists
- [ ] **CATA-09**: Staff can handle asset takedowns and quality issues
- [ ] **CATA-10**: Each asset type (music, SFX, motion graphics, LUTs, stock footage) has appropriate workflow and metadata fields
- [ ] **CATA-11**: Staff can view approval workflow status and history for any asset
- [ ] **CATA-12**: Staff can export catalog data to CSV

### Payee/Contributor Management

- [ ] **PAYE-01**: Staff can add new contributors
- [ ] **PAYE-02**: Staff can set payout percentage rates for contributors
- [ ] **PAYE-03**: Staff can assign payees to contributors (supporting many-to-many relationships)
- [ ] **PAYE-04**: Staff can view payee and contributor relationships
- [ ] **PAYE-05**: Staff can export financial data to CSV

### Core UX

- [x] **UX-01**: All data tables support server-side sorting, filtering, and pagination
- [x] **UX-02**: Staff can use advanced faceted filtering on data tables
- [ ] **UX-03**: Staff can use global search to find users, assets, contributors, or payees
- [ ] **UX-04**: Staff can export filtered/searched data to CSV
- [x] **UX-05**: All forms have real-time validation with clear error messages
- [x] **UX-06**: All pages have proper loading states (skeletons) and error boundaries
- [ ] **UX-07**: Staff can use command palette (Cmd+K) for navigation and search
- [ ] **UX-08**: Staff can perform bulk operations on selected items with progress tracking
- [ ] **UX-09**: Staff can use keyboard shortcuts for common actions
- [ ] **UX-10**: Empty states provide clear guidance on what to do next

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhanced UX

- **UX-11**: Staff can impersonate users to troubleshoot issues (30-min sessions with audit)
- **UX-12**: Staff can view activity feed of recent changes
- **UX-13**: Staff can use dark mode
- **UX-14**: Staff can save filter presets for reuse
- **UX-15**: Staff can customize column visibility and order per table
- **UX-16**: Staff can edit data inline for quick updates
- **UX-17**: Staff receive smart notifications (in-app and email) for important events

### Content Management

- **CONTENT-01**: Staff can manage site content (CMS functionality)
- **CONTENT-02**: Staff can manage SEO metadata for pages
- **CONTENT-03**: Staff can preview content changes before publishing

### Permissions

- **PERM-01**: Staff can manage roles and permissions
- **PERM-02**: Staff can assign roles to other staff members
- **PERM-03**: Staff can view permission audit logs

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| FTP ingestion frontend | Backend team handles FTP → S3 ingestion, no frontend work needed |
| Real-time collaboration (WebSockets for everything) | Polling (30-60s) sufficient for staff workflows, WebSockets add complexity |
| Native mobile app | Responsive web works on tablets, staff primarily work on desktop |
| Contributor-facing portal | Separate project, contributors use FTP or limited upload UI |
| Advanced analytics dashboards | Admin tools are for doing work, not analyzing work - defer to dedicated analytics |
| Customizable workflows (no-code builder) | Workflow builders are entire products, hard-code known Music Vine/Uppbeat workflows |
| Hyper-granular permissions | Start with 3-5 roles to prevent permission explosion |
| AI-powered features | Unreliable, expensive, high support burden - defer until proven need |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| AUTH-05 | Phase 1 | Complete |
| AUTH-06 | Phase 1 | Complete |
| USER-01 | Phase 2 | Pending |
| USER-02 | Phase 2 | Pending |
| USER-03 | Phase 2 | Pending |
| USER-04 | Phase 2 | Pending |
| USER-05 | Phase 2 | Pending |
| USER-06 | Phase 2 | Pending |
| USER-07 | Phase 2 | Pending |
| USER-08 | Phase 2 | Pending |
| CATA-01 | Phase 4 | Pending |
| CATA-02 | Phase 4 | Pending |
| CATA-03 | Phase 4 | Pending |
| CATA-04 | Phase 4 | Pending |
| CATA-05 | Phase 4 | Pending |
| CATA-06 | Phase 4 | Pending |
| CATA-07 | Phase 4 | Pending |
| CATA-08 | Phase 4 | Pending |
| CATA-09 | Phase 4 | Pending |
| CATA-10 | Phase 4 | Pending |
| CATA-11 | Phase 4 | Pending |
| CATA-12 | Phase 4 | Pending |
| PAYE-01 | Phase 6 | Pending |
| PAYE-02 | Phase 6 | Pending |
| PAYE-03 | Phase 6 | Pending |
| PAYE-04 | Phase 6 | Pending |
| PAYE-05 | Phase 6 | Pending |
| UX-01 | Phase 2 | Pending |
| UX-02 | Phase 2 | Pending |
| UX-03 | Phase 3 | Pending |
| UX-04 | Phase 7 | Pending |
| UX-05 | Phase 1 | Complete |
| UX-06 | Phase 1 | Complete |
| UX-07 | Phase 3 | Pending |
| UX-08 | Phase 5 | Pending |
| UX-09 | Phase 3 | Pending |
| UX-10 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 41 total
- Mapped to phases: 41
- Unmapped: 0

---
*Requirements defined: 2026-02-03*
*Last updated: 2026-02-03 after Phase 1 completion*
