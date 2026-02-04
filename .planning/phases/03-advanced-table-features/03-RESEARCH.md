# Phase 3: Advanced Table Features - Research

**Researched:** 2026-02-04
**Domain:** Power-user table enhancements (virtualization, command palette, keyboard shortcuts, global search)
**Confidence:** HIGH

## Summary

Phase 3 enhances the admin interface with power-user features that dramatically improve workflow efficiency for staff managing large datasets. The standard approach combines TanStack Virtual for smooth rendering of 10k+ row tables, cmdk for accessible command palette functionality, and react-hotkeys-hook for declarative keyboard shortcut management. The ecosystem is mature with well-tested libraries that integrate cleanly with the existing TanStack Table and Radix UI foundation.

Key decisions are already locked: TanStack Virtual for virtualization (pairs perfectly with existing TanStack Table), cmdk for command palette (integrates with Radix UI Dialog), and fixed-height row virtualization with smart scroll behavior. The implementation focuses on context-aware keyboard shortcuts that avoid input conflicts, global search across all entities with dynamic result weighting, and thoughtful empty states that guide users to their next action.

Command palette libraries have converged on proven patterns from Linear, Raycast, and Vercel. Keyboard shortcut management requires careful accessibility consideration including ARIA attributes, avoiding single-character shortcuts, and OS-aware display. Virtualization is straightforward but has specific pitfalls around unnecessary enablement and re-render performance.

**Primary recommendation:** Use cmdk 1.1.1 for command palette, react-hotkeys-hook 5.2.1 for shortcuts, TanStack Virtual 3.13.18 for virtualization, and fuse.js 7.1.0 for fuzzy search ranking. Build on existing Radix UI Dialog for modal presentation.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/react-virtual | 3.13.18 | Row virtualization for tables | Official TanStack companion to Table, headless with full control, 60FPS performance for massive lists |
| cmdk | 1.1.1 | Command palette component | Industry standard (Linear, Vercel use it), unstyled/composable, integrates with Radix Dialog, 7.3M weekly downloads |
| react-hotkeys-hook | 5.2.1 | Keyboard shortcut management | Declarative hook API, component scoping with refs, supports modifiers and sequences, actively maintained |
| fuse.js | 7.1.0 | Fuzzy search and ranking | Lightweight (1.58kb), zero dependencies, proven algorithm (Levenshtein), handles typos and partial matches |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @radix-ui/react-dialog | Latest | Modal backdrop for command palette | Already in stack from Phase 2, cmdk.Dialog uses it internally |
| command-score | (bundled) | Search ranking algorithm | Bundled with cmdk, use for command palette result ranking |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| cmdk | react-cmdk | react-cmdk is pre-styled but less flexible, cmdk is unstyled and more composable with existing Cadence Design System |
| react-hotkeys-hook | @amarkanala/react-keyboard-shortcuts | Newer library (Jan 2026) but less proven, react-hotkeys-hook has larger ecosystem |
| fuse.js | microfuzz or uFuzzy | Smaller bundles but less features, fuse.js offers better configuration for multi-field weighted search |

**Installation:**
```bash
npm install @tanstack/react-virtual cmdk react-hotkeys-hook fuse.js
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── command-palette/        # Command palette implementation
│   │   ├── CommandPalette.tsx  # Main component with cmdk.Dialog
│   │   ├── SearchResults.tsx   # Result display with fuzzy matching
│   │   └── hooks/
│   │       └── useGlobalSearch.tsx  # Search logic across entities
│   ├── keyboard-shortcuts/     # Shortcut system
│   │   ├── ShortcutProvider.tsx    # Context provider for shortcuts
│   │   ├── ShortcutCheatSheet.tsx  # ? key overlay
│   │   └── shortcuts.ts             # Centralized shortcut definitions
│   └── empty-states/           # Reusable empty state components
│       ├── EmptyState.tsx      # Generic empty state
│       └── variants/           # Specific empty states by context
└── hooks/
    ├── useVirtualizedTable.tsx # TanStack Table + Virtual integration
    └── useKeyboardShortcuts.tsx # Shortcut hook wrapper
```

### Pattern 1: TanStack Table + Virtual Integration
**What:** Combine TanStack Table's logic with TanStack Virtual's rendering for smooth scrolling of large datasets.
**When to use:** All tables with more than 50 rows, especially for 10k+ datasets.
**Example:**
```typescript
// Source: https://tanstack.com/table/latest/docs/framework/react/examples/virtualized-rows
import { useReactTable, getCoreRowModel } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'

function VirtualizedTable({ data, columns }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const { rows } = table.getRowModel()
  const parentRef = React.useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Fixed height per CONTEXT decision
    overscan: 10,
  })

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index]
          return (
            <div
              key={row.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {/* Row content */}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

### Pattern 2: Command Palette with Radix Dialog
**What:** Modal command palette triggered by Cmd+K with fuzzy search across actions and entities.
**When to use:** Global navigation and search feature, always available.
**Example:**
```typescript
// Source: https://github.com/pacocoursey/cmdk
import { Command } from 'cmdk'
import React from 'react'

function CommandPalette() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <Command.Dialog open={open} onOpenChange={setOpen} label="Global Command Menu">
      <Command.Input placeholder="Search for actions or entities..." />
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>

        <Command.Group heading="Navigation">
          <Command.Item onSelect={() => navigate('/users')}>
            <span>Users</span>
          </Command.Item>
          <Command.Item onSelect={() => navigate('/assets')}>
            <span>Assets</span>
          </Command.Item>
        </Command.Group>

        <Command.Group heading="Actions">
          <Command.Item onSelect={() => createNew()}>
            <span>Create New...</span>
            <kbd>⌘N</kbd>
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  )
}
```

### Pattern 3: Context-Aware Keyboard Shortcuts
**What:** Shortcuts that work globally or within specific contexts (table vs form) without conflicting with inputs.
**When to use:** Power-user workflows requiring rapid navigation and actions.
**Example:**
```typescript
// Source: https://react-hotkeys-hook.vercel.app/
import { useHotkeys } from 'react-hotkeys-hook'

function UserTable() {
  const tableRef = useRef<HTMLDivElement>(null)

  // Global shortcuts (work anywhere)
  useHotkeys('cmd+k', (e) => {
    e.preventDefault()
    openCommandPalette()
  })

  // Context-aware shortcuts (only when table focused)
  useHotkeys('j', () => selectNextRow(), {
    scopes: ['table'],
    enabled: true
  }, [tableRef])

  useHotkeys('k', () => selectPreviousRow(), {
    scopes: ['table'],
    enabled: true
  }, [tableRef])

  useHotkeys('/', (e) => {
    e.preventDefault()
    focusSearch()
  }, { scopes: ['table'] }, [tableRef])

  return (
    <div ref={tableRef} tabIndex={-1} data-scope="table">
      {/* Table content */}
    </div>
  )
}
```

### Pattern 4: Multi-Entity Fuzzy Search
**What:** Search across multiple entity types with weighted results and fuzzy matching.
**When to use:** Global search that needs to find users, assets, payees across all fields.
**Example:**
```typescript
// Source: https://www.fusejs.io/
import Fuse from 'fuse.js'

function useGlobalSearch() {
  const search = async (query: string) => {
    // Fetch data (or use cached/pre-loaded data)
    const [users, assets, payees] = await Promise.all([
      fetchUsers(),
      fetchAssets(),
      fetchPayees(),
    ])

    // Configure fuzzy search for each entity type
    const usersFuse = new Fuse(users, {
      keys: [
        { name: 'email', weight: 2 },
        { name: 'name', weight: 1.5 },
        { name: 'subscription', weight: 1 }
      ],
      threshold: 0.3,
      includeScore: true,
    })

    const assetsFuse = new Fuse(assets, {
      keys: [
        { name: 'title', weight: 2 },
        { name: 'tags', weight: 1.5 },
        { name: 'contributor', weight: 1 }
      ],
      threshold: 0.3,
      includeScore: true,
    })

    const payeesFuse = new Fuse(payees, {
      keys: [
        { name: 'name', weight: 2 },
        { name: 'email', weight: 1.5 }
      ],
      threshold: 0.3,
      includeScore: true,
    })

    // Search all entities
    const usersResults = usersFuse.search(query)
    const assetsResults = assetsFuse.search(query)
    const payeesResults = payeesFuse.search(query)

    // Combine and sort by relevance score
    return [
      ...usersResults.map(r => ({ ...r, type: 'user' })),
      ...assetsResults.map(r => ({ ...r, type: 'asset' })),
      ...payeesResults.map(r => ({ ...r, type: 'payee' })),
    ].sort((a, b) => (a.score || 0) - (b.score || 0))
  }

  return { search }
}
```

### Pattern 5: Smart Scroll Preservation
**What:** Virtualized tables that preserve or reset scroll position based on user action.
**When to use:** Always with virtualized tables to maintain context during filters/sorts vs refreshes.
**Example:**
```typescript
// Source: TanStack Virtual best practices
import { useVirtualizer } from '@tanstack/react-virtual'

function useSmartVirtualScroll(data: any[], filters: any, sorts: any) {
  const parentRef = useRef<HTMLDivElement>(null)
  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  })

  // Reset scroll to top when filters or sorts change
  useEffect(() => {
    rowVirtualizer.scrollToIndex(0)
  }, [filters, sorts])

  // Preserve scroll position on data refresh (same filters/sorts)
  const previousScrollTop = useRef(0)

  useEffect(() => {
    if (parentRef.current) {
      previousScrollTop.current = parentRef.current.scrollTop
    }
  }, [data])

  // Restore scroll on navigation back
  useEffect(() => {
    const handlePopState = () => {
      if (parentRef.current && previousScrollTop.current) {
        parentRef.current.scrollTop = previousScrollTop.current
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return { parentRef, rowVirtualizer }
}
```

### Pattern 6: Empty State Components
**What:** Contextual empty states that guide users with clear next actions.
**When to use:** When tables, lists, or search results have no data to display.
**Example:**
```typescript
// Source: https://www.eleken.co/blog-posts/empty-state-ux
interface EmptyStateProps {
  type: 'first-use' | 'no-results' | 'error' | 'success'
  title: string
  description: string
  action?: { label: string; onClick: () => void }
  illustration?: React.ReactNode
}

function EmptyState({ type, title, description, action, illustration }: EmptyStateProps) {
  return (
    <div className="empty-state" data-type={type}>
      {illustration && <div className="empty-state-illustration">{illustration}</div>}
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {action && (
        <button onClick={action.onClick} className="empty-state-action">
          {action.label}
        </button>
      )}
    </div>
  )
}

// Usage examples:
// First use
<EmptyState
  type="first-use"
  title="No users yet"
  description="Get started by creating your first user account."
  action={{ label: "Create User", onClick: () => createUser() }}
/>

// No results
<EmptyState
  type="no-results"
  title="No results found"
  description="Try adjusting your search or filters."
/>

// Success/celebration
<EmptyState
  type="success"
  title="All caught up!"
  description="You've processed all pending items."
/>
```

### Anti-Patterns to Avoid

- **Over-virtualizing:** Don't enable virtualization for tables with <50 rows - the overhead outweighs benefits. However, CONTEXT requires always-on virtualization, so implement but document the performance trade-off.

- **Inconsistent keyboard shortcuts:** Don't use single-key shortcuts (like 'n') in forms where users might type. Always check context and use modifiers (Cmd/Ctrl) in ambiguous situations.

- **Blocking global shortcuts:** Don't let input fields capture Cmd+K or Esc. These should always work to open/close command palette and dialogs.

- **Hand-rolling fuzzy search:** Don't implement string matching manually. Use fuse.js or similar - edge cases like diacritics, Unicode, and ranking are complex.

- **Static empty states:** Don't show generic "No data" messages. Always provide context and next actions based on why the state is empty (first use vs filtered vs error).

- **Ignoring ARIA for shortcuts:** Don't skip `aria-keyshortcuts` attribute on interactive elements. Screen readers need to announce available shortcuts.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Virtual scrolling | Custom viewport + manual DOM manipulation | @tanstack/react-virtual | Handles edge cases: dynamic sizing, scroll restoration, overscan optimization, mobile touch events, RTL support |
| Fuzzy search | String.includes() or regex matching | fuse.js | Levenshtein distance algorithm, weighted multi-field search, Unicode handling, diacritics normalization, performance optimization |
| Command palette UI | Custom modal + filter logic | cmdk | Automatic filtering/sorting, keyboard navigation, ARIA roles, screen reader support, composition patterns, Dialog integration |
| Keyboard shortcuts | addEventListener('keydown') | react-hotkeys-hook | Cross-browser key code normalization, Mac vs Windows key detection, scope/context management, cleanup on unmount, sequence support |
| Search result ranking | Manual score calculation | command-score (bundled with cmdk) or fuse.js scores | Proven algorithms considering prefix matching, substring position, word boundaries, consecutive matches |

**Key insight:** These libraries represent thousands of hours debugging cross-browser issues, accessibility edge cases, and performance optimization. Command palette alone requires handling: Portal rendering, focus trap, Esc key conflicts with nested modals, screen reader announcements, mobile keyboard behavior, and IME composition events (Asian languages). cmdk handles all of this. Don't rebuild it.

## Common Pitfalls

### Pitfall 1: Enabling Virtualization on Small Datasets
**What goes wrong:** Performance degrades for tables with <50 rows because virtualization overhead (measuring, positioning, scroll calculations) exceeds benefits of not rendering hidden rows.
**Why it happens:** Developers enable virtualization "just in case" or as a premature optimization without measuring actual performance.
**How to avoid:** For Phase 3, CONTEXT requires always-on virtualization. Accept the trade-off but document it. Consider feature flag for future conditional enablement based on row count.
**Warning signs:** Table rendering feels sluggish, Chrome DevTools shows excessive layout thrashing, React Profiler shows high render times for small datasets.

### Pitfall 2: Re-render Thrashing During Scroll
**What goes wrong:** Passing style objects directly to virtualized cells causes React to re-render every cell on scroll, destroying 60FPS performance.
**Why it happens:** Style objects are recreated on each render, failing React's reference equality check.
**How to avoid:** Wrap table cells in a styled div that receives the virtual item's style. Keep cell content separate from positioning style. Use React.memo on cell components.
**Warning signs:** Scrolling stutters or lags, DevTools Performance tab shows dropped frames, CPU spikes during scroll.

### Pitfall 3: Keyboard Shortcut Conflicts with Inputs
**What goes wrong:** Single-key shortcuts (like 'n' for new, '/' for search) trigger while user is typing in a form field, causing frustration and data loss.
**Why it happens:** Global keyboard event listeners don't check if focus is in an input/textarea.
**How to avoid:** Use context-aware shortcuts (only active when table is focused) or require modifiers (Cmd+N instead of N). Check `event.target.tagName` before triggering.
**Warning signs:** Users report "random actions happening while typing", form inputs losing focus unexpectedly, shortcuts not working when expected.

### Pitfall 4: Command Palette Search Performance on Large Datasets
**What goes wrong:** Search becomes sluggish with 1000+ items because fuzzy matching runs synchronously on every keystroke.
**Why it happens:** Fuse.js search is CPU-intensive for large datasets, blocks main thread when done synchronously.
**How to avoid:** Debounce search input (300ms), show loading state, consider web worker for search, limit initial dataset to most relevant items (e.g., recent 500).
**Warning signs:** Input lag while typing, browser freezes briefly after each keystroke, low Lighthouse performance scores.

### Pitfall 5: Empty States Not Replacing Full UI
**What goes wrong:** Empty state appears but table headers, pagination, and filters remain visible, creating visual confusion.
**Why it happens:** Developers add empty state as additional content rather than replacing the full component.
**How to avoid:** Empty state should completely replace the component it represents. No table headers, footers, or pagination controls when empty. Return early from render with full empty state component.
**Warning signs:** Screenshots show "No users found" alongside visible column headers, pagination shows "Page 1 of 0", filter dropdowns visible with no data.

### Pitfall 6: Scroll Position Reset on Data Refresh
**What goes wrong:** User scrolls to row 500, data refreshes (server polling), scroll jumps back to top, user loses place.
**Why it happens:** Virtual scroller resets when data array reference changes, no scroll preservation logic.
**How to avoid:** Preserve scrollTop on data refresh when filters/sorts unchanged. Only reset scroll to top when user explicitly changes filters/sorts. Use React keys to maintain identity.
**Warning signs:** Users report "table keeps jumping back to top", complaints about losing place in long lists, requests to "remember where I was".

### Pitfall 7: Missing aria-keyshortcuts Attributes
**What goes wrong:** Screen reader users don't know keyboard shortcuts exist because they're only communicated visually.
**Why it happens:** Developers add shortcuts via JavaScript but forget ARIA attributes linking shortcuts to actions.
**How to avoid:** Add `aria-keyshortcuts` attribute to buttons/actions that have shortcuts. Show shortcuts in tooltips. Provide accessible shortcut cheat sheet.
**Warning signs:** Accessibility audits fail, screen reader testing reveals missing information, users with assistive tech request shortcut documentation.

### Pitfall 8: Command Palette Completeness
**What goes wrong:** Command palette missing common actions available in menus/context menus, forcing users to learn two navigation systems.
**Why it happens:** Actions added incrementally to UI but never backported to command palette.
**How to avoid:** Maintain single source of truth for actions. If action appears in menu, it must appear in command palette. Regular audits to ensure completeness.
**Warning signs:** Users say "I can't find X in command palette but it's in the menu", inconsistent feature availability.

## Code Examples

Verified patterns from official sources:

### Server-Side Search with TanStack Table
```typescript
// Source: https://tanstack.com/table/v8/docs/guide/column-filtering
import { useReactTable, getCoreRowModel } from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'

function ServerSideSearchTable() {
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 50 })

  // Fetch data with server-side filtering
  const { data, isLoading } = useQuery({
    queryKey: ['users', globalFilter, columnFilters, pagination],
    queryFn: () => fetchUsers({
      search: globalFilter,
      filters: columnFilters,
      page: pagination.pageIndex,
      limit: pagination.pageSize
    }),
  })

  const table = useReactTable({
    data: data?.users ?? [],
    columns,
    rowCount: data?.totalCount ?? 0,
    state: { globalFilter, columnFilters, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualFiltering: true,
    manualPagination: true,
  })

  return (
    <div>
      <input
        value={globalFilter ?? ''}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder="Search all columns..."
      />
      {/* Table render */}
    </div>
  )
}
```

### Keyboard Shortcut Cheat Sheet
```typescript
// Source: https://www.nngroup.com/articles/ui-copy/ and cmdk patterns
import { useHotkeys } from 'react-hotkeys-hook'

const shortcuts = [
  { category: 'Navigation', items: [
    { key: 'g u', description: 'Go to Users' },
    { key: 'g a', description: 'Go to Assets' },
    { key: 'g p', description: 'Go to Payees' },
  ]},
  { category: 'Actions', items: [
    { key: '⌘N', description: 'Create New' },
    { key: '⌘K', description: 'Open Command Palette' },
    { key: '⌘E', description: 'Export Data' },
  ]},
  { category: 'Table', items: [
    { key: 'j', description: 'Select Next Row' },
    { key: 'k', description: 'Select Previous Row' },
    { key: 'Space', description: 'Toggle Row Selection' },
    { key: '⌘A', description: 'Select All Rows' },
  ]},
  { category: 'General', items: [
    { key: '/', description: 'Focus Search' },
    { key: '?', description: 'Show Keyboard Shortcuts' },
    { key: 'Esc', description: 'Close Modal/Clear Selection' },
  ]},
]

function ShortcutCheatSheet() {
  const [open, setOpen] = useState(false)

  useHotkeys('shift+/', () => setOpen(true))
  useHotkeys('escape', () => setOpen(false), { enabled: open })

  if (!open) return null

  return (
    <div className="shortcut-cheat-sheet" role="dialog" aria-label="Keyboard Shortcuts">
      <h2>Keyboard Shortcuts</h2>
      {shortcuts.map((category) => (
        <section key={category.category}>
          <h3>{category.category}</h3>
          <dl>
            {category.items.map((item) => (
              <div key={item.key}>
                <dt><kbd>{item.key}</kbd></dt>
                <dd>{item.description}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}
```

### OS-Aware Keyboard Shortcut Display
```typescript
// Source: https://knock.app/blog/how-to-design-great-keyboard-shortcuts
function getModifierKey() {
  const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)
  return isMac ? '⌘' : 'Ctrl'
}

function ShortcutHint({ action }: { action: string }) {
  const modifier = getModifierKey()

  const shortcuts = {
    'search': `${modifier}+K`,
    'new': `${modifier}+N`,
    'save': `${modifier}+S`,
    'export': `${modifier}+E`,
  }

  return (
    <kbd className="shortcut-hint">
      {shortcuts[action]}
    </kbd>
  )
}

// Usage in button
<button onClick={openSearch} aria-keyshortcuts="Control+k Meta+k">
  Search
  <ShortcutHint action="search" />
</button>
```

### Dynamic Result Weighting for Global Search
```typescript
// Source: Fuse.js patterns + CONTEXT requirements
import Fuse from 'fuse.js'

function useGlobalSearchWithDynamicResults(query: string) {
  const { data: searchData } = useQuery(['search-data'], fetchAllSearchableData)

  const search = useMemo(() => {
    if (!query || !searchData) return []

    const results = {
      users: new Fuse(searchData.users, {
        keys: ['email', 'name', 'subscription'],
        threshold: 0.3,
        includeScore: true,
      }).search(query),
      assets: new Fuse(searchData.assets, {
        keys: ['title', 'tags', 'contributor'],
        threshold: 0.3,
        includeScore: true,
      }).search(query),
      payees: new Fuse(searchData.payees, {
        keys: ['name', 'email'],
        threshold: 0.3,
        includeScore: true,
      }).search(query),
    }

    // Calculate average scores to determine relevance
    const avgScores = {
      users: results.users.reduce((acc, r) => acc + (r.score || 0), 0) / results.users.length,
      assets: results.assets.reduce((acc, r) => acc + (r.score || 0), 0) / results.assets.length,
      payees: results.payees.reduce((acc, r) => acc + (r.score || 0), 0) / results.payees.length,
    }

    // Dynamic allocation: show more results for entity types with better matches
    const totalResults = 10
    let allocations = { users: 0, assets: 0, payees: 0 }

    // Sort entity types by best average score (lower is better in Fuse.js)
    const sorted = Object.entries(avgScores)
      .filter(([_, score]) => !isNaN(score))
      .sort(([, a], [, b]) => a - b)
      .map(([type]) => type)

    // Best type gets 60%, second gets 30%, third gets 10%
    if (sorted.length > 0) allocations[sorted[0]] = Math.ceil(totalResults * 0.6)
    if (sorted.length > 1) allocations[sorted[1]] = Math.ceil(totalResults * 0.3)
    if (sorted.length > 2) allocations[sorted[2]] = Math.ceil(totalResults * 0.1)

    // Take allocated number from each type and combine
    return [
      ...results.users.slice(0, allocations.users).map(r => ({ ...r, type: 'user' })),
      ...results.assets.slice(0, allocations.assets).map(r => ({ ...r, type: 'asset' })),
      ...results.payees.slice(0, allocations.payees).map(r => ({ ...r, type: 'payee' })),
    ].sort((a, b) => (a.score || 0) - (b.score || 0))
  }, [query, searchData])

  return search
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-virtualized | TanStack Virtual | 2021-2022 | Better React 18 support, smaller bundle, more flexible API, active maintenance |
| kbar for command palette | cmdk | 2022 | More composable, better Radix integration, unstyled for design system flexibility |
| react-hotkeys (unmaintained) | react-hotkeys-hook | 2019-present | Modern hooks API, better TypeScript support, active maintenance, scoping support |
| Manual string matching | Fuse.js + command-score | Established standard | Handles Unicode, diacritics, weighted fields, proven algorithms |
| Separate Dialog implementation | cmdk.Dialog (built-in) | cmdk v1.0+ | Simpler integration, consistent behavior, less code to maintain |

**Deprecated/outdated:**
- **react-virtualized**: Unmaintained since 2019, use TanStack Virtual instead. Migration guide exists but not needed since starting fresh.
- **kbar**: Still works but less flexible than cmdk for custom design systems. cmdk is unstyled and more composable.
- **react-hotkeys**: Library has been "more or less unmaintained for over 6 months" per official docs. Use react-hotkeys-hook instead.
- **@radix-ui/react-* individual packages**: February 2026 update unified into single `radix-ui` package for shadcn-style apps, but existing individual packages still work and are recommended if not using unified approach.

## Open Questions

Things that couldn't be fully resolved:

1. **Server-side vs client-side global search strategy**
   - What we know: Server-side is more scalable, client-side is instant but requires loading all entities upfront
   - What's unclear: Current dataset sizes for users/assets/payees, expected growth trajectory
   - Recommendation: Start client-side for instant feedback, add debounced server-side if datasets exceed 1000 items per entity type. Monitor performance with Real User Monitoring.

2. **Optimal overscan value for virtualization**
   - What we know: Higher overscan = smoother scroll but more DOM nodes and memory
   - What's unclear: Target devices (laptops, monitors), typical scroll behavior patterns
   - Recommendation: Start with overscan: 10 (TanStack default), increase to 20 if scroll stuttering observed, decrease to 5 if memory issues on lower-end devices.

3. **Loading skeleton design for search results**
   - What we know: Empty state and no-results designs are decided by Claude's Discretion
   - What's unclear: Loading state design pattern preference (skeleton vs spinner vs progressive)
   - Recommendation: Use skeleton loader matching result card structure. Shows 3 placeholder cards while searching. Matches Cadence Design System patterns from Phase 2.

4. **Command palette result caching strategy**
   - What we know: Command palette needs instant open, slow search hurts UX
   - What's unclear: Data freshness requirements, acceptable staleness
   - Recommendation: Pre-load and cache search data on app load, refresh on entity mutations. Show stale results instantly, update in background. Add "Results may be outdated" hint if cache >5 minutes old.

5. **Keyboard shortcut conflict with existing browser/OS shortcuts**
   - What we know: Must avoid conflicts with browser (Cmd+T, Cmd+W) and OS (Cmd+Tab)
   - What's unclear: Full inventory of existing shortcuts across macOS/Windows/Linux and Chrome/Firefox/Safari
   - Recommendation: Test on all target platforms during implementation. Document conflicts in shortcut cheat sheet. Provide alternative shortcuts where conflicts exist (e.g., G+U and Cmd+Shift+U both go to Users).

## Sources

### Primary (HIGH confidence)
- [TanStack Virtual GitHub](https://github.com/TanStack/virtual) - Features, installation, current version 3.13.18
- [TanStack Virtual Official Docs](https://tanstack.com/virtual/latest) - API documentation, patterns
- [TanStack Table Virtualization Guide](https://tanstack.com/table/latest/docs/guide/virtualization) - Integration patterns
- [cmdk GitHub by pacocoursey](https://github.com/pacocoursey/cmdk) - Complete API, examples, version 1.1.1
- [react-hotkeys-hook Official Docs](https://react-hotkeys-hook.vercel.app/) - Version 5.2.1, API reference
- [Fuse.js Official Docs](https://www.fusejs.io/) - Version 7.1.0, configuration options
- [MDN: aria-keyshortcuts attribute](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-keyshortcuts) - ARIA best practices
- [W3C WAI: Keyboard Interface Development](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/) - Accessibility standards

### Secondary (MEDIUM confidence)
- [Knock: How to Design Great Keyboard Shortcuts](https://knock.app/blog/how-to-design-great-keyboard-shortcuts) - UX best practices
- [NN/G: UI Copy for Command Names and Shortcuts](https://www.nngroup.com/articles/ui-copy/) - Naming conventions
- [Eleken: Empty State UX Examples](https://www.eleken.co/blog-posts/empty-state-ux) - Design patterns
- [Material React Table Virtualization Docs](https://www.material-react-table.com/docs/guides/virtualization) - Pitfalls and best practices
- [Philip Davis: Command Palette Interfaces](https://philipcdavis.com/writing/command-palette-interfaces) - Design patterns
- [Superhuman: How to Build a Remarkable Command Palette](https://blog.superhuman.com/how-to-build-a-remarkable-command-palette/) - Implementation guidance
- [WebAIM: Keyboard Accessibility](https://webaim.org/techniques/keyboard/) - Accessibility guidelines
- [Mobbin: Empty State UI Pattern](https://mobbin.com/glossary/empty-state) - Examples and best practices
- [Radix UI Dialog Docs](https://www.radix-ui.com/primitives/docs/components/dialog) - cmdk.Dialog integration
- [shadcn/ui Changelog Feb 2026: Unified Radix UI Package](https://ui.shadcn.com/docs/changelog/2026-02-radix-ui) - Recent ecosystem changes

### Tertiary (LOW confidence)
- [Medium: Building a Performant Virtualized Table](https://medium.com/codex/building-a-performant-virtualized-table-with-tanstack-react-table-and-tanstack-react-virtual-f267d84fbca7) - Community tutorial
- [DEV Community: Virtualized Table with TanStack Virtual and React Query](https://dev.to/ainayeem/building-an-efficient-virtualized-table-with-tanstack-virtual-and-react-query-with-shadcn-2hhl) - Implementation example
- [Medium: Command Palette UX Patterns](https://medium.com/design-bootcamp/command-palette-ux-patterns-1-d6b6e68f30c1) - Community insights
- [Medium: Keyboard Shortcuts UX Case Study](https://medium.com/@pratikkumar_10506/creating-dashboard-shortcuts-ux-case-study-c88f01985de0) - Real-world examples

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified through official docs and npm, current versions confirmed, 2026-relevant
- Architecture patterns: HIGH - Patterns verified with official TanStack examples, cmdk GitHub repo, and Web Accessibility guidelines
- Pitfalls: MEDIUM - Based on community experience (Material React Table docs, GitHub discussions) and general virtualization best practices, some require validation in production

**Research date:** 2026-02-04
**Valid until:** 2026-03-04 (30 days - stable ecosystem with mature libraries)

**Notes for planner:**
- CONTEXT decisions are locked: TanStack Virtual (always-on), cmdk for palette, fixed-height rows, specific keyboard pattern (j/k/Space for tables)
- Claude's Discretion areas need implementation decisions: exact shortcut key assignments, empty state copy/illustrations, loading states, error handling, ranking algorithm tuning
- All core libraries are mature (1+ years old) with active maintenance and large user bases
- Integration points are well-documented: TanStack Table + Virtual, cmdk + Radix Dialog, react-hotkeys-hook with scoping
- Main risk areas: server-side search performance (may need optimization), keyboard shortcut conflicts (needs testing across platforms), virtualization overhead on small datasets (accepted trade-off per CONTEXT)
