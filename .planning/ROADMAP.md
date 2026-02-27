# Roadmap: Conductor Admin

## Overview

Conductor Admin replaces 4 legacy PHP admin systems with a unified Next.js interface for Music Vine and Uppbeat staff. The roadmap follows a foundation-first approach, establishing authentication, platform context, and shared patterns before building user management, catalog workflows, and payee systems. Each phase delivers complete, verifiable capabilities that staff can use independently.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Infrastructure** - Authentication, platform context, API client, audit framework
- [x] **Phase 2: User Management** - Staff can search, view, and manage user accounts
- [x] **Phase 3: Advanced Table Features** - Faceted filtering, virtualization, command palette, keyboard shortcuts
- [ ] **Phase 4: Catalog Management** - Asset ingestion, metadata editing, approval workflows
- [x] **Phase 5: Bulk Operations** - Async job queue with progress tracking for large-scale operations
- [ ] **Phase 6: Payee & Contributor Management** - Financial relationships and payout management
- [x] **Phase 7: Enhanced UX & Power Features** - Activity feed, inline editing, export capabilities
- [ ] **Phase 8: Legacy System Migration** - BFF proxy integration, smoke tests, decommission runbooks

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
**Plans**: 15 plans in 6 waves

Plans:
- [x] 01-01-PLAN.md — Project setup and core dependencies
- [x] 01-02-PLAN.md — Error boundaries and loading skeletons
- [x] 01-03-PLAN.md — Session management infrastructure
- [x] 01-04-PLAN.md — Platform context and theme switching
- [x] 01-05-PLAN.md — API client and React Query setup
- [x] 01-06-PLAN.md — Authentication pages (login, magic link, logout)
- [x] 01-07-PLAN.md — Audit logging infrastructure
- [x] 01-08-PLAN.md — Form validation components
- [x] 01-09-PLAN.md — App shell and navigation layout
- [x] 01-10-PLAN.md — Verification checkpoint
- [x] 01-12-PLAN.md — Cadence design system setup
- [x] 01-11-PLAN.md — Gap closure with Cadence components
- [x] 01-13-PLAN.md — Complete Cadence migration and brand colors
- [x] 01-14-PLAN.md — Downgrade to Tailwind v3 for Cadence compatibility
- [x] 01-15-PLAN.md — Fix color palette to use Cadence colors

### Phase 2: User Management
**Goal**: Staff can search, view, and manage all user accounts with full CRUD operations
**Depends on**: Phase 1
**Requirements**: USER-01, USER-02, USER-03, USER-04, USER-05, USER-06, USER-07, USER-08, UX-01, UX-02
**Success Criteria** (what must be TRUE):
  1. Staff can search and filter 3M+ user accounts with server-side pagination
  2. Staff can view user details including subscription status, licenses, and download history
  3. Staff can perform account management actions (refunds, suspend, disconnect OAuth)
  4. Staff can view user activity logs and export data to CSV
  5. Data tables support server-side sorting, filtering, and pagination
**Plans**: 11 plans in 5 waves

Plans:
- [x] 02-01-PLAN.md — User types and mock API routes
- [x] 02-02-PLAN.md — Install Phase 2 dependencies (TanStack Table, Radix UI, Sonner)
- [x] 02-03-PLAN.md — User list page with search and filters
- [x] 02-04-PLAN.md — User table with TanStack Table pagination
- [x] 02-05-PLAN.md — User detail page with Radix tabs
- [x] 02-06-PLAN.md — Profile tab and OAuth disconnect
- [x] 02-07-PLAN.md — Subscription tab and refunds
- [x] 02-08-PLAN.md — Downloads + Licenses tab
- [x] 02-09-PLAN.md — Suspend/unsuspend actions and row actions menu
- [x] 02-10-PLAN.md — CSV export functionality
- [x] 02-11-PLAN.md — Human verification checkpoint

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
**Plans**: 11 plans in 5 waves

Plans:
- [x] 03-01-PLAN.md — Install Phase 3 dependencies (TanStack Virtual, cmdk, react-hotkeys-hook, fuse.js)
- [x] 03-02-PLAN.md — Keyboard shortcuts infrastructure (definitions, provider, hooks)
- [x] 03-03-PLAN.md — Command palette core with navigation
- [x] 03-04-PLAN.md — Empty state components
- [x] 03-05-PLAN.md — Virtualized table hook
- [x] 03-06-PLAN.md — Global search API and hook
- [x] 03-07-PLAN.md — Update UserTable with virtualization
- [x] 03-08-PLAN.md — Table keyboard navigation
- [x] 03-09-PLAN.md — Command palette search integration
- [x] 03-10-PLAN.md — Header search button and keyboard cheat sheet
- [x] 03-11-PLAN.md — Human verification checkpoint

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
**Plans**: 15 plans in 7 waves

Plans:
- [x] 04-01-PLAN.md — Asset types, workflow states, and transition logic
- [x] 04-02-PLAN.md — Install Phase 4 dependencies (Uppy, WaveSurfer, react-dropzone)
- [x] 04-03-PLAN.md — Mock API routes for assets and workflow actions
- [x] 04-04-PLAN.md — Mock upload infrastructure (presigned URLs, multipart)
- [x] 04-05-PLAN.md — Client-side file validation and metadata extraction
- [x] 04-06-PLAN.md — Upload hooks and components (Uppy, dropzone, file list)
- [x] 04-07-PLAN.md — Asset list page with virtualized table and filters
- [x] 04-08-PLAN.md — Asset upload page with metadata form
- [x] 04-09-PLAN.md — Asset detail page with tabs
- [x] 04-10-PLAN.md — Audio waveform player and video player components
- [x] 04-11-PLAN.md — Workflow timeline and approval form
- [x] 04-12-PLAN.md — Collections management (CRUD, asset membership)
- [x] 04-13-PLAN.md — Activity tab and global search integration
- [x] 04-14-PLAN.md — Human verification checkpoint
- [x] 04-15-PLAN.md — Gap closure: Audio waveform error handling and sample URLs

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
**Plans**: 8 plans in 5 waves

Plans:
- [x] 05-01-PLAN.md — Bulk selection state and hook (Jotai persistence)
- [x] 05-02-PLAN.md — Mock bulk operation API routes with SSE streaming
- [x] 05-03-PLAN.md — Progress tracking hook and floating action bar
- [x] 05-04-PLAN.md — Confirmation dialogs (simple + type-to-confirm)
- [x] 05-05-PLAN.md — AssetTable bulk operations integration
- [x] 05-06-PLAN.md — UserTable bulk operations integration
- [x] 05-07-PLAN.md — Bulk audit logging
- [x] 05-08-PLAN.md — Human verification checkpoint

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
**Plans**: 8 plans in 5 waves

Plans:
- [x] 06-01-PLAN.md — Financial types and validation schemas
- [x] 06-02-PLAN.md — Mock API routes for contributors, payees, and relationships
- [x] 06-03-PLAN.md — API client and contributor list page with table and filters
- [x] 06-04-PLAN.md — Contributor detail page with profile, payees, and assets tabs
- [x] 06-05-PLAN.md — Payee list page and payee detail page
- [x] 06-06-PLAN.md — Contributor/payee creation forms and payee assignment with rate validation
- [x] 06-07-PLAN.md — CSV export, sidebar navigation, and global search integration
- [x] 06-08-PLAN.md — Human verification checkpoint

### Phase 7: Enhanced UX & Power Features
**Goal**: Power-user features and polish that improve efficiency for daily workflows
**Depends on**: Phase 6
**Requirements**: UX-04
**Success Criteria** (what must be TRUE):
  1. Staff can export filtered/searched data to CSV from any data table
  2. Staff can use activity feed to see recent changes across the system
  3. Staff can edit common fields inline for quick updates without full edit forms
  4. Contextual help and tooltips guide staff through complex workflows
**Plans**: 8 plans in 3 waves

Plans:
- [x] 07-01-PLAN.md — Activity types, API route, and client functions
- [x] 07-02-PLAN.md — InlineEditField component and PATCH routes
- [x] 07-03-PLAN.md — Contextual help tooltips (provider, component, placement)
- [x] 07-04-PLAN.md — "Export All" upgrade for existing export buttons
- [x] 07-05-PLAN.md — Activity dashboard widget and full Activity page
- [x] 07-06-PLAN.md — Inline editing integration (detail pages and table rows)
- [x] 07-07-PLAN.md — Collections table and CSV exports for collections and activity
- [x] 07-08-PLAN.md — Human verification checkpoint

### Phase 8: Legacy System Migration
**Goal**: All route handlers support conditional BFF proxying to real backend, with smoke tests and decommission documentation ready for cutover
**Depends on**: Phase 7
**Requirements**: (None - operational milestone)
**Success Criteria** (what must be TRUE):
  1. All route handlers conditionally proxy to real backend when NEXT_PUBLIC_USE_REAL_API=true
  2. All staff workflows from legacy systems work in Conductor
  3. Legacy PHP admins (Music Vine, Uppbeat, Secondary Uppbeat) have decommission runbooks
  4. Retool admin has decommission runbook with subscription cancellation step
  5. Smoke tests validate every major screen loads real data without errors
**Plans**: 9 plans in 4 waves

Plans:
- [ ] 08-01-PLAN.md — Proxy infrastructure (shared helper, env vars, middleware-to-proxy codemod)
- [ ] 08-02-PLAN.md — Users domain proxy integration (10 routes)
- [ ] 08-03-PLAN.md — Assets core proxy integration (list, detail, workflow, actions)
- [ ] 08-04-PLAN.md — Assets upload and bulk proxy integration (presigned, multipart, bulk)
- [ ] 08-05-PLAN.md — Contributors and payees proxy integration (7 routes)
- [ ] 08-06-PLAN.md — Collections and cross-cutting proxy integration (collections, activity, search, audit, financials)
- [ ] 08-07-PLAN.md — Feature parity audit and decommission runbooks
- [ ] 08-08-PLAN.md — Playwright smoke tests setup and writing
- [ ] 08-09-PLAN.md — Human verification checkpoint

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Infrastructure | 15/15 | Complete | 2026-02-03 |
| 2. User Management | 11/11 | Complete | 2026-02-04 |
| 3. Advanced Table Features | 11/11 | Complete | 2026-02-04 |
| 4. Catalog Management | 15/15 | Complete | 2026-02-11 |
| 5. Bulk Operations | 8/8 | Complete | 2026-02-23 |
| 6. Payee & Contributor Management | 8/8 | Complete | 2026-02-27 |
| 7. Enhanced UX & Power Features | 8/8 | Complete | 2026-02-27 |
| 8. Legacy System Migration | 0/9 | Not started | - |
