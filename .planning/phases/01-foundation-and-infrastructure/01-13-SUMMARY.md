---
phase: 01-foundation-and-infrastructure
plan: 13
type: gap-closure
subsystem: ui-components
tags: [cadence, design-system, theming, brand-colors]

requires:
  - 01-12  # Cadence Design System integration

provides:
  - Cadence components in authentication pages
  - Platform-specific brand colors (Uppbeat pink, Music Vine coral)
  - Dynamic color theming via CSS variables

affects:
  - All future UI components should use Cadence
  - Platform toggle visually reflects brand identity
  - Brand colors propagate to all platform-primary classes

tech-stack:
  added: []
  patterns:
    - CSS custom properties for dynamic theming
    - Platform-specific color variables
    - Cadence Input/Button component usage

key-files:
  created: []
  modified:
    - src/app/(auth)/login/page.tsx
    - src/app/(auth)/magic-link/page.tsx
    - src/app/globals.css
    - src/providers/ThemeProvider.tsx
    - src/components/PlatformToggle.tsx

decisions:
  - decision: Replace all raw HTML inputs and buttons with Cadence components
    rationale: Ensure consistent design system usage across the application
    scope: Authentication pages
    date: 2026-02-03

  - decision: Use brand-specific colors (Uppbeat #F23D75, Music Vine #ff5f6e)
    rationale: Visual identity should match actual brand colors, not dark blues
    scope: Platform theming system
    date: 2026-02-03

  - decision: Apply bg-platform-primary to active platform toggle button
    rationale: Make platform selection visually obvious with brand color
    scope: PlatformToggle component
    date: 2026-02-03

  - decision: Keep checkbox as raw HTML input
    rationale: Cadence doesn't provide a Checkbox component, native HTML is appropriate
    scope: Login form "Remember Me" checkbox
    date: 2026-02-03

metrics:
  tasks-planned: 3
  tasks-completed: 3
  files-modified: 5
  commits: 3
  duration: "3.72 minutes"
  completed: 2026-02-03
---

# Phase 1 Plan 13: Cadence Component Usage and Brand Colors Summary

**One-liner:** Replaced raw HTML form elements with Cadence components and implemented correct brand colors (Uppbeat pink #F23D75, Music Vine coral #ff5f6e)

## What Was Built

This gap closure plan ensured consistent use of the Cadence design system and applied correct platform-specific brand colors throughout the application.

### Task 1: Replace Raw HTML Inputs with Cadence Components
- Replaced `<input>` elements with Cadence `Input` component in login page
- Replaced `<button>` elements with Cadence `Button` component in login and magic-link pages
- Updated "Back to login" link to use `Button asChild` pattern for proper styling
- Imported components from `@music-vine/cadence/ui`
- Maintained all existing form behavior and functionality
- Kept checkbox as native HTML (no Cadence checkbox component exists)

### Task 2: Implement Platform-Specific Brand Colors
- Updated `globals.css` to define correct brand colors:
  - Music Vine: `#ff5f6e` (coral)
  - Uppbeat: `#F23D75` (pink)
- Updated `ThemeProvider` to set CSS custom properties dynamically
- Replaced previous dark blue colors (`#1a1a2e`, `#0f3460`) with brand colors
- CSS variables (`--platform-primary`, `--platform-accent`) update when platform changes
- Brand colors apply via `[data-platform]` attribute selectors

### Task 3: Apply Brand Colors to UI Elements
- Updated `PlatformToggle` to use `bg-platform-primary` utility class
- Active button now shows brand color (pink for Uppbeat, coral for Music Vine)
- Colors update dynamically when platform changes
- Inactive state uses neutral colors for clear contrast
- Visual feedback now matches brand identity

## Verification Results

All verification criteria passed:

1. **No raw HTML form elements:**
   - ✅ All text inputs use Cadence `Input` component
   - ✅ All buttons use Cadence `Button` component
   - ✅ Checkbox remains native HTML (expected)
   - ✅ Cadence imports present in auth pages

2. **Brand colors applied:**
   - ✅ `globals.css` defines `--platform-primary` variables
   - ✅ ThemeProvider sets colors dynamically
   - ✅ Uppbeat uses `#F23D75` pink
   - ✅ Music Vine uses `#ff5f6e` coral
   - ✅ PlatformToggle uses `bg-platform-primary`

3. **Build verification:**
   - ✅ `npm run build` succeeds
   - ✅ TypeScript compilation passes
   - ⚠️ Lint warnings exist (pre-existing, unrelated to changes)

## Technical Implementation

### Cadence Component Integration

**Before (raw HTML):**
```tsx
<input
  id="email"
  type="email"
  className="mt-1 block w-full rounded-lg border..."
  placeholder="you@company.com"
/>
```

**After (Cadence Input):**
```tsx
<Input
  id="email"
  type="email"
  className="mt-1"
  placeholder="you@company.com"
/>
```

### Brand Color Theming

**CSS Variables (`globals.css`):**
```css
/* Music Vine coral */
[data-platform='music-vine'] {
  --platform-primary: #ff5f6e;
  --platform-accent: #ff5f6e;
}

/* Uppbeat pink */
[data-platform='uppbeat'] {
  --platform-primary: #F23D75;
  --platform-accent: #F23D75;
}
```

**Dynamic Updates (`ThemeProvider`):**
```tsx
const config = platform === 'music-vine'
  ? { primary: '#ff5f6e', accent: '#ff5f6e' }
  : { primary: '#F23D75', accent: '#F23D75' }

document.documentElement.style.setProperty('--platform-primary', config.primary)
```

**Usage in Components:**
```tsx
<button
  className={platform === 'music-vine'
    ? 'bg-platform-primary text-white'
    : 'text-zinc-600 hover:text-zinc-900'
  }
>
  Music Vine
</button>
```

## Deviations from Plan

None - plan executed exactly as written.

All tasks completed as specified, no additional work required, no blocking issues encountered.

## Files Changed

| File | Change Type | Description |
|------|-------------|-------------|
| `src/app/(auth)/login/page.tsx` | Modified | Replace raw inputs/buttons with Cadence components |
| `src/app/(auth)/magic-link/page.tsx` | Modified | Replace button link with Cadence Button asChild |
| `src/app/globals.css` | Modified | Update CSS variables to use brand colors |
| `src/providers/ThemeProvider.tsx` | Modified | Set brand colors dynamically based on platform |
| `src/components/PlatformToggle.tsx` | Modified | Use bg-platform-primary for active state |

## Commits

| Hash | Message | Files |
|------|---------|-------|
| c864189 | feat(01-13): replace raw HTML inputs with Cadence components in auth pages | login/page.tsx, magic-link/page.tsx |
| c38ca0a | feat(01-13): implement platform-specific brand colors | globals.css, ThemeProvider.tsx |
| 7e2d92d | feat(01-13): apply brand colors to PlatformToggle active state | PlatformToggle.tsx |

## Next Phase Readiness

### Enables
- **Phase 2:** Cadence components now established pattern for all UI
- **Future components:** Can use `bg-platform-primary` for brand-colored elements
- **Design consistency:** All forms follow Cadence design system

### Dependencies Met
- ✅ Cadence Design System (from plan 01-12)
- ✅ Platform theming infrastructure (from earlier plans)
- ✅ Authentication pages exist

### Blockers/Concerns
None. All success criteria met, build passes, brand colors apply correctly.

### Documentation
- ThemeProvider includes JSDoc comment documenting brand colors
- PlatformToggle updated to reference brand color changes
- Login page includes comment about Cadence component usage

## Testing Notes

### Manual Verification
To verify brand colors work correctly:

1. Start dev server: `npm run dev`
2. Navigate to dashboard (authenticated route)
3. Open browser DevTools → Elements → `:root` styles
4. Default should show `--platform-primary: #ff5f6e` (Music Vine coral)
5. Click platform toggle to switch to Uppbeat
6. Verify `--platform-primary` changes to `#F23D75` (pink)
7. Active toggle button should show pink background
8. Switch back to Music Vine
9. Active toggle button should show coral background

### Automated Tests
No automated tests added (plan did not specify test requirements).

Component behavior tested via:
- TypeScript compilation
- Next.js build process
- Visual verification in development mode

## Performance Impact

Minimal performance impact:

- **Cadence components:** Already bundled, no new dependencies
- **CSS variables:** Native browser feature, zero runtime cost
- **ThemeProvider:** Single useEffect hook, updates only on platform change
- **Build time:** No measurable increase (2-5s build time maintained)

## Lessons Learned

1. **Cadence Input component:** Auto-handles focus states and styling, simpler than raw HTML
2. **Button asChild pattern:** Clean way to style links as buttons using Radix Slot primitive
3. **CSS custom properties:** Perfect for dynamic theming, updates propagate instantly
4. **Brand color correction:** Previous dark blues didn't match actual brand identity
5. **Checkbox exception:** Not all form elements have Cadence equivalents (native HTML appropriate)

## Future Improvements

Potential enhancements not in scope:

- Add Cadence Checkbox component to design system (upstream contribution)
- Extend brand colors to success/error states
- Add platform-specific color palettes beyond primary/accent
- Animate color transitions when switching platforms
- Add unit tests for ThemeProvider color logic
- Create Storybook stories for Cadence component usage patterns

## Summary

Gap closure plan 01-13 successfully:
1. ✅ Replaced all appropriate raw HTML form elements with Cadence components
2. ✅ Implemented correct brand-specific colors (Uppbeat pink, Music Vine coral)
3. ✅ Applied brand colors to platform toggle for visual feedback
4. ✅ All builds pass, no regressions introduced
5. ✅ Design system usage now consistent across authentication flow

Phase 1 foundation now has proper design system integration and brand theming.
