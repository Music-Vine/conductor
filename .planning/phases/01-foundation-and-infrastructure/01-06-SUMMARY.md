---
phase: 01-foundation-and-infrastructure
plan: 06
subsystem: auth
tags: [authentication, magic-link, login, logout, jose, next.js, server-actions]

# Dependency graph
requires:
  - phase: 01-03
    provides: "Session management with createSession, destroySession utilities"
  - phase: 01-01
    provides: "jose library for JWT operations"
provides:
  - Magic link authentication flow with email-based login
  - Login page with Remember Me option (8hr vs 30-day sessions)
  - Magic link callback handler with session creation
  - Logout API endpoint (POST and GET methods)
  - Development debug URLs for testing without email
affects:
  - Future auth features (password reset, account management)
  - All authenticated pages (will use login flow)
  - Audit logging (will track user actions via session)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Magic link authentication with JWT tokens (15-minute expiry)"
    - "Server actions for form handling with useActionState"
    - "Remember Me preference embedded in magic link token"
    - "Development debug URLs for testing without email setup"

key-files:
  created:
    - src/app/(auth)/layout.tsx
    - src/lib/auth/magic-link.ts
    - src/app/(auth)/login/page.tsx
    - src/app/(auth)/login/actions.ts
    - src/app/(auth)/magic-link/page.tsx
    - src/app/(auth)/magic-link/actions.ts
    - src/app/api/auth/logout/route.ts
  modified:
    - src/lib/auth/index.ts

key-decisions:
  - "Magic link tokens expire after 15 minutes for security"
  - "Remember Me preference stored in magic link token (retrieved during callback)"
  - "Development mode logs magic link URLs to console for testing"
  - "Mock user sessions created with crypto.randomUUID() until database implemented"
  - "Logout supports both POST (for forms) and GET (for links)"

patterns-established:
  - "Auth route group with (auth) directory for public pages"
  - "Server actions with useActionState for form submission"
  - "Success/error states with clear visual feedback"
  - "Development-only features with conditional rendering"

# Metrics
duration: 2.52 minutes
completed: 2026-02-03
---

# Phase 1 Plan 6: Authentication Pages Summary

**Email-based magic link authentication with minimal UI, Remember Me sessions, and logout functionality**

## Performance

- **Duration:** 2.52 minutes
- **Started:** 2026-02-03T16:05:20Z
- **Completed:** 2026-02-03T16:08:14Z
- **Tasks:** 3
- **Files created:** 7
- **Files modified:** 1

## Accomplishments
- Auth route group layout with minimal centered design
- Magic link token generation with 15-minute expiry and nonce
- Login page with email input and Remember Me checkbox
- Server action for magic link requests with validation
- Success state with development debug URL for testing
- Magic link callback page with token validation
- Session creation with mock user data
- Logout API endpoint supporting POST and GET methods
- Error states with clear feedback and retry options

## Task Commits

Each task was committed atomically:

1. **Task 1: Create auth route group layout and magic link utilities** - Pre-existing (see Deviations)
2. **Task 2: Create login page with server actions** - `27c56e1` (feat)
3. **Task 3: Create magic link callback and logout** - `c8d46e2` (feat)

## Files Created/Modified

**Created (7):**
- `src/app/(auth)/layout.tsx` - Minimal auth layout with centered container
- `src/lib/auth/magic-link.ts` - Magic link token generation, validation, and request handling
- `src/app/(auth)/login/page.tsx` - Login page with email form and Remember Me
- `src/app/(auth)/login/actions.ts` - Server action for magic link requests
- `src/app/(auth)/magic-link/page.tsx` - Magic link callback page with loading and error states
- `src/app/(auth)/magic-link/actions.ts` - Server action for token validation and session creation
- `src/app/api/auth/logout/route.ts` - Logout endpoint with POST and GET support

**Modified (1):**
- `src/lib/auth/index.ts` - Added exports for magic link functions

## Technical Implementation

### Magic Link Flow
1. **Login:** User enters email and checks Remember Me
2. **Token Generation:** JWT token created with email, nonce, rememberMe, 15-min expiry
3. **Development:** Token logged to console as clickable URL
4. **Production:** Token would be sent via SES email
5. **Callback:** User clicks link, token validated, session created
6. **Session:** 8-hour or 30-day session based on Remember Me preference
7. **Redirect:** User redirected to dashboard

### Security Features
- Magic link tokens expire after 15 minutes
- Nonce included in token (ready for one-time-use database check)
- Email validation before token generation
- JWT signature verification on callback
- HttpOnly session cookies (from 01-03)
- Mock user sessions until database implemented

### Development Features
- Magic link URLs logged to console
- Clickable debug link shown on success page
- NODE_ENV check prevents debug features in production
- Email sending skipped in development

## Verification Results

- TypeScript compilation passes (`npx tsc --noEmit`)
- Login page accessible at /login
- Magic link callback accessible at /magic-link
- Logout API available at /api/auth/logout
- All success criteria met

## Decisions Made

1. **Magic link expiry: 15 minutes**
   - Reason: Balance between convenience and security
   - Impact: Users must click link within 15 minutes

2. **Remember Me stored in magic link token**
   - Reason: Token callback needs to know whether to create 8-hour or 30-day session
   - Impact: Session duration decided at login, not callback

3. **Mock user sessions for development**
   - Reason: Database not yet implemented (later phase)
   - Impact: Each magic link creates new user ID (no persistence)
   - Future: Replace with database lookup by email

4. **Development debug URLs**
   - Reason: Testing auth flow without email setup
   - Impact: Developers can test instantly by clicking console link
   - Security: Only enabled in NODE_ENV=development

5. **Logout supports GET and POST**
   - Reason: POST for forms (CSRF-protected), GET for simple links
   - Impact: Flexible logout options (button or link)

## Deviations from Plan

### Pre-existing Work

**1. Task 1 files already existed from commit 13e855f**
- **Found during:** Task 1 execution start
- **Issue:** src/app/(auth)/layout.tsx, src/lib/auth/magic-link.ts, and src/lib/auth/index.ts were created in commit 13e855f (labeled as plan 01-07, but contained 01-06 files)
- **Verification:** Files match plan specification exactly - identical implementation
- **Action taken:** Accepted pre-existing files, proceeded to Task 2
- **Rationale:** No rework needed; files fulfill all Task 1 requirements
- **Files affected:**
  - src/app/(auth)/layout.tsx
  - src/lib/auth/magic-link.ts
  - src/lib/auth/index.ts (exports added)
- **Commit:** 13e855f

---

**Total deviations:** 1 (pre-existing work from earlier execution)
**Impact on plan:** No functional impact. Task 1 already complete, Tasks 2-3 executed as planned. All success criteria met.

## Issues Encountered

None - execution proceeded smoothly. Pre-existing Task 1 files were a pleasant discovery.

## User Setup Required

**Environment variable required (should already exist from plan 01-03):**

Add to `.env.local` if not already present:

```bash
# Generate a secure secret:
openssl rand -base64 32

# Add to .env.local:
SESSION_SECRET=<generated-secret-here>
```

**Optional (for production email sending):**

```bash
# Use separate secret for magic links (or SESSION_SECRET will be used)
MAGIC_LINK_SECRET=<generated-secret-here>

# App URL for magic link generation
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

**Verification:**
- Server will throw error on startup if SESSION_SECRET is missing
- Magic links will use `http://localhost:3000` if NEXT_PUBLIC_APP_URL not set

## Testing the Flow

**1. Start the development server:**
```bash
npm run dev
```

**2. Navigate to login page:**
```
http://localhost:3000/login
```

**3. Enter any email address:**
- Email format validation is applied
- No database check in development

**4. Check server console for magic link:**
```
=== MAGIC LINK (Development Only) ===
Email: test@example.com
Remember Me: false
Link: http://localhost:3000/magic-link?token=...
=====================================
```

**5. Click the debug link on success page or copy from console**

**6. Magic link page will:**
- Show loading spinner
- Validate token
- Create mock user session
- Redirect to dashboard (/)

**7. Test logout:**
- Visit: `http://localhost:3000/api/auth/logout`
- Or use POST request from authenticated page

## Next Phase Readiness

### Ready to Proceed
- Authentication flow complete for staff login
- Magic link generation and validation working
- Session creation integrated with login flow
- Logout functionality available
- Development testing workflow established

### Integration Points
- Login flow creates sessions using `createSession()` from 01-03
- Sessions include platform context from 01-04
- API client from 01-05 will include session cookies automatically
- Future pages can check auth status with middleware from 01-03

### Known Limitations (to be addressed in later phases)
1. **No database integration:**
   - Mock user sessions created on each login
   - No user persistence or lookup by email
   - Resolution: Phase 2 (User Management) will add database

2. **No email sending:**
   - Magic links logged to console only
   - Resolution: Phase 2 will integrate AWS SES

3. **No nonce validation:**
   - Magic links can be reused (within 15 minutes)
   - Resolution: Database implementation will track used nonces

4. **No staff email verification:**
   - Any valid email format accepted
   - Resolution: Database will store authorized staff emails

### No Blockers
All authentication pages operational. Users can log in via magic link in development mode. Next plans can build authenticated features using this auth infrastructure.

---
*Phase: 01-foundation-and-infrastructure*
*Completed: 2026-02-03*
