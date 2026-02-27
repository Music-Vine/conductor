# Phase 8: Legacy System Migration - Context

**Gathered:** 2026-02-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire up Conductor to real backend endpoints (replacing mock data), validate all workflows with real data, run a parallel read-only period, then coordinate a big-bang staff cutover and sequential decommission of legacy admin systems. This phase does NOT move or migrate database data — the underlying Music Vine and Uppbeat databases stay in place; only the admin UI applications are retired.

</domain>

<decisions>
## Implementation Decisions

### What "migration" means
- Backend team builds real API endpoints that mirror what Conductor's mock routes currently provide
- Conductor switches from mock routes to real endpoints via environment variable (`NEXT_PUBLIC_USE_REAL_API=true`)
- No data copying, ETL scripts, or database migration — the existing databases remain the source of truth
- Music Vine and Uppbeat data stays platform-scoped (separate DBs), matching Conductor's existing platform toggle

### Feature flag approach
- Single environment variable: `NEXT_PUBLIC_USE_REAL_API=true` in deployment config
- Default (false) = mock data for local development
- Cutover = redeploy with the env var flipped to true
- Rollback = redeploy with env var flipped back — instant, no data risk

### Data shape contract
- Conductor adapts to real data shape, not the other way around
- If real backend data shape differs from current TypeScript types, Conductor's types/components are updated to match
- The existing system serves millions of users — Conductor accommodates it, not vice versa
- Mismatches discovered during integration should trigger Conductor code changes, not backend changes

### Cutover strategy
- Big-bang: all staff switch to Conductor at once on a single coordinated date
- Pre-cutover: legacy systems go read-only (not shut down) — staff can reference legacy but must write via Conductor
- Cutover gates (all required):
  1. Automated smoke tests, feature parity audit, and data integrity checks all pass
  2. Dedicated UAT session with actual staff confirms their workflows work end-to-end
  3. Team lead sign-off from both Music Vine and Uppbeat teams

### Validation requirements
- **Smoke tests**: every Conductor screen/endpoint loads and displays real data correctly
- **Feature parity audit**: checklist confirming every legacy workflow is achievable in Conductor
- **Data integrity checks**: real data edge cases (null fields, unusual formats, very large datasets) don't break UI components

### Rollback plan
- If issues arise post-cutover: flip `NEXT_PUBLIC_USE_REAL_API` back to false — instant rollback to mock data
- Parallel read-only period acts as the safety net before legacy systems are shut down

### Decommission order
Legacy systems shut down in this sequence once each passes the decommission gates:
1. **Jordan's Admin** (Secondary Uppbeat admin) — first to go
2. **Retool** — second (also eliminates subscription cost)
3. **Music Vine PHP admin** and **Uppbeat PHP admin** — last

Decommission gates for each system (all required):
- Usage access logs show zero active staff usage for a defined period
- Relevant team lead confirms their team no longer needs it
- Read-only parallel period has elapsed with no issues raised

### Data archival
- No archival needed — all legacy admin apps share the same underlying Music Vine and Uppbeat databases
- Decommissioning = shutting down the admin application, not touching the database
- Databases remain live, serving the main product

### Claude's Discretion
- Exact parallel period duration (how many days read-only before full shutdown)
- Specific smoke test tooling and implementation approach
- Format and structure of the feature parity audit checklist
- How to surface legacy-specific warnings or guidance in Conductor during the transition

</decisions>

<specifics>
## Specific Ideas

- "Jordan's Admin" is the informal name for the Secondary Uppbeat admin — decommission this first
- Retool cancellation is explicitly called out as a success criterion (subscription cost savings)
- The backend team is responsible for building the real endpoints; Conductor's job is wiring them up and adapting to the real data shapes

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 08-legacy-system-migration*
*Context gathered: 2026-02-27*
