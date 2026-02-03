# Conductor Admin

## What This Is

A unified admin interface for Music Vine and Uppbeat staff that replaces 4 legacy systems (3 PHP admins + Retool). Staff can manage user accounts, catalog assets, and contributor/payee relationships through a modern React frontend calling a .NET API. Primary users are customer support and catalog teams (~24 staff members total).

## Core Value

Enable staff to add and manage assets quickly and reliably through a single admin interface, eliminating the need to jump between multiple buggy legacy systems.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**User Management:**
- [ ] View user account details and subscription status
- [ ] Handle refunds and billing issues
- [ ] Manage user licenses and download history
- [ ] Ban/suspend user accounts
- [ ] Disconnect Google OAuth from user accounts ("Un-Google")
- [ ] View user activity logs
- [ ] Impersonate users for support troubleshooting

**Catalog Management:**
- [ ] Asset ingestion via UI upload (→ S3 → ingestion pipeline)
- [ ] Asset ingestion via FTP upload (→ S3 → ingestion pipeline)
- [ ] Multi-stage approval workflow for music assets (multiple reviewers, feedback rounds, contributor communication)
- [ ] Single-stage approval workflow for other asset types (SFX, motion graphics, LUTs, stock footage)
- [ ] Provide reviewer feedback and request changes from contributors
- [ ] Edit asset metadata (titles, tags, genres)
- [ ] Manage platform exclusivity (Music Vine exclusive, Uppbeat exclusive, or shared)
- [ ] Organize assets into collections and playlists
- [ ] Handle asset takedowns and quality issues
- [ ] Support different workflows and metadata for each asset type (music, SFX, motion graphics, LUTs, stock footage)
- [ ] Toggle between Music Vine and Uppbeat contexts for platform-specific data

**Payee/Contributor Management:**
- [ ] Add new contributors
- [ ] Set payout percentage rates for contributors
- [ ] Assign payees to contributors (supporting many-to-many relationships)
- [ ] View payee and contributor relationships

**Authentication & Audit:**
- [ ] Individual staff login credentials (not shared)
- [ ] Audit trail for staff actions

### Out of Scope

- Site content management — Phase 2 (defer but reserve UI space)
- SEO management — Phase 2 (defer but reserve UI space)
- Roles & permissions management — Phase 2 (defer but reserve UI space)
- Real-time collaboration features — Not needed for current workflows
- Mobile app — Staff work from desktop
- Contributor-facing portal — Separate project, contributors use FTP or limited UI upload

## Context

**Current Systems Being Replaced:**
- Music Vine PHP admin: Tech debt, unmaintained language, slow and buggy
- Uppbeat PHP admin: Tech debt, unmaintained language, slow and buggy
- Secondary Uppbeat PHP/JS admin: Has unique features but no interest in supporting
- Retool admin: Modern but third-party dependency we want to eliminate

**Pain Points:**
- Staff must jump between 4 different systems to complete tasks
- Slow, clunky UI across all systems
- Hard to find information
- No bulk operations
- Unreliable and buggy
- Tech debt makes updates infrequent and often breaking
- Shared login credentials (no individual accountability)

**Platform Context:**
- Music Vine: B2B licensing for bigger companies, music only, less actively developed
- Uppbeat: B2C/creators platform, 3M+ customers, 90%+ of dev time, multiple asset types
- Shared data: Payees, contributors, music library (mostly shared with some exclusives)
- Platform-specific: SFX, motion graphics, LUTs, stock footage (Uppbeat only), users (separate per platform)

**Workflows:**
- Highest frequency: Adding new assets to the platform
- Current music ingestion: Contributor uploads to Music Vine admin → manual Google Sheets process → multiple approval rounds → eventually added to Uppbeat
- New ingestion: Contributor uploads via UI or FTP → S3 bucket via API → triggers ingestion → database

**Scale:**
- ~24 staff users
- 3M+ Uppbeat end users
- Thousands of contributors and payees

## Constraints

- **Tech stack**: Next.js 16 (App Router), React 19, TypeScript, Tailwind 4, Shadcn UI, Cadence design system (@music-vine/cadence), React Query, React Hook Form, Zod, Jotai (UI state management) — Company standard, non-negotiable
- **API**: .NET backend built by separate team — Frontend-first approach: mock API calls in frontend, use mocks to generate API requirements for backend team
- **Launch criteria**: Must reach feature parity with existing systems (excluding unused features) before launch — Ensures staff can fully migrate
- **Migration**: Old systems run in parallel during gradual user migration — Cannot be a big-bang cutover
- **Timeline**: Ship when ready — No external deadline pressure

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Frontend-first API design (mock endpoints, generate API requirements from UI) | Enables parallel development with backend team, ensures API matches actual UI needs | — Pending |
| Individual staff logins with audit trails (vs current shared login) | Accountability and security, enables tracking who made which changes | — Pending |
| Platform toggle pattern for Music Vine vs Uppbeat data | Handles shared vs platform-specific data cleanly, lets staff context-switch easily | — Pending |
| Defer content/SEO/permissions to Phase 2 | Focus v1 on highest-value workflows (user, catalog, payee management) to reach launch faster | — Pending |
| Use Cadence design system | Consistency with other Music Vine/Uppbeat products, pre-built components speed development | — Pending |

---
*Last updated: 2026-02-03 after initialization*
