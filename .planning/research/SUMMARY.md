# Project Research Summary

**Project:** Conductor Admin - Internal Admin Tools & Backoffice Systems
**Domain:** React-based admin interface for managing users, catalog assets, and workflows
**Researched:** 2026-02-03
**Confidence:** HIGH

## Executive Summary

Conductor Admin is an internal backoffice system consolidating 4 legacy PHP admin tools for Music Vine and Uppbeat into a unified Next.js 16 application. Modern React admin tools in 2026 follow a "composable" approach - using headless libraries (TanStack Table, React Hook Form) with design system components (shadcn/ui) rather than monolithic frameworks. This aligns perfectly with the locked-in stack (Next.js 16, React 19, TypeScript, Tailwind 4, shadcn/ui, React Query).

The recommended architecture follows a "Backend-for-Frontend" (BFF) pattern with Server Components for initial data loads and React Query for client-side mutations. The critical success factors are: (1) implementing robust contract testing to prevent mock API drift during frontend-first development, (2) designing for production data volumes (3M+ users) from day one with server-side pagination and virtualization, and (3) building comprehensive audit trails for music ingestion approval workflows from Phase 1.

The highest risks are parallel system data divergence (legacy PHP admins running alongside Conductor), feature parity bloat (rebuilding unused features), and approval workflow complexity causing deadlock states. Mitigation requires: explicit data sync architecture, usage auditing before committing to features, and formal state machine design for multi-stage workflows.

## Key Findings

### Recommended Stack

The research validates and extends the locked-in core stack with complementary technologies for admin-specific needs. The "composable" approach (assembling best-of-breed libraries) outperforms monolithic frameworks for this use case.

**Core technologies:**
- **TanStack Table v8.21.3+**: Headless table logic for data grids - industry standard, works with shadcn/ui components, handles sorting/filtering/pagination/grouping
- **TanStack Virtual**: Virtualization for large lists (3M+ users) - only renders visible rows, essential for admin panels with massive datasets
- **Zustand 5.0+**: Global client state (UI state only, not server data) - simpler than Redux, works perfectly with React 19, minimal boilerplate
- **jose 5.9+**: JWT verification in Next.js Server Components/middleware - edge-compatible, fast, secure
- **Vitest 2.1+ / Playwright 1.49+**: Testing stack - Vitest replaces Jest (faster, better DX), Playwright for E2E (more reliable than Cypress)
- **MSW 2.6+**: API mocking - mock .NET API at network level for frontend-first development and testing
- **react-uploady 1.8+**: File upload orchestration - supports chunked uploads for large audio/video files, resumable uploads

**Key architectural decisions:**
- Use native `fetch` (not axios) to maintain Next.js caching/deduplication benefits in Server Components
- Server Components for initial page loads, React Query for client-side updates and mutations
- Server Actions for form submissions and mutations (no API route boilerplate)
- Next.js middleware (proxy.ts in v16) for lightweight auth checks, detailed JWT verification in Server Components

**What NOT to use:**
- Monolithic admin frameworks (react-admin, Refine) - conflicts with composable stack and .NET API integration
- Deprecated libraries (React Table v7, Formik, Yup, Moment.js) - replaced by modern alternatives
- Premature optimizations (WebSockets initially, Redis caching, micro-frontends) - not needed for 24 users

### Expected Features

**Must have (table stakes) - users expect these to exist:**
- Data tables with sorting/filtering/pagination
- User management (CRUD operations)
- Role-Based Access Control (RBAC)
- Search functionality (global and per-table)
- Audit logging for critical actions
- Export capabilities (CSV minimum)
- Responsive design (desktop/tablet focus)
- Authentication (SSO integration)
- Form validation with real-time feedback
- Loading states and error handling

**Should have (competitive advantage) - differentiators:**
- Command Palette (Cmd/Ctrl+K) for power users - 2026 standard for professional tools
- Bulk operations UI with progress tracking - addresses current pain point
- Multi-stage workflow visualization - critical for Music Vine approval flows
- Advanced filtering (faceted search) - essential for large catalogs
- User impersonation for support - faster than screenshots
- Activity feed for recent changes - improves team coordination
- Keyboard shortcuts for common operations
- Customizable views/columns per user
- Inline editing for quick updates

**Defer (v2+) - not essential for launch:**
- Smart notifications (in-app + email) - add after notification overload observed
- Dark mode - low effort but not urgent
- Saved filter presets - add after common patterns emerge
- Real-time everything - use polling (30-60s) initially, add WebSockets only if needed
- AI-powered features - unreliable, expensive, support burden

**Anti-features (commonly requested but problematic):**
- Hyper-granular permissions - leads to permission explosion, start with 3-5 roles
- Advanced analytics dashboards - admin tools are for doing work, not analyzing work
- Customizable workflows (no-code) - workflow builders are entire products, hard-code known workflows
- Native mobile apps - responsive web is sufficient for tablets

### Architecture Approach

Follow a "Server-First with Client Islands" pattern - default to Server Components for data fetching, use Client Components only for interactivity (forms, filters, modals). Next.js acts as Backend-for-Frontend (BFF) layer between React frontend and .NET API, handling auth tokens, platform context (Music Vine vs Uppbeat), and data transformation.

**Major components:**
1. **Platform Context Provider** - manages Music Vine vs Uppbeat tenant switching, ensures all API calls include platform header to prevent data leakage
2. **API Client Layer** - centralized fetch wrapper with auth tokens and platform headers, works in Server Components and Server Actions
3. **Auth Middleware** - Next.js proxy.ts (v16) validates sessions and redirects unauthorized users, detailed JWT verification in Server Components using jose
4. **Feature Modules** - self-contained domains (users, catalog, payees) with colocated pages, components, and Server Actions using route groups
5. **React Query Cache** - manages server state on client, automatic background refetching, optimistic updates for mutations
6. **Audit Framework** - async logging service capturing actor, action, timestamp, resource, context, before/after state for compliance

**Key patterns:**
- Server Components fetch initial data with Next.js caching, Client Components use React Query for updates
- Form handling: React Hook Form (client validation) + Server Actions (server validation + API calls)
- State management hierarchy: React Query for server state, Context API for environment (auth/theme/platform), Zustand for complex UI state, useState for component state
- Multi-tenant: Platform context at session level, validated on every write operation

**Anti-patterns to avoid:**
- API routes as unnecessary proxy (use Server Components to call .NET API directly)
- Client-side data fetching for initial load (slow, no SEO, waterfall requests)
- Mixing state management libraries inconsistently
- Over-abstracting API calls with repositories/DTOs/mappers (keep it simple)
- Global state for server data (belongs in React Query, not Zustand/Redux)

### Critical Pitfalls

1. **Mock API Drift from Backend Reality** - Mock responses diverge from actual .NET API, causing production failures. Mitigation: Contract-first approach with OpenAPI schemas, contract testing (Pact/MSW with validation), weekly integration tests against real backend, backend devs update mocks when API changes.

2. **Performance Collapse Under Real Data Volumes** - Tables work with 50 mock records but fail with 50,000+ real records. Mitigation: Test with 10,000+ records from Day 1, server-side pagination/filtering/sorting (never client-side), database query analysis with EXPLAIN plans, virtualization for long lists, async job queues for bulk operations.

3. **Parallel System Data Divergence** - Legacy PHP admins and Conductor run in parallel but data gets out of sync. Mitigation: Define source of truth for each data type, implement read-through caching, use database triggers/CDC for bidirectional sync, monitor data consistency with health checks, plan cutover weekends (don't run parallel indefinitely).

4. **Feature Parity Becomes Feature Bloat** - Requirement to match 4 legacy systems leads to rebuilding unused features. Mitigation: Audit actual feature usage in legacy systems, categorize as Must/Should/Won't Have, replace "feature parity" with "workflow parity", get stakeholder buy-in to intentionally NOT rebuild unused features.

5. **Insufficient Audit Trails Fail Compliance** - Audit logging added as afterthought, too shallow for music rights management compliance. Mitigation: Design audit schema before features (actor, action, timestamp, resource, context, before/after state), async logging via message queue, searchable logs from day 1, 7-year retention for financial/rights data.

6. **Over-Privileged Permissions Create Security Risks** - Everyone gets admin access "to move fast", never tightened. Mitigation: Design permission model early (3-5 roles), principle of least privilege, separate business roles from system roles, platform context in permission system, quarterly permission audits.

7. **Approval Workflow Complexity Causes Deadlock States** - Music ingestion workflows get stuck in unreachable states. Mitigation: Model workflows as state machines with diagrams BEFORE coding, define behavior for every edge case (timeouts, cancellations, reassignments), implement escalation logic, workflow audit trails, admin override capabilities.

8. **Search and Filter UX Optimized for Developers, Not Staff** - Exact-match search, filters reset after operations, no empty state guidance. Mitigation: Shadow staff using legacy systems, implement fuzzy search, preserve filter state across navigation, show result counts, save filter presets, user test with real staff.

## Implications for Roadmap

Based on research, suggested phase structure prioritizes foundation before features, user management as first feature (establishes patterns), then catalog management (complex workflows), avoiding parallel-system pitfalls throughout.

### Phase 1: Foundation & Infrastructure
**Rationale:** All features depend on authentication, platform context, API client, and audit framework. Build these first to prevent rework. Address mock API drift and performance testing infrastructure before features.

**Delivers:**
- Root layout with navigation and platform switcher (Music Vine vs Uppbeat)
- Auth middleware with session validation and JWT verification (jose)
- Platform Context provider with multi-tenant isolation
- API client layer with auth headers and platform context
- Audit logging framework (async, searchable)
- Shared UI component library (shadcn/ui setup)
- Loading/error state templates
- Performance testing infrastructure (seed 10k+ records)
- Contract testing setup (MSW with schema validation)

**Addresses features:**
- Authentication (SSO integration)
- RBAC foundation
- Audit logging capability

**Avoids pitfalls:**
- Mock API drift (contract testing from start)
- Over-privileged permissions (RBAC designed early)
- Insufficient audit trails (framework before features)
- Performance collapse (testing infrastructure before data-heavy features)

**Research flag:** Standard patterns, skip deep research. Next.js auth and multi-tenant patterns are well-documented.

---

### Phase 2: User Management (First Feature)
**Rationale:** User management is the simplest feature (standard CRUD) and establishes patterns for forms, tables, filtering, and Server Actions that other features will follow. Low complexity allows validating foundation architecture.

**Delivers:**
- User list page with TanStack Table (sortable, filterable, paginated)
- Server-side pagination and filtering
- User detail/edit pages with React Hook Form + Zod validation
- User CRUD operations via Server Actions
- Basic search (global and per-table)
- Export to CSV
- Form validation with error handling
- Loading skeletons and error boundaries

**Addresses features:**
- User management (CRUD)
- Data tables with sorting/filtering
- Search functionality
- Export capabilities
- Form validation

**Uses stack:**
- TanStack Table for data grids
- React Hook Form + Zod for forms
- Server Actions for mutations
- React Query for client-side updates

**Research flag:** Standard patterns, skip research. CRUD operations and data tables are well-established.

---

### Phase 3: Advanced Table Features & Filtering
**Rationale:** After basic tables work, add capabilities needed for large datasets before tackling catalog (which has 100k+ tracks). Prevents performance collapse when real data loads.

**Delivers:**
- Advanced filtering (faceted search) with result counts
- Filter state persistence across navigation
- Saved filter presets per user
- Virtualization for large lists (TanStack Virtual)
- Command Palette (Cmd+K) for search and navigation
- Keyboard shortcuts for common operations
- Customizable column visibility

**Addresses features:**
- Advanced filtering (faceted search)
- Command Palette
- Keyboard shortcuts
- Customizable views

**Uses stack:**
- TanStack Virtual for list virtualization
- Zustand for filter/selection state

**Avoids pitfalls:**
- Performance collapse (virtualization before catalog)
- Poor search/filter UX (fuzzy search, state persistence)

**Research flag:** Standard patterns, skip research. Faceted filtering and command palettes are well-documented UX patterns.

---

### Phase 4: Catalog Management & Approval Workflows
**Rationale:** Most complex feature - multi-stage approval workflows, file uploads, asset ingestion. Built after table/filter patterns established and performance infrastructure proven. Requires careful state machine design.

**Delivers:**
- Catalog structure (tracks, albums, playlists)
- Asset ingestion (upload + FTP integration)
- Multi-stage approval workflow with state machine
- Workflow visualization (pipeline/Kanban view)
- File upload with chunking for large audio/video files
- Approval actions with permission checks
- Workflow audit trail with before/after states
- Workflow timeout and escalation logic

**Addresses features:**
- Asset ingestion
- Multi-stage approval workflow
- Workflow visualization
- File uploads

**Uses stack:**
- react-uploady for chunked file uploads
- TanStack Table for track lists
- State machine for workflow logic

**Implements architecture:**
- Workflow state machine component
- Async file processing
- Complex audit trail capture

**Avoids pitfalls:**
- Approval workflow deadlocks (state machine design upfront)
- Insufficient audit trails (comprehensive logging for approvals)
- Feature parity bloat (focus on active workflows only)

**Research flag:** NEEDS RESEARCH. Complex approval workflows, multi-stage state machines, and audio file processing require phase-specific research on:
- Music ingestion workflow patterns (rights management, metadata validation)
- Approval workflow state machine design
- Large file upload strategies (resumable, chunked)
- Audio file processing and validation

---

### Phase 5: Bulk Operations & Background Jobs
**Rationale:** Bulk operations are current pain point but require async job infrastructure. Built after single-item operations are stable and proven.

**Delivers:**
- Bulk selection UI (select all, shift+click ranges)
- Bulk actions (approve, reject, delete, tag)
- Async job queue for operations >100 items
- Progress tracking UI (current item count, ETA)
- Partial failure handling (per-item success/failure tracking)
- Rollback/undo capabilities
- Bulk operation audit logging

**Addresses features:**
- Bulk operations UI
- Progress tracking

**Uses stack:**
- Job queue system (BullMQ or pg-boss)
- WebSockets or polling for progress updates

**Avoids pitfalls:**
- Performance collapse (async jobs prevent timeouts)
- Approval workflow deadlocks (bulk with partial failure handling)

**Research flag:** NEEDS RESEARCH. Job queue patterns, progress tracking, and partial failure recovery require phase-specific research on:
- Node.js job queue libraries (BullMQ vs pg-boss)
- Progress tracking patterns for long-running operations
- Rollback/undo strategies for bulk operations

---

### Phase 6: Payee Management
**Rationale:** Similar to user management but may require payment system integrations. Built after core patterns established.

**Delivers:**
- Payee CRUD operations
- Payment history tables
- Contributor management
- Export financial data

**Addresses features:**
- Payee/contributor management
- Export capabilities

**Research flag:** Likely standard patterns, but payment system integration may need specific research if integrations required.

---

### Phase 7: Enhanced UX & Power Features
**Rationale:** Polish phase after core workflows proven. Adds quality-of-life features based on actual usage patterns.

**Delivers:**
- User impersonation (view-as) with 30-min sessions
- Activity feed for recent changes
- Inline editing for quick updates
- Contextual help and tooltips
- Dark mode
- Smart notifications (in-app + email)

**Addresses features:**
- User impersonation
- Activity feed
- Inline editing
- Dark mode
- Smart notifications

**Avoids pitfalls:**
- Over-privileged permissions (impersonation with strict audit logging)

**Research flag:** Standard patterns for most features. User impersonation security may need specific review.

---

### Phase 8: Legacy System Migration & Sunset
**Rationale:** After all features proven in production, systematically migrate data and sunset legacy PHP admins.

**Delivers:**
- Data migration scripts with validation
- Parallel operation cutover per module
- Legacy system decommissioning
- Monitoring for data consistency during migration

**Avoids pitfalls:**
- Parallel system data divergence (cutover strategy, sync removal)

**Research flag:** NEEDS RESEARCH. Legacy system migration patterns require phase-specific research on:
- PHP to Next.js data migration strategies
- Zero-downtime cutover techniques
- Rollback plans if migration fails

---

### Phase Ordering Rationale

**Why foundation first:**
- Authentication, platform context, and API client are dependencies for every feature
- Audit framework must be designed before approval workflows (compliance-critical)
- Performance testing infrastructure prevents discovering scaling issues in production

**Why user management as first feature:**
- Simplest domain (standard CRUD) validates architecture patterns
- Establishes form, table, and Server Action patterns for later features
- Low risk - if patterns need refinement, easiest place to iterate

**Why advanced tables before catalog:**
- Catalog has 100k+ tracks, requires virtualization and advanced filtering
- Testing table performance with user data (3M+ records) proves infrastructure
- Command palette and keyboard shortcuts benefit all features if built early

**Why catalog after infrastructure proven:**
- Most complex feature (multi-stage workflows, file uploads, state machines)
- Building after patterns established reduces risk
- Approval workflows need mature audit framework

**Why bulk operations after single-item operations:**
- Bulk operations are "single operations × N" with added complexity
- Async job infrastructure is significant architectural addition
- Validating patterns with single items prevents amplifying bad patterns

**Why payees after core workflows:**
- Similar to user management but lower priority
- May require payment system integrations (research needed)
- Benefits from established patterns

**Why polish features last:**
- User impersonation and activity feed need mature audit trails
- Dark mode and notifications are quality-of-life, not blockers
- Informed by actual usage patterns from earlier phases

**Why legacy migration last:**
- All features must be proven in production before cutover
- Parallel operation is temporary risk - minimize duration
- Systematic per-module cutover reduces risk

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 4 (Catalog & Approval Workflows):** Complex domain - music ingestion, rights management, multi-stage approval state machines, audio file processing
- **Phase 5 (Bulk Operations):** Job queue architecture, progress tracking, partial failure recovery
- **Phase 8 (Legacy Migration):** PHP to Next.js migration strategies, zero-downtime cutover

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Foundation):** Next.js auth, multi-tenant patterns well-documented
- **Phase 2 (User Management):** CRUD operations, standard patterns
- **Phase 3 (Advanced Tables):** Faceted filtering, command palettes established UX
- **Phase 6 (Payee Management):** Similar to user management unless payment integrations needed
- **Phase 7 (Enhanced UX):** Standard polish features

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All recommendations verified with official docs, Context7 research, and 2026 community consensus. React 19 compatibility confirmed for all libraries. |
| Features | HIGH | Cross-referenced admin tool patterns across multiple authoritative sources (WeWeb, Retool, react-admin). MVP features match industry table stakes. |
| Architecture | HIGH | Based on official Next.js documentation and verified 2026 patterns. BFF pattern and Server Components approach are standard for React admin tools with external APIs. |
| Pitfalls | HIGH | Research drew from real-world migration case studies, enterprise admin tool best practices, and documented anti-patterns. Pitfall-to-phase mapping validated against dependency analysis. |

**Overall confidence:** HIGH

All research areas have high confidence due to authoritative sources (official documentation, established frameworks, verified community patterns). The locked-in core stack (Next.js 16, React 19, TypeScript, shadcn/ui) has strong ecosystem support and documented patterns for admin tools.

### Gaps to Address

**During Phase 4 planning:**
- Specific Music Vine approval workflow requirements - research documented general multi-stage patterns but actual business rules need definition
- Audio file format validation and metadata extraction - may need domain-specific libraries
- Rights management audit trail requirements - ensure audit framework captures all necessary fields

**During Phase 5 planning:**
- Job queue selection (BullMQ vs pg-boss) - both viable, decision depends on Redis availability and existing infrastructure
- Progress tracking strategy (WebSockets vs polling) - depends on concurrent user count and infrastructure

**During Phase 8 planning:**
- Legacy PHP admin database schema analysis - research assumed standard tables but actual schema may have quirks
- Data migration validation strategy - need to define acceptance criteria for "data is in sync"
- Rollback procedures if migration fails - research covered patterns but specific rollback plan needs definition

**Platform switching complexity:**
- Research assumes Music Vine and Uppbeat contexts are cleanly separated, but may discover shared data or workflows during implementation that complicate isolation

**No critical gaps identified.** All gaps are implementation details that should be resolved during phase-specific planning, not blockers to roadmap creation.

## Sources

### Primary (HIGH confidence)
- **Next.js Official Docs:** App Router, Server Components, data fetching, authentication patterns (Next.js 16)
- **TanStack Documentation:** React Query v5, React Table v8, React Virtual - official integration guides
- **shadcn/ui Data Table Guide:** Integration patterns with TanStack Table
- **React Hook Form & Zod Official Docs:** Form validation patterns with Server Actions
- **Vitest & Playwright Official Docs:** Testing strategies for React 19 and Next.js

### Secondary (MEDIUM confidence)
- **WeWeb Admin Dashboard Guide 2026:** Modern admin tool patterns and best practices
- **Syncfusion React Data Grid Libraries 2025:** Comparative analysis of table libraries
- **State Management in 2025 Articles:** Zustand vs Jotai vs Redux analysis
- **Shopify Bulk Operations API Docs:** Real-world bulk operation patterns for large datasets
- **Adobe Workfront / Cflow Workflow Docs:** Multi-stage approval workflow patterns
- **Harness / Descope User Impersonation Guides:** Security best practices for impersonation features

### Tertiary (context-informing)
- **React-admin Architecture Docs:** Admin framework patterns (informing anti-patterns to avoid)
- **Internal Tools Development Guides 2026:** Common mistakes in backoffice systems
- **Legacy System Migration Case Studies:** Parallel operation and cutover strategies
- **Enterprise Filtering UX Patterns:** Faceted search and advanced filtering best practices

---
*Research completed: 2026-02-03*
*Ready for roadmap: yes*
