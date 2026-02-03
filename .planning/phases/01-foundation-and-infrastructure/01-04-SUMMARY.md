---
phase: 01-foundation-and-infrastructure
plan: 04
subsystem: foundation
tags: [jotai, state-management, platform, theming, css, ui]
requires:
  - 01-01 (Platform types and PLATFORM_CONFIG)
provides:
  - Platform context atoms with localStorage persistence
  - Jotai and Theme providers for Next.js App Router
  - PlatformToggle UI component
  - CSS theming system for both platforms
affects:
  - 01-05 (API client will use platformApiBaseAtom)
  - 01-06+ (All UI components can use platform theming)
  - Future phases (Platform context available globally)
tech-stack:
  added: []
  patterns:
    - "Jotai atomWithStorage for persisted client state"
    - "Derived atoms for computed platform values"
    - "CSS custom properties for dynamic theming"
    - "data-platform attribute for platform-specific styling"
key-files:
  created:
    - src/atoms/platformAtom.ts
    - src/atoms/index.ts
    - src/providers/JotaiProvider.tsx
    - src/providers/ThemeProvider.tsx
    - src/providers/index.ts
    - src/components/PlatformToggle.tsx
  modified:
    - src/app/globals.css
decisions:
  - what: "Used atomWithStorage from jotai/utils for platform persistence"
    why: "Automatically syncs platform choice to localStorage across sessions"
    when: "2026-02-03"
  - what: "ThemeProvider sets both data-platform attribute and CSS custom properties"
    why: "Supports both CSS selectors and JS access to theme values"
    when: "2026-02-03"
  - what: "Made audit logging optional with dynamic import and catch block"
    why: "PlatformToggle ready for audit module (Plan 07) without breaking before it exists"
    when: "2026-02-03"
metrics:
  duration: "1.93 minutes"
  completed: "2026-02-03"
---

# Phase 1 Plan 4: Platform Context and Theme Switching Summary

**One-liner:** Implemented Jotai-based platform context with localStorage persistence, ThemeProvider for CSS variable-based theming, and iOS-style PlatformToggle component.

## What Was Built

### Jotai Atoms for Platform State
Created `src/atoms/platformAtom.ts` with:
- **platformAtom:** Main atom with localStorage persistence via `atomWithStorage`
- **platformConfigAtom:** Derived atom returning current platform's config from PLATFORM_CONFIG
- **platformThemeAtom:** Derived atom returning current platform's theme colors
- **platformApiBaseAtom:** Derived atom returning current platform's API base URL

All atoms exported from `src/atoms/index.ts` for convenient imports.

### Providers for Next.js App Router
**JotaiProvider (`src/providers/JotaiProvider.tsx`):**
- Wraps Jotai's Provider for Next.js App Router compatibility
- Client component with 'use client' directive
- Documented to avoid root layout placement (per research, prevents hydration issues)

**ThemeProvider (`src/providers/ThemeProvider.tsx`):**
- Subscribes to platformAtom changes via useAtom
- Sets `data-platform` attribute on document element for CSS selectors
- Sets CSS custom properties (--platform-primary, --platform-accent) for JS access
- Updates immediately on platform change (visual feedback)

### PlatformToggle Component
Created `src/components/PlatformToggle.tsx`:
- iOS-style segmented control with two buttons (Music Vine, Uppbeat)
- Uses useAtom hook to read/write platformAtom
- Includes placeholder SVG icons (replaceable with brand icons)
- Proper ARIA attributes (role="group", aria-pressed)
- Optional userId prop for audit logging
- Dynamic import of audit module with catch block (ready for Plan 07)
- Tracks before/after values for audit metadata

### CSS Theming System
Updated `src/app/globals.css` with:
- CSS custom properties for both platforms:
  - Music Vine: --platform-primary: #1a1a2e, --platform-accent: #16213e
  - Uppbeat: --platform-primary: #0f3460, --platform-accent: #533483
- Selectors for `[data-platform='music-vine']` and `[data-platform='uppbeat']`
- Utility classes:
  - `.platform-themed` - Applies background and text colors based on platform
  - `.platform-accent` - Applies accent color background
  - `.platform-indicator` - Sidebar indicator bar (3px left border)
- Smooth transitions (200ms ease-in-out)

## Technical Implementation

### State Management Pattern
1. **Single source of truth:** platformAtom persisted to localStorage with key 'conductor_platform'
2. **Derived values:** Other atoms compute from platformAtom (no duplicate state)
3. **Automatic persistence:** Jotai's atomWithStorage handles localStorage sync
4. **Type safety:** All atoms typed with Platform and PlatformConfig types from 01-01

### Theming Architecture
1. **CSS-first approach:** Theme changes via CSS custom properties
2. **Dual application method:**
   - data-platform attribute for CSS selectors
   - Custom properties for JS access (if needed by components)
3. **Immediate visual feedback:** useEffect in ThemeProvider fires on every platform change
4. **Dark mode compatible:** Platform theming works alongside existing dark mode styles

### Component Design
1. **Controlled component:** PlatformToggle reads and writes to shared atom
2. **Visual state:** Active button has white background with shadow
3. **Accessibility:** Proper ARIA attributes for screen readers
4. **Audit-ready:** Conditional audit logging with graceful fallback
5. **Fire-and-forget:** Audit logging doesn't block UI (async, catches errors)

## Verification Results

All verification criteria met:
- TypeScript compilation passes (`npx tsc --noEmit`)
- Platform atoms importable from `@/atoms`
- Providers importable from `@/providers`
- PlatformToggle renders two buttons with aria-pressed attributes
- CSS variables for both platforms defined in globals.css
- PlatformToggle accepts optional userId prop

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added error handling for missing audit module**
- **Found during:** Task 2 - TypeScript compilation
- **Issue:** Dynamic import of `@/lib/audit` caused TypeScript error (module doesn't exist yet)
- **Fix:** Added .catch() block to dynamic import to gracefully handle missing module
- **Files modified:** src/components/PlatformToggle.tsx
- **Commit:** 33c4dd4
- **Reasoning:** Audit module will be implemented in Plan 01-07. PlatformToggle should be ready to use it but not break before it exists. This is critical functionality - the component must work now and seamlessly integrate audit logging when available.

## Decisions Made

1. **atomWithStorage for persistence:**
   - Used Jotai's atomWithStorage instead of manual localStorage sync
   - Reason: Automatic persistence, handles SSR/hydration, type-safe
   - Impact: Platform choice persists across browser sessions with zero boilerplate

2. **Dual theming approach:**
   - Set both data-platform attribute AND CSS custom properties
   - Reason: Maximum flexibility - CSS selectors for most cases, JS access if needed
   - Impact: Components can use either approach (e.g., Tailwind with arbitrary values or inline styles)

3. **Graceful audit logging:**
   - Made audit logging conditional with try/catch pattern
   - Reason: Component usable immediately, audit integration seamless when available
   - Impact: No breaking changes when audit module added in Plan 07

4. **Placeholder icons:**
   - Used generic music note and checkmark SVG icons
   - Reason: Functional component now, easy to replace with brand icons later
   - Impact: PlatformToggle works immediately, visual polish can be added later

## Next Phase Readiness

### Ready to Proceed
- 01-05 (API client): Can use platformApiBaseAtom for dynamic base URLs
- 01-06 (Form patterns): Can use platform theming for form styling
- 01-07 (Audit logging): PlatformToggle ready to integrate audit events
- All future plans: Platform context available globally via useAtom(platformAtom)

### No Blockers
All atoms, providers, and components functional. TypeScript compilation clean. CSS theming working.

### Integration Points
- **Atoms:** Import from `@/atoms` to read/write platform state
- **Providers:** Wrap app sections with JotaiProvider and ThemeProvider
- **Component:** Use `<PlatformToggle />` in sidebar/navigation
- **Theming:** Use `.platform-themed`, `.platform-accent`, or custom classes with `[data-platform]` selectors
- **API:** Use platformApiBaseAtom to get current platform's API base URL

## Testing Notes

No automated tests written (pure infrastructure setup). Future integration tests should verify:
- Platform switching updates localStorage
- Theme changes apply to document element
- PlatformToggle buttons toggle between platforms
- Audit logging fires when userId provided (after Plan 07)

## Files Changed

**Created (6):**
- src/atoms/platformAtom.ts (36 lines)
- src/atoms/index.ts (6 lines)
- src/providers/JotaiProvider.tsx (18 lines)
- src/providers/ThemeProvider.tsx (36 lines)
- src/providers/index.ts (3 lines)
- src/components/PlatformToggle.tsx (134 lines)

**Modified (1):**
- src/app/globals.css (+53 lines)

**Total:** 7 files, 286+ lines added

## Commits

1. **33aeaff** - feat(01-04): create Jotai atoms and providers for platform context
2. **33c4dd4** - feat(01-04): create PlatformToggle component and CSS theming

## Performance

- **Duration:** 1.93 minutes
- **Tasks completed:** 2/2
- **Files created:** 6
- **Files modified:** 1
