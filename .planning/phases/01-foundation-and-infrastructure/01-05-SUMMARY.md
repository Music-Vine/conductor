---
phase: 01-foundation-and-infrastructure
plan: 05
subsystem: api
tags: [react-query, api-client, fetch, typescript]
requires:
  - phase: 01-01
    provides: API response types (ApiResponse, ApiError, ApiClientConfig)
provides:
  - React Query provider with singleton QueryClient pattern
  - Typed API client with authentication support
  - ApiClientError for structured error handling
affects:
  - All future plans requiring data fetching
  - Plans needing server state management
tech-stack:
  added: []
  patterns:
    - "Singleton QueryClient pattern for Next.js App Router"
    - "Typed fetch wrapper with generic methods"
    - "Structured API error handling with custom error class"
key-files:
  created:
    - src/providers/QueryProvider.tsx
    - src/lib/api/client.ts
    - src/lib/api/index.ts
    - src/lib/audit/index.ts (stub)
  modified:
    - src/providers/index.ts
decisions:
  - what: "60s staleTime and no refetch on window focus"
    why: "Admin app pattern - explicit refreshes preferred over automatic"
    when: "2026-02-03"
  - what: "credentials: include for all API requests"
    why: "Enable cookie-based authentication for session management"
    when: "2026-02-03"
  - what: "Created audit stub to unblock PlatformToggle"
    why: "Parallel plan created PlatformToggle requiring audit module"
    when: "2026-02-03"
metrics:
  duration: "1.58 minutes"
  completed: "2026-02-03"
---

# Phase 1 Plan 5: API Client and React Query Setup Summary

**React Query provider with 60s staleTime and typed fetch wrapper supporting authentication via cookies**

## Performance

- **Duration:** 1.58 minutes
- **Started:** 2026-02-03T16:00:54Z
- **Completed:** 2026-02-03T16:02:28Z
- **Tasks:** 2
- **Files modified:** 4 (+ 1 stub)

## Accomplishments
- QueryProvider uses singleton QueryClient pattern for Next.js App Router
- API client with typed get/post/put/patch/delete methods
- Structured error handling via ApiClientError (code, status, details)
- Cookie-based authentication support (credentials: include)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create React Query provider** - `65f0031` (feat)
2. **Task 2: Create typed API client** - `3dc25ab` (feat)

## Files Created/Modified

### Created
- `src/providers/QueryProvider.tsx` - React Query provider with QueryClient configuration
- `src/lib/api/client.ts` - Typed API client with fetch wrapper and error handling
- `src/lib/api/index.ts` - Barrel exports for API client
- `src/lib/audit/index.ts` - Stub for captureAuditEvent (unblocks PlatformToggle)

### Modified
- `src/providers/index.ts` - Added QueryProvider export

## Technical Implementation

### QueryProvider Configuration
- **staleTime:** 60s - Data remains fresh for 1 minute before refetch
- **refetchOnWindowFocus:** false - Admin app uses explicit refreshes
- **retry:** 1 attempt with exponential backoff (1s, 2s, 4s, up to 30s max)
- **mutations.retry:** false - Don't retry mutations by default

### API Client Features
- **Generic type support:** All methods accept type parameter for response typing
- **Authentication:** credentials: 'include' for cookie-based auth
- **Error handling:** Custom ApiClientError with code, status, details
- **Response handling:** Handles 204 No Content, JSON parsing errors
- **HTTP methods:** get, post, put, patch, delete + raw request
- **Platform support:** createPlatformApiClient for platform-specific base URLs

## Decisions Made

1. **60s staleTime, no window focus refetch:**
   - Admin app pattern where staff make explicit actions
   - Reduces unnecessary network traffic
   - Staff will use explicit refresh when needed

2. **credentials: include on all requests:**
   - Enables cookie-based authentication
   - Required for session management pattern
   - Works seamlessly with httpOnly cookies

3. **ApiClientError structure:**
   - Provides code (machine-readable), status (HTTP), details (debugging)
   - Better than generic Error for API error handling
   - Enables specific error handling in UI (e.g., show field errors from details)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created audit stub to unblock PlatformToggle import**
- **Found during:** Task 2 (TypeScript compilation)
- **Issue:** PlatformToggle.tsx (created by parallel plan) imports @/lib/audit which didn't exist
- **Fix:** Created src/lib/audit/index.ts stub with captureAuditEvent placeholder
- **Files created:** src/lib/audit/index.ts
- **Verification:** TypeScript compilation passes
- **Committed in:** 3dc25ab (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary to unblock compilation. Audit implementation will be added in future plan (01-06).

## Issues Encountered

None - plan executed smoothly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

### Ready to Proceed
- All data fetching infrastructure in place
- QueryProvider ready to wrap application in root layout
- API client ready for use in queries and mutations
- Error handling patterns established

### No Blockers
All verification checks pass. Ready for implementation of actual API endpoints and React Query hooks.

### Integration Points
- QueryProvider should be added to root layout providers
- Use apiClient from @/lib/api for all API calls
- Use createPlatformApiClient when platform-specific endpoints needed
- Catch ApiClientError for structured error handling in UI

## Testing Notes

No tests written in this plan (infrastructure setup). Future plans will test:
- API client error handling with mock responses
- React Query integration with actual endpoints
- Platform-specific client functionality

---
*Phase: 01-foundation-and-infrastructure*
*Completed: 2026-02-03*
