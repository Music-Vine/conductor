---
phase: 01-foundation-and-infrastructure
plan: 09
subsystem: ui-shell
tags: [layout, navigation, app-shell, providers, authentication]

dependencies:
  requires: [01-03, 01-04, 01-05, 01-06]
  provides: [authenticated-app-shell, navigation-layout]
  affects: [02-01, 02-02, 02-03]

tech-stack:
  added: []
  patterns: [route-group-layout, server-client-component-split, provider-composition]

file-tracking:
  created:
    - src/components/layout/Sidebar.tsx
    - src/components/layout/Header.tsx
    - src/components/layout/UserMenu.tsx
    - src/components/layout/index.ts
    - src/app/(platform)/layout.tsx
    - src/app/(platform)/layout-client.tsx
    - src/app/(platform)/page.tsx
  modified:
    - src/app/(auth)/magic-link/page.tsx

decisions:
  - name: Server-client layout split
    rationale: Session validation needs server component, providers need client component
    impact: Clear separation of concerns, better performance
  - name: Platform route group
    rationale: All authenticated pages share same layout and session validation
    impact: Consistent shell across app, single auth check point
  - name: UserMenu with dropdown
    rationale: Clean header, user info readily visible
    impact: Standard admin UI pattern

metrics:
  duration: 3.18 min
  tasks: 2
  commits: 2
  completed: 2026-02-03
---

# Phase 01 Plan 09: App shell and navigation layout Summary

**One-liner:** Authenticated app shell with sidebar navigation, header with user menu, and provider-wrapped layout

## What Was Built

Created the foundational UI shell for all authenticated pages with:

1. **Layout components** (`src/components/layout/`)
   - Sidebar with platform toggle, navigation, and branding
   - Header with user menu dropdown
   - UserMenu with logout functionality and user avatar

2. **Platform route group** (`src/app/(platform)/`)
   - Server layout validates sessions and redirects unauthorized users
   - Client layout wraps content with JotaiProvider, QueryProvider, ThemeProvider
   - Dashboard placeholder page with Phase 1 completion summary

3. **Navigation structure**
   - Dashboard link (expandable in Phase 2+)
   - Platform toggle integrated in sidebar
   - Active state highlighting for current route

## Key Technical Decisions

### 1. Server-Client Component Split
**Decision:** Split platform layout into server (session validation) and client (providers) components

**Rationale:**
- Session validation with JWT verify requires server component
- Providers (Jotai, React Query, Theme) require 'use client'
- Next.js App Router best practice

**Implementation:**
```typescript
// layout.tsx (server) - validates session
const session = await validateSession()
return <PlatformLayoutClient {...session} />

// layout-client.tsx (client) - wraps providers
<JotaiProvider><QueryProvider><ThemeProvider>
```

**Impact:** Clean separation, optimal performance, type-safe session flow

### 2. Route Group Pattern
**Decision:** Use `(platform)` route group for all authenticated pages

**Rationale:**
- All authenticated pages share same layout
- Single session check at layout level (DRY)
- Grouped routes don't affect URL structure

**Impact:** Any page in `(platform)/` automatically gets sidebar, header, session validation

### 3. UserMenu Dropdown Pattern
**Decision:** Dropdown menu with user info and logout

**Rationale:**
- Standard admin UI pattern
- Keeps header clean
- User info readily accessible

**Implementation:**
- Click-outside detection to close
- Avatar with initials
- Logout calls API then redirects

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Wrapped magic-link useSearchParams in Suspense**
- **Found during:** Task 1 verification (build phase)
- **Issue:** Next.js 16 requires useSearchParams to be wrapped in Suspense boundary for static generation
- **Fix:** Wrapped component in Suspense with loading fallback
- **Files modified:** `src/app/(auth)/magic-link/page.tsx`
- **Commit:** fa7dab8

This was required to fix a build error that would prevent deployment.

## Integration Points

### Inbound Dependencies
- **01-03 (Error boundaries):** Layout wrapped by error boundaries
- **01-04 (Platform context):** Sidebar uses PlatformToggle component
- **01-05 (API client):** UserMenu logout calls API endpoint
- **01-06 (Auth pages):** Session validation redirects to /login

### Outbound Provisions
- **Authenticated app shell:** All authenticated pages get consistent layout
- **Navigation structure:** Extensible nav items array for Phase 2+
- **User context:** User info available in layout (name, email, userId)

### Affected Future Work
- **02-01 through 02-03:** User management pages will use this layout
- **Phase 3+:** All feature pages inherit sidebar, header, session validation

## Files Created

```
src/components/layout/
├── Sidebar.tsx          # Navigation sidebar with platform toggle
├── Header.tsx           # Top header with user menu
├── UserMenu.tsx         # User dropdown with logout
└── index.ts             # Layout component exports

src/app/(platform)/
├── layout.tsx           # Server layout with session validation
├── layout-client.tsx    # Client layout with providers
└── page.tsx             # Dashboard placeholder page
```

## Files Modified

- `src/app/(auth)/magic-link/page.tsx` - Added Suspense boundary (bug fix)

## Verification Results

All verification criteria passed:

1. **TypeScript compilation:** `npm run build` passes
2. **Layout structure:** Server layout validates session, client layout wraps providers
3. **Component exports:** All layout components exported from index.ts
4. **Integration:** Sidebar imports PlatformToggle, UserMenu calls logout API
5. **Dashboard page:** Placeholder content with Phase 1 summary

## Testing Notes

### Manual Testing Required
1. Visit `/` while logged in → should show dashboard with sidebar
2. Click platform toggle → theme should change
3. Click user menu → should show dropdown with name/email
4. Click logout → should redirect to `/login`
5. Visit `/` while logged out → should redirect to `/login`

### Expected Behavior
- Sidebar shows platform toggle and Dashboard nav item
- Header shows user name and email
- Dashboard shows Phase 1 completion summary with placeholder cards
- Platform theme changes when toggling (CSS variables)

## Next Phase Readiness

**Ready for Phase 2:** Yes

**Blockers:** None

**Concerns:** None

**Notes:**
- Navigation items array ready for expansion in Phase 2
- Layout handles session validation automatically
- All providers properly composed
- Dashboard placeholder ready for real content

## Performance Impact

- Server-side session validation (minimal overhead)
- Client-side provider composition (standard React pattern)
- Static generation for dashboard page where possible

## Commits

| Hash    | Message                                          | Files                  |
|---------|--------------------------------------------------|------------------------|
| fa7dab8 | feat(01-09): create layout components            | 5 files (layout comps) |
| ab21727 | feat(01-09): create platform layout and dashboard| 3 files (platform)     |

**Total:** 8 files created, 1 file modified, 2 commits

---

*Plan executed: 2026-02-03*
*Duration: 3.18 minutes*
*Status: Complete*
