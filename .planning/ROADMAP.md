# Roadmap: Conductor Admin

## Overview

Conductor Admin replaces 4 legacy PHP admin systems with a unified Next.js interface for Music Vine and Uppbeat staff. The roadmap follows a foundation-first approach, establishing authentication, platform context, and shared patterns before building user management, catalog workflows, and payee systems. Each phase delivers complete, verifiable capabilities that staff can use independently.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Infrastructure** - Authentication, platform context, API client, audit framework
- [ ] **Phase 2: User Management** - Staff can search, view, and manage user accounts
- [ ] **Phase 3: Advanced Table Features** - Faceted filtering, virtualization, command palette, keyboard shortcuts
- [ ] **Phase 4: Catalog Management** - Asset ingestion, metadata editing, approval workflows
- [ ] **Phase 5: Bulk Operations** - Async job queue with progress tracking for large-scale operations
- [ ] **Phase 6: Payee & Contributor Management** - Financial relationships and payout management
- [ ] **Phase 7: Enhanced UX & Power Features** - Activity feed, inline editing, export capabilities
- [ ] **Phase 8: Legacy System Migration** - Data migration scripts, parallel operation cutover, system sunset

## Phase Details

### Phase 1: Foundation & Infrastructure
**Goal**: Establish authentication, platform context, API infrastructure, and shared UI patterns that all features depend on
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, UX-05, UX-06
**Success Criteria** (what must be TRUE):
  1. Staff can log in with individual credentials and sessions persist for 8 hours
  2. Staff can switch between Music Vine and Uppbeat contexts via toggle
  3. All staff actions are logged with audit trail (actor, action, timestamp, resource)
  4. Forms have real-time validation with clear error messages
  5. Pages show proper loading states (skeletons) and error boundaries
**Plans**: 10 plans in 5 waves

Plans:
- [ ] 01-01-PLAN.md — Project setup and core dependencies
- [ ] 01-02-PLAN.md — Error boundaries and loading skeletons
- [ ] 01-03-PLAN.md — Session management infrastructure
- [ ] 01-04-PLAN.md — Platform context and theme switching
- [ ] 01-05-PLAN.md — API client and React Query setup
- [ ] 01-06-PLAN.md — Authentication pages (login, magic link, logout)
- [ ] 01-07-PLAN.md — Audit logging infrastructure
- [ ] 01-08-PLAN.md — Form validation components
- [ ] 01-09-PLAN.md — App shell and navigation layout
- [ ] 01-10-PLAN.md — Verification checkpoint

### Phase 2: User Management
**Goal**: Staff can search, view, and manage all user accounts with full CRUD operations
**Depends on**: Phase 1
**Requirements**: USER-01, USER-02, USER-03, USER-04, USER-05, USER-06, USER-07, USER-08, UX-01, UX-02
**Success Criteria** (what must be TRUE):
  1. Staff can search and filter 3M+ user accounts with server-side pagination
  2. Staff can view user details including subscription status, licenses, and download history
  3. Staff can perform account management actions (refunds, ban/suspend, disconnect OAuth)
  4. Staff can view user activity logs and export data to CSV
  5. Data tables support server-side sorting, filtering, and pagination with advanced faceted filtering
**Plans**: TBD

Plans:
- [ ] 02-01: TBD

### Phase 3: Advanced Table Features
**Goal**: All data tables have advanced filtering, virtualization for large datasets, and power-user features
**Depends on**: Phase 2
**Requirements**: UX-03, UX-07, UX-09, UX-10
**Success Criteria** (what must be TRUE):
  1. Staff can use global search to find users, assets, contributors, or payees across the system
  2. Staff can use command palette (Cmd+K) for navigation and quick access to features
  3. Staff can use keyboard shortcuts for common actions to speed up workflows
  4. Empty states provide clear guidance on what to do next
  5. Large lists (10k+ items) render smoothly with virtualization
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

### Phase 4: Catalog Management
**Goal**: Staff can manage complete asset lifecycle from ingestion through approval workflows to publication
**Depends on**: Phase 3
**Requirements**: CATA-01, CATA-02, CATA-03, CATA-04, CATA-05, CATA-06, CATA-07, CATA-08, CATA-09, CATA-10, CATA-11, CATA-12
**Success Criteria** (what must be TRUE):
  1. Contributors can upload assets via UI which flow to S3 and trigger ingestion pipeline
  2. Staff can view all submitted assets with server-side pagination and filtering
  3. Staff can approve music assets through multi-stage workflow with multiple reviewers and feedback rounds
  4. Staff can approve SFX, motion graphics, LUTs, and stock footage through single-stage workflow
  5. Staff can edit asset metadata (titles, tags, genres) and set platform exclusivity
  6. Staff can organize assets into collections and playlists, handle takedowns, and export catalog data
**Plans**: TBD

Plans:
- [ ] 04-01: TBD

### Phase 5: Bulk Operations
**Goal**: Staff can perform large-scale operations on multiple items with async processing and progress tracking
**Depends on**: Phase 4
**Requirements**: UX-08
**Success Criteria** (what must be TRUE):
  1. Staff can select multiple items (select all, shift+click ranges) across filtered datasets
  2. Staff can perform bulk actions (approve, reject, delete, tag, edit metadata) on selected items
  3. Operations on 100+ items run asynchronously with progress tracking (current count, ETA)
  4. Bulk operations handle partial failures gracefully with per-item success/failure tracking
  5. Staff can view bulk operation audit logs showing what changed
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

### Phase 6: Payee & Contributor Management
**Goal**: Staff can manage complete financial relationships between contributors and payees
**Depends on**: Phase 5
**Requirements**: PAYE-01, PAYE-02, PAYE-03, PAYE-04, PAYE-05
**Success Criteria** (what must be TRUE):
  1. Staff can add new contributors with complete profile information
  2. Staff can set payout percentage rates for contributors
  3. Staff can assign payees to contributors supporting many-to-many relationships
  4. Staff can view all payee and contributor relationships with filtering and search
  5. Staff can export financial data to CSV for accounting and reporting
**Plans**: TBD

Plans:
- [ ] 06-01: TBD

### Phase 7: Enhanced UX & Power Features
**Goal**: Power-user features and polish that improve efficiency for daily workflows
**Depends on**: Phase 6
**Requirements**: UX-04
**Success Criteria** (what must be TRUE):
  1. Staff can export filtered/searched data to CSV from any data table
  2. Staff can use activity feed to see recent changes across the system
  3. Staff can edit common fields inline for quick updates without full edit forms
  4. Contextual help and tooltips guide staff through complex workflows
**Plans**: TBD

Plans:
- [ ] 07-01: TBD

### Phase 8: Legacy System Migration
**Goal**: All staff have migrated from legacy PHP admins to Conductor with data consistency validated
**Depends on**: Phase 7
**Requirements**: (None - operational milestone)
**Success Criteria** (what must be TRUE):
  1. Data migration scripts have run successfully with validation checks passing
  2. All staff workflows from legacy systems work in Conductor
  3. Legacy PHP admins (Music Vine, Uppbeat, Secondary Uppbeat) are decommissioned
  4. Retool admin is no longer needed and subscription cancelled
  5. Data consistency monitoring shows no divergence between systems
**Plans**: TBD

Plans:
- [ ] 08-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Infrastructure | 0/10 | Planning complete | - |
| 2. User Management | 0/0 | Not started | - |
| 3. Advanced Table Features | 0/0 | Not started | - |
| 4. Catalog Management | 0/0 | Not started | - |
| 5. Bulk Operations | 0/0 | Not started | - |
| 6. Payee & Contributor Management | 0/0 | Not started | - |
| 7. Enhanced UX & Power Features | 0/0 | Not started | - |
| 8. Legacy System Migration | 0/0 | Not started | - |
