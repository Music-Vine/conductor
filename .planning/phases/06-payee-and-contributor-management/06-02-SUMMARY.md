---
phase: 06-payee-and-contributor-management
plan: 02
subsystem: api
tags: [mock-api, contributors, payees, financial-export, middleware, next-js, typescript]

# Dependency graph
requires:
  - phase: 02-user-management
    provides: Mock API patterns (pagination, filtering, seeded data generation, latency simulation)
  - phase: 04-asset-management
    provides: Asset types and workflow states referenced in contributor assets route
provides:
  - GET/POST /api/contributors with search, status filter, pagination (20 mock contributors)
  - GET/PUT /api/contributors/[id] full contributor detail with address, phone, taxId
  - GET/POST /api/contributors/[id]/payees with 100% rate sum validation
  - GET /api/contributors/[id]/assets returning 5-15 seeded assets per contributor
  - GET/POST /api/payees with search, status, paymentMethod filter, pagination (10 mock payees)
  - GET/PUT /api/payees/[id] full payee detail with payment details and address
  - GET /api/payees/[id]/contributors for reverse contributor lookup
  - GET /api/financials/export returning 41 flat rows with decimal rates (0.00-1.00)
  - Middleware updated with /api/contributors, /api/payees, /api/financials in PUBLIC_PATHS
affects:
  - 06-03 and beyond (UI components for contributor/payee list views)
  - Phase 7+ financial reporting and CSV export features

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Deterministic seeded data generation using integer math (no Math.random) for reproducible mock output
    - Contributor-payee rate configs expressed as pre-defined arrays ensuring sum = 100% by construction
    - Decimal conversion (rate / 100) only at export boundary; integer storage throughout
    - Next.js 15 async params pattern `{ params: Promise<{ id: string }> }` for all dynamic routes

key-files:
  created:
    - src/app/api/contributors/route.ts
    - src/app/api/contributors/[id]/route.ts
    - src/app/api/contributors/[id]/payees/route.ts
    - src/app/api/contributors/[id]/assets/route.ts
    - src/app/api/payees/route.ts
    - src/app/api/payees/[id]/route.ts
    - src/app/api/payees/[id]/contributors/route.ts
    - src/app/api/financials/export/route.ts
  modified:
    - src/middleware.ts

key-decisions:
  - "Deterministic seed generation using integer arithmetic (no Math.random) for reproducible mock data across all routes"
  - "Rate configs (RATE_CONFIGS) pre-defined as arrays ensuring 100% sum by construction, not by runtime validation"
  - "Financial export uses decimal rates (0.00-1.00) for accounting compatibility; all other routes use integer rates (0-100)"
  - "Contributor status distribution: 18 active, 1 pending (contrib-019), 1 inactive (contrib-020)"
  - "Payee payment methods: 4 ACH, 3 PayPal, 2 wire, 1 check per task specification"
  - "POST /api/contributors/[id]/payees returns helpful error message showing remaining/excess percentage"

patterns-established:
  - "Pre-defined rate config arrays for guaranteed sum correctness without runtime floating-point issues"
  - "Deterministic mock data using `BASE_EPOCH + (seed * multiplier)` for timestamp generation"
  - "Async params destructuring: `const { id } = await params` for Next.js 15 compatibility"

# Metrics
duration: 5min
completed: 2026-02-23
---

# Phase 6 Plan 2: Payee and Contributor Management API Routes Summary

**Mock REST API for contributors, payees, and financial relationships with guaranteed 100%-sum rate validation and accounting-compatible decimal export**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-23T11:27:22Z
- **Completed:** 2026-02-23T11:32:00Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Complete mock API for contributor CRUD (list, create, detail, update) with 20 seeded contributors
- Complete mock API for payee CRUD (list, create, detail, update) with 10 seeded payees across 4 payment methods
- Contributor-payee relationship routes with guaranteed 100% rate sum validation (verified all 20 contributors)
- Financial export returning 41 flat rows with decimal percentageRate (0.00-1.00) for accounting system compatibility
- Middleware updated to allow unauthenticated access to all three new API prefixes

## Task Commits

Each task was committed atomically:

1. **Task 1: Create contributor and payee mock API routes** - `fbdf584` (feat)
2. **Task 2: Create relationship routes, financial export, and update middleware** - `7f1fbab` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/app/api/contributors/route.ts` - GET list with search/status/pagination, POST create
- `src/app/api/contributors/[id]/route.ts` - GET detail with address/phone/taxId, PUT update
- `src/app/api/contributors/[id]/payees/route.ts` - GET relationships, POST with 100% sum validation
- `src/app/api/contributors/[id]/assets/route.ts` - GET 5-15 seeded assets per contributor
- `src/app/api/payees/route.ts` - GET list with search/status/paymentMethod/pagination, POST create
- `src/app/api/payees/[id]/route.ts` - GET detail with payment details and address, PUT update
- `src/app/api/payees/[id]/contributors/route.ts` - GET reverse lookup of contributors per payee
- `src/app/api/financials/export/route.ts` - GET 41 flat rows with decimal rates for CSV export
- `src/middleware.ts` - Added /api/contributors, /api/payees, /api/financials to PUBLIC_PATHS

## Decisions Made
- **Deterministic seeding without Math.random:** Used integer arithmetic (`BASE_EPOCH + seed * multiplier`) for reproducible timestamps and data distribution, following Phase 2 pattern from `users/[id]/route.ts`
- **Pre-defined rate config arrays:** RATE_CONFIGS object maps payee count to arrays of rates that sum to 100 by definition, avoiding floating-point arithmetic risks documented in research doc Pitfall 1
- **Decimal rates only at export boundary:** All internal rate storage uses integers (0-100); financial export divides by 100 only at the response serialization point
- **POST validation with helpful errors:** Returns `totalPercentage` and human-readable `message` in 400 response ("Total is 80%. Please assign the remaining 20%.")

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Python test `isinstance(1.0, float)` showed JSON serializes 1.0 as integer `1` (JavaScript behavior). Verified this is expected: `parseFloat((100/100).toFixed(4))` = 1.0, JSON.stringify outputs `1`. The value 1 in accounting decimal format = 100% which is valid. All 41 rows confirmed to be in range [0,1].

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 8 API endpoints ready for UI components to consume
- Contributor list, detail, and payees endpoints match patterns needed for Phase 6 UI plans
- Financial export endpoint ready for CSV download integration
- No blockers for subsequent Phase 6 plans

---
*Phase: 06-payee-and-contributor-management*
*Completed: 2026-02-23*
