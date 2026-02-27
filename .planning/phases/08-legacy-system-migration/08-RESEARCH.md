# Phase 8: Legacy System Migration - Research

**Researched:** 2026-02-27
**Domain:** API integration cutover, Next.js BFF proxy pattern, smoke testing, staff cutover
**Confidence:** HIGH

## Summary

Phase 8 is a cutover phase, not a data migration. The underlying Music Vine and Uppbeat databases stay in place; only the admin UI applications are retired. The work falls into three streams: (1) wiring Conductor's Next.js route handlers to call real backend endpoints instead of generating mock data, controlled by a single environment variable flip; (2) validating that wiring with smoke tests, feature parity audits, and staff UAT before cutover; and (3) sequentially decommissioning four legacy admin systems post-cutover.

The primary technical mechanism is the Next.js route handler acting as a Backend for Frontend (BFF) proxy. Each existing `/app/api/**/route.ts` file currently generates mock data in-process. The migration replaces that in-process mock generation with `fetch()` calls to the real backend endpoints, gated by `NEXT_PUBLIC_USE_REAL_API`. The frontend code (TanStack Query, lib/api/) never changes — it continues calling `/api/users`, `/api/assets`, etc. The route handlers become thin proxy adapters that either serve mock data or forward to the real backend, depending on the environment variable.

Additionally, the project uses Next.js 16.1.6 which has renamed `middleware.ts` to `proxy.ts`. The existing `middleware.ts` file at `src/middleware.ts` must be migrated using the official codemod before Phase 8 work is complete. This is a near-zero-risk rename with a provided codemod.

**Primary recommendation:** Transform each `/app/api/**/route.ts` from in-process mock generators into conditional BFF proxies: when `NEXT_PUBLIC_USE_REAL_API=true`, forward to `BACKEND_API_URL + path`; otherwise, return existing mock data. This preserves local development workflows and enables instant rollback.

## Standard Stack

### Core

| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| Next.js route handlers | 16.1.6 (already in project) | BFF proxy layer to real backend | Already used, no new dependency |
| Playwright | ^1.50 | Smoke tests and E2E validation | Official Next.js testing recommendation, Auth support built-in |
| `@next/codemod` | canary | Migrate `middleware.ts` to `proxy.ts` | Official Next.js migration tool |

### Supporting

| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| `next.config.ts` rewrites | built-in | Alternative proxy approach via config | Simpler but less flexible than route handlers for conditional logic |
| `process.env.NEXT_PUBLIC_USE_REAL_API` | N/A | Feature flag controlling mock vs real | Drives all conditional branching |
| `process.env.BACKEND_API_BASE_URL` | N/A | Base URL for real backend endpoints | Server-side only (no NEXT_PUBLIC_ prefix needed) |

### Alternatives Considered

| Standard | Alternative | Tradeoff |
|----------|-------------|----------|
| Route handler conditional proxy | `next.config.ts` rewrites | Rewrites can't conditionally branch on env vars at runtime — they're resolved at build time. Route handlers support runtime conditionals. |
| Route handler conditional proxy | `proxy.ts` (formerly middleware.ts) rewrites | proxy.ts rewrites work but lose the ability to transform/validate response shape. Route handlers allow schema adaptation. |
| Playwright for smoke tests | Cypress | Playwright is the current Next.js official recommendation; better TypeScript support; faster. |
| Sequential decommission | Simultaneous shutdown | Sequential decommission reduces blast radius; access logs can confirm zero usage per system. |

**Installation:**
```bash
# Playwright for smoke/E2E tests
npm install --save-dev @playwright/test
npx playwright install

# Run the middleware-to-proxy codemod (Next.js 16 requirement)
npx @next/codemod@canary middleware-to-proxy .
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/api/
│   ├── users/route.ts          # Conditional: mock data OR proxy to backend
│   ├── assets/route.ts         # Conditional: mock data OR proxy to backend
│   ├── contributors/route.ts   # Conditional: mock data OR proxy to backend
│   ├── payees/route.ts         # Conditional: mock data OR proxy to backend
│   ├── collections/route.ts    # Conditional: mock data OR proxy to backend
│   └── activity/route.ts       # Conditional: mock data OR proxy to backend
├── lib/api/
│   └── client.ts               # Unchanged — still calls /api/* internally
├── proxy.ts                    # Renamed from middleware.ts (Next.js 16 codemod)
└── ...

e2e/                             # Playwright smoke tests (new)
├── smoke/
│   ├── auth.spec.ts            # Login flow works
│   ├── users.spec.ts           # Users screen loads real data
│   ├── assets.spec.ts          # Assets screen loads real data
│   ├── contributors.spec.ts    # Contributors screen loads real data
│   └── payees.spec.ts          # Payees screen loads real data
├── parity/
│   └── feature-parity.spec.ts  # Legacy workflow coverage
└── playwright.config.ts

docs/
└── decommission/
    ├── jordans-admin.md         # Decommission runbook
    ├── retool.md                # Decommission runbook
    ├── musicvine-php.md         # Decommission runbook
    └── uppbeat-php.md           # Decommission runbook
```

### Pattern 1: Conditional BFF Proxy in Route Handlers

**What:** Each `route.ts` checks `process.env.NEXT_PUBLIC_USE_REAL_API`. When false (local dev), it returns existing mock data. When true (production cutover), it proxies the request to the real backend, adapts the response shape if needed, and returns it.

**When to use:** All existing `/app/api/**/route.ts` files during real backend integration.

**Example:**
```typescript
// Source: https://nextjs.org/docs/app/guides/backend-for-frontend
// Pattern: route handler as conditional BFF proxy
import { NextRequest, NextResponse } from 'next/server'
import type { PaginatedResponse, UserListItem } from '@/types'

const USE_REAL_API = process.env.NEXT_PUBLIC_USE_REAL_API === 'true'
const BACKEND_BASE = process.env.BACKEND_API_BASE_URL // e.g. https://api.musicvine.com

export async function GET(request: NextRequest) {
  if (!USE_REAL_API) {
    // Existing mock data generation — unchanged
    return NextResponse.json(generateMockUsers())
  }

  // Proxy to real backend, forwarding query params
  const { searchParams } = request.nextUrl
  const backendUrl = new URL(`/admin/users`, BACKEND_BASE)
  searchParams.forEach((value, key) => backendUrl.searchParams.set(key, value))

  const backendResponse = await fetch(backendUrl, {
    headers: {
      'Authorization': `Bearer ${process.env.BACKEND_API_SECRET}`,
      'X-Platform': request.headers.get('x-platform') ?? 'music-vine',
    },
    signal: AbortSignal.timeout(10_000),
  })

  if (!backendResponse.ok) {
    return NextResponse.json(
      { code: 'BACKEND_ERROR', message: 'Backend request failed' },
      { status: backendResponse.status }
    )
  }

  const raw = await backendResponse.json()

  // Adapt real data shape to Conductor's TypeScript types if they differ
  // This is where shape mismatches are resolved — Conductor adapts, backend stays unchanged
  const adapted: PaginatedResponse<UserListItem> = adaptUsersResponse(raw)
  return NextResponse.json(adapted)
}
```

### Pattern 2: Response Shape Adaptation

**What:** When real backend data shape differs from Conductor's TypeScript types, write an adapter function in the route handler. Conductor's types win — adapt the raw backend response to fit them.

**When to use:** Any endpoint where the real backend field names, nesting, or types differ from what Conductor's components expect.

**Example:**
```typescript
// Adapter pattern: real backend shape → Conductor types
function adaptUsersResponse(raw: unknown): PaginatedResponse<UserListItem> {
  // Example: backend returns { users: [...], total: N, page: N }
  // Conductor expects: { data: [...], pagination: { page, pageSize, totalPages, totalItems } }
  const r = raw as any
  return {
    data: r.users.map(adaptUserItem),
    pagination: {
      page: r.page,
      pageSize: r.per_page ?? 25,
      totalPages: Math.ceil(r.total / (r.per_page ?? 25)),
      totalItems: r.total,
    },
  }
}
```

### Pattern 3: Environment Variable Rollback

**What:** Deployment configuration controls mock vs real. Rollback is a redeploy with the env var flipped back.

**When to use:** Cutover day and whenever post-cutover issues require rollback.

```bash
# Cutover: flip to real API
NEXT_PUBLIC_USE_REAL_API=true
BACKEND_API_BASE_URL=https://api.internal.musicvine.com
BACKEND_API_SECRET=<secret>

# Rollback: redeploy with flag removed or set to false
NEXT_PUBLIC_USE_REAL_API=false
# (BACKEND_API_BASE_URL and BACKEND_API_SECRET not needed when mocking)
```

### Pattern 4: Smoke Test with Playwright

**What:** Playwright tests that hit the running Conductor app after `NEXT_PUBLIC_USE_REAL_API=true` is deployed, verifying every major screen loads real data without errors.

**When to use:** Pre-cutover gate validation and post-cutover verification.

```typescript
// Source: https://nextjs.org/docs/app/guides/testing/playwright
// e2e/smoke/users.spec.ts
import { test, expect } from '@playwright/test'

test.use({ storageState: 'e2e/.auth/staff-user.json' })

test('Users screen loads real data', async ({ page }) => {
  await page.goto('/users')
  // Page should not show error state
  await expect(page.getByRole('alert')).not.toBeVisible()
  // Table should have at least one row (real data)
  await expect(page.getByRole('row')).toHaveCount({ min: 2 }) // header + at least 1 data row
  // Status filter works
  await page.getByRole('combobox', { name: 'Status' }).selectOption('active')
  await expect(page.getByRole('row')).toHaveCount({ min: 2 })
})
```

### Pattern 5: middleware.ts to proxy.ts Migration

**What:** Next.js 16 renamed `middleware.ts` to `proxy.ts` and the exported function from `middleware` to `proxy`. The existing `src/middleware.ts` must be migrated.

**When to use:** As a prerequisite task before going to production on Next.js 16.

```bash
# Run official codemod — renames file and function
npx @next/codemod@canary middleware-to-proxy .
```

After codemod, `src/middleware.ts` becomes `src/proxy.ts`:
```typescript
// Before (middleware.ts): export async function middleware(request: NextRequest)
// After (proxy.ts): export async function proxy(request: NextRequest)
// All other logic unchanged
```

### Anti-Patterns to Avoid

- **NEXT_PUBLIC_ prefix for server-side secrets:** `NEXT_PUBLIC_USE_REAL_API` is safe (it's a boolean flag, not a secret). But `BACKEND_API_SECRET` must NOT use the `NEXT_PUBLIC_` prefix — that would expose it to the browser bundle.
- **Changing the API client or frontend:** The lib/api/ functions and TanStack Query hooks should not change at all. All adaptation happens in route handlers only.
- **Backend changes to match Conductor:** The CONTEXT.md decision is explicit — Conductor adapts to the real data shape, not the other way around. Write adapters in route handlers.
- **Cutting over all four legacy systems simultaneously:** The decommission order is explicit. Sequential decommission allows each system to be validated before the next is touched.
- **Shutting down legacy before confirming zero usage:** Access logs must show zero active staff usage for a defined period before shutting down each legacy system.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Auth state in Playwright tests | Custom cookie injection | `page.context().storageState()` save/restore | Playwright handles auth persistence natively; save once, reuse across all tests |
| Middleware/proxy rename | Manual find-and-replace | `npx @next/codemod@canary middleware-to-proxy .` | Official codemod handles edge cases correctly |
| Request proxying with body forwarding | Custom stream copy | `return fetch(proxyRequest)` — pass the Request object directly | Next.js route handlers can return a `fetch()` Promise directly; no need to buffer/re-stream body |
| E2E test server startup | Manual `next start` in test | Playwright `webServer` config | Playwright's `webServer` manages start/stop automatically |
| Feature parity tracking | Ad-hoc notes | A structured markdown checklist committed to the repo | A committed checklist creates a paper trail for the team lead sign-off gate |

**Key insight:** The proxy layer already exists (Next.js route handlers). The migration is about replacing mock data generation with real `fetch()` calls inside existing route handler files — there is no new infrastructure to build.

## Common Pitfalls

### Pitfall 1: NEXT_PUBLIC_ Env Var Evaluated at Build Time

**What goes wrong:** `NEXT_PUBLIC_USE_REAL_API` is embedded into the client-side JavaScript bundle at build time. If you deploy with the flag set to `false` and then set it to `true` via platform environment dashboard without rebuilding, the flag will not change for client-side code.

**Why it happens:** Next.js inlines `NEXT_PUBLIC_*` variables during `next build`. Changing them after build has no effect on bundled client code.

**How to avoid:** Always redeploy (rebuild + restart) when changing `NEXT_PUBLIC_USE_REAL_API`. The cutover procedure must be: set env var → trigger rebuild → deploy. Never rely on a restart-only deploy for this flag.

**Warning signs:** API calls still hitting mock responses after claiming to set `NEXT_PUBLIC_USE_REAL_API=true`, without a rebuild.

### Pitfall 2: Route Handler Missing Request Forwarding Headers

**What goes wrong:** The real backend requires a platform header (`x-platform: music-vine` or `x-platform: uppbeat`) to scope data correctly. If the proxy route handler doesn't forward this header from the incoming request, all backend calls will return wrong-platform data.

**Why it happens:** `fetch()` to an external URL doesn't automatically forward the original request's headers.

**How to avoid:** Explicitly forward platform context headers in every proxy route handler:
```typescript
headers: {
  'X-Platform': request.headers.get('x-platform') ?? 'music-vine',
}
```
The `x-platform` header is set by `proxy.ts` (formerly `middleware.ts`) from the session payload on every authenticated request.

**Warning signs:** Music Vine staff see Uppbeat data (or vice versa) after cutover.

### Pitfall 3: Missing Timeout on Backend Fetch Calls

**What goes wrong:** Real backend calls with no timeout will hang indefinitely if the backend is slow or unresponsive, causing Conductor to time out at the CDN/load balancer level with a cryptic 504, while the route handler remains open.

**Why it happens:** `fetch()` has no default timeout in Node.js.

**How to avoid:** Always pass `signal: AbortSignal.timeout(10_000)` (10 seconds) on all backend fetch calls in route handlers.

**Warning signs:** Conductor appears to hang on page loads post-cutover; no error shown to user.

### Pitfall 4: Data Shape Mismatches Discovered Late

**What goes wrong:** The real backend returns fields with different names, different nesting, or nulls where Conductor expects strings. TypeScript types may not catch this at runtime — components silently show blank/undefined values.

**Why it happens:** Mock data was designed to match Conductor's types perfectly. Real data comes from existing databases with their own conventions.

**How to avoid:** During integration (before full cutover), run Conductor against real backend with a small set of real data and manually inspect every screen. Write adapters in route handlers for every discovered mismatch.

**Warning signs:** Fields rendering as "undefined", empty tables despite real data existing, filter/sort breaking silently.

### Pitfall 5: Decommissioning Before Zero-Usage Confirmation

**What goes wrong:** A legacy system is shut down while one or more staff members are still using it (they haven't switched to Conductor for that specific workflow), causing disruption.

**Why it happens:** Assuming all staff switched after training without verifying via access logs.

**How to avoid:** Pull access logs for each legacy system. Define "zero usage" as no authenticated admin sessions for N consecutive days. Get team lead confirmation in addition to log evidence.

**Warning signs:** Support tickets after decommission about "can't access [legacy system] anymore."

### Pitfall 6: middleware.ts Not Migrated to proxy.ts

**What goes wrong:** Next.js 16 deprecated `middleware.ts` in favour of `proxy.ts`. The project's auth/session logic lives in `src/middleware.ts`. If not migrated, a future Next.js upgrade may break authentication silently.

**Why it happens:** The rename is non-breaking in the current version, making it easy to defer. But it accumulates as tech debt against the framework.

**How to avoid:** Run the codemod as a dedicated task during Phase 8: `npx @next/codemod@canary middleware-to-proxy .`.

**Warning signs:** Deprecation warnings in Next.js build output referencing `middleware.ts`.

## Code Examples

### Conditional Proxy Route Handler (Full Pattern)

```typescript
// Source: https://nextjs.org/docs/app/guides/backend-for-frontend
// app/api/users/route.ts — after Phase 8 integration

import { NextRequest, NextResponse } from 'next/server'
import type { PaginatedResponse, UserListItem } from '@/types'

const USE_REAL_API = process.env.NEXT_PUBLIC_USE_REAL_API === 'true'
const BACKEND_BASE = process.env.BACKEND_API_BASE_URL

export async function GET(request: NextRequest) {
  if (!USE_REAL_API || !BACKEND_BASE) {
    // Preserve existing mock generation unchanged
    return NextResponse.json(generateMockUsersResponse(request))
  }

  const { searchParams } = request.nextUrl
  const url = new URL('/admin/users', BACKEND_BASE)
  searchParams.forEach((v, k) => url.searchParams.set(k, v))

  let backendResponse: Response
  try {
    backendResponse = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.BACKEND_API_SECRET}`,
        'X-Platform': request.headers.get('x-platform') ?? 'music-vine',
        'X-Conductor-User': request.headers.get('x-user-id') ?? '',
      },
      signal: AbortSignal.timeout(10_000),
    })
  } catch (err) {
    console.error('[users proxy] Backend fetch failed:', err)
    return NextResponse.json(
      { code: 'BACKEND_UNAVAILABLE', message: 'Backend request failed' },
      { status: 502 }
    )
  }

  if (!backendResponse.ok) {
    const body = await backendResponse.text()
    console.error('[users proxy] Backend error:', backendResponse.status, body)
    return NextResponse.json(
      { code: 'BACKEND_ERROR', message: 'Backend returned error' },
      { status: backendResponse.status }
    )
  }

  const raw = await backendResponse.json()
  // Adapt real data shape to Conductor's PaginatedResponse<UserListItem>
  // Edit this adapter as shape mismatches are discovered during integration
  const adapted = adaptBackendUsersToCondudctor(raw)
  return NextResponse.json(adapted)
}
```

### Playwright Config for Smoke Tests

```typescript
// Source: https://nextjs.org/docs/app/guides/testing/playwright
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    // Setup: authenticate once, save state
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium-smoke',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/staff-user.json',
      },
      dependencies: ['setup'],
      testMatch: /smoke\/.*\.spec\.ts/,
    },
  ],
  // In CI, run against already-deployed app; locally, start dev server
  ...(process.env.CI ? {} : {
    webServer: {
      command: 'npm run build && npm run start',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
    },
  }),
})
```

### Feature Parity Checklist Format

```markdown
<!-- docs/decommission/feature-parity-audit.md -->
# Feature Parity Audit

**Status:** [ ] INCOMPLETE / [x] COMPLETE
**Sign-off:** Team Lead: _____________ Date: _____________

## Music Vine PHP Admin Workflows

| Legacy Workflow | Conductor Equivalent | Verified | Notes |
|----------------|---------------------|----------|-------|
| Search users by email | /users → search bar | [ ] | |
| Suspend/unsuspend user | /users/[id] → Suspend button | [ ] | |
| View user downloads | /users/[id] → Downloads tab | [ ] | |
| Approve/reject asset | /assets/[id] → Workflow panel | [ ] | |
| View contributor details | /contributors/[id] | [ ] | |
| Export financial CSV | /financials → Export button | [ ] | |
...
```

### Access Log Decommission Gate Check

```bash
# Example: confirm zero admin sessions in last 7 days for Jordan's Admin
# (exact command depends on the server/platform logging infrastructure)
# Pattern: search auth logs for admin login events

grep "POST /admin/login" /var/log/jordans-admin/access.log \
  | awk '{print $1}' \
  | sort -r \
  | head -5
# If empty or last entry > 7 days ago: gate passes
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|-----------------|--------------|--------|
| `middleware.ts` / `export function middleware()` | `proxy.ts` / `export function proxy()` | Next.js v16.0.0 | The project's `src/middleware.ts` must be migrated via codemod |
| Rewrites-based proxy | Route handler BFF proxy | Ongoing — both valid | Route handlers allow runtime conditional on env var; rewrites are build-time only |
| Cypress for E2E | Playwright (official Next.js recommendation) | 2024-2025 | Playwright is now the official Next.js E2E testing tool |

**Deprecated/outdated:**
- `middleware.ts` naming: Deprecated in Next.js 16.0.0. The codemod `middleware-to-proxy` handles the rename.

## Open Questions

1. **What is the real backend API base URL and auth mechanism?**
   - What we know: The backend team builds the real endpoints. Conductor will call them. The exact URL and auth scheme (Bearer token, API key, mTLS) are not yet decided.
   - What's unclear: What env vars to document for the backend team handoff.
   - Recommendation: Planner should include a task to establish the backend team handoff contract (URL pattern, auth header, expected response shapes) as a blocker for integration work.

2. **How many days should the parallel read-only period last?**
   - What we know: CONTEXT.md leaves this to Claude's discretion.
   - What's unclear: Depends on staff count, ticket volume, and team confidence.
   - Recommendation: 5 business days (1 week) is an industry-standard "hypercare" period for admin system cutovers of this scale. Document it as the default but allow team leads to shorten it if usage logs confirm full adoption.

3. **Are there legacy-system-specific workflows not yet covered by Conductor?**
   - What we know: The feature parity audit is the tool to discover these gaps.
   - What's unclear: There may be edge-case screens in the legacy PHP admins that were not captured in Phases 1-7.
   - Recommendation: Run the feature parity audit as the first formal Phase 8 task, before any integration work begins, to surface gaps early.

4. **Does the existing `src/middleware.ts` auth logic need changes to work as `proxy.ts`?**
   - What we know: The codemod only renames the file and function name. All logic is preserved.
   - What's unclear: Whether any runtime behaviour differs between the two in Next.js 16.
   - Recommendation: Run the codemod and test auth flows (login, session refresh, logout) immediately after to confirm no regression.

## Sources

### Primary (HIGH confidence)
- Next.js official docs — proxy.ts API reference: https://nextjs.org/docs/app/api-reference/file-conventions/proxy (version 16.1.6, last updated 2026-02-24)
- Next.js official docs — Backend for Frontend guide: https://nextjs.org/docs/app/guides/backend-for-frontend (version 16.1.6, last updated 2026-02-24)
- Next.js official docs — rewrites: https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites (version 16.1.6, last updated 2026-02-24)
- Next.js official docs — Playwright setup: https://nextjs.org/docs/app/guides/testing/playwright (version 16.1.6, last updated 2026-02-24)
- Codebase inspection: `src/middleware.ts`, `src/lib/api/client.ts`, `src/lib/api/users.ts`, `src/app/api/users/route.ts`, `src/app/api/assets/route.ts`, `package.json` — direct codebase analysis

### Secondary (MEDIUM confidence)
- Strapi blog — Next.js 16 Route Handlers advanced use cases: https://strapi.io/blog/nextjs-16-route-handlers-explained-3-advanced-usecases (corroborates BFF proxy pattern)
- XB Software — Big Bang vs Gradual migration: https://xbsoftware.com/blog/big-bang-or-gradual-data-migration/ (corroborates sequential decommission rationale)

### Tertiary (LOW confidence)
- None — all significant claims verified against primary sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified against official Next.js 16.1.6 docs and codebase inspection
- Architecture patterns: HIGH — BFF proxy pattern documented officially; env var cutover strategy confirmed by CONTEXT.md
- Pitfalls: HIGH for NEXT_PUBLIC_ build-time concern (verified in Next.js docs); MEDIUM for data shape mismatches (informed by mock data analysis and common migration experience)
- Decommission process: MEDIUM — industry-standard cutover practices, specific implementation details depend on backend team

**Research date:** 2026-02-27
**Valid until:** 2026-03-29 (30 days — Next.js 16 is stable; migration patterns don't change rapidly)
