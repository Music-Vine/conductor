---
phase: 03-advanced-table-features
plan: 02
subsystem: ui
tags: [keyboard-shortcuts, react-hotkeys-hook, context, accessibility]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Cadence Design System components and React 19 foundation
provides:
  - Centralized keyboard shortcut definitions with categories and scopes
  - ShortcutProvider context managing global shortcut state
  - useKeyboardShortcuts hook with scope awareness and input safety
  - useShortcutScope hook for component focus management
affects: [command-palette, table-shortcuts, navigation-shortcuts]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Context-aware keyboard shortcuts with scope activation
    - Input safety defaults preventing shortcut conflicts
    - OS-aware modifier key display (Cmd vs Ctrl)

key-files:
  created:
    - src/components/keyboard-shortcuts/shortcuts.ts
    - src/components/keyboard-shortcuts/ShortcutProvider.tsx
    - src/hooks/useKeyboardShortcuts.tsx
  modified: []

key-decisions:
  - "Table shortcuts use single keys (j/k/space) for speed - only active when table focused"
  - "Form-safe shortcuts require modifiers (Cmd+N) to avoid input conflicts"
  - "Scope field enables context-aware activation for different UI regions"
  - "Input safety defaults to false - shortcuts disabled in form inputs unless explicitly enabled"

patterns-established:
  - "ShortcutDefinition type: key (react-hotkeys format), display (UI string), description, category, optional scope"
  - "ShortcutProvider wraps app with activeScope and isInputFocused state"
  - "useKeyboardShortcuts wraps react-hotkeys-hook with scope awareness"
  - "useShortcutScope helper for components to claim/release keyboard focus"

# Metrics
duration: 2min
completed: 2026-02-04
---

# Phase 03 Plan 02: Keyboard Shortcuts Infrastructure Summary

**Centralized shortcut system with context-aware activation, input safety, and OS-aware display ready for component integration**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-04T13:04:47Z
- **Completed:** 2026-02-04T13:06:46Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created centralized shortcut definitions with 16 shortcuts across 4 categories (navigation, actions, table, general)
- Built ShortcutProvider context managing active scope and input focus state
- Implemented useKeyboardShortcuts hook wrapping react-hotkeys-hook with scope awareness
- Added useShortcutScope helper for components to claim keyboard focus
- Ensured input safety by default - shortcuts disabled in form fields unless explicitly enabled

## Task Commits

Each task was committed atomically:

1. **Task 1: Create shortcut definitions** - `bdb529a` (feat)
2. **Task 2: Create ShortcutProvider and useKeyboardShortcuts hook** - `581f4a5` (feat)

## Files Created/Modified
- `src/components/keyboard-shortcuts/shortcuts.ts` - Centralized shortcut definitions with ShortcutDefinition type, shortcuts array, OS-aware modifier helper, and category grouping helper
- `src/components/keyboard-shortcuts/ShortcutProvider.tsx` - Context provider managing activeScope and isInputFocused state with useShortcutContext hook
- `src/hooks/useKeyboardShortcuts.tsx` - Hook wrapping react-hotkeys-hook with scope awareness, input safety, and useShortcutScope helper

## Decisions Made

**Shortcut patterns for avoiding conflicts:**
- Single-key shortcuts (j, k, space, x, /) scoped to specific contexts (table, global) to avoid form input conflicts
- Modifier-based shortcuts (mod+k, mod+n, mod+e) safe across all contexts including forms
- Scope system enables same keys to do different things in different contexts

**Input safety defaults:**
- useKeyboardShortcuts defaults enableOnFormTags to false for safety
- Components must explicitly opt-in to allow shortcuts in inputs
- Prevents accidental shortcut triggers while typing

**OS-aware modifier display:**
- getModifierDisplay() helper detects Mac vs Windows/Linux
- Returns 'Cmd' on Mac, 'Ctrl' elsewhere for consistent UI display
- Used for displaying shortcuts in cheat sheet and tooltips

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

**Infrastructure ready for integration:**
- Shortcut system ready to be wired into components in subsequent plans
- ShortcutProvider needs to wrap app in layout (Plan 03-03+)
- Table components can use useShortcutScope to claim focus and register j/k/space shortcuts
- Command palette can use mod+k shortcut and register actions
- Navigation shortcuts (g+u/a/p) ready for routing integration

**No blockers:**
- All TypeScript types properly defined and exported
- Context pattern matches existing patterns in codebase (PlatformToggle, QueryClient)
- react-hotkeys-hook already installed and verified working

---
*Phase: 03-advanced-table-features*
*Completed: 2026-02-04*
