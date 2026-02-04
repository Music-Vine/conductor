---
phase: 03-advanced-table-features
plan: 10
subsystem: keyboard-shortcuts
tags: [keyboard-shortcuts, accessibility, ux, discoverability]
requires: [03-02-shortcuts, 03-03-command-palette]
provides: [keyboard-shortcuts-cheat-sheet]
affects: []
tech-stack:
  added: []
  patterns: [overlay-dialog, os-aware-shortcuts]
key-files:
  created:
    - src/components/keyboard-shortcuts/ShortcutCheatSheet.tsx
  modified:
    - src/app/(platform)/layout-client.tsx
decisions:
  - id: cheat-sheet-trigger
    choice: "? (Shift+/) key opens cheat sheet"
    rationale: "Common convention across developer tools (GitHub, Linear, etc.)"
  - id: category-grouping
    choice: "Group shortcuts by category (General, Navigation, Actions, Table)"
    rationale: "Helps users find shortcuts by their purpose rather than alphabetically"
  - id: os-aware-display
    choice: "Show Cmd on macOS, Ctrl on Windows/Linux"
    rationale: "Platform-specific display matches user's actual keyboard"
metrics:
  duration: 92 seconds
  completed: 2026-02-04
---

# Phase 3 Plan 10: Keyboard Shortcuts Cheat Sheet Summary

**One-liner:** Keyboard shortcuts cheat sheet accessible via ? key with category grouping and OS-aware modifier display

## What Was Built

Created a keyboard shortcuts cheat sheet overlay that:
- Opens on ? (Shift+/) key press
- Shows all shortcuts grouped by category (General, Navigation, Actions, Table)
- Displays OS-aware modifier keys (Cmd on Mac, Ctrl on Windows/Linux)
- Closes on Escape or clicking outside
- Uses clean two-column grid layout matching Cadence aesthetic
- Includes accessibility features (ARIA role, keyboard navigation)

## Key Implementation Details

### ShortcutCheatSheet Component
- Controlled/uncontrolled dual mode for flexible integration
- Uses `getShortcutsByCategory()` from shortcuts.ts
- Uses `getModifierDisplay()` for OS detection
- Click-outside detection with data attribute
- Categories displayed in logical order: General → Navigation → Actions → Table
- Footer reminder that ? opens the guide

### Layout Integration
- Wrapped entire layout with `ShortcutProvider` for context
- Mounted `ShortcutCheatSheet` alongside `CommandPalette`
- Provider hierarchy: JotaiProvider > QueryProvider > ThemeProvider > ShortcutProvider

## Architectural Patterns

### Overlay Dialog Pattern
- Fixed positioning with backdrop
- Z-index 50 for proper layering
- Click-outside with data attribute targeting
- Keyboard close with Escape

### OS-Aware Display
- Runtime OS detection via navigator.platform
- Dynamic replacement of Cmd/Ctrl in display strings
- SSR-safe with typeof window check

## Test Coverage

Verification:
- TypeScript compilation passes
- Production build succeeds
- ShortcutCheatSheet exports correctly
- Layout properly wired with ShortcutProvider

Manual testing required:
1. Press ? - cheat sheet opens with all shortcuts
2. Cheat sheet shows correct modifier (Cmd on Mac, Ctrl on Windows)
3. Press Escape - cheat sheet closes
4. Click outside cheat sheet - closes
5. All shortcuts listed work as documented

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

1. **Cheat sheet trigger**: Used ? (Shift+/) as it's a common convention across developer tools (GitHub, Linear, etc.) for showing keyboard shortcuts
2. **Category grouping**: Grouped shortcuts by purpose (General, Navigation, Actions, Table) rather than alphabetically for better discoverability
3. **OS-aware display**: Show platform-specific modifiers (Cmd vs Ctrl) to match user's actual keyboard

## Files Created

1. **src/components/keyboard-shortcuts/ShortcutCheatSheet.tsx** (124 lines)
   - Keyboard shortcuts cheat sheet overlay component
   - Category-grouped display with OS-aware modifiers
   - Controlled/uncontrolled mode support

## Files Modified

1. **src/app/(platform)/layout-client.tsx**
   - Added ShortcutProvider wrapper around layout
   - Mounted ShortcutCheatSheet alongside CommandPalette
   - Imports for both new components

## Performance Characteristics

- Lightweight overlay, only rendered when open
- No impact when closed (conditional render)
- Static shortcut definitions, no network calls
- OS detection cached on component mount

## Integration Points

### Imports
- `getShortcutsByCategory()` from shortcuts.ts for definitions
- `getModifierDisplay()` from shortcuts.ts for OS detection
- `useHotkeys` from react-hotkeys-hook for ? trigger and Escape close

### Exports
- `ShortcutCheatSheet` component with optional controlled mode

## Next Phase Readiness

**Blockers:** None

**Concerns:** None

**Readiness:** ✅ Keyboard shortcuts cheat sheet complete and ready. Users can now discover all available shortcuts via ? key. This completes the keyboard navigation foundation before adding column sorting and bulk actions.

## Success Metrics

- ✅ Cheat sheet accessible via ? key
- ✅ Shortcuts grouped by category
- ✅ OS-aware modifier display
- ✅ Proper close behavior (Escape, click outside)
- ✅ Layout properly wired with ShortcutProvider
- ✅ All shortcuts documented and discoverable

## Commits

- f0e0f0f: feat(03-10): create ShortcutCheatSheet component
- cce50b6: feat(03-10): wire up ShortcutProvider and CheatSheet in layout
