---
status: resolved
trigger: "fetch failed error in Next.js 15 app after Phase 6 implementation"
created: 2026-02-24T00:00:00Z
updated: 2026-02-24T01:15:00Z
symptoms_prefilled: true
---

## Current Focus

hypothesis: RESOLVED
test: npx tsc --noEmit and npx next build both pass after fix
expecting: n/a
next_action: archive

## Symptoms

expected: Pages load successfully with contributors/payees data
actual: "Something went wrong / fetch failed / Error ID: 3533383411" when loading page
errors: fetch failed (server-side fetch to localhost)
reproduction: Load /contributors or /payees page (or any page that server-fetches)
started: After Phase 6 implementation (user tested new pages for first time)

## Eliminated

- hypothesis: contributors.ts/payees.ts use different API patterns than users.ts
  evidence: All three files use identical apiClient.get() pattern
  timestamp: 2026-02-24T00:30:00Z

- hypothesis: Missing 'use client' directive on page components
  evidence: Pages are correctly structured as server components; client components have 'use client'
  timestamp: 2026-02-24T00:30:00Z

- hypothesis: API response parsing issue
  evidence: All API routes return PaginatedResponse correctly; apiClient handles the response shape correctly
  timestamp: 2026-02-24T00:30:00Z

- hypothesis: Middleware blocking server-to-server API requests
  evidence: /api/contributors and /api/payees are in PUBLIC_PATHS in middleware
  timestamp: 2026-02-24T00:30:00Z

- hypothesis: apiClient SSR URL construction is wrong or missing
  evidence: SSR URL construction was already present in client.ts (added in fix(02) commit); contributors/payees use identical pattern to users
  timestamp: 2026-02-24T01:00:00Z

## Evidence

- timestamp: 2026-02-24T00:10:00Z
  checked: src/lib/api/client.ts SSR handling
  found: apiClient constructs http://localhost:3000/api/{endpoint} for server-side requests using hardcoded fallback
  implication: Works only if conductor dev server is on port 3000

- timestamp: 2026-02-24T00:30:00Z
  checked: All API client files (users.ts, contributors.ts, payees.ts)
  found: All use identical apiClient.get() pattern - no difference between working users and new contributors/payees
  implication: Problem is not specific to Phase 6 code; it's an environment issue exposed by new pages

- timestamp: 2026-02-24T00:45:00Z
  checked: Running processes via lsof and ps
  found: |
    port 3000 = UppbeatFrontend Next.js v15 server with --experimental-https (HTTPS only)
    port 3001 = Conductor dev server
  implication: http://localhost:3000 hits HTTPS-only UppbeatFrontend, causing SSL/TLS protocol mismatch = "fetch failed"

- timestamp: 2026-02-24T00:46:00Z
  checked: UppbeatFrontend start command
  found: next dev --turbopack --experimental-https (HTTPS mode on port 3000)
  implication: HTTP fetch to port 3000 = SSL handshake failure = TypeError fetch failed

## Resolution

root_cause: |
  The apiClient fell back to http://localhost:3000 for server-side SSR fetches when NEXT_PUBLIC_APP_URL was not set.
  The conductor dev server was running on port 3001 (port 3000 was occupied by UppbeatFrontend running with --experimental-https).
  An HTTP request to an HTTPS-only server causes an SSL handshake failure => TypeError: fetch failed.
  The error affected all server-fetching pages but was first noticed on the new Phase 6 contributors/payees pages.

fix: |
  Updated resolveServerBaseUrl() in src/lib/api/client.ts to:
  1. Check NEXT_PUBLIC_APP_URL env var first (explicit override)
  2. Read the incoming request host header via headers() from next/headers (dynamic, port-aware)
  3. Fall back to http://localhost:3000 only if in a non-request context (e.g. build time)
  This makes server-side fetches always target the correct server port regardless of environment.

verification: |
  - npx tsc --noEmit passes (no TypeScript errors)
  - npx next build succeeds (all routes compile correctly)
  - Server-side fetches will now use the actual request host (e.g. localhost:3001) instead of hardcoded localhost:3000

files_changed:
  - src/lib/api/client.ts
