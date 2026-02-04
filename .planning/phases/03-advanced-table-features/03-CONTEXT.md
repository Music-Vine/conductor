# Phase 3: Advanced Table Features - Context

**Gathered:** 2026-02-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Power-user table enhancements across the admin interface including global search across entities (users, assets, payees), command palette navigation (Cmd+K), keyboard shortcuts for common actions, empty state guidance, and virtualization for rendering large datasets smoothly. This builds on Phase 2's table foundation.

</domain>

<decisions>
## Implementation Decisions

### Command Palette (Cmd+K)

- **Trigger:** Cmd+K keyboard shortcut PLUS a visible button in the UI
- **Supported actions:** Navigation (jump to pages), Search entities (users, assets, payees), Quick actions (create, export, etc.)
- **NOT included:** Recent items feature (out of scope)
- **Result display:** Mixed relevance - all results together sorted by relevance/recency (not grouped by type)
- **UI hints:** Yes - show keyboard navigation hints at bottom (↑↓ to navigate, ↵ to select, esc to close)

### Global Search Behavior

- **Search scope:** All entities - Users (email, name, subscription), Assets (title, tags, contributor), Payees/Contributors (name, email)
- **Access points:** Command palette (Cmd+K) + simple button (not a full dedicated search bar in header)
- **Result count:** Dynamic - show more results for entity types that match better (e.g., 8 users, 2 assets if query matches users more strongly)
- **Feedback:** Instant feedback - show loading state while searching, "No results found" message if empty (no suggestions on empty)

### Keyboard Shortcuts

- **Action coverage:** Navigation (main sections), Table actions (select rows, bulk ops, export), Common tasks (create, refresh, search), Modal control (Esc to close, Enter to confirm)
- **Discoverability:** Both cheat sheet (accessible via ? key) AND inline hints next to actions in menus/buttons
- **Shortcut pattern:** Context-aware mix - single keys in lists/tables (G, N, /), modifier combos in forms (Cmd+N, Ctrl+E) to avoid input conflicts
- **Table-specific shortcuts:** Row selection (j/k to move, Space to select, Shift for ranges) + Bulk actions (Cmd+A to select all, X for actions menu)
- **NOT included:** Quick filter shortcuts (F for focus, numbers for toggles) - out of scope

### Virtualization Approach

- **Trigger:** Always virtualized - all tables use virtualization regardless of data size
- **Library:** TanStack Virtual (@tanstack/react-virtual) - pairs well with existing TanStack Table
- **Scroll behavior:** Smart reset - reset to top on filter/sort changes, preserve position on refresh, restore position on browser back navigation
- **Row height:** Fixed height - all rows same height for simpler, faster rendering

### Claude's Discretion

- Exact keyboard shortcut key assignments (which letter/number for each action)
- Empty state illustrations and copy
- Loading skeleton design for search results
- Error handling for failed searches
- Command palette result ranking algorithm

</decisions>

<specifics>
## Specific Ideas

No specific product references or implementation requirements provided - open to standard patterns for command palettes and keyboard shortcuts from tools like Linear, GitHub, Vercel, etc.

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

*Phase: 03-advanced-table-features*
*Context gathered: 2026-02-04*
